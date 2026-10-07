import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { Details, PostSurvey, PreSurvey, StoredResponse } from "./types";

export type NewResponse = { pre: PreSurvey; details: Details; matchCount: number };

export interface ResponseStore {
  create(r: NewResponse): Promise<string>;
  /** For a retry after "no match". Returns false if the response doesn't exist or already has after-answers. */
  updateDetails(id: string, details: Details, matchCount: number): Promise<boolean>;
  /** Returns false if the response doesn't exist or already has after-answers. */
  addPost(id: string, post: PostSurvey): Promise<boolean>;
  list(): Promise<StoredResponse[]>;
  get(id: string): Promise<StoredResponse | null>;
  /** Records a date-planner pick. Returns false if the response doesn't exist or already picked this person. */
  addPick(id: string, profileId: string, at: Date): Promise<boolean>;
  /** Number of date plans made at or after `since`, across all responses. */
  countPicksSince(since: Date): Promise<number>;
}

/** Local development store: one JSON file. Writes are serialised so concurrent requests don't clobber each other. */
export function createFileStore(file: string): ResponseStore {
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<StoredResponse[]> {
    try {
      const rows: StoredResponse[] = JSON.parse(await readFile(file, "utf8"));
      return rows.map((r) => ({ ...r, picks: r.picks ?? [] }));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  async function save(all: StoredResponse[]) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(all, null, 2));
  }

  function serial<T>(fn: () => Promise<T>): Promise<T> {
    const next = queue.then(fn, fn);
    queue = next.catch(() => {});
    return next;
  }

  return {
    create: (r) =>
      serial(async () => {
        const all = await load();
        const id = randomUUID();
        all.push({ id, createdAt: new Date().toISOString(), ...r, post: null, picks: [] });
        await save(all);
        return id;
      }),
    updateDetails: (id, details, matchCount) =>
      serial(async () => {
        const all = await load();
        const row = all.find((r) => r.id === id);
        if (!row || row.post) return false;
        Object.assign(row, { details, matchCount });
        await save(all);
        return true;
      }),
    addPost: (id, post) =>
      serial(async () => {
        const all = await load();
        const row = all.find((r) => r.id === id);
        if (!row || row.post) return false;
        row.post = post;
        await save(all);
        return true;
      }),
    list: () => serial(load),
    get: (id) => serial(async () => (await load()).find((r) => r.id === id) ?? null),
    addPick: (id, profileId, at) =>
      serial(async () => {
        const all = await load();
        const row = all.find((r) => r.id === id);
        if (!row || row.picks.some((p) => p.profileId === profileId)) return false;
        row.picks.push({ profileId, at: at.toISOString() });
        await save(all);
        return true;
      }),
    countPicksSince: (since) =>
      serial(async () =>
        (await load()).flatMap((r) => r.picks).filter((p) => new Date(p.at) >= since).length,
      ),
  };
}

/** Hosted store: Vercel Postgres (Neon). The table is created on first use. */
export function createPostgresStore(url: string): ResponseStore {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const ensureTable = () =>
    (ready ??= (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS responses (
          id uuid PRIMARY KEY,
          created_at timestamptz NOT NULL DEFAULT now(),
          pre jsonb NOT NULL,
          details jsonb NOT NULL,
          match_count integer NOT NULL,
          post jsonb
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS picks (
          response_id uuid NOT NULL REFERENCES responses(id),
          profile_id text NOT NULL,
          at timestamptz NOT NULL,
          PRIMARY KEY (response_id, profile_id)
        )`;
    })());

  const toResponse = (r: Record<string, unknown>): StoredResponse => ({
    id: r.id as string,
    createdAt: new Date(r.created_at as string).toISOString(),
    pre: r.pre as PreSurvey,
    details: r.details as Details,
    matchCount: r.match_count as number,
    post: r.post as PostSurvey | null,
    picks: (r.picks as { profileId: string; at: string }[]).map((p) => ({
      profileId: p.profileId,
      at: new Date(p.at).toISOString(),
    })),
  });

  return {
    async create(r) {
      await ensureTable();
      const id = randomUUID();
      await sql`INSERT INTO responses (id, pre, details, match_count)
                VALUES (${id}, ${JSON.stringify(r.pre)}, ${JSON.stringify(r.details)}, ${r.matchCount})`;
      return id;
    },
    async updateDetails(id, details, matchCount) {
      await ensureTable();
      const rows = await sql`UPDATE responses SET details = ${JSON.stringify(details)}, match_count = ${matchCount}
                             WHERE id = ${id} AND post IS NULL RETURNING id`;
      return rows.length === 1;
    },
    async addPost(id, post) {
      await ensureTable();
      const rows = await sql`UPDATE responses SET post = ${JSON.stringify(post)}
                             WHERE id = ${id} AND post IS NULL RETURNING id`;
      return rows.length === 1;
    },
    async list() {
      await ensureTable();
      const rows = await sql`
        SELECT r.id, r.created_at, r.pre, r.details, r.match_count, r.post,
               COALESCE(json_agg(json_build_object('profileId', p.profile_id, 'at', p.at) ORDER BY p.at)
                        FILTER (WHERE p.profile_id IS NOT NULL), '[]') AS picks
        FROM responses r LEFT JOIN picks p ON p.response_id = r.id
        GROUP BY r.id ORDER BY r.created_at`;
      return rows.map(toResponse);
    },
    async get(id) {
      await ensureTable();
      const rows = await sql`
        SELECT r.id, r.created_at, r.pre, r.details, r.match_count, r.post,
               COALESCE(json_agg(json_build_object('profileId', p.profile_id, 'at', p.at) ORDER BY p.at)
                        FILTER (WHERE p.profile_id IS NOT NULL), '[]') AS picks
        FROM responses r LEFT JOIN picks p ON p.response_id = r.id
        WHERE r.id = ${id}
        GROUP BY r.id`;
      return rows.length ? toResponse(rows[0]) : null;
    },
    async addPick(id, profileId, at) {
      await ensureTable();
      const rows = await sql`
        INSERT INTO picks (response_id, profile_id, at)
        SELECT id, ${profileId}, ${at.toISOString()} FROM responses WHERE id = ${id}
        ON CONFLICT DO NOTHING RETURNING profile_id`;
      return rows.length === 1;
    },
    async countPicksSince(since) {
      await ensureTable();
      const rows = await sql`SELECT count(*)::int AS n FROM picks WHERE at >= ${since.toISOString()}`;
      return rows[0].n as number;
    },
  };
}

let store: ResponseStore | null = null;

export function getStore(): ResponseStore {
  store ??= process.env.DATABASE_URL
    ? createPostgresStore(process.env.DATABASE_URL)
    : createFileStore(path.join(process.cwd(), ".data", "responses.json"));
  return store;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isResponseId = (id: string) => UUID.test(id);

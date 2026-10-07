import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { Details, PostSurvey, PreSurvey, StoredResponse } from "./types";

export type NewResponse = { pre: PreSurvey; details: Details; matchCount: number };

export interface ResponseStore {
  create(r: NewResponse): Promise<string>;
  /** Returns false if the response doesn't exist or already has after-answers. */
  addPost(id: string, post: PostSurvey): Promise<boolean>;
  list(): Promise<StoredResponse[]>;
}

/** Local development store: one JSON file. Writes are serialised so concurrent requests don't clobber each other. */
export function createFileStore(file: string): ResponseStore {
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<StoredResponse[]> {
    try {
      return JSON.parse(await readFile(file, "utf8"));
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
        all.push({ id, createdAt: new Date().toISOString(), ...r, post: null });
        await save(all);
        return id;
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
  };
}

/** Hosted store: Vercel Postgres (Neon). The table is created on first use. */
export function createPostgresStore(url: string): ResponseStore {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const ensureTable = () =>
    (ready ??= sql`
      CREATE TABLE IF NOT EXISTS responses (
        id uuid PRIMARY KEY,
        created_at timestamptz NOT NULL DEFAULT now(),
        pre jsonb NOT NULL,
        details jsonb NOT NULL,
        match_count integer NOT NULL,
        post jsonb
      )`);

  return {
    async create(r) {
      await ensureTable();
      const id = randomUUID();
      await sql`INSERT INTO responses (id, pre, details, match_count)
                VALUES (${id}, ${JSON.stringify(r.pre)}, ${JSON.stringify(r.details)}, ${r.matchCount})`;
      return id;
    },
    async addPost(id, post) {
      await ensureTable();
      const rows = await sql`UPDATE responses SET post = ${JSON.stringify(post)}
                             WHERE id = ${id} AND post IS NULL RETURNING id`;
      return rows.length === 1;
    },
    async list() {
      await ensureTable();
      const rows = await sql`SELECT id, created_at, pre, details, match_count, post
                             FROM responses ORDER BY created_at`;
      return rows.map((r) => ({
        id: r.id,
        createdAt: new Date(r.created_at).toISOString(),
        pre: r.pre,
        details: r.details,
        matchCount: r.match_count,
        post: r.post,
      }));
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

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore, isResponseId, type NewResponse } from "./store";

const newResponse: NewResponse = {
  pre: {
    whatMakesItHard: "x",
    topBarriers: ["money", "time"],
    lastDateCost: 100,
    lastDateHours: 4,
    hardestTime: "busy_work_periods",
  },
  details: {
    age: 30,
    gender: "woman",
    area: "east",
    freeEvenings: 2,
    budget: 50,
    lookingFor: ["man"],
    ageMin: 25,
    ageMax: 35,
    areaFlex: "anywhere",
  },
  matchCount: 5,
};

describe("file store", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "store-"));
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it("starts empty, creates, and adds after-answers once", async () => {
    const store = createFileStore(path.join(dir, "sub", "r.json"));
    expect(await store.list()).toEqual([]);

    const id = await store.create(newResponse);
    expect(isResponseId(id)).toBe(true);

    expect(await store.addPost(id, { likelihood: "yes", why: "cheap" })).toBe(true);
    expect(await store.addPost(id, { likelihood: "no", why: "changed my mind" })).toBe(false);
    expect(await store.addPost("00000000-0000-0000-0000-000000000000", { likelihood: "no", why: "x" })).toBe(false);

    const [row] = await store.list();
    expect(row).toMatchObject({ id, ...newResponse, post: { likelihood: "yes", why: "cheap" } });
  });

  it("updates details on a retry, but not after the after-answers are in", async () => {
    const store = createFileStore(path.join(dir, "r.json"));
    const id = await store.create({ ...newResponse, matchCount: 0 });
    const wider = { ...newResponse.details, ageMin: 21, ageMax: 50 };

    expect(await store.updateDetails(id, wider, 5)).toBe(true);
    expect((await store.list())[0]).toMatchObject({ details: wider, matchCount: 5 });

    await store.addPost(id, { likelihood: "maybe", why: "x" });
    expect(await store.updateDetails(id, newResponse.details, 1)).toBe(false);
    expect(await store.list()).toHaveLength(1);
  });

  it("keeps every row when requests arrive at the same time", async () => {
    const store = createFileStore(path.join(dir, "r.json"));
    await Promise.all(Array.from({ length: 10 }, () => store.create(newResponse)));
    expect(await store.list()).toHaveLength(10);
  });
});

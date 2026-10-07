import { describe, expect, it } from "vitest";
import { validateDetails, validatePost, validatePre } from "./validation";

const goodPre = {
  whatMakesItHard: "Long hours at work",
  topBarriers: ["time", "money"],
  lastDateCost: 120,
  lastDateHours: 4,
  hardestTime: "busy_work_periods",
};

const goodDetails = {
  age: 29,
  gender: "woman",
  area: "east",
  freeEvenings: 2,
  budget: 60,
  lookingFor: ["man"],
  ageMin: 27,
  ageMax: 35,
  areaFlex: "anywhere",
};

describe("validatePre", () => {
  it("accepts complete answers and trims text", () => {
    const r = validatePre({ ...goodPre, whatMakesItHard: "  busy  " });
    expect(r).toEqual({ ok: true, value: { ...goodPre, whatMakesItHard: "busy" } });
  });

  it("requires the free-text answer", () => {
    const r = validatePre({ ...goodPre, whatMakesItHard: "   " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.whatMakesItHard).toBeDefined();
  });

  it("requires exactly two different barriers", () => {
    for (const topBarriers of [["time"], ["time", "time"], ["time", "money", "energy"], ["time", "cats"]]) {
      const r = validatePre({ ...goodPre, topBarriers });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.topBarriers).toBeDefined();
    }
  });

  it("rejects negative or non-numeric cost and hours", () => {
    const r = validatePre({ ...goodPre, lastDateCost: -1, lastDateHours: "abc" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.lastDateCost).toBeDefined();
      expect(r.errors.lastDateHours).toBeDefined();
    }
  });

  it("allows a free date (zero dollars)", () => {
    expect(validatePre({ ...goodPre, lastDateCost: 0 }).ok).toBe(true);
  });

  it("rejects an unknown hardest time", () => {
    expect(validatePre({ ...goodPre, hardestTime: "mondays" }).ok).toBe(false);
  });

  it("rejects input that is not an object", () => {
    expect(validatePre(null).ok).toBe(false);
  });
});

describe("validateDetails", () => {
  it("accepts complete details", () => {
    expect(validateDetails(goodDetails)).toEqual({ ok: true, value: goodDetails });
  });

  it("blocks anyone under 21 with an age message", () => {
    const r = validateDetails({ ...goodDetails, age: 20 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.age).toMatch(/21/);
  });

  it("accepts exactly 21", () => {
    expect(validateDetails({ ...goodDetails, age: 21, ageMin: 21 }).ok).toBe(true);
  });

  it("rejects non-whole ages", () => {
    expect(validateDetails({ ...goodDetails, age: 29.5 }).ok).toBe(false);
  });

  it("requires at least one gender to look for, all known", () => {
    expect(validateDetails({ ...goodDetails, lookingFor: [] }).ok).toBe(false);
    expect(validateDetails({ ...goodDetails, lookingFor: ["robot"] }).ok).toBe(false);
  });

  it("de-duplicates genders looked for", () => {
    const r = validateDetails({ ...goodDetails, lookingFor: ["man", "man", "woman"] });
    expect(r.ok && r.value.lookingFor).toEqual(["man", "woman"]);
  });

  it("rejects an age range that is upside down or under 21", () => {
    expect(validateDetails({ ...goodDetails, ageMin: 40, ageMax: 30 }).ok).toBe(false);
    expect(validateDetails({ ...goodDetails, ageMin: 18 }).ok).toBe(false);
  });

  it("limits free evenings to 0-7", () => {
    expect(validateDetails({ ...goodDetails, freeEvenings: 8 }).ok).toBe(false);
    expect(validateDetails({ ...goodDetails, freeEvenings: 0 }).ok).toBe(true);
  });

  it("rejects unknown gender, area or flexibility", () => {
    expect(validateDetails({ ...goodDetails, gender: "x" }).ok).toBe(false);
    expect(validateDetails({ ...goodDetails, area: "jurong" }).ok).toBe(false);
    expect(validateDetails({ ...goodDetails, areaFlex: "maybe" }).ok).toBe(false);
  });
});

describe("validatePost", () => {
  it("accepts yes/maybe/no with a reason", () => {
    expect(validatePost({ likelihood: "maybe", why: " cost " })).toEqual({
      ok: true,
      value: { likelihood: "maybe", why: "cost" },
    });
  });

  it("requires a reason and a known answer", () => {
    expect(validatePost({ likelihood: "yes", why: "" }).ok).toBe(false);
    expect(validatePost({ likelihood: "sure", why: "ok" }).ok).toBe(false);
  });
});

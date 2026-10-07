import {
  AREA_FLEX,
  AREAS,
  BARRIERS,
  GENDERS,
  HARDEST_TIMES,
  LIKELIHOODS,
  MAX_AGE,
  MIN_AGE,
  type Barrier,
  type Details,
  type PostSurvey,
  type PreSurvey,
  type Validated,
} from "./types";

const MAX_TEXT = 2000;

type Errors = Record<string, string>;

function asRecord(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
}

function text(v: unknown, field: string, errors: Errors): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) errors[field] = "Please write an answer.";
  else if (s.length > MAX_TEXT) errors[field] = `Please keep it under ${MAX_TEXT} characters.`;
  return s;
}

function num(v: unknown, field: string, min: number, max: number, errors: Errors, whole = false): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < min || n > max || (whole && !Number.isInteger(n))) {
    errors[field] = `Enter ${whole ? "a whole number" : "a number"} from ${min} to ${max}.`;
  }
  return n;
}

function oneOf<T extends string>(v: unknown, options: readonly T[], field: string, errors: Errors): T {
  if (!options.includes(v as T)) errors[field] = "Please choose an option.";
  return v as T;
}

function done<T>(value: T, errors: Errors): Validated<T> {
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export function validatePre(input: unknown): Validated<PreSurvey> {
  const raw = asRecord(input);
  const errors: Errors = {};

  const whatMakesItHard = text(raw.whatMakesItHard, "whatMakesItHard", errors);

  const barriers = Array.isArray(raw.topBarriers) ? raw.topBarriers : [];
  const valid =
    barriers.length === 2 &&
    new Set(barriers).size === 2 &&
    barriers.every((b) => BARRIERS.includes(b as Barrier));
  if (!valid) errors.topBarriers = "Pick exactly two.";

  const lastDateCost = num(raw.lastDateCost, "lastDateCost", 0, 10000, errors);
  const lastDateHours = num(raw.lastDateHours, "lastDateHours", 0, 48, errors);
  const hardestTime = oneOf(raw.hardestTime, HARDEST_TIMES, "hardestTime", errors);

  return done(
    {
      whatMakesItHard,
      topBarriers: barriers as [Barrier, Barrier],
      lastDateCost,
      lastDateHours,
      hardestTime,
    },
    errors,
  );
}

export function validateDetails(input: unknown): Validated<Details> {
  const raw = asRecord(input);
  const errors: Errors = {};

  const age = num(raw.age, "age", 0, MAX_AGE, errors, true);
  if (!errors.age && age < MIN_AGE) errors.age = `You must be ${MIN_AGE} or older to use this.`;

  const gender = oneOf(raw.gender, GENDERS, "gender", errors);
  const area = oneOf(raw.area, AREAS, "area", errors);
  const freeEvenings = num(raw.freeEvenings, "freeEvenings", 0, 7, errors, true);
  const budget = num(raw.budget, "budget", 0, 10000, errors);

  const looking = Array.isArray(raw.lookingFor) ? [...new Set(raw.lookingFor)] : [];
  if (looking.length === 0 || !looking.every((g) => GENDERS.includes(g))) {
    errors.lookingFor = "Pick at least one.";
  }

  const ageMin = num(raw.ageMin, "ageMin", MIN_AGE, MAX_AGE, errors, true);
  const ageMax = num(raw.ageMax, "ageMax", MIN_AGE, MAX_AGE, errors, true);
  if (!errors.ageMin && !errors.ageMax && ageMin > ageMax) {
    errors.ageMax = "The upper age must be at least the lower age.";
  }

  const areaFlex = oneOf(raw.areaFlex, AREA_FLEX, "areaFlex", errors);

  return done(
    { age, gender, area, freeEvenings, budget, lookingFor: looking as Details["lookingFor"], ageMin, ageMax, areaFlex },
    errors,
  );
}

export function validatePost(input: unknown): Validated<PostSurvey> {
  const raw = asRecord(input);
  const errors: Errors = {};
  const likelihood = oneOf(raw.likelihood, LIKELIHOODS, "likelihood", errors);
  const why = text(raw.why, "why", errors);
  return done({ likelihood, why }, errors);
}

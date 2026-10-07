export const GENDERS = ["woman", "man", "nonbinary"] as const;
export type Gender = (typeof GENDERS)[number];

export const AREAS = ["north", "south", "east", "west", "central"] as const;
export type Area = (typeof AREAS)[number];

export const AREA_FLEX = ["prefer_my_area", "anywhere"] as const;
export type AreaFlex = (typeof AREA_FLEX)[number];

export const BARRIERS = ["money", "time", "finding_someone", "energy", "other"] as const;
export type Barrier = (typeof BARRIERS)[number];

export const HARDEST_TIMES = [
  "busy_work_periods",
  "end_of_month",
  "weekends_taken",
  "no_particular_time",
  "other",
] as const;
export type HardestTime = (typeof HARDEST_TIMES)[number];

export const LIKELIHOODS = ["yes", "maybe", "no"] as const;
export type Likelihood = (typeof LIKELIHOODS)[number];

export const MIN_AGE = 21;
export const MAX_AGE = 99;

/** Answers given before seeing any matches. */
export type PreSurvey = {
  whatMakesItHard: string;
  topBarriers: [Barrier, Barrier];
  lastDateCost: number;
  lastDateHours: number;
  hardestTime: HardestTime;
};

/** The respondent's own details and what they are looking for. */
export type Details = {
  age: number;
  gender: Gender;
  area: Area;
  freeEvenings: number;
  budget: number;
  lookingFor: Gender[];
  ageMin: number;
  ageMax: number;
  areaFlex: AreaFlex;
};

/** Answers given after seeing the suggestions. */
export type PostSurvey = {
  likelihood: Likelihood;
  why: string;
};

export type Profile = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  area: Area;
  freeEvenings: number;
  budget: number;
  lookingFor: Gender[];
  ageMin: number;
  ageMax: number;
  blurb: string;
};

export type StoredResponse = {
  id: string;
  createdAt: string;
  pre: PreSurvey;
  details: Details;
  matchCount: number;
  post: PostSurvey | null;
  /** Sample people this respondent asked the date planner about. */
  picks: PlanPick[];
};

export type PlanPick = { profileId: string; at: string };

export type Validated<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

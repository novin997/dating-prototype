import type { Area, AreaFlex, Barrier, Gender, HardestTime, Likelihood } from "./types";

export const GENDER_LABELS: Record<Gender, string> = {
  woman: "Woman",
  man: "Man",
  nonbinary: "Non-binary",
};

export const AREA_LABELS: Record<Area, string> = {
  north: "North",
  south: "South",
  east: "East",
  west: "West",
  central: "Central",
};

export const AREA_FLEX_LABELS: Record<AreaFlex, string> = {
  prefer_my_area: "I'd rather stay in my area",
  anywhere: "Anywhere in Singapore is fine",
};

export const BARRIER_LABELS: Record<Barrier, string> = {
  money: "Money",
  time: "Time",
  finding_someone: "Finding someone suitable",
  energy: "Energy after work",
  other: "Other",
};

export const HARDEST_TIME_LABELS: Record<HardestTime, string> = {
  busy_work_periods: "Busy work periods",
  end_of_month: "End of the month",
  weekends_taken: "Weekends taken up",
  no_particular_time: "No particular time",
  other: "Other",
};

export const LIKELIHOOD_LABELS: Record<Likelihood, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
};

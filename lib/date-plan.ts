import { AREA_LABELS } from "./labels";
import type { Area, Details, Profile } from "./types";

export const OPENCODE_URL = "https://opencode.ai/zen/v1/chat/completions";
export const DEFAULT_MODEL = "space-bunny-free";
export const DAILY_PLAN_CAP = 200;
const TIMEOUT_MS = 30_000;
const SINGAPORE_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8, no daylight saving

/** The daily cap resets at midnight Singapore time. */
export function startOfSingaporeDay(now: Date): Date {
  const local = new Date(now.getTime() + SINGAPORE_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - SINGAPORE_OFFSET_MS);
}

export type DateIdea = { title: string; description: string; costPerPerson: number; hours: number };
export type Stop = { time: string; place: string; activity: string; costPerPerson: number };
export type DatePlan = { ideas: DateIdea[]; itinerary: { idea: string; stops: Stop[] } };

type Message = { role: "system" | "user"; content: string };
type FetchFn = (url: string, init: RequestInit) => Promise<Response>;

export function planLimits(me: Details, them: Profile) {
  return {
    budget: Math.min(me.budget, them.budget),
    freeEvenings: Math.min(me.freeEvenings, them.freeEvenings),
    areas: [...new Set<Area>([me.area, them.area])],
  };
}

/** Only numbers and areas go to the model: no names, blurbs or written answers. */
export function buildPlanPrompt(me: Details, them: Profile): Message[] {
  const { budget, freeEvenings, areas } = planLimits(me, them);
  const where = areas.map((a) => AREA_LABELS[a]).join(" and ");
  const evenings = `${freeEvenings} free evening${freeEvenings === 1 ? "" : "s"} a week`;

  return [
    {
      role: "system",
      content:
        "You plan affordable first dates in Singapore. Suggest kinds of places and well-known public spots " +
        "(hawker centres, parks, free museums, waterfronts), not obscure venues that may have closed. " +
        "Answer with JSON only, no other text.",
    },
    {
      role: "user",
      content: [
        `Plan a first date for two adults (ages ${me.age} and ${them.age}).`,
        `Keep the cost per person at or under S$${budget}; cheaper is better.`,
        `The busier person has ${evenings}, so keep it to one evening or a weekend afternoon.`,
        `They live in ${where} Singapore; suggest places in or between ${areas.length > 1 ? "those areas" : "that area"}.`,
        "",
        "Return JSON in exactly this shape:",
        '{"ideas":[{"title":string,"description":string (one sentence),"costPerPerson":number (S$),"hours":number}],',
        ' "itinerary":{"idea":string (title of one idea),"stops":[{"time":string (e.g. "7:00pm"),"place":string,"activity":string,"costPerPerson":number}]}}',
        "Give 2 or 3 ideas and 2 to 4 itinerary stops.",
      ].join("\n"),
    },
  ];
}

const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isAmount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

function toIdea(v: unknown): DateIdea | null {
  const o = v as Record<string, unknown> | null;
  if (!o || !isText(o.title) || !isText(o.description) || !isAmount(o.costPerPerson) || !isAmount(o.hours)) {
    return null;
  }
  return { title: o.title, description: o.description, costPerPerson: o.costPerPerson, hours: o.hours };
}

function toStop(v: unknown): Stop | null {
  const o = v as Record<string, unknown> | null;
  if (!o || !isText(o.time) || !isText(o.place) || !isText(o.activity) || !isAmount(o.costPerPerson)) return null;
  return { time: o.time, place: o.place, activity: o.activity, costPerPerson: o.costPerPerson };
}

/** Pulls the JSON object out of the model's answer and checks its shape. Returns null if it isn't usable. */
export function parsePlan(text: string): DatePlan | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }

  const ideas = Array.isArray(raw.ideas) ? raw.ideas.slice(0, 3).map(toIdea) : [];
  const itinerary = raw.itinerary as Record<string, unknown> | undefined;
  const stops = Array.isArray(itinerary?.stops) ? itinerary.stops.slice(0, 6).map(toStop) : [];

  if (!ideas.length || ideas.some((i) => !i)) return null;
  if (!isText(itinerary?.idea) || !stops.length || stops.some((s) => !s)) return null;

  return { ideas: ideas as DateIdea[], itinerary: { idea: itinerary.idea, stops: stops as Stop[] } };
}

export async function generatePlan(
  me: Details,
  them: Profile,
  config: { apiKey: string; model: string },
  fetchFn: FetchFn = fetch,
): Promise<DatePlan | null> {
  try {
    const res = await fetchFn(OPENCODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: buildPlanPrompt(me, them), temperature: 0.7 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("Date planner error", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? parsePlan(content) : null;
  } catch (e) {
    console.error("Date planner request failed", e);
    return null;
  }
}

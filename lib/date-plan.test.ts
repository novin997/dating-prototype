import { describe, expect, it, vi } from "vitest";
import { buildPlanPrompt, generatePlan, parsePlan, planLimits } from "./date-plan";
import type { Details, Profile } from "./types";

const me: Details = {
  age: 30,
  gender: "woman",
  area: "east",
  freeEvenings: 2,
  budget: 60,
  lookingFor: ["man"],
  ageMin: 28,
  ageMax: 35,
  areaFlex: "anywhere",
};

const them: Profile = {
  id: "s09",
  name: "Faizal",
  age: 33,
  gender: "man",
  area: "central",
  freeEvenings: 1,
  budget: 45,
  lookingFor: ["woman"],
  ageMin: 27,
  ageMax: 37,
  blurb: "Saving for a BTO, so cheap eats are a feature.",
};

const goodPlan = {
  ideas: [
    { title: "Hawker dinner and river walk", description: "Eat then stroll.", costPerPerson: 15, hours: 2.5 },
    { title: "Botanic Gardens picnic", description: "Bring snacks.", costPerPerson: 10, hours: 2 },
  ],
  itinerary: {
    idea: "Hawker dinner and river walk",
    stops: [
      { time: "7:00pm", place: "Maxwell Food Centre", activity: "Dinner", costPerPerson: 10 },
      { time: "8:15pm", place: "Singapore River", activity: "Walk", costPerPerson: 0 },
    ],
  },
};

describe("planLimits", () => {
  it("uses the lower budget, the fewer free evenings, and both areas", () => {
    expect(planLimits(me, them)).toEqual({ budget: 45, freeEvenings: 1, areas: ["east", "central"] });
  });

  it("lists one area when both live in the same place", () => {
    expect(planLimits(me, { ...them, area: "east" }).areas).toEqual(["east"]);
  });
});

describe("buildPlanPrompt", () => {
  const messages = buildPlanPrompt(me, them);
  const all = messages.map((m) => m.content).join("\n");

  it("states the budget cap, time and areas", () => {
    expect(all).toContain("S$45");
    expect(all).toMatch(/East/);
    expect(all).toMatch(/Central/);
    expect(all).toMatch(/1 free evening/);
  });

  it("asks for JSON in the expected shape", () => {
    expect(all).toMatch(/JSON/);
    expect(all).toContain("costPerPerson");
    expect(all).toContain("itinerary");
  });

  it("sends no names or free text", () => {
    expect(all).not.toContain("Faizal");
    expect(all).not.toContain("BTO");
  });
});

describe("parsePlan", () => {
  it("parses a clean JSON answer", () => {
    expect(parsePlan(JSON.stringify(goodPlan))).toEqual(goodPlan);
  });

  it("finds the JSON inside a code fence or chatter", () => {
    const text = "Sure! Here you go:\n```json\n" + JSON.stringify(goodPlan) + "\n```\nEnjoy!";
    expect(parsePlan(text)).toEqual(goodPlan);
  });

  it("keeps at most 3 ideas and drops extra fields", () => {
    const four = { ...goodPlan, ideas: [...goodPlan.ideas, ...goodPlan.ideas], extra: "x" };
    const parsed = parsePlan(JSON.stringify(four));
    expect(parsed?.ideas).toHaveLength(3);
    expect(parsed).not.toHaveProperty("extra");
  });

  it("rejects answers that are not valid plans", () => {
    expect(parsePlan("no json here")).toBeNull();
    expect(parsePlan("{not json}")).toBeNull();
    expect(parsePlan(JSON.stringify({ ...goodPlan, ideas: [] }))).toBeNull();
    expect(parsePlan(JSON.stringify({ ...goodPlan, itinerary: { idea: "x", stops: [] } }))).toBeNull();
    expect(
      parsePlan(JSON.stringify({ ...goodPlan, ideas: [{ ...goodPlan.ideas[0], costPerPerson: "cheap" }] })),
    ).toBeNull();
  });
});

describe("generatePlan", () => {
  const config = { apiKey: "k", model: "space-bunny-free" };

  function reply(content: string, status = 200) {
    return vi.fn(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status }),
    );
  }

  it("calls the OpenCode Zen chat endpoint with the key and model", async () => {
    const fetchFn = reply(JSON.stringify(goodPlan));
    const plan = await generatePlan(me, them, config, fetchFn);
    expect(plan).toEqual(goodPlan);

    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://opencode.ai/zen/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer k");
    expect(JSON.parse(init.body as string).model).toBe("space-bunny-free");
  });

  it("returns null when the service errors or answers badly", async () => {
    expect(await generatePlan(me, them, config, reply("", 500))).toBeNull();
    expect(await generatePlan(me, them, config, reply("I can't help"))).toBeNull();
    const throwing = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await generatePlan(me, them, config, throwing)).toBeNull();
  });
});

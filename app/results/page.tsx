import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import {
  AREA_FLEX_LABELS,
  AREA_LABELS,
  BARRIER_LABELS,
  GENDER_LABELS,
  HARDEST_TIME_LABELS,
  LIKELIHOOD_LABELS,
} from "@/lib/labels";
import { hasValidSession, RESULTS_COOKIE } from "@/lib/results-auth";
import { getStore } from "@/lib/store";
import { GATE_THRESHOLD, MIN_RESPONSES, summarize, type Gate } from "@/lib/summary";

export const metadata: Metadata = {
  title: "Results",
  robots: { index: false, follow: false },
};

const money = (n: number | null) => (n === null ? "–" : `S$${n.toFixed(0)}`);
const hours = (n: number | null) => (n === null ? "–" : `${n.toFixed(1)} h`);

function GateCard({ title, rule, gate }: { title: string; rule: string; gate: Gate }) {
  const pct = gate.of ? Math.round((gate.count / gate.of) * 100) : 0;
  const status =
    gate.status === "waiting"
      ? `Waiting: ${gate.of} of ${MIN_RESPONSES} responses needed`
      : gate.status === "pass"
        ? "Pass"
        : "Fail";
  return (
    <div className="stat">
      <span className="muted">{title}</span>
      <b className={gate.status === "waiting" ? "" : gate.status}>{status}</b>
      <span className="muted">
        {gate.count} of {gate.of} ({pct}%) {rule}
      </span>
    </div>
  );
}

function Counts<K extends string>({ labels, counts }: { labels: Record<K, string>; counts: Record<K, number> }) {
  return (
    <div className="stats">
      {(Object.keys(labels) as K[]).map((k) => (
        <div key={k} className="stat">
          <span className="muted">{labels[k]}</span>
          <b>{counts[k]}</b>
        </div>
      ))}
    </div>
  );
}

function Login({ failed, configured }: { failed: boolean; configured: boolean }) {
  return (
    <main className="page">
      <h1>Results</h1>
      {!configured ? (
        <p>The results password isn&apos;t set. Add RESULTS_PASSWORD to the environment.</p>
      ) : (
        <form method="post" action="/api/results-login">
          <fieldset className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoFocus required />
            {failed && <p className="error">That password isn&apos;t right.</p>}
          </fieldset>
          <button type="submit">Open results</button>
        </form>
      )}
    </main>
  );
}

export default function ResultsPage({ searchParams }: PageProps<"/results">) {
  return (
    <Suspense fallback={<main className="page muted">Loading…</main>}>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/results">, "searchParams">) {
  const expected = process.env.RESULTS_PASSWORD;
  const cookie = (await cookies()).get(RESULTS_COOKIE)?.value;
  if (!hasValidSession(cookie, expected)) {
    const { error } = await searchParams;
    return <Login failed={!!error} configured={!!expected} />;
  }

  const responses = await getStore().list();
  const s = summarize(responses);
  const threshold = `${GATE_THRESHOLD * 100}%`;

  return (
    <main className="page wide">
      <h1>Results</h1>
      <p className="muted">
        {s.total} responses, {s.withPost} answered the last question. Gates are judged once there are{" "}
        {MIN_RESPONSES}, and pass at {threshold}.
      </p>

      <h2>Gates</h2>
      <div className="stats">
        <GateCard title="Gate 1: problem" rule="put money or time in their top two" gate={s.gate1} />
        <GateCard title="Gate 2: solution" rule='answered "yes"' gate={s.gate2} />
      </div>

      <h2>What a date costs</h2>
      <div className="stats">
        <div className="stat">
          <span className="muted">Average cost</span>
          <b>{money(s.avgCost)}</b>
        </div>
        <div className="stat">
          <span className="muted">Average hours</span>
          <b>{hours(s.avgHours)}</b>
        </div>
      </div>

      <h2>Top-two barriers</h2>
      <Counts labels={BARRIER_LABELS} counts={s.barrierCounts} />

      <h2>Hardest time to date</h2>
      <Counts labels={HARDEST_TIME_LABELS} counts={s.hardestTimeCounts} />

      <h2>More likely to date?</h2>
      <Counts labels={LIKELIHOOD_LABELS} counts={s.likelihoodCounts} />

      <h2>Every response</h2>
      {responses.length === 0 ? (
        <p className="muted">No responses yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>What makes it hard</th>
                <th>Top two</th>
                <th>Last date</th>
                <th>Hardest time</th>
                <th>About them</th>
                <th>Looking for</th>
                <th>Matches</th>
                <th>More likely?</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {[...responses].reverse().map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString("en-SG", { timeZone: "Asia/Singapore" })}</td>
                  <td className="text">{r.pre.whatMakesItHard}</td>
                  <td>{r.pre.topBarriers.map((b) => BARRIER_LABELS[b]).join(", ")}</td>
                  <td>
                    S${r.pre.lastDateCost}, {r.pre.lastDateHours} h
                  </td>
                  <td>{HARDEST_TIME_LABELS[r.pre.hardestTime]}</td>
                  <td>
                    {r.details.age}, {GENDER_LABELS[r.details.gender]}, {AREA_LABELS[r.details.area]}
                    <br />
                    S${r.details.budget}/date, {r.details.freeEvenings} evenings
                  </td>
                  <td>
                    {r.details.lookingFor.map((g) => GENDER_LABELS[g]).join(", ")}, {r.details.ageMin}–
                    {r.details.ageMax}
                    <br />
                    {AREA_FLEX_LABELS[r.details.areaFlex]}
                  </td>
                  <td>{r.matchCount}</td>
                  <td>{r.post ? LIKELIHOOD_LABELS[r.post.likelihood] : "–"}</td>
                  <td className="text">{r.post?.why ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

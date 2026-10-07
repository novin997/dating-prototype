"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AREA_FLEX_LABELS,
  AREA_LABELS,
  BARRIER_LABELS,
  GENDER_LABELS,
  HARDEST_TIME_LABELS,
  LIKELIHOOD_LABELS,
} from "@/lib/labels";
import { MIN_AGE, type Barrier, type Gender, type Profile } from "@/lib/types";
import { validateDetails, validatePost, validatePre } from "@/lib/validation";

type Step = "consent" | "pre" | "details" | "matches" | "post" | "thanks";
type Errors = Record<string, string>;

const STEP_NUMBER: Partial<Record<Step, string>> = {
  pre: "Step 1 of 4",
  details: "Step 2 of 4",
  matches: "Step 3 of 4",
  post: "Step 4 of 4",
};

const emptyPre = {
  whatMakesItHard: "",
  topBarriers: [] as Barrier[],
  lastDateCost: "",
  lastDateHours: "",
  hardestTime: "",
};

const emptyDetails = {
  age: "",
  gender: "",
  area: "",
  freeEvenings: "",
  budget: "",
  lookingFor: [] as Gender[],
  ageMin: "",
  ageMax: "",
  areaFlex: "",
};

const emptyPost = { likelihood: "", why: "" };

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      {hint && <p className="hint">{hint}</p>}
      {children}
      {error && <p className="error">{error}</p>}
    </fieldset>
  );
}

function Radios<T extends string>({
  name,
  labels,
  value,
  onChange,
}: {
  name: string;
  labels: Record<T, string>;
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div className="choices">
      {(Object.keys(labels) as T[]).map((k) => (
        <label key={k} className="choice">
          <input type="radio" name={name} checked={value === k} onChange={() => onChange(k)} />
          {labels[k]}
        </label>
      ))}
    </div>
  );
}

function Checks<T extends string>({
  labels,
  value,
  onChange,
  max,
}: {
  labels: Record<T, string>;
  value: T[];
  onChange: (v: T[]) => void;
  max?: number;
}) {
  return (
    <div className="choices">
      {(Object.keys(labels) as T[]).map((k) => {
        const checked = value.includes(k);
        return (
          <label key={k} className="choice">
            <input
              type="checkbox"
              checked={checked}
              disabled={!checked && max !== undefined && value.length >= max}
              onChange={() => onChange(checked ? value.filter((v) => v !== k) : [...value, k])}
            />
            {labels[k]}
          </label>
        );
      })}
    </div>
  );
}

export default function Flow() {
  const [step, setStep] = useState<Step>("consent");
  const [pre, setPre] = useState(emptyPre);
  const [details, setDetails] = useState(emptyDetails);
  const [post, setPost] = useState(emptyPost);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Profile[]>([]);

  useEffect(() => window.scrollTo(0, 0), [step]);

  function go(next: Step) {
    setErrors({});
    setStep(next);
  }

  async function send(url: string, method: string, body: unknown) {
    setBusy(true);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors ?? { form: "Something went wrong. Please try again." });
        return null;
      }
      return data;
    } catch {
      setErrors({ form: "Couldn't reach the server. Check your connection and try again." });
      return null;
    } finally {
      setBusy(false);
    }
  }

  function submitPre() {
    const r = validatePre(pre);
    if (!r.ok) return setErrors(r.errors);
    go("details");
  }

  async function submitDetails() {
    const r = validateDetails(details);
    if (!r.ok) return setErrors(r.errors);
    // A retry after "no match" updates the same response instead of creating a second one.
    const data = responseId
      ? await send(`/api/responses/${responseId}`, "PUT", { details })
      : await send("/api/responses", "POST", { pre, details });
    if (!data) return;
    setResponseId(data.id);
    setMatches(data.matches);
    go("matches");
  }

  async function submitPost() {
    const r = validatePost(post);
    if (!r.ok) return setErrors(r.errors);
    const data = await send(`/api/responses/${responseId}`, "PATCH", { post });
    if (data) go("thanks");
  }

  const formError = errors.form && <p className="error">{errors.form}</p>;
  const stepLabel = STEP_NUMBER[step] && <p className="step">{STEP_NUMBER[step]}</p>;

  if (step === "consent") {
    return (
      <>
        <h1>Dating in Singapore, without the cost</h1>
        <p>
          We&apos;re exploring an app that helps singles go on dates without giving up the money and time they&apos;d
          rather keep. It takes about 3 minutes.
        </p>
        <div className="notice">
          This is a research prototype. Your answers are anonymous and stored to help us understand dating in
          Singapore. The profiles shown are fictional. Don&apos;t enter anything that identifies you.
        </div>
        <div className="actions">
          <button onClick={() => go("pre")}>I understand, start</button>
        </div>
      </>
    );
  }

  if (step === "pre") {
    return (
      <>
        {stepLabel}
        <h1>First, about dating today</h1>
        <Field label="What makes going on a date hard for you?" error={errors.whatMakesItHard}>
          <textarea
            value={pre.whatMakesItHard}
            onChange={(e) => setPre({ ...pre, whatMakesItHard: e.target.value })}
          />
        </Field>
        <Field label="Your top two barriers" hint="Pick exactly two." error={errors.topBarriers}>
          <Checks
            labels={BARRIER_LABELS}
            value={pre.topBarriers}
            max={2}
            onChange={(topBarriers) => setPre({ ...pre, topBarriers })}
          />
        </Field>
        <Field
          label="Your last date (or a typical one)"
          hint="Roughly what it cost you, and how many hours it took including travel."
          error={errors.lastDateCost ?? errors.lastDateHours}
        >
          <div className="row">
            <label>
              <span className="muted">Cost (S$)</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={pre.lastDateCost}
                onChange={(e) => setPre({ ...pre, lastDateCost: e.target.value })}
              />
            </label>
            <label>
              <span className="muted">Hours</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={pre.lastDateHours}
                onChange={(e) => setPre({ ...pre, lastDateHours: e.target.value })}
              />
            </label>
          </div>
        </Field>
        <Field label="When is it hardest to date?" error={errors.hardestTime}>
          <Radios
            name="hardestTime"
            labels={HARDEST_TIME_LABELS}
            value={pre.hardestTime}
            onChange={(hardestTime) => setPre({ ...pre, hardestTime })}
          />
        </Field>
        <div className="actions">
          <button onClick={submitPre}>Next</button>
        </div>
      </>
    );
  }

  if (step === "details") {
    return (
      <>
        {stepLabel}
        <h1>About you, and who you&apos;d like to meet</h1>
        <div className="row">
          <Field label="Your age" error={errors.age}>
            <input
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              value={details.age}
              onChange={(e) => setDetails({ ...details, age: e.target.value })}
            />
          </Field>
          <Field label="Free evenings a week" error={errors.freeEvenings}>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={7}
              value={details.freeEvenings}
              onChange={(e) => setDetails({ ...details, freeEvenings: e.target.value })}
            />
          </Field>
        </div>
        <Field label="You are" error={errors.gender}>
          <Radios
            name="gender"
            labels={GENDER_LABELS}
            value={details.gender}
            onChange={(gender) => setDetails({ ...details, gender })}
          />
        </Field>
        <Field label="Where you live" error={errors.area}>
          <Radios
            name="area"
            labels={AREA_LABELS}
            value={details.area}
            onChange={(area) => setDetails({ ...details, area })}
          />
        </Field>
        <Field label="Budget you're comfortable with per date (S$)" error={errors.budget}>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={details.budget}
            onChange={(e) => setDetails({ ...details, budget: e.target.value })}
          />
        </Field>
        <Field label="Looking for" hint="Pick any." error={errors.lookingFor}>
          <Checks
            labels={GENDER_LABELS}
            value={details.lookingFor}
            onChange={(lookingFor) => setDetails({ ...details, lookingFor })}
          />
        </Field>
        <Field label="Their age" error={errors.ageMin ?? errors.ageMax}>
          <div className="row">
            <label>
              <span className="muted">From</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_AGE}
                value={details.ageMin}
                onChange={(e) => setDetails({ ...details, ageMin: e.target.value })}
              />
            </label>
            <label>
              <span className="muted">To</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_AGE}
                value={details.ageMax}
                onChange={(e) => setDetails({ ...details, ageMax: e.target.value })}
              />
            </label>
          </div>
        </Field>
        <Field label="How far would you go?" error={errors.areaFlex}>
          <Radios
            name="areaFlex"
            labels={AREA_FLEX_LABELS}
            value={details.areaFlex}
            onChange={(areaFlex) => setDetails({ ...details, areaFlex })}
          />
        </Field>
        {formError}
        <div className="actions">
          <button onClick={submitDetails} disabled={busy}>
            {busy ? "Finding matches…" : "See my matches"}
          </button>
          {!responseId && (
            <button className="secondary" onClick={() => go("pre")} disabled={busy}>
              Back
            </button>
          )}
        </div>
      </>
    );
  }

  if (step === "matches") {
    return (
      <>
        {stepLabel}
        {matches.length === 0 ? (
          <>
            <h1>No successful match</h1>
            <div className="notice">
              Nobody fits your preferences right now. Try widening your age range, or choose &ldquo;Anywhere in
              Singapore is fine&rdquo;.
            </div>
            <div className="actions">
              <button onClick={() => go("details")}>Change my preferences</button>
              <button className="secondary" onClick={() => go("post")}>
                Skip to the last question
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>Your suggestions</h1>
            <p className="muted">These are sample profiles, not real people.</p>
            {matches.map((p) => (
              <div key={p.id} className="card">
                <div className="card-head">
                  <strong>
                    {p.name}, {p.age}
                  </strong>
                  <span className="tag">Sample profile</span>
                </div>
                <p className="facts">
                  {AREA_LABELS[p.area]} · S${p.budget} per date · {p.freeEvenings} free evening
                  {p.freeEvenings === 1 ? "" : "s"} a week
                </p>
                <p>{p.blurb}</p>
              </div>
            ))}
            <div className="actions">
              <button onClick={() => go("post")}>Next</button>
            </div>
          </>
        )}
      </>
    );
  }

  if (step === "post") {
    return (
      <>
        {stepLabel}
        <h1>Last question</h1>
        <Field label="Would something like this make you more likely to go on a date?" error={errors.likelihood}>
          <Radios
            name="likelihood"
            labels={LIKELIHOOD_LABELS}
            value={post.likelihood}
            onChange={(likelihood) => setPost({ ...post, likelihood })}
          />
        </Field>
        <Field label="Why?" error={errors.why}>
          <textarea value={post.why} onChange={(e) => setPost({ ...post, why: e.target.value })} />
        </Field>
        {formError}
        <div className="actions">
          <button onClick={submitPost} disabled={busy}>
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Thank you</h1>
      <p>Your answers are saved. They&apos;ll help shape whether and how this gets built.</p>
    </>
  );
}

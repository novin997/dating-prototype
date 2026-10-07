import type { Metadata } from "next";
import Link from "next/link";
import { Buddy } from "./Mascot";

export const metadata: Metadata = {
  title: "Date Without the Cost",
  description: "A research prototype about dating in Singapore, by Team Otto.",
};

export default function Home() {
  return (
    <main className="page">
      <Buddy mood="wave">Hi, I&apos;m Otto. This is the idea we&apos;re testing — then you can try it yourself.</Buddy>

      <div className="brand">
        <span className="tag">Research prototype</span>
        <span className="tag">Team Otto</span>
        <span className="tag">Singapore</span>
      </div>

      <h1>Date Without the Cost</h1>
      <p className="lede">
        Helps single Singaporeans go on a date without giving up the money and time they would rather keep.
      </p>
      <p className="muted">A research prototype by Team Otto. About 3 minutes. Answers are anonymous.</p>

      <div className="actions">
        <Link href="/try" className="action">
          Try the prototype
        </Link>
      </div>

      <h2>The problem</h2>
      <div className="card">
        <p>
          Single Singaporeans find it hard to go on dates, and nothing today gives them a reason to. Dating asks for
          money and time they would rather keep, the cost of living keeps rising, and there is little support such as
          time off or money to make a date easier.
        </p>
        <p className="facts">If nothing changes, fewer people will marry and the fertility rate will keep falling.</p>
      </div>

      <h2>Who it&apos;s for</h2>
      <div className="card">
        <p>
          Single people in Singapore, especially 25 to 35 year olds, who want to date but feel the money and time
          cost too much.
        </p>
        <p className="facts">
          Hypothesis we&apos;re checking: it bites most in busy work seasons, when there is less free time for dates.
        </p>
      </div>

      <h2>What we&apos;ll count as success</h2>
      <div className="stats stories">
        <div className="stat story">
          <span className="muted">Main metric</span>
          <b>Share who go on a date they otherwise would not have</b>
        </div>
        <div className="stat story">
          <span className="muted">Supporting figures</span>
          <b>Dollars and hours per date</b>
        </div>
        <div className="stat">
          <span className="muted">Today (our estimate)</span>
          <b>S$100</b>
        </div>
        <div className="stat story">
          <span className="muted">Target</span>
          <b>Set after prototype responses</b>
        </div>
      </div>
      <p className="muted">
        Must not get worse: date quality, and people leaving without having had a date. Raw churn is not used, because
        people who find a partner and leave are a success.
      </p>

      <h2>Riskiest assumption</h2>
      <div className="card">
        <p>
          A dating product can create the time off, money or incentive that singles say is missing today.
        </p>
        <p className="facts">
          Test: an open prototype anyone can answer. No names. Gates are judged once at least 20 responses are in.
        </p>
      </div>
      <div className="stats stories">
        <div className="stat story">
          <span className="muted">Gate 1 · problem</span>
          <b>80% name money or time in their top two barriers</b>
        </div>
        <div className="stat story">
          <span className="muted">Gate 2 · solution</span>
          <b>80% say yes, this would make them more likely to date</b>
        </div>
      </div>
      <p className="muted">Result: not run yet. How the product actually saves money or time is decided from the answers.</p>

      <h2>Evidence so far</h2>
      <ul className="evidence">
        <li>
          <span className="tag">Heard</span>
          People around us say finding a date, and finding the time for one, is hard.
        </li>
        <li>
          <span className="tag">Estimate</span>
          We put the cost of a date at about S$100 today. That figure has not been verified.
        </li>
        <li>
          <span className="tag">Reasoning</span>
          Singles value their freedom, money and time. Rising costs plus few incentives keep them from dating.
        </li>
        <li>
          <span className="tag">Not checked</span>
          Nobody outside our circle has been asked yet. The prototype is how we check.
        </li>
        <li>
          <span className="tag">In the prototype</span>
          Every respondent is asked what their last date cost in dollars and hours, when it is hardest to date, and
          whether something like this would make them more likely to go on a date.
        </li>
      </ul>

      <div className="notice">
        This is a research prototype. Profiles are fictional. Don&apos;t enter anything that identifies you.
      </div>

      <div className="actions">
        <Link href="/try" className="action">
          Try the prototype
        </Link>
      </div>
    </main>
  );
}

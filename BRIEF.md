# Dating app: product brief

## Working rules

Build story 1 first, then stop so I can try it. Plan before you code, commit in small steps, and test the core logic. If a task needs something this file doesn't settle, ask before guessing. When a decision changes, update the brief below in the same commit, and move answered open questions into the section they settle. Never build anything listed under "Not building" without asking.

## In one line

Helps single Singaporeans go on a date without giving up the money and time they would rather keep.

## Problem

Single Singaporeans find it hard to go on dates, and nothing today gives them a reason to. Dating asks for money and time they would rather keep, the cost of living keeps rising, and there is little support such as time off or money to make a date easier. If nothing changes, fewer people will marry and the fertility rate will keep falling.

When it bites most (hypothesis, not yet checked): busy work seasons, when there is less free time to spend on dates. The prototype asks every respondent "When is it hardest to date?" to test this.

## Evidence

- You have heard from people around you that finding a date, and finding the time for one, is hard.
- You put the cost of a date at about $100 today.
- Your reasoning: singles value their freedom, money and time, and rising costs plus few incentives keep them from dating.
- Not checked yet: nobody outside your circle has been asked, and the $100 figure has not been verified. The prototype asks every respondent what their last date cost in dollars and hours.

## Success

- Main metric: share of people who go on a date they otherwise would not have.
- Supporting figures: dollars per date and hours per date.
- Today: $100 per date, your estimate.
- Target: set after the prototype responses are in.
- Must not get worse: date quality, and churn without a date (users who leave without having had a date). Raw churn is not used, because people who find a partner and leave are a success.

## Riskiest bet

A dating product can create the time off, money or incentive that singles say is missing today.

- Test: an open prototype link, anyone can respond. No screening questions and no names; answers are anonymous. There is no spam protection, so watch for bursts of identical answers.
- Pass mark, two gates, judged only once at least 20 responses are in:
  - Gate 1 (problem): at least 80% of respondents put money or time in their top two barriers.
  - Gate 2 (solution): at least 80% of respondents answer "yes" (not "maybe") to "Would something like this make you more likely to go on a date?"
- Result: not run yet

## First version

1. Story 1: a rough matching prototype anyone can open from one link, with the questions built in.
   - Consent screen: "This is a research prototype. Your answers are anonymous and stored to help us understand dating in Singapore. The profiles shown are fictional. Don't enter anything that identifies you."
   - Before matching: what makes dating hard (free text), top two barriers (money / time / finding someone suitable / energy after work / other), cost of the last date in dollars and hours including travel, and when it is hardest to date (busy work periods / end of month / weekends taken up / no particular time / other).
   - Details: age, gender, area (North, South, East, West, Central), free evenings per week, budget per date. Looking for: gender(s), age range, area flexibility. No name, phone, photo, NRIC or email.
   - Checks: required fields, numbers in range, under-21s blocked.
   - Matching against about 30 fictional profiles, each tagged "Sample profile". Hard filters: both sides fit each other's gender and age preferences. Ranking: same area first (then anywhere if they are flexible), then closest budget, then most free evenings in common. Show the top 5.
   - After matching: "Would something like this make you more likely to go on a date?" (yes / maybe / no) and why.
   - Done when a respondent's answers are written down.
2. Story 2: show the prototype to respondents and record whether it changes whether they would date. Done when the gate numbers can be read off the results page.
3. Story 3: record what each respondent says a date costs in time and money. Done when those figures sit in one place (the results page).

How the product will actually save money or time is not decided; the responses will decide it.

## Walkthrough

1. The person opens the app and enters their details and preferences.
2. The app checks those details.
3. The app looks for matches.
4. The person sees a list of suggestions.

If it goes wrong: they see a message saying there is no successful match, and are asked to widen their preferences.

## Build decisions

- Stack: Next.js and TypeScript, Vitest for the core logic.
- Hosting: Vercel with Vercel Postgres (Neon), Singapore region. Locally, answers are saved to a file in `.data/`.
- Results page: protected by one shared password (`RESULTS_PASSWORD`). Shows every submission plus totals for barriers, yes/maybe/no, average dollars and hours, hardest time, and both gates.
- Process: build locally, the owner tries it, then deploy after approval.
- English only.

## Not building

- Anything beyond the four steps above: no messaging, no scheduling and no extra screens until the bet is tested. Exception, approved: the password-protected results page.
- No promise of time off, money or other incentives until the bet is tested.
- No attempt to move the fertility rate; that sits outside the first version.

## Open questions

- How the product saves money or time: cheaper date ideas, better matching, outside incentives, or something else. Decide from the responses.
- The target for the main metric. Set after the responses are in.

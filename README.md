# Dating prototype

Research prototype for the brief in [BRIEF.md](BRIEF.md).

```bash
npm install
npm run dev     # http://localhost:3000 landing, prototype at /try, results at /results
npm test        # core logic tests
```

Set `RESULTS_PASSWORD` in `.env.local` to open the results page. The date planner needs `DATE_PLANNER=on` and `OPENCODE_API_KEY` (from https://opencode.ai/zen); `OPENCODE_MODEL` overrides the default `space-bunny-free`. Without `DATABASE_URL`, answers are saved to `.data/responses.json`.

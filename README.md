# Dating prototype

Research prototype for the brief in [BRIEF.md](BRIEF.md).

```bash
npm install
npm run dev     # http://localhost:3000, results at /results
npm test        # core logic tests
```

Set `RESULTS_PASSWORD` in `.env.local` to open the results page. Without `DATABASE_URL`, answers are saved to `.data/responses.json`.

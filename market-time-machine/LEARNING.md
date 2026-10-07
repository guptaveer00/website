# Understand and contribute

This guide is AI-generated; it is not your submission README.

1. Run the app, use the balanced preset, and explain how changing the start month changes results.
2. Read `app.js` function `config()`: this collects form values into a JSON object. In `run()`, `fetch` sends it to `/api/simulate`.
3. Read `backend/app.py` method `do_POST`: it validates the request and calls `experiment()`.
4. Read `backend/engine.py`: each month changes holdings using price ratios, adds a contribution, optionally rebalances, and records results. The benchmark uses identical deposits.
5. Read `backend/market.py`: external data is retrieved separately and cached, so simulations remain reproducible if the provider is down.
6. Make a meaningful personal change you understand: add a preset allocation and explain your choices; change the default strategy; or add an additional explanatory metric label. Record what YOU changed in your log.
7. Try invalid allocations, reversed dates, all cash, zero fees, and a different starting period. Explain the outcomes.
8. Finish your README in your words, log actual work time and prompts, and record a real AI mistake if one occurs. Deployment, portfolio linking, and your video still need to be completed later.

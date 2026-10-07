# Market Time Machine

> README outline prepared by AI. Veer must replace this outline with his own explanation before submission.

## In my own words — to complete
- What does my app do, and why did I choose it?
- How do visitors use it?
- Which features am I proud of, and why?
- What meaningful code changes did I personally make? Explain where and how.
- How did I use AI, and what did I learn?

## AI-generated technical reference

### Run locally
Requires Python 3.10 or later; no packages or paid services are required.

```sh
cd /Users/veergupta/Desktop/VeerWebsite/market-time-machine
python3 backend/app.py
```

Open http://127.0.0.1:8766/ . Keep the terminal running. A static HTTP server alone cannot run the backend.

Refresh real data (requires internet; failure preserves the existing snapshot):
```sh
python3 backend/market.py
```

Test calculations:
```sh
cd backend
python3 -m unittest -v
```

### Architecture
- `index.html`, `style.css`, `app.js`: responsive interface; JSON requests and SVG charts.
- `backend/app.py`: same-origin HTTP API and SQLite persistence.
- `backend/engine.py`: portfolio accounting, transaction-cost calculation, time-weighted returns, risk measures, historical-window comparison.
- `backend/market.py`: third-party Yahoo Finance chart endpoint ingestion; common completed months only; atomically replaces the cache.
- `data/market.json`: real cached historical adjusted prices and retrieval metadata. Never replaced by fictional fallback data.

The data import makes four real external API requests. Simulation requests use the cached snapshot, avoiding repeated upstream calls and outages. The Yahoo chart endpoint is unofficial and may change or become unavailable. No guaranteed API service contract is assumed.

### Secrets and saved data
No external API key is required by the tested endpoint. Never add keys to frontend files. SQLite files and `.env` are Git-ignored and never served as static files. A random browser token isolates saved experiments; this is a small educational capability-based save system, not account authentication. Do not store sensitive financial information. There is a 30-save limit per token. Real public hosting needs HTTPS, rate limiting, and a deliberate persistence plan; SQLite on ephemeral free hosting can lose saves on restart. All simulations use pretend funds.

### Methodology
Monthly adjusted-price ratios model total returns approximately. Cash earns zero. Deposits start in the second observation. Trades incur basis-point costs on buys and sells. Rebalancing restores targets after fees, using a numerical solution to conserve funds. Monthly returns exclude external deposits; annualized return compounds them. Initial purchase fees reduce the initial balance but are not included in the subsequently measured annualized return. Taxes, inflation, slippage, and intramonth events are excluded. Rolling tests use overlapping windows, not independent out-of-sample trials. Asset selection creates survivorship bias.

### Deployment status
Prepared for Render deployment. Source is being committed and pushed with Veer’s authorization; Veer will press Deploy. The portfolio page has not been edited. GitHub Pages cannot execute Python. The simplest eventual deployment is the complete app on one Python host, with a portfolio link to it. The server defaults to localhost; a host can set `HOST=0.0.0.0` and `PORT`. Do not publish the database or browser tokens. Check current free hosting limits before choosing a provider.

### AI and source citations
Codex (GPT-6-based assistant) created the initial frontend, backend, and tests; this is not evidence of Veer personally writing those portions. Tool use included terminal, web search, and Codex in-app browser for verification. Actual user prompts are separately recorded in `prompt_log.md`.
Yahoo adjusted-close explanation: https://in.help.yahoo.com/kb/adjusted-close-sln28256.html
API endpoint pattern: https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=20y&interval=1mo

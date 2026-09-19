# Which Stock Won?

A stock-history guessing game. Choose 3, 5, or 10 rounds, a historical return window, and either 20 tech/digital companies or 40 companies across sectors. Pick which stock had the higher percentage return between the displayed dates, reveal the chart, and finish with a scorecard.

Click a company or press 1/2 to answer. Correct picks earn 100 points plus a streak bonus of 25 per previous consecutive correct answer, capped at 100 bonus points. Both falling means the smaller loss wins; returns tied at two decimals accept either answer. Companies do not repeat within a game; replay prioritizes companies absent from the previous game while the page remains open. API failures offer retry or a replacement matchup.

The original comparison tool, including latest available quotes, remains at `compare.html`. Game files are `game.js`, `game-core.js`, and `game.css`; calculations are shared through `analytics.js`. Both tools run as static pages with no build step.

## Original comparison tool

An interactive feature on my portfolio that compares two US-listed stocks over a selected date range. It places both on a $100 starting line and shows historical return, annualized volatility, maximum drawdown, and a downloadable comparison.

## How the API is called
The browser uses JavaScript's built-in `fetch()` to send a GET request to `https://fintable.io/api/v2/prices/{symbol}/history` for each ticker. Query parameters specify `timeframe=1day`, the `start` and `end` dates, and `limit=1000`; the request accepts JSON. The response contains a `data` object with a symbol, currency, feed, and `bars` array, whose entries include date strings, decimal-string prices, and numeric volume. The app converts closing prices into numbers, validates and sorts them, and compares only dates present in both histories. This public endpoint needs no API key or account, and its browser-access headers allow requests from a static portfolio site.

Documentation: https://fintable.io/docs#stock-price

## Run
No packages, API credentials, or build step are required. Open `stock-compare/index.html` in a current browser with internet access, or run a local preview from the website root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8765/stock-compare/ . Python 3 is only needed for this optional preview server. On GitHub Pages the intended URL is https://guptaveer00.github.io/website/stock-compare/ . The portfolio projects section links directly to the game.

## Use the comparison tool
- Enter two different ticker symbols (for example, AAPL and MSFT).
- Select a date range up to 366 days, ending before today, then click Compare stocks.
- Quick buttons choose the last 30, 90, 180, or 365 calendar days and fetch the comparison.
- Move over the chart or use the keyboard-accessible date slider to inspect values.
- Download the aligned prices and normalized series as CSV.
- Switch between the portfolio's terminal and paper themes.

## Calculations and limits
- Growth of $100 = `100 * adjusted_close / first_adjusted_close`.
- Return = `(last_adjusted_close / first_adjusted_close - 1) * 100`.
- Annualized volatility = sample standard deviation of daily simple returns multiplied by `sqrt(252)`, expressed as a percentage.
- Maximum drawdown = the most negative percentage change from the prior running peak.
- Only shared dates are charted; no prices are interpolated. Fewer than three shared observations produces an error. If dates are missing in one series within the shared window, volatility is unavailable. This check cannot detect a trading day omitted by both series.
- Fintable documents split- and dividend-adjusted history. The default IEX feed represents a single exchange, not consolidated prices or total market volume. Displayed source dates identify the observations; these are not live trading quotes.
- Missing history, invalid symbols, rate limits, timeouts, and network errors produce messages. No synthetic stock data is substituted.
- Successful requests are cached in memory for five minutes. There is no background polling. Reloading clears the cache.
- This is a historical educational comparison, excluding taxes and fees; it does not predict performance or recommend investments.

## Code guide
- `index.html`: game home, settings, rounds, answer reveal, and final scorecard.
- `compare.html`: comparison inputs, chart region, metrics, methodology, and source attribution.
- `game-core.js` and `game-core.test.cjs`: company selection, scoring, and tests for unique companies and streaks.
- `game.js` and `game.css`: game flow, API requests, chart reveals, and responsive styling.
- `style.css`: responsive layout, using the portfolio's existing colors and typography.
- `app.js`: validation, API requests, cache, error messages, SVG chart, slider, and CSV export.
- `analytics.js`: pure normalization, date alignment, and statistical calculations.
- `analytics.test.cjs`: deterministic checks for the calculation functions. Optional: run `node stock-compare/analytics.test.cjs` from the website root if Node.js is installed. Node is not required to run the website.

## AI-assisted development
Built with OpenAI Codex desktop app (GPT-6; exact variant not exposed in this task). The strategy was to verify a keyless API first, inspect actual responses, isolate the calculation functions for testing, then build the interactive UI and test failure cases. Important prompts are recorded verbatim in `prompt_log.md`.

## Verification performed
- Real AAPL and MSFT history loaded in a browser through the public API.
- Browser checks: empty ticker, unavailable ticker, date-slider readout, and mobile layout at 390px without horizontal overflow.
- Calculation tests: normalized growth, returns, maximum drawdown, sample volatility, shared dates, missing observations, sorting, duplicates, and invalid responses.
- Simulated request checks: HTTP 404/422/429/503, network failure, timeout, duplicate symbols, and reversed dates.

## Before submission
Review the explanations and be ready to explain the request and calculations. Publish and test on GitHub Pages, record a short demonstration video, check its sharing permissions, and submit the course form. The provided assignment's form URL was a placeholder, so obtain the actual link from the course.

## Latest available prices
Each comparison also calls `GET https://fintable.io/api/v2/prices?symbols=AAPL,MSFT` using the chosen tickers. Each stock card shows the returned price, feed, and observation timestamp in your local timezone. Quotes may be delayed or fall back to a close; they are separate from the historical date range and do not change the chart calculations. Quotes refresh when Compare stocks is clicked, without automatic polling. Quote failures leave the historical comparison available and mark the latest price unavailable.

# Which Stock Won?

A stock-history guessing game. Choose 3, 5, or 10 rounds, a historical return window, and either 20 tech/digital companies or 40 companies across sectors. Pick which stock had the higher percentage return between the displayed dates, reveal the chart, and finish with a scorecard.

Click a company or press 1/2 to answer. Correct picks earn 100 points plus a streak bonus of 25 per previous consecutive correct answer, capped at 100 bonus points. Both falling means the smaller loss wins; returns tied at two decimals accept either answer. Companies do not repeat within a game; replay prioritizes companies absent from the previous game while the page remains open. API failures offer retry or a replacement matchup.

The original comparison tool, including latest available quotes, remains at `compare.html`. Game files are `game.js`, `game-core.js`, and `game.css`; calculations are shared through `analytics.js`. Both tools run as static pages with no build step.


## How the API is called
The browser uses JavaScript's built-in `fetch()` to send a GET request to `https://fintable.io/api/v2/prices/{symbol}/history` for each ticker. Query parameters specify `timeframe=1day`, the `start` and `end` dates, and `limit=1000`; the request accepts JSON. The response contains a `data` object with a symbol, currency, feed, and `bars` array, whose entries include date strings, decimal-string prices, and numeric volume. The app converts closing prices into numbers, validates and sorts them, and compares only dates present in both histories. This public endpoint needs no API key or account, and its browser-access headers allow requests from a static portfolio site.

Documentation: https://fintable.io/docs#stock-price


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

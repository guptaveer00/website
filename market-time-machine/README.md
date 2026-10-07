# Market Time Machine

Market Time Machine is a web app that lets you test investment strategies using real historical market data and pretend money. You can choose a time period, divide your money between different investments, and see how your strategy would have performed.

https://website-1-xx5b.onrender.com  
## How to use it

Choose a starting month, an ending month, a starting balance, and a monthly deposit. Then divide your money between US stocks, the Nasdaq 100, bonds, gold, and cash. Your percentages must add up to 100%.

Choose a rebalancing rule and a trading cost, then click **Run the experiment**. Rebalancing means buying and selling investments to bring your portfolio back to your chosen percentages.

The app compares your strategy with holding the same investments without rebalancing and investing only in SPY, an ETF that tracks the S&P 500. You can explore the chart, inspect individual months, and view the trade history. You can also save an experiment or download its results.

## Main features

The app uses real historical prices instead of fictional data. It includes monthly deposits, trading costs, and several rebalancing rules.

It shows the final balance, net gain, annualized return, volatility, and maximum drawdown. Volatility describes how much returns fluctuate. Maximum drawdown is the largest fall from an earlier performance peak.

Another feature tests the same strategy across different starting dates. This helps show whether a strategy performed well across several periods or benefited from a particular starting date.

## How it works

The frontend uses HTML, CSS, and JavaScript. HTML creates the page, CSS controls its appearance, and JavaScript handles the buttons, forms, and charts.

When you run an experiment, the frontend sends your settings to a Python backend. The backend calculates how the investments change each month, adds deposits, applies rebalancing rules, and subtracts trading costs. It returns the results to the frontend, which displays them.

The backend uses SQLite to store saved experiment names and settings. Render hosts both the frontend and backend. My portfolio’s Projects page links to the app.

## Historical data and API use

The project uses Yahoo Finance’s chart endpoint to download historical prices for four ETFs:

- SPY represents US large-company stocks.
- QQQ tracks the Nasdaq 100.
- AGG represents US bonds.
- GLD represents gold.

The downloaded prices are saved in `data/market.json`. Simulations use this saved snapshot instead of downloading prices every time. The current snapshot covers November 2006 through September 2026.

The prices are adjusted for stock splits and distributions. The Yahoo endpoint is unofficial, so it may change or become unavailable.

The frontend also communicates with the project’s own backend API. It requests available dates, submits strategies for calculation, and saves or loads experiments.

## Running locally

You need Python 3.10 or newer. No extra Python packages are required.

Download the repository and open a terminal inside the `market-time-machine` folder. Run:

```sh
python3 backend/app.py
```

Then open **http://127.0.0.1:8766/** in your browser. Keep the terminal running while using the app. Press Control+C to stop the server.

To refresh the historical data, run this from the project folder with an internet connection:

```sh
python3 backend/market.py
```

To run the calculation tests:

```sh
cd backend
python3 -m unittest -v
```

## Secrets and saved experiments

The tested historical-data endpoint does not require an API key. No API keys are included in the frontend. Database files and `.env` files are excluded from Git, and the backend prevents visitors from downloading its database.

Saved experiments are connected to a random identifier stored in your browser. This is a simple save system rather than a full account system. Clearing browser storage loses access to those experiments.

The app uses Render Free, so saved experiments can disappear after a server restart or deployment. Download results you want to keep. The server may also take time to wake up after inactivity.

## Limitations

This app uses pretend money and does not make real trades. Historical results do not predict future performance.

The simulation uses monthly data. It does not include taxes, inflation, changes within each month, or every cost involved in real trading. Cash earns no interest.

The different historical test periods overlap, so they are not independent tests. The app also uses ETFs that still exist today, which limits how broadly its results can be interpreted.

## Testing

The calculation tests checked investment returns, drawdown, cash deposits, purchase fees, invalid inputs, and whether future prices could change earlier results.

The deployed app was also checked to confirm that the frontend loaded, simulations worked, and experiments could be saved and loaded. Invalid allocations were rejected, and database downloads were blocked. The layout was checked at a phone-sized width.

## AI use and personal contributions

Codex, a GPT-6-based assistant, helped brainstorm the expanded project and create the initial frontend, Python backend, database functionality, and tests. It also helped debug and verify the app and wrote this README draft.

Terminal tools were used to run the code and test the backend. Web search was used to check the data source. The Codex in-app browser was used to test the interface.

## Sources

Historical prices came from [Yahoo Finance’s chart endpoint](https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=20y&interval=1mo). Yahoo’s explanation of adjusted prices is available in its [adjusted-close documentation](https://in.help.yahoo.com/kb/adjusted-close-sln28256.html).


## AI-generated documentation — paper portfolio update

The new paper portfolio monitor lets you test a pretend portfolio starting at current prices. It uses Fintable, a second API, to request prices for SPY, QQQ, AGG, and GLD. These prices are separate from the Yahoo historical data. Quotes can be delayed, so their timestamps and source are shown.

### How to use the new section

Set your starting balance, allocation percentages, and trading fee in the strategy form. Scroll to **Paper portfolio monitor**, enter a name, and click **Start paper portfolio at latest prices**. Historical dates, monthly deposits, and the rebalancing schedule do not apply to this section.

The backend converts your pretend money into fractional shares after purchase costs and saves those holdings in SQLite. Return later, choose the saved portfolio, and click **Refresh valuation**. The app requests the latest available prices and calculates the portfolio's value, gain or loss, and allocation drift. Drift means how far an investment's percentage has moved from your original target.

It also previews the purchases and sales needed to restore your targets, including estimated fees. This is a preview only; it does not change holdings or place real trades. Each fresh price request records a valuation observation, which builds a chart over time. You can download a report to keep a copy.

### How the new code works

`paper.js` controls this section and displays its chart. `backend/paper.py` requests and validates Fintable prices, creates holdings, values them, and calculates the rebalancing preview. `backend/app.py` saves portfolios and observations in the database.

The frontend uses `/api/paper` to create and list portfolios and `/api/paper/value` to value them. `/api/quotes` returns validated current prices. The backend shares a 60-second price cache to reduce repeated requests. No API key was needed for the tested Fintable endpoint.

Incomplete or invalid price responses produce an error instead of invented prices. New portfolios are blocked if quotes are over 96 hours old. Refreshing an existing portfolio does not alter its saved holdings. Saved portfolios and observations can disappear after Render Free restarts, so download important results.

### Testing and AI use

All 12 calculation tests passed, including six new tests for paper holdings, allocation drift, rebalancing costs, all-cash portfolios, invalid allocations, and stale prices. Local API tests checked saving, loading, cache deduplication, and browser ownership isolation. Browser tests checked creating and reopening portfolios and the phone layout.

Codex generated this feature and this documentation. Actual prompts and development notes are in the separate `prompt_log.md`. This does not claim student-authored code contributions. The README still needs Veer's own explanation of his favorite features and actual personal edits before submission.

Current-price source: [Fintable API documentation](https://fintable.io/docs).

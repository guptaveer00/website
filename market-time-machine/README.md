# Market Time Machine

Market Time Machine lets users test investment strategies with real historical data and pretend money. Users can compare strategies across past market conditions and start a paper portfolio using current prices.

**Live app:** https://website-1-xx5b.onrender.com  
**Portfolio:** https://guptaveer00.github.io/website/projects.html

## What the App Does

The app has two main parts.

The **historical simulator** shows how a portfolio would have performed during a selected time period. Users choose their investments, monthly deposits, trading costs, and rebalancing rules.

The **paper portfolio monitor** starts a pretend portfolio at current quoted prices. Users can return later to check its value, see how its allocations have changed, and preview the trades needed to restore their original targets.

## How to Use It

### Historical Simulator

1. Choose a starting month and an ending month.
2. Enter a starting balance and monthly deposit.
3. Divide the money between stocks, bonds, gold, and cash. The percentages must total 100%.
4. Choose a rebalancing rule and trading cost.
5. Click **Run the experiment**.
6. Explore the charts, performance measurements, and trade history.
7. Save the experiment or download its results.

Rebalancing means buying and selling investments to restore the chosen percentages. For example, if stocks grow from 60% to 70% of a portfolio, rebalancing brings them back toward 60%.

The app compares the selected strategy with keeping the same investments without rebalancing and investing entirely in SPY, an ETF that tracks the S&P 500. Each comparison uses the same starting balance and monthly deposits.

### Paper Portfolio Monitor

1. Set the starting balance, investment percentages, and trading cost in the strategy form.
2. Scroll to **Paper portfolio monitor**.
3. Enter a name and click **Start paper portfolio at latest prices**.
4. Return later and select the saved portfolio.
5. Click **Refresh valuation** to check its value and allocation drift.
6. Review the rebalancing preview or download the report.

This section does not use historical dates, monthly deposits, or automatic rebalancing. Its holdings stay fixed. The rebalancing plan is a preview and does not execute trades.

The interface adapts to desktop and phone screens.

## Main Features

- Historical strategy simulation using real market prices.
- Monthly contributions, cash allocations, and trading costs.
- Quarterly, annual, allocation-drift, and buy-and-hold rules.
- Comparisons with buy-and-hold and an SPY benchmark.
- Interactive portfolio-value and drawdown charts.
- Tests across different historical starting dates.
- A ledger explaining rebalancing trades.
- Current-price paper portfolios using a second API.
- Allocation-drift calculations and fee-aware rebalancing previews.
- Database saving and downloadable results.

## Features I Am Most Proud Of

The feature I am most proud of is comparing the same strategy across different starting dates. A strategy might look successful during one period but perform poorly during another. This comparison makes the app more useful because it helps users question whether their results came from their strategy or their timing. I also like the paper portfolio monitor because it connects the historical simulator to current market prices. Users can start a pretend portfolio, return later, and see how its value and investment percentages have changed. The rebalancing preview shows what trades would restore the original allocation and how much those trades would cost.

## Understanding the Results

- **Final balance:** the portfolio’s value at the end.
- **Total deposits:** the starting balance plus monthly contributions.
- **Net gain:** the final balance minus total deposits.
- **Annualized return:** a yearly growth measurement that accounts for ongoing deposits.
- **Volatility:** how much monthly returns fluctuate.
- **Maximum drawdown:** the largest fall from an earlier performance peak.
- **Trading costs:** simulated fees paid on purchases and sales.
- **Allocation drift:** the difference between an investment’s current percentage and its target percentage.

## How the App Works

### Frontend

The frontend runs in the user’s browser.

HTML creates the page structure, CSS controls the appearance, and JavaScript handles user interactions. JavaScript sends settings to the backend and displays the returned results using charts and other interface elements.

### Backend

The backend is written in Python and hosted on Render.

It receives requests from the frontend, validates the inputs, performs calculations, and returns results as JSON. It also requests current prices and manages saved experiments.

The historical engine updates investment values month by month, adds contributions, applies rebalancing rules, and subtracts trading costs.

The paper portfolio engine converts the starting money into fractional shares at quoted prices. Later valuations multiply those saved shares by the latest available prices.

### Database

The app uses SQLite to store historical experiment settings, paper portfolio holdings, and valuation observations.

A random identifier stored in the browser connects saved records to that browser. This is a simple save system rather than a full account or login system.

## API Usage

### Yahoo Finance: Historical Prices

The historical-data script requests adjusted prices from Yahoo Finance’s chart endpoint for:

- **SPY:** US large-company stocks.
- **QQQ:** the Nasdaq 100.
- **AGG:** US bonds.
- **GLD:** gold.

The data is saved in `data/market.json`. Historical simulations use this snapshot instead of downloading prices for every experiment.

The current snapshot covers November 2006 through September 2026. The prices include adjustments for splits and distributions. The endpoint is unofficial and could change or become unavailable.

### Fintable: Current Prices

The paper portfolio monitor requests current quotes from Fintable through the Python backend.

The app shows quote timestamps because prices can be delayed and different investments can have different quote times. A shared 60-second cache reduces repeated requests.

Incomplete or invalid responses produce an error instead of invented prices. New portfolios cannot be created when quotes are more than 96 hours old.

### The App’s Own API

- `/api/health`: checks whether the backend is running.
- `/api/market`: returns available historical dates and source information.
- `/api/simulate`: calculates a historical experiment.
- `/api/experiments`: saves and loads historical experiments.
- `/api/quotes`: returns validated current prices.
- `/api/paper`: creates and lists paper portfolios.
- `/api/paper/value`: values a saved portfolio and records an observation.

## Main Files

- `index.html`: page structure and controls.
- `style.css`: styling and responsive layout.
- `app.js`: historical simulator interactions and charts.
- `paper.js`: paper portfolio interactions and charts.
- `config.js`: backend address configuration.
- `backend/app.py`: web server, API routes, and database operations.
- `backend/engine.py`: historical simulation and performance analysis.
- `backend/market.py`: historical-price downloads.
- `backend/paper.py`: current-price requests and paper portfolio calculations.
- `backend/test_engine.py`: historical calculation tests.
- `backend/test_paper.py`: paper portfolio tests.
- `data/market.json`: historical-data snapshot.
- `prompt_log.md`: actual prompts and development notes.

## Running Locally

Python 3.10 or newer is required. No additional Python packages are needed.

Download the repository and open a terminal inside the `market-time-machine` folder. Run:

```sh
python3 backend/app.py
```

Open http://127.0.0.1:8766/ in a browser. Keep the terminal running while using the app. Press Control+C to stop the server.

To refresh the historical-data snapshot, run:

```sh
python3 backend/market.py
```

This requires an internet connection. The paper portfolio monitor also needs internet access to request current quotes.

To run the tests:

```sh
cd backend
python3 -m unittest -v
```

## Deployment

Render hosts the frontend and Python backend together. The portfolio’s Projects page links to the Render app.

The Render settings are:

- **Runtime:** Python 3.
- **Root directory:** `market-time-machine`.
- **Build command:** `python3 --version`.
- **Start command:** `HOST=0.0.0.0 python3 backend/app.py`.

## Secrets and Data Handling

The tested Yahoo Finance and Fintable endpoints do not require API keys. No secret keys are stored in the frontend.

Database files and `.env` files are excluded from Git. The backend does not allow visitors to download its database.

Clearing browser storage loses access to that browser’s saved experiments. On Render Free, database records can disappear after a restart or deployment. Users should download important results.

The app uses pretend money and does not connect to brokerage accounts or place real trades.


## Limitations

Historical results do not predict future performance.

The historical simulator uses monthly observations. It does not model every change within a month, taxes, inflation, or every real trading cost. Cash earns no interest.

Initial purchase costs reduce the starting balance but are not included in the annualized return measured afterward.

The historical comparison periods overlap, so they are not independent tests. Selecting ETFs that still exist today also limits how broadly the results can be interpreted.

The paper monitor uses quoted prices that may be delayed. It does not automatically rebalance, add monthly deposits, or adjust saved holdings for future corporate actions such as stock splits.

Render Free may take time to wake up after inactivity, and its database storage is not permanent.

## My Personal Contributions and Learning

I helped shape the project’s direction by asking for a more substantial version of the original Market Time Machine idea. I then requested a second API and a current-price feature to expand the app beyond historical simulations. I also configured the Render web service and initiated its deployment.

Working on this project helped me understand how the frontend, backend, API, and database fit together. The frontend collects inputs and displays results. The Python backend performs calculations and requests prices. The database stores experiments so users can revisit them.

## AI Use

Codex, a GPT-6-based assistant, helped brainstorm the expanded project and generated the initial frontend, Python backend, database functionality, and tests. It also helped debug the app and prepare documentation.

Terminal tools were used to run code and test the backend. Web search checked data-provider documentation. The Codex in-app browser was used to test the interface.

- [Yahoo Finance adjusted-close explanation](https://in.help.yahoo.com/kb/adjusted-close-sln28256.html)
- [Example Yahoo Finance historical-data endpoint](https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=20y&interval=1mo)
- [Fintable API documentation](https://fintable.io/docs)

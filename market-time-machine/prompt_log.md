# Actual prompt log — Market Time Machine

## Tools and model
Codex, a GPT-6-based assistant: initial implementation and calculation tests. Terminal: inspect Git status, run Python, fetch data, and test API/database behavior. Web search: check source methodology. Codex in-app browser: exercise interface and inspect results. 

1: Read the assignment I pasted and turn it into a practical checklist for this project. Separate the technical requirements from the documentation and submission requirements. Explain everything in simple language. Do not start coding yet, and do not assume that creating a working app alone completes the assignment.

2: My TA said the original Market Time Machine demo was too simple and similar in complexity to my previous projects. Critique the idea honestly. What would make it a substantially different project rather than the same demo with more buttons or better styling? Suggest a clear central question the app could help users answer.

3: Make an MVP plan for about eight hours of focused work. I am a beginner, so keep the stack and code understandable. Include real data, a Python backend, meaningful analysis, and saving experiments. Tell me what to leave out so that the core app can be completed and tested.

4: Before building, explain how we will work together so I understand the code. After each major feature, explain the important function and give me a small task I can do myself. Keep actual prompts separate from summaries. Never claim I wrote code that you generated, and do not push or deploy without my instruction.

5: My portfolio repository is at /Users/veergupta/Desktop/VeerWebsite. Inspect its Git status, current branch, and existing project folders before changing anything. The Codex working directory may be different. Create this project in its own folder and preserve unrelated files and the old standalone demo.

6: Find a free source of historical prices for SPY, QQQ, AGG, and GLD. Check documentation and make a small real request before choosing it. Explain whether prices are adjusted for splits and distributions, whether a key is required, and whether the endpoint is officially supported. Do not use fictional fallback data or enable billing.

7: Write a Python script that downloads the four ETF histories and saves a data snapshot. Keep only months available for every ETF and exclude the current incomplete month. Store the provider and retrieval time. If downloading fails, preserve the existing snapshot rather than replacing it with incomplete or invented data.

8: Implement the simplest historical simulation first. Start with a balance and target percentages, then update each investment using the ratio between consecutive monthly prices. Add monthly contributions starting in the second observation. Explain the calculations with a small numerical example before adding rebalancing or charts.

9: Add buy-and-hold, every-three-months, every-twelve-months, and allocation-drift rebalancing. Define exactly when each rule runs relative to the selected starting month. For the drift rule, use a difference greater than five percentage points. Explain percentage points with an example and make sure the rule never uses future prices.

10: Add trading costs in basis points on both purchases and sales. Fees must reduce the portfolio, including the initial purchase. When rebalancing, make sure the target allocation is calculated after fees so the trades are affordable. Explain how you verify that the money spent, money remaining, and fees add up correctly.

11: Compare the selected strategy with buy-and-hold using the same starting allocation and with an all-SPY benchmark. Give every portfolio the same initial balance, monthly contributions, dates, and trading-cost assumptions. Explain what changes between the comparisons and what stays constant.

12: Add final balance, total deposits, net gain, annualized return, volatility, and maximum drawdown. Do not treat monthly deposits as investment profits. Explain how deposits affect each measurement, and document any simplifications such as how the initial trading fee is handled.

13: Run the same strategy over multiple historical periods with the same duration, shifting the start by twelve months. Compare annualized strategy and benchmark returns for each period. Explain why overlapping periods do not count as independent evidence and do not describe this as proof of future performance.

14: Create Python API routes for health checks, available historical dates, and running simulations. The frontend should send settings as JSON. Validate allocations, dates, balances, fees, and contribution amounts. Return helpful errors, and do not expose backend files or database files through the web server.

15: Build the frontend around one clear workflow: enter settings, run the experiment, then inspect results. Use simple labels and explain unfamiliar terms like basis points. Make allocation totals visible, show progress while requests run, and display errors without clearing the user's inputs. Keep the layout usable on a phone.

16: Add an SVG comparison chart, a switch between portfolio value and drawdown, and a slider for inspecting individual months. Keep strategy colors consistent. Also show a trade ledger explaining when rebalancing happened and what was bought or sold. Make the chart understandable even when portfolios have similar values.

17: Add SQLite saving for named experiment settings. Let users select a saved experiment and rerun it. Keep saves associated with the current browser without adding a full account system. Explain what happens when browser storage is cleared and what happens to SQLite files on free hosting.

18: Write meaningful tests for known returns, a known drawdown, an all-cash portfolio, monthly deposits, initial purchase fees, invalid weights, and invalid dates. Also test that changing a future price cannot alter an earlier result. Explain what each test protects against and report failures before changing the expected answers.

19: Walk me through the preset allocation code. I want to make a meaningful change myself by adding a defensive preset with thirty percent SPY, ten percent QQQ, forty percent AGG, ten percent GLD, and ten percent cash. Show me where to edit and explain the structure, but let me make the change. Then help me test it.

20: The project still needs more depth. Add a second API feature that uses current prices for something more useful than displaying a stock quote. Connect it to the investing strategy idea. Keep it free, and explain how it differs from the previous stock comparison game.

21: Check Fintable's current documentation and test quotes for the four ETFs before using it. Request prices through the backend. Validate prices, currencies, and timestamps; handle missing symbols; and show the source and quote times. Do not label delayed quotes as guaranteed real-time prices.

22: Create paper portfolios using current quoted prices and fractional shares after opening costs. Save their holdings, target percentages, and trading fee in SQLite. Do not reuse historical adjusted-price model units as current shares. Explain why those two kinds of data must remain separate.

23: Add a refresh action that values the saved shares, calculates gains and allocation drift, and previews trades needed to restore the original targets after fees. Record valuation observations and chart them. Make clear that refresh does not trade, that the plan is only a preview, and that immediate refreshes may show no price change.

24: Test both parts end to end, including creating and reopening portfolios, invalid inputs, unavailable quote responses, ownership isolation, and phone layouts. If anything fails, show the evidence, explain the cause, fix it, and verify again. Help me write an honest account of one real AI mistake rather than inventing one for the assignment.

25: Review the assignment checklist before publishing. Help me prepare a README that I will rewrite in my own words and keep the actual prompt log separate. Inspect Git changes, preserve any newer remote edits, and push only when I authorize it. Verify the deployed version, add the portfolio link

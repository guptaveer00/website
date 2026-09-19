# Which Stock Won? / Stock Compare — prompt log

Tool: OpenAI Codex desktop app.
Model: GPT-6; the exact variant was not exposed in this task.

API investigation
Investigate Fintable’s stock-price API for a finance project on my portfolio. Before coding, verify its official documentation, whether the relevant endpoints require authentication, and whether browser requests work from GitHub Pages. Test one historical-price request and explain the response fields, data limitations, and possible errors. Do not assume that an endpoint is keyless just because its documentation is publicly accessible.

2. Project structure and first version
Build a stock comparison feature inside a separate stock-compare/ folder in my existing portfolio. Use plain HTML, CSS, and JavaScript with no server or build step. Match the portfolio’s theme and leave unrelated files unchanged. Let visitors select two stock symbols and a historical date range. Display their percentage returns and a chart showing what an initial $100 would have become for each stock.

3. Data accuracy
Calculate each stock’s percentage return as (ending price / starting price - 1) * 100. Compare both stocks using the same shared trading dates, and display the actual dates used. Validate the API response before calculating results. Show a helpful error if there is insufficient data; do not substitute invented prices. Identify the data provider and explain whether the prices are adjusted or delayed.

4. Convert the feature into a game
Turn the main page into a game called “Which Stock Won?” Keep the comparison tool accessible on a separate page. Create a home screen with a Start Game button, a choice of 3, 5, or 10 rounds, historical windows of approximately one month, three months, or one year, and a stock-category selector. Each round should show two companies and exact comparison dates, then ask which stock had the higher percentage return. Hide the returns and chart until the player answers.

5. Scoring and answer feedback
Award 100 points for a correct answer. Add a streak bonus of 25 points for each previous consecutive correct answer, capped at 100 bonus points per round. Reset the streak after an incorrect answer. If both stocks declined, the smaller percentage loss wins. If their displayed returns tie at two decimal places, accept either choice. Prevent multiple clicks from scoring the same round more than once.

6. Company variety
Expand the selection to 40 companies across different sectors, with a separate pool of 20 technology and digital businesses. Select companies without replacement so none appears twice within a game, including a 10-round game. On replay, prioritize companies absent from the previous game where the pool allows it. Keep a retry or replacement option for matchups whose data cannot be loaded.

7. Finish screen and usability
After the last round, show the total score, number of correct answers, best streak, and a recap of every matchup with dates, both returns, the player’s choice, and the winner. Include Play Again and Change Options buttons. Support keyboard selection with 1 and 2, visible focus indicators, and a mobile layout without horizontal scrolling. Show loading and error states while API requests are pending.

8. Testing and publication
Test the return calculations, negative-return comparisons, ties, streak bonuses, and company-selection rules. Play through a complete game in the browser and verify that replay resets the score. Check the mobile layout and browser console. Add the game to my portfolio’s Projects section, use relative asset paths compatible with GitHub Pages, and verify that the published portfolio link opens a working game.

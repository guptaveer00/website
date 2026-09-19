# Which Stock Won? / Stock Compare — prompt log

Tool: OpenAI Codex desktop app.
Model: GPT-6; the exact variant was not exposed in this task.

The following are the actual user prompts that selected the project and authorized its implementation. The full assignment was supplied separately. The assistant proposed the stock-comparison concept, researched the API, and made implementation decisions; the prompts below have not been expanded to invent a more detailed user request.

## Portfolio integration

i wanna add a feature on my website

## Subject

fiaince/economics, stock related would be cool

## API investigation

yes continue

## Implementation location

yes continue, u are going to write the code in my vsc code right?

## Approval to build

perfect

## Development context (assistant-written notes, not verbatim prompts)
The assistant proposed comparing two stock tickers using a normalized $100 chart, returns, and volatility. It verified Fintable's documentation and tested real keyless requests with cross-origin access before implementation. The feature uses a separate stock-compare folder with a portfolio Projects link, calculation tests, error handling, and source attribution. At the time of this initial development note, it had not been pushed or published. Publication was completed later, as recorded below.

## Heading change

instead of Two stocks. One starting line., just write a simple stock compare using API or somehting

## Latest prices

wait change the stock cpmaure to show the current price of the stocks as well


## Game conversion (verbatim user prompt)

is needs to be a game ish thing, so can u make it something like which stock is up higher percentage from this date, or if u have a better idea for a game verison do that. make sure theres like a home scnree to press start game with some options and then a whlle game thing, and the finsih

## Company variety (verbatim user prompt)

make it so the same comapnies dont come over and over again


## Available assistant replies (verbatim)

These are the assistant replies available in the retained conversation for the game development and publication steps. This is not a complete transcript: earlier assistant replies are not available verbatim and have not been reconstructed. The development-context paragraph above is a summary, not a quotation.

### Assistant — game plan

I’ll turn it into a “Which Stock Won?” game: a home screen with round and date-range options, a percentage-return guessing round, a chart reveal after each answer, and a final score screen. I’ll keep the comparison tool available from the menu.

### Assistant — game progress

The home screen is in place with 3, 5, or 10 rounds, a return window, and tech-only or mixed-sector stocks. I’m building the round flow now. Each round will show the exact comparison dates before you guess, then reveal the returns—including cases where both stocks lost value.

### Assistant — testing

The game is loading real stock history and correctly handles rounds where both stocks fell. I’m checking the full three-round flow, final score, and mobile layout now.

### Assistant — company variety

I’ll expand the company pool and prevent repeats within a game whenever there are enough companies for the selected number of rounds.

### Assistant — completed game

Done—expanded to **40 companies** across sectors, plus a 20-company tech option.

- No company repeats within a game.
- Replay favors companies you haven’t just seen.
- Home options, answer reveals, charts, scoring, and final recap are working.

Tested a full three-round game and mobile layout. Refresh the preview to play. Changes are local, not pushed.

## Publication exchange (verbatim)

### User

can u push this code and readme and everything to github, and make sure i can acesss the game from my website/portfolio

### Assistant

I’ll check the changes and portfolio link, push them to GitHub, then verify the live game.

### Assistant

The tests pass and the portfolio link is in place. GitHub has newer commits than your local copy, so I’ll preserve those changes before pushing. The sandbox also blocked access to Git’s metadata folder; I’m requesting access to that specific folder.

### Assistant

The push succeeded, and the new game entry is live in your portfolio’s Projects section. I’m checking that its link opens the game and loads a stock matchup on GitHub Pages.

### Assistant

Pushed everything to GitHub, including the game, README, prompt log, and portfolio entry.

- [Play the game](https://guptaveer00.github.io/website/stock-compare/)
- [Portfolio Projects section](https://guptaveer00.github.io/website/projects.html)

Verified the portfolio link and tested real stock data, scoring, and chart reveals on the live site.

## Prompt-log update (verbatim)

### User

to the prompt log i add where including what u said

### Assistant

I’ll add the available assistant replies to the prompt log, labeled separately from your prompts, and keep the wording verbatim.

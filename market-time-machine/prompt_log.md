# Actual prompt log — Market Time Machine

## Tools and model
Codex, a GPT-6-based assistant: initial implementation and calculation tests. Terminal: inspect Git status, run Python, fetch data, and test API/database behavior. Web search: check source methodology. Codex in-app browser: exercise interface and inspect results. Veer should add his reasoning for tool choices in his own words; exact model variant was not exposed in the session.

## Actual user prompts, in order
These are verbatim excerpts of complete project-related user messages from this chat, not retrospective invented examples. The original assignment and previous-context message preceded them.

1.
> in a couple setnence explain what this project wants and then brainstorm ideas

2.
> build on the market time machine, it was just too simple and they second too similar complexity wise to the previous projects, but take that idea and make it complex what do u think

3.
> and will there be api use and stuff, and be complex enough for the porject 2 requiremnts i gave u?

4.
> okay make this for me

## Development record — October 7, 2026
The assistant inspected the real portfolio repository; Git status was clean. It created a separate `market-time-machine` folder and preserved the old fictional demo and existing projects. A Yahoo API request was tested, then four ETF histories were downloaded and cached. Python implements the simulator and SQLite save API; vanilla JavaScript implements the interface and SVG chart. Six calculation tests passed; HTTP simulation, database save/reload, and blocked database download were verified. A browser simulation displayed results without console errors.

This records one initial implementation session. It does not claim eight hours of student work or sustained work over ten days. No student-authored code contribution has been recorded yet. Add actual later prompts, time spent, meaningful personal edits, and observations as they occur.

## One AI mistake — to complete honestly
No qualifying confidently incorrect tool proposal or unresolved AI bug has been recorded yet. Do not invent one. Record a real occurrence during further development, what went wrong, and how Veer addressed it.

## Veer's own contributions — pending
Add the actual files, changes, and explanation after making meaningful edits personally. AI-generated work above must not be attributed to Veer.

## Additional actual prompts — Render preparation

> there needs to be a backend, so on render i made a new environemnt called project 2, which one should i choose,

> what should be the **Start Command**

> okay i inputed all of those, do whatever needs to be done beflore tell me when done ill press deploy

The user selected Render Web Service and authorized preparing and pushing the project before manually deploying. The assistant increased request timeout to 90 seconds for potential free-host cold starts, clarified that ephemeral SQLite saves can disappear, and verified startup with Render-style host/port settings. No database, browser token, or API secret is committed.

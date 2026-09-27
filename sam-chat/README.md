# Sam Altman AI Chat — frontend

An explicitly unofficial AI simulation, powered by a separate Flask backend and Google Gemini. Static HTML/CSS/JavaScript; no build step. Backend project: `/Users/veergupta/Desktop/sam-chat-backend`.

Set the production backend URL in `config.js` after Render deployment. Never put an API key in this folder. Localhost automatically uses `http://127.0.0.1:5050`. Run the portfolio preview on port 8765 and open `/sam-chat/`.

The form posts `{message, history}` to `/chat`, displays `{reply}`, and handles `{error}`. Only recent complete turns are sent. Failed requests restore the message, and New chat clears local history. Text is rendered with `textContent`, not HTML. The UI discloses that Gemini's free tier may use content to improve Google products.

Deployment is not complete until config.js contains the real Render URL and a real API request succeeds from GitHub Pages. Follow the backend README for setup, environment variables, free-tier constraints, and tests.

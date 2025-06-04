# AI Animator App

This project demonstrates a simple Leonardo AI and ChatGPT integration.

## Setup
1. Copy `server/.env.example` to `server/.env` and fill in your API keys.
2. Install dependencies for both `client` and `server`:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```
4. Start the frontend in another terminal:
   ```bash
   cd client && npm run dev
   ```

## Using the Prompt Studio
1. Open `http://localhost:5173/studio` in your browser.
2. You will see two steps at the top: **Setup** and **Generate**.
3. In **Setup**, choose a hero, optionally upload a product image and pick the
desired platform (YouTube, Instagram or TikTok). Click **Continue**.
4. In **Generate**, enter a prompt and select `Story (ChatGPT)` from the type
dropdown to produce a short script. You can also generate images via Leonardo AI.
5. Click **Generate** to start. The story will appear in the results panel.

The API key for ChatGPT is read from `OPENAI_API_KEY` in the server environment.

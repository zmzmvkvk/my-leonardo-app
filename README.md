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

When you open a project in the dashboard, you will first land on the **Setup**
tab where you choose a hero, optional product image and channel. Hitting the
**Story AI Generation** button saves these settings to Firebase and unlocks the
Story Creation tab.

## Using the Prompt Studio
1. Open `http://localhost:5173/studio` in your browser.
2. The studio now jumps directly to the generation tools. Enter a prompt and select `Story (ChatGPT)` or choose image generation.
3. Click **Generate** to start and the result will appear in the panel.

The API key for ChatGPT is read from `OPENAI_API_KEY` in the server environment.

# Deploying Floatify to Vercel

Your project is now configured to deploy to Vercel with a Python backend!

## Prerequisites
- A [Vercel account](https://vercel.com/signup).
- [Vercel CLI](https://vercel.com/docs/cli) installed (`npm i -g vercel`) OR you can deploy via GitHub.

## Deployment Steps

### Option 1: Deploy via CLI (Recommended for first time)
1.  Open your terminal in the project folder.
2.  Run the deploy command:
    ```bash
    vercel
    ```
3.  Follow the prompts:
    - Set up and deploy? **Y**
    - Which scope? (Select your account)
    - Link to existing project? **N**
    - Project name? **floatify-musixmatch** (or your choice)
    - In which directory is your code located? **./** (Just press Enter)
    - Want to modify these settings? **N**

4.  Wait for the deployment to complete. You will get a Production URL (e.g., `https://floatify-musixmatch.vercel.app`).

### Option 2: Deploy via GitHub
1.  Push your code to a GitHub repository.
2.  Go to the Vercel Dashboard and click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  Vercel should automatically detect the configuration.
5.  Click **Deploy**.

## Verification
Once deployed, open your Vercel URL.
- The app should load.
- Play a song on Spotify.
- The lyrics should appear, fetched via your new serverless Python backend!

## Troubleshooting
- If you see "Lyrics not found", check the Vercel Function logs in the dashboard.
- Ensure your Spotify token is valid (re-login if needed).

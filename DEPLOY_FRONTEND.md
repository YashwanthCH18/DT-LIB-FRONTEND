# Frontend Deployment & PWA Guide

This guide covers setting up the Progressive Web App (PWA) features and deploying your Next.js frontend to Vercel.

## Part 1: Install Dependencies (PWA)

Since we added PWA support, you **MUST** install the following package in your `Frontend/my-app` directory before running or deploying.

1.  Open your terminal.
2.  Navigate to the frontend folder:
    ```bash
    cd Frontend/my-app
    ```
3.  Install `next-pwa`:
    ```bash
    npm install next-pwa
    # OR if you use yarn
    yarn add next-pwa
    ```

## Part 2: Verify PWA Locally

1.  Run the dev server:
    ```bash
    npm run dev
    ```
2.  Open `http://localhost:3000`.
3.  Open DevTools (F12) -> Application -> Manifest.
4.  You should see "Smart Library" with the icons we generated.

## Part 3: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

1.  Install Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  Run deploy from `Frontend/my-app`:
    ```bash
    vercel
    ```
3.  Follow the prompts:
    -   Set up and deploy? `y`
    -   Which scope? [Select your account]
    -   Link to existing project? `n`
    -   Project name: `smart-library-frontend`
    -   Directory: `.`
    -   Want to modify settings? `n`

### Option B: Git Integration

1.  Push your code to GitHub.
2.  Go to [Vercel Dashboard](https://vercel.com/new).
3.  Import your repository.
4.  Select `Frontend/my-app` as the Root Directory.
5.  Click **Deploy**.

## Part 4: Connect Backend

Once your backend is deployed (see `backend/DEPLOY_AWS_BACKEND.md`), you need to tell Vercel where it is.

1.  Go to your Vercel Project Dashboard -> Settings -> Environment Variables.
2.  Add a new variable:
    -   **Name**: `NEXT_PUBLIC_API_URL`
    -   **Value**: [Your AWS API Gateway URL]
3.  **Redeploy** your frontend for changes to take effect.

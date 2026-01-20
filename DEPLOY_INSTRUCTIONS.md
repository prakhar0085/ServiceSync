# Deploying ServiceSync to Render

This guide will walk you through deploying your **Backend** and **Frontend** to Render.

## Prerequisites
1.  **Push your code to GitHub**. Ensure your latest changes (including the `start` script we just added) are pushed.

## Step 1: Deploy Backend (Web Service)
The backend needs a persistent environment for the scheduler to work.

1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository (`ServiceSync`).
4.  Configure the service:
    -   **Name**: `servicesync-backend` (or similar)
    -   **Region**: Choose the one closest to you (e.g., Singapore, Frankfurt).
    -   **Branch**: `main` (or your default branch)
    -   **Root Directory**: `backend` (Important!)
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start`
    -   **Instance Type**: Free (or Starter if you need 24/7 uptime without sleep).
5.  **Environment Variables**:
    -   Scroll down to "Environment Variables" and add:
        -   `MONGO_URI`: Your MongoDB connection string.
        -   `JWT_SECRET`: Your secret key for JWT.
        -   (Optional) `PORT`: `10000` (Render sets this automatically, so you usually don't need to add this).
6.  Click **Create Web Service**.
7.  Wait for the deployment to finish. **Copy the Backend URL** (e.g., `https://servicesync-backend.onrender.com`). You will need this for the frontend.

## Step 2: Deploy Frontend (Static Site)
The frontend will be hosted as a static site.

1.  Go back to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Static Site**.
3.  Connect the same GitHub repository (`ServiceSync`).
4.  Configure the site:
    -   **Name**: `servicesync-frontend`
    -   **Branch**: `main`
    -   **Root Directory**: `frontend` (Important!)
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `dist`
5.  **Environment Variables**:
    -   Add `VITE_API_URL` and set it to your **Backend URL** from Step 1 (e.g., `https://servicesync-backend.onrender.com`).
6.  **Redirects/Rewrites** (Critical for React Router):
    -   Go to the **Redirects/Rewrites** tab (you might need to create the service first, then go to settings).
    -   Add a new rule:
        -   **Source**: `/*`
        -   **Destination**: `/index.html`
        -   **Action**: `Rewrite`
7.  Click **Create Static Site** (or Save Changes).

## Step 3: Final Configuration
1.  Once the Frontend is deployed, open the URL (e.g., `https://servicesync-frontend.onrender.com`).
2.  Test the implementation:
    -   Try signing up/logging in (connects to Backend).
    -   Check if the scheduler is running (you can see logs in the Backend dashboard "Logs" tab).

**Note on Free Tier**: The free tier on Render spins down after inactivity. The first request might take 50+ seconds.

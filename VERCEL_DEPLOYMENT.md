# Vercel Deployment Guide for Security_App

This project is fully configured to be deployed on **Vercel**. You can deploy both the React frontend and Express backend together in a **Single 1-Click Monorepo Project** (Recommended) or as **Separate Frontend & Backend Projects**.

---

## Method 1: Unified Single Vercel Project (Recommended)

In this approach, Vercel hosts both the static frontend assets and the Express serverless API under the same domain (e.g. `https://your-app.vercel.app`). This eliminates CORS issues and simplifies authentication cookies.

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure your latest changes are pushed to your Git provider repository.

### Step 2: Import Project in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your Git repository (`Security_App`).
3. Vercel will automatically detect the configuration settings from `vercel.json`.
4. Ensure the framework preset is set to **Vite** or **Other**.

### Step 3: Configure Environment Variables
In the Vercel deployment settings, expand **Environment Variables** and add:

| Key | Example / Description |
|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | `your_super_secret_jwt_key` |
| `APP_EMAIL` | `your-email@gmail.com` (for OTP sending) |
| `APP_PASSWORD` | `your-gmail-app-password` |
| `NODE_ENV` | `production` |

*(Optional)* If you want to specify a custom domain or CORS origin:
| `CLIENT_URL` | `https://your-app.vercel.app` |

### Step 4: Deploy
Click **Deploy**. Vercel will build the frontend and deploy the backend serverless endpoints automatically at `/api/*`.

---

## Method 2: Separate Frontend & Backend Projects (Dual Deployments)

If you prefer deploying the backend and frontend as two separate Vercel projects:

### Deploying the Backend (`server`)
1. In Vercel, click **Add New...** -> **Project** and import your repository.
2. Under **Root Directory**, click Edit and select `server`.
3. Add environment variables (`MONGO_URI`, `JWT_SECRET`, `APP_EMAIL`, `APP_PASSWORD`, `CLIENT_URL=https://your-frontend.vercel.app`).
4. Click **Deploy**. Note down your deployed backend URL (e.g., `https://security-api.vercel.app`).

### Deploying the Frontend (`client`)
1. In Vercel, create another project from the same repository.
2. Under **Root Directory**, click Edit and select `client`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://security-api.vercel.app/api`
4. Click **Deploy**.

---

## What was configured for Vercel:

1. **`api/index.js`**: Serverless function entry point wrapping Express & MongoDB connection.
2. **`server/src/config/initDb.js`**: Connection state caching to reuse Mongoose connections across serverless invocations.
3. **`server/src/utils/logger.js`**: Safe conditional Winston logger that disables filesystem writes in read-only serverless containers.
4. **`server/src/app.js`**: Dynamic CORS support for `.vercel.app` domain origins.
5. **`client/src/services/api.js`**: Automatic relative API URL fallback (`/api`) when running in production single-domain deployment.
6. **`vercel.json`**: Rewrites and routing rules for static SPA files and serverless API endpoints.

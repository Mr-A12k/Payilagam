# 🚀 Free Deployment Guide for TaskPro

This guide will show you how to deploy your **TaskPro** application (both the React Frontend and Node.js Backend) completely for **FREE**. 

We will use the following free services:
1. **Frontend (UI)**: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
2. **Backend (API)**: [Render](https://render.com/)
3. **Database (PostgreSQL)**: [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)

---

## 🗄️ Step 1: Set up a Free PostgreSQL Database
Since your backend uses Prisma and PostgreSQL, you need a database hosted on the internet, not just on your local computer.

1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project and a database (e.g., `taskpro_db`).
3. Neon will give you a **Connection String** (it looks like `postgresql://user:password@hostname/dbname?sslmode=require`).
4. **Copy this Connection String**, you will need it for the backend deployment!

---

## ⚙️ Step 2: Deploy the Backend (API) on Render
Render provides free hosting for Node.js web services.

### Preparation:
Ensure your code is pushed to a **GitHub repository**. 

### Deployment:
1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `TaskPro` repository.
4. Fill in the settings:
   - **Name**: `taskpro-backend`
   - **Root Directory**: `BackEnd` *(Important! Since your repo has a BackEnd folder)*
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start` (Make sure your `package.json` has `"start": "node src/app.js"`)
   - **Instance Type**: Select **Free**.
5. Scroll down to **Environment Variables** and add your secrets from your `.env` file:
   - `DATABASE_URL`: *(Paste the Neon Connection String here!)*
   - `JWT_SECRET`: `your_super_secret_jwt_key`
   - `PORT`: `5000`
   - `FRONTEND_URL`: *(Leave blank for now, we will update it after deploying the UI)*
6. Click **Create Web Service**. 
7. Render will build and deploy your API. Once finished, copy the **Render URL** (e.g., `https://taskpro-backend.onrender.com`).

*(Note: Free Render services go to sleep after 15 minutes of inactivity, so the first API request after a while might take 30-50 seconds to wake up).*

---

## 🎨 Step 3: Deploy the Frontend (UI) on Vercel
Vercel is incredibly fast and optimized for React/Vite applications.

### Deployment:
1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your `TaskPro` repository.
4. Configure the project:
   - **Project Name**: `taskpro-ui`
   - **Root Directory**: Click `Edit` and select `FrontEnd`.
   - **Framework Preset**: Vercel should auto-detect **Vite**.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Open the **Environment Variables** tab and add:
   - `VITE_API_URL`: *(Paste your Render backend URL here! e.g., `https://taskpro-backend.onrender.com/api`)*
6. Click **Deploy**.
7. Vercel will build your frontend. Once done, you will get a live `.vercel.app` URL!

---

## 🔗 Step 4: Final Connection (CORS)
Now that your Frontend is live, your Backend needs to know it's allowed to accept requests from it!

1. Copy your new Vercel URL (e.g., `https://taskpro-ui.vercel.app`).
2. Go back to your **Render Backend Dashboard**.
3. Go to **Environment Variables**.
4. Update the `FRONTEND_URL` variable with your Vercel URL.
5. Save changes (Render will automatically redeploy the backend with the new allowed CORS origin).

---

## 🎉 Congratulations!
Your Full-Stack application is now completely live on the internet for free! 
- You can access your app from your **Vercel URL**.
- Your interactive Swagger API docs are live at `https://your-backend-url.onrender.com/api-docs`!

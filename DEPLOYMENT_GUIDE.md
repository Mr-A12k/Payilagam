# 🚀 Free Deployment Guide for Karkalam (கற்களம்)

This guide will show you how to deploy your **Karkalam** application (both the React Frontend and Node.js Backend) completely for **FREE**. 

We will use the following free services:
1. **Frontend (UI)**: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
2. **Backend (API)**: [Render](https://render.com/)
3. **Database (PostgreSQL)**: [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)

---

## 🗄️ Step 1: Set up a Free PostgreSQL Database
Since your backend uses Prisma and PostgreSQL, you need a database hosted on the internet, not just on your local computer.

1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project and a database (e.g., `karkalam_db`).
3. Neon will give you a **Connection String** (it looks like `postgresql://user:password@hostname/dbname?sslmode=require`).
4. **Copy this Connection String**, you will need it for the backend deployment!

---

## ⚙️ Step 2: Deploy the Backend (API) on Render
Render provides free hosting for Node.js web services.

### Preparation:
Ensure your code is pushed to your **GitHub repository**. 

### Deployment:
1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.
4. Fill in the settings:
   - **Name**: `karkalam-backend`
   - **Root Directory**: `BackEnd` *(Important! Since your repo has a BackEnd folder)*
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start` (Runs `node src/server.js`)
   - **Instance Type**: Select **Free**.
5. Scroll down to **Environment Variables** and add:
   - `DATABASE_URL`: `postgresql://USER:PASSWORD@HOST/DB?sslmode=require` *(From Neon.tech or Supabase)*
   - `JWT_SECRET`: `your_super_secret_production_jwt_key_random_string`
   - `FRONTEND_URL`: `https://karkalam-ui.vercel.app,http://localhost:5173` *(Paste your Vercel URL once generated)*
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. 
7. Render will build and deploy your API. Once finished, copy the **Render URL** (e.g., `https://karkalam-backend.onrender.com`).

*(Note: Free Render services spin down after 15 minutes of inactivity; the first API request after sleep takes ~30-50 seconds to wake up).*

---

## 🎨 Step 3: Deploy the Frontend (UI) on Vercel
Vercel is optimized for React/Vite applications.

### Deployment:
1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your repository.
4. Configure the project:
   - **Project Name**: `karkalam-ui`
   - **Root Directory**: Click `Edit` and select `FrontEnd`.
   - **Framework Preset**: Vercel auto-detects **Vite**.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Open the **Environment Variables** tab and add:
   - `VITE_API_URL`: `https://karkalam-backend.onrender.com/api` *(Your Render backend URL with `/api` at the end)*
6. Click **Deploy**.
7. Vercel will build your frontend and give you a live `.vercel.app` URL!

---

## 🔗 Step 4: Final Connection (CORS Setup)
1. Copy your live Vercel URL (e.g., `https://karkalam-ui.vercel.app`).
2. Go back to your **Render Backend Dashboard** -> **Environment Variables**.
3. Set or update `FRONTEND_URL` to include your Vercel URL:
   `https://karkalam-ui.vercel.app,http://localhost:5173`
4. Save changes (Render will automatically redeploy with CORS permissions).

---

## 🎉 Congratulations!
Your Full-Stack application is live! 
- Access the web app at your **Vercel URL** (e.g. `https://karkalam-ui.vercel.app`).
- Access your interactive Swagger API docs at `https://your-backend-url.onrender.com/api-docs`!

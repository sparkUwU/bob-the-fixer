# Free Server Hosting Walkthrough: SecureBank Dashboard & Backend

This walkthrough summarizes the completed implementation for hosting the **SecureBank Autonomous DevSecOps Dashboard & Backend API** for free on **Render.com**.

---

## 🛠️ Changes Implemented

### 1. Updated Backend API for Production & Static UI Serving
- **File**: [`dashboard/server.py`](file:///d:/0.CS%20PROJECTS/HACKATHONS/IBM%20BOB%202.0/dashboard/server.py)
  - Configured Flask to serve compiled Vite frontend static assets from `dashboard/dist`.
  - Added SPA fallback routing for client-side navigation (`/findings`, `/architecture`, `/pipeline`, `/evidence`, `/impact`, `/overview`).
  - Added dynamic `$PORT` environment variable support for cloud host compatibility (e.g. Render).
  - Set host binding to `0.0.0.0` for public network accessibility.

### 2. Added Production WSGI Server Dependency
- **File**: [`dashboard/requirements.txt`](file:///d:/0.CS%20PROJECTS/HACKATHONS/IBM%20BOB%202.0/dashboard/requirements.txt)
  - Added `gunicorn` for production-grade Python deployment.

### 3. Created Render Blueprint Infrastructure Configuration
- **File**: [`render.yaml`](file:///d:/0.CS%20PROJECTS/HACKATHONS/IBM%20BOB%202.0/render.yaml)
  - Defined automatic blueprint configuration for Render Web Service:
    - **Build Command**: `cd dashboard && npm install && npm run build && pip install -r requirements.txt`
    - **Start Command**: `gunicorn --chdir dashboard server:app --bind 0.0.0.0:$PORT`
    - **Plan**: `free`

---

## ✅ Local Verification Results

1. **Frontend Production Build**:
   - Command: `npm run build` inside `dashboard/`
   - Result: Successfully compiled TypeScript and bundled assets into `dist/`.

2. **HTTP Route & Static File Verification**:
   - `GET /` -> `200 OK` (Serves `dist/index.html`)
   - `GET /findings` -> `200 OK` (SPA route fallback to `dist/index.html`)
   - `GET /assets/index-BIRi1EIP.js` -> `200 OK` (Serves production JS bundle)
   - `GET /api/health` -> `200 OK` (`{"ok": true, "target_running": true}`)

---

## 🚀 How to Deploy to Render.com (100% Free)

Follow these simple steps to put your application live on the web:

1. **Push Changes to GitHub**:
   ```bash
   git add .
   git commit -m "Configure free hosting on Render.com with unified static UI & API"
   git push origin feature/newUI-arena
   ```

2. **Deploy on Render**:
   - Sign up / Log in to [Render.com](https://render.com).
   - Click **New +** > **Blueprint** (or **Web Service**).
   - Connect your GitHub repository `sparkUwU/bob-the-fixer`.
   - Render will automatically detect `render.yaml` and configure the Web Service on the **Free Plan** ($0/month).
   - Click **Apply** / **Create Web Service**.

3. **Your Live URL**:
   Once Render finishes building, your app will be live at a public HTTPS URL like:
   `https://securebank-dashboard.onrender.com`

---

> [!NOTE]
> Render's free tier automatically sleeps after 15 minutes of inactivity. The first visit after sleep takes ~30–50 seconds to start (cold start), after which it runs smoothly.

# SecureBank Dashboard

Demonstration interface for the **Adversarial DevSecOps Pipeline** (IBM Bob 2.0 Hackathon).

## Architecture

```
Browser (React/Vite)  →  Backend API (Flask)  →  Pipeline + Artifacts
      :5173                    :5050
```

## Start

### 1. Install backend dependencies (once)
```bash
pip install flask flask-cors
```

### 2. Install frontend dependencies (once)
```bash
cd dashboard
npm install
```

### 3. Start both services

**Option A — PowerShell script (recommended)**
```powershell
.\dashboard\start.ps1
```

**Option B — Two separate terminals**

Terminal 1 (backend):
```bash
python dashboard/server.py
```

Terminal 2 (frontend):
```bash
cd dashboard
npm run dev
```

### 4. Open the dashboard
```
http://localhost:5173
```

## Prerequisites

- SecureBank target application must be running at `http://127.0.0.1:3000` for Live Pipeline to work
- Python 3.9+
- Node.js 18+

## Pages

| Page | Description |
|------|-------------|
| Overview | Problem statement, solution flow, human control |
| Live Pipeline | Run the pipeline, monitor stages in real time |
| Findings | All vulnerabilities with lifecycle tracking |
| Evidence | Artifact chain viewer and inspector |
| Impact | Before/After, metrics, manual vs autonomous comparison |
| Architecture | Agent detail cards, parallel architecture diagram |
| Demo Mode | Guided 16-step presentation for hackathon judges |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Target app health check |
| GET | `/api/pipeline/status` | Current pipeline state |
| POST | `/api/pipeline/run` | Start the pipeline |
| GET | `/api/pipeline/log` | SSE live log stream |
| GET | `/api/findings` | All vulnerability bundles |
| GET | `/api/findings/:id` | Single finding |
| GET | `/api/artifacts` | Allowlisted artifact list |
| GET | `/api/artifacts/:id` | Read a single artifact |
| GET | `/api/metrics` | Pipeline run metrics |

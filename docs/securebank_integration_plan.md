# SecureBank Target Application Integration & Phase 3 Execution Plan

## 1. Executive Summary
This document outlines the step-by-step execution strategy for integrating the incoming **SecureBank** target application into the **Adversarial DevSecOps** autonomous pipeline.

Once the teammate provides the `SecureBank` codebase, the pipeline will expand from the current 2-vulnerability mock server prototype to a full 5-vector autonomous Red vs Blue security engineering loop.

---

## 2. Phase Breakdown & Execution Sequence

```
                                  INCOMING SECUREBANK APP
                                             │
                                             ▼
                             ┌──────────────────────────────┐
                             │ PHASE 1: TARGET INTEGRATION  │
                             │  • Docker containerization   │
                             │  • Endpoint map discovery    │
                             └───────────────┬──────────────┘
                                             │
                                             ▼
                             ┌──────────────────────────────┐
                             │ PHASE 2: 5-VECTOR RED TEAM   │
                             │  • IDOR, SQLi, XSS, Upload,  │
                             │    Admin Auth attack agents  │
                             └───────────────┬──────────────┘
                                             │
                                             ▼
                             ┌──────────────────────────────┐
                             │ PHASE 3: SECURITY JUDGE      │
                             │  • Multi-part payload replay │
                             │  • Proof verification        │
                             └───────────────┬──────────────┘
                                             │
                                             ▼
                             ┌──────────────────────────────┐
                             │ PHASE 4: DIRECT CODE PATCH   │
                             │  • In-place controller diffs  │
                             │  • Regression test generation│
                             └───────────────┬──────────────┘
                                             │
                                             ▼
                             ┌──────────────────────────────┐
                             │ PHASE 5: BOB 2.0 & DASHBOARD │
                             │  • Multi-agent orchestration │
                             │  • Real-time visual UI       │
                             └──────────────────────────────┘
```

---

## 3. Detailed Component Plan

### Step 1: SecureBank App Integration (`target-app/`)
1. Place teammate's codebase in `target-app/`.
2. Configure `docker-compose.yml` or local launch scripts.
3. Update `pipeline_runner.py` target URL to point to `http://localhost:5000` or `http://localhost:3000`.

### Step 2: 5-Vector Vulnerability Coverage
Expand attack agents to handle all 5 seeded vulnerabilities:

1. **VULN-001 (BOLA / IDOR)**: `/api/transactions/:id` and `/api/users/:id`
2. **VULN-002 (SQL Injection)**: `/api/transactions/search?q=`
3. **VULN-003 (Stored XSS)**: Transfer memo rendering in `/api/transfers`
4. **VULN-004 (Unsafe File Upload)**: Profile picture upload in `/api/profile/upload`
5. **VULN-005 (Broken Admin Auth)**: Admin management routes in `/api/admin/users`

### Step 3: Direct Source Code Patching Engine
Upgrade `blue_team/patches/patch_agent.py` to perform AST or regex replacement directly on SecureBank controller files:
- **IDOR Fix**: Inject `if resource.owner_id != current_user_id: return 403`
- **SQLi Fix**: Replace string concatenation with parameterized SQL queries.
- **XSS Fix**: HTML escape rendered transaction notes.
- **File Upload Fix**: Whitelist file extensions (`.jpg`, `.png`) and store outside execution root.
- **Admin Auth Fix**: Add `require_admin()` middleware to admin endpoints.

### Step 4: IBM Bob 2.0 Orchestrator & Multi-Agent Parallelization
- Enable parallel agent execution for Red Team recon and exploit generation.
- Track Bobcoin consumption (target: ~25-30 Bobcoins).
- Export automated executive security reports (`docs/security_report.md`).

### Step 5: Real-Time Visualization Dashboard
- Construct `dashboard/index.html` presenting live round counters, active vulnerabilities, judge verdicts, patch diffs, and verification metrics.

---

## 4. Verification & Criteria for Success
- [ ] SecureBank boots via Docker/local server.
- [ ] Red Team discovers and exploits all 5 vulnerabilities.
- [ ] Security Judge validates findings and rejects false claims.
- [ ] Blue Team generates clean code diffs fixing all 5 vulnerabilities.
- [ ] Verifier proves original exploits are blocked and existing app tests pass.
- [ ] Adaptive Red Team checks alternative attack paths.
- [ ] Final security audit report generated automatically.

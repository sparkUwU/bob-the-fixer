# Antigravity Build Plan: SecureBank

## Phased Construction of an Intentionally Vulnerable Banking Application

You are the primary development agent responsible for building the **SecureBank** target application for a cybersecurity hackathon project called **Adversarial DevSecOps**.

The eventual system will use IBM Bob 2.0 to orchestrate:

```text
🔎 Recon
   ↓
🔴 Red Team
   ↓
⚖️ Security Judge
   ↓
📊 Risk Analysis
   ↓
🔵 Blue Team
   ↓
🧪 Verification
   ↓
🔴 Adaptive Re-attack
```

Your task is to build **only the target application and its infrastructure**.

Do NOT build the AI Red Team, Blue Team, Security Judge, Risk Analyzer, or Bob orchestration yet.

---

# CRITICAL EXECUTION RULE

Build the project in the phases below.

**DO NOT attempt to implement all phases in one pass.**

After completing each phase:

1. Inspect your implementation.
2. Run the relevant tests/checks.
3. Fix problems discovered during that phase.
4. Summarize what was completed.
5. Clearly state whether the phase is ready to proceed.
6. Only then move to the next phase.

If a phase fails validation, fix it before continuing.

Do not skip phases.

Do not prematurely implement future-phase features.

---

# PROJECT PRINCIPLES

The application must be:

* Small
* Stable
* Deterministic
* Easy for AI agents to understand
* Easy to attack in a controlled environment
* Easy to patch later
* Easy to test
* Dockerized
* Well documented

This is a **local intentionally vulnerable security-demo application**, not a real banking system.

Never connect to real financial services or third-party production systems.

Use only fake data and local infrastructure.

---

# PHASE 0 — REQUIREMENTS AND ARCHITECTURE

## Objective

Before writing significant application code, design the project.

Do NOT implement the full application yet.

### Decide and document:

* Frontend framework
* Backend framework
* Database
* Authentication approach
* API architecture
* Testing framework
* Docker architecture
* Directory structure
* Data model
* Vulnerability isolation strategy

Preferred stack:

```text
Frontend:
React + TypeScript + Vite

Backend:
Node.js + TypeScript + Express

Database:
SQLite

Testing:
Vitest/Jest + Supertest
Playwright where useful

Infrastructure:
Docker + Docker Compose
```

Do not introduce:

* Kubernetes
* Microservices
* Redis
* Kafka
* Cloud services
* Real payment APIs
* External databases

### Produce:

```text
docs/architecture.md
docs/development.md
```

Include an architecture diagram similar to:

```text
Browser
   ↓
React Frontend
   ↓ REST
Express Backend
   ↓
SQLite
```

### Also define the initial database model:

```text
users
accounts
transactions
uploads
sessions
```

### Phase 0 validation

Confirm:

* Architecture is documented.
* Technology choices are documented.
* Directory structure is defined.
* Data model is defined.
* Vulnerability isolation strategy is defined.

Do not proceed until this is complete.

---

# PHASE 1 — PROJECT SCAFFOLD

## Objective

Create the repository and development infrastructure.

Create approximately:

```text
securebank/
│
├── frontend/
├── backend/
├── tests/
├── docs/
├── docs/internal/
├── data/
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

Set up:

* Frontend
* Backend
* TypeScript
* SQLite
* Test framework
* Environment configuration
* Basic logging
* API structure
* Docker

Create:

```text
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

### Required commands

Provide working equivalents of:

```bash
npm run dev
npm run test
npm run build
```

and:

```bash
docker compose up --build
```

### Phase 1 validation

Verify:

* Frontend starts.
* Backend starts.
* `/health` works.
* Database can initialize.
* Docker Compose works.
* Tests execute.
* Build succeeds.

Do not build banking functionality yet.

---

# PHASE 2 — DATABASE AND SEED DATA

## Objective

Create the database schema and deterministic demo data.

Implement:

```text
users
accounts
transactions
uploads
sessions
```

Seed at least:

```text
Alice
alice@securebank.local
Role: USER

Bob
bob@securebank.local
Role: USER

Charlie
charlie@securebank.local
Role: USER

Admin
admin@securebank.local
Role: ADMIN
```

Use clearly documented demo-only passwords.

Use fake balances and fake transactions.

Example:

```text
Alice:   $12,500
Bob:      $8,700
Charlie:  $4,200
```

The exact values do not matter.

What matters is deterministic seed data.

### Phase 2 validation

Verify:

* Database initializes automatically.
* Seed data exists.
* Relationships work.
* Application can query users/accounts/transactions.
* Database tests pass.

Do not implement vulnerabilities yet.

---

# PHASE 3 — AUTHENTICATION

## Objective

Implement the normal authentication flow.

Pages:

```text
/login
/register
```

Features:

* Login
* Logout
* Registration
* Session handling
* Authentication middleware
* Current-user endpoint

Example:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

For the demo, credentials are fake.

Do not intentionally introduce the weak-authentication vulnerability yet.

Build a clean authentication foundation that can later be modified if needed.

### Phase 3 validation

Test:

* Valid login
* Invalid login
* Logout
* Protected endpoint without authentication
* Registration
* Session persistence

All normal authentication tests should pass.

---

# PHASE 4 — CORE BANKING FUNCTIONALITY

## Objective

Build the normal application before introducing vulnerabilities.

Implement:

### Dashboard

```text
/dashboard
```

Show:

* User
* Account number
* Balance
* Recent transactions

### Transfers

```text
/transfer
```

API:

```text
POST /api/transfers
```

Allow fake money transfers between seeded users.

### Transactions

```text
/transactions
```

API:

```text
GET /api/transactions
GET /api/transactions/:id
```

### Profile

```text
/profile
```

API:

```text
GET /api/users/:id
PUT /api/users/:id
```

### Admin

```text
/admin
```

API:

```text
GET /api/admin/users
GET /api/admin/transactions
```

At this stage, implement correct authorization.

We will intentionally introduce vulnerabilities in later phases.

### Phase 4 validation

Verify:

* Login → Dashboard works.
* Transfers work.
* Balances update.
* Transactions are created.
* Transaction history works.
* Profile works.
* Admin works.
* Normal users cannot access admin functionality.
* Existing tests pass.

Do not proceed if the normal banking workflow is unstable.

---

# PHASE 5 — FRONTEND POLISH

## Objective

Make the application visually credible for a hackathon demonstration.

Implement:

```text
/login
/register
/dashboard
/transfer
/transactions
/profile
/admin
```

Use a clean banking dashboard.

Include:

* Navigation
* Cards
* Tables
* Forms
* Loading states
* Error states
* Success notifications
* Responsive layout

Do not over-invest in visual effects.

The application should look professional enough that judges can immediately understand it.

### Phase 5 validation

Manually test the complete user journey:

```text
Login
 ↓
Dashboard
 ↓
Transfer
 ↓
Transaction history
 ↓
Profile
 ↓
Logout
```

Also test admin flow.

---

# PHASE 6 — API AND DOCUMENTATION

## Objective

Make the repository highly understandable to future AI agents.

Create:

```text
docs/api.md
docs/architecture.md
docs/development.md
docs/testing.md
```

Document every API endpoint.

For each endpoint document:

* HTTP method
* Path
* Authentication requirement
* Parameters
* Request body
* Response
* Status codes
* Purpose

Example:

```markdown
## GET /api/transactions/:id

Authentication:
Required

Purpose:
Retrieve a transaction.

Parameters:
id - transaction identifier

Response:
Transaction object
```

Also create:

```text
docs/internal/vulnerability-catalog.md
```

At this point, create the structure but do not yet expose vulnerability details through the application.

### Phase 6 validation

Ensure documentation accurately matches the actual code.

Do not document endpoints that don't exist.

Do not leave outdated documentation.

---

# PHASE 7 — SEED VULNERABILITY #1

## Broken Object-Level Authorization / IDOR

Now begin introducing deliberate vulnerabilities.

Create one isolated vulnerability.

Example:

```text
GET /api/users/:id
```

or:

```text
GET /api/transactions/:id
```

Expected vulnerable behavior:

```text
Alice logs in
      ↓
Alice requests Bob's resource ID
      ↓
Server returns Bob's private information
```

Create:

```text
tests/security/idor.test.ts
```

The test should demonstrate the vulnerable behavior.

Internal catalog:

```markdown
VULN-001
Type: BOLA / IDOR
Endpoint: ...
Expected exploit: ...
Expected evidence: ...
Expected remediation: ...
Expected verification: ...
```

### Phase 7 validation

Verify:

* Alice can reproduce the vulnerability.
* Bob's private data is accessible only because of the deliberate vulnerability.
* The test reliably reproduces it.
* No unrelated functionality is broken.

---

# PHASE 8 — SEED VULNERABILITY #2

## SQL Injection

Introduce one controlled SQL injection vulnerability.

Use SQLite.

A suitable target could be a transaction search endpoint:

```text
GET /api/transactions/search?q=
```

The vulnerable implementation must be deterministic.

Create:

```text
tests/security/sql-injection.test.ts
```

The test must demonstrate that attacker-controlled input can manipulate the intended query behavior.

Keep everything local and fake.

### Phase 8 validation

Verify:

* SQL injection is reproducible.
* Test is deterministic.
* No real data exists.
* No external system is contacted.
* Normal transaction search still has a usable demonstration path.

---

# PHASE 9 — SEED VULNERABILITY #3

## XSS

Introduce a controlled XSS vulnerability.

A suitable field could be:

```text
Transaction description
```

or:

```text
Transfer note
```

Use a harmless local demonstration payload.

Example:

```html
<script>alert("XSS-DEMO")</script>
```

Create:

```text
tests/security/xss.test.ts
```

The test should verify that attacker-controlled content is rendered unsafely.

### Phase 9 validation

Verify:

* XSS is reproducible locally.
* Payload is harmless.
* The behavior is deterministic.
* No external resources are loaded.

---

# PHASE 10 — SEED VULNERABILITY #4

## Unsafe File Upload

Add:

```text
POST /api/profile/upload
```

and a UI upload feature.

Intentionally implement insufficient file validation.

However:

**DO NOT allow arbitrary server-side code execution.**

Uploaded files must remain inside a controlled application directory.

Create:

```text
tests/security/file-upload.test.ts
```

Test unsafe validation/storage behavior.

### Phase 10 validation

Verify:

* Upload feature works.
* Vulnerable behavior is reproducible.
* Files remain inside the sandbox.
* No server compromise or arbitrary execution is possible.

---

# PHASE 11 — SEED VULNERABILITY #5

## Broken Admin Authorization / Privilege Escalation

Create an intentionally weak authorization path.

Example:

```text
GET /api/admin/users
```

Expected vulnerable behavior:

```text
Normal authenticated user
        ↓
Requests admin endpoint
        ↓
Backend incorrectly permits access
```

Create:

```text
tests/security/privilege-escalation.test.ts
```

### Phase 11 validation

Verify:

* Normal user can reproduce the intended vulnerability.
* Admin functionality still works normally.
* The vulnerability is isolated.
* Test is deterministic.

---

# PHASE 12 — SECURITY TEST SUITE

## Objective

Create the complete security test layer.

Structure:

```text
tests/
├── functional/
│   ├── auth.test.ts
│   ├── transfers.test.ts
│   ├── transactions.test.ts
│   └── profile.test.ts
│
└── security/
    ├── idor.test.ts
    ├── sql-injection.test.ts
    ├── xss.test.ts
    ├── file-upload.test.ts
    └── privilege-escalation.test.ts
```

The security tests should clearly identify the expected vulnerable behavior.

This gives our future Red Team and Blue Team a baseline.

### Important concept

Before remediation:

```text
Security test:
EXPLOIT REPRODUCED
```

After remediation:

```text
Security test:
EXPLOIT BLOCKED
```

The test suite must support this transition.

### Phase 12 validation

Run:

```bash
npm run test
npm run test:security
```

Confirm every seeded vulnerability is reproducible.

---

# PHASE 13 — INTERNAL VULNERABILITY CATALOG

Complete:

```text
docs/internal/vulnerability-catalog.md
```

For each vulnerability document:

```text
ID
Name
Type
Endpoint
Source files
Attack preconditions
Reproduction steps
Evidence
Impact
Root cause
Expected fix
Verification strategy
```

Example:

```markdown
## VULN-001

Name:
Broken Object-Level Authorization

Type:
BOLA / IDOR

Endpoint:
GET /api/transactions/:id

Precondition:
Authenticated user

Attack:
Alice requests Bob's transaction ID.

Evidence:
Bob's transaction is returned.

Impact:
Unauthorized data access.

Expected fix:
Verify resource ownership.

Verification:
Alice receives HTTP 403 for Bob's resource.
```

This document is important for development but should not be exposed in the public application.

---

# PHASE 14 — FINAL INFRASTRUCTURE HARDENING

This phase is about the development environment, NOT fixing the intentional vulnerabilities.

Verify:

* Docker builds.
* Docker Compose works.
* Environment variables work.
* Database initialization works.
* Seed data works.
* Logs work.
* Health endpoint works.
* Frontend communicates with backend.
* Tests work from a clean environment.

Do not accidentally fix the five intentional vulnerabilities.

The vulnerabilities must remain present.

---

# PHASE 15 — CLEAN-ROOM VALIDATION

Pretend another developer has received the repository.

Starting from a clean environment, verify:

```text
Clone
 ↓
Install
 ↓
Start
 ↓
Login
 ↓
Use application
 ↓
Run tests
 ↓
Reproduce vulnerabilities
```

Document the exact commands.

Fix any setup problems.

This phase is extremely important because our Red/Blue agents will later operate on this repository as if they are external engineering agents.

---

# PHASE 16 — FINAL AGENT-READINESS REVIEW

Before finishing, inspect the repository specifically from the perspective of a future AI coding/security agent.

Check:

### Code clarity

* Are files logically organized?
* Are functions reasonably sized?
* Are names descriptive?
* Are APIs easy to identify?

### Documentation

* Is architecture documented?
* Are APIs documented?
* Are development commands documented?
* Are tests documented?

### Security workflow readiness

Can an AI agent identify:

```text
Repository
 ↓
Application architecture
 ↓
API endpoints
 ↓
Authentication
 ↓
Authorization
 ↓
Data flow
 ↓
Potential attack surfaces
```

### Patchability

Can a Blue Team agent independently modify:

```text
Controller
Service
Middleware
Validation
Tests
```

without rewriting the application?

If not, improve the structure.

---

# FINAL VALIDATION CHECKLIST

Before declaring the project complete, ALL of these must pass:

## Application

* [ ] Frontend starts
* [ ] Backend starts
* [ ] Database initializes
* [ ] Seed data works
* [ ] Login works
* [ ] Registration works
* [ ] Dashboard works
* [ ] Transfers work
* [ ] Transactions work
* [ ] Profile works
* [ ] Admin works
* [ ] Logout works

## Infrastructure

* [ ] Docker build works
* [ ] Docker Compose works
* [ ] Environment configuration works
* [ ] `/health` works

## Testing

* [ ] Functional tests pass
* [ ] Security tests execute
* [ ] All five vulnerabilities reproduce
* [ ] Tests are deterministic

## Vulnerabilities

* [ ] VULN-001 IDOR/BOLA
* [ ] VULN-002 SQL Injection
* [ ] VULN-003 XSS
* [ ] VULN-004 Unsafe File Upload
* [ ] VULN-005 Broken Admin Authorization

## Documentation

* [ ] README
* [ ] Architecture
* [ ] API
* [ ] Development
* [ ] Testing
* [ ] Internal vulnerability catalog

## Agent readiness

* [ ] Repository is easy for AI agents to understand
* [ ] Vulnerability locations are deterministic
* [ ] Fixes can be applied independently
* [ ] Security tests can verify before/after behavior
* [ ] No real external systems are involved

---

# IMPORTANT: STOP CONDITION

When all phases are complete, DO NOT start building:

* Red Team agents
* Blue Team agents
* Security Judge
* Risk Analyzer
* Bob orchestration
* Bob prompts
* Agent dashboards

Those are separate tasks.

The output of this project is the **stable SecureBank target application** that those future components will consume.

---

# FINAL RESPONSE FORMAT

After completing the build, report:

## 1. What was built

Brief architecture summary.

## 2. Tech stack

List technologies.

## 3. How to run

Exact commands.

## 4. Demo accounts

List fake credentials.

## 5. API

Where API documentation lives.

## 6. Vulnerabilities

List:

```text
VULN-001
VULN-002
VULN-003
VULN-004
VULN-005
```

Do not provide exploit instructions outside the internal documentation.

## 7. Tests

Exact test commands.

## 8. Docker

Exact Docker commands.

## 9. Known limitations

List any remaining issues.

## 10. Phase status

Report:

```text
Phase 0: PASS
Phase 1: PASS
Phase 2: PASS
...
Final: READY FOR RED/BLUE TEAM DEVELOPMENT
```

Remember:

**Do not move forward when a phase is broken.**

**Do not fix the intentionally seeded vulnerabilities.**

**Do not build the agent system yet.**

Build a clean, stable, deliberately vulnerable target application that our future Red Team and Blue Team can reliably operate against.

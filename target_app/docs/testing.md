# SecureBank Testing Guide

This document describes how to execute and manage the test suites for the SecureBank platform.

---

## 1. Test Architecture & Environment Isolation

The backend utilizes SQLite for development and testing. Tests automatically configure a dynamic, isolated database per test suite using random file paths (e.g. `api-<timestamp>.db`). This ensures that test runs are parallel-safe, reproducible, and non-destructive.

---

## 2. Test Layer Directory Structure

```text
backend/tests/
├── functional/
│   ├── auth.test.ts          # Core authentication flows (login, register, logout, session)
│   ├── transfers.test.ts     # Money transfer execution, balance checks, error paths
│   ├── transactions.test.ts  # Transaction listing, single fetch, search
│   └── profile.test.ts       # Self-profile fetch, account lookup, email updates
│
└── security/
    ├── idor.test.ts                 # VULN-001: BOLA / IDOR exploit reproduction
    ├── sql-injection.test.ts        # VULN-002: SQL Injection exploit reproduction
    ├── xss.test.ts                  # VULN-003: Stored XSS exploit reproduction
    ├── file-upload.test.ts          # VULN-004: Unsafe File Upload exploit reproduction
    └── privilege-escalation.test.ts # VULN-005: Privilege Escalation exploit reproduction
```

---

## 3. Running Test Commands

### Run Full Workspace Test Suite
```bash
npm run test
```

### Run Functional Tests Only
```bash
npm run test:functional
```

### Run Security Exploitation Tests Only
```bash
npm run test:security
```

---

## 4. Exploit Verification State Standard

Security tests follow the standard baseline pattern:
- **Before Remediation**: Asserts `EXPLOIT REPRODUCED` (Confirms vulnerable behavior is live and functional).
- **After Remediation**: Asserts `EXPLOIT BLOCKED` (Confirms Blue Team fix successfully mitigates the vulnerability without breaking functionality).

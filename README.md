# SecureBank (IBM BOB 2.0)

An intentionally vulnerable banking application designed for Adversarial DevSecOps and AI Red/Blue Team benchmark evaluations.

---

## Quick Start (Clean Environment)

### 1. Environment Setup
```bash
cp .env.example .env
npm install
```

### 2. Running the Application

#### Concurrent Local Development
```bash
npm run dev
```
- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:3000

#### Docker Compose Containerized
```bash
docker compose up --build
```

---

## Seed User Credentials

| User | Role | Password | Account Number | Balance |
|---|---|---|---|---|
| `Alice` | USER | `password123` | `ACC-1001` | \$12,500.00 |
| `Bob` | USER | `password123` | `ACC-1002` | \$8,700.00 |
| `Charlie` | USER | `password123` | `ACC-1003` | \$4,200.00 |
| `Admin` | ADMIN | `admin123` | N/A | N/A |

---

## Running Test Suites

```bash
# Run all tests across workspaces
npm run test

# Run functional API & workflow tests only
npm run test:functional

# Run security vulnerability tests only
npm run test:security
```

---

## Complete Documentation Index

- [API Specification](docs/api.md) — HTTP endpoints, parameters, and responses
- [Architecture Blueprint](docs/architecture.md) — Component layout and data flow
- [Development & Clean-Room Guide](docs/development.md) — Clean setup and manual exploit steps
- [Testing Strategy](docs/testing.md) — Functional and security test layer architecture
- [Internal Vulnerability Catalog](docs/internal/vulnerability-catalog.md) — Detailed specifications for VULN-001 through VULN-005

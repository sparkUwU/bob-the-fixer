"""Discover project structure, likely stack, database, and integrations."""
import json
from pathlib import Path
from .common import SKIP_DIRS, read_text, rel


def analyze(root: Path) -> dict:
    stack, databases, integrations = set(), set(), set()
    name = root.name
    package = root / "package.json"
    if package.exists():
        try:
            data = json.loads(read_text(package))
            name = data.get("name") or name
            deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            stack.add("Node.js")
            for dep, framework in [("express", "Express"), ("fastify", "Fastify"), ("koa", "Koa"), ("@nestjs/core", "NestJS"), ("next", "Next.js"), ("react", "React"), ("vue", "Vue"), ("typescript", "TypeScript")]:
                if dep in deps: stack.add(framework)
            for dep, db in [("sqlite3", "SQLite"), ("better-sqlite3", "SQLite"), ("mongoose", "MongoDB"), ("mongodb", "MongoDB"), ("pg", "PostgreSQL"), ("mysql2", "MySQL"), ("@prisma/client", "Prisma-supported database"), ("sequelize", "SQL database (Sequelize)")]:
                if dep in deps: databases.add(db)
            for dep in ("stripe", "@aws-sdk/client-s3", "firebase-admin", "redis", "nodemailer", "axios"):
                if dep in deps: integrations.add(dep)
        except (json.JSONDecodeError, OSError):
            pass
    requirements = root / "requirements.txt"
    if requirements.exists():
        stack.add("Python")
        deps = read_text(requirements).lower()
        for key, label in [("fastapi", "FastAPI"), ("flask", "Flask"), ("django", "Django"), ("sqlalchemy", "SQLAlchemy"), ("psycopg", "PostgreSQL"), ("pymysql", "MySQL"), ("pymongo", "MongoDB"), ("sqlite", "SQLite")]:
            if key in deps: (stack if label in {"FastAPI", "Flask", "Django", "SQLAlchemy"} else databases).add(label)
    if (root / "pyproject.toml").exists():
        stack.add("Python")
        config = read_text(root / "pyproject.toml").lower()
        for key, label in [("fastapi", "FastAPI"), ("flask", "Flask"), ("django", "Django"), ("sqlalchemy", "SQLAlchemy")]:
            if key in config: stack.add(label)
    if (root / "go.mod").exists(): stack.add("Go")
    if (root / "pom.xml").exists() or (root / "build.gradle").exists(): stack.add("Java")
    for p in root.rglob("*"):
        if not p.is_file() or SKIP_DIRS.intersection(p.parts): continue
        if p.name.lower() in {".env", "config.js", "config.py", "database.js", "database.py"}:
            text = read_text(p).lower()
            for token, db in [("sqlite", "SQLite"), ("postgres", "PostgreSQL"), ("mysql", "MySQL"), ("mongodb", "MongoDB"), ("mongoose", "MongoDB"), ("redis", "Redis")]:
                if token in text: databases.add(db)
            for token in ("stripe", "s3", "firebase", "sendgrid", "twilio"):
                if token in text: integrations.add(token)
    return {"name": str(name), "tech_stack": sorted(stack), "database": ", ".join(sorted(databases)) if databases else "Unknown", "integrations": sorted(integrations), "entry_points": [rel(p, root) for p in root.rglob("*") if p.is_file() and p.name.lower() in {"app.js", "server.js", "index.js", "main.py", "app.py", "manage.py", "main.go"} and not SKIP_DIRS.intersection(p.parts)]}

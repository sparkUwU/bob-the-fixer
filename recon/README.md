# Recon Engine

Standalone, dependency-free static reconnaissance for the local `target-app/` project. It runs four focused analyzers, combines their observations, validates the resulting document against `schemas/recon_schema.json`, and writes one attack-surface map to the workspace root as `recon_output.json`.

## Run

From the workspace root:

```powershell
python recon/run_recon.py
```

Choose paths explicitly when needed:

```powershell
python recon/run_recon.py --target .\target-app --output .\recon_output.json
```

Python 3.9 or newer is recommended. The runner uses only the Python standard library. It reports a clear error if `target-app/` does not exist.

## Agents

- `architecture_agent.py` reads common dependency manifests and configuration for likely languages, frameworks, databases, entry points, and integrations.
- `api_agent.py` recognizes common Express-style route registrations and Flask/FastAPI decorator routes; it infers path, query, and body parameter names where visible in nearby handler code.
- `data_flow_agent.py` flags likely request-input to database, file, process, or HTML sinks when they occur in a short local code window.
- `auth_agent.py` looks for common JWT/session/auth markers and route guard names, then annotates discovered endpoints conservatively.

## Output and limits

The output follows the strict top-level structure in `schemas/recon_schema.json`. Run observations are heuristic: dynamic route construction, imported guards, aliases, framework-specific abstractions, and inter-file taint flows may be missed. `roles_allowed` is populated only when role literals are found; an empty list means the scanner could not infer an allowlist, not that a route has no role restriction. Review the map before using it to guide testing.

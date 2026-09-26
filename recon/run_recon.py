"""Run the standalone static recon agents against a target application."""
import argparse
import json
import re
import sys
from pathlib import Path

from agents.architecture_agent import analyze as analyze_architecture
from agents.api_agent import analyze as analyze_api
from agents.data_flow_agent import analyze as analyze_data_flows
from agents.auth_agent import analyze as analyze_auth

HERE = Path(__file__).resolve().parent


def validate(data: dict, schema: dict) -> None:
    """Validate this schema's supported JSON Schema subset without dependencies."""
    def check(ok, where, message):
        if not ok: raise ValueError(f"Schema validation failed at {where}: {message}")
    check(isinstance(data, dict), "$", "expected object")
    for key in schema["required"]: check(key in data, "$", f"missing {key}")
    check(set(data) == set(schema["properties"]), "$", "unexpected or missing top-level fields")
    app = data["app_info"]
    check(set(app) == {"name", "tech_stack", "database"}, "app_info", "wrong fields")
    check(isinstance(app["name"], str) and isinstance(app["database"], str) and isinstance(app["tech_stack"], list) and all(isinstance(x, str) for x in app["tech_stack"]), "app_info", "wrong field types")
    check(isinstance(data["endpoints"], list), "endpoints", "expected array")
    check(isinstance(data["data_flows"], list), "data_flows", "expected array")
    for collection, prefix, fields in (("endpoints", "EP", {"id", "path", "method", "auth_required", "roles_allowed", "parameters", "source_file"}), ("data_flows", "DF", {"flow_id", "source", "sink", "file", "sensitive"})):
        for i, item in enumerate(data[collection]):
            where = f"{collection}[{i}]"
            check(isinstance(item, dict) and set(item) == fields, where, "wrong fields")
            idkey = "id" if collection == "endpoints" else "flow_id"
            check(re.fullmatch(prefix + r"-\d{3,}", item[idkey]) is not None, where, "invalid id")
    for i, ep in enumerate(data["endpoints"]):
        check(ep["method"] in {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD", "ANY"}, f"endpoints[{i}].method", "invalid method")
        check(isinstance(ep["auth_required"], bool) and isinstance(ep["roles_allowed"], list) and isinstance(ep["parameters"], list), f"endpoints[{i}]", "wrong field types")
        for j, param in enumerate(ep["parameters"]):
            check(set(param) == {"name", "location", "type"} and param["location"] in {"path", "query", "body", "header", "unknown"}, f"endpoints[{i}].parameters[{j}]", "invalid parameter")
    a = data["auth_surface"]
    check(set(a) == {"login_endpoint", "auth_type", "header"} and (a["login_endpoint"] is None or isinstance(a["login_endpoint"], str)) and isinstance(a["auth_type"], str) and (a["header"] is None or isinstance(a["header"], str)), "auth_surface", "invalid auth surface")


def run(target: Path, output: Path) -> dict:
    target = target.resolve()
    if not target.is_dir(): raise FileNotFoundError(f"Target application directory not found: {target}")
    architecture = analyze_architecture(target)
    endpoints = analyze_api(target)
    auth = analyze_auth(target, endpoints)
    raw_flows = analyze_data_flows(target)
    data = {
        "app_info": {"name": architecture["name"], "tech_stack": architecture["tech_stack"], "database": architecture["database"]},
        "endpoints": [{"id": f"EP-{i:03d}", **ep, "auth_required": ep.get("auth_required", False), "roles_allowed": ep.get("roles_allowed", [])} for i, ep in enumerate(endpoints, 1)],
        "auth_surface": auth,
        "data_flows": [{"flow_id": f"DF-{i:03d}", **flow} for i, flow in enumerate(raw_flows, 1)],
    }
    schema = json.loads((HERE / "schemas" / "recon_schema.json").read_text(encoding="utf-8"))
    validate(data, schema)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target", type=Path, default=HERE.parent / "target-app", help="target app directory (default: workspace/target-app)")
    parser.add_argument("--output", type=Path, default=HERE.parent / "recon_output.json", help="output JSON path (default: workspace/recon_output.json)")
    args = parser.parse_args()
    try:
        data = run(args.target, args.output)
    except (OSError, ValueError) as exc:
        print(f"Recon failed: {exc}", file=sys.stderr)
        return 1
    print(f"Recon complete: {len(data['endpoints'])} endpoints, {len(data['data_flows'])} data flows -> {args.output.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

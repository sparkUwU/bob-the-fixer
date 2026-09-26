"""Best-effort extraction of common Express and Python web route declarations."""
import re
from pathlib import Path
from .common import read_text, rel, source_files

ROUTE_RE = re.compile(r"(?:\b(?:app|router|server)\s*\.\s*(get|post|put|patch|delete|options|head|all)\s*\(\s*['\"]([^'\"]+)['\"]|@(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['\"]([^'\"]+)['\"]", re.I)
PARAM_RE = re.compile(r":([A-Za-z_]\w*)|<(?:(?:int|str|float|uuid):)?([A-Za-z_]\w*)>")
BODY_RE = re.compile(r"(?:req|request)\.(?:body|json)\s*\[?['\"]?([A-Za-z_]\w*)|(?:req|request)\.body\.([A-Za-z_]\w*)")
QUERY_RE = re.compile(r"(?:req|request)\.(?:query|args)\s*\[?['\"]?([A-Za-z_]\w*)")


def analyze(root: Path) -> list:
    endpoints = []
    for file in source_files(root):
        text = read_text(file)
        for match in ROUTE_RE.finditer(text):
            method = (match.group(1) or match.group(3)).upper()
            path = match.group(2) or match.group(4)
            if method == "ALL": method = "ANY"
            params = []
            for m in PARAM_RE.finditer(path):
                pname = m.group(1) or m.group(2)
                ptype = "integer" if "<int:" in m.group(0) else "string"
                params.append({"name": pname, "location": "path", "type": ptype})
            # Infer named body/query keys from the route's nearby handler block.
            handler = text[match.start():match.start() + 1800]
            for regex, location in ((QUERY_RE, "query"), (BODY_RE, "body")):
                for m in regex.finditer(handler):
                    pname = next((g for g in m.groups() if g), None)
                    if pname and not any(p["name"] == pname for p in params):
                        params.append({"name": pname, "location": location, "type": "unknown"})
            endpoints.append({"path": path, "method": method, "parameters": params, "source_file": rel(file, root)})
    return endpoints

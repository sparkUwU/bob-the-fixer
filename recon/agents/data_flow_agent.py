"""Locate likely untrusted-input to sensitive-sink flows using static heuristics."""
import re
from pathlib import Path
from .common import read_text, rel, source_files

SOURCES = [r"req\.params(?:\.[\w]+|\[['\"][^\]]+['\"]\])?", r"req\.query(?:\.[\w]+|\[['\"][^\]]+['\"]\])?", r"req\.body(?:\.[\w]+|\[['\"][^\]]+['\"]\])?", r"request\.(?:args|form|json)(?:\.[\w]+|\[['\"][^\]]+['\"]\])?", r"request\.GET\[['\"][^\]]+['\"]\]", r"request\.POST\[['\"][^\]]+['\"]\]"]
SINKS = [(re.compile(p, re.I), label, sensitive) for p, label, sensitive in [
    (r"(?:\.query|\.execute|\.raw)\s*\(", "database query/execute", True),
    (r"(?:readFile|readFileSync|createReadStream|open)\s*\(", "file read/open", True),
    (r"(?:innerHTML|dangerouslySetInnerHTML)\s*=?", "dynamic HTML rendering", True),
    (r"(?:exec|execSync|spawn)\s*\(", "process execution", True),
    (r"\.render\s*\(", "template rendering", False),
]]


def analyze(root: Path) -> list:
    flows = []
    for file in source_files(root):
        lines = read_text(file).splitlines()
        for i, line in enumerate(lines):
            sink = next(((label, sensitive) for regex, label, sensitive in SINKS if regex.search(line)), None)
            if not sink: continue
            window = " ".join(lines[max(0, i - 5):min(len(lines), i + 1)])
            source = next((found for pattern in SOURCES if (found := re.search(pattern, window))), None)
            if not source: continue
            flows.append({"source": source.group(0), "sink": sink[0], "file": rel(file, root), "sensitive": sink[1]})
    return flows

"""Infer login/auth mechanisms and route protection from source patterns."""
import re
from pathlib import Path
from .common import read_text, source_files


def analyze(root: Path, endpoints: list) -> dict:
    combined = "\n".join(read_text(p) for p in source_files(root))
    low = combined.lower()
    if "jwt" in low or "jsonwebtoken" in low: auth_type, header = "JWT", "Authorization: Bearer <token>"
    elif "session" in low or "express-session" in low: auth_type, header = "Session", "Cookie"
    elif "passport" in low: auth_type, header = "Passport", "Unknown"
    elif re.search(r"\b(login_required|is_authenticated|authenticate)\b", low): auth_type, header = "Application-defined", "Unknown"
    else: auth_type, header = "Unknown", None
    login = next((e["path"] for e in endpoints if re.search(r"login|signin|sign-in|auth", e["path"], re.I) and e["method"] == "POST"), None)
    # Annotate endpoint security conservatively using route-local middleware and project-wide guard names.
    guard_names = re.findall(r"\b(?:auth|authenticate|requireAuth|verifyToken|isAuthenticated|login_required|permission_required|authorize|requireRole)\w*\b", combined, re.I)
    roles = sorted(set(re.findall(r"(?:role|roles)\s*[:=]\s*['\"]([\w-]+)['\"]", combined, re.I)))
    for endpoint in endpoints:
        p = endpoint["path"].lower()
        # Public auth endpoints are not inferred as protected absent explicit matching evidence.
        endpoint["auth_required"] = False if re.search(r"login|register|signup|sign-up|health", p) else bool(guard_names) and not re.search(r"public|optional", p)
        endpoint["roles_allowed"] = roles if endpoint["auth_required"] else []
    return {"login_endpoint": login, "auth_type": auth_type, "header": header}

# Auto-generated Regression Test for VULN-004 (FILE_UPLOAD)
import urllib.request
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))
from shared.auth_helper import get_session_cookie

def test_vuln-004_exploit_blocked():
    """Verifies original exploit is blocked post-patch."""
    cookie = get_session_cookie("http://127.0.0.1:3000", "Alice", "password123")
    url = "http://127.0.0.1:3000/api/users/2"
    headers = {"Cookie": cookie}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert data.get("user", {}).get("username") != "Bob", f"Exploit VULN-004 still accessible!"
    except urllib.error.HTTPError as e:
        assert e.code in (403, 400, 401), f"Expected blocked status, got {e.code}"
        print(f"[✓ REGRESSION TEST PASSED] VULN-004 exploit blocked with HTTP {e.code}!")

if __name__ == "__main__":
    test_vuln-004_exploit_blocked()

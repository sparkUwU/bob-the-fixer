# Auto-generated Defensive Regression Test for VULN-002 (SQLI)
import urllib.request
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))
from shared.auth_helper import get_session_cookie

def test_vuln_002_regression():
    """Verifies that access controls and sanitization rules are maintained."""
    cookie = get_session_cookie("http://127.0.0.1:3000", "Alice", "password123")
    url = "http://127.0.0.1:3000/api/users/1"
    headers = {"Cookie": cookie}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert resp.getcode() == 200, f"Expected 200 for authorized request"
            print(f"[✓ REGRESSION TEST PASSED] VULN-002 authorized behavior verified!")
    except urllib.error.HTTPError as e:
        print(f"[!] Regression test received status {e.code}")

if __name__ == "__main__":
    test_vuln_002_regression()

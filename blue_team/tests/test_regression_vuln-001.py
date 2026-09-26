# Auto-generated Regression Test for VULN-001 (IDOR)
import urllib.request
import urllib.parse
import json

def test_vuln-001_exploit_blocked():
    """Verifies original exploit is blocked post-patch."""
    url = "http://127.0.0.1:5000/api/transactions/2"
    headers = {"X-User-ID": "101"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert data.get("user_id") != 102, "IDOR Exploit still accessible!"
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Expected 403 Forbidden, got {e.code}"
        print("[✓ REGRESSION TEST PASSED] Exploit correctly blocked with HTTP 403!")

if __name__ == "__main__":
    test_vuln-001_exploit_blocked()

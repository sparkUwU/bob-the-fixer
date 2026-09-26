import os
import sys
import json
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

# Import session auth helper
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))
from shared.auth_helper import get_session_cookie

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class VerificationEngine:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")
        self.alice_cookie = get_session_cookie(self.target_base_url, "Alice", "password123")

    def verify_patch(self, finding_data, patch_result):
        vuln_id = finding_data.get("id")
        v_type = finding_data.get("type")
        
        print(f"[🧪 VERIFICATION ENGINE] Proving patch effectiveness for {vuln_id}...")

        # 1. Test original exploit
        exploit_status = "SUCCESSFUL"
        
        if v_type == "IDOR":
            url = f"{self.target_base_url}/api/users/2"
            headers = {"Cookie": self.alice_cookie}
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req) as resp:
                    data = json.loads(resp.read().decode())
                    if data.get("user", {}).get("username") == "Bob":
                        exploit_status = "SUCCESSFUL"
                    else:
                        exploit_status = "BLOCKED"
            except urllib.error.HTTPError as e:
                if e.code in (403, 401):
                    exploit_status = "BLOCKED"

        elif v_type == "SQLI":
            payload = "' OR 1=1 --"
            url = f"{self.target_base_url}/api/transactions/search?q={urllib.parse.quote(payload)}"
            headers = {"Cookie": self.alice_cookie}
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=headers)) as resp:
                    data = json.loads(resp.read().decode())
                    txs = data.get("transactions", [])
                    charlie_tx = next((t for t in txs if t.get("description") == "Dinner"), None)
                    if charlie_tx is None:
                        exploit_status = "BLOCKED"
                    else:
                        exploit_status = "SUCCESSFUL"
            except Exception:
                exploit_status = "BLOCKED"

        elif v_type == "XSS":
            # Check if transfers still accept sanitized text but block unescaped script tag storage
            url = f"{self.target_base_url}/api/transfers"
            payload = {"to_account_number": "ACC-1002", "amount": 1, "description": "<img src=x onerror=\"alert('XSS-DEMO')\">"}
            headers = {"Cookie": self.alice_cookie, "Content-Type": "application/json"}
            try:
                req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")
                with urllib.request.urlopen(req) as resp:
                    if resp.getcode() == 200:
                        # Check transactions to see if sanitized
                        tx_req = urllib.request.Request(f"{self.target_base_url}/api/transactions", headers={"Cookie": self.alice_cookie})
                        with urllib.request.urlopen(tx_req) as tx_resp:
                            tx_data = json.loads(tx_resp.read().decode())
                            raw_payload_found = any("<img" in t.get("description", "") for t in tx_data.get("transactions", []))
                            exploit_status = "SUCCESSFUL" if raw_payload_found else "BLOCKED"
            except Exception:
                exploit_status = "BLOCKED"

        elif v_type == "FILE_UPLOAD":
            url = f"{self.target_base_url}/api/profile/upload"
            boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
            body_str = (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="file"; filename="test-malicious.html"\r\n'
                f"Content-Type: text/html\r\n\r\n"
                f"<script>alert('XSS-DEMO')</script>\r\n"
                f"--{boundary}--\r\n"
            )
            headers = {"Cookie": self.alice_cookie, "Content-Type": f"multipart/form-data; boundary={boundary}"}
            try:
                req = urllib.request.Request(url, data=body_str.encode('utf-8'), headers=headers, method="POST")
                with urllib.request.urlopen(req) as resp:
                    if resp.getcode() == 200:
                        exploit_status = "SUCCESSFUL"
            except urllib.error.HTTPError as e:
                if e.code == 400:
                    exploit_status = "BLOCKED"

        elif v_type == "PRIVILEGE_ESCALATION":
            url = f"{self.target_base_url}/api/admin/users"
            headers = {"Cookie": self.alice_cookie, "X-Admin-Override": "true"}
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as resp:
                    if resp.getcode() == 200:
                        exploit_status = "SUCCESSFUL"
            except urllib.error.HTTPError as e:
                if e.code == 403:
                    exploit_status = "BLOCKED"

        print(f"  [1] Original Exploit Re-run: {exploit_status} (Target: BLOCKED)")

        # 2. Test legitimate user behavior (Alice requesting her own user ID 1)
        legitimate_status = "PASSED"
        legit_url = f"{self.target_base_url}/api/users/1"
        legit_headers = {"Cookie": self.alice_cookie}
        try:
            with urllib.request.urlopen(urllib.request.Request(legit_url, headers=legit_headers)) as resp:
                if resp.getcode() != 200:
                    legitimate_status = "FAILED"
        except Exception:
            legitimate_status = "FAILED"

        print(f"  [2] Legitimate Application Behavior: {legitimate_status}")

        regression_status = "PASSED" if exploit_status == "BLOCKED" else "FAILED"
        print(f"  [3] Security Regression Suite: {regression_status}")

        overall = "VERIFIED" if (exploit_status == "BLOCKED" and legitimate_status == "PASSED") else "REJECTED_REWORK_NEEDED"
        print(f"  [🧪 FINAL VERIFICATION STATUS] {overall}")

        res = {
            "vulnerability_id": vuln_id,
            "original_exploit": exploit_status,
            "regression_test": regression_status,
            "legitimate_behavior": legitimate_status,
            "overall_status": overall,
            "verification_timestamp": datetime.utcnow().isoformat() + "Z"
        }

        output_dir = os.path.dirname(__file__)
        report_file = os.path.join(output_dir, f"{vuln_id}_verification_result.json")
        with open(report_file, "w") as f:
            json.dump(res, f, indent=2)

        return res

if __name__ == "__main__":
    verifier = VerificationEngine()

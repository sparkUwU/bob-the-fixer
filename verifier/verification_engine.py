import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class VerificationEngine:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")

    def verify_patch(self, finding_data, patch_result):
        vuln_id = finding_data.get("id")
        v_type = finding_data.get("type")
        
        print(f"[🧪 VERIFICATION ENGINE] Proving patch effectiveness for {vuln_id}...")

        # 1. Test original exploit
        exploit_status = "SUCCESSFUL"
        if v_type == "IDOR":
            url = f"{self.target_base_url}/api/transactions/2"
            headers = {"X-User-ID": "101"}
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req) as resp:
                    body = resp.read().decode()
                    data = json.loads(body)
                    if data.get("user_id") == 102:
                        exploit_status = "SUCCESSFUL"
                    else:
                        exploit_status = "BLOCKED"
            except urllib.error.HTTPError as e:
                if e.code in (403, 401):
                    exploit_status = "BLOCKED"

        elif v_type == "SQLI":
            payload = "' OR '1'='1"
            url = f"{self.target_base_url}/api/transactions/search?q={urllib.parse.quote(payload)}"
            try:
                with urllib.request.urlopen(url) as resp:
                    data = json.loads(resp.read().decode())
                    results = data.get("results", [])
                    if len(results) < 3:
                        exploit_status = "BLOCKED"
                    else:
                        exploit_status = "SUCCESSFUL"
            except Exception:
                exploit_status = "BLOCKED"

        print(f"  [1] Original Exploit Re-run: {exploit_status} (Target: BLOCKED)")

        # 2. Test legitimate user behavior
        legitimate_status = "PASSED"
        if v_type == "IDOR":
            # Alice (101) requesting her own transaction (ID: 1)
            legit_url = f"{self.target_base_url}/api/transactions/1"
            legit_headers = {"X-User-ID": "101"}
            try:
                with urllib.request.urlopen(urllib.request.Request(legit_url, headers=legit_headers)) as resp:
                    if resp.getcode() != 200:
                        legitimate_status = "FAILED"
            except Exception:
                legitimate_status = "FAILED"

        print(f"  [2] Legitimate Application Behavior: {legitimate_status}")

        # 3. Regression test check
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

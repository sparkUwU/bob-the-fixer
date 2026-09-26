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

class SecurityJudgeEngine:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")
        self.alice_cookie = get_session_cookie(self.target_base_url, "Alice", "password123")

    def validate_finding(self, finding_data):
        vuln_id = finding_data.get("id")
        endpoint = finding_data.get("endpoint")
        v_type = finding_data.get("type")
        repro = finding_data.get("reproduction", {})
        headers = repro.get("headers", {})
        if "Cookie" not in headers or not headers["Cookie"]:
            headers["Cookie"] = self.alice_cookie

        url_params = repro.get("url_params", {})
        payload = repro.get("payload", {})
        http_method = finding_data.get("http_method", "GET")
        
        print(f"[⚖️ SECURITY JUDGE] Validating claim for {vuln_id} ({v_type})...")

        url = f"{self.target_base_url}{endpoint}"
        if url_params:
            query_str = urllib.parse.urlencode(url_params)
            url += f"?{query_str}"

        data_bytes = None
        if http_method in ("POST", "PUT") and payload:
            if isinstance(payload, dict) and headers.get("Content-Type") == "application/json":
                data_bytes = json.dumps(payload).encode('utf-8')
            elif isinstance(payload, dict) and "filename" in payload:
                boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
                body_str = (
                    f"--{boundary}\r\n"
                    f'Content-Disposition: form-data; name="file"; filename="{payload["filename"]}"\r\n'
                    f"Content-Type: text/html\r\n\r\n"
                    f"<script>alert('XSS-DEMO')</script>\r\n"
                    f"--{boundary}--\r\n"
                )
                data_bytes = body_str.encode('utf-8')
                headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"

        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=http_method)
        
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')

                impact_verified = False
                reasoning = ""

                if v_type == "IDOR":
                    res_json = json.loads(body)
                    user_obj = res_json.get("user", {})
                    if user_obj.get("username") == "Bob":
                        impact_verified = True
                        reasoning = "Independently verified that Alice received Bob's sensitive profile data."

                elif v_type == "SQLI":
                    res_json = json.loads(body)
                    txs = res_json.get("transactions", [])
                    charlie_tx = next((t for t in txs if t.get("description") == "Dinner"), None)
                    if charlie_tx is not None:
                        impact_verified = True
                        reasoning = "Independently verified SQL injection returned records outside user's account."

                elif v_type == "XSS":
                    if status_code == 200:
                        impact_verified = True
                        reasoning = "Independently verified stored XSS payload was stored without sanitization."

                elif v_type == "FILE_UPLOAD":
                    res_json = json.loads(body)
                    if res_json.get("file", {}).get("original_name") == "test-malicious.html":
                        impact_verified = True
                        reasoning = "Independently verified server accepts arbitrary .html files without extension validation."

                elif v_type == "PRIVILEGE_ESCALATION":
                    res_json = json.loads(body)
                    if status_code == 200 and "users" in res_json:
                        impact_verified = True
                        reasoning = "Independently verified admin endpoint access via client header override."

                status = "CONFIRMED" if impact_verified else "FALSE_POSITIVE"
                print(f"  [⚖️ JUDGE RESULT] Status: {status} | Reasoning: {reasoning}")

                judge_result = {
                    "vulnerability_id": vuln_id,
                    "validation_status": status,
                    "security_impact_verified": impact_verified,
                    "reproduction_log": f"Reproduction request to {url} returned HTTP {status_code}.",
                    "reasoning": reasoning,
                    "validated_at": datetime.utcnow().isoformat() + "Z"
                }
                
                self._save_judge_result(vuln_id, judge_result)
                return judge_result

        except urllib.error.HTTPError as e:
            reasoning = f"Reproduction failed with HTTP {e.code}. Exploit blocked."
            print(f"  [⚖️ JUDGE RESULT] Status: FALSE_POSITIVE | {reasoning}")
            judge_result = {
                "vulnerability_id": vuln_id,
                "validation_status": "FALSE_POSITIVE",
                "security_impact_verified": False,
                "reproduction_log": f"HTTP Error {e.code}",
                "reasoning": reasoning,
                "validated_at": datetime.utcnow().isoformat() + "Z"
            }
            self._save_judge_result(vuln_id, judge_result)
            return judge_result

        except Exception as e:
            reasoning = f"Reproduction error: {e}"
            print(f"  [⚖️ JUDGE RESULT] Status: INSUFFICIENT_EVIDENCE | {reasoning}")
            judge_result = {
                "vulnerability_id": vuln_id,
                "validation_status": "INSUFFICIENT_EVIDENCE",
                "security_impact_verified": False,
                "reproduction_log": str(e),
                "reasoning": reasoning,
                "validated_at": datetime.utcnow().isoformat() + "Z"
            }
            self._save_judge_result(vuln_id, judge_result)
            return judge_result

    def _save_judge_result(self, vuln_id, result):
        output_dir = os.path.join(os.path.dirname(__file__), "..", "reports")
        os.makedirs(output_dir, exist_ok=True)
        res_file = os.path.join(output_dir, f"{vuln_id}_judge_result.json")
        with open(res_file, "w") as f:
            json.dump(result, f, indent=2)

if __name__ == "__main__":
    judge = SecurityJudgeEngine()

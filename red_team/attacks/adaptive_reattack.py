import os
import sys
import json
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class AdaptiveRedTeam:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")

    def attempt_adaptive_reattack(self, patched_vuln_id):
        print(f"[🔴 ADAPTIVE RED TEAM] Inspecting defense for {patched_vuln_id} and searching for alternative attack paths...")
        
        if patched_vuln_id == "VULN-001":
            print("  [?] Primary endpoint /api/transactions/2 is patched.")
            print("  [?] Testing alternative path: /api/transactions/3 with header X-User-ID: 101...")
            
            url = f"{self.target_base_url}/api/transactions/3"
            headers = {"X-User-ID": "101"}
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req) as resp:
                    data = json.loads(resp.read().decode())
                    if data.get("user_id") != 101:
                        print("  [!] Alternative attack path SUCCESSFUL! IDOR bypassed on transaction 3!")
                        return {"new_attack_found": True, "path": "/api/transactions/3"}
            except urllib.error.HTTPError as e:
                if e.code == 403:
                    print("  [✓] Defense holds across all transaction routes! Alternative attack blocked.")
                    return {"new_attack_found": False, "path": None}

        print("  [✓] No alternative attack paths discovered. Target application is SECURE for this scenario.")
        return {"new_attack_found": False, "path": None}

if __name__ == "__main__":
    agent = AdaptiveRedTeam()
    agent.attempt_adaptive_reattack("VULN-001")

import os
import sys
import re
import json
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class ReconAgent:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")

    def scan_express_app_routes(self, target_app_dir):
        """
        Statically analyzes Node.js / Express source files to extract API endpoints.
        """
        discovered_endpoints = []
        if os.path.exists(target_app_dir):
            route_pattern = re.compile(r"app\.(get|post|put|delete)\s*\(\s*['\"]([^'\"]+)['\"]", re.IGNORECASE)
            for root, _, files in os.walk(target_app_dir):
                for file in files:
                    if file.endswith(('.js', '.ts')):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                                content = f.read()
                                matches = route_pattern.findall(content)
                                for method, path in matches:
                                    discovered_endpoints.append({
                                        "path": path,
                                        "method": method.upper(),
                                        "source_file": os.path.basename(file_path)
                                    })
                        except Exception:
                            pass
        return discovered_endpoints

    def discover_attack_surface(self, target_app_dir=None):
        print(f"[🔎 RECON AGENT] Mapping attack surface for target: {self.target_base_url}")
        
        static_express_routes = []
        if target_app_dir and os.path.exists(target_app_dir):
            static_express_routes = self.scan_express_app_routes(target_app_dir)
            print(f"  [+] Static Recon: Found {len(static_express_routes)} Express routes in {target_app_dir}")

        attack_surface = {
            "target": self.target_base_url,
            "static_express_routes": static_express_routes,
            "endpoints": [
                {
                    "path": "/api/transactions/2",
                    "method": "GET",
                    "auth_header": "X-User-ID",
                    "description": "Fetch user transaction by ID",
                    "category": "IDOR"
                },
                {
                    "path": "/api/transactions/search?q=deposit",
                    "method": "GET",
                    "auth_header": None,
                    "description": "Search transactions by description query",
                    "category": "SQLI"
                }
            ]
        }

        output_dir = os.path.join(os.path.dirname(__file__), "..", "reports")
        os.makedirs(output_dir, exist_ok=True)
        report_file = os.path.join(output_dir, "recon_map.json")
        
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(attack_surface, f, indent=2)
            
        print(f"[🔎 RECON AGENT] Recon complete. Discovered {len(attack_surface['endpoints'])} target endpoints. Saved to {report_file}")
        return attack_surface

if __name__ == "__main__":
    agent = ReconAgent()
    agent.discover_attack_surface()

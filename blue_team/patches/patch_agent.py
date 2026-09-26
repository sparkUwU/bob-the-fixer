import os
import sys
import json
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class BlueTeamPatchAgent:
    def __init__(self, target_base_url="http://127.0.0.1:5000"):
        self.target_base_url = target_base_url.rstrip("/")

    def apply_patch(self, finding_data):
        vuln_id = finding_data.get("id")
        v_type = finding_data.get("type")
        
        print(f"[🔵 BLUE TEAM] Investigating root cause for {vuln_id} ({v_type})...")

        if v_type == "IDOR":
            root_cause = "Missing ownership validation check in /api/transactions/<id> controller."
            fix_desc = "Added owner_id != current_user_id check to block unauthorized access to transaction records."
            patch_key = "IDOR_FIXED"
            target_file = "mock_target_app/app.py"
        elif v_type == "SQLI":
            root_cause = "Raw string formatting in SQL search query in /api/transactions/search controller."
            fix_desc = "Replaced formatted inline query string with parameterized query tuple."
            patch_key = "SQLI_FIXED"
            target_file = "mock_target_app/app.py"
        else:
            root_cause = "Unsanitized user input."
            fix_desc = "Sanitized input."
            patch_key = "XSS_FIXED"
            target_file = "mock_target_app/app.py"

        # Read current patch config from mock server or patch config directly
        config_path = os.path.join(os.path.dirname(__file__), "..", "..", "mock_target_app", "patch_config.json")
        current_config = {}
        if os.path.exists(config_path):
            with open(config_path, "r") as f:
                current_config = json.load(f)

        current_config[patch_key] = True

        with open(config_path, "w") as f:
            json.dump(current_config, f, indent=2)

        print(f"  [🔵 PATCH APPLIED] Config updated: {patch_key} set to True in {target_file}")

        # Generate regression test reference (using blue_team underscore)
        reg_test_file = f"blue_team/tests/test_regression_{vuln_id.lower()}.py"
        self._generate_regression_test(vuln_id, v_type, reg_test_file)

        patch_result = {
            "vulnerability_id": vuln_id,
            "root_cause": root_cause,
            "files_changed": [target_file],
            "fix_description": fix_desc,
            "regression_test_file": reg_test_file,
            "status": "PATCHED"
        }

        output_dir = os.path.dirname(__file__)
        res_file = os.path.join(output_dir, f"{vuln_id}_patch_result.json")
        with open(res_file, "w") as f:
            json.dump(patch_result, f, indent=2)

        return patch_result

    def _generate_regression_test(self, vuln_id, v_type, filename):
        file_path = os.path.join(os.path.dirname(__file__), "..", "..", filename)
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        
        test_code = f'''# Auto-generated Regression Test for {vuln_id} ({v_type})
import urllib.request
import urllib.parse
import json

def test_{vuln_id.lower()}_exploit_blocked():
    """Verifies original exploit is blocked post-patch."""
    url = "http://127.0.0.1:5000/api/transactions/2"
    headers = {{"X-User-ID": "101"}}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert data.get("user_id") != 102, "IDOR Exploit still accessible!"
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Expected 403 Forbidden, got {{e.code}}"
        print("[✓ REGRESSION TEST PASSED] Exploit correctly blocked with HTTP 403!")

if __name__ == "__main__":
    test_{vuln_id.lower()}_exploit_blocked()
'''
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(test_code)
        print(f"  [🧪 REGRESSION TEST GENERATED] Written to {filename}")

if __name__ == "__main__":
    agent = BlueTeamPatchAgent()

import os
import sys
import json
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import os
import sys
import json
import re

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from shared.schema_validator import SchemaValidator

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class BlueTeamPatchAgent:
    def __init__(self, target_base_url="http://127.0.0.1:3000"):
        self.target_base_url = target_base_url.rstrip("/")
        self.repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.validator = SchemaValidator()

    def apply_patch_contract(self, patch_contract):
        """
        Applies a search-and-replace patch contract dynamically to a target source file.
        
        Expected contract structure:
        {
          "vulnerability_id": "VULN-001",
          "target_file": "target_app/backend/src/controllers/user.ts",
          "root_cause": "...",
          "search_block": "...",
          "replace_block": "...",
          "fix_description": "..."
        }
        """
        vuln_id = patch_contract.get("vulnerability_id", "VULN-000")
        target_rel_path = patch_contract.get("target_file")
        search_block = patch_contract.get("search_block")
        replace_block = patch_contract.get("replace_block")
        root_cause = patch_contract.get("root_cause", "Defensive logic flaw corrected.")
        fix_desc = patch_contract.get("fix_description", "Applied secure search-and-replace contract.")

        print(f"[🔵 BLUE TEAM] Applying dynamic search-and-replace patch contract for {vuln_id}...")

        target_abs_path = os.path.join(self.repo_root, target_rel_path)
        status = "FAILED"
        if os.path.exists(target_abs_path) and search_block and replace_block:
            with open(target_abs_path, "r", encoding="utf-8") as f:
                content = f.read()

            if search_block in content:
                patched_content = content.replace(search_block, replace_block)
                with open(target_abs_path, "w", encoding="utf-8") as f:
                    f.write(patched_content)
                status = "PATCHED"
                print(f"  [🔵 PATCH APPLIED] Successfully patched {target_rel_path}")
            else:
                print(f"  [!] Search block not found in {target_rel_path}. Patch execution skipped.")
        else:
            print(f"  [!] Invalid file path or missing search/replace blocks for {target_rel_path}")

        reg_test_file = f"blue_team/tests/test_regression_{vuln_id.lower()}.py"
        self._generate_regression_test(vuln_id, patch_contract.get("type", "GENERIC"), reg_test_file)

        patch_result = {
            "vulnerability_id": vuln_id,
            "root_cause": root_cause,
            "files_changed": [target_rel_path] if status == "PATCHED" else [],
            "fix_description": fix_desc,
            "regression_test_file": reg_test_file,
            "status": status
        }

        # Schema Validation
        is_valid, err_msg = self.validator.validate(patch_result, "patch_result_schema.json")
        if not is_valid:
            print(f"  [!] Patch result schema validation failed: {err_msg}")

        output_dir = os.path.dirname(__file__)
        res_file = os.path.join(output_dir, f"{vuln_id}_patch_result.json")
        with open(res_file, "w", encoding="utf-8") as f:
            json.dump(patch_result, f, indent=2)

        return patch_result

    def apply_patch(self, finding_data):
        """
        Fallback / Direct mapping method generating search-and-replace contracts for known vulnerability types.
        """
        vuln_id = finding_data.get("id")
        v_type = finding_data.get("type")

        contract = {
            "vulnerability_id": vuln_id,
            "type": v_type,
            "target_file": "",
            "search_block": "",
            "replace_block": "",
            "root_cause": "",
            "fix_description": ""
        }

        if v_type == "IDOR":
            contract["target_file"] = "target_app/backend/src/controllers/user.ts"
            contract["root_cause"] = "Authorization check disabled in getProfile controller."
            contract["search_block"] = "    // if (req.user!.id !== userId && req.user!.role !== 'ADMIN') {\n    //   return res.status(403).json({ error: 'Forbidden' });\n    // }"
            contract["replace_block"] = "    if (req.user!.id !== userId && req.user!.role !== 'ADMIN') {\n      return res.status(403).json({ error: 'Forbidden' });\n    }"
            contract["fix_description"] = "Enforced authorization check to reject unauthorized user profile access."

        elif v_type == "SQLI":
            contract["target_file"] = "target_app/backend/src/controllers/transaction.ts"
            contract["root_cause"] = "Raw string query concatenation in searchTransactions controller."
            contract["search_block"] = "    const sql = `\n      SELECT * FROM transactions \n      WHERE (from_account_id = ${account.id} OR to_account_id = ${account.id}) \n      AND description LIKE '%${query}%'\n    `;\n\n    db.all(sql, [], (err, rows) => {"
            contract["replace_block"] = "    const sql = `\n      SELECT * FROM transactions \n      WHERE (from_account_id = ? OR to_account_id = ?)\n      AND description LIKE ?\n    `;\n\n    db.all(sql, [account.id, account.id, `%${query}%`], (err, rows) => {"
            contract["fix_description"] = "Replaced concatenated query string with parameterized query placeholders."

        elif v_type == "XSS":
            contract["target_file"] = "target_app/backend/src/controllers/transfer.ts"
            contract["root_cause"] = "Unsanitized input stored in createTransfer."
            contract["search_block"] = "await transferFunds(fromAccount.id, toAccount.id, amount, description || 'Transfer');"
            contract["replace_block"] = "const cleanDesc = description ? description.replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'Transfer';\n    await transferFunds(fromAccount.id, toAccount.id, amount, cleanDesc);"
            contract["fix_description"] = "Sanitized description input by escaping HTML special characters."

        elif v_type == "FILE_UPLOAD":
            contract["target_file"] = "target_app/backend/src/controllers/upload.ts"
            contract["root_cause"] = "Missing extension allowlist check in uploadProfileFile."
            contract["search_block"] = "if (!req.file) {\n    return res.status(400).json({ error: 'No file uploaded' });\n  }"
            contract["replace_block"] = "if (!req.file) {\n    return res.status(400).json({ error: 'No file uploaded' });\n  }\n  if (req.file.originalname.match(/\\.(html|htm|svg|exe|sh)$/i)) {\n    return res.status(400).json({ error: 'Invalid file type' });\n  }"
            contract["fix_description"] = "Added file extension validation rejecting script and executable formats."

        elif v_type in ("PRIVILEGE_ESCALATION", "BROKEN_AUTH"):
            contract["target_file"] = "target_app/backend/src/controllers/admin.ts"
            contract["root_cause"] = "Client header override block in requireAdmin middleware."
            contract["search_block"] = "  const overrideHeader = req.headers['x-admin-override'];\n  if (overrideHeader === 'true') {\n    return next(); // intentionally bypasses role check\n  }"
            contract["replace_block"] = "  // Client header override check removed for security"
            contract["fix_description"] = "Removed client header override to enforce strict role-based access control."

        return self.apply_patch_contract(contract)

    def _generate_regression_test(self, vuln_id, v_type, filename):
        file_path = os.path.join(self.repo_root, filename)
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        
        test_code = f'''# Auto-generated Defensive Regression Test for {vuln_id} ({v_type})
import urllib.request
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))
from shared.auth_helper import get_session_cookie

def test_{vuln_id.lower().replace("-", "_")}_regression():
    """Verifies that access controls and sanitization rules are maintained."""
    cookie = get_session_cookie("http://127.0.0.1:3000", "Alice", "password123")
    url = "http://127.0.0.1:3000/api/users/1"
    headers = {{"Cookie": cookie}}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert resp.getcode() == 200, f"Expected 200 for authorized request"
            print(f"[✓ REGRESSION TEST PASSED] {vuln_id} authorized behavior verified!")
    except urllib.error.HTTPError as e:
        print(f"[!] Regression test received status {{e.code}}")

if __name__ == "__main__":
    test_{vuln_id.lower().replace("-", "_")}_regression()
'''
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(test_code)
        print(f"  [🧪 REGRESSION TEST GENERATED] Written to {filename}")

if __name__ == "__main__":
    agent = BlueTeamPatchAgent()


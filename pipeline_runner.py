import os
import sys
import time
import json
import subprocess
import urllib.request

# Ensure UTF-8 stdout encoding on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure workspace modules can be imported
sys.path.append(os.path.dirname(__file__))

from red_team.recon.recon_agent import ReconAgent
from red_team.attacks.attack_agents import RedTeamAttackEngine
from security_judge.validation.judge_engine import SecurityJudgeEngine
from risk_analyzer.risk_analyzer import RiskAnalyzer
from blue_team.patches.patch_agent import BlueTeamPatchAgent
from verifier.verification_engine import VerificationEngine
from red_team.attacks.adaptive_reattack import AdaptiveRedTeam

def reset_patch_config():
    # Helper retained for compatibility
    pass

def is_server_running(url="http://127.0.0.1:3000/health"):
    try:
        with urllib.request.urlopen(url) as resp:
            return resp.getcode() == 200
    except Exception:
        return False

def main():
    print("=" * 80)
    print(" [+] ADVERSARIAL DEVSECOPS PIPELINE ENGINE")
    print(" Autonomous Red Team vs Blue Team Security Loop")
    print("=" * 80)

    # Ensure target server is active
    server_process = None
    if not is_server_running():
        print("[!] Target App (SecureBank) server on http://127.0.0.1:3000 is not detected.")
        print("[!] Please start the target_app backend server (e.g., 'npm run dev' inside target_app).")

    target_url = "http://127.0.0.1:3000"

    try:
        # STEP 1: RECON
        print("\n" + "-"*50)
        print("STAGE 1: [RECON] RECONNAISSANCE")
        print("-"*50)
        recon = ReconAgent(target_url)
        recon_data = recon.discover_attack_surface()

        # STEP 2: RED TEAM ATTACK
        print("\n" + "-"*50)
        print("STAGE 2: [RED TEAM] EXPLOITATION")
        print("-"*50)
        red_engine = RedTeamAttackEngine(target_url)
        idor_finding = red_engine.run_idor_attack()
        sqli_finding = red_engine.run_sqli_attack()

        findings = [f for f in [idor_finding, sqli_finding] if f is not None]

        if not findings:
            print("[!] No vulnerabilities discovered.")
            return

        # Process each confirmed vulnerability through the closed loop
        for finding in findings:
            vuln_id = finding["id"]
            print("\n" + "="*60)
            print(f" PROCESSING VULNERABILITY LOOP FOR: {vuln_id} ({finding['type']})")
            print("="*60)

            # STEP 3: SECURITY JUDGE
            print("\n" + "-"*40)
            print("STAGE 3: [SECURITY JUDGE] VALIDATION")
            print("-"*40)
            judge = SecurityJudgeEngine(target_url)
            judge_res = judge.validate_finding(finding)

            if judge_res["validation_status"] != "CONFIRMED":
                print(f"[!] Finding {vuln_id} rejected by Security Judge. Skipping remediation.")
                continue

            # STEP 4: RISK ANALYZER
            print("\n" + "-"*40)
            print("STAGE 4: [RISK ANALYZER] PRIORITIZATION")
            print("-"*40)
            risk = RiskAnalyzer()
            risk_res = risk.analyze_finding(finding)

            # STEP 5: BLUE TEAM PATCHING
            print("\n" + "-"*40)
            print("STAGE 5: [BLUE TEAM] REMEDIATION & PATCHING")
            print("-"*40)
            blue = BlueTeamPatchAgent(target_url)
            patch_res = blue.apply_patch(finding)

            # STEP 6: VERIFICATION TEAM
            print("\n" + "-"*40)
            print("STAGE 6: [VERIFICATION TEAM] PROOF")
            print("-"*40)
            verifier = VerificationEngine(target_url)
            verify_res = verifier.verify_patch(finding, patch_res)

            # STEP 7: ADAPTIVE RED TEAM RE-ATTACK
            print("\n" + "-"*40)
            print("STAGE 7: [ADAPTIVE RED TEAM] RE-ATTACK")
            print("-"*40)
            adaptive = AdaptiveRedTeam(target_url)
            reattack_res = adaptive.attempt_adaptive_reattack(vuln_id)

            # SUMMARY
            print("\n" + "*"*60)
            print(f" CLOSED LOOP SUMMARY FOR {vuln_id}")
            print(f" * Vulnerability:     {finding['type']} ({finding['endpoint']})")
            print(f" * Security Judge:    {judge_res['validation_status']} (VERIFIED)")
            print(f" * Risk Priority:     {risk_res['priority']} (Score: {risk_res['risk_score']})")
            print(f" * Blue Team Fix:     {patch_res['status']} ({patch_res['files_changed'][0]})")
            print(f" * Verification:      {verify_res['overall_status']} (Original Exploit: {verify_res['original_exploit']})")
            print(f" * Adaptive Re-attack:{'NEW PATH DISCOVERED' if reattack_res['new_attack_found'] else 'DEFENSE VERIFIED & SECURE'}")
            print("*"*60)

    finally:
        if server_process:
            print("\n[+] Shutting down mock target server...")
            server_process.terminate()

if __name__ == "__main__":
    main()

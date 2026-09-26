import os
import sys
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class RiskAnalyzer:
    def analyze_finding(self, finding_data):
        vuln_id = finding_data.get("id")
        v_type = finding_data.get("type")
        
        print(f"[📊 RISK ANALYZER] Analyzing risk factors for {vuln_id} ({v_type})...")

        if v_type == "IDOR":
            report = {
                "vulnerability_id": vuln_id,
                "priority": "HIGH",
                "risk_score": 8.5,
                "exploitability": "High - Requires minimal authorization header manipulation",
                "business_impact": "High - Unauthorized exposure of user financial transactions",
                "required_privilege": "Authenticated Low-Privilege User",
                "remediation_urgency": "Immediate (24-48 hrs)"
            }
        elif v_type == "SQLI":
            report = {
                "vulnerability_id": vuln_id,
                "priority": "CRITICAL",
                "risk_score": 9.8,
                "exploitability": "Extreme - Unauthenticated parameter injection",
                "business_impact": "Critical - Complete database exfiltration or corruption possible",
                "required_privilege": "Unauthenticated Public Access",
                "remediation_urgency": "Immediate (Emergency Patch)"
            }
        else:
            report = {
                "vulnerability_id": vuln_id,
                "priority": "MEDIUM",
                "risk_score": 5.5,
                "exploitability": "Moderate",
                "business_impact": "Moderate",
                "required_privilege": "Authenticated User",
                "remediation_urgency": "Standard Sprint Cycle"
            }

        print(f"  [📊 RISK SCORE] {report['priority']} (Score: {report['risk_score']}/10) | Urgency: {report['remediation_urgency']}")

        output_dir = os.path.dirname(__file__)
        report_file = os.path.join(output_dir, f"{vuln_id}_risk_report.json")
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)

        return report

if __name__ == "__main__":
    analyzer = RiskAnalyzer()

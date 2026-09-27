"""
SecureBank Dashboard Backend
Provides a safe API layer between the browser and the pipeline.
"""
import os
import sys
import json
import time
import threading
import subprocess
import urllib.request
from pathlib import Path
from datetime import datetime

# Flask
from flask import Flask, jsonify, Response, send_from_directory
from flask_cors import CORS

# Ensure workspace root is importable
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

DIST_DIR = Path(__file__).parent / "dist"
app = Flask(__name__, static_folder=None)
CORS(app)

# ── State ──────────────────────────────────────────────────────────────────────
_pipeline_state = {
    "status": "idle",       # idle | running | completed | failed
    "started_at": None,
    "finished_at": None,
    "error": None,
    "stages": {
        "recon":      {"status": "waiting", "started_at": None, "finished_at": None},
        "red_team":   {"status": "waiting", "started_at": None, "finished_at": None},
        "judge":      {"status": "waiting", "started_at": None, "finished_at": None},
        "risk":       {"status": "waiting", "started_at": None, "finished_at": None},
        "blue_team":  {"status": "waiting", "started_at": None, "finished_at": None},
        "verifier":   {"status": "waiting", "started_at": None, "finished_at": None},
        "reattack":   {"status": "waiting", "started_at": None, "finished_at": None},
    },
    "log": [],
}
_lock = threading.Lock()
_pipeline_process = None

STAGE_ORDER = ["recon", "red_team", "judge", "risk", "blue_team", "verifier", "reattack"]

STAGE_LABELS = {
    "STAGE 1": "recon",
    "STAGE 2": "red_team",
    "STAGE 3": "judge",
    "STAGE 4": "risk",
    "STAGE 5": "blue_team",
    "STAGE 6": "verifier",
    "STAGE 7": "reattack",
}


# ── Artifact paths ────────────────────────────────────────────────────────────
ARTIFACT_ALLOWLIST = {
    "recon_map":       ROOT / "red_team/reports/recon_map.json",
    "VULN-001_finding":ROOT / "red_team/reports/VULN-001_finding.json",
    "VULN-002_finding":ROOT / "red_team/reports/VULN-002_finding.json",
    "VULN-003_finding":ROOT / "red_team/reports/VULN-003_finding.json",
    "VULN-004_finding":ROOT / "red_team/reports/VULN-004_finding.json",
    "VULN-005_finding":ROOT / "red_team/reports/VULN-005_finding.json",
    "VULN-001_judge":  ROOT / "security_judge/reports/VULN-001_judge_result.json",
    "VULN-002_judge":  ROOT / "security_judge/reports/VULN-002_judge_result.json",
    "VULN-003_judge":  ROOT / "security_judge/reports/VULN-003_judge_result.json",
    "VULN-004_judge":  ROOT / "security_judge/reports/VULN-004_judge_result.json",
    "VULN-005_judge":  ROOT / "security_judge/reports/VULN-005_judge_result.json",
    "VULN-001_risk":   ROOT / "risk_analyzer/VULN-001_risk_report.json",
    "VULN-002_risk":   ROOT / "risk_analyzer/VULN-002_risk_report.json",
    "VULN-003_risk":   ROOT / "risk_analyzer/VULN-003_risk_report.json",
    "VULN-004_risk":   ROOT / "risk_analyzer/VULN-004_risk_report.json",
    "VULN-005_risk":   ROOT / "risk_analyzer/VULN-005_risk_report.json",
    "VULN-001_patch":  ROOT / "blue_team/patches/VULN-001_patch_result.json",
    "VULN-002_patch":  ROOT / "blue_team/patches/VULN-002_patch_result.json",
    "VULN-003_patch":  ROOT / "blue_team/patches/VULN-003_patch_result.json",
    "VULN-004_patch":  ROOT / "blue_team/patches/VULN-004_patch_result.json",
    "VULN-005_patch":  ROOT / "blue_team/patches/VULN-005_patch_result.json",
    "VULN-001_verify": ROOT / "verifier/VULN-001_verification_result.json",
    "VULN-002_verify": ROOT / "verifier/VULN-002_verification_result.json",
    "VULN-003_verify": ROOT / "verifier/VULN-003_verification_result.json",
    "VULN-004_verify": ROOT / "verifier/VULN-004_verification_result.json",
    "VULN-005_verify": ROOT / "verifier/VULN-005_verification_result.json",
    "test_vuln-001":   ROOT / "blue_team/tests/test_regression_vuln-001.py",
    "test_vuln-002":   ROOT / "blue_team/tests/test_regression_vuln-002.py",
    "test_vuln-003":   ROOT / "blue_team/tests/test_regression_vuln-003.py",
    "test_vuln-004":   ROOT / "blue_team/tests/test_regression_vuln-004.py",
    "test_vuln-005":   ROOT / "blue_team/tests/test_regression_vuln-005.py",
}


def _read_json(path: Path):
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def _read_text(path: Path):
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return None


def _auto_start_target():
    """Auto-start Mock SecureBank Target App on port 3000 in background."""
    try:
        with urllib.request.urlopen("http://127.0.0.1:3000/health", timeout=1) as r:
            if r.getcode() == 200:
                return True
    except Exception:
        pass
    try:
        mock_app = ROOT / "mock_target_app" / "app.py"
        if mock_app.exists():
            subprocess.Popen([sys.executable, str(mock_app)], cwd=str(ROOT))
            time.sleep(1.5)
            with urllib.request.urlopen("http://127.0.0.1:3000/health", timeout=2) as r:
                return r.getcode() == 200
    except Exception as e:
        print(f"Target auto-start error: {e}")
    return True


def _is_target_running():
    try:
        with urllib.request.urlopen("http://127.0.0.1:3000/health", timeout=1) as r:
            if r.getcode() == 200:
                return True
    except Exception:
        pass
    return _auto_start_target()


# Auto-start mock target app on server launch
threading.Thread(target=_auto_start_target, daemon=True).start()


def _run_pipeline_thread():
    global _pipeline_state, _pipeline_process
    with _lock:
        _pipeline_state["status"] = "running"
        _pipeline_state["started_at"] = datetime.utcnow().isoformat() + "Z"
        _pipeline_state["finished_at"] = None
        _pipeline_state["error"] = None
        _pipeline_state["log"] = []
        for s in STAGE_ORDER:
            _pipeline_state["stages"][s] = {"status": "waiting", "started_at": None, "finished_at": None}

    try:
        python_exec = sys.executable
        proc = subprocess.Popen(
            [python_exec, str(ROOT / "pipeline_runner.py")],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            cwd=str(ROOT),
        )
        with _lock:
            _pipeline_process = proc

        current_stage = None
        for line in proc.stdout:
            line = line.rstrip()
            with _lock:
                _pipeline_state["log"].append(line)

            # Detect stage transitions
            for label, stage_key in STAGE_LABELS.items():
                if label in line and "STAGE" in line:
                    now = datetime.utcnow().isoformat() + "Z"
                    with _lock:
                        if current_stage and _pipeline_state["stages"][current_stage]["status"] == "running":
                            _pipeline_state["stages"][current_stage]["status"] = "completed"
                            _pipeline_state["stages"][current_stage]["finished_at"] = now
                        _pipeline_state["stages"][stage_key]["status"] = "running"
                        _pipeline_state["stages"][stage_key]["started_at"] = now
                        current_stage = stage_key

        proc.wait()
        now = datetime.utcnow().isoformat() + "Z"
        with _lock:
            if current_stage and _pipeline_state["stages"][current_stage]["status"] == "running":
                _pipeline_state["stages"][current_stage]["status"] = "completed"
                _pipeline_state["stages"][current_stage]["finished_at"] = now
            if proc.returncode == 0:
                _pipeline_state["status"] = "completed"
            else:
                _pipeline_state["status"] = "failed"
                _pipeline_state["error"] = f"Exit code {proc.returncode}"
            _pipeline_state["finished_at"] = now
    except Exception as e:
        with _lock:
            _pipeline_state["status"] = "failed"
            _pipeline_state["error"] = str(e)
            _pipeline_state["finished_at"] = datetime.utcnow().isoformat() + "Z"


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/health")
def api_health():
    return jsonify({"ok": True, "target_running": _is_target_running()})


@app.route("/api/pipeline/status")
def pipeline_status():
    with _lock:
        return jsonify(dict(_pipeline_state))


@app.route("/api/pipeline/run", methods=["POST"])
def pipeline_run():
    with _lock:
        if _pipeline_state["status"] == "running":
            return jsonify({"error": "Pipeline is already running."}), 409
    if not _is_target_running():
        return jsonify({"error": "SecureBank target is not running at http://127.0.0.1:3000"}), 503
    t = threading.Thread(target=_run_pipeline_thread, daemon=True)
    t.start()
    return jsonify({"ok": True, "message": "Pipeline started."})


@app.route("/api/pipeline/log")
def pipeline_log():
    """Server-Sent Events stream for live log output."""
    def generate():
        sent = 0
        while True:
            with _lock:
                lines = _pipeline_state["log"]
                new_lines = lines[sent:]
                status = _pipeline_state["status"]
            for line in new_lines:
                yield f"data: {json.dumps({'line': line})}\n\n"
            sent += len(new_lines)
            if status in ("completed", "failed") and not new_lines:
                yield f"data: {json.dumps({'done': True, 'status': status})}\n\n"
                break
            time.sleep(0.3)
    return Response(generate(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.route("/api/findings")
def findings():
    vulns = ["VULN-001", "VULN-002", "VULN-003", "VULN-004", "VULN-005"]
    results = []
    for vid in vulns:
        finding = _read_json(ROOT / f"red_team/reports/{vid}_finding.json")
        judge   = _read_json(ROOT / f"security_judge/reports/{vid}_judge_result.json")
        risk    = _read_json(ROOT / f"risk_analyzer/{vid}_risk_report.json")
        patch   = _read_json(ROOT / f"blue_team/patches/{vid}_patch_result.json")
        verify  = _read_json(ROOT / f"verifier/{vid}_verification_result.json")
        if finding:
            results.append({
                "id": vid,
                "finding": finding,
                "judge": judge,
                "risk": risk,
                "patch": patch,
                "verify": verify,
            })
    return jsonify(results)


@app.route("/api/findings/<vuln_id>")
def finding_detail(vuln_id):
    vuln_id = vuln_id.upper()
    if not vuln_id.startswith("VULN-") or not vuln_id[5:].isdigit():
        return jsonify({"error": "Invalid ID"}), 400
    finding = _read_json(ROOT / f"red_team/reports/{vuln_id}_finding.json")
    if not finding:
        return jsonify({"error": "Not found"}), 404
    judge  = _read_json(ROOT / f"security_judge/reports/{vuln_id}_judge_result.json")
    risk   = _read_json(ROOT / f"risk_analyzer/{vuln_id}_risk_report.json")
    patch  = _read_json(ROOT / f"blue_team/patches/{vuln_id}_patch_result.json")
    verify = _read_json(ROOT / f"verifier/{vuln_id}_verification_result.json")
    return jsonify({"id": vuln_id, "finding": finding, "judge": judge, "risk": risk, "patch": patch, "verify": verify})


@app.route("/api/artifacts")
def artifacts_list():
    result = []
    for key in ARTIFACT_ALLOWLIST:
        p = ARTIFACT_ALLOWLIST[key]
        result.append({"id": key, "path": str(p.relative_to(ROOT)), "exists": p.exists()})
    return jsonify(result)


@app.route("/api/artifacts/<artifact_id>")
def artifact_detail(artifact_id):
    path = ARTIFACT_ALLOWLIST.get(artifact_id)
    if not path:
        return jsonify({"error": "Artifact not in allowlist"}), 404
    if not path.exists():
        return jsonify({"error": "Artifact not yet generated"}), 404
    if path.suffix == ".json":
        data = _read_json(path)
        return jsonify({"id": artifact_id, "type": "json", "path": str(path.relative_to(ROOT)), "content": data})
    else:
        data = _read_text(path)
        return jsonify({"id": artifact_id, "type": "text", "path": str(path.relative_to(ROOT)), "content": data})


@app.route("/api/metrics")
def metrics():
    findings_data = []
    confirmed = 0
    remediated = 0
    regression_tests = 0
    verification_checks = 0
    for vid in ["VULN-001", "VULN-002", "VULN-003", "VULN-004", "VULN-005"]:
        f = _read_json(ROOT / f"red_team/reports/{vid}_finding.json")
        if not f:
            continue
        findings_data.append(f)
        j = _read_json(ROOT / f"security_judge/reports/{vid}_judge_result.json")
        if j and j.get("validation_status") == "CONFIRMED":
            confirmed += 1
        p = _read_json(ROOT / f"blue_team/patches/{vid}_patch_result.json")
        if p and p.get("status") == "PATCHED":
            remediated += 1
        test_f = ROOT / f"blue_team/tests/test_regression_vuln-{vid.split('-')[1].lower()}.py"
        # normalize - the file uses lowercase with leading zeros removed
        num = vid.split("-")[1]
        test_f = ROOT / f"blue_team/tests/test_regression_vuln-{num.lstrip('0') if num.lstrip('0') else '0'}0{num}.py"
        # simpler: just check using the pattern
        test_matches = list((ROOT / "blue_team/tests").glob(f"test_regression_vuln-{num.lower()}*.py"))
        if not test_matches:
            test_matches = list((ROOT / "blue_team/tests").glob(f"*{num}*.py"))
        if test_matches:
            regression_tests += 1
        v = _read_json(ROOT / f"verifier/{vid}_verification_result.json")
        if v:
            verification_checks += 1

    with _lock:
        started = _pipeline_state["started_at"]
        finished = _pipeline_state["finished_at"]
    runtime_seconds = None
    if started and finished:
        try:
            t0 = datetime.fromisoformat(started.replace("Z", "+00:00"))
            t1 = datetime.fromisoformat(finished.replace("Z", "+00:00"))
            runtime_seconds = int((t1 - t0).total_seconds())
        except Exception:
            pass

    return jsonify({
        "total_findings": len(findings_data),
        "confirmed": confirmed,
        "remediated": remediated,
        "regression_tests": regression_tests,
        "verification_checks": verification_checks,
        "runtime_seconds": runtime_seconds,
        "stages_total": 7,
    })


# ── Static UI Serving (Production) ────────────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"error": "Endpoint not found"}), 404
    target = DIST_DIR / path
    if path != "" and target.is_file():
        return send_from_directory(str(DIST_DIR), path)
    index_file = DIST_DIR / "index.html"
    if index_file.is_file():
        return send_from_directory(str(DIST_DIR), "index.html")
    return jsonify({
        "message": "SecureBank Dashboard API running. Build frontend with 'npm run build' inside dashboard/ to serve the UI."
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"SecureBank Dashboard API starting on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)

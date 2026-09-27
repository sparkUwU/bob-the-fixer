import os
import sys
import json
import sqlite3
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "patch_config.json")

def load_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def init_db():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE transactions (id INTEGER PRIMARY KEY, user_id INTEGER, to_account_id TEXT, amount REAL, description TEXT);")
    cursor.execute("INSERT INTO transactions VALUES (1, 101, 'ACC-1001', 500.0, 'Salary deposit');")
    cursor.execute("INSERT INTO transactions VALUES (2, 102, 'ACC-1002', 1200.0, 'Secret Offshore Transfer');")
    cursor.execute("INSERT INTO transactions VALUES (3, 103, 'ACC-1003', 45.0, 'Dinner');")
    conn.commit()
    return conn

db_conn = init_db()

class MockBankHandler(BaseHTTPRequestHandler):
    def _set_json_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        config = load_config()

        if path == "/health":
            self._set_json_headers(200)
            self.wfile.write(json.dumps({"status": "ok", "app": "SecureBank Target"}).encode('utf-8'))
            return

        # VULN-001: IDOR on /api/users/2
        if path.startswith("/api/users/"):
            user_id = path.split("/")[-1]
            if user_id == "2":
                if config.get("IDOR_FIXED", False):
                    self._set_json_headers(403)
                    self.wfile.write(json.dumps({"error": "Forbidden"}).encode('utf-8'))
                    return
                self._set_json_headers(200)
                self.wfile.write(json.dumps({"user": {"id": 2, "username": "Bob", "email": "bob@securebank.local"}}).encode('utf-8'))
                return

        # VULN-002: SQLi on /api/transactions/search
        if path == "/api/transactions/search":
            q_val = query.get("q", [""])[0]
            if config.get("SQLI_FIXED", False):
                self._set_json_headers(200)
                self.wfile.write(json.dumps({"transactions": [{"id": 1, "description": "Salary deposit", "to_account_id": "ACC-1001"}]}).encode('utf-8'))
                return
            if "' OR 1=1" in q_val or "1=1" in q_val:
                self._set_json_headers(200)
                self.wfile.write(json.dumps({
                    "transactions": [
                        {"id": 1, "description": "Salary deposit", "to_account_id": "ACC-1001"},
                        {"id": 3, "description": "Dinner", "to_account_id": "ACC-1003"}
                    ]
                }).encode('utf-8'))
                return
            self._set_json_headers(200)
            self.wfile.write(json.dumps({"transactions": []}).encode('utf-8'))
            return

        # VULN-005: Privilege Escalation on /api/admin/users
        if path == "/api/admin/users":
            override = self.headers.get("X-Admin-Override", "")
            if config.get("PRIV_FIXED", False):
                self._set_json_headers(403)
                self.wfile.write(json.dumps({"error": "Forbidden"}).encode('utf-8'))
                return
            if override == "true":
                self._set_json_headers(200)
                self.wfile.write(json.dumps({"users": [{"id": 1, "name": "Admin"}, {"id": 2, "name": "Bob"}]}).encode('utf-8'))
                return
            self._set_json_headers(403)
            self.wfile.write(json.dumps({"error": "Admin required"}).encode('utf-8'))
            return

        self._set_json_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        config = load_config()

        # Auth login endpoint
        if path == "/api/auth/login":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Set-Cookie", "session_token=mock_alice_session_123; Path=/")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "token": "mock_alice_session_123"}).encode('utf-8'))
            return

        # VULN-003: Stored XSS on /api/transfers
        if path == "/api/transfers":
            if config.get("XSS_FIXED", False):
                self._set_json_headers(400)
                self.wfile.write(json.dumps({"error": "Sanitization failed"}).encode('utf-8'))
                return
            self._set_json_headers(200)
            self.wfile.write(json.dumps({"status": "success", "message": "Transfer submitted"}).encode('utf-8'))
            return

        # VULN-004: Unsafe File Upload on /api/profile/upload
        if path == "/api/profile/upload":
            if config.get("FILE_UPLOAD_FIXED", False):
                self._set_json_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid file extension"}).encode('utf-8'))
                return
            self._set_json_headers(200)
            self.wfile.write(json.dumps({"file": {"original_name": "test-malicious.html", "stored_name": "upload_99.html"}}).encode('utf-8'))
            return

        self._set_json_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

    def log_message(self, format, *args):
        pass

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

def run_server(port=3000):
    server_address = ('127.0.0.1', port)
    try:
        httpd = ReusableHTTPServer(server_address, MockBankHandler)
        print(f"[+] Mock Target App listening on http://127.0.0.1:{port}")
        httpd.serve_forever()
    except OSError as e:
        if e.errno in (98, 10048):
            print(f"[!] Target server already active on port {port}.")
        else:
            raise

if __name__ == "__main__":
    port = int(os.environ.get("TARGET_PORT", 3000))
    run_server(port)

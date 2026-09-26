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
        with open(CONFIG_PATH, "r") as f:
            return json.load(f)
    return {"IDOR_FIXED": False, "SQLI_FIXED": False, "XSS_FIXED": False}

def init_db():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE transactions (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL, description TEXT);")
    cursor.execute("INSERT INTO transactions VALUES (1, 101, 500.0, 'Salary deposit');")
    cursor.execute("INSERT INTO transactions VALUES (2, 102, 1200.0, 'Secret Offshore Transfer');")
    cursor.execute("INSERT INTO transactions VALUES (3, 101, 45.0, 'Grocery store');")
    conn.commit()
    return conn

# Global in-memory DB connection
db_conn = init_db()

class MockBankHandler(BaseHTTPRequestHandler):
    def _set_json_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        config = load_config()

        if path == "/health":
            self._set_json_headers(200)
            self.wfile.write(json.dumps({"status": "ok", "app": "SecureBank Mock Target"}).encode('utf-8'))
            return

        elif path.startswith("/api/transactions/"):
            subpath = path[len("/api/transactions/"):]
            
            if subpath == "search":
                # VULN-002: SQL Injection
                q_val = query.get("q", [""])[0]
                cursor = db_conn.cursor()
                if config.get("SQLI_FIXED", False):
                    cursor.execute("SELECT id, user_id, amount, description FROM transactions WHERE description LIKE ?", (f"%{q_val}%",))
                else:
                    raw_sql = f"SELECT id, user_id, amount, description FROM transactions WHERE description LIKE '%{q_val}%'"
                    try:
                        cursor.execute(raw_sql)
                    except Exception as e:
                        self._set_json_headers(400)
                        self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                        return

                rows = cursor.fetchall()
                results = [{"id": r[0], "user_id": r[1], "amount": r[2], "description": r[3]} for r in rows]
                self._set_json_headers(200)
                self.wfile.write(json.dumps({"results": results}).encode('utf-8'))
                return

            elif subpath.isdigit():
                # VULN-001: IDOR
                trans_id = int(subpath)
                user_id_header = self.headers.get("X-User-ID", "101")
                current_user_id = int(user_id_header) if user_id_header.isdigit() else 101

                cursor = db_conn.cursor()
                cursor.execute("SELECT id, user_id, amount, description FROM transactions WHERE id = ?", (trans_id,))
                row = cursor.fetchone()

                if not row:
                    self._set_json_headers(404)
                    self.wfile.write(json.dumps({"error": "Transaction not found"}).encode('utf-8'))
                    return

                t_id, owner_id, amount, desc = row

                # Enforce ownership check if patched
                if config.get("IDOR_FIXED", False):
                    if owner_id != current_user_id:
                        self._set_json_headers(403)
                        self.wfile.write(json.dumps({"error": "Unauthorized access to transaction"}).encode('utf-8'))
                        return

                self._set_json_headers(200)
                self.wfile.write(json.dumps({
                    "id": t_id,
                    "user_id": owner_id,
                    "amount": amount,
                    "description": desc
                }).encode('utf-8'))
                return

        self._set_json_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

    def log_message(self, format, *args):
        # Silence default HTTP server access log to keep test output clean
        pass

def run_server(port=5000):
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, MockBankHandler)
    print(f"[+] Mock Target App listening on http://127.0.0.1:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()

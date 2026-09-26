import urllib.request
import json

def get_session_cookie(base_url="http://127.0.0.1:3000", username="Alice", password="password123"):
    """
    Logs in to SecureBank (/api/auth/login) and returns the Cookie header string.
    """
    url = f"{base_url.rstrip('/')}/api/auth/login"
    payload = json.dumps({"username": username, "password": password}).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            set_cookie = resp.headers.get("Set-Cookie")
            if set_cookie:
                parts = set_cookie.split(";")
                for part in parts:
                    if part.strip().startswith("session_token="):
                        return part.strip()
                return set_cookie
            return ""
    except Exception as e:
        print(f"[!] Auth helper login failed for {username}: {e}")
        return ""

from fastapi import Depends, Header, HTTPException
from database import get_connection
from dotenv import load_dotenv
import os, time
import jwt

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError("JWT Secret is not set.")

def create_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp": int(time.time()) + 8 * 60 * 60}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def get_current_user_id(authorization: str = Header(None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=["HS256"])
        return int(payload["sub"])
    except jwt.InvalidTokenError as e:
        print(f"JWT rejected: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    except (KeyError, ValueError, TypeError) as e:
        print(f"JWT payload problem: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

def require_admin(user_id: int = Depends(get_current_user_id)) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT role FROM users WHERE userID = ?", (user_id,))
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
    if not row or row[0] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user_id
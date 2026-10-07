from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from database import get_connection
from users import hash_password
from pydantic import BaseModel
from dotenv import load_dotenv
import datetime
import bcrypt
import jwt
import os

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

api = FastAPI()

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
SECRET_KEY = os.getenv("SEC_KEY")
ALGORITHM = "HS256"

@api.get("/")
def root_msg():
    return {"message": "Hello from root! :D"}

class SignupRequest(BaseModel):
    name: str
    username: str
    email: str
    password: str

@api.post("/signup", status_code=201)
def signup(request: SignupRequest):
    na = request.name 
    us = request.username
    em = request.email
    pa = request.password
    hash_pa = hash_password(pa)
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO users (name, username, email, password) VALUES(%s, %s, %s, %s)", (na, us, em, hash_pa))
        conn.commit()
        return {"message": "Account created"}
    except Exception as e:
        print(f"Error adding user {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()

class LoginRequest(BaseModel):
    email: str
    password: str

@api.post("/login")
def verify_login(request: LoginRequest):
    email = request.email
    passwd = request.password.encode("utf-8")
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT userID, name, username, password FROM users WHERE email = %s LIMIT 1", (email,))
        db_result = cursor.fetchone()
        if db_result is None:
            raise HTTPException(status_code=401, detail="Invalid credientials")
        userID = db_result[0]
        name = db_result[1]
        username = db_result[2]
        check_pw = db_result[3].encode("utf-8")
        if bcrypt.checkpw(passwd, check_pw):
            payload = {
                "user_id": userID,
                "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=60)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
            return {"id": userID, "username": username, "name": name, "token": token}
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()

class NewEventRequest(BaseModel):
    user_id: str
    title: str
    desc: str
    start_time: str
    end_time: str
    visibility: str

@api.post("/new_event", status_code=201)
def signup(request: NewEventRequest):
    u_id = int(request.user_id)
    ti = request.title 
    de = request.desc
    st = request.start_time
    en = request.end_time
    vi = request.visibility
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO events (owner_id, title, description, start_time, end_time, visibility) VALUES(%d, %s, %s, %s, %s, %s)", (u_id, ti, de, st, en, vi))
        conn.commit()
        return {"message": "New event added."}
    except Exception as e:
        print(f"Error adding user {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()

@api.get("/get_events")
def get_events(user_id: int, start: str, end: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT title, description, start_time, end_time, visibility, created_at FROM events WHERE owner_id = %s AND start_time >= %s and end_time < %s ORDER BY start_time", (user_id, start, end))
        rows = cursor.fetchall()

        for r in rows:
            r["start_time"] = r["start_time"].isoformat() + "Z"
            r["end_time"] = r["end_time"].isoformat() + "Z"
        return rows
    except Exception as e:
        print(f"Error fetching events: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()
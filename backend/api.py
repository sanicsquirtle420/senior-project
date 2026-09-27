from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from database import get_connection
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

# api.post("/signup")

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
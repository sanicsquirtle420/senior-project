from fastapi import FastAPI, HTTPException
from database import get_connection
from users import hash_password
import bcrypt

api = FastAPI()

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
            cursor.execute("SELECT password FROM users WHERE email = %s LIMIT 1", (email))
            db_passwd = cursor.fetchone()
            if bcrypt.checkpw(passwd, db_passwd):
                return True
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None
        finally:
            cursor.close()
            conn.close()


# if not bcrypt.checkpw(usr_input, hashed_passwd):
#             self.error.text = "Incorrect password"
#             return
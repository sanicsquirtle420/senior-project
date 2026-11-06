from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from database import get_connection
from users import hash_password
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List
import datetime
import bcrypt
import jwt
import os

origins = [
    "https://juno.raccoon2891.com",
    "https://kiriko.raccoon2891.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

api = FastAPI(
    title="PlanPal API",
    description="This is the API that makes calls from the React frontend to the MariaDB database.",
    version="2026-11-05",
    contact={
        "name": "Diego R. (SanicSquirtle428)",
        "url": "https://github.com/sanicsquirtle420"
    }
)

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

@api.get("/", tags=["Testing"])
def root_msg():
    """
    # Root Message
    Just a quick message to make sure the API is up and running.


    ![Aira Shiratori from DanDaDan](https://media1.tenor.com/m/4Keu8y07XFQAAAAd/dandadan-aira-shiratori-knocking-her-head-onto-a-bench-over-again-and-again.gif)
    """
    return {"message": "Hello from root! :D"}

class SignupRequest(BaseModel):
    name: str
    username: str
    email: str
    password: str

@api.post("/signup", status_code=201, tags=["Users"])
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

@api.post("/login", tags=["Users"])
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

@api.post("/new_event", status_code=201, tags=["Events"])
def signup(request: NewEventRequest):
    u_id = int(request.user_id)
    ti = request.title 
    de = request.desc.strip() or None
    st = request.start_time
    en = request.end_time
    vi = request.visibility
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO events (ownerID, title, description, start_time, end_time, visibility) VALUES(?, ?, ?, ?, ?, ?)", (u_id, ti, de, st, en, vi))
        conn.commit()
        return {"message": "New event added."}
    except Exception as e:
        print(f"Error adding user {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()

@api.get("/get_events", tags=["Events"])
def get_events(user_id: int, start: str, end: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT eventID, title, description, start_time, end_time, visibility, created_at FROM events WHERE ownerID = %s AND start_time >= %s and end_time < %s ORDER BY start_time", (user_id, start, end))
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

@api.get("/get_friends", tags=["Friends"])
def get_friends(userID: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT f.friendshipID, u.userID, u.name, u.username from friendship f join users u on u.userID = case when f.user1ID = ? then f.user2ID else f.user1ID end where (f.user1ID = ? or f.user2ID = ?) and f.status = \"accepted\"", (userID, userID, userID))
        rows = cursor.fetchall()
        return rows
    except Exception as e:
        print(f"Error fetching friends: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()

class NewFriendRequest(BaseModel):
    user1ID: str
    user2: str

@api.post("/new_friends", tags=["Friends"])
def new_friends(request: NewFriendRequest):
    u1_id = int(request.user1ID)
    u2_na = request.user2

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT userID from users WHERE username= %s", (u2_na,))
        row = cursor.fetchone()
        print(row)
        u2_id = row[0]
        if row == None:
            raise HTTPException(status_code=401, message="No user found with that username.")

        cursor.execute("INSERT INTO friendship (user1ID, user2ID) VALUES (?, ?)", (u1_id, u2_id))
        conn.commit()
        return {"message": "New friend request sent."}
    except Exception as e:
        err_msg = str(e)
        print(f"Error sending friend request {err_msg}")
        raise HTTPException(status_code=500, detail=err_msg)
    finally:
        cursor.close()
        conn.close()

@api.get("/get_pending", tags=["Friends"])
def get_pending(userID: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT u.userID, u.name, u.username FROM friendship f JOIN users u ON u.userID = f.user1ID WHERE f.user2ID = ? AND f.status = \"pending\"", (userID,))
        rows = cursor.fetchall()
        return rows
    except Exception as e:
        print(f"Error fetching pending friend requests: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()

class FriendshipRequest(BaseModel):
    user1ID: int
    user2ID: int

@api.post("/accept_friend", tags=["Friends"])
def accept_friend(request: FriendshipRequest):
    u1 = request.user1ID
    u2 = request.user2ID
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("UPDATE friendship SET status=\"accepted\", response_date=UTC_TIMESTAMP() WHERE friendshipID = ( SELECT friendshipID FROM ( SELECT friendshipID FROM friendship WHERE ((user1ID = ? AND user2ID = ?) OR (user1ID = ? AND user2ID = ?)) AND status = \"pending\" ORDER BY friendshipID DESC LIMIT 1) AS latest_request)", (u1, u2, u2, u1))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=500, detail="Friend request does not exist or is already processed.")
        conn.commit()
    except Exception as e:
        print(f"Error accepting friend request: {e}")
        raise HTTPException(status_code=500, detail=f"Error {e}")
    finally:
        cursor.close()
        conn.close()

@api.post("/decline_friend", tags=["Friends"])
def decline_friend(request: FriendshipRequest):
    u1 = request.user1ID
    u2 = request.user2ID
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("UPDATE friendship SET status=\"declined\", response_date=UTC_TIMESTAMP() WHERE friendshipID = ( SELECT friendshipID FROM ( SELECT friendshipID FROM friendship WHERE ((user1ID = ? AND user2ID = ?) OR (user1ID = ? AND user2ID = ?)) AND status = \"pending\" ORDER BY friendshipID DESC LIMIT 1) AS latest_request)", (u1, u2, u2, u1))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=500, detail="Friend request does not exist or is already processed.")
        conn.commit()
    except Exception as e:
        print(f"Error accepting friend request: {e}")
        raise HTTPException(status_code=500, detail=f"Error {e}")
    finally:
        cursor.close()
        conn.close()

@api.post("/remove_friend", tags=["Friends"])
def remove_friend(request: FriendshipRequest):
    u1 = request.user1ID
    u2 = request.user2ID
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("UPDATE friendship SET status=\"removed\", response_date=UTC_TIMESTAMP() WHERE friendshipID = ( SELECT friendshipID FROM ( SELECT friendshipID FROM friendship WHERE ((user1ID = ? AND user2ID = ?) OR (user1ID = ? AND user2ID = ?)) AND status = \"accepted\" ORDER BY friendshipID DESC LIMIT 1) AS latest_request)", (u1, u2, u2, u1))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=500, detail="Friend request does not exist or is already processed.")
        conn.commit()
    except Exception as e:
        print(f"Error accepting friend request: {e}")
        raise HTTPException(status_code=500, detail=f"Error {e}")
    finally:
        cursor.close()
        conn.close()

@api.get("/friend_events", tags=["Events", "Friends"])
def friend_events(userID: str, friendID: str, start: str, end: str):
    u_id = int(userID)
    f_id = int(friendID)
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
        SELECT
    e.eventID,
    e.ownerID AS friendID,
    u.name AS friendName,
    u.username AS friendUsername,
    e.start_time,
    e.end_time,
    CASE
        WHEN e.visibility = 'private' THEN NULL
        ELSE e.title
    END AS title,
    CASE
        WHEN e.visibility = 'private' THEN NULL
        ELSE e.description
    END AS description
FROM events e
JOIN users u
    ON u.userID = e.ownerID
WHERE e.ownerID = ?
    AND e.start_time < ?
    AND e.end_time >= ?
    AND (
        e.visibility = 'public'

        OR (
            e.visibility = 'friends'
            AND EXISTS (
                SELECT 1
                FROM friendship f
                WHERE f.status = 'accepted'
                    AND (
                        (f.user1ID = e.ownerID AND f.user2ID = ?)
                        OR
                        (f.user2ID = e.ownerID AND f.user1ID = ?)
                    )
            )
        )

        OR (
            e.visibility = 'private'
            AND EXISTS (
                SELECT 1
                FROM event_shares es
                JOIN friendship f
                    ON f.friendshipID = es.friendID
                WHERE es.eventID = e.eventID
                    AND f.status = 'accepted'
                    AND (
                        (f.user1ID = e.ownerID AND f.user2ID = ?)
                        OR
                        (f.user2ID = e.ownerID AND f.user1ID = ?)
                    )
            )
        )
    )
        """, (f_id, end, start, u_id, u_id, u_id, u_id))
        rows = cursor.fetchall()
        return rows
    except Exception as e:
        print(f"Error fetching friend's events: {e}")
        raise HTTPException(status_code=500, detail=f"Error {e}")
    finally:
        cursor.close()
        conn.close()

class PrivateRequest(BaseModel):
    eventID: int
    addIDs: List[int]
    removeIDs: List[int]

@api.post("/share_private", tags=["Events"])
def share_private(request: PrivateRequest):
    eID = request.eventID
    aIDs = request.addIDs
    rIDs = request.removeIDs
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        for fID in aIDs:
            cursor.execute("INSERT INTO event_shares (eventID, friendID) VALUES(?, ?)", (eID, fID))

        for fID in rIDs:
            cursor.execute("DELETE FROM event_shares WHERE eventID = ? AND friendID = ?", (eID, fID))
        conn.commit()
    except Exception as e:
        print(f"Error sharing event: {e}")
        raise HTTPException(status_code=500, detail=f"Error {e}")
    finally:
        cursor.close()
        conn.close()

class UpdateEventRequest(BaseModel):
    eventID: int
    title: str
    description: str
    start_time: str
    end_time: str
    visibility: str

@api.post("/update_event", tags=["Events"])
def update_event(request: UpdateEventRequest):
    eID = request.eventID
    ti = request.title
    de = request.description
    st = request.start_time
    en = request.end_time
    vi = request.visibility

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
        
    try:
        cursor.execute("UPDATE events SET title=?, description=?, start_time=?, end_time=?, visibility=? WHERE eventID = ?", (ti, de, st, en, vi, eID))
        conn.commit()
    except Exception as e:
        print(f"Error updating event: {e}")
        raise HTTPException(status_code=500, detail=f"Error {e}")
    finally:
        cursor.close()
        conn.close()

@api.get("/get_event_shares", tags=["Events"])
def get_event_shares(eventID: int):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT friendID FROM event_shares WHERE eventID = ?", (eventID,))
        rows = cursor.fetchall()
        return [row[0] for row in rows]
    except Exception as e:
            print(f"Error fetching pending friend requests: {e}")
            raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        cursor.close()
        conn.close()
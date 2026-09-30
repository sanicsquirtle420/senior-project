from database import get_connection
import bcrypt

def create_account(name:str, username: str, email:str, password: str):
    conn = get_connection()
    cursor = conn.cursor()
    hash_passwd = hash_password(password)

    try:
        cursor.execute("INSERT INTO users (name, username, email, password) VALUES(%s, %s, %s, %s)", (name, username, email, hash_passwd))
        conn.commit()
        print(f"User \"{name}\" ({username}) created successfully!")
    except Exception as e:
        conn.rollback()
        print(f"Error creating user: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def hash_password(password: str):
    salt = bcrypt.gensalt()
    tmp = password.encode("utf-8")
    passwd = bcrypt.hashpw(tmp, salt).decode("utf-8")

    return passwd
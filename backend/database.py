from dotenv import load_dotenv
import mariadb
import sys
import os

load_dotenv()
USER = os.getenv("A")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = int(os.getenv("PORT", "1234"))
DATABASE = os.getenv("DATABASE")

db_config = {
    "user": USER,
    "password": PASSWORD,
    "host": HOST,
    "port": PORT,
    "database": DATABASE
}

def get_connection():
    try:
        conn = mariadb.connect(**db_config)
        print("Connected successfully!")
        return conn

    except mariadb.Error as e:
        print(f"Error connecting to MariaDB: {e}")
        sys.exit(1)
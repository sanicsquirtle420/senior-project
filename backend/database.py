from dotenv import load_dotenv
import mariadb
import sys
import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

class ManagedConnection:
    def __init__(self, conn):
        self._conn = conn

    def cursor(self, *args, **kwargs):
        return self._conn.cursor(*args, **kwargs)

    def commit(self):
        self._conn.commit()

    def close(self):
        try:
            self._conn.close()
        except Exception:
            pass

def get_connection(retries=2):
    for attempt in range(retries):
        try:
            conn = mariadb.connect(
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                ssl=True,
                connect_timeout=30,
                read_timeout=10,
                write_timeout=10,
                autocommit=False
            )
            return ManagedConnection(conn)

        except mariadb.Error as e:
            print(f"Error connecting to MariaDB: {e}. Attempt {attempt + 1}")
            sys.exit(1)
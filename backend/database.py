from sshtunnel import SSHTunnelForwarder
from dotenv import load_dotenv
import mariadb
import sys
import os

load_dotenv()

SSH_HOST = os.getenv("SSH_HOST")
SSH_PORT = int(os.getenv("SSH_PORT", "22"))
SSH_USER = os.getenv("SSH_USER")
SSH_PASSWORD = os.getenv("SSH_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

_tunnel = None

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
        

def _start_tunnel():
    tunnel = SSHTunnelForwarder(
        (SSH_HOST, SSH_PORT),
        ssh_username=SSH_USER,
        ssh_password=SSH_PASSWORD,
        remote_bind_address=(DB_HOST, DB_PORT),
        local_bind_address=("127.0.0.1", 0),
        allow_agent=False,
        host_pkey_directories=[],
        set_keepalive=10.0,
        mute_exceptions=True,
    )

    tunnel.daemon_forward_servers = True
    tunnel.start()
    print(f"SSH tunnel established.")
    return tunnel

def _get_tunnel():
    global _tunnel
    if _tunnel is not None and _tunnel.is_active:
        return _tunnel
    if _tunnel is not None:
        try:
            _tunnel.stop()
        except Exception:
            pass
    _tunnel = _start_tunnel()
    return _tunnel

def get_connection():
    tunnel = _get_tunnel()
    try:
        conn = mariadb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host="127.0.0.1",
            port=tunnel.local_bind_port,
            database=DB_NAME,
            connect_timeout=5,
            read_timeout=10,
            write_timeout=10,
            autocommit=False
        )
        return ManagedConnection(conn)

    except mariadb.Error as e:
        print(f"Error connecting to MariaDB: {e}")
        sys.exit(1)
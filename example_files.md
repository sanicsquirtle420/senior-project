# Example Files
## .env
```
SSH_HOST=HOSTNAME
SSH_PORT=22
SSH_USER=USERNAME
SSH_PASSWORD=PASSWORD
DB_HOST=127.0.0.1
DB_USER=USERNAME
DB_PORT=3306
DB_NAME=DATABASE_NAME
DB_PASSWORD=PASSWORD
SEC_KEY=SECRET_KEY
```

## compose.yaml (MariaDB)
> [!NOTE]
> During my own personal testing I use a Docker container of [MariaDB](https://hub.docker.com/_/mariadb)

```
services:

  db:
    image: mariadb
    restart: always
    ports:
    - "3306:3306"
    environment:
      MARIADB_ROOT_PASSWORD: [root_password]
      MARIADB_DATABASE: [user]
      MARIADB_USER: [user]
      MARIADB_PASSWORD: [user_password]

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080
```

## compose.yaml (Uvicorn / FastAPI)
Docker: [sanicsquirtle428/senior-project](https://hub.docker.com/r/sanicsquirtle428/senior-project)
```
services:
  api:
    image: sanicsquirtle428/senior-project:latest
    container_name: senior-project
    ports:
      - "8000:8000"
    env_file:
      - .env
    command: uvicorn api:api --host 0.0.0.0 --port 8000
    restart: unless-stopped
```

## .env.development.local
```
VITE_DEV_AUTOLOGIN=true
VITE_DEV_SESSION_EXPIRES=2026-12-31T23:59:59-06:00
```
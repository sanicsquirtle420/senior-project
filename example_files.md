# Example Files
## .env
```
A=[username]
PASSWORD=[password]
DATABASE=[database_name]
HOST=[host_ip]
PORT=[port]
SEC_KEY=[secret_key]
```

## compose.yaml
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
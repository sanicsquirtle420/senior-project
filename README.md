# PlanPal
Senior project for the University of Mississippi by [Diego R.](https://github.com/sanicsquirtle420) | Fall 2026

## Set Up
Dependencies: `npm python3`

pip Dependecnies: `mariadb dotenv fastapi uvicorn bcrypt`

Creating the envoirnment
```bash
npm install -D vite@latest @vitejs/plugin-react@latest
```

Running the Vite server
```bash
npm run dev
```

### Testing
During my own personal testing I use a Docker container of [MariaDB](https://hub.docker.com/_/mariadb)

compose.yaml:
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

## Sources
* [Vite Guide](https://vite.dev/guide/)
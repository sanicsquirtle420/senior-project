DROP TABLE IF EXISTS users ;

CREATE TABLE users (
    userID int AUTO_INCREMENT PRIMARY KEY,
    name varchar(15) NOT NULL,
    username varchar(15) NOT NULL,
    email varchar(35) NOT NULL,
    password varchar(100) NOT NULL
) ;
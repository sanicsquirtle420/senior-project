DROP TABLE IF EXISTS event_shares ;
DROP TABLE IF EXISTS event_images ;
DROP TABLE IF EXISTS events ;
DROP TABLE IF EXISTS friendship ;
DROP TABLE IF EXISTS users ;

CREATE TABLE users (
    userID int AUTO_INCREMENT PRIMARY KEY,
    name varchar(15) NOT NULL,
    username varchar(15) NOT NULL,
    email varchar(35) UNIQUE,
    password varchar(250) NOT NULL
) ;

CREATE TABLE friendship (
    friendshipID int AUTO_INCREMENT PRIMARY KEY,
    user1ID int NOT NULL,
    user2ID int NOT NULL,
    status enum ("pending", "accepted", "declined") DEFAULT "pending",
    request_date datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    response_date datetime,
    FOREIGN KEY (user1ID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (user2ID) REFERENCES users(userID) ON DELETE CASCADE
) ;

CREATE TABLE events (
    eventID int AUTO_INCREMENT PRIMARY KEY,
    ownerID int NOT NULL,
    title varchar(150) NOT NULL,
    description text,
    start_time datetime NOT NULL,
    end_time datetime NOT NULL,
    visbility enum("private", "friends", "public") DEFAULT "private",
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date CHECK (end_time >= start_time),
    FOREIGN KEY (ownerID) REFERENCES users(userID) ON DELETE CASCADE 
) ;

CREATE TABLE event_images (
    imageID int AUTO_INCREMENT PRIMARY KEY,
    eventID int NOT NULL,
    file_path varchar(150),
    uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventID) REFERENCES events(eventID) ON DELETE CASCADE
) ;

CREATE TABLE event_shares (
    eventID int NOT NULL,
    friendID int NOT NULL,
    PRIMARY KEY (eventID, friendID),
    FOREIGN KEY (eventID) REFERENCES events(eventID) ON DELETE CASCADE,
    FOREIGN KEY (friendID) REFERENCES friendship(friendshipID) ON DELETE CASCADE
);
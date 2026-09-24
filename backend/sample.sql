DROP TABLE IF EXISTS sample ;

CREATE TABLE sample (
    sampleID int NOT NULL PRIMARY KEY,
    quote varchar(50) NOT NULL,
    n varchar(30) NOT NULL
) ;

INSERT INTO sample(sampleID, quote, n) VALUES(1, "Kitsune", "Kiriko") ;
INSERT INTO sample(sampleID, quote, n) VALUES(2, "Martian", "Juno") ;
INSERT INTO sample(sampleID, quote, n) VALUES(3, "Gamer", "D.Va") ;
INSERT INTO sample(sampleID, quote, n) VALUES(4, "Omnic", "Ramattra") ;
INSERT INTO sample(sampleID, quote, n) VALUES(5, "Librarian", "Paige") ;
CREATE TABLE utente(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_utente VARCHAR(30) NOT NULL,
    ruolo ENUM('user','admin') NOT NULL
);

CREATE TABLE segnalazione(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    descrizione TEXT NOT NULL,
    data_creazione DATE NOT NULL,
    CONSTRAINT fk_utente FOREIGN KEY (id_utente) REFERENCES utente(id)
    coordinate_x FLOAT NOT NULL,
    coordinate_y FLOAT NOT NULL,
    criticita ENUM('bassa', 'media', 'alta') NOT NULL
);
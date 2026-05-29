CREATE DATABASE IF NOT EXISTS robocop
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE robocop;

CREATE TABLE IF NOT EXISTS utente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    ruolo ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    telefono VARCHAR(14) NOT NULL
);

CREATE TABLE IF NOT EXISTS segnalazione (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utente INT NOT NULL,
    nome VARCHAR(30) NOT NULL,
    descrizione TEXT NOT NULL,
    data_creazione DATE NOT NULL,
    coordinate_x FLOAT,
    coordinate_y FLOAT,
    criticita ENUM('bassa', 'media', 'alta') NOT NULL,
    CONSTRAINT fk_utente FOREIGN KEY (id_utente) REFERENCES utente(id)
);

INSERT INTO utente (username, password, ruolo, telefono) VALUES
('admin', 'admin', 'admin', '1234567890'),
('user1', 'user1', 'user', '0987654321');
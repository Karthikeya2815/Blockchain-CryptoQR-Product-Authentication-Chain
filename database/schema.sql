CREATE DATABASE IF NOT EXISTS authentichain;
USE authentichain;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- In production, securely hash this!
    role ENUM('manufacturer', 'seller', 'consumer') NOT NULL,
    name VARCHAR(100) NOT NULL,
    eth_address VARCHAR(42), -- Their Web3 / Ganache address linked to the role
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: We are keeping Product functionality strictly on the blockchain.
-- The database is solely for mapping user accounts/roles to their Ganache Ethereum addresses!

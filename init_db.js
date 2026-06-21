const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        console.log("Connecting to MySQL to initialize the database...");
        
        // Connect WITHOUT specifying a database so we can create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD
        });

        console.log("Connection successful! Creating 'authentichain' database if it doesn't exist...");
        await connection.query('CREATE DATABASE IF NOT EXISTS authentichain;');
        
        console.log("Switching to 'authentichain' database...");
        await connection.query('USE authentichain;');

        console.log("Creating 'users' table...");
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL, 
            role ENUM('manufacturer', 'seller', 'consumer') NOT NULL,
            name VARCHAR(100) NOT NULL,
            eth_address VARCHAR(42), 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        
        await connection.query(createTableQuery);

        console.log("✅ Database Initialization Complete! You can now run `npm start` safely.");
        await connection.end();
    } catch (err) {
        console.error("❌ Failed to initialize database:", err.message);
    }
}

initDB();

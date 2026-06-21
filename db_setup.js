const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    console.log("Connected to MySQL.");

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'authentichain'}`);
    console.log(`Database '${process.env.DB_NAME || 'authentichain'}' created or already exists.`);

    await connection.query(`USE ${process.env.DB_NAME || 'authentichain'}`);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('Manufacturer', 'Seller', 'Consumer') NOT NULL,
            name VARCHAR(255),
            eth_address VARCHAR(255)
        )
    `);
    console.log("Table 'users' created or already exists.");

    await connection.end();
    console.log("Database Setup Complete! You can now run 'node server.js'");
}

setup().catch(err => {
    console.error("Setup failed!");
    console.error(err.message);
});

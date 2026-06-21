const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const validRoles = new Set(['manufacturer', 'seller', 'consumer']);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let pool;

async function connectDb() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'authentichain',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL Database.');
        connection.release();
    } catch (err) {
        pool = null;
        console.error('CRITICAL ERROR: Could not connect to MySQL Database.');
        console.error('- Did you install and start MySQL?');
        console.error("- Did you create the database 'authentichain'?");
        console.error('- Are your credentials correct in the .env file?');
        console.error(err.message);
    }
}

function requireDb(res) {
    if (pool) {
        return true;
    }

    res.status(503).json({ error: 'Database is not connected. Check MySQL and .env settings.' });
    return false;
}

connectDb();

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: Boolean(pool) });
});

app.post('/api/auth/register', async (req, res) => {
    try {
        if (!requireDb(res)) {
            return;
        }

        const { username, password, role, name, eth_address } = req.body;
        const normalizedRole = String(role || '').toLowerCase();

        if (!username || !password || !name || !validRoles.has(normalizedRole)) {
            return res.status(400).json({ error: 'username, password, name and a valid role are required.' });
        }

        const [result] = await pool.execute(
            'INSERT INTO users (username, password, role, name, eth_address) VALUES (?, ?, ?, ?, ?)',
            [username, password, normalizedRole, name, eth_address || null]
        );

        res.status(201).json({ message: 'User registered successfully!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        if (!requireDb(res)) {
            return;
        }

        const { username, password } = req.body;
        const [rows] = await pool.execute(
            'SELECT id, username, role, name, eth_address FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length > 0) {
            res.json({ message: 'Login successful', user: rows[0] });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:role', async (req, res) => {
    try {
        if (!requireDb(res)) {
            return;
        }

        const normalizedRole = String(req.params.role || '').toLowerCase();
        if (!validRoles.has(normalizedRole)) {
            return res.status(400).json({ error: 'Invalid role.' });
        }

        const [rows] = await pool.execute(
            'SELECT id, username, role, name, eth_address FROM users WHERE role = ?',
            [normalizedRole]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`AuthentiChain Backend Server running on port ${port}`);
});

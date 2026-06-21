const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
    'server.js',
    'package.json',
    'truffle-config.js',
    'contracts/product.sol',
    'contracts/Migrations.sol',
    'migrations/1_initial_migration.js',
    'migrations/2_deploy_contract.js',
    'database/schema.sql',
    'src/index.html',
    'src/auth.html',
    'src/js/web3.min.js',
    'src/js/truffle-contract.js'
];

for (const file of requiredFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Missing required file: ${file}`);
    }
}

require(path.join(root, 'server.js'));
require(path.join(root, 'truffle-config.js'));

setTimeout(async () => {
    await mysql.createConnection({
        host: '127.0.0.1',
        user: 'invalid-smoke-test-user',
        password: 'invalid-smoke-test-password',
        connectTimeout: 200
    }).catch(() => {});

    console.log('Smoke test passed: required files and Node modules load correctly.');
    process.exit(0);
}, 300);

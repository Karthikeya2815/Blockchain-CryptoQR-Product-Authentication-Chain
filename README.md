# Fake Product Identification using Blockchain

This project uses a Truffle smart contract, Ganache local blockchain, a static frontend, and an Express + MySQL backend for login/role management.

## Requirements

- Node.js 16 or newer
- MySQL Server
- Ganache
- Chrome or another Chromium browser
- MetaMask browser extension

## Workflow

1. Install dependencies:

```bash
npm install
```

2. Create the MySQL database and table:

```bash
mysql -u root -p < database/schema.sql
```

3. Update `.env` if your MySQL username, password, host, database name, or backend port are different:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=authentichain
```

4. Start Ganache and set the RPC server to:

```text
HTTP://127.0.0.1:7545
```

5. Compile and deploy the smart contract:

```bash
npx truffle compile
npx truffle migrate --reset
```

6. Start the backend API in one terminal:

```bash
npm start
```

7. Start the frontend in another terminal:

```bash
npm run dev
```

8. Open the frontend URL shown by lite-server, usually:

```text
http://localhost:3000
```

9. In MetaMask, add the Ganache network and import a Ganache account using its private key. Then connect MetaMask to `localhost:3000`.

## Check The Project

Run:

```bash
npm test
npx truffle compile
```

`npm test` verifies the important project files and Node modules load correctly. `npx truffle compile` verifies the Solidity contract compiles.

## Notes

- Backend login roles are stored as `manufacturer`, `seller`, and `consumer`.
- Product data lives on the blockchain contract.
- MySQL is used for user accounts and role mapping only.

# 🔗 Blockchain-Based Product Authentication & Anti-Counterfeit Detection System

![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contract-363636?logo=solidity&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-Backend-black?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![Truffle](https://img.shields.io/badge/Truffle-Framework-5E464D?logo=truffle&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success)

A decentralized anti-counterfeit supply chain solution that combines **Solidity smart contracts**, **location-aware QR code tracking**, and a **Node.js + MySQL backend** to verify product authenticity at every stage — from manufacturer to consumer. Product records live immutably on the blockchain, while a lightweight backend handles user roles and authentication.

> 💡 Built to demonstrate how blockchain's tamper-proof ledger can be combined with QR-based tracking to fight counterfeit goods across a real-world supply chain.

---

## 📌 Overview

| Component | Technology | Purpose |
|---|---|---|
| **Smart Contract** | Solidity + Truffle | Stores immutable product records on-chain |
| **Local Blockchain** | Ganache | Simulates the Ethereum network for development |
| **Backend API** | Node.js + Express | Handles login, roles, and MySQL data |
| **Database** | MySQL | Stores user accounts and role mapping only |
| **Frontend** | Static + lite-server | User interface, connects via MetaMask |
| **Wallet** | MetaMask | Signs transactions and connects to Ganache |

---

## ✨ Key Features

- 🏭 **Role-Based Access** — Separate roles for `manufacturer`, `seller`, and `consumer`, each with distinct permissions
- 📦 **On-Chain Product Records** — Product data is stored directly on the smart contract, making it tamper-proof
- 📍 **Location-Aware QR Tracking** — Maps product movement through the supply chain to flag suspicious location mismatches
- 🔐 **Secure Login System** — Express + MySQL backend manages authentication separately from blockchain logic
- 🦊 **MetaMask Integration** — Connects directly to a local Ganache blockchain for testing and transactions

---

## 🛠️ Tech Stack

- **Smart Contracts:** Solidity, Truffle
- **Blockchain:** Ganache (local Ethereum simulation)
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Frontend:** Static HTML/CSS/JS served via lite-server
- **Wallet:** MetaMask

---

## ⚙️ Prerequisites

Before you begin, make sure you have:

- **Node.js** v16 or newer
- **MySQL Server**
- **Ganache** (local blockchain)
- **Chrome** or another Chromium-based browser
- **MetaMask** browser extension

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Karthikeya2815/Blockchain-CryptoQR-Product-Authentication-Chain.git
cd Blockchain-CryptoQR-Product-Authentication-Chain
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
```bash
mysql -u root -p < database/schema.sql
```

### 4. Configure environment variables
Update `.env` to match your local MySQL setup:
```
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=authentichain
```

### 5. Start Ganache
Set the RPC server to:
```
HTTP://127.0.0.1:7545
```

### 6. Compile and deploy the smart contract
```bash
npx truffle compile
npx truffle migrate --reset
```

### 7. Start the backend API
```bash
npm start
```

### 8. Start the frontend (in a separate terminal)
```bash
npm run dev
```

### 9. Open the app
Navigate to the URL shown by lite-server — typically:
```
http://localhost:3000
```

### 10. Connect MetaMask
- Add the Ganache network to MetaMask
- Import a Ganache account using its private key
- Connect MetaMask to `localhost:3000`

---

## 📁 Project Structure

```
Blockchain-CryptoQR-Product-Authentication-Chain/
├── contracts/            # Solidity smart contracts
├── migrations/           # Truffle deployment scripts
├── database/
│   └── schema.sql        # MySQL schema for users and roles
├── backend/              # Express API (login/role management)
├── frontend/             # Static frontend served via lite-server
├── .env                  # Environment configuration
├── truffle-config.js     # Truffle configuration
└── README.md             # Project documentation
```

---

## ✅ Verifying the Project

Run these checks to confirm everything is working:

```bash
npm test
npx truffle compile
```

- `npm test` verifies key project files and Node modules load correctly
- `npx truffle compile` verifies the Solidity contract compiles without errors

---

## 📝 Notes

- Backend login roles are stored as `manufacturer`, `seller`, and `consumer`
- **Product data lives entirely on the blockchain contract** — not in MySQL
- MySQL is used **only** for user accounts and role mapping, keeping authentication separate from product records

---

## 🎯 What This Project Demonstrates

- Practical use of **smart contracts** for tamper-proof data storage
- Integration of **Web3 tooling** (Truffle, Ganache, MetaMask) into a full-stack application
- Designing a system with **separation of concerns** — blockchain for product truth, traditional DB for auth
- Real-world application of blockchain to **supply chain and anti-counterfeit problems**

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repository, submit pull requests, or open issues for bugs and feature suggestions.

---

## 📄 License

This project is unlicensed — free to use for educational or personal purposes. For commercial use, please reach out to the author.

---

## 👤 Author

**G. Karthik**
AI/ML Student | AI/ML Enthusiast

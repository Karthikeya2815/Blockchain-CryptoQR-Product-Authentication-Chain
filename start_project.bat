@echo off
echo ==========================================
echo AuthentiChain Project Auto-Start Script
echo ==========================================
echo.
echo Make sure you have the following open/running before proceeding:
echo 1. Ganache (running on HTTP://127.0.0.1:7545)
echo 2. MySQL Server (running with correct credentials in .env)
echo.
pause

echo.
echo [1/3] Initializing Database...
node init_db.js

echo.
echo [2/3] Starting Backend API...
start cmd /k "npm start"

echo.
echo [3/3] Starting Frontend Application...
start cmd /k "npm run dev"

echo.
echo Everything is starting up! 
echo - The Backend will run in a new terminal window on port 5000.
echo - The Frontend will open your browser automatically.
echo.
pause

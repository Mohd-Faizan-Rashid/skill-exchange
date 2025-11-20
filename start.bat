@echo off
REM Simple startup script for Windows

echo Starting Mutual Skill Exchange Platform...
echo ==========================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

REM Start the server
echo Server starting on http://localhost:5000
call npm start

#!/bin/bash
# Simple startup script for Unix/Linux/Mac

echo "Starting Mutual Skill Exchange Platform..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Server starting on http://localhost:5000"
npm start

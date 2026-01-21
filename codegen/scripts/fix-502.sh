#!/bin/bash

# Quick fix script for 502 Bad Gateway errors
# This script automates the common fix steps

echo "🔧 502 Bad Gateway Quick Fix"
echo "════════════════════════════════════════════════════════════"
echo ""

# Step 1: Kill existing processes
echo "1️⃣ Killing existing processes on port 5000..."
if lsof -i :5000 >/dev/null 2>&1; then
    fuser -k 5000/tcp 2>/dev/null || true
    sleep 1
    echo "   ✅ Killed processes on port 5000"
else
    echo "   ℹ️  No processes on port 5000"
fi
echo ""

# Step 2: Kill processes on old port (5173)
echo "2️⃣ Killing processes on old port (5173)..."
if lsof -i :5173 >/dev/null 2>&1; then
    fuser -k 5173/tcp 2>/dev/null || true
    sleep 1
    echo "   ✅ Killed processes on port 5173"
else
    echo "   ℹ️  No processes on port 5173"
fi
echo ""

# Step 3: Verify vite.config.ts
echo "3️⃣ Verifying vite.config.ts..."
if grep -q "port: 5000" vite.config.ts; then
    echo "   ✅ Configuration correct (port 5000)"
else
    echo "   ❌ Configuration incorrect!"
    echo "   → Manual fix needed: Update vite.config.ts port to 5000"
    exit 1
fi
echo ""

# Step 4: Check dependencies
echo "4️⃣ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules not found, installing dependencies..."
    npm install
    echo "   ✅ Dependencies installed"
else
    echo "   ✅ Dependencies present"
fi
echo ""

# Step 5: Clear Vite cache
echo "5️⃣ Clearing Vite cache..."
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "   ✅ Vite cache cleared"
else
    echo "   ℹ️  No Vite cache to clear"
fi
echo ""

# Step 6: Start dev server
echo "6️⃣ Starting dev server..."
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🚀 Starting Vite dev server on port 5000..."
echo "   Press Ctrl+C to stop"
echo "════════════════════════════════════════════════════════════"
echo ""

npm run dev

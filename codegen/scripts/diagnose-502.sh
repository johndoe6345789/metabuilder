#!/bin/bash

# 502 Error Troubleshooting Script for Codespaces
# This script helps diagnose and fix common Vite dev server issues

echo "🔍 Diagnosing 502 Bad Gateway Issues..."
echo ""

# Check if port 5000 is in use
echo "1️⃣ Checking if port 5000 is in use..."
if lsof -i :5000 >/dev/null 2>&1; then
    echo "   ✅ Port 5000 is in use (server running)"
    lsof -i :5000 | grep LISTEN
else
    echo "   ❌ Port 5000 is NOT in use (server not running)"
    echo "   → Run 'npm run dev' to start the server"
fi
echo ""

# Check if port 5173 is in use (old default)
echo "2️⃣ Checking if port 5173 is in use (old default)..."
if lsof -i :5173 >/dev/null 2>&1; then
    echo "   ⚠️  Port 5173 is in use - this is the OLD port!"
    echo "   → Kill this process and restart with updated config"
    lsof -i :5173 | grep LISTEN
else
    echo "   ✅ Port 5173 is not in use"
fi
echo ""

# Check vite.config.ts for correct port
echo "3️⃣ Checking vite.config.ts for correct port..."
if grep -q "port: 5000" vite.config.ts; then
    echo "   ✅ vite.config.ts is configured for port 5000"
else
    echo "   ❌ vite.config.ts is NOT configured for port 5000"
    echo "   → Update vite.config.ts to use port 5000"
fi
echo ""

# Check if server binds to 0.0.0.0
echo "4️⃣ Checking if server binds to 0.0.0.0..."
if grep -q "host: '0.0.0.0'" vite.config.ts || grep -q 'host: "0.0.0.0"' vite.config.ts; then
    echo "   ✅ Server configured to bind to 0.0.0.0 (externally accessible)"
else
    echo "   ❌ Server NOT configured to bind to 0.0.0.0"
    echo "   → Update vite.config.ts to include host: '0.0.0.0'"
fi
echo ""

# Check for node processes
echo "5️⃣ Checking for running node processes..."
NODE_PROCS=$(pgrep -f "node.*vite" | wc -l)
if [ "$NODE_PROCS" -gt 0 ]; then
    echo "   ✅ Found $NODE_PROCS Vite node process(es)"
    ps aux | grep "node.*vite" | grep -v grep
else
    echo "   ❌ No Vite node processes found"
    echo "   → Dev server is not running"
fi
echo ""

# Check package.json for workspace dependencies
echo "6️⃣ Checking for workspace dependencies..."
if grep -q '"@github/spark": "workspace:' package.json; then
    echo "   ℹ️  Found workspace dependencies in package.json"
    echo "   → This requires 'npm install' instead of 'npm ci'"
    echo "   → Or switch to pnpm for better workspace support"
else
    echo "   ✅ No workspace dependencies found"
fi
echo ""

# Check if dependencies are installed
echo "7️⃣ Checking if node_modules exists..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules directory exists"
    if [ -d "node_modules/.vite" ]; then
        echo "   ✅ Vite cache exists"
    else
        echo "   ⚠️  Vite cache doesn't exist yet (first run)"
    fi
else
    echo "   ❌ node_modules directory NOT found"
    echo "   → Run 'npm install' to install dependencies"
fi
echo ""

# Summary and recommendations
echo "📋 SUMMARY & RECOMMENDATIONS"
echo "════════════════════════════════════════════════════════════"

# Determine main issue
if ! lsof -i :5000 >/dev/null 2>&1; then
    echo "❌ MAIN ISSUE: Dev server is not running on port 5000"
    echo ""
    echo "🔧 TO FIX:"
    echo "   1. Kill any existing dev servers: npm run kill"
    echo "   2. Start the dev server: npm run dev"
    echo "   3. Wait for 'ready' message with port 5000"
    echo "   4. Open the forwarded Codespaces URL"
elif lsof -i :5173 >/dev/null 2>&1; then
    echo "⚠️  MAIN ISSUE: Server running on wrong port (5173 instead of 5000)"
    echo ""
    echo "🔧 TO FIX:"
    echo "   1. Stop the current server (Ctrl+C)"
    echo "   2. Verify vite.config.ts has 'port: 5000'"
    echo "   3. Restart: npm run dev"
else
    echo "✅ Configuration looks correct!"
    echo ""
    echo "If you're still seeing 502 errors:"
    echo "   1. Check Codespaces Ports panel"
    echo "   2. Verify port 5000 is forwarded and PUBLIC"
    echo "   3. Try opening the forwarded URL again"
    echo "   4. Check browser console for detailed errors"
fi

echo ""
echo "📚 For more details, see: docs/502_ERROR_FIX.md"

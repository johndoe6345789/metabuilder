#!/bin/bash

# Fix Node Modules Script
# This script resolves common npm/Vite installation issues

set -e

echo "🔧 Fixing node_modules and dependencies..."
echo ""

# Step 1: Clean npm cache
echo "1️⃣  Cleaning npm cache..."
npm cache clean --force

# Step 2: Remove node_modules
echo "2️⃣  Removing node_modules..."
rm -rf node_modules
rm -rf package-lock.json

# Step 3: Remove workspace node_modules
echo "3️⃣  Removing workspace node_modules..."
rm -rf packages/*/node_modules

# Step 4: Reinstall
echo "4️⃣  Reinstalling dependencies..."
npm install

echo ""
echo "✅ Dependencies reinstalled successfully!"
echo ""
echo "You can now run:"
echo "  npm run dev     - Start development server"
echo "  npm run build   - Build for production"
echo "  npm run lint    - Run linter"
echo ""

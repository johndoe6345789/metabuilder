#!/bin/bash

echo "======================================"
echo "Prisma Database Migration Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if files exist
if [ ! -f "src/lib/database-prisma.ts" ]; then
    echo -e "${RED}Error: database-prisma.ts not found!${NC}"
    exit 1
fi

if [ ! -f "src/lib/database.ts" ]; then
    echo -e "${RED}Error: database.ts not found!${NC}"
    exit 1
fi

# Step 1: Backup old database.ts
echo -e "${YELLOW}Step 1: Creating backup of old database.ts...${NC}"
cp src/lib/database.ts src/lib/database-kv-backup.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup created: src/lib/database-kv-backup.ts${NC}"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi
echo ""

# Step 2: Replace with Prisma version
echo -e "${YELLOW}Step 2: Replacing database.ts with Prisma implementation...${NC}"
cp src/lib/database-prisma.ts src/lib/database.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database layer replaced with Prisma version${NC}"
else
    echo -e "${RED}✗ Replacement failed!${NC}"
    exit 1
fi
echo ""

# Step 3: Generate Prisma Client
echo -e "${YELLOW}Step 3: Generating Prisma Client...${NC}"
npm run db:generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}✗ Prisma Client generation failed!${NC}"
    echo -e "${YELLOW}Tip: Make sure Prisma is installed (npm install)${NC}"
    exit 1
fi
echo ""

# Step 4: Create/update database
echo -e "${YELLOW}Step 4: Creating/updating database...${NC}"
npm run db:push
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created/updated${NC}"
else
    echo -e "${RED}✗ Database creation failed!${NC}"
    echo -e "${YELLOW}Tip: Check your DATABASE_URL in .env${NC}"
    exit 1
fi
echo ""

# Success message
echo "======================================"
echo -e "${GREEN}✓ Migration Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Restart your development server (npm run dev)"
echo "2. Test the application"
echo "3. If issues occur, restore from backup:"
echo "   cp src/lib/database-kv-backup.ts src/lib/database.ts"
echo ""
echo -e "${GREEN}Database layer successfully migrated to Prisma!${NC}"

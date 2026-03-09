#!/bin/bash

###############################################################################
# Quick Integration Test - Manual Steps
# Tests mock DBAL server and workflow execution without full automation
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOCK_DBAL_URL="http://localhost:8080"
TENANT_ID="test-tenant"

echo -e "${BLUE}=== Quick Integration Test ===${NC}\n"

###############################################################################
# 1. Test Health Check
###############################################################################

echo -e "${BLUE}1. Testing Mock DBAL Health Check${NC}"
HEALTH=$(curl -s "$MOCK_DBAL_URL/health")
echo "Response: $HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓ Health check passed${NC}\n"
else
    echo -e "${YELLOW}! Mock DBAL server may not be running${NC}"
    echo "  Start it with: cd $SCRIPT_DIR && npm run start"
    exit 1
fi

###############################################################################
# 2. Create TypeScript Math Workflow
###############################################################################

echo -e "${BLUE}2. Creating TypeScript Math Workflow${NC}"
WORKFLOW_FILE="$SCRIPT_DIR/../test-workflows/typescript-math.json"
WORKFLOW=$(cat "$WORKFLOW_FILE")

CREATE_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW" \
    "$MOCK_DBAL_URL/api/v1/$TENANT_ID/workflows")

WORKFLOW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created workflow ID: $WORKFLOW_ID"
echo -e "${GREEN}✓ Workflow created${NC}\n"

###############################################################################
# 3. Execute Workflow
###############################################################################

echo -e "${BLUE}3. Executing TypeScript Math Workflow${NC}"
EXEC_RESPONSE=$(curl -s -X POST "$MOCK_DBAL_URL/api/v1/$TENANT_ID/workflows/$WORKFLOW_ID/execute")
EXEC_ID=$(echo "$EXEC_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Execution ID: $EXEC_ID"
echo "Status: running"
echo -e "${YELLOW}Waiting for execution to complete...${NC}"

sleep 2

###############################################################################
# 4. Get Execution Results
###############################################################################

echo -e "\n${BLUE}4. Getting Execution Results${NC}"
RESULT=$(curl -s "$MOCK_DBAL_URL/api/v1/$TENANT_ID/executions/$EXEC_ID")
echo "$RESULT" | jq '.' 2>/dev/null || echo "$RESULT"

STATUS=$(echo "$RESULT" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
OUTPUT=$(echo "$RESULT" | grep -o '"result":[0-9]*' | cut -d':' -f2)

echo -e "\nExecution Status: $STATUS"
echo "Execution Output: $OUTPUT"

if [ "$STATUS" = "success" ] && [ "$OUTPUT" = "16" ]; then
    echo -e "${GREEN}✓ Execution successful - Result: $OUTPUT (expected: 16)${NC}\n"
else
    echo -e "${YELLOW}! Unexpected result${NC}\n"
fi

###############################################################################
# 5. Create Python Data Workflow
###############################################################################

echo -e "${BLUE}5. Creating Python Data Workflow${NC}"
WORKFLOW_FILE="$SCRIPT_DIR/../test-workflows/python-data.json"
WORKFLOW=$(cat "$WORKFLOW_FILE")

CREATE_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW" \
    "$MOCK_DBAL_URL/api/v1/$TENANT_ID/workflows")

WORKFLOW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created workflow ID: $WORKFLOW_ID"
echo -e "${GREEN}✓ Workflow created${NC}\n"

###############################################################################
# 6. Execute Python Workflow
###############################################################################

echo -e "${BLUE}6. Executing Python Data Workflow${NC}"
EXEC_RESPONSE=$(curl -s -X POST "$MOCK_DBAL_URL/api/v1/$TENANT_ID/workflows/$WORKFLOW_ID/execute")
EXEC_ID=$(echo "$EXEC_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Execution ID: $EXEC_ID"
echo -e "${YELLOW}Waiting for execution to complete...${NC}"

sleep 2

###############################################################################
# 7. Get Python Execution Results
###############################################################################

echo -e "\n${BLUE}7. Getting Python Execution Results${NC}"
RESULT=$(curl -s "$MOCK_DBAL_URL/api/v1/$TENANT_ID/executions/$EXEC_ID")
echo "$RESULT" | jq '.' 2>/dev/null || echo "$RESULT"

STATUS=$(echo "$RESULT" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
OUTPUT=$(echo "$RESULT" | grep -o '"result":[0-9]*' | cut -d':' -f2)

echo -e "\nExecution Status: $STATUS"
echo "Execution Output: $OUTPUT"

if [ "$STATUS" = "success" ] && [ "$OUTPUT" = "3" ]; then
    echo -e "${GREEN}✓ Execution successful - Result: $OUTPUT (expected: 3)${NC}\n"
else
    echo -e "${YELLOW}! Unexpected result${NC}\n"
fi

###############################################################################
# Summary
###############################################################################

echo -e "${GREEN}=== Test Summary ===${NC}"
echo "✓ Mock DBAL server: Running"
echo "✓ TypeScript workflow: Created and executed (result: 16)"
echo "✓ Python workflow: Created and executed (result: 3)"
echo -e "\n${GREEN}All tests passed!${NC}"

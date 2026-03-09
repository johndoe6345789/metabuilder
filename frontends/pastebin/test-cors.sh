#!/bin/bash

# CORS Testing Script for CodeSnippet
# Usage: ./test-cors.sh [BACKEND_URL] [FRONTEND_URL]
# Example: ./test-cors.sh https://backend.example.com https://frontend.example.com

BACKEND_URL="${1:-http://localhost:5000}"
FRONTEND_URL="${2:-http://localhost:3000}"

echo "======================================"
echo "CodeSnippet CORS Testing Script"
echo "======================================"
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "======================================"
echo ""

# Test 1: Health Check
echo "🔍 Test 1: Health Check (No CORS required)"
echo "--------------------------------------"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
if [ $? -eq 0 ]; then
    echo "✅ Health check successful"
    echo "Response: $HEALTH_RESPONSE"
else
    echo "❌ Health check failed - backend may not be running"
    exit 1
fi
echo ""

# Test 2: OPTIONS Preflight
echo "🔍 Test 2: OPTIONS Preflight Request"
echo "--------------------------------------"
PREFLIGHT_HEADERS=$(curl -s -X OPTIONS "$BACKEND_URL/api/snippets" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -i | grep -i "access-control")

if echo "$PREFLIGHT_HEADERS" | grep -q "access-control-allow-origin"; then
    echo "✅ CORS preflight successful"
    echo "$PREFLIGHT_HEADERS"
else
    echo "❌ CORS preflight failed - missing CORS headers"
    echo "Response headers:"
    curl -s -X OPTIONS "$BACKEND_URL/api/snippets" \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET" \
        -i | head -n 20
fi
echo ""

# Test 3: GET with Origin
echo "🔍 Test 3: GET Request with Origin"
echo "--------------------------------------"
GET_HEADERS=$(curl -s "$BACKEND_URL/api/snippets" \
    -H "Origin: $FRONTEND_URL" \
    -i | grep -i "access-control")

if echo "$GET_HEADERS" | grep -q "access-control-allow-origin"; then
    echo "✅ GET request CORS successful"
    echo "$GET_HEADERS"
else
    echo "❌ GET request CORS failed - missing CORS headers"
fi
echo ""

# Test 4: POST with Origin
echo "🔍 Test 4: POST Request with Origin"
echo "--------------------------------------"
TEST_SNIPPET='{
  "id": "test-cors-'$(date +%s)'",
  "title": "CORS Test Snippet",
  "code": "console.log(\"CORS test\");",
  "language": "JavaScript",
  "description": "Test snippet for CORS validation",
  "tags": ["test"],
  "category": "general",
  "createdAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
  "updatedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
}'

POST_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/snippets" \
    -H "Origin: $FRONTEND_URL" \
    -H "Content-Type: application/json" \
    -d "$TEST_SNIPPET" \
    -i)

POST_HEADERS=$(echo "$POST_RESPONSE" | grep -i "access-control")
POST_STATUS=$(echo "$POST_RESPONSE" | head -n 1)

if echo "$POST_HEADERS" | grep -q "access-control-allow-origin"; then
    echo "✅ POST request CORS successful"
    echo "Status: $POST_STATUS"
    echo "$POST_HEADERS"
else
    echo "❌ POST request CORS failed - missing CORS headers"
    echo "Status: $POST_STATUS"
fi
echo ""

# Test 5: Wrong Origin (Should fail or return no CORS headers)
echo "🔍 Test 5: Request from Unauthorized Origin"
echo "--------------------------------------"
WRONG_ORIGIN="https://malicious-site.com"
WRONG_HEADERS=$(curl -s "$BACKEND_URL/api/snippets" \
    -H "Origin: $WRONG_ORIGIN" \
    -i | grep -i "access-control")

if [ -z "$WRONG_HEADERS" ]; then
    echo "✅ Correctly blocking unauthorized origin"
    echo "   (No CORS headers returned for $WRONG_ORIGIN)"
elif echo "$WRONG_HEADERS" | grep -q "access-control-allow-origin.*\*"; then
    echo "⚠️  Warning: Backend allows all origins (*)"
    echo "   This is fine for development but should be restricted in production"
else
    echo "⚠️  Unexpected CORS response for unauthorized origin"
    echo "$WRONG_HEADERS"
fi
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "If all tests passed:"
echo "  ✅ Your CORS configuration is working correctly"
echo ""
echo "If tests failed:"
echo "  1. Verify backend is running at $BACKEND_URL"
echo "  2. Check CORS_ALLOWED_ORIGINS environment variable"
echo "  3. Ensure it includes $FRONTEND_URL"
echo "  4. Restart backend after environment changes"
echo "  5. See CORS-GUIDE.md for detailed troubleshooting"
echo "======================================"

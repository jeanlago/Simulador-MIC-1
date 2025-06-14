#!/bin/bash

# Test script for MIC-1 Backend API
# This script demonstrates how to use the API endpoints

API_URL="http://localhost:3000/api/mic1"

echo "=== MIC-1 Backend API Test ==="
echo

# 1. Create a new session
echo "1. Creating new session..."
SESSION_RESPONSE=$(curl -s -X POST $API_URL/session)
SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"sessionId":"[^"]*' | sed 's/"sessionId":"//')
echo "Session ID: $SESSION_ID"
echo

# 2. Parse a simple program
echo "2. Parsing program..."
PARSE_RESPONSE=$(curl -s -X POST $API_URL/parse \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"program\": \"LOCO 10\nSTOD 100\nLODD 100\nADDD 100\"
  }")
echo "Parse result: $PARSE_RESPONSE"
echo

# 3. Load the program
echo "3. Loading program..."
LOAD_RESPONSE=$(curl -s -X POST $API_URL/load \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"program\": {
      \"instructions\": [\"LOCO 10\", \"STOD 100\", \"LODD 100\", \"ADDD 100\"],
      \"data\": {}
    }
  }")
echo "Load result: $LOAD_RESPONSE"
echo

# 4. Execute the program
echo "4. Executing program..."
EXECUTE_RESPONSE=$(curl -s -X POST $API_URL/execute \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"stepMode\": false
  }")
echo "Execute result: $EXECUTE_RESPONSE"
echo

# 5. Get final state
echo "5. Getting final state..."
STATE_RESPONSE=$(curl -s -X GET $API_URL/state/$SESSION_ID)
echo "Final state: $STATE_RESPONSE" | jq '.'
echo

# 6. Get state report
echo "6. Getting state report..."
REPORT_RESPONSE=$(curl -s -X GET $API_URL/report/$SESSION_ID)
echo "State report:"
echo "$REPORT_RESPONSE" | jq -r '.report'

echo
echo "=== Test completed ===" 
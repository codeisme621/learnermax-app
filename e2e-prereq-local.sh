#!/bin/bash

# Script to start both frontend and backend local servers and update e2e configuration
# Usage: ./start-local-servers.sh

set -e

# Local server URLs
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8080"

echo "🔧 Setting up local development environment..."

# Path to e2e local.env file
E2E_ENV_FILE="e2e/local.env"

# Preserve existing VERCEL_AUTOMATION_BYPASS_SECRET
BYPASS_SECRET=""
if [ -f "$E2E_ENV_FILE" ]; then
    BYPASS_SECRET=$(grep "VERCEL_AUTOMATION_BYPASS_SECRET" "$E2E_ENV_FILE" 2>/dev/null || echo "")
fi

# Update the local.env file with local URLs
echo "📝 Updating e2e configuration for local development..."

cat > "$E2E_ENV_FILE" << EOF
# Local environment variables - DO NOT CHECK INTO GIT
# Local development URLs
UI_BASE_URL=${FRONTEND_URL}
API_BASE_URL=${BACKEND_URL}
TEST_ENV=local
UI_TEST_ENV=local
${BYPASS_SECRET}
EOF

echo "✅ Updated ${E2E_ENV_FILE} with local URLs"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend: $BACKEND_URL"

echo ""
echo "🚀 Starting local servers..."
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping local servers..."
    kill 0
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend server on port 8080..."
cd backend
pnpm dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo "🎨 Starting frontend server on port 3000..."
cd ../frontend
pnpm dev &
FRONTEND_PID=$!

# Return to root directory
cd ..

echo ""
echo "✅ Local servers started successfully!"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend: $BACKEND_URL"
echo ""
echo "🎯 Ready to run e2e tests with: cd e2e && pnpm run test:all:local"
echo ""
echo "Servers are running... Press Ctrl+C to stop"

# Wait for background processes
wait
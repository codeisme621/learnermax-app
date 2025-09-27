#!/bin/bash

# Script to deploy to Vercel and update e2e configuration with the preview URL
# Usage: ./update-preview-url.sh

set -e

echo "🚀 Deploying to Vercel to get preview URL..."

# Deploy to Vercel and capture the URL (vercel command outputs the deployment URL to stdout)
PREVIEW_URL=$(vercel --yes)

echo "✅ Deployment complete: $PREVIEW_URL"

# Path to e2e local.env file
E2E_ENV_FILE="e2e/local.env"

# Preserve existing VERCEL_AUTOMATION_BYPASS_SECRET
BYPASS_SECRET=""
if [ -f "$E2E_ENV_FILE" ]; then
    BYPASS_SECRET=$(grep "VERCEL_AUTOMATION_BYPASS_SECRET" "$E2E_ENV_FILE" 2>/dev/null || echo "")
fi

# Update the local.env file
echo "📝 Updating e2e configuration..."

cat > "$E2E_ENV_FILE" << EOF
# Local environment variables - DO NOT CHECK INTO GIT
UI_BASE_URL=${PREVIEW_URL}
API_BASE_URL=https://anfg4lcnxe.execute-api.us-east-1.amazonaws.com/Prod/
TEST_ENV=dev
${BYPASS_SECRET}
EOF

echo "✅ Updated ${E2E_ENV_FILE} with preview URL: $PREVIEW_URL"
echo "🎯 Ready to run e2e tests!"
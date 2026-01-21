#!/bin/sh

# This script injects environment variables into the HTML at runtime
# This allows Docker containers to be configured without rebuilding

# Default values
USE_FLASK_BACKEND="${USE_FLASK_BACKEND:-false}"
FLASK_BACKEND_URL="${FLASK_BACKEND_URL:-http://localhost:5001}"

echo "Injecting environment variables into index.html..."
echo "USE_FLASK_BACKEND=${USE_FLASK_BACKEND}"
echo "FLASK_BACKEND_URL=${FLASK_BACKEND_URL}"

# Create runtime configuration script
cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.USE_FLASK_BACKEND = ${USE_FLASK_BACKEND};
window.FLASK_BACKEND_URL = "${FLASK_BACKEND_URL}";
console.log('[Runtime Config] USE_FLASK_BACKEND:', window.USE_FLASK_BACKEND);
console.log('[Runtime Config] FLASK_BACKEND_URL:', window.FLASK_BACKEND_URL);
EOF

echo "Runtime configuration injected successfully"

# Start nginx
exec nginx -g 'daemon off;'

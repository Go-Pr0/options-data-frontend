#!/bin/sh

# Get the port from environment variable, default to 3000
PORT=${PORT:-3000}

echo "=== Frontend Startup ==="
echo "Starting frontend server on port $PORT"
echo "Environment variables:"
echo "PORT=$PORT"
echo "NODE_ENV=$NODE_ENV"
echo "PWD=$(pwd)"
echo "Build directory contents:"
ls -la build/ 2>/dev/null || echo "Build directory not found!"

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "ERROR: Build directory not found. Running build first..."
    npm run build
fi

echo "Starting serve command..."
# Start the serve command with the dynamic port
exec npx serve -s build -l $PORT
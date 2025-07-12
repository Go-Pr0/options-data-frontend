#!/bin/sh

# Get the port from environment variable, default to 3000
PORT=${PORT:-3000}

echo "Starting frontend server on port $PORT"
echo "Environment variables:"
echo "PORT=$PORT"
echo "NODE_ENV=$NODE_ENV"

# Start the serve command with the dynamic port
npx serve -s build -l $PORT
#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPT_DIR"

echo "🚀 Starting Life Dashboard from $ROOT_DIR..."

# Start backend in background
echo "Starting backend..."
cd "$ROOT_DIR/backend" && npm start &
BACKEND_PID=$!

# Give backend a moment to start
sleep 3

# Start frontend in background
echo "Starting frontend..."
cd "$ROOT_DIR/frontend" && npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Application should be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt and then kill both processes
trap "echo \"Stopping servers...\"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Wait for either process to exit
wait -n
echo "One of the processes has exited, shutting down..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
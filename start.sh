#!/usr/bin/env bash
set -e

# Check for debug mode
DEBUG_MODE=${DEBUG:-false}
if [[ "$DEBUG_MODE" == "true" ]]; then
  set -x  # Enable command tracing in debug mode
  echo "🐛 Debug mode enabled"
fi

echo "=== Work Tracker Startup Script ==="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js (>=18) from https://nodejs.org/"
  exit 1
fi
node_version=$(node -v)
echo "✅ Node.js $node_version"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm."
  exit 1
fi
echo "✅ npm $(npm -v)"

# Ensure we are in the script's directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  if [[ "$DEBUG_MODE" == "true" ]]; then
    npm install --verbose
  else
    npm install
  fi
else
  echo "📦 Dependencies already installed."
fi

# Ensure data directory exists
mkdir -p data

# Try to seed database (but don't fail if it doesn't work)
echo "🌱 Attempting to seed database with default areas..."
if [[ "$DEBUG_MODE" == "true" ]]; then
  npm run db:seed --workspace=tool/server
else
  npm run db:seed --workspace=tool/server 2>/dev/null
fi

if [[ "$DEBUG_MODE" == "true" ]]; then
  echo "✅ Database seeding completed."
else
  if npm run db:seed --workspace=tool/server 2>/dev/null; then
    echo "✅ Database seeded successfully."
  else
    echo "⚠️  Database seeding failed (this is common in WSL/Windows)."
    echo "    The app will still work - it will create tables on first run."
    echo "    To fix seeding later, you may need to:"
    echo "    1. Install build tools: sudo apt-get update && sudo apt-get install -y build-essential (WSL/Ubuntu)"
    echo "    2. Rebuild: npm rebuild better-sqlite3 --workspace=tool/server"
    echo "    3. Or reinstall: npm install better-sqlite3 --build-from-source --workspace=tool/server"
    echo ""
  fi
fi

# Start development server
echo ""
echo "🚀 Starting development server..."
echo "   API: http://localhost:3001"
echo "   UI:  http://localhost:5173"
echo "   Press Ctrl+C to stop."
echo ""

if [[ "$DEBUG_MODE" == "true" ]]; then
  echo "🐛 Running in debug mode with verbose output"
  npm run dev
else
  npm run dev
fi
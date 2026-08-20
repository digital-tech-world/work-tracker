#!/bin/bash

# Unified start script for testing - builds frontend and serves it via backend

echo "🔧 Building frontend for production..."
cd frontend
if ! npm run build; then
  echo "❌ Frontend build failed!"
  exit 1
fi
cd ..

echo "🚀 Starting unified server (backend serving frontend)..."
cd backend
npm start
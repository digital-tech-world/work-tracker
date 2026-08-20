#!/bin/bash

echo "🔧 Setting up Life Dashboard..."
echo "Installing backend dependencies..."
cd backend && npm install

echo "Installing frontend dependencies..."
cd ../frontend && npm install

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  ./start.sh"
echo ""
echo "Or manually:"
echo "  # In one terminal:"
echo "  cd backend && npm start"
echo "  # In another terminal:"
echo "  cd frontend && npm start"
echo ""
echo "Then visit: http://localhost:3000"
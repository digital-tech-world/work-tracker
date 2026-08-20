#!/bin/bash

# Life Dashboard - One Command Installation
echo "🚀 Life Dashboard - One Command Setup"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the Life Dashboard root directory"
    echo "   Current directory: $(pwd)"
    exit 1
fi

echo "📦 Installing dependencies..."
echo "   Backend..."
cd backend && npm install --silent > /dev/null 2>&1
echo "   Frontend..."
cd ../frontend && npm install --silent > /dev/null 2>&1

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure your credentials:"
echo "      • Edit backend/.env with your API keys"
echo "      • Get Google API credentials from: https://console.cloud.google.com/"
echo "      • Get GitHub token from: https://github.com/settings/tokens"
echo ""
echo "   2. Start the application:"
echo "      • One command: ./start.sh"
echo "      • Or manually:"
echo "        - Terminal 1: cd backend && npm start"
echo "        - Terminal 2: cd frontend && npm start"
echo ""
echo "   3. Open your browser to: http://localhost:3000"
echo ""
echo "💡 Tip: The first time you run it, you'll need to complete"
echo "   the Google OAuth flows for Calendar and Gmail."
echo ""
echo "🎉 Enjoy your Life Dashboard!"
#!/bin/bash

# Life Dashboard - Verification Script
echo "🔍 Life Dashboard - System Verification"
echo "======================================"

# Check if backend is running
echo -n "Checking backend... "
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Running"
    # Get detailed status
    STATUS=$(curl -s http://localhost:5000/api/health)
    echo "   Status: $STATUS"
else
    echo "❌ Not responding"
    echo "   Try: cd backend && npm start"
fi

# Check if frontend is running
echo -n "Checking frontend... "
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
    echo "   Try: cd frontend && npm start"
fi

# Check API endpoints
echo ""
echo "Checking API endpoints..."
echo -n "  Auth status: "
if curl -s http://localhost:5000/api/auth/status > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -n "  Today's briefing: "
if curl -s http://localhost:5000/api/briefing/today > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -n "  Calendar: "
if curl -s http://localhost:5000/api/calendar/today > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed (expected without credentials)"
fi

echo -n "  Email: "
if curl -s http://localhost:5000/api/email/today > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed (expected without credentials)"
fi

echo -n "  GitHub: "
if curl -s http://localhost:5000/api/github/today > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed (check GitHub PAT)"
fi

echo ""
echo "📋 Summary:"
echo "If backend shows ✅ Running and frontend shows ✅ Running,"
echo "then the system is operational!"
echo ""
echo "Next steps:"
echo "1. Configure credentials in backend/.env"
echo "2. Visit http://localhost:3000 to complete Google OAuth"
echo "3. Enjoy your personalized daily briefing!"
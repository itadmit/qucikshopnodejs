#!/bin/bash

# 🚀 QuickShop Development Environment Starter
# מפעיל את כל סביבת הפיתוח בפקודה אחת

echo "🚀 Starting QuickShop Development Environment..."
echo ""

# 1. עצירת כל התהליכים הקיימים
echo "🛑 Stopping all existing processes..."
pkill -9 -f "npm start" 2>/dev/null
pkill -9 -f "npm run dev" 2>/dev/null
pkill -9 -f "node server.js" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null

# 2. שחרור פורטים בכוח
echo "🔓 Freeing ports 3001 and 5173..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# המתנה קצרה לוודא שהתהליכים נעצרו
sleep 2

# 3. בדיקת PostgreSQL
echo "🐘 Checking PostgreSQL..."
if ! brew services list | grep -q "postgresql@15.*started"; then
    echo "   Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 3
fi

# 4. בדיקת מסד נתונים
echo "🗄️  Checking database..."
if ! psql -U tadmitinteractive -d quickshop_dev -c "\q" 2>/dev/null; then
    echo "   Creating database..."
    createdb quickshop_dev 2>/dev/null || echo "   Database might already exist"
fi

# 5. הפעלת Backend
echo "⚙️  Starting Backend on port 3001..."
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# המתנה לBackend
sleep 3

# 6. בדיקת Backend
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# 7. הפעלת Frontend
echo "🎨 Starting Frontend on port 5173..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# המתנה לFrontend
sleep 3

# 8. בדיקת Frontend
if curl -s -I http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   API Health: http://localhost:3001/api/health"
echo ""
echo "👤 Demo User:"
echo "   Email: demo@quickshop.co.il"
echo "   Password: demo123"
echo ""
echo "🛠️  Useful commands:"
echo "   ./db-commands.sh status    # Database status"
echo "   ./db-commands.sh studio    # Prisma Studio"
echo "   ./stop-dev.sh             # Stop all services"
echo ""
echo "📋 Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""

# שמירת PIDs לעצירה מאוחר יותר
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo "🔥 Ready to code! Open http://localhost:5173 in your browser"

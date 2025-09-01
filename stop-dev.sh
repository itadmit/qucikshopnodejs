#!/bin/bash

# 🛑 QuickShop Development Environment Stopper
# עוצר את כל סביבת הפיתוח

echo "🛑 Stopping QuickShop Development Environment..."
echo ""

# 1. עצירה לפי PIDs שמורים
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "🔴 Stopping Backend (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID 2>/dev/null
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "🔴 Stopping Frontend (PID: $FRONTEND_PID)..."
    kill -9 $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
fi

# 2. עצירה בכוח של כל התהליכים
echo "🔨 Force killing all related processes..."
pkill -9 -f "npm start" 2>/dev/null
pkill -9 -f "npm run dev" 2>/dev/null
pkill -9 -f "node server.js" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null

# 3. שחרור פורטים
echo "🔓 Freeing ports..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 4. בדיקה שהפורטים פנויים
sleep 1
if lsof -i:3001 >/dev/null 2>&1; then
    echo "⚠️  Port 3001 still in use"
else
    echo "✅ Port 3001 is free"
fi

if lsof -i:5173 >/dev/null 2>&1; then
    echo "⚠️  Port 5173 still in use"
else
    echo "✅ Port 5173 is free"
fi

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To start again: ./start-dev.sh"

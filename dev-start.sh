#!/bin/bash

# QuickShop Development Environment Startup Script

echo "🚀 Starting QuickShop Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill existing processes on our ports
echo "🧹 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "�� Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "✏️  Please edit backend/.env with your configuration"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Frontend .env.local file not found. Copying from .env.example..."
    cp frontend/.env.example frontend/.env.local
    echo "✏️  Please edit frontend/.env.local with your configuration"
fi

# Setup database if needed
echo "🗄️  Setting up database..."
cd backend
if [ ! -f "prisma/dev.db" ]; then
    echo "Creating development database..."
    npx prisma migrate dev --name init
else
    echo "Database exists, running migrations..."
    npx prisma migrate dev
fi
npx prisma generate
cd ..

echo "🎯 Starting services..."

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if check_port 3001; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

echo ""
echo "🎉 QuickShop Development Environment is ready!"
echo ""
echo "📊 Services:"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173 (or check terminal output)"
echo "   API Health: http://localhost:3001/api/health"
echo ""
echo "🛑 To stop all services, press Ctrl+C or run:"
echo "   pkill -f 'node server.js'"
echo "   pkill -f 'vite'"
echo ""

# Keep script running and handle Ctrl+C
trap 'echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0' INT

# Wait for user to stop
wait

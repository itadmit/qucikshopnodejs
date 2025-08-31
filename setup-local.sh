#!/bin/bash

# 🚀 QuickShop - Local Development Setup Script
# This script will help you set up the project for local development

echo "🚀 QuickShop Local Development Setup"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env exists, if not copy from backup
if [ ! -f ".env" ]; then
    if [ -f ".env.backup" ]; then
        echo "📝 Creating .env file from backup..."
        cp .env.backup .env
        echo "⚠️  Please edit backend/.env with your database credentials and API keys"
    else
        echo "⚠️  No .env.backup found. Please create backend/.env manually"
    fi
else
    echo "✅ .env file already exists"
fi

cd ..

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Set up PostgreSQL database (see LOCAL_DEVELOPMENT_SETUP.md)"
echo "3. Run: cd backend && npx prisma migrate dev"
echo "4. Run: npm run dev (from root directory)"
echo ""
echo "📚 For detailed instructions, see LOCAL_DEVELOPMENT_SETUP.md"
echo ""
echo "🌐 After setup:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""

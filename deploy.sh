#!/bin/bash

# QuickShop Deployment Script
# This script handles deployment to production

set -e  # Exit on any error

echo "🚀 Starting QuickShop deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if production environment variables are set
if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET environment variable is required for production"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is required for production"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm ci --only=production

echo "🗄️  Running database migrations..."
npx prisma migrate deploy
npx prisma generate

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm ci

echo "🏗️  Building frontend for production..."
npm run build

echo "🔧 Setting up production environment..."
cd ..

# Create production start script
cat > start-production.sh << 'PROD_EOF'
#!/bin/bash
export NODE_ENV=production
cd backend
npm start
PROD_EOF

chmod +x start-production.sh

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set your production environment variables on your server"
echo "2. Upload the project files to your server"
echo "3. Run: ./start-production.sh"
echo ""
echo "🔐 Required environment variables for production:"
echo "- NODE_ENV=production"
echo "- JWT_SECRET=your-secure-jwt-secret"
echo "- DATABASE_URL=your-production-database-url"
echo "- FRONTEND_URL=https://yourdomain.com"
echo "- PORT=3001 (or your preferred port)"

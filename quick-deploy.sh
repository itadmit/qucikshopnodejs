#!/bin/bash

# QuickShop Quick Deploy Script
# This script performs a complete deployment

set -e

echo "🚀 QuickShop Quick Deploy Starting..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Test database connection
print_status "Step 1: Testing database connection..."
cd backend
if [ -f "test-db-connection.js" ]; then
    node test-db-connection.js
else
    print_warning "Database test script not found, skipping..."
fi
cd ..

# Step 2: Deploy backend
print_status "Step 2: Deploying backend to EC2..."
cd backend
if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
else
    print_error "Backend deploy script not found!"
    exit 1
fi
cd ..

# Step 3: Deploy frontend
print_status "Step 3: Deploying frontend to S3..."
cd frontend
if [ -f "deploy-s3.sh" ]; then
    chmod +x deploy-s3.sh
    ./deploy-s3.sh
else
    print_error "Frontend deploy script not found!"
    exit 1
fi
cd ..

print_status "🎉 Deployment completed!"
print_status "Next steps:"
print_status "1. Set up Nginx and SSL on the server:"
print_status "   scp setup-nginx-ssl.sh ubuntu@3.64.187.151:~/"
print_status "   ssh ubuntu@3.64.187.151"
print_status "   sudo ./setup-nginx-ssl.sh"
print_status ""
print_status "2. Configure DNS to point my-quickshop.com to 3.64.187.151"
print_status ""
print_status "3. Test your application at https://my-quickshop.com" 
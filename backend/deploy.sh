#!/bin/bash

# QuickShop Backend Deployment Script
# This script deploys the backend to EC2 instance

set -e  # Exit on any error

# Configuration
EC2_HOST="3.64.187.151"
EC2_USER="ubuntu"
SSH_KEY="~/.ssh/quickshop3key.pem"
REMOTE_DIR="/home/ubuntu/quickshop-backend"
LOCAL_DIR="."

echo "🚀 Starting QuickShop Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# SSH command with key
SSH_CMD="ssh -i $SSH_KEY $EC2_USER@$EC2_HOST"
SCP_CMD="scp -i $SSH_KEY"
RSYNC_CMD="rsync -avz -e \"ssh -i $SSH_KEY\""

# Check if SSH key exists
if [ ! -f ~/.ssh/quickshop3key.pem ]; then
    print_error "SSH key not found at ~/.ssh/quickshop3key.pem"
    print_error "Please make sure the key file exists and has correct permissions (chmod 400)"
    exit 1
fi

# Set correct permissions for SSH key
chmod 400 ~/.ssh/quickshop3key.pem

# Test SSH connection
print_status "Testing SSH connection to EC2..."
if ! $SSH_CMD -o ConnectTimeout=10 -o BatchMode=yes exit 2>/dev/null; then
    print_error "Cannot connect to EC2 instance. Please check:"
    print_error "1. SSH key path: ~/.ssh/quickshop3key.pem"
    print_error "2. Security group allows SSH (port 22)"
    print_error "3. Instance is running"
    exit 1
fi

print_status "SSH connection successful!"

# Create remote directory if it doesn't exist
print_status "Creating remote directory..."
$SSH_CMD "mkdir -p $REMOTE_DIR"

# Sync files to EC2 (excluding node_modules and .env files)
print_status "Syncing files to EC2..."
eval $RSYNC_CMD --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude '*.log' \
    --exclude '.git' \
    $LOCAL_DIR/ $EC2_USER@$EC2_HOST:$REMOTE_DIR/

# Deploy and start the application
print_status "Installing dependencies and starting application..."
$SSH_CMD << 'ENDSSH'
    cd /home/ubuntu/quickshop-backend
    
    # Install Node.js if not installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install --production
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations (be careful in production!)
    echo "Running database migrations..."
    npx prisma migrate deploy
    
    # Copy environment file
    if [ ! -f .env ]; then
        echo "Creating .env file from example..."
        cp env.production.example .env
        echo "⚠️  Please edit .env file with your actual credentials!"
    fi
    
    # Stop existing PM2 process if running
    pm2 stop quickshop-backend 2>/dev/null || true
    pm2 delete quickshop-backend 2>/dev/null || true
    
    # Start the application with PM2
    echo "Starting application with PM2..."
    pm2 start server.js --name "quickshop-backend" --env production
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    echo "✅ Backend deployment completed!"
    echo "📊 Application status:"
    pm2 status
ENDSSH

print_status "🎉 Deployment completed successfully!"
print_status "Backend is now running on: http://$EC2_HOST:3001"
print_status "Don't forget to:"
print_status "1. Edit the .env file on the server with your actual credentials"
print_status "2. Configure Nginx as reverse proxy"
print_status "3. Set up SSL certificate"

echo ""
print_warning "Next steps:"
print_warning "1. SSH to server: ssh -i ~/.ssh/quickshop3key.pem $EC2_USER@$EC2_HOST"
print_warning "2. Edit .env: nano /home/ubuntu/quickshop-backend/.env"
print_warning "3. Restart app: pm2 restart quickshop-backend" 
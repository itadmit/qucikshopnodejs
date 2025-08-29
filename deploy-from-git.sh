#!/bin/bash

# QuickShop Git-based Deployment Script
# This script deploys from Git repository to production

set -e  # Exit on any error

# Configuration
EC2_HOST="3.64.187.151"
EC2_USER="ubuntu"
SSH_KEY="~/.ssh/quickshop3key.pem"
REPO_URL="https://github.com/itadmit/qucikshopnodejs.git"
REMOTE_DIR="/home/ubuntu/quickshop-backend"

echo "🚀 QuickShop Git-based Deployment Starting..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# SSH command with key
SSH_CMD="ssh -i $SSH_KEY $EC2_USER@$EC2_HOST"

# Check if SSH key exists
if [ ! -f ~/.ssh/quickshop3key.pem ]; then
    print_error "SSH key not found at ~/.ssh/quickshop3key.pem"
    exit 1
fi

# Set correct permissions for SSH key
chmod 400 ~/.ssh/quickshop3key.pem

# Test SSH connection
print_status "Testing SSH connection to EC2..."
if ! $SSH_CMD -o ConnectTimeout=10 -o BatchMode=yes exit 2>/dev/null; then
    print_error "Cannot connect to EC2 instance"
    exit 1
fi

print_status "SSH connection successful!"

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes!"
    print_warning "Please commit your changes first:"
    print_warning "  git add ."
    print_warning "  git commit -m 'Production deployment'"
    print_warning "  git push"
    exit 1
fi

# Get current commit hash
COMMIT_HASH=$(git rev-parse HEAD)
print_status "Deploying commit: $COMMIT_HASH"

# Deploy to server
print_step "Deploying to server..."
$SSH_CMD << ENDSSH
    set -e
    
    echo "🚀 Starting deployment on server..."
    
    # Install Git if not installed
    if ! command -v git &> /dev/null; then
        echo "Installing Git..."
        sudo apt update
        sudo apt install -y git
    fi
    
    # Clone or update repository
    if [ -d "$REMOTE_DIR" ]; then
        echo "Updating existing repository..."
        cd $REMOTE_DIR
        git fetch origin
        git reset --hard origin/main
    else
        echo "Cloning repository..."
        git clone $REPO_URL $REMOTE_DIR
        cd $REMOTE_DIR
    fi
    
    # Switch to backend directory
    cd $REMOTE_DIR/backend
    
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
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        echo "Creating .env file from example..."
        cp env.production.example .env
        echo "⚠️  Please edit .env file with your actual credentials!"
    fi
    
    # Run migrations
    echo "Running database migrations..."
    npx prisma migrate deploy
    
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

echo ""
print_warning "Don't forget to:"
print_warning "1. Edit .env file on server: ssh -i ~/.ssh/quickshop3key.pem ubuntu@$EC2_HOST"
print_warning "2. Deploy frontend to S3: cd frontend && ./deploy-s3.sh"
print_warning "3. Set up Nginx and SSL: ./deploy-server-setup.sh"

echo ""
print_status "Deployment commit: $COMMIT_HASH" 
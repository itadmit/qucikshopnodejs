#!/bin/bash

# QuickShop Server Setup Deployment Script
# This script copies server setup files to EC2 and runs them

set -e  # Exit on any error

# Configuration
EC2_HOST="3.64.187.151"
EC2_USER="ubuntu"
SSH_KEY="~/.ssh/quickshop3key.pem"

echo "🚀 Deploying server setup files to EC2..."

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

# SSH and SCP commands with key
SSH_CMD="ssh -i $SSH_KEY $EC2_USER@$EC2_HOST"
SCP_CMD="scp -i $SSH_KEY"

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

# Copy setup files to server
print_status "Copying setup files to server..."
$SCP_CMD setup-nginx-ssl.sh $EC2_USER@$EC2_HOST:~/
$SCP_CMD nginx.conf $EC2_USER@$EC2_HOST:~/

# Make scripts executable
print_status "Making scripts executable..."
$SSH_CMD "chmod +x ~/setup-nginx-ssl.sh"

print_status "✅ Setup files deployed successfully!"

echo ""
print_warning "Next steps:"
print_warning "1. SSH to the server:"
print_warning "   ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151"
print_warning ""
print_warning "2. Run the setup script on the server:"
print_warning "   sudo ./setup-nginx-ssl.sh"
print_warning ""
print_warning "3. Make sure your domain points to the server before SSL setup!"

echo ""
print_status "Files copied to server:"
print_status "- ~/setup-nginx-ssl.sh (Nginx and SSL setup)"
print_status "- ~/nginx.conf (Nginx configuration)" 
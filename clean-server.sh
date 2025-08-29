#!/bin/bash

# QuickShop Server Cleanup Script
# This script cleans the EC2 server completely for fresh deployment

set -e  # Exit on any error

# Configuration
EC2_HOST="3.64.187.151"
EC2_USER="ubuntu"
SSH_KEY="~/.ssh/quickshop3key.pem"

echo "🧹 Starting QuickShop Server Cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Warning message
print_warning "⚠️  This will completely clean the server!"
print_warning "The following will be removed:"
print_warning "- All PM2 processes"
print_warning "- All application files"
print_warning "- Nginx configuration"
print_warning "- SSL certificates"
print_warning "- All logs"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_status "Operation cancelled."
    exit 0
fi

print_step "Starting server cleanup..."

# Clean the server
$SSH_CMD << 'ENDSSH'
    echo "🧹 Cleaning EC2 server..."
    
    # Stop and delete all PM2 processes
    echo "Stopping PM2 processes..."
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    
    # Remove application directories
    echo "Removing application files..."
    sudo rm -rf /home/ubuntu/quickshop-backend
    sudo rm -rf /home/ubuntu/quickshop-frontend
    sudo rm -rf /home/ubuntu/quickshop*
    
    # Stop Nginx
    echo "Stopping Nginx..."
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Remove Nginx configuration
    echo "Removing Nginx configuration..."
    sudo rm -f /etc/nginx/sites-available/quickshop
    sudo rm -f /etc/nginx/sites-enabled/quickshop
    
    # Restore default Nginx site
    sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # Remove SSL certificates
    echo "Removing SSL certificates..."
    sudo certbot delete --cert-name my-quickshop.com 2>/dev/null || true
    
    # Clean logs
    echo "Cleaning logs..."
    sudo rm -f /var/log/nginx/quickshop_*.log
    sudo rm -rf ~/.pm2/logs/*
    
    # Clean temporary files
    echo "Cleaning temporary files..."
    rm -f ~/setup-nginx-ssl.sh
    rm -f ~/deploy.sh
    rm -f ~/*.sh
    
    # Reset firewall to default (optional - be careful!)
    # echo "Resetting firewall..."
    # sudo ufw --force reset
    # sudo ufw allow OpenSSH
    # sudo ufw --force enable
    
    # Clean package cache
    echo "Cleaning package cache..."
    sudo apt autoremove -y 2>/dev/null || true
    sudo apt autoclean 2>/dev/null || true
    
    # Remove Node.js global packages (optional)
    echo "Cleaning global npm packages..."
    npm list -g --depth=0 2>/dev/null | grep quickshop | awk '{print $2}' | xargs npm uninstall -g 2>/dev/null || true
    
    echo "✅ Server cleanup completed!"
    echo "📊 Current status:"
    echo "- PM2 processes: $(pm2 list 2>/dev/null | grep -c 'online' || echo '0')"
    echo "- Nginx status: $(sudo systemctl is-active nginx 2>/dev/null || echo 'inactive')"
    echo "- Disk usage: $(df -h / | tail -1 | awk '{print $5}')"
ENDSSH

print_status "🎉 Server cleanup completed successfully!"
print_status "The server is now clean and ready for fresh deployment."

echo ""
print_status "Next steps:"
print_status "1. Commit your code to Git"
print_status "2. Run the deployment script: ./deploy.sh"
print_status "3. Set up Nginx and SSL: ./setup-nginx-ssl.sh"

echo ""
print_warning "Note: You may need to:"
print_warning "- Reconfigure your domain DNS settings"
print_warning "- Reinstall SSL certificates"
print_warning "- Update any external service configurations" 
#!/bin/bash

# QuickShop Nginx and SSL Setup Script
# Run this script on the EC2 instance to set up Nginx and SSL

set -e  # Exit on any error

echo "🚀 Setting up Nginx and SSL for QuickShop..."

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Update system packages
print_step "Updating system packages..."
apt update && apt upgrade -y

# Install Nginx
print_step "Installing Nginx..."
apt install nginx -y

# Install Certbot for SSL certificates
print_step "Installing Certbot for SSL certificates..."
apt install snapd -y
snap install core; snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# Create Nginx configuration
print_step "Setting up Nginx configuration..."
cat > /etc/nginx/sites-available/quickshop << 'EOF'
# QuickShop Nginx Configuration
server {
    listen 80;
    server_name my-quickshop.com www.my-quickshop.com 3.64.187.151;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check for backend
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files - serve from S3 or local build
    location / {
        # Temporary redirect to S3 bucket
        return 301 http://quickshop-frontend-bucket.s3-website.eu-central-1.amazonaws.com$request_uri;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    # Logs
    access_log /var/log/nginx/quickshop_access.log;
    error_log /var/log/nginx/quickshop_error.log;
}
EOF

# Enable the site
print_step "Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/quickshop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_step "Testing Nginx configuration..."
nginx -t

# Start and enable Nginx
print_step "Starting Nginx..."
systemctl start nginx
systemctl enable nginx

# Configure firewall
print_step "Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

print_status "✅ Nginx setup completed!"

# SSL Certificate setup
print_warning "Setting up SSL certificate..."
print_warning "Make sure your domain (my-quickshop.com) points to this server's IP (3.64.187.151)"
read -p "Press Enter when your domain is pointing to this server..."

print_step "Obtaining SSL certificate..."
certbot --nginx -d my-quickshop.com -d www.my-quickshop.com --non-interactive --agree-tos --email admin@my-quickshop.com

# Set up automatic certificate renewal
print_step "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

print_status "🎉 Setup completed successfully!"
print_status "Your site should now be available at:"
print_status "- http://my-quickshop.com (redirects to HTTPS)"
print_status "- https://my-quickshop.com"
print_status "- Backend API: https://my-quickshop.com/api"

echo ""
print_warning "Next steps:"
print_warning "1. Make sure your backend is running (pm2 status)"
print_warning "2. Deploy your frontend to S3"
print_warning "3. Test the complete application"
print_warning "4. Set up CloudFront for better performance"

echo ""
print_status "Useful commands:"
print_status "- Check Nginx status: systemctl status nginx"
print_status "- Check SSL certificate: certbot certificates"
print_status "- View Nginx logs: tail -f /var/log/nginx/quickshop_*.log"
print_status "- Restart Nginx: systemctl restart nginx" 
#!/bin/bash

# QuickShop Frontend Deployment Script to S3
# This script builds and deploys the frontend to S3

set -e  # Exit on any error

# Configuration
S3_BUCKET="quickshop-frontend-bucket"
AWS_REGION="eu-central-1"
CLOUDFRONT_DISTRIBUTION_ID=""  # Add if using CloudFront

echo "🚀 Starting QuickShop Frontend Deployment to S3..."

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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first:"
    print_error "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run: aws configure"
    exit 1
fi

print_status "AWS CLI configured successfully!"

# Check if S3 bucket exists, create if not
print_step "Checking S3 bucket..."
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    print_warning "S3 bucket '$S3_BUCKET' doesn't exist. Creating it..."
    aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION
    
    # Configure bucket for static website hosting
    print_status "Configuring bucket for static website hosting..."
    aws s3 website "s3://$S3_BUCKET" --index-document index.html --error-document index.html
    
    # Set bucket policy for public read access
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file://bucket-policy.json
    rm bucket-policy.json
    
    print_status "✅ S3 bucket created and configured!"
else
    print_status "S3 bucket '$S3_BUCKET' exists!"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_step "Installing dependencies..."
    npm install
fi

# Build the application
print_step "Building the application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed! 'dist' directory not found."
    exit 1
fi

print_status "✅ Build completed successfully!"

# Deploy to S3
print_step "Deploying to S3..."
aws s3 sync dist/ "s3://$S3_BUCKET" --delete --region $AWS_REGION

# Set proper content types for different file types
print_step "Setting content types..."
aws s3 cp "s3://$S3_BUCKET" "s3://$S3_BUCKET" --recursive \
    --metadata-directive REPLACE \
    --content-type "text/html" \
    --exclude "*" --include "*.html"

aws s3 cp "s3://$S3_BUCKET" "s3://$S3_BUCKET" --recursive \
    --metadata-directive REPLACE \
    --content-type "text/css" \
    --exclude "*" --include "*.css"

aws s3 cp "s3://$S3_BUCKET" "s3://$S3_BUCKET" --recursive \
    --metadata-directive REPLACE \
    --content-type "application/javascript" \
    --exclude "*" --include "*.js"

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_step "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
fi

# Get website URL
WEBSITE_URL="http://$S3_BUCKET.s3-website.$AWS_REGION.amazonaws.com"

print_status "🎉 Deployment completed successfully!"
print_status "Website URL: $WEBSITE_URL"
print_status "S3 Bucket: s3://$S3_BUCKET"

echo ""
print_warning "Next steps for production:"
print_warning "1. Set up CloudFront distribution for better performance and HTTPS"
print_warning "2. Configure custom domain (my-quickshop.com) to point to CloudFront"
print_warning "3. Set up SSL certificate in AWS Certificate Manager"
print_warning "4. Update CORS settings in backend to allow the new domain"

echo ""
print_status "To set up custom domain:"
print_status "1. Create CloudFront distribution with S3 as origin"
print_status "2. Add CNAME record in your DNS: my-quickshop.com -> CloudFront domain"
print_status "3. Add SSL certificate for my-quickshop.com in ACM" 
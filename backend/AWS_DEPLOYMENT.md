# 🚀 AWS Deployment Guide

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Domain name** (optional but recommended)

## 🗄️ Database Setup (RDS PostgreSQL)

### 1. Create RDS Instance
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier quickshop-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username quickshop_admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --storage-encrypted \
  --publicly-accessible
```

### 2. Update Environment Variables
```env
DATABASE_URL="postgresql://quickshop_admin:YOUR_PASSWORD@quickshop-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/postgres"
```

### 3. Run Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

## 📁 S3 Storage Setup

### 1. Create S3 Bucket
```bash
# Create bucket for media storage
aws s3 mb s3://quickshop-media-bucket

# Enable public read access for product images
aws s3api put-bucket-policy \
  --bucket quickshop-media-bucket \
  --policy file://s3-bucket-policy.json
```

### 2. S3 Bucket Policy (s3-bucket-policy.json)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::quickshop-media-bucket/public/*"
    }
  ]
}
```

### 3. Update Environment Variables
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=quickshop-media-bucket
```

## 🚀 Application Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended for beginners)

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize Elastic Beanstalk**
```bash
eb init quickshop-api
eb create quickshop-production
```

3. **Deploy**
```bash
eb deploy
```

### Option 2: AWS ECS (Docker)

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

2. **Build and Push to ECR**
```bash
aws ecr create-repository --repository-name quickshop-api
docker build -t quickshop-api .
docker tag quickshop-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/quickshop-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/quickshop-api:latest
```

### Option 3: AWS Lambda (Serverless)

1. **Install Serverless Framework**
```bash
npm install -g serverless
npm install serverless-http
```

2. **Create serverless.yml**
```yaml
service: quickshop-api
provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}
functions:
  api:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

## 🌐 Frontend Deployment (S3 + CloudFront)

### 1. Build Frontend
```bash
cd ../frontend
npm run build
```

### 2. Deploy to S3
```bash
aws s3 sync dist/ s3://quickshop-frontend-bucket --delete
```

### 3. Create CloudFront Distribution
```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

## 🔒 Security Checklist

- [ ] Use strong passwords for RDS
- [ ] Enable RDS encryption
- [ ] Configure VPC security groups
- [ ] Use IAM roles instead of access keys when possible
- [ ] Enable CloudTrail for audit logging
- [ ] Set up AWS WAF for API protection
- [ ] Configure SSL certificates
- [ ] Enable S3 bucket versioning

## 📊 Monitoring & Logging

### CloudWatch Setup
```bash
# Create log group
aws logs create-log-group --log-group-name /aws/quickshop/api

# Set retention policy
aws logs put-retention-policy \
  --log-group-name /aws/quickshop/api \
  --retention-in-days 30
```

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          npm run deploy
```

## 💰 Cost Optimization

### Free Tier Resources:
- **RDS**: db.t3.micro (750 hours/month)
- **S3**: 5GB storage, 20,000 GET requests
- **Lambda**: 1M requests, 400,000 GB-seconds
- **CloudFront**: 50GB data transfer

### Production Scaling:
- Use **RDS Multi-AZ** for high availability
- Implement **Auto Scaling** for EC2/ECS
- Use **ElastiCache** for Redis caching
- Set up **Load Balancer** for multiple instances

## 🆘 Troubleshooting

### Common Issues:
1. **Database Connection**: Check security groups and VPC settings
2. **S3 Permissions**: Verify IAM policies and bucket policies  
3. **CORS Issues**: Update API CORS configuration for production domain
4. **Environment Variables**: Ensure all required vars are set in production

### Useful Commands:
```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier quickshop-db

# View application logs
aws logs tail /aws/quickshop/api --follow

# Test S3 connectivity
aws s3 ls s3://quickshop-media-bucket
```

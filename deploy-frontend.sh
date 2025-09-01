#!/bin/bash

# QuickShop Frontend Deployment Script to S3
# מעדכן את הפרונטאנד ב-S3 bucket

set -e  # Exit on any error

# צבעים לפלט
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# הגדרות AWS S3 - עדכן את הפרטים שלך כאן
S3_BUCKET="quickshop3"
AWS_REGION="eu-central-1"
CLOUDFRONT_DISTRIBUTION_ID="YOUR_CLOUDFRONT_DISTRIBUTION_ID"  # אם יש לך CloudFront
DOMAIN_NAME="my-quickshop.com"  # הדומיין שלך

# הגדרות build
FRONTEND_DIR="frontend"
DIST_DIR="$FRONTEND_DIR/dist"

echo -e "${BLUE}🚀 מתחיל פריסת פרונטאנד QuickShop ל-S3${NC}"
echo "=================================="

# בדיקת תנאים מוקדמים
echo -e "${YELLOW}🔍 בודק תנאים מוקדמים...${NC}"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ שגיאה: תיקיית $FRONTEND_DIR לא נמצאה${NC}"
    exit 1
fi

# בדיקת AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ שגיאה: AWS CLI לא מותקן${NC}"
    echo -e "${YELLOW}💡 התקן עם: brew install awscli (Mac) או pip install awscli${NC}"
    exit 1
fi

# בדיקת הגדרות AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ שגיאה: AWS לא מוגדר${NC}"
    echo -e "${YELLOW}💡 הגדר עם: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}✅ תנאים מוקדמים בסדר${NC}"

# בדיקת Node.js ו-npm
echo -e "${YELLOW}📦 בודק Node.js ו-npm...${NC}"
cd "$FRONTEND_DIR"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ שגיאה: package.json לא נמצא ב-$FRONTEND_DIR${NC}"
    exit 1
fi

# התקנת dependencies אם צריך
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo -e "${YELLOW}📦 מתקין dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies כבר מותקנים${NC}"
fi

# יצירת קובץ environment לפרודקשן
echo -e "${YELLOW}⚙️ מגדיר משתני סביבה לפרודקשן...${NC}"
cat > .env.production << 'ENV_EOF'
VITE_API_URL=https://api.my-quickshop.com
VITE_NODE_ENV=production
VITE_APP_NAME=QuickShop
VITE_DOMAIN=my-quickshop.com
ENV_EOF

echo -e "${GREEN}✅ קובץ .env.production נוצר${NC}"

# בניית הפרויקט
echo -e "${YELLOW}🏗️ בונה פרויקט לפרודקשן...${NC}"
npm run build

# בדיקה שהבנייה הצליחה
if [ ! -d "$DIST_DIR" ] || [ ! -f "$DIST_DIR/index.html" ]; then
    echo -e "${RED}❌ שגיאה: בנייה נכשלה - $DIST_DIR לא נוצר או חסר index.html${NC}"
    exit 1
fi

echo -e "${GREEN}✅ בנייה הושלמה בהצלחה${NC}"

# חזרה לתיקיית הפרויקט
cd ..

# בדיקת קיום S3 bucket
echo -e "${YELLOW}🪣 בודק S3 bucket...${NC}"
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    echo -e "${YELLOW}⚠️ Bucket לא קיים, יוצר אותו...${NC}"
    
    # יצירת bucket
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3 mb "s3://$S3_BUCKET"
    else
        aws s3 mb "s3://$S3_BUCKET" --region "$AWS_REGION"
    fi
    
    # הגדרת website hosting
    aws s3 website "s3://$S3_BUCKET" \
        --index-document index.html \
        --error-document index.html
    
    # הגדרת bucket policy לגישה ציבורית
    cat > bucket-policy.json << POLICY_EOF
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
POLICY_EOF
    
    aws s3api put-bucket-policy --bucket "$S3_BUCKET" --policy file://bucket-policy.json
    rm bucket-policy.json
    
    echo -e "${GREEN}✅ Bucket נוצר והוגדר${NC}"
else
    echo -e "${GREEN}✅ Bucket קיים${NC}"
fi

# גיבוי הגרסה הנוכחית (אופציונלי)
echo -e "${YELLOW}💾 יוצר גיבוי של הגרסה הנוכחית...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_BUCKET="${S3_BUCKET}-backup-${TIMESTAMP}"

# יצירת bucket גיבוי זמני
aws s3 mb "s3://$BACKUP_BUCKET" --region "$AWS_REGION" 2>/dev/null || true
aws s3 sync "s3://$S3_BUCKET/" "s3://$BACKUP_BUCKET/" --quiet 2>/dev/null || echo "אין תוכן קיים לגיבוי"

# פריסה ל-S3
echo -e "${YELLOW}🚀 מעלה קבצים ל-S3...${NC}"

# העלאת קבצי static עם cache ארוך
echo -e "${YELLOW}📁 מעלה קבצי assets (JS, CSS, תמונות)...${NC}"
aws s3 sync "$DIST_DIR/" "s3://$S3_BUCKET/" \
    --delete \
    --cache-control "max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json" \
    --exclude "*.txt" \
    --exclude "*.xml"

# העלאת קבצי HTML ו-JSON עם cache קצר
echo -e "${YELLOW}📄 מעלה קבצי HTML ו-metadata...${NC}"
aws s3 sync "$DIST_DIR/" "s3://$S3_BUCKET/" \
    --delete \
    --cache-control "max-age=300" \
    --include "*.html" \
    --include "*.json" \
    --include "*.txt" \
    --include "*.xml"

# הגדרת content-type נכון לקבצים מיוחדים
echo -e "${YELLOW}🔧 מגדיר content-types...${NC}"

# קבצי JavaScript
aws s3 cp "s3://$S3_BUCKET/" "s3://$S3_BUCKET/" \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --metadata-directive REPLACE \
    --content-type "application/javascript" \
    --cache-control "max-age=31536000" \
    --quiet

# קבצי CSS
aws s3 cp "s3://$S3_BUCKET/" "s3://$S3_BUCKET/" \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --metadata-directive REPLACE \
    --content-type "text/css" \
    --cache-control "max-age=31536000" \
    --quiet

echo -e "${GREEN}✅ העלאה ל-S3 הושלמה${NC}"

# עדכון CloudFront (אם קיים)
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🌐 מעדכן CloudFront cache...${NC}"
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo -e "${BLUE}📋 Invalidation ID: $INVALIDATION_ID${NC}"
    echo -e "${YELLOW}⏳ ממתין לסיום invalidation (זה יכול לקחת כמה דקות)...${NC}"
    
    aws cloudfront wait invalidation-completed \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --id "$INVALIDATION_ID"
    
    echo -e "${GREEN}✅ CloudFront cache עודכן${NC}"
else
    echo -e "${YELLOW}⚠️ CloudFront לא מוגדר - דלג על invalidation${NC}"
fi

# בדיקת בריאות האתר
echo -e "${YELLOW}🏥 בודק בריאות האתר...${NC}"
WEBSITE_URL="http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"

if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_CLOUDFRONT_DISTRIBUTION_ID" ]; then
    WEBSITE_URL="https://$DOMAIN_NAME"
fi

sleep 5
if curl -f -s "$WEBSITE_URL" > /dev/null; then
    echo -e "${GREEN}✅ האתר נגיש ופועל!${NC}"
else
    echo -e "${YELLOW}⚠️ האתר אולי עדיין מתעדכן...${NC}"
fi

# ניקוי גיבוי ישן (שמור רק 3 גיבויים אחרונים)
echo -e "${YELLOW}🧹 מנקה גיבויים ישנים...${NC}"
OLD_BACKUPS=$(aws s3 ls | grep "${S3_BUCKET}-backup-" | head -n -3 | awk '{print $3}' || true)
for backup in $OLD_BACKUPS; do
    if [ ! -z "$backup" ]; then
        aws s3 rb "s3://$backup" --force 2>/dev/null || true
        echo -e "${BLUE}🗑️ נמחק גיבוי ישן: $backup${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 פריסת פרונטאנד הושלמה בהצלחה!${NC}"
echo "=================================="
echo -e "${BLUE}📋 פרטי הפריסה:${NC}"
echo -e "${YELLOW}• S3 Bucket:${NC} $S3_BUCKET"
echo -e "${YELLOW}• AWS Region:${NC} $AWS_REGION"
echo -e "${YELLOW}• Website URL:${NC} $WEBSITE_URL"
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}• CloudFront:${NC} $CLOUDFRONT_DISTRIBUTION_ID"
fi
echo -e "${YELLOW}• גיבוי זמין ב:${NC} s3://$BACKUP_BUCKET"
echo ""
echo -e "${BLUE}🔧 פקודות שימושיות:${NC}"
echo -e "${YELLOW}• צפייה בקבצים:${NC} aws s3 ls s3://$S3_BUCKET/ --recursive"
echo -e "${YELLOW}• הורדת גיבוי:${NC} aws s3 sync s3://$BACKUP_BUCKET/ ./backup/"
echo -e "${YELLOW}• מחיקת cache:${NC} aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths '/*'"
echo ""

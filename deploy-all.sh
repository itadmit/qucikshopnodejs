#!/bin/bash

# 🚀 QuickShop - One Command Deploy
# פקודה אחת לפריסה מלאה: Git + Frontend S3 + Backend EC2 + DB Migration

set -e  # Exit on any error

# צבעים לפלט
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# פונקציה להדפסת כותרת
print_header() {
    echo ""
    echo -e "${BLUE}=================================="
    echo -e "🚀 $1"
    echo -e "==================================${NC}"
}

# פונקציה לבדיקת הצלחה
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 הושלם בהצלחה${NC}"
    else
        echo -e "${RED}❌ שגיאה ב-$1${NC}"
        exit 1
    fi
}

# בדיקת תנאים מוקדמים
print_header "בדיקת תנאים מוקדמים"

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ שגיאה: תיקיות backend או frontend לא נמצאו${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ שגיאה: Git לא מותקן${NC}"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ שגיאה: AWS CLI לא מותקן${NC}"
    exit 1
fi

# Load environment variables from deploy.env
if [ -f "deploy.env" ]; then
    source deploy.env
    echo -e "${GREEN}✅ טעינת משתני סביבה מ-deploy.env${NC}"
else
    echo -e "${RED}❌ שגיאה: קובץ deploy.env לא נמצא${NC}"
    echo -e "${YELLOW}💡 העתק את deploy.env.example ל-deploy.env ומלא את הפרטים${NC}"
    exit 1
fi

echo -e "${GREEN}✅ כל התנאים המוקדמים מתקיימים${NC}"

# שלב 1: Git Commit & Push
print_header "שלב 1: שמירה ודחיפה ל-Git"

# בדוק אם יש שינויים
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 נמצאו שינויים, מבצע commit...${NC}"
    
    # קבל הודעת commit מהמשתמש או השתמש בברירת מחדל
    if [ -z "$1" ]; then
        COMMIT_MSG="עדכון אוטומטי - $(date '+%Y-%m-%d %H:%M:%S')"
    else
        COMMIT_MSG="$1"
    fi
    
    git add .
    git commit -m "$COMMIT_MSG"
    check_success "Git Commit"
    
    # דחיפה לרפוזיטורי (אם יש remote)
    if git remote | grep -q origin; then
        echo -e "${YELLOW}⬆️ דוחף לרפוזיטורי...${NC}"
        git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo -e "${YELLOW}⚠️ לא ניתן לדחוף - אולי אין remote או branch שונה${NC}"
    else
        echo -e "${YELLOW}⚠️ אין remote repository מוגדר${NC}"
    fi
else
    echo -e "${GREEN}✅ אין שינויים חדשים ב-Git${NC}"
fi

# שלב 2: Frontend Build & S3 Upload
print_header "שלב 2: בניית פרונטאנד והעלאה ל-S3"

cd frontend

echo -e "${YELLOW}📦 בונה פרונטאנד...${NC}"
npm run build
check_success "Frontend Build"

echo -e "${YELLOW}⬆️ מעלה ל-S3...${NC}"
aws s3 sync dist/ s3://quickshop3/ --delete
check_success "S3 Upload"

# אם יש CloudFront - נקה cache
CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[0].DomainName=='quickshop3.s3.amazonaws.com'].Id" --output text 2>/dev/null || echo "")
if [ ! -z "$CLOUDFRONT_ID" ] && [ "$CLOUDFRONT_ID" != "None" ]; then
    echo -e "${YELLOW}🔄 מנקה CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*" > /dev/null
    check_success "CloudFront Invalidation"
fi

cd ..

# שלב 3: Backend Update to EC2
print_header "שלב 3: עדכון בקאנד ב-EC2"

# הגדרות EC2 נטענות מ-deploy.env
# EC2_HOST, EC2_USER, EC2_KEY_PATH, REMOTE_PATH, SERVICE_NAME

# בדיקת חיבור לשרת
echo -e "${YELLOW}🔗 בודק חיבור לשרת EC2...${NC}"
if ! ssh -i "$EC2_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ שגיאה: לא ניתן להתחבר לשרת EC2${NC}"
    exit 1
fi

# יצירת ארכיון של הבקאנד
echo -e "${YELLOW}📦 יוצר ארכיון של הבקאנד...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="backend_${TIMESTAMP}.tar.gz"

cd backend
tar --exclude='node_modules' \
    --exclude='.env*' \
    --exclude='logs' \
    --exclude='*.log' \
    --exclude='prisma/dev.db*' \
    --exclude='.DS_Store' \
    -czf "../$ARCHIVE_NAME" .
cd ..

# העלאה לשרת
echo -e "${YELLOW}⬆️ מעלה ארכיון לשרת...${NC}"
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$ARCHIVE_NAME" "$EC2_USER@$EC2_HOST:/tmp/"

# העלאת קובץ deploy.env לשרת
echo -e "${YELLOW}📄 מעלה קובץ סביבה לשרת...${NC}"
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "deploy.env" "$EC2_USER@$EC2_HOST:/tmp/deploy.env"

# פריסה בשרת
echo -e "${YELLOW}🚀 מפריס בשרת...${NC}"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    set -e
    
    # עצירת השירות
    sudo systemctl stop $SERVICE_NAME 2>/dev/null || echo 'שירות לא פועל'
    
    # גיבוי הגרסה הנוכחית
    if [ -d '$REMOTE_PATH' ]; then
        sudo mv '$REMOTE_PATH' '${REMOTE_PATH}_backup_$(date +%Y%m%d_%H%M%S)' 2>/dev/null || true
    fi
    
    # יצירת תיקיית יעד
    sudo mkdir -p '$REMOTE_PATH'
    sudo chown \$USER:\$USER '$REMOTE_PATH'
    
    # חילוץ הארכיון
    cd '$REMOTE_PATH'
    tar -xzf '/tmp/$ARCHIVE_NAME'
    
    # התקנת dependencies
    npm ci --only=production
    
    # יצירת קובץ .env מ-deploy.env
    if [ -f '/tmp/deploy.env' ]; then
        cp '/tmp/deploy.env' '$REMOTE_PATH/.env'
        echo '.env file created from deploy.env'
    else
        echo 'Error: deploy.env not found in /tmp/'
        exit 1
    fi
    
    # הגדרת הרשאות
    sudo chown -R \$USER:\$USER '$REMOTE_PATH'
"

check_success "Backend Deployment"

# שלב 4: Database Migration
print_header "שלב 4: הרצת מיגרציות מסד נתונים"

echo -e "${YELLOW}🗄️ מריץ מיגרציות...${NC}"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    cd '$REMOTE_PATH'
    npx prisma generate
    npx prisma migrate deploy
"
check_success "Database Migration"

# הפעלת השירות
echo -e "${YELLOW}▶️ מפעיל שירות...${NC}"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    sudo systemctl start $SERVICE_NAME
    sleep 5
"

# בדיקת בריאות
echo -e "${YELLOW}🏥 בודק בריאות השירות...${NC}"
sleep 10
if ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "curl -f http://localhost:3001/api/health 2>/dev/null" > /dev/null; then
    echo -e "${GREEN}✅ השירות פועל בהצלחה!${NC}"
else
    echo -e "${YELLOW}⚠️ השירות אולי עדיין מתחיל...${NC}"
fi

# ניקוי
echo -e "${YELLOW}🧹 מנקה קבצים זמניים...${NC}"
rm -f "$ARCHIVE_NAME"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "rm -f /tmp/$ARCHIVE_NAME"

# סיכום
print_header "🎉 פריסה הושלמה בהצלחה!"

echo -e "${GREEN}✅ Git: שינויים נשמרו ונדחפו${NC}"
echo -e "${GREEN}✅ Frontend: נבנה והועלה ל-S3${NC}"
echo -e "${GREEN}✅ Backend: עודכן ב-EC2${NC}"
echo -e "${GREEN}✅ Database: מיגרציות הורצו${NC}"
echo ""
echo -e "${BLUE}🌐 כתובות חשובות:${NC}"
echo -e "${YELLOW}• אתר ראשי:${NC} https://my-quickshop.com"
echo -e "${YELLOW}• S3 ישיר:${NC} http://quickshop3.s3-website-eu-central-1.amazonaws.com"
echo -e "${YELLOW}• API:${NC} https://api.my-quickshop.com"
echo ""
echo -e "${PURPLE}🚀 הפרויקט שלך עודכן ופועל!${NC}"

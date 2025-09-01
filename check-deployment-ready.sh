#!/bin/bash

# QuickShop Deployment Readiness Check
# בודק שכל הדרישות לפריסה מתקיימות

set -e

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 בודק מוכנות לפריסה - QuickShop${NC}"
echo "=================================="

ERRORS=0
WARNINGS=0

# פונקציה לבדיקה
check_item() {
    local description="$1"
    local command="$2"
    local required="$3"  # true/false
    
    echo -n "• $description... "
    
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ (נדרש)${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠️ (אופציונלי)${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
}

echo -e "${YELLOW}🔧 בודק כלים נדרשים:${NC}"
check_item "Node.js מותקן" "command -v node" true
check_item "npm מותקן" "command -v npm" true
check_item "AWS CLI מותקן" "command -v aws" true
check_item "PostgreSQL client מותקן" "command -v psql" true
check_item "Git מותקן" "command -v git" false
check_item "curl מותקן" "command -v curl" false

echo ""
echo -e "${YELLOW}📁 בודק מבנה פרויקט:${NC}"
check_item "תיקיית backend קיימת" "[ -d backend ]" true
check_item "תיקיית frontend קיימת" "[ -d frontend ]" true
check_item "package.json בבקאנד" "[ -f backend/package.json ]" true
check_item "package.json בפרונטאנד" "[ -f frontend/package.json ]" true
check_item "Prisma schema קיים" "[ -f backend/prisma/schema.prisma ]" true

echo ""
echo -e "${YELLOW}🔐 בודק הגדרות AWS:${NC}"
check_item "AWS credentials מוגדרים" "aws sts get-caller-identity" true
check_item "גישה ל-S3" "aws s3 ls" true
check_item "גישה ל-CloudFront" "aws cloudfront list-distributions" false

echo ""
echo -e "${YELLOW}🗄️ בודק חיבור למסד נתונים:${NC}"
DB_HOST="database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com"
DB_USER="quickshop3"
DB_PASSWORD="hsWvFFav~c3QYX1a#8DEe*wfo)tB"
DB_NAME="postgres"

# בדיקת חיבור עם timeout
echo -n "• חיבור ל-PostgreSQL RDS... "
if timeout 10s bash -c "PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -U '$DB_USER' -d '$DB_NAME' -c 'SELECT 1' >/dev/null 2>&1"; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️ (יכול להיות בעיית רשת/security group)${NC}"
    ((WARNINGS++))
fi

echo ""
echo -e "${YELLOW}📦 בודק סקריפטי פריסה:${NC}"
check_item "deploy-backend.sh קיים" "[ -f deploy-backend.sh ]" true
check_item "deploy-frontend.sh קיים" "[ -f deploy-frontend.sh ]" true
check_item "deploy-database.sh קיים" "[ -f deploy-database.sh ]" true
check_item "deploy-full.sh קיים" "[ -f deploy-full.sh ]" true
check_item "סקריפטים בהרשאות הרצה" "[ -x deploy-full.sh ]" true

echo ""
echo -e "${YELLOW}⚙️ בודק הגדרות בסקריפטים:${NC}"

# בדיקת הגדרות בקאנד
if grep -q "3.64.187.151" deploy-backend.sh; then
    echo -e "• הגדרות EC2 בסקריפט... ${GREEN}✅${NC}"
else
    echo -e "• הגדרות EC2 בסקריפט... ${RED}❌ (צריך עדכון)${NC}"
    ((ERRORS++))
fi

# בדיקת קיום מפתח EC2
if [ -f "/Users/tadmitinteractive/Downloads/quickshop3key.pem" ]; then
    echo -e "• מפתח EC2 קיים... ${GREEN}✅${NC}"
else
    echo -e "• מפתח EC2 קיים... ${RED}❌ (לא נמצא)${NC}"
    ((ERRORS++))
fi

# בדיקת הגדרות פרונטאנד
if grep -q "YOUR_CLOUDFRONT_DISTRIBUTION_ID" deploy-frontend.sh; then
    echo -e "• הגדרות CloudFront... ${YELLOW}⚠️ (אופציונלי)${NC}"
    ((WARNINGS++))
else
    echo -e "• הגדרות CloudFront... ${GREEN}✅${NC}"
fi

echo ""
echo -e "${YELLOW}🏗️ בודק יכולת build:${NC}"

# בדיקת backend dependencies
if [ -d "backend/node_modules" ]; then
    echo -e "• Backend dependencies... ${GREEN}✅${NC}"
else
    echo -e "• Backend dependencies... ${YELLOW}⚠️ (יותקנו בפריסה)${NC}"
    ((WARNINGS++))
fi

# בדיקת frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo -e "• Frontend dependencies... ${GREEN}✅${NC}"
else
    echo -e "• Frontend dependencies... ${YELLOW}⚠️ (יותקנו בפריסה)${NC}"
    ((WARNINGS++))
fi

echo ""
echo "=================================="

# סיכום
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 המערכת מוכנה לפריסה!${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️ יש $WARNINGS אזהרות (לא חובה לתקן)${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🚀 פקודות פריסה זמינות:${NC}"
    echo -e "${YELLOW}• פריסה מלאה:${NC} ./deploy-full.sh full"
    echo -e "${YELLOW}• פריסה אינטראקטיבית:${NC} ./deploy-full.sh"
    echo -e "${YELLOW}• בדיקת סטטוס:${NC} ./deploy-full.sh status"
    
else
    echo -e "${RED}❌ נמצאו $ERRORS שגיאות שצריכות תיקון${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️ ו-$WARNINGS אזהרות${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💡 פעולות נדרשות:${NC}"
    
    if ! command -v aws &>/dev/null; then
        echo -e "${YELLOW}• התקן AWS CLI:${NC} brew install awscli (Mac) או pip install awscli"
    fi
    
    if ! aws sts get-caller-identity &>/dev/null; then
        echo -e "${YELLOW}• הגדר AWS:${NC} aws configure"
    fi
    
    if ! command -v psql &>/dev/null; then
        echo -e "${YELLOW}• התקן PostgreSQL client:${NC} brew install postgresql (Mac)"
    fi
    
    if grep -q "YOUR_EC2_IP_OR_HOSTNAME" deploy-backend.sh; then
        echo -e "${YELLOW}• עדכן פרטי EC2 ב:${NC} deploy-backend.sh"
    fi
    
    exit 1
fi

echo ""
echo -e "${BLUE}📋 מידע נוסף זמין ב:${NC} DEPLOYMENT_README.md"

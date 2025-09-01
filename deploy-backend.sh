#!/bin/bash

# QuickShop Backend Deployment Script to EC2
# מעדכן את הבקאנד בשרת EC2

set -e  # Exit on any error

# צבעים לפלט
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# הגדרות שרת EC2
EC2_HOST="3.64.187.151"  # שרת QuickShop3
EC2_USER="ubuntu"
EC2_KEY_PATH="/Users/tadmitinteractive/Downloads/quickshop3key.pem"  # מפתח QuickShop3
REMOTE_PATH="/var/www/quickshop"  # נתיב היעד בשרת
SERVICE_NAME="quickshop"  # שם השירות

# Load environment variables from deploy.env
if [ -f "deploy.env" ]; then
    source deploy.env
    echo -e "${GREEN}✅ טעינת משתני סביבה מ-deploy.env${NC}"
else
    echo -e "${RED}❌ שגיאה: קובץ deploy.env לא נמצא${NC}"
    echo -e "${YELLOW}💡 העתק את deploy.env.example ל-deploy.env ומלא את הפרטים${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 מתחיל פריסת בקאנד QuickShop ל-EC2${NC}"
echo "=================================="

# בדיקת תנאים מוקדמים
echo -e "${YELLOW}🔍 בודק תנאים מוקדמים...${NC}"

if [ ! -d "backend" ]; then
    echo -e "${RED}❌ שגיאה: תיקיית backend לא נמצאה${NC}"
    exit 1
fi

if [ ! -f "$EC2_KEY_PATH" ]; then
    echo -e "${RED}❌ שגיאה: מפתח EC2 לא נמצא ב-$EC2_KEY_PATH${NC}"
    echo -e "${YELLOW}💡 עדכן את EC2_KEY_PATH בסקריפט${NC}"
    exit 1
fi

# בדיקת חיבור לשרת
echo -e "${YELLOW}🔗 בודק חיבור לשרת EC2...${NC}"
if ! ssh -i "$EC2_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ שגיאה: לא ניתן להתחבר לשרת EC2${NC}"
    echo -e "${YELLOW}💡 בדוק את הפרטים: EC2_HOST, EC2_USER, EC2_KEY_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ חיבור לשרת הצליח${NC}"

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

echo -e "${GREEN}✅ ארכיון נוצר: $ARCHIVE_NAME${NC}"

# העלאת הארכיון לשרת
echo -e "${YELLOW}⬆️ מעלה ארכיון לשרת...${NC}"
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$ARCHIVE_NAME" "$EC2_USER@$EC2_HOST:/tmp/"

# יצירת סקריפט פריסה בשרת
echo -e "${YELLOW}🔧 יוצר סקריפט פריסה בשרת...${NC}"
cat > deploy_script.sh << 'DEPLOY_EOF'
#!/bin/bash
set -e

REMOTE_PATH="/var/www/quickshop"
SERVICE_NAME="quickshop"
ARCHIVE_NAME="$1"

echo "🔄 עוצר שירות (אם קיים)..."
sudo systemctl stop $SERVICE_NAME 2>/dev/null || echo "שירות לא פועל"

echo "📁 יוצר גיבוי של הגרסה הנוכחית..."
if [ -d "$REMOTE_PATH" ]; then
    sudo mv "$REMOTE_PATH" "${REMOTE_PATH}_backup_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
fi

echo "📂 יוצר תיקיית יעד..."
sudo mkdir -p "$REMOTE_PATH"
sudo chown $USER:$USER "$REMOTE_PATH"

echo "📦 מחלץ ארכיון..."
cd "$REMOTE_PATH"
tar -xzf "/tmp/$ARCHIVE_NAME"

echo "📦 מתקין dependencies..."
npm ci --only=production

echo "🗄️ מריץ migrations..."
npx prisma generate
npx prisma migrate deploy

echo "🔧 מגדיר הרשאות..."
sudo chown -R $USER:$USER "$REMOTE_PATH"
chmod +x "$REMOTE_PATH/server.js" 2>/dev/null || true

echo "✅ פריסה הושלמה!"
DEPLOY_EOF

# העלאת סקריפט הפריסה
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no deploy_script.sh "$EC2_USER@$EC2_HOST:/tmp/"

# הרצת הפריסה בשרת
echo -e "${YELLOW}🚀 מריץ פריסה בשרת...${NC}"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    chmod +x /tmp/deploy_script.sh
    /tmp/deploy_script.sh $ARCHIVE_NAME
"

# יצירת קובץ environment variables
echo -e "${YELLOW}⚙️ מגדיר משתני סביבה...${NC}"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    sudo tee $REMOTE_PATH/.env > /dev/null << 'ENV_EOF'
NODE_ENV=$NODE_ENV
PORT=$PORT
DATABASE_URL=\"$DATABASE_URL\"
JWT_SECRET=\"$JWT_SECRET\"
FRONTEND_URL=\"$FRONTEND_URL\"
AWS_ACCESS_KEY_ID=\"$AWS_ACCESS_KEY_ID\"
AWS_SECRET_ACCESS_KEY=\"$AWS_SECRET_ACCESS_KEY\"
AWS_REGION=\"$AWS_REGION\"
AWS_S3_BUCKET=\"$AWS_S3_BUCKET\"
ENV_EOF
"

# יצירת systemd service (אם לא קיים)
echo -e "${YELLOW}🔧 מגדיר systemd service...${NC}"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    if [ ! -f /etc/systemd/system/$SERVICE_NAME.service ]; then
        sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << 'SERVICE_EOF'
[Unit]
Description=QuickShop Backend Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$REMOTE_PATH
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$REMOTE_PATH/.env

# Logging
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
SERVICE_EOF

        sudo systemctl daemon-reload
        sudo systemctl enable $SERVICE_NAME
        echo '✅ systemd service נוצר'
    else
        echo '✅ systemd service כבר קיים'
    fi
"

# הפעלת השירות
echo -e "${YELLOW}▶️ מפעיל שירות...${NC}"
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    sudo systemctl start $SERVICE_NAME
    sleep 5
    sudo systemctl status $SERVICE_NAME --no-pager
"

# בדיקת בריאות השירות
echo -e "${YELLOW}🏥 בודק בריאות השירות...${NC}"
sleep 10
if ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "curl -f http://localhost:$PORT/health 2>/dev/null" > /dev/null; then
    echo -e "${GREEN}✅ השירות פועל בהצלחה!${NC}"
else
    echo -e "${YELLOW}⚠️ השירות אולי עדיין מתחיל... בדוק עם: sudo systemctl status $SERVICE_NAME${NC}"
fi

# ניקוי קבצים זמניים
echo -e "${YELLOW}🧹 מנקה קבצים זמניים...${NC}"
rm -f "$ARCHIVE_NAME" deploy_script.sh
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    rm -f /tmp/$ARCHIVE_NAME /tmp/deploy_script.sh
"

echo ""
echo -e "${GREEN}🎉 פריסת בקאנד הושלמה בהצלחה!${NC}"
echo "=================================="
echo -e "${BLUE}📋 פקודות שימושיות:${NC}"
echo -e "${YELLOW}• בדיקת סטטוס:${NC} ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'sudo systemctl status $SERVICE_NAME'"
echo -e "${YELLOW}• צפייה בלוגים:${NC} ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'sudo journalctl -u $SERVICE_NAME -f'"
echo -e "${YELLOW}• הפעלה מחדש:${NC} ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'sudo systemctl restart $SERVICE_NAME'"
echo -e "${YELLOW}• כתובת API:${NC} http://$EC2_HOST:$PORT"
echo ""

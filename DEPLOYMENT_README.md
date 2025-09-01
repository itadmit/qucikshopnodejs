# 🚀 מדריך פריסה - QuickShop

מדריך מלא לפריסת מערכת QuickShop לסביבת פרודקשן.

## 📋 תוכן עניינים

- [דרישות מוקדמות](#דרישות-מוקדמות)
- [הגדרה ראשונית](#הגדרה-ראשונית)
- [סקריפטי פריסה](#סקריפטי-פריסה)
- [שימוש מהיר](#שימוש-מהיר)
- [פתרון בעיות](#פתרון-בעיות)

## 🔧 דרישות מוקדמות

### כלים נדרשים
```bash
# Node.js ו-npm
node --version  # v18+
npm --version   # v8+

# AWS CLI
aws --version   # v2.0+

# PostgreSQL Client
psql --version  # v12+

# Git
git --version
```

### הרשאות AWS
```bash
# הגדר את AWS credentials
aws configure

# בדוק הרשאות
aws sts get-caller-identity
```

## ⚙️ הגדרה ראשונית

### 1. עדכון פרטי השרתים

#### עדכן `deploy-backend.sh`:
```bash
# שורות 15-20
EC2_HOST="YOUR_EC2_IP_OR_HOSTNAME"     # 3.123.45.67
EC2_USER="ubuntu"                      # או ec2-user
EC2_KEY_PATH="~/.ssh/your-key.pem"     # נתיב למפתח
REMOTE_PATH="/var/www/quickshop"       # נתיב בשרת
SERVICE_NAME="quickshop"               # שם השירות
```

#### עדכן `deploy-frontend.sh`:
```bash
# שורות 15-18
CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"  # אם יש CloudFront
DOMAIN_NAME="my-quickshop.com"               # הדומיין שלך
```

### 2. הכנת שרת EC2

```bash
# התחבר לשרת
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP

# התקן Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# התקן PM2 (אופציונלי)
sudo npm install -g pm2

# יצור תיקיית יעד
sudo mkdir -p /var/www/quickshop
sudo chown ubuntu:ubuntu /var/www/quickshop
```

### 3. הגדרת S3 Bucket

```bash
# יצירת bucket (אם לא קיים)
aws s3 mb s3://quickshop3 --region eu-central-1

# הגדרת website hosting
aws s3 website s3://quickshop3 \
  --index-document index.html \
  --error-document index.html
```

## 📦 סקריפטי פריסה

### `deploy-full.sh` - פריסה מלאה
הסקריפט הראשי שמנהל את כל התהליך.

```bash
# פריסה מלאה אינטראקטיבית
./deploy-full.sh

# פריסה מלאה ישירה
./deploy-full.sh full

# פריסה חלקית
./deploy-full.sh database   # רק מסד נתונים
./deploy-full.sh backend    # רק בקאנד
./deploy-full.sh frontend   # רק פרונטאנד
./deploy-full.sh status     # בדיקת סטטוס
```

### `deploy-database.sh` - מסד נתונים
מעדכן את PostgreSQL RDS עם migrations חדשים.

**מה הסקריפט עושה:**
- יוצר גיבוי אוטומטי
- מריץ Prisma migrations
- בודק תקינות מסד הנתונים
- יוצר סקריפט שחזור

```bash
./deploy-database.sh
```

### `deploy-backend.sh` - שרת EC2
מעלה ומפריס את הבקאנד לשרת EC2.

**מה הסקריפט עושה:**
- יוצר ארכיון של הבקאנד
- מעלה לשרת EC2
- מתקין dependencies
- מריץ migrations
- מגדיר systemd service
- מפעיל את השירות

```bash
./deploy-backend.sh
```

### `deploy-frontend.sh` - S3 + CloudFront
בונה ומעלה את הפרונטאנד ל-S3.

**מה הסקריפט עושה:**
- בונה את הפרויקט (npm run build)
- מעלה ל-S3 עם cache headers נכונים
- מעדכן CloudFront (אם קיים)
- יוצר גיבוי של הגרסה הקודמת

```bash
./deploy-frontend.sh
```

## 🚀 שימוש מהיר

### פריסה ראשונה
```bash
# 1. ודא שכל הפרטים מעודכנים בסקריפטים
# 2. הרץ פריסה מלאה
./deploy-full.sh full
```

### עדכון רגיל
```bash
# עדכון מהיר של הכל
./deploy-full.sh full

# או עדכון חלקי
./deploy-full.sh backend    # רק בקאנד
./deploy-full.sh frontend   # רק פרונטאנד
```

### בדיקת סטטוס
```bash
./deploy-full.sh status
```

## 🔍 פתרון בעיות

### בעיות נפוצות

#### 1. שגיאת חיבור ל-EC2
```bash
# בדוק את פרטי החיבור
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP

# ודא שהמפתח בהרשאות נכונות
chmod 400 ~/.ssh/your-key.pem
```

#### 2. שגיאת AWS permissions
```bash
# בדוק הרשאות
aws sts get-caller-identity

# הגדר מחדש
aws configure
```

#### 3. שגיאת מסד נתונים
```bash
# בדוק חיבור ישיר
PGPASSWORD="your-password" psql -h your-host -U your-user -d your-db

# שחזר מגיבוי
./restore-database.sh database-backups/quickshop_backup_YYYYMMDD_HHMMSS.sql.gz
```

#### 4. שירות לא עולה ב-EC2
```bash
# התחבר לשרת ובדוק
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP

# בדוק סטטוס השירות
sudo systemctl status quickshop

# צפה בלוגים
sudo journalctl -u quickshop -f

# הפעל מחדש
sudo systemctl restart quickshop
```

### לוגים ומעקב

#### לוגי פריסה מקומיים
```bash
# צפה בלוג האחרון
ls -la deployment_*.log
tail -f deployment_YYYYMMDD_HHMMSS.log
```

#### לוגי שרת
```bash
# התחבר לשרת
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP

# לוגי האפליקציה
sudo journalctl -u quickshop -f

# לוגי מערכת
sudo tail -f /var/log/syslog
```

#### לוגי AWS
```bash
# CloudWatch logs (אם מוגדר)
aws logs describe-log-groups
aws logs tail /aws/ec2/quickshop --follow
```

## 📊 מעקב ובקרה

### URLs חשובים
- **אתר ראשי:** https://my-quickshop.com
- **API:** https://api.my-quickshop.com
- **S3 Direct:** http://quickshop3.s3-website-eu-central-1.amazonaws.com

### פקודות שימושיות

#### בדיקת בריאות
```bash
# בדיקת API
curl -f https://api.my-quickshop.com/health

# בדיקת אתר
curl -f https://my-quickshop.com

# בדיקת מסד נתונים
PGPASSWORD="password" psql -h host -U user -d db -c "SELECT 1"
```

#### ניהול שירותים
```bash
# EC2 - ניהול השירות
ssh -i ~/.ssh/key.pem ubuntu@host 'sudo systemctl status quickshop'
ssh -i ~/.ssh/key.pem ubuntu@host 'sudo systemctl restart quickshop'
ssh -i ~/.ssh/key.pem ubuntu@host 'sudo systemctl stop quickshop'

# S3 - ניהול קבצים
aws s3 ls s3://quickshop3/ --recursive
aws s3 sync s3://quickshop3/ ./local-backup/

# CloudFront - ניקוי cache
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
```

## 🔒 אבטחה

### משתני סביבה רגישים
- `JWT_SECRET` - שנה לערך אקראי חזק
- `DATABASE_URL` - הסתר את הסיסמה בלוגים
- `AWS_SECRET_ACCESS_KEY` - אל תשתף בקוד

### הרשאות מומלצות
```bash
# EC2 Security Group
- Port 22 (SSH) - רק מה-IP שלך
- Port 3001 (API) - רק מ-CloudFront/ALB
- Port 443 (HTTPS) - כולם

# S3 Bucket Policy
- GetObject - כולם (לאתר סטטי)
- PutObject - רק מ-CI/CD

# RDS Security Group  
- Port 5432 - רק מ-EC2 instances
```

## 📞 תמיכה

אם נתקלת בבעיות:

1. **בדוק את הלוגים** - `deployment_*.log`
2. **הרץ בדיקת סטטוס** - `./deploy-full.sh status`
3. **בדוק את הדוקומנטציה** של AWS/PostgreSQL
4. **צור issue** בפרויקט עם פרטי השגיאה

---

**עדכון אחרון:** $(date)
**גרסה:** 1.0.0

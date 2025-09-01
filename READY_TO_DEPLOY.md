# ✅ QuickShop מוכן לפריסה!

## 📊 סטטוס הגדרות

### ✅ מה שמוכן:
- **EC2 Server**: 3.64.187.151 (ubuntu)
- **SSH Key**: /Users/tadmitinteractive/Downloads/quickshop3key.pem ✅
- **AWS Credentials**: מוגדרים ופועלים ✅
- **S3 Bucket**: quickshop3 ✅
- **AWS Region**: eu-central-1 ✅
- **Database**: PostgreSQL RDS מוגדר ✅

### ⚠️ הערות חשובות:
- **חיבור למסד נתונים**: לא נגיש ישירות מהמחשב המקומי (נורמלי ובטוח!)
- **RDS Security Group**: מאפשר חיבור רק מ-EC2 instances - זה הנכון
- **Database Migrations**: יורצו דרך שרת EC2 שיש לו גישה ל-RDS
- **CloudFront**: לא מוגדר (אופציונלי)

## 🚀 איך לפרוס עכשיו:

### 1. פריסה מלאה (מומלץ):
```bash
./deploy-full.sh full
```

### 2. פריסה שלב אחר שלב:
```bash
# שלב 1: מסד נתונים (יעבוד מהשרת)
./deploy-full.sh database

# שלב 2: בקאנד לשרת EC2
./deploy-full.sh backend

# שלב 3: פרונטאנד ל-S3
./deploy-full.sh frontend
```

### 3. בדיקת סטטוס:
```bash
./deploy-full.sh status
```

## 🔧 פרטי הפריסה:

### Backend (EC2):
- **שרת**: 3.64.187.151
- **משתמש**: ubuntu
- **נתיב**: /var/www/quickshop
- **שירות**: quickshop (systemd)
- **פורט**: 3001

### Frontend (S3):
- **Bucket**: quickshop3
- **Region**: eu-central-1
- **URL**: http://quickshop3.s3-website-eu-central-1.amazonaws.com
- **Domain**: my-quickshop.com

### Database (RDS):
- **Host**: database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com
- **User**: quickshop3
- **Database**: postgres
- **Port**: 5432

## 📋 מה יקרה בפריסה:

### שלב 1 - Database:
1. חיבור לשרת EC2
2. יצירת גיבוי אוטומטי דרך השרת
3. העלאת Prisma schema לשרת
4. הרצת Prisma migrations בשרת
5. בדיקת תקינות מסד הנתונים דרך השרת

### שלב 2 - Backend:
1. יצירת ארכיון של הקוד
2. העלאה לשרת EC2
3. התקנת dependencies
4. הרצת migrations
5. הגדרת systemd service
6. הפעלת השירות

### שלב 3 - Frontend:
1. בניית הפרויקט (npm run build)
2. העלאה ל-S3
3. הגדרת cache headers
4. יצירת גיבוי של הגרסה הקודמת

## 🏥 בדיקות בריאות:

לאחר הפריסה, המערכת תבדוק:
- ✅ שרת EC2 פועל
- ✅ API נגיש
- ✅ מסד נתונים מחובר
- ✅ S3 bucket פעיל
- ✅ אתר נגיש

## 🔍 מעקב ובקרה:

### URLs לבדיקה:
- **API Health**: http://3.64.187.151:3001/health
- **S3 Website**: http://quickshop3.s3-website-eu-central-1.amazonaws.com
- **Domain**: https://my-quickshop.com (אם מוגדר)

### פקודות שימושיות:
```bash
# בדיקת סטטוס שירות
ssh -i /Users/tadmitinteractive/Downloads/quickshop3key.pem ubuntu@3.64.187.151 'sudo systemctl status quickshop'

# צפייה בלוגים
ssh -i /Users/tadmitinteractive/Downloads/quickshop3key.pem ubuntu@3.64.187.151 'sudo journalctl -u quickshop -f'

# הפעלה מחדש
ssh -i /Users/tadmitinteractive/Downloads/quickshop3key.pem ubuntu@3.64.187.151 'sudo systemctl restart quickshop'
```

## 🚨 במקרה של בעיות:

### אם הפריסה נכשלת:
1. בדוק את הלוגים: `deployment_YYYYMMDD_HHMMSS.log`
2. הרץ: `./deploy-full.sh status`
3. בדוק חיבור לשרת: `ssh -i /Users/tadmitinteractive/Downloads/quickshop3key.pem ubuntu@3.64.187.151`

### שחזור מגיבוי:
```bash
# מסד נתונים
./restore-database.sh database-backups/quickshop_backup_YYYYMMDD_HHMMSS.sql.gz

# S3 (גיבוי אוטומטי נוצר)
aws s3 sync s3://quickshop3-backup-YYYYMMDD_HHMMSS/ s3://quickshop3/
```

---

## 🎯 מוכן לפריסה!

הכל מוגדר ומוכן. פשוט הרץ:

```bash
./deploy-full.sh full
```

והמערכת תטפל בכל השאר! 🚀

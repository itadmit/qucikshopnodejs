# רשימת בדיקות לפני העלאה לפרודקשן

## ✅ בדיקות לפני התחלה

### 1. סביבת הפיתוח
- [ ] הפרויקט עובד בלוקל ללא שגיאות
- [ ] כל הטסטים עוברים (אם יש)
- [ ] הקוד עבר code review
- [ ] אין console.log או debug code בפרודקשן

### 2. משתני סביבה
- [ ] קובץ `.env` מוכן עם פרטי פרודקשן
- [ ] JWT_SECRET שונה מהדיפולט
- [ ] פרטי מסד הנתונים נכונים
- [ ] AWS credentials מוגדרים

### 3. מסד נתונים
- [ ] RDS instance פועל
- [ ] Security Group מאפשר חיבורים מ-EC2
- [ ] שם המסד נתונים קיים (quickshop)
- [ ] Migrations מוכנות להרצה

## ✅ בדיקות תשתית AWS

### 1. EC2 Instance
- [ ] Instance פועל (3.64.187.151)
- [ ] SSH access עובד
- [ ] Security Group מאפשר פורטים: 22, 80, 443, 3001
- [ ] Elastic IP מוקצה

### 2. RDS Database
- [ ] Instance פועל
- [ ] Endpoint נגיש: `database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com`
- [ ] Username: `quickshop3`
- [ ] Password: `hsWvFFav~c3QYX1a#8DEe*wfo)tB`
- [ ] Port 3306 פתוח

### 3. S3 Bucket
- [ ] AWS CLI מותקן ומוגדר
- [ ] הרשאות לצור ולנהל S3 buckets
- [ ] Region: eu-central-1

## ✅ בדיקות דומיין ו-DNS

### 1. Domain Configuration
- [ ] הדומיין my-quickshop.com רכוש
- [ ] DNS מצביע ל-IP: 3.64.187.151
- [ ] רקורד A: @ -> 3.64.187.151
- [ ] רקורד CNAME: www -> my-quickshop.com
- [ ] TTL מוגדר ל-300 (5 דקות)

### 2. SSL Certificate
- [ ] Email לתעודת SSL מוכן: admin@my-quickshop.com
- [ ] הדומיין מצביע לשרת (חובה לפני SSL)

## ✅ בדיקות קבצים

### 1. Backend Files
- [ ] `env.production.example` קיים ומעודכן
- [ ] `deploy.sh` קיים ובר הפעלה
- [ ] `test-db-connection.js` קיים
- [ ] `package.json` מעודכן
- [ ] Prisma schema מעודכן

### 2. Frontend Files
- [ ] `env.production.example` קיים
- [ ] `deploy-s3.sh` קיים ובר הפעלה
- [ ] `vite.config.js` מוגדר לפרודקשן
- [ ] Build process עובד (`npm run build`)

### 3. Server Configuration
- [ ] `nginx.conf` קיים
- [ ] `setup-nginx-ssl.sh` קיים ובר הפעלה

## ✅ בדיקות אבטחה

### 1. Credentials
- [ ] כל הסיסמאות חזקות ויחודיות
- [ ] JWT_SECRET אקראי וחזק
- [ ] AWS credentials מוגבלים לפעולות נדרשות בלבד
- [ ] Database password מורכב

### 2. Network Security
- [ ] Security Groups מוגבלים למינימום הנדרש
- [ ] SSH keys מוגנים
- [ ] לא נשמרים credentials בקוד

## ✅ תוכנית גיבוי

### 1. Database Backup
- [ ] תוכנית גיבוי אוטומטי ל-RDS
- [ ] גיבוי ידני לפני deployment
- [ ] תוכנית שחזור מוכנה

### 2. Code Backup
- [ ] קוד נשמר ב-Git
- [ ] Tag/Release מוכן
- [ ] גיבוי של קבצי תצורה

## 📋 סדר ביצוע ההעלאה

1. **הכנה מקומית**
   ```bash
   # בדוק חיבור למסד נתונים
   cd backend
   node test-db-connection.js
   ```

2. **העלאת Backend**
   ```bash
   cd backend
   ./deploy.sh
   ```

3. **הגדרת Nginx ו-SSL**
   ```bash
   scp setup-nginx-ssl.sh ubuntu@3.64.187.151:~/
   ssh ubuntu@3.64.187.151
   sudo ./setup-nginx-ssl.sh
   ```

4. **העלאת Frontend**
   ```bash
   cd frontend
   ./deploy-s3.sh
   ```

5. **בדיקות סופיות**
   - [ ] https://my-quickshop.com נטען
   - [ ] API calls עובדים
   - [ ] SSL certificate תקין
   - [ ] כל הפונקציות עובדות

## 🚨 בעיות נפוצות ופתרונות

### Database Connection Issues
```bash
# בדוק חיבור
telnet database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com 3306

# בדוק security group
aws rds describe-db-instances --db-instance-identifier database-1
```

### SSL Issues
```bash
# בדוק DNS
nslookup my-quickshop.com

# בדוק חיבור לשרת
telnet 3.64.187.151 80
```

### S3 Issues
```bash
# בדוק AWS credentials
aws sts get-caller-identity

# בדוק bucket permissions
aws s3api get-bucket-policy --bucket quickshop-frontend-bucket
```

## 📞 אנשי קשר לחירום

- **AWS Support**: [AWS Console](https://console.aws.amazon.com)
- **Domain Provider**: [תלוי בספק]
- **Development Team**: [פרטי צוות]

---

**זכור**: תמיד בצע גיבוי לפני שינויים בפרודקשן! 
# מדריך העלאה לפרודקשן - QuickShop

## סקירה כללית

המערכת תעבד בארכיטקטורה הבאה:
- **Backend**: EC2 (3.64.187.151) עם Node.js + PM2
- **Frontend**: S3 Static Website + CloudFront (אופציונלי)
- **Database**: RDS MySQL
- **Domain**: https://my-quickshop.com
- **SSL**: Let's Encrypt via Certbot
- **Reverse Proxy**: Nginx

## שלב 1: הכנת הסביבה המקומית

### 1.1 הכנת הבקאנד לפרודקשן

```bash
cd backend

# העתק קובץ משתני הסביבה
cp env.production.example .env

# ערוך את הקובץ עם הפרטים האמיתיים
nano .env
```

**ערוך את הקובץ `.env` עם הפרטים הבאים:**
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://my-quickshop.com
DATABASE_URL=mysql://quickshop3:hsWvFFav~c3QYX1a#8DEe*wfo)tB@database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com:3306/quickshop
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production-2024
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-central-1
AWS_S3_BUCKET=quickshop-frontend-bucket
```

### 1.2 הכנת הפרונטאנד לפרודקשן

```bash
cd frontend

# העתק קובץ משתני הסביבה
cp env.production.example .env.production

# ערוך את הקובץ אם נדרש
nano .env.production
```

## שלב 2: העלאת הבקאנד ל-EC2

### 2.1 הכנת גישה SSH

```bash
# וודא שיש לך גישה SSH לשרת
ssh ubuntu@3.64.187.151

# אם אין לך מפתח SSH, צור אחד
ssh-keygen -t rsa
# העתק את המפתח הציבורי לשרת
ssh-copy-id ubuntu@3.64.187.151
```

### 2.2 העלאת הבקאנד

```bash
cd backend

# הפעל את סקריפט ההעלאה
chmod +x deploy.sh
./deploy.sh
```

הסקריפט יבצע:
- העתקת קבצים לשרת
- התקנת Node.js ו-PM2
- התקנת תלויות
- הרצת migrations
- הפעלת האפליקציה

### 2.3 הגדרת משתני הסביבה בשרת

```bash
# התחבר לשרת
ssh ubuntu@3.64.187.151

# ערוך את קובץ הסביבה
cd /home/ubuntu/quickshop-backend
nano .env

# הפעל מחדש את האפליקציה
pm2 restart quickshop-backend
```

## שלב 3: הגדרת Nginx ו-SSL

### 3.1 הרצת סקריפט ההתקנה

```bash
# העתק את הסקריפט לשרת
scp setup-nginx-ssl.sh ubuntu@3.64.187.151:~/

# התחבר לשרת והרץ את הסקריפט
ssh ubuntu@3.64.187.151
sudo chmod +x setup-nginx-ssl.sh
sudo ./setup-nginx-ssl.sh
```

### 3.2 הגדרת DNS

**לפני הרצת הסקריפט, וודא שהדומיין מצביע לשרת:**

1. היכנס לספק הדומיין שלך
2. הוסף רקורד A:
   - Name: `@` (או `my-quickshop.com`)
   - Value: `3.64.187.151`
   - TTL: 300
3. הוסף רקורד CNAME:
   - Name: `www`
   - Value: `my-quickshop.com`
   - TTL: 300

## שלב 4: העלאת הפרונטאנד ל-S3

### 4.1 הגדרת AWS CLI

```bash
# התקן AWS CLI אם לא מותקן
# macOS:
brew install awscli
# או Ubuntu:
sudo apt install awscli

# הגדר את האישורים
aws configure
```

### 4.2 העלאת הפרונטאנד

```bash
cd frontend

# הפעל את סקריפט ההעלאה
chmod +x deploy-s3.sh
./deploy-s3.sh
```

הסקריפט יבצע:
- יצירת S3 bucket (אם לא קיים)
- הגדרת static website hosting
- build של האפליקציה
- העלאה ל-S3

## שלב 5: בדיקת החיבור למסד הנתונים

### 5.1 בדיקה מהשרת

```bash
ssh ubuntu@3.64.187.151
cd /home/ubuntu/quickshop-backend

# בדוק את הלוגים
pm2 logs quickshop-backend

# בדוק חיבור למסד נתונים
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Database connected successfully');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});
"
```

### 5.2 הרצת Migrations

```bash
# הרץ migrations אם נדרש
npx prisma migrate deploy

# אפס את הדאטה אם נדרש (זהירות!)
# npx prisma migrate reset --force
```

## שלב 6: בדיקות סופיות

### 6.1 בדיקת הבקאנד

```bash
# בדוק שהשרת עובד
curl http://3.64.187.151:3001/health
curl https://my-quickshop.com/api/health
```

### 6.2 בדיקת הפרונטאנד

1. פתח את הדפדפן ולך ל: https://my-quickshop.com
2. בדוק שהאתר נטען כראוי
3. בדוק שה-API calls עובדים

### 6.3 בדיקת HTTPS

```bash
# בדוק את תעודת ה-SSL
openssl s_client -connect my-quickshop.com:443 -servername my-quickshop.com
```

## שלב 7: אופטימיזציות נוספות (אופציונלי)

### 7.1 הגדרת CloudFront

1. היכנס ל-AWS Console
2. צור CloudFront Distribution
3. הגדר את S3 bucket כ-Origin
4. עדכן את Nginx להפנות ל-CloudFront במקום ישירות ל-S3

### 7.2 Monitoring ו-Logging

```bash
# התקן monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# הגדר log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## פקודות שימושיות לתחזוקה

### Backend Management
```bash
# סטטוס האפליקציה
pm2 status

# הפעלה מחדש
pm2 restart quickshop-backend

# צפייה בלוגים
pm2 logs quickshop-backend

# עדכון קוד
cd /home/ubuntu/quickshop-backend
git pull  # אם משתמש ב-git
pm2 restart quickshop-backend
```

### Nginx Management
```bash
# בדיקת סטטוס
sudo systemctl status nginx

# הפעלה מחדש
sudo systemctl restart nginx

# בדיקת תצורה
sudo nginx -t

# צפייה בלוגים
sudo tail -f /var/log/nginx/quickshop_*.log
```

### SSL Certificate Management
```bash
# בדיקת תעודות
sudo certbot certificates

# חידוש ידני
sudo certbot renew

# בדיקת חידוש אוטומטי
sudo certbot renew --dry-run
```

### Frontend Deployment
```bash
cd frontend
npm run build
./deploy-s3.sh
```

## פתרון בעיות נפוצות

### 1. שגיאת חיבור למסד נתונים
- בדוק את פרטי החיבור ב-.env
- וודא שה-RDS Security Group מאפשר חיבורים מה-EC2

### 2. שגיאת CORS
- עדכן את CORS_ORIGINS ב-.env של הבקאנד
- הפעל מחדש את הבקאנד

### 3. SSL לא עובד
- וודא שהדומיין מצביע לשרת
- הרץ `sudo certbot renew`

### 4. Frontend לא נטען
- בדוק את S3 bucket permissions
- וודא שה-build הצליח

## אבטחה

### 1. עדכון סיסמאות
- שנה את JWT_SECRET
- שנה את סיסמת מסד הנתונים אם נדרש

### 2. Firewall
```bash
# בדוק חוקי firewall
sudo ufw status

# אפשר רק פורטים נדרשים
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
```

### 3. עדכונים
```bash
# עדכן את המערכת
sudo apt update && sudo apt upgrade -y

# עדכן Node.js packages
npm audit fix
```

---

**הערה חשובה**: שמור על גיבויים של מסד הנתונים ושל קבצי התצורה לפני ביצוע שינויים בפרודקשן! 
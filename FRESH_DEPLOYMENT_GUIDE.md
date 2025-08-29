# מדריך Deployment חדש מאפס - QuickShop

## 🎯 מטרה
מדריך זה יעזור לך לנקות את השרת לחלוטין ולהתחיל deployment חדש מ-Git.

## 📋 דרישות מוקדמות

### 1. SSH Key
וודא שיש לך את ה-SSH key במקום הנכון:
```bash
ls -la ~/.ssh/quickshop3key.pem
# אמור להציג את הקובץ עם הרשאות 400
```

### 2. Git Repository
אתה צריך להעלות את הקוד ל-Git repository (GitHub/GitLab):
```bash
# אם עדיין לא יצרת repository, צור אחד ב-GitHub ואז:
git remote add origin https://github.com/YOUR_USERNAME/quickshop.git
git push -u origin main
```

### 3. AWS Credentials
וודא שיש לך AWS CLI מוגדר:
```bash
aws configure list
```

## 🧹 שלב 1: ניקוי השרת

### 1.1 הרץ את סקריפט הניקוי
```bash
# מהתיקיה הראשית של הפרויקט
./clean-server.sh
```

הסקריפט יבצע:
- עצירת כל תהליכי PM2
- מחיקת כל קבצי האפליקציה
- הסרת תצורת Nginx
- מחיקת תעודות SSL
- ניקוי לוגים וקבצים זמניים

### 1.2 אישור הניקוי
```bash
# התחבר לשרת ובדוק שהכל נקי
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151

# בדוק שאין תהליכי PM2
pm2 list

# בדוק שאין קבצי אפליקציה
ls -la ~/quickshop*

# צא מהשרת
exit
```

## 🚀 שלב 2: Deployment חדש מ-Git

### 2.1 עדכן את ה-Repository URL
ערוך את הקובץ `deploy-from-git.sh` ועדכן את השורה:
```bash
REPO_URL="https://github.com/YOUR_USERNAME/quickshop.git"
```

### 2.2 הרץ Deployment
```bash
# וודא שהקוד מועלה ל-Git
git status
git push

# הרץ deployment
./deploy-from-git.sh
```

## 🔧 שלב 3: הגדרת השרת

### 3.1 הגדרת משתני סביבה
```bash
# התחבר לשרת
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151

# ערוך את קובץ הסביבה
cd /home/ubuntu/quickshop-backend/backend
nano .env
```

**עדכן את הפרטים הבאים:**
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

### 3.2 הפעלה מחדש של הבקאנד
```bash
# עדיין בשרת
pm2 restart quickshop-backend

# בדוק שהכל עובד
pm2 status
pm2 logs quickshop-backend

# צא מהשרת
exit
```

### 3.3 בדיקת חיבור למסד נתונים
```bash
# מהמחשב המקומי
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151 "cd /home/ubuntu/quickshop-backend/backend && node test-db-connection.js"
```

## 🌐 שלב 4: הגדרת Nginx ו-SSL

### 4.1 העתקת קבצי הגדרה לשרת
```bash
./deploy-server-setup.sh
```

### 4.2 הרצת הגדרת Nginx ו-SSL
```bash
# התחבר לשרת
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151

# הרץ את סקריפט ההגדרה
sudo ./setup-nginx-ssl.sh

# צא מהשרת
exit
```

**חשוב**: וודא שהדומיין my-quickshop.com מצביע לשרת לפני הרצת הסקריפט!

## 🎨 שלב 5: העלאת הפרונטאנד

### 5.1 הגדרת AWS CLI (אם עדיין לא)
```bash
aws configure
# הכנס את ה-Access Key, Secret Key, Region (eu-central-1)
```

### 5.2 העלאת הפרונטאנד ל-S3
```bash
cd frontend
./deploy-s3.sh
```

## ✅ שלב 6: בדיקות סופיות

### 6.1 בדיקת הבקאנד
```bash
# בדוק שה-API עובד
curl http://3.64.187.151:3001/health
curl https://my-quickshop.com/api/health
```

### 6.2 בדיקת הפרונטאנד
1. פתח דפדפן ולך ל: https://my-quickshop.com
2. בדוק שהאתר נטען
3. בדוק שה-API calls עובדים

### 6.3 בדיקת SSL
```bash
# בדוק תעודת SSL
openssl s_client -connect my-quickshop.com:443 -servername my-quickshop.com | grep -E "(subject|issuer)"
```

## 🔄 עדכונים עתידיים

לאחר ה-deployment הראשון, לעדכונים עתידיים:

### עדכון בקאנד בלבד:
```bash
git add .
git commit -m "עדכון בקאנד"
git push
./deploy-from-git.sh
```

### עדכון פרונטאנד בלבד:
```bash
cd frontend
./deploy-s3.sh
```

### עדכון מלא:
```bash
git add .
git commit -m "עדכון מלא"
git push
./deploy-from-git.sh
cd frontend
./deploy-s3.sh
```

## 🚨 פתרון בעיות

### בעיית חיבור SSH
```bash
# בדוק הרשאות SSH key
chmod 400 ~/.ssh/quickshop3key.pem

# בדוק חיבור
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151 -v
```

### בעיית Git
```bash
# בדוק שה-repository URL נכון
git remote -v

# עדכן אם נדרש
git remote set-url origin https://github.com/YOUR_USERNAME/quickshop.git
```

### בעיית מסד נתונים
```bash
# בדוק חיבור מהשרת
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151
telnet database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com 3306
```

### בעיית SSL
```bash
# בדוק DNS
nslookup my-quickshop.com

# בדוק שהדומיין מצביע לשרת
dig my-quickshop.com
```

## 📞 עזרה נוספת

אם נתקלת בבעיות:
1. בדוק את הלוגים: `pm2 logs quickshop-backend`
2. בדוק סטטוס Nginx: `sudo systemctl status nginx`
3. בדוק את רשימת הבדיקות: `PRE_DEPLOYMENT_CHECKLIST.md`

---

**זכור**: תמיד עשה גיבוי לפני שינויים בפרודקשן! 
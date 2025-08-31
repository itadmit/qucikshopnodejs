# 🚀 מדריך פיתוח - QuickShop

## 📋 סקירה כללית
פרויקט QuickShop הוא פלטפורמת e-commerce עם:
- **Backend**: Node.js + Express + Prisma (פורט 3001)
- **Frontend**: React + Vite (פורט 5173)
- **Database**: PostgreSQL
- **Deployment**: AWS S3 + Nginx + SSL

---

## 🔧 הגדרת סביבת פיתוח

### 1. התחברות לשרת
```bash
ssh ubuntu@3.64.187.151 -i ~/.ssh/quickshop3key.pem
cd /home/ubuntu/qucikshopnodejs
```

### 2. הפעלת Backend (בטרמינל נפרד)
```bash
cd backend
npm start
# או עם PM2:
pm2 start server.js --name "quickshop-backend"
pm2 logs quickshop-backend  # לראות לוגים
```

### 3. הפעלת Frontend Development Server
```bash
cd frontend
VITE_API_URL=https://api.my-quickshop.com/api npm run dev -- --host 0.0.0.0 --port 5173
```

### 4. כתובות לפיתוח
- **Development Server**: http://3.64.187.151:5173/
- **חנות ספציפית**: http://3.64.187.151:5173/?store=yogevstore
- **מצב Preview**: http://3.64.187.151:5173/?preview=store&store=yogevstore
- **דשבורד**: http://3.64.187.151:5173/dashboard

---

## 🚀 פריסה לפרודקשן

### 1. בניית Frontend
```bash
cd frontend
VITE_API_URL=https://api.my-quickshop.com/api npm run build
```

### 2. העלאה ל-S3
```bash
aws s3 sync frontend/dist/ s3://quickshop-frontend-bucket --delete --exclude "*.map"
```

### 3. עדכון Backend (אם נדרש)
```bash
cd backend
pm2 restart quickshop-backend
# או:
pm2 stop quickshop-backend
pm2 start server.js --name "quickshop-backend"
```

---

## 🌐 כתובות פרודקשן

### דומיינים עיקריים
- **אתר ראשי**: https://my-quickshop.com/
- **API**: https://api.my-quickshop.com/
- **חנויות**: https://[STORE_SLUG].my-quickshop.com/

### דוגמאות
- **חנות יוגב**: https://yogevstore.my-quickshop.com/
- **דשבורד**: https://my-quickshop.com/dashboard
- **API Health**: https://api.my-quickshop.com/api/health

---

## 🔍 בדיקות ואבחון

### בדיקת API
```bash
curl https://api.my-quickshop.com/api/health
```

### בדיקת חנות
```bash
curl -I https://yogevstore.my-quickshop.com/
```

### לוגי Backend
```bash
pm2 logs quickshop-backend
```

### סטטוס שירותים
```bash
pm2 status
sudo systemctl status nginx
```

---

## 📁 מבנה הפרויקט

```
qucikshopnodejs/
├── backend/
│   ├── server.js          # שרת Express ראשי
│   ├── routes/           # נתיבי API
│   ├── prisma/           # סכמת DB ו-migrations
│   └── .env              # משתני סביבה
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # קומפוננט ראשי + זיהוי חנויות
│   │   ├── store/        # קומפוננטי חנות
│   │   └── dashboard/    # קומפוננטי דשבורד
│   ├── dist/             # קבצי build
│   └── vite.config.js    # הגדרות Vite
└── DEVELOPMENT_GUIDE.md  # המדריך הזה
```

---

## ⚙️ הגדרות חשובות

### משתני סביבה (Backend)
```bash
# backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/quickshop"
JWT_SECRET="your-secret-key"
PORT=3001
```

### משתני סביבה (Frontend)
```bash
# בזמן build
VITE_API_URL=https://api.my-quickshop.com/api
```

### CORS הגדרות
Backend מאפשר גישה מ:
- https://my-quickshop.com
- https://*.my-quickshop.com
- http://3.64.187.151:5173 (פיתוח)
- http://172.31.43.52:5173 (פיתוח)

---

## 🛠️ פתרון בעיות נפוצות

### 1. שגיאת CORS בפיתוח
```bash
# וודא שהשרת רץ עם הכתובת הנכונה:
cd backend && npm start
```

### 2. חנות לא נטענת
בדוק בקונסול:
```javascript
// צריך לראות:
🔍 Development store parameter detected: yogevstore
🏪 Final detected store slug: yogevstore
🏪 Rendering StoreApp with storeSlug: yogevstore
```

### 3. בעיות SSL
```bash
sudo certbot certificates  # בדיקת תוקף תעודות
sudo nginx -t              # בדיקת תחביר Nginx
sudo systemctl reload nginx
```

### 4. בעיות S3
```bash
aws s3 ls s3://quickshop-frontend-bucket/  # בדיקת תוכן
aws configure list                          # בדיקת הגדרות AWS
```

---

## 📝 זרימת עבודה מומלצת

### פיתוח חדש
1. התחבר לשרת
2. הפעל Backend
3. הפעל Frontend dev server
4. פתח http://3.64.187.151:5173/?store=yogevstore
5. עבוד עם hot reload

### פריסה
1. בנה Frontend עם `npm run build`
2. העלה ל-S3 עם `aws s3 sync`
3. בדוק ב-https://my-quickshop.com/
4. אם נדרש, עדכן Backend עם `pm2 restart`

### בדיקות
1. בדוק API: `curl https://api.my-quickshop.com/api/health`
2. בדוק חנות: https://yogevstore.my-quickshop.com/
3. בדוק דשבורד: https://my-quickshop.com/dashboard

---

## 🔐 אבטחה

### SSL תעודות
- **תוקף עד**: 2025-11-28
- **חידוש**: `sudo certbot certonly --manual --preferred-challenges dns -d "*.my-quickshop.com" -d "my-quickshop.com"`

### גיבויים
- **Database**: יש לגבות באופן קבוע
- **קבצים**: S3 bucket עם versioning

---

## 📞 תמיכה

### לוגים חשובים
```bash
# Backend logs
pm2 logs quickshop-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -u nginx -f
```

### קבצי הגדרה חשובים
- `/etc/nginx/sites-available/my-quickshop.com`
- `/etc/nginx/sites-available/api.my-quickshop.com`
- `/etc/nginx/sites-available/store-subdomains`
- `backend/.env`
- `frontend/vite.config.js`

---

## ✅ רשימת בדיקות לפני פריסה

- [ ] Backend רץ ללא שגיאות
- [ ] Frontend נבנה בהצלחה
- [ ] קבצים הועלו ל-S3
- [ ] אתר ראשי נגיש
- [ ] API עובד
- [ ] חנויות נגישות
- [ ] SSL תקין
- [ ] לוגים נקיים

---

**📅 עודכן לאחרונה**: נובמבר 2024  
**🔄 גרסה**: 1.0 
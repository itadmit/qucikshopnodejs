# QuickShop SaaS - E-Commerce Platform

## 📋 סקירה כללית

QuickShop הוא פלטפורמת SaaS לבניית חנויות אונליין עם תמיכה מלאה ב-multi-tenant architecture.

### טכנולוגיות
- **Backend**: Node.js + Express + Prisma + PostgreSQL (פורט 3001)
- **Frontend**: React + Vite + Tailwind CSS (פורט 5173)
- **Database**: PostgreSQL (פיתוח ופרודקשן)
- **Deployment**: AWS S3 + EC2 + Nginx + SSL

### ארכיטקטורה
- **SaaS Multi-Tenant**: תמיכה במספר חנויות ומשתמשים
- **Subdomain Stores**: כל חנות על סאב-דומיין נפרד
- **Unified Authentication**: מערכת אימות מאוחדת
- **Generic API**: כל ה-API גנרי ולא ספציפי לחנות

---

## 🚀 התחלה מהירה

### דרישות מוקדמות
```bash
# Node.js 18+
brew install node

# PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# יצירת מסד נתונים
createdb quickshop_dev
```

### התקנה
```bash
# שכפול הפרויקט
git clone <repository-url>
cd qucikshopnodejs

# התקנת תלויות Backend
cd backend && npm install

# התקנת תלויות Frontend  
cd ../frontend && npm install
```

### הגדרת מסד נתונים
```bash
# יצירת מסד נתונים PostgreSQL
createdb quickshop_dev

# הרצת מיגרציות
cd backend
npx prisma migrate dev

# יצירת נתוני דמו
node scripts/create-demo-user.js
```

### הגדרת משתני סביבה
קובץ `.env` נוצר אוטומטית עם:
```bash
DATABASE_URL="postgresql://tadmitinteractive@localhost:5432/quickshop_dev"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
NODE_ENV=development
PORT=3001
```

### הרצת המערכת
```bash
# Backend (טרמינל 1)
cd backend && npm start

# Frontend (טרמינל 2)  
cd frontend && npm run dev
```

### כתובות גישה
- **Main App**: http://localhost:5173
- **Store Example**: http://yogevstore.localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🏗️ ארכיטקטורה

### Domain Structure
```
Development:
- Main App: localhost:5173
- Store: {store-slug}.localhost:5173
- API: localhost:3001/api

Production:
- Main App: my-quickshop.com
- Store: {store-slug}.my-quickshop.com  
- API: api.my-quickshop.com (NO /api prefix)
```

### מבנה הפרויקט
```
qucikshopnodejs/
├── backend/                 # Node.js + Express Server
│   ├── middleware/
│   │   └── unified-auth.js  # מערכת אימות מאוחדת
│   ├── routes/             # נתיבי API גנריים
│   ├── prisma/             # סכמת DB ומיגרציות
│   ├── services/           # שירותים עסקיים
│   └── server.js           # שרת ראשי
├── frontend/               # React + Vite App
│   ├── src/
│   │   ├── components/     # רכיבי React
│   │   ├── config/
│   │   │   └── environment.js  # הגדרות סביבה
│   │   ├── services/       # שירותי API
│   │   └── store/          # רכיבי חנות
│   ├── .env.development    # משתני סביבה לפיתוח
│   └── .env.production     # משתני סביבה לפרודקשן
└── README.md              # המסמך הזה
```

---

## 🔐 מערכת האימות

### Unified Authentication
המערכת משתמשת במערכת אימות מאוחדת:

```javascript
// ✅ נכון - אימות בסיסי
import { requireAuth } from '../middleware/unified-auth.js';
router.get('/profile', requireAuth, handler);

// ✅ נכון - דשבורד (אימות + מנוי + זיהוי חנות)
import { requireDashboardAccess } from '../middleware/unified-auth.js';
router.get('/stats', requireDashboardAccess, handler);

// ✅ נכון - חנות (אימות + זיהוי חנות)
import { requireStoreAccess } from '../middleware/unified-auth.js';
router.get('/products', requireStoreAccess, handler);
```

### Store Identification
זיהוי החנות נעשה אוטומטית:
1. **מהדומיין**: yogevstore.localhost:5173 → storeSlug = "yogevstore"
2. **מפרמטרים**: ?storeSlug=yogevstore
3. **מה-body**: { storeSlug: "yogevstore" }
4. **ברירת מחדל**: החנות הראשונה הפעילה של המשתמש

---

## 💻 חוקי פיתוח

### SaaS Architecture Rules
```javascript
// ✅ תמיד גנרי SaaS
const store = req.currentStore; // זיהוי אוטומטי
const products = await prisma.product.findMany({
  where: { storeId: store.id } // תמיד לפי חנות נוכחית
});

// ❌ לעולם לא ספציפי
const products = await prisma.product.findMany(); // NEVER!
where: { storeId: 1 } // NEVER!
```

### API Routes Pattern
```javascript
// ✅ נכון - נתיבים גנריים
/api/products          // כל המוצרים של החנות הנוכחית
/api/orders           // כל ההזמנות של החנות הנוכחית
/api/customers        // כל הלקוחות של החנות הנוכחית

// ❌ לא נכון - נתיבים ספציפיים
/api/stores/123/products  // NEVER!
/api/yogevstore/orders    // NEVER!
```

---

## 🚀 פריסה לפרודקשן

### Frontend Build & Deploy
```bash
# בנייה לפרודקשן
cd frontend
npm run build

# העלאה ל-S3
aws s3 sync dist/ s3://quickshop-frontend-bucket --delete
```

### Backend Deploy to EC2
```bash
# העלאת קבצי Backend בלבד
scp -r backend/ user@ec2:/var/www/quickshop/

# הגדרת משתני סביבה בשרת
export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@localhost:5432/quickshop_prod"
export JWT_SECRET="your-super-secure-production-secret"

# התקנה והפעלה
cd /var/www/quickshop/backend
npm install --production
npx prisma migrate deploy
npx prisma generate
pm2 start server.js --name quickshop-backend
```

### Production Domains
- **Main**: https://my-quickshop.com
- **API**: https://api.my-quickshop.com (ללא /api prefix)
- **Stores**: https://{store-slug}.my-quickshop.com

---

## 🛠️ פקודות שימושיות

### Backend
```bash
# פיתוח
npm run dev
npm start

# מסד נתונים
npx prisma migrate dev
npx prisma migrate reset
npx prisma studio
npx prisma generate

# סקריפטים
node scripts/create-demo-user.js
```

### Frontend
```bash
# פיתוח
npm run dev

# בנייה
npm run build
npm run preview
```

### מסד נתונים
```bash
# פקודות מהירות
./db-commands.sh reset     # איפוס מסד נתונים
./db-commands.sh migrate   # הרצת מיגרציות
./db-commands.sh studio    # פתיחת Prisma Studio
./db-commands.sh seed      # הוספת נתוני דמו
./db-commands.sh backup    # גיבוי מקומי
./db-commands.sh status    # סטטוס מסד נתונים

# ייצוא סכמה מהשרת (עדכן הגדרות בסקריפט)
./export-production-schema.sh
```

---

## 🔧 פתרון בעיות

### שגיאות אימות
```bash
# בדיקת טוקן ב-localStorage
localStorage.getItem('authToken')

# ניקוי טוקן
localStorage.removeItem('authToken')
```

### שגיאות מסד נתונים
```bash
# בדיקת PostgreSQL
brew services list | grep postgresql
brew services restart postgresql@15

# איפוס Prisma
npx prisma generate
npx prisma db push
```

---

## 📝 היסטוריית שינויים עיקריים

### 🔧 תיקון מערכת האימות (אוגוסט 2024)
- תקינה מלאה ל-authToken בכל המערכת (27+ קבצים)
- יצירת unified-auth.js מאוחד
- מחיקת middleware ישן

### 🏪 המרה ל-SaaS Multi-Tenant (אוגוסט 2024)  
- המרה דינמית לתמיכה במספר חנויות
- ביטול קוד קשיח storeId: 1
- זיהוי חנות אוטומטי מדומיין

### ⚙️ הגדרות סביבה מסודרות (אוגוסט 2024)
- פיתוח: localhost:5173 + localhost:3001
- פרודקשן: my-quickshop.com + api.my-quickshop.com
- תמיכה בסאב-דומיינים: *.localhost:5173 / *.my-quickshop.com

## 🚀 פריסה לפרודקשן

QuickShop כולל מערכת פריסה אוטומטית מלאה לכל הסביבות:

### 📦 סקריפטי פריסה זמינים:

#### `deploy-full.sh` - פריסה מלאה 🎯
```bash
# פריסה מלאה אינטראקטיבית
./deploy-full.sh

# פריסה מלאה ישירה
./deploy-full.sh full

# פריסה חלקית
./deploy-full.sh database   # רק מסד נתונים
./deploy-full.sh backend    # רק בקאנד ל-EC2
./deploy-full.sh frontend   # רק פרונטאנד ל-S3
./deploy-full.sh status     # בדיקת סטטוס
```

#### `deploy-database.sh` - מסד נתונים PostgreSQL RDS 🗄️
- יוצר גיבוי אוטומטי דרך שרת EC2
- מריץ Prisma migrations בשרת
- בודק תקינות מסד הנתונים
- **הערה**: RDS נגיש רק מ-EC2 (נורמלי ובטוח)

#### `deploy-backend.sh` - שרת EC2 ⚙️
- יוצר ארכיון ומעלה לשרת
- מתקין dependencies ומריץ migrations
- מגדיר systemd service
- מפעיל את השירות

#### `deploy-frontend.sh` - S3 + CloudFront 🌐
- בונה את הפרויקט (npm run build)
- מעלה ל-S3 עם cache headers נכונים
- תמיכה ב-CloudFront invalidation
- יוצר גיבוי של הגרסה הקודמת

#### `check-deployment-ready.sh` - בדיקת מוכנות 🔍
בודק שכל הדרישות לפריסה מתקיימות

### 🏗️ ארכיטקטורת פריסה:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (S3 Bucket)   │    │   (EC2 Server)  │    │ (PostgreSQL RDS)│
│                 │    │                 │    │                 │
│ quickshop3      │◄──►│ 3.64.187.151    │◄──►│ RDS Instance    │
│ eu-central-1    │    │ Ubuntu Server   │    │ eu-central-1    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 הגדרות פרודקשן:

#### Backend (EC2):
- **שרת**: 3.64.187.151
- **משתמש**: ubuntu
- **נתיב**: /var/www/quickshop
- **שירות**: quickshop (systemd)
- **פורט**: 3001

#### Frontend (S3):
- **Bucket**: quickshop3
- **Region**: eu-central-1
- **URL**: http://quickshop3.s3-website-eu-central-1.amazonaws.com
- **Domain**: my-quickshop.com

#### Database (RDS):
- **Host**: database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com
- **Database**: postgres
- **Port**: 5432
- **אבטחה**: נגיש רק מ-EC2 instances

### 📋 דרישות לפריסה:

```bash
# כלים נדרשים
node --version  # v18+
aws --version   # v2.0+
psql --version  # v12+

# הגדרת AWS
aws configure
```

### 🎯 פריסה מהירה:

1. **בדיקת מוכנות**:
   ```bash
   ./check-deployment-ready.sh
   ```

2. **פריסה מלאה**:
   ```bash
   ./deploy-full.sh full
   ```

3. **בדיקת תוצאות**:
   ```bash
   ./deploy-full.sh status
   ```

### 📚 מדריכים מפורטים:
- `DEPLOYMENT_README.md` - מדריך פריסה מלא
- `READY_TO_DEPLOY.md` - סטטוס מוכנות נוכחי

### 🔍 מעקב ובקרה:

```bash
# לוגי פריסה
ls -la deployment_*.log

# סטטוס שירותים
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151 'sudo systemctl status quickshop'

# לוגי אפליקציה
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151 'sudo journalctl -u quickshop -f'
```

---

**📅 עודכן לאחרונה**: ספטמבר 2024  
**🔄 גרסה**: 2.1 - Production Deployment Ready  
**👨‍💻 מפתח**: QuickShop Team

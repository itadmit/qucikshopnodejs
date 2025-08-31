# 🏠 מדריך הגדרה לפיתוח לוקאלי

## דרישות מקדימות

- Node.js (גרסה 18 ומעלה)
- npm או yarn
- Git
- PostgreSQL (או Docker)

## 🚀 הגדרה מהירה

### 1. Clone הפרויקט

```bash
git clone https://github.com/itadmit/qucikshopnodejs.git
cd qucikshopnodejs
```

### 2. התקנת Dependencies

```bash
# התקנת dependencies ראשיים
npm install

# התקנת dependencies לfrontend
cd frontend
npm install

# התקנת dependencies לbackend
cd ../backend
npm install
```

### 3. הגדרת בסיס הנתונים

#### אופציה א': PostgreSQL מקומי
```bash
# התקנת PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# יצירת משתמש ובסיס נתונים
sudo -u postgres psql
CREATE DATABASE quickshop_dev;
CREATE USER quickshop_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quickshop_dev TO quickshop_user;
\q
```

#### אופציה ב': Docker
```bash
# הרצת PostgreSQL בDocker
docker run --name quickshop-postgres \
  -e POSTGRES_DB=quickshop_dev \
  -e POSTGRES_USER=quickshop_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### 4. הגדרת משתני סביבה

```bash
cd backend
cp .env.backup .env
```

ערוך את קובץ `.env`:

```env
# Database
DATABASE_URL="postgresql://quickshop_user:your_password@localhost:5432/quickshop_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# AWS S3 (אופציונלי לפיתוח)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-central-1"
AWS_S3_BUCKET="your-bucket-name"

# SendGrid (אופציונלי לפיתוח)
SENDGRID_API_KEY="your-sendgrid-api-key"

# Environment
NODE_ENV="development"
PORT=3001
```

### 5. הגדרת בסיס הנתונים

```bash
cd backend

# הרצת migrations
npx prisma migrate dev

# זריעת נתונים ראשוניים (אופציונלי)
npx prisma db seed
```

### 6. הרצת הפרויקט

#### אופציה א': הרצה מהתיקייה הראשית
```bash
# מהתיקייה הראשית
npm run dev
```

זה יריץ גם את הfrontend וגם את הbackend במקביל.

#### אופציה ב': הרצה נפרדת
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🌐 כתובות מקומיות

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Store Preview**: http://localhost:5173/products/[product-slug]?preview=store&store=[store-slug]

## 🔧 הגדרות פיתוח

### Frontend Configuration

הקובץ `frontend/src/config/api.js` מזהה אוטומטי אם אתה בפיתוח:

```javascript
const isDevelopment = window.location.port === '5173';
const baseUrl = isDevelopment 
  ? 'http://localhost:3001/api'
  : 'https://api.my-quickshop.com/api';
```

### Backend Configuration

השרת יריץ על פורט 3001 בברירת מחדל. אם הפורט תפוס, שנה ב-`.env`:

```env
PORT=3002
```

## 📁 מבנה הפרויקט

```
qucikshopnodejs/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── backend/           # Node.js + Express + Prisma
│   ├── routes/
│   ├── services/
│   ├── prisma/
│   └── package.json
└── package.json       # Root package.json
```

## 🐛 פתרון בעיות נפוצות

### בעיית פורט תפוס
```bash
# הרג תהליכים על פורט 3001
sudo lsof -ti:3001 | xargs sudo kill -9

# או שנה פורט ב-.env
PORT=3002
```

### בעיות בסיס נתונים
```bash
# איפוס בסיס הנתונים
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### בעיות CORS
אם יש בעיות CORS, וודא שה-frontend רץ על פורט 5173 וה-backend על 3001.

## 🚀 פרסום לפרודקשן

כשאתה מוכן לפרסם:

```bash
# בילד הfrontend
cd frontend
npm run build

# העלאה לשרת (אם יש לך deploy script)
python ../deploy-frontend.py
```

## 📝 טיפים לפיתוח

1. **Hot Reload**: גם הfrontend וגם הbackend יתעדכנו אוטומטית בשינויים
2. **Database Browser**: השתמש ב-`npx prisma studio` לצפייה בנתונים
3. **API Testing**: השתמש ב-Postman או Thunder Client לבדיקת API
4. **Logs**: הbackend מציג logs מפורטים בקונסול

## 🔐 אבטחה בפיתוח

- השתמש ב-JWT secrets חזקים גם בפיתוח
- אל תשתף קבצי `.env` בגיט
- השתמש ב-HTTPS גם בפיתוח אם אפשר

## 📞 תמיכה

אם יש בעיות:
1. בדוק את הlogs בקונסול
2. וודא שכל הservices רצים
3. בדוק את הconnection לבסיס הנתונים

---

**Happy Coding! 🎉**

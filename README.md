# QuickShop החדש - פלטפורמת SaaS לחנויות אונליין

פרויקט QuickShop החדש הוא פלטפורמת SaaS מתקדמת ליצירת חנויות אונליין עם כל מה שצריך - ניהול מוצרים, עגלת קניות, קופונים, סליקה ועוד.

## מבנה הפרויקט

```
quickshop new/
├── frontend/              # React + Vite + Tailwind CSS (דף נחיתה)
├── backend/               # Node.js + Express + MySQL (API)
├── admin-dashboard/       # דשבורד אדמין (עתידי)
├── store-templates/       # תבניות חנויות (עתידי)
│   └── jupiter/          # תבנית Jupiter
├── shared/               # קומפוננטים משותפים (עתידי)
└── README.md
```

## דרישות מערכת

- Node.js 22.11+ (או 20.19+)
- PostgreSQL 14+
- npm או yarn

## התקנה והפעלה

### התקנה מהירה

```bash
# התקנת כל התלויות (כולל תבנית Jupiter)
npm run install:all

# הפעלת שני השרתים יחד (SaaS)
npm run dev

# הפעלת כל השרתים (כולל תבנית Jupiter)
npm run dev:all

# הפעלת תבנית Jupiter בלבד
npm run dev:jupiter
```

### הפעלה נפרדת

#### 1. הפעלת הבקאנד

```bash
cd backend
npm install
npm run dev
```

השרת יפעל על פורט 3001: http://localhost:3001

#### 2. הפעלת הפרונטאנד

```bash
cd frontend
npm install
npm run dev
```

האפליקציה תפעל על פורט זמין (בדרך כלל 5173+): http://localhost:5173

#### 3. הפעלת תבנית Jupiter

```bash
cd store-templates/jupiter
npm install
npm run dev
```

תבנית Jupiter תפעל על פורט 5174: http://localhost:5174

### 3. הגדרת בסיס נתונים

יש ליצור בסיס נתונים PostgreSQL:

```sql
CREATE DATABASE quickshop;
```

ולעדכן את ה-DATABASE_URL בקובץ `.env`:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/quickshop?schema=public"
```

ולהריץ את Prisma:

```bash
cd backend
npx prisma generate
npx prisma db push
```

## תכונות מתוכננות

### ✅ הושלם
- [x] מבנה פרויקט SaaS
- [x] דף נחיתה מעוצב
- [x] סכמת בסיס נתונים מלאה
- [x] מערכת אימות בסיסית
- [x] תבנית Jupiter בסיסית
- [x] דף בית עם קטגוריות ומוצרים
- [x] דפי מוצר וקטגוריה
- [x] מערכת עגלת קניות בסיסית
- [x] דף תשלום
- [x] תיקון תאימות גרסאות

### 🔄 בפיתוח
- [ ] חיבור תבנית Jupiter ל-API
- [ ] מערכת ניהול מוצרים מתקדמת
- [ ] מערכת קופונים והנחות
- [ ] חיבור לסליקה
- [ ] מערכת העלאת מדיה ל-S3
- [ ] מערכת בילדר לדפים
- [ ] וריאציות מוצרים (צבע, מידה)
- [ ] מערכת ביקורות ודירוגים

## טכנולוgiות

### Frontend
- React 18
- Vite 5.4.0
- Tailwind CSS 3.4.0
- Remix Icons
- Axios
- React Router (עתידי)

### Backend
- Node.js 22.11+
- Express 4.19.0
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Helmet

### כלים נוספים
- Concurrently (הפעלה משותפת)
- Nodemon (פיתוח)
- PostCSS & Autoprefixer

## הגדרת בסיס נתונים

יש ליצור בסיס נתונים MySQL בשם `quickshop` ולעדכן את פרטי החיבור בקובץ `backend/config.js`.

## פיתוח

הפרויקט תומך ב-RTL (עברית) ומשתמש בפונט Noto Sans Hebrew.

## רישיון

MIT License

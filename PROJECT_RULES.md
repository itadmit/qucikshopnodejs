# 📋 חוקי פרויקט QuickShop - מדריך מהיר

## 🏗️ ארכיטקטורה SaaS

### ✅ תמיד עשה:
- **גנרי SaaS**: כל קוד תומך במספר חנויות ומשתמשים
- **זיהוי חנות אוטומטי**: `req.currentStore` במקום hardcode
- **סינון לפי חנות**: `where: { storeId: store.id }`
- **משתמש unified-auth**: `requireAuth`, `requireStoreAccess`, `requireDashboardAccess`

### ❌ לעולם אל תעשה:
- **Hardcode store ID**: `storeId: 1` או `storeId: "yogevstore"`
- **שאילתות גלובליות**: `findMany()` ללא `where`
- **נתיבים ספציפיים**: `/api/stores/123/products`
- **middleware ישן**: `import from '../middleware/auth.js'`

## 🚀 פריסה

### פקודה אחת לכל הפריסה:
```bash
./deploy-all.sh "הודעת העדכון"
```

### סקריפטים זמינים:
- `deploy-all.sh` - פריסה מלאה (Git + S3 + EC2 + DB)
- `start-dev.sh` - הפעלת פיתוח
- `stop-dev.sh` - עצירת פיתוח  
- `db-commands.sh` - ניהול מסד נתונים

## 🔐 אימות

### שימוש נכון:
```javascript
import { requireStoreAccess } from '../middleware/unified-auth.js';

router.get('/products', requireStoreAccess, async (req, res) => {
  const store = req.currentStore; // זיהוי אוטומטי
  const products = await prisma.product.findMany({
    where: { storeId: store.id } // תמיד לפי חנות
  });
});
```

## 🌐 URLs

### פיתוח:
- Main: `localhost:5173`
- Store: `{store-slug}.localhost:5173`
- API: `localhost:3001/api`

### פרודקשן:
- Main: `my-quickshop.com`
- Store: `{store-slug}.my-quickshop.com`
- API: `3.64.187.151:3001/api`

## 📁 קבצים חשובים

### Backend:
- `middleware/unified-auth.js` - מערכת אימות מאוחדת
- `server.js` - שרת ראשי
- `prisma/schema.prisma` - סכמת DB

### Frontend:
- `src/config/environment.js` - הגדרות סביבה
- `src/services/api.js` - שירותי API
- `.env.development` - משתני פיתוח

### Root:
- `deploy.env` - משתני פריסה (לא ב-Git!)
- `deploy.env.example` - תבנית משתני פריסה

## 🎯 כללי קוד

1. **עברית**: הודעות שגיאה למשתמש בעברית
2. **אנגלית**: לוגים ודבאג באנגלית
3. **RTL**: תמיכה מלאה בעברית עם Tailwind
4. **Generic**: אף פעם לא ספציפי לחנות או משתמש

---

**זכור**: QuickShop הוא SaaS - תמיד חשוב גנרי! 🚀

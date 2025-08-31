# 🛒 QuickShop - פלטפורמת E-Commerce

## 📋 סקירה כללית
QuickShop היא פלטפורמת e-commerce מתקדמת המאפשרת יצירה וניהול של חנויות מקוונות עם תמיכה בתבניות מותאמות אישית, ניהול מוצרים, הזמנות ואנליטיקס.

## 🚀 התחלה מהירה

### דרישות מערכת
- Node.js 18+
- PostgreSQL 14+
- AWS CLI (לפריסה)
- Nginx (לפרודקשן)

### התקנה מקומית
```bash
# Clone הפרויקט
git clone <repository-url>
cd qucikshopnodejs

# התקנת dependencies
cd backend && npm install
cd ../frontend && npm install
```

### הגדרת Database
```bash
cd backend
cp .env.example .env
# ערוך את .env עם פרטי ההתחברות שלך
npx prisma migrate deploy
npx prisma generate
```

## 📖 מדריכים

### 🔧 פיתוח ופריסה
**לכל המידע על פיתוח, פריסה ותחזוקה - ראה:**
👉 **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**

### 🎨 תכונות המערכת
**לרשימה מלאה של תכונות וקומפוננטים - ראה:**
👉 **[FEATURES.md](./FEATURES.md)**

### 📊 אינטגרציית Pixels
**למידע על אינטגרציית Facebook Pixel ו-Google Analytics - ראה:**
👉 **[PIXELS_INTEGRATION.md](./PIXELS_INTEGRATION.md)**

### ⚙️ הגדרות Sections
**למפרט מלא של הגדרות sections ותבניות - ראה:**
👉 **[SECTION_SETTINGS_SPECIFICATION.md](./SECTION_SETTINGS_SPECIFICATION.md)**

## 🏗️ ארכיטקטורה

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **File Upload**: Multer + AWS S3
- **Email**: SendGrid

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **HTTP Client**: Fetch API

### Infrastructure
- **Hosting**: AWS S3 (Frontend) + EC2 (Backend)
- **CDN**: CloudFront
- **SSL**: Let's Encrypt
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2

## 🌐 סביבות

### פיתוח
- **Frontend**: http://3.64.187.151:5173/
- **Backend**: http://3.64.187.151:3001/
- **API**: https://api.my-quickshop.com/

### פרודקשן
- **אתר ראשי**: https://my-quickshop.com/
- **חנויות**: https://[store-slug].my-quickshop.com/
- **API**: https://api.my-quickshop.com/

## 🤝 תרומה לפרויקט

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit השינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## 📄 רישיון
הפרויקט הזה מוגן תחת רישיון MIT - ראה קובץ [LICENSE](LICENSE) לפרטים.

## 📞 תמיכה
לשאלות ותמיכה, אנא פנה למדריך הפיתוח או פתח issue ב-GitHub.

---

**📅 עודכן לאחרונה**: נובמבר 2024

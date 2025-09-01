#!/bin/bash

# סקריפט לייצוא סכמת מסד נתונים מהשרת לפיתוח מקומי
# Export Production Database Schema for Local Development

echo "🔄 Exporting production database schema..."

# הגדרות שרת (עדכן לפי הצורך)
PRODUCTION_HOST="your-production-host"
PRODUCTION_DB="quickshop_prod"
PRODUCTION_USER="quickshop_user"

# הגדרות מקומיות
LOCAL_DB="quickshop_dev"
LOCAL_USER="tadmitinteractive"

# יצירת תיקיית גיבויים
mkdir -p backups

# ייצוא הסכמה בלבד (ללא נתונים)
echo "📤 Exporting schema from production..."
pg_dump -h $PRODUCTION_HOST -U $PRODUCTION_USER -d $PRODUCTION_DB \
    --schema-only \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    -f backups/production-schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema exported successfully to backups/production-schema.sql"
    
    # אופציה לייבא לפיתוח מקומי
    read -p "🤔 Do you want to import this schema to local development database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Importing schema to local database..."
        
        # גיבוי הסכמה המקומית הנוכחית
        echo "💾 Backing up current local schema..."
        pg_dump -U $LOCAL_USER -d $LOCAL_DB \
            --schema-only \
            --no-owner \
            --no-privileges \
            -f backups/local-schema-backup-$(date +%Y%m%d_%H%M%S).sql
        
        # ייבוא הסכמה החדשה
        psql -U $LOCAL_USER -d $LOCAL_DB -f backups/production-schema.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Schema imported successfully to local database"
            echo "🔄 Updating Prisma schema..."
            
            # עדכון Prisma schema מהמסד המקומי
            cd backend
            npx prisma db pull
            npx prisma generate
            
            echo "✅ Prisma schema updated!"
        else
            echo "❌ Failed to import schema"
        fi
    fi
else
    echo "❌ Failed to export schema from production"
fi

echo "📋 Available backups:"
ls -la backups/

echo ""
echo "💡 Tips:"
echo "   - Review the schema file before importing"
echo "   - Test your application after schema updates"
echo "   - Create migrations for any new changes"
echo ""

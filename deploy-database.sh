#!/bin/bash

# QuickShop Database Migration Script for PostgreSQL RDS
# מריץ migrations על מסד הנתונים PostgreSQL דרך שרת EC2
# (RDS לא נגיש ישירות מהמחשב המקומי - זה נורמלי ובטוח)

set -e  # Exit on any error

# צבעים לפלט
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# הגדרות מסד נתונים
DATABASE_URL="postgresql://quickshop3:hsWvFFav%7Ec3QYX1a%238DEe%2Awfo%29tB@database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com:5432/postgres"
DB_HOST="database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="quickshop3"
DB_PASSWORD="hsWvFFav~c3QYX1a#8DEe*wfo)tB"  # סיסמה מפוענחת

# הגדרות גיבוי
BACKUP_DIR="./database-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/quickshop_backup_$TIMESTAMP.sql"

echo -e "${BLUE}🗄️ מתחיל עדכון מסד נתונים QuickShop PostgreSQL${NC}"
echo "=================================="

# בדיקת תנאים מוקדמים
echo -e "${YELLOW}🔍 בודק תנאים מוקדמים...${NC}"

# בדיקת PostgreSQL client
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ שגיאה: PostgreSQL client (psql) לא מותקן${NC}"
    echo -e "${YELLOW}💡 התקן עם:${NC}"
    echo "  • Mac: brew install postgresql"
    echo "  • Ubuntu: sudo apt-get install postgresql-client"
    echo "  • CentOS: sudo yum install postgresql"
    exit 1
fi

# בדיקת pg_dump
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ שגיאה: pg_dump לא מותקן${NC}"
    exit 1
fi

# בדיקת תיקיית backend
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ שגיאה: תיקיית backend לא נמצאה${NC}"
    exit 1
fi

# בדיקת Prisma
if [ ! -f "backend/prisma/schema.prisma" ]; then
    echo -e "${RED}❌ שגיאה: קובץ Prisma schema לא נמצא${NC}"
    exit 1
fi

echo -e "${GREEN}✅ תנאים מוקדמים בסדר${NC}"

# הגדרות שרת EC2 (לגישה למסד הנתונים)
EC2_HOST="3.64.187.151"
EC2_USER="ubuntu"
EC2_KEY_PATH="/Users/tadmitinteractive/Downloads/quickshop3key.pem"

echo -e "${YELLOW}🔗 בודק חיבור לשרת EC2...${NC}"
if ! ssh -i "$EC2_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'EC2 connection OK'" &> /dev/null; then
    echo -e "${RED}❌ שגיאה: לא ניתן להתחבר לשרת EC2${NC}"
    echo -e "${YELLOW}💡 בדוק את פרטי החיבור לשרת${NC}"
    exit 1
fi

echo -e "${GREEN}✅ חיבור לשרת EC2 הצליח${NC}"

echo -e "${YELLOW}🔗 בודק חיבור למסד נתונים דרך השרת...${NC}"
if ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c 'SELECT version();' >/dev/null 2>&1
"; then
    echo -e "${GREEN}✅ מסד הנתונים נגיש דרך השרת${NC}"
else
    echo -e "${YELLOW}⚠️ מסד הנתונים לא נגיש עדיין (יתוקן בפריסת הבקאנד)${NC}"
fi

# יצירת תיקיית גיבויים
echo -e "${YELLOW}📁 יוצר תיקיית גיבויים...${NC}"
mkdir -p "$BACKUP_DIR"

# יצירת גיבוי דרך השרת EC2
echo -e "${YELLOW}💾 יוצר גיבוי של מסד הנתונים דרך השרת...${NC}"
echo -e "${BLUE}📋 קובץ גיבוי: $BACKUP_FILE${NC}"

# יצירת גיבוי בשרת ועברתו למקומי
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    PGPASSWORD='$DB_PASSWORD' pg_dump \
        -h '$DB_HOST' \
        -p '$DB_PORT' \
        -U '$DB_USER' \
        -d '$DB_NAME' \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        > /tmp/quickshop_backup_$TIMESTAMP.sql
"

# העברת הגיבוי למחשב המקומי
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST:/tmp/quickshop_backup_$TIMESTAMP.sql" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ גיבוי נוצר והועבר בהצלחה${NC}"
    
    # דחיסת הגיבוי
    gzip "$BACKUP_FILE"
    echo -e "${BLUE}📦 גיבוי נדחס: ${BACKUP_FILE}.gz${NC}"
    
    # ניקוי הגיבוי בשרת
    ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "rm -f /tmp/quickshop_backup_$TIMESTAMP.sql"
else
    echo -e "${RED}❌ שגיאה ביצירת גיבוי${NC}"
    exit 1
fi

# מעבר לתיקיית backend
cd backend

# בדיקת שינויים ב-schema
echo -e "${YELLOW}🔍 בודק שינויים ב-schema...${NC}"
if ! npx prisma migrate status &> /dev/null; then
    echo -e "${YELLOW}⚠️ יש migrations שלא הורצו${NC}"
else
    echo -e "${GREEN}✅ כל ה-migrations עדכניים${NC}"
fi

# הרצת Prisma generate
echo -e "${YELLOW}🔧 מריץ Prisma generate...${NC}"
npx prisma generate

# יצירת migration חדש (אם יש שינויים)
echo -e "${YELLOW}📝 בודק אם יש צורך ב-migration חדש...${NC}"
if npx prisma migrate diff \
    --from-schema-datamodel prisma/schema.prisma \
    --to-schema-datasource prisma/schema.prisma \
    --script > /tmp/migration_diff.sql 2>/dev/null; then
    
    if [ -s /tmp/migration_diff.sql ]; then
        echo -e "${YELLOW}📋 נמצאו שינויים בסכמה:${NC}"
        cat /tmp/migration_diff.sql
        
        echo -e "${YELLOW}❓ האם להמשיך עם ה-migration? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}🚀 יוצר migration חדש...${NC}"
            npx prisma migrate dev --name "production_update_$TIMESTAMP"
        else
            echo -e "${YELLOW}⏸️ ביטול migration${NC}"
        fi
    else
        echo -e "${GREEN}✅ אין שינויים בסכמה${NC}"
    fi
    
    rm -f /tmp/migration_diff.sql
fi

# העלאת schema לשרת והרצת migrations
echo -e "${YELLOW}🗄️ מעלה schema לשרת ומריץ migrations...${NC}"

# העלאת תיקיית prisma לשרת
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no -r prisma/ "$EC2_USER@$EC2_HOST:/tmp/prisma_update/"

# הרצת migrations בשרת
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    cd /tmp/prisma_update
    export DATABASE_URL='$DATABASE_URL'
    
    # התקנת prisma אם לא קיים
    if ! command -v npx &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # הרצת migrations
    npx prisma generate
    npx prisma migrate deploy
    
    # ניקוי
    rm -rf /tmp/prisma_update
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations הורצו בהצלחה בשרת${NC}"
else
    echo -e "${RED}❌ שגיאה בהרצת migrations${NC}"
    echo -e "${YELLOW}🔄 האם לשחזר מגיבוי? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🔄 משחזר מגיבוי דרך השרת...${NC}"
        
        # העלאת הגיבוי לשרת ושחזור
        scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "${BACKUP_FILE}.gz" "$EC2_USER@$EC2_HOST:/tmp/"
        ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
            cd /tmp
            gunzip quickshop_backup_$TIMESTAMP.sql.gz
            PGPASSWORD='$DB_PASSWORD' psql \
                -h '$DB_HOST' \
                -p '$DB_PORT' \
                -U '$DB_USER' \
                -d '$DB_NAME' \
                < quickshop_backup_$TIMESTAMP.sql
            rm -f quickshop_backup_$TIMESTAMP.sql
        "
        echo -e "${GREEN}✅ שחזור מגיבוי הושלם${NC}"
    fi
    exit 1
fi

# בדיקת תקינות מסד הנתונים דרך השרת
echo -e "${YELLOW}🏥 בודק תקינות מסד הנתונים דרך השרת...${NC}"

# בדיקת טבלאות עיקריות
TABLES=("User" "Store" "Product" "Order" "Customer")
for table in "${TABLES[@]}"; do
    COUNT=$(ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
        PGPASSWORD='$DB_PASSWORD' psql \
            -h '$DB_HOST' \
            -p '$DB_PORT' \
            -U '$DB_USER' \
            -d '$DB_NAME' \
            -t -c 'SELECT COUNT(*) FROM \"$table\";' 2>/dev/null | xargs
    ")
    
    if [ $? -eq 0 ] && [ ! -z "$COUNT" ]; then
        echo -e "${GREEN}✅ טבלה $table: $COUNT רשומות${NC}"
    else
        echo -e "${YELLOW}⚠️ טבלה $table: לא נמצאה או ריקה${NC}"
    fi
done

# בדיקת indexes
echo -e "${YELLOW}🔍 בודק indexes...${NC}"
INDEX_COUNT=$(ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    PGPASSWORD='$DB_PASSWORD' psql \
        -h '$DB_HOST' \
        -p '$DB_PORT' \
        -U '$DB_USER' \
        -d '$DB_NAME' \
        -t -c \"SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';\" | xargs
")

echo -e "${GREEN}✅ נמצאו $INDEX_COUNT indexes${NC}"

# בדיקת foreign keys
echo -e "${YELLOW}🔗 בודק foreign keys...${NC}"
FK_COUNT=$(ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
    PGPASSWORD='$DB_PASSWORD' psql \
        -h '$DB_HOST' \
        -p '$DB_PORT' \
        -U '$DB_USER' \
        -d '$DB_NAME' \
        -t -c \"SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';\" | xargs
")

echo -e "${GREEN}✅ נמצאו $FK_COUNT foreign keys${NC}"

# ניקוי גיבויים ישנים (שמור רק 5 אחרונים)
echo -e "${YELLOW}🧹 מנקה גיבויים ישנים...${NC}"
cd ..
OLD_BACKUPS=$(ls -t "$BACKUP_DIR"/quickshop_backup_*.sql.gz 2>/dev/null | tail -n +6 || true)
for backup in $OLD_BACKUPS; do
    if [ -f "$backup" ]; then
        rm "$backup"
        echo -e "${BLUE}🗑️ נמחק גיבוי ישן: $(basename "$backup")${NC}"
    fi
done

# יצירת סקריפט שחזור מהיר
echo -e "${YELLOW}📝 יוצר סקריפט שחזור מהיר...${NC}"
cat > restore-database.sh << RESTORE_EOF
#!/bin/bash
# סקריפט שחזור מהיר למסד הנתונים

BACKUP_FILE="\$1"
if [ -z "\$BACKUP_FILE" ]; then
    echo "שימוש: \$0 <backup-file.sql.gz>"
    echo "גיבויים זמינים:"
    ls -la $BACKUP_DIR/
    exit 1
fi

echo "🔄 משחזר מסד נתונים מ-\$BACKUP_FILE..."
PGPASSWORD="$DB_PASSWORD" psql \\
    -h "$DB_HOST" \\
    -p "$DB_PORT" \\
    -U "$DB_USER" \\
    -d "$DB_NAME" \\
    < <(gunzip -c "\$BACKUP_FILE")

echo "✅ שחזור הושלם"
RESTORE_EOF

chmod +x restore-database.sh

echo ""
echo -e "${GREEN}🎉 עדכון מסד הנתונים הושלם בהצלחה!${NC}"
echo "=================================="
echo -e "${BLUE}📋 פרטי העדכון:${NC}"
echo -e "${YELLOW}• מסד נתונים:${NC} $DB_HOST:$DB_PORT/$DB_NAME"
echo -e "${YELLOW}• גיבוי נוצר:${NC} ${BACKUP_FILE}.gz"
echo -e "${YELLOW}• גיבויים זמינים:${NC} $(ls "$BACKUP_DIR"/ | wc -l) קבצים"
echo ""
echo -e "${BLUE}🔧 פקודות שימושיות:${NC}"
echo -e "${YELLOW}• צפייה בגיבויים:${NC} ls -la $BACKUP_DIR/"
echo -e "${YELLOW}• שחזור מגיבוי:${NC} ./restore-database.sh $BACKUP_DIR/quickshop_backup_YYYYMMDD_HHMMSS.sql.gz"
echo -e "${YELLOW}• בדיקת סטטוס:${NC} cd backend && npx prisma migrate status"
echo -e "${YELLOW}• חיבור למסד:${NC} PGPASSWORD='$DB_PASSWORD' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo ""

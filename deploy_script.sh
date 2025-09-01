#!/bin/bash
set -e

REMOTE_PATH="/var/www/quickshop"
SERVICE_NAME="quickshop"
ARCHIVE_NAME="$1"

echo "🔄 עוצר שירות (אם קיים)..."
sudo systemctl stop $SERVICE_NAME 2>/dev/null || echo "שירות לא פועל"

echo "📁 יוצר גיבוי של הגרסה הנוכחית..."
if [ -d "$REMOTE_PATH" ]; then
    sudo mv "$REMOTE_PATH" "${REMOTE_PATH}_backup_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
fi

echo "📂 יוצר תיקיית יעד..."
sudo mkdir -p "$REMOTE_PATH"
sudo chown $USER:$USER "$REMOTE_PATH"

echo "📦 מחלץ ארכיון..."
cd "$REMOTE_PATH"
tar -xzf "/tmp/$ARCHIVE_NAME"

echo "📦 מתקין dependencies..."
npm ci --only=production

echo "🗄️ מריץ migrations..."
npx prisma generate
npx prisma migrate deploy

echo "🔧 מגדיר הרשאות..."
sudo chown -R $USER:$USER "$REMOTE_PATH"
chmod +x "$REMOTE_PATH/server.js" 2>/dev/null || true

echo "✅ פריסה הושלמה!"

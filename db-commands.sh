#!/bin/bash

# פקודות מסד נתונים נפוצות לפיתוח
# Common Database Commands for Development

case "$1" in
    "reset")
        echo "🔄 Resetting development database..."
        cd backend
        npx prisma migrate reset --force
        echo "✅ Database reset complete"
        ;;
    
    "migrate")
        echo "🔄 Running database migrations..."
        cd backend
        npx prisma migrate dev
        echo "✅ Migrations complete"
        ;;
    
    "generate")
        echo "🔄 Generating Prisma client..."
        cd backend
        npx prisma generate
        echo "✅ Prisma client generated"
        ;;
    
    "studio")
        echo "🎨 Opening Prisma Studio..."
        cd backend
        npx prisma studio
        ;;
    
    "seed")
        echo "🌱 Seeding database with demo data..."
        cd backend
        node scripts/create-demo-user.js
        echo "✅ Demo data created"
        ;;
    
    "backup")
        echo "💾 Creating local database backup..."
        mkdir -p backups
        pg_dump -U tadmitinteractive -d quickshop_dev \
            -f backups/local-backup-$(date +%Y%m%d_%H%M%S).sql
        echo "✅ Backup created in backups/ folder"
        ;;
    
    "status")
        echo "📊 Database Status:"
        echo "   PostgreSQL: $(brew services list | grep postgresql@15 | awk '{print $2}')"
        echo "   Database: quickshop_dev"
        psql -U tadmitinteractive -d quickshop_dev -c "\dt" 2>/dev/null | head -5
        ;;
    
    *)
        echo "🗄️  QuickShop Database Commands"
        echo ""
        echo "Usage: ./db-commands.sh [command]"
        echo ""
        echo "Commands:"
        echo "  reset     - Reset database and run all migrations"
        echo "  migrate   - Run pending migrations"
        echo "  generate  - Generate Prisma client"
        echo "  studio    - Open Prisma Studio"
        echo "  seed      - Add demo data"
        echo "  backup    - Create local backup"
        echo "  status    - Show database status"
        echo ""
        echo "Examples:"
        echo "  ./db-commands.sh reset"
        echo "  ./db-commands.sh studio"
        ;;
esac

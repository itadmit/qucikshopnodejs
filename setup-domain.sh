#!/bin/bash

# הגדרת הדומיין my-quickshop.com עם SSL
# יש להריץ את הסקריפט הזה אחרי שהדומיין מצביע לשרת

echo "🌐 מתחיל הגדרת הדומיין my-quickshop.com..."

# בדיקה שהדומיין מצביע לשרת
echo "בודק שהדומיין מצביע לשרת..."
DOMAIN_IP=$(dig +short my-quickshop.com)
SERVER_IP="3.64.187.151"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "❌ שגיאה: הדומיין my-quickshop.com לא מצביע לשרת $SERVER_IP"
    echo "הדומיין מצביע ל: $DOMAIN_IP"
    echo "אנא הגדר את הדומיין להצביע לשרת לפני המשך"
    exit 1
fi

echo "✅ הדומיין מצביע נכון לשרת!"

# התחברות לשרת והגדרת SSL
ssh -i ~/.ssh/quickshop3key.pem ubuntu@3.64.187.151 << 'EOFSERVER'
echo "🔧 מגדיר SSL עבור my-quickshop.com..."

# עדכון Nginx config עבור הדומיין
sudo tee /etc/nginx/sites-available/my-quickshop.com > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name my-quickshop.com www.my-quickshop.com;
    
    # Redirect HTTP to HTTPS (will be added after SSL setup)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONFIG

# הפעלת האתר
sudo ln -sf /etc/nginx/sites-available/my-quickshop.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx הוגדר עבור הדומיין"

# התקנת SSL עם Let's Encrypt
echo "🔒 מתקין SSL certificate..."
sudo certbot --nginx -d my-quickshop.com -d www.my-quickshop.com --non-interactive --agree-tos --email admin@my-quickshop.com

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate הותקן בהצלחה!"
    
    # עדכון הגדרות CORS בשרת
    echo "🔧 מעדכן הגדרות CORS..."
    cd /home/ubuntu/quickshop-backend/backend
    sed -i 's/CORS_ORIGINS=.*/CORS_ORIGINS=https:\/\/my-quickshop.com,https:\/\/www.my-quickshop.com,http:\/\/quickshop3.s3-website.eu-central-1.amazonaws.com/' .env
    
    # הפעלה מחדש של השרת
    pm2 restart quickshop-backend
    
    echo "✅ השרת הופעל מחדש עם הגדרות CORS חדשות"
    
else
    echo "❌ שגיאה בהתקנת SSL certificate"
    exit 1
fi

echo "🎉 הדומיין my-quickshop.com הוגדר בהצלחה עם SSL!"
echo "האתר זמין בכתובת: https://my-quickshop.com"

EOFSERVER

echo "✅ הגדרת הדומיין הושלמה!"
echo ""
echo "📋 מה שנותר לעשות:"
echo "1. לעדכן את הפרונטאנד להשתמש בדומיין החדש"
echo "2. לבדוק שהאתר עובד ב: https://my-quickshop.com"

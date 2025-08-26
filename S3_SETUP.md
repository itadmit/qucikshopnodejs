# הגדרת S3 להעלאת מדיה

## שלב 1: יצירת Bucket ב-AWS S3

1. היכנס ל-AWS Console
2. עבור לשירות S3
3. לחץ על "Create bucket"
4. תן שם ל-bucket (למשל: `quickshop-media`)
5. בחר region (למשל: `us-east-1`)
6. השאר את ההגדרות ברירת המחדל
7. לחץ על "Create bucket"

## שלב 2: הגדרת CORS

1. בחר את ה-bucket שיצרת
2. עבור לטאב "Permissions"
3. גלול למטה לחלק "Cross-origin resource sharing (CORS)"
4. לחץ על "Edit"
5. החלף את התוכן עם:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```

6. לחץ על "Save changes"

## שלב 3: יצירת IAM User

1. עבור לשירות IAM
2. לחץ על "Users" בתפריט הצד
3. לחץ על "Create user"
4. תן שם למשתמש (למשל: `quickshop-s3-user`)
5. סמן "Programmatic access"
6. לחץ על "Next: Permissions"
7. לחץ על "Attach existing policies directly"
8. חפש וסמן "AmazonS3FullAccess" (או צור policy מותאם אישית)
9. לחץ על "Next: Tags" (אופציונלי)
10. לחץ על "Next: Review"
11. לחץ על "Create user"
12. **שמור את Access Key ID ו-Secret Access Key!**

## שלב 4: הגדרת Environment Variables

עדכן את קובץ `.env` בתיקיית `backend`:

```env
# S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## שלב 5: Policy מותאם אישית (אופציונלי)

אם אתה רוצה policy יותר מוגבל, צור policy חדש:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## שלב 6: בדיקה

1. הפעל את השרתים: `npm run dev`
2. היכנס לאפליקציה
3. עבור ליצירת מוצר
4. נסה להעלות תמונה
5. בדוק שהיא מופיעה ב-S3 bucket

## פתרון בעיות

### שגיאה: "Access Denied"
- בדוק שה-Access Key ו-Secret Key נכונים
- בדוק שה-IAM User יש לו הרשאות ל-S3
- בדוק שה-bucket name נכון

### שגיאה: "CORS Error"
- בדוק שה-CORS מוגדר נכון
- בדוק שה-AllowedOrigins כולל את הדומיין שלך

### שגיאה: "Bucket Not Found"
- בדוק שה-bucket name נכון
- בדוק שה-region נכון

## הגדרות נוספות

### הגדרת CloudFront (אופציונלי)
לשיפור ביצועים, תוכל להגדיר CloudFront:

1. צור CloudFront Distribution
2. בחר את ה-S3 bucket כ-Origin
3. עדכן את ה-URL בקוד

### הגדרת Lifecycle Rules
לחיסכון בעלויות, הגדר Lifecycle Rules:

1. עבור ל-S3 bucket
2. בחר "Management" tab
3. לחץ על "Create lifecycle rule"
4. הגדר כללים למחיקת קבצים ישנים

## אבטחה

- אל תשתף את ה-Access Keys
- השתמש ב-IAM Roles במקום Access Keys בסביבת production
- הגדר Bucket Policy להגבלת גישה
- השתמש ב-VPC Endpoints בסביבת production 
#!/usr/bin/env python3
"""
סקריפט פריסה אוטומטי לפרונטאנד QuickShop ל-S3
מבצע build ומעלה את הקבצים ל-S3 bucket
"""

import os
import sys
import subprocess
import json
from pathlib import Path

# הגדרות
FRONTEND_DIR = "frontend"
DIST_DIR = f"{FRONTEND_DIR}/dist"
S3_BUCKET = "quickshop-frontend-bucket"  # שנה לשם הבאקט שלך
AWS_REGION = "us-east-1"

def run_command(command, cwd=None):
    """הרצת פקודה עם טיפול בשגיאות"""
    print(f"🔧 מריץ: {command}")
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True,
            cwd=cwd
        )
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ שגיאה: {e}")
        if e.stderr:
            print(f"שגיאה: {e.stderr}")
        return False

def check_aws_cli():
    """בדיקה שAWS CLI מותקן ומוגדר"""
    print("🔍 בודק AWS CLI...")
    
    # בדיקה שAWS CLI מותקן
    if not run_command("aws --version"):
        print("❌ AWS CLI לא מותקן. מתקין...")
        if not install_aws_cli():
            return False
    
    # בדיקה שAWS מוגדר
    if not run_command("aws sts get-caller-identity"):
        print("❌ AWS לא מוגדר. הגדר עם: aws configure")
        return False
    
    print("✅ AWS CLI מוכן")
    return True

def install_aws_cli():
    """התקנת AWS CLI"""
    print("📦 מתקין AWS CLI...")
    
    commands = [
        "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
        "unzip -q awscliv2.zip",
        "sudo ./aws/install",
        "rm -rf awscliv2.zip aws/"
    ]
    
    for cmd in commands:
        if not run_command(cmd):
            return False
    
    return True

def build_frontend():
    """בניית הפרונטאנד"""
    print("🏗️ בונה פרונטאנד...")
    
    if not os.path.exists(FRONTEND_DIR):
        print(f"❌ תיקיית {FRONTEND_DIR} לא נמצאה")
        return False
    
    # התקנת dependencies אם צריך
    if not os.path.exists(f"{FRONTEND_DIR}/node_modules"):
        print("📦 מתקין dependencies...")
        if not run_command("npm install", cwd=FRONTEND_DIR):
            return False
    
    # בניית הפרויקט
    if not run_command("npm run build", cwd=FRONTEND_DIR):
        return False
    
    # בדיקה שהבנייה הצליחה
    if not os.path.exists(DIST_DIR):
        print(f"❌ תיקיית {DIST_DIR} לא נוצרה")
        return False
    
    print("✅ בנייה הושלמה בהצלחה")
    return True

def create_s3_bucket():
    """יצירת S3 bucket אם לא קיים"""
    print(f"🪣 בודק/יוצר S3 bucket: {S3_BUCKET}")
    
    # בדיקה אם הבאקט קיים
    check_cmd = f"aws s3 ls s3://{S3_BUCKET} 2>/dev/null"
    if run_command(check_cmd):
        print("✅ Bucket קיים")
        return True
    
    # יצירת הבאקט
    create_cmd = f"aws s3 mb s3://{S3_BUCKET} --region {AWS_REGION}"
    if not run_command(create_cmd):
        return False
    
    # הגדרת website hosting
    website_cmd = f"aws s3 website s3://{S3_BUCKET} --index-document index.html --error-document index.html"
    if not run_command(website_cmd):
        print("⚠️ לא הצלחתי להגדיר website hosting")
    
    print("✅ Bucket נוצר בהצלחה")
    return True

def deploy_to_s3():
    """העלאה ל-S3"""
    print(f"🚀 מעלה ל-S3: {S3_BUCKET}")
    
    # העלאת הקבצים
    sync_cmd = f"aws s3 sync {DIST_DIR}/ s3://{S3_BUCKET}/ --delete --cache-control 'max-age=31536000' --exclude '*.html' --exclude '*.json'"
    if not run_command(sync_cmd):
        return False
    
    # העלאת HTML עם cache control קצר יותר
    html_cmd = f"aws s3 sync {DIST_DIR}/ s3://{S3_BUCKET}/ --delete --cache-control 'max-age=300' --include '*.html' --include '*.json'"
    if not run_command(html_cmd):
        return False
    
    # הגדרת public read access
    policy_cmd = f"""aws s3api put-bucket-policy --bucket {S3_BUCKET} --policy '{{
        "Version": "2012-10-17",
        "Statement": [{{
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::{S3_BUCKET}/*"
        }}]
    }}'"""
    
    if not run_command(policy_cmd):
        print("⚠️ לא הצלחתי להגדיר public access policy")
    
    print("✅ העלאה הושלמה בהצלחה")
    return True

def get_website_url():
    """קבלת URL של האתר"""
    return f"http://{S3_BUCKET}.s3-website-{AWS_REGION}.amazonaws.com"

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל פריסה של QuickShop Frontend ל-S3")
    print("=" * 50)
    
    # בדיקת תנאים מוקדמים
    if not check_aws_cli():
        print("❌ AWS CLI לא מוכן")
        sys.exit(1)
    
    # בניית הפרונטאנד
    if not build_frontend():
        print("❌ בנייה נכשלה")
        sys.exit(1)
    
    # יצירת/בדיקת S3 bucket
    if not create_s3_bucket():
        print("❌ יצירת bucket נכשלה")
        sys.exit(1)
    
    # פריסה ל-S3
    if not deploy_to_s3():
        print("❌ פריסה נכשלה")
        sys.exit(1)
    
    # הצלחה!
    website_url = get_website_url()
    print("\n" + "=" * 50)
    print("🎉 פריסה הושלמה בהצלחה!")
    print(f"🌐 האתר זמין בכתובת: {website_url}")
    print("=" * 50)

if __name__ == "__main__":
    main() 
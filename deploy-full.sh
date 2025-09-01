#!/bin/bash

# QuickShop Full Deployment Script
# מפריס את כל המערכת: מסד נתונים, בקאנד ופרונטאנד

set -e  # Exit on any error

# צבעים לפלט
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# הגדרות כלליות
DEPLOYMENT_LOG="deployment_$(date +%Y%m%d_%H%M%S).log"
START_TIME=$(date +%s)

# פונקציה לרישום לוג
log() {
    echo -e "$1" | tee -a "$DEPLOYMENT_LOG"
}

# פונקציה לבדיקת הצלחה
check_success() {
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ $1 הושלם בהצלחה${NC}"
        return 0
    else
        log "${RED}❌ $1 נכשל${NC}"
        return 1
    fi
}

# פונקציה להצגת זמן שעבר
show_elapsed_time() {
    local current_time=$(date +%s)
    local elapsed=$((current_time - START_TIME))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    log "${CYAN}⏱️ זמן שעבר: ${minutes}m ${seconds}s${NC}"
}

# פונקציה לבדיקת תנאים מוקדמים
check_prerequisites() {
    log "${YELLOW}🔍 בודק תנאים מוקדמים...${NC}"
    
    local errors=0
    
    # בדיקת קבצי סקריפט
    if [ ! -f "deploy-database.sh" ]; then
        log "${RED}❌ deploy-database.sh לא נמצא${NC}"
        ((errors++))
    fi
    
    if [ ! -f "deploy-backend.sh" ]; then
        log "${RED}❌ deploy-backend.sh לא נמצא${NC}"
        ((errors++))
    fi
    
    if [ ! -f "deploy-frontend.sh" ]; then
        log "${RED}❌ deploy-frontend.sh לא נמצא${NC}"
        ((errors++))
    fi
    
    # בדיקת תיקיות
    if [ ! -d "backend" ]; then
        log "${RED}❌ תיקיית backend לא נמצאה${NC}"
        ((errors++))
    fi
    
    if [ ! -d "frontend" ]; then
        log "${RED}❌ תיקיית frontend לא נמצאה${NC}"
        ((errors++))
    fi
    
    # בדיקת כלים נדרשים
    local tools=("node" "npm" "aws" "psql")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log "${RED}❌ $tool לא מותקן${NC}"
            ((errors++))
        fi
    done
    
    if [ $errors -gt 0 ]; then
        log "${RED}❌ נמצאו $errors שגיאות בתנאים המוקדמים${NC}"
        return 1
    fi
    
    log "${GREEN}✅ כל התנאים המוקדמים בסדר${NC}"
    return 0
}

# פונקציה להצגת תפריט
show_menu() {
    log ""
    log "${PURPLE}🚀 QuickShop Deployment Manager${NC}"
    log "${PURPLE}================================${NC}"
    log "${BLUE}1.${NC} פריסה מלאה (מסד נתונים + בקאנד + פרונטאנד)"
    log "${BLUE}2.${NC} פריסת מסד נתונים בלבד"
    log "${BLUE}3.${NC} פריסת בקאנד בלבד"
    log "${BLUE}4.${NC} פריסת פרונטאנד בלבד"
    log "${BLUE}5.${NC} בדיקת סטטוס כל השירותים"
    log "${BLUE}6.${NC} צפייה בלוגים"
    log "${BLUE}0.${NC} יציאה"
    log ""
    echo -n "בחר אפשרות (0-6): "
}

# פונקציה לפריסת מסד נתונים
deploy_database() {
    log "${YELLOW}🗄️ מתחיל פריסת מסד נתונים (דרך שרת EC2)...${NC}"
    log "${BLUE}💡 הערה: RDS נגיש רק מהשרת EC2 - זה נורמלי ובטוח${NC}"
    show_elapsed_time
    
    if ./deploy-database.sh 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
        check_success "פריסת מסד נתונים"
        return 0
    else
        check_success "פריסת מסד נתונים"
        return 1
    fi
}

# פונקציה לפריסת בקאנד
deploy_backend() {
    log "${YELLOW}⚙️ מתחיל פריסת בקאנד...${NC}"
    show_elapsed_time
    
    if ./deploy-backend.sh 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
        check_success "פריסת בקאנד"
        return 0
    else
        check_success "פריסת בקאנד"
        return 1
    fi
}

# פונקציה לפריסת פרונטאנד
deploy_frontend() {
    log "${YELLOW}🌐 מתחיל פריסת פרונטאנד...${NC}"
    show_elapsed_time
    
    if ./deploy-frontend.sh 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
        check_success "פריסת פרונטאנד"
        return 0
    else
        check_success "פריסת פרונטאנד"
        return 1
    fi
}

# פונקציה לבדיקת סטטוס
check_status() {
    log "${YELLOW}🏥 בודק סטטוס כל השירותים...${NC}"
    
    # בדיקת שרת EC2
    log "${BLUE}🖥️ בודק שרת EC2...${NC}"
    if ssh -i "/Users/tadmitinteractive/Downloads/quickshop3key.pem" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@3.64.187.151 "echo 'EC2 OK'" &> /dev/null; then
        log "${GREEN}✅ שרת EC2 נגיש${NC}"
        
        # בדיקת שירות QuickShop
        log "${BLUE}⚙️ בודק שירות QuickShop...${NC}"
        SERVICE_STATUS=$(ssh -i "/Users/tadmitinteractive/Downloads/quickshop3key.pem" -o StrictHostKeyChecking=no ubuntu@3.64.187.151 "sudo systemctl is-active quickshop 2>/dev/null || echo 'inactive'")
        if [ "$SERVICE_STATUS" = "active" ]; then
            log "${GREEN}✅ שירות QuickShop פועל${NC}"
        else
            log "${YELLOW}⚠️ שירות QuickShop לא פועל (${SERVICE_STATUS})${NC}"
        fi
        
        # בדיקת מסד נתונים דרך השרת
        log "${BLUE}📊 בודק מסד נתונים דרך השרת...${NC}"
        if ssh -i "/Users/tadmitinteractive/Downloads/quickshop3key.pem" -o StrictHostKeyChecking=no ubuntu@3.64.187.151 "
            PGPASSWORD='hsWvFFav~c3QYX1a#8DEe*wfo)tB' psql \
                -h 'database-1.cpqqoas4m9o6.eu-central-1.rds.amazonaws.com' \
                -p '5432' \
                -U 'quickshop3' \
                -d 'postgres' \
                -c 'SELECT 1;' >/dev/null 2>&1
        "; then
            log "${GREEN}✅ מסד נתונים נגיש מהשרת${NC}"
        else
            log "${YELLOW}⚠️ מסד נתונים לא נגיש מהשרת${NC}"
        fi
        
    else
        log "${RED}❌ שרת EC2 לא נגיש${NC}"
    fi
    
    # בדיקת S3
    log "${BLUE}🪣 בודק S3 bucket...${NC}"
    if aws s3 ls s3://quickshop3 &> /dev/null; then
        log "${GREEN}✅ S3 bucket נגיש${NC}"
    else
        log "${RED}❌ S3 bucket לא נגיש${NC}"
    fi
    
    # בדיקת אתר S3
    log "${BLUE}🌐 בודק אתר S3...${NC}"
    if curl -f -s "http://quickshop3.s3-website-eu-central-1.amazonaws.com" > /dev/null 2>&1; then
        log "${GREEN}✅ אתר S3 פועל${NC}"
    else
        log "${YELLOW}⚠️ אתר S3 לא נגיש או עדיין מתעדכן${NC}"
    fi
    
    # בדיקת API
    log "${BLUE}🔌 בודק API...${NC}"
    if curl -f -s "http://3.64.187.151:3001/health" > /dev/null 2>&1; then
        log "${GREEN}✅ API פועל${NC}"
    else
        log "${YELLOW}⚠️ API לא נגיש${NC}"
    fi
    
    log "${GREEN}✅ בדיקת סטטוס הושלמה${NC}"
}

# פונקציה לצפייה בלוגים
view_logs() {
    log "${YELLOW}📋 לוגי פריסה זמינים:${NC}"
    ls -la deployment_*.log 2>/dev/null || log "${YELLOW}אין לוגי פריסה${NC}"
    
    log ""
    log "${YELLOW}📋 לוג נוכחי: $DEPLOYMENT_LOG${NC}"
    if [ -f "$DEPLOYMENT_LOG" ]; then
        log "${BLUE}תוכן הלוג:${NC}"
        tail -20 "$DEPLOYMENT_LOG"
    fi
}

# פונקציה לפריסה מלאה
full_deployment() {
    log "${PURPLE}🚀 מתחיל פריסה מלאה של QuickShop${NC}"
    log "${PURPLE}========================================${NC}"
    
    local failed_steps=()
    
    # שלב 1: מסד נתונים
    log "${CYAN}📍 שלב 1/3: פריסת מסד נתונים${NC}"
    if ! deploy_database; then
        failed_steps+=("מסד נתונים")
    fi
    
    # שלב 2: בקאנד
    log "${CYAN}📍 שלב 2/3: פריסת בקאנד${NC}"
    if ! deploy_backend; then
        failed_steps+=("בקאנד")
    fi
    
    # שלב 3: פרונטאנד
    log "${CYAN}📍 שלב 3/3: פריסת פרונטאנד${NC}"
    if ! deploy_frontend; then
        failed_steps+=("פרונטאנד")
    fi
    
    # סיכום
    log ""
    log "${PURPLE}📊 סיכום פריסה מלאה${NC}"
    log "${PURPLE}====================${NC}"
    
    if [ ${#failed_steps[@]} -eq 0 ]; then
        log "${GREEN}🎉 פריסה מלאה הושלמה בהצלחה!${NC}"
        show_elapsed_time
        
        log ""
        log "${BLUE}🌐 המערכת זמינה בכתובות:${NC}"
        log "${YELLOW}• אתר ראשי:${NC} https://my-quickshop.com"
        log "${YELLOW}• API:${NC} https://api.my-quickshop.com"
        log "${YELLOW}• S3 Bucket:${NC} https://quickshop3.s3.eu-central-1.amazonaws.com"
        
        # בדיקת סטטוס אחרונה
        log ""
        check_status
        
    else
        log "${RED}❌ פריסה נכשלה בשלבים הבאים: ${failed_steps[*]}${NC}"
        log "${YELLOW}💡 בדוק את הלוג לפרטים נוספים: $DEPLOYMENT_LOG${NC}"
        show_elapsed_time
        return 1
    fi
}

# פונקציה ראשית
main() {
    # יצירת קובץ לוג
    log "${BLUE}📝 מתחיל פריסה - לוג: $DEPLOYMENT_LOG${NC}"
    log "${BLUE}🕐 זמן התחלה: $(date)${NC}"
    
    # בדיקת תנאים מוקדמים
    if ! check_prerequisites; then
        log "${RED}❌ תנאים מוקדמים לא מתקיימים${NC}"
        exit 1
    fi
    
    # אם יש ארגומנט, הרץ ישירות
    if [ $# -gt 0 ]; then
        case $1 in
            "full"|"all")
                full_deployment
                exit $?
                ;;
            "database"|"db")
                deploy_database
                exit $?
                ;;
            "backend"|"be")
                deploy_backend
                exit $?
                ;;
            "frontend"|"fe")
                deploy_frontend
                exit $?
                ;;
            "status")
                check_status
                exit 0
                ;;
            *)
                log "${RED}❌ ארגומנט לא מוכר: $1${NC}"
                log "${YELLOW}💡 שימוש: $0 [full|database|backend|frontend|status]${NC}"
                exit 1
                ;;
        esac
    fi
    
    # תפריט אינטראקטיבי
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1)
                full_deployment
                ;;
            2)
                deploy_database
                ;;
            3)
                deploy_backend
                ;;
            4)
                deploy_frontend
                ;;
            5)
                check_status
                ;;
            6)
                view_logs
                ;;
            0)
                log "${BLUE}👋 יציאה מהתוכנה${NC}"
                show_elapsed_time
                exit 0
                ;;
            *)
                log "${RED}❌ בחירה לא חוקית${NC}"
                ;;
        esac
        
        log ""
        log "${YELLOW}לחץ Enter להמשך...${NC}"
        read -r
    done
}

# הרצת הפונקציה הראשית
main "$@"

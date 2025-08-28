import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import { useTranslation } from 'react-i18next';
import './joyride-hebrew.css';

const OnboardingTour = ({ user, onComplete, isManualStart, onManualClose }) => {
  const { t } = useTranslation();
  const [run, setRun] = useState(false);

  // אם אין משתמש, לא להציג כלום
  if (!user) {
    return null;
  }

  useEffect(() => {
    // הצג את הטור רק אם המשתמש לא השלים את ה-onboarding
    if (user && user.hasCompletedOnboarding === false) {
      // המתן קצת כדי שהדף יטען לגמרי
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  // הפעלה ידנית של הטור
  useEffect(() => {
    if (isManualStart) {
      setRun(true);
    }
  }, [isManualStart]);

  const steps = [
    {
      target: 'body',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ברוכים הבאים ל-QuickShop! 🎉
          </h3>
          <p className="text-gray-700">
            זהו הדשבורד שלכם - המקום בו תוכלו לנהל את החנות שלכם בקלות ויעילות.
            בואו נעבור יחד על התכונות העיקריות!
          </p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="overview-stats"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            סקירה כללית 📊
          </h3>
          <p className="text-gray-700">
            כאן תוכלו לראות את הנתונים החשובים ביותר של החנות שלכם:
            מכירות, הזמנות, לקוחות והכנסות.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="sidebar-products"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ניהול מוצרים 📦
          </h3>
          <p className="text-gray-700">
            מכאן תוכלו להוסיף, לערוך ולנהל את כל המוצרים בחנות שלכם.
            זה המקום הראשון שכדאי להתחיל ממנו!
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="sidebar-orders"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ניהול הזמנות 🛒
          </h3>
          <p className="text-gray-700">
            כאן תוכלו לעקוב אחר כל ההזמנות שמגיעות מהלקוחות שלכם,
            לעדכן סטטוסים ולנהל משלוחים.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="sidebar-customers"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ניהול לקוחות 👥
          </h3>
          <p className="text-gray-700">
            מאגר הלקוחות שלכם - כאן תוכלו לראות מי קונה מכם,
            לעקוב אחר היסטוריית קניות ולנהל קשרי לקוחות.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="sidebar-analytics"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            אנליטיקה ודוחות 📈
          </h3>
          <p className="text-gray-700">
            כאן תמצאו דוחות מפורטים על ביצועי החנות שלכם,
            מגמות מכירות ותובנות חשובות לקבלת החלטות עסקיות.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="sidebar-settings"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            הגדרות החנות ⚙️
          </h3>
          <p className="text-gray-700">
            מכאן תוכלו להתאים את החנות שלכם - עיצוב, אמצעי תשלום,
            משלוחים ועוד הגדרות חשובות.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="setup-todos"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            משימות הגדרה ✅
          </h3>
          <p className="text-gray-700">
            רשימת המשימות שיעזרו לכם להשלים את הגדרת החנות.
            מומלץ להשלים את כל המשימות כדי שהחנות תהיה מוכנה למכירה!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="store-preview"]',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            תצוגה מקדימה 👁️
          </h3>
          <p className="text-gray-700">
            לחצו כאן כדי לראות איך החנות שלכם נראית ללקוחות.
            זה המקום לבדוק שהכל נראה בדיוק כמו שאתם רוצים!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="text-right" dir="rtl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            זהו! אתם מוכנים להתחיל! 🚀
          </h3>
          <p className="text-gray-700 mb-4">
            עכשיו אתם יודעים איך לנווט בדשבורד. 
            מומלץ להתחיל בהוספת מוצרים ראשונים לחנות שלכם.
          </p>
          <p className="text-sm text-gray-500">
            תוכלו תמיד לחזור לטור הזה דרך אייקון העזרה (?) אם תרצו לרענן את הזיכרון.
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    
    if (status === 'finished' || status === 'skipped') {
      setRun(false);
      
      // אם זה טור ידני, קרא לפונקציה המתאימה
      if (isManualStart && onManualClose) {
        onManualClose();
      }
      
      // אם זה טור אוטומטי של משתמש חדש, השלם את ה-onboarding
      if (onComplete && user && !user.hasCompletedOnboarding) {
        onComplete();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={false}
      showSkipButton={true}
      hideBackButton={false}
      disableOverlayClose={true}
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3B82F6',
          textColor: '#374151',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: '#ffffff',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Noto Sans Hebrew, sans-serif',
        },
        tooltipContainer: {
          textAlign: 'right',
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
          fontSize: '14px',
          fontFamily: 'Noto Sans Hebrew, sans-serif',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6B7280',
          fontSize: '14px',
          fontFamily: 'Noto Sans Hebrew, sans-serif',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#6B7280',
          fontSize: '14px',
          fontFamily: 'Noto Sans Hebrew, sans-serif',
        },
      }}
      locale={{
        back: 'הקודם',
        close: 'סגור',
        last: 'סיום 🎉',
        next: 'הבא',
        skip: 'דלג',
        open: 'פתח',
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};

export default OnboardingTour;
import prisma from '../lib/prisma.js';

/**
 * יוצר את כל הערכות ברירת המחדל לחנות חדשה
 */
export async function setupNewStore(storeId) {
  try {
    console.log(`🏪 Setting up default data for store ${storeId}`);
    
    // יצירת תפריטים ברירת מחדל
    await createDefaultMenus(storeId);
    
    // יצירת עמודים ברירת מחדל
    await createDefaultPages(storeId);
    
    // יצירת הגדרות גלובליות ברירת מחדל
    await createDefaultGlobalSettings(storeId);
    
    console.log(`✅ Store ${storeId} setup completed successfully`);
    
  } catch (error) {
    console.error(`❌ Error setting up store ${storeId}:`, error);
    throw error;
  }
}

/**
 * יוצר תפריטים ברירת מחדל
 */
async function createDefaultMenus(storeId) {
  console.log(`📋 Creating default menus for store ${storeId}`);
  
  // תפריט ראשי
  const mainMenu = await prisma.menu.create({
    data: {
      storeId: parseInt(storeId),
      name: 'תפריט ראשי',
      handle: 'main-menu',
      items: [
        {
          id: '1',
          title: 'בית',
          url: '/',
          type: 'page',
          target: '_self'
        },
        {
          id: '2',
          title: 'חנות',
          url: '/products',
          type: 'collection',
          target: '_self'
        },
        {
          id: '3',
          title: 'אודות',
          url: '/about',
          type: 'page',
          target: '_self'
        },
        {
          id: '4',
          title: 'צור קשר',
          url: '/contact',
          type: 'page',
          target: '_self'
        }
      ],
      isActive: true,
      sortOrder: 0
    }
  });

  // תפריט פוטר
  const footerMenu = await prisma.menu.create({
    data: {
      storeId: parseInt(storeId),
      name: 'תפריט פוטר',
      handle: 'footer-menu',
      items: [
        {
          id: '1',
          title: 'מדיניות פרטיות',
          url: '/privacy',
          type: 'page',
          target: '_self'
        },
        {
          id: '2',
          title: 'תנאי שימוש',
          url: '/terms',
          type: 'page',
          target: '_self'
        },
        {
          id: '3',
          title: 'החזרות והחלפות',
          url: '/returns',
          type: 'page',
          target: '_self'
        },
        {
          id: '4',
          title: 'משלוחים',
          url: '/shipping',
          type: 'page',
          target: '_self'
        }
      ],
      isActive: true,
      sortOrder: 1
    }
  });

  console.log(`✅ Created menus: ${mainMenu.name}, ${footerMenu.name}`);
}

/**
 * יוצר עמודים ברירת מחדל
 */
async function createDefaultPages(storeId) {
  console.log(`📄 Creating default pages for store ${storeId}`);
  
  const defaultPages = [
    {
      title: 'אודות',
      slug: 'about',
      content: `
        <h1>אודות החנות שלנו</h1>
        <p>ברוכים הבאים לחנות שלנו! אנחנו מתמחים במתן שירות איכותי ומוצרים מעולים.</p>
        
        <h2>הסיפור שלנו</h2>
        <p>החנות שלנו נוסדה מתוך אהבה למוצרים איכותיים ורצון לספק ללקוחותינו חוויית קנייה מעולה.</p>
        
        <h2>המשימה שלנו</h2>
        <p>אנו מחויבים לספק מוצרים איכותיים במחירים הוגנים, תוך מתן שירות לקוחות מעולה.</p>
        
        <p><strong>נשמח לעמוד לשירותכם!</strong></p>
      `,
      isPublished: true,
      metaTitle: 'אודות - החנות שלנו',
      metaDescription: 'למדו עוד על החנות שלנו, הסיפור שלנו והמשימה שלנו'
    },
    {
      title: 'צור קשר',
      slug: 'contact',
      content: `
        <h1>צור קשר</h1>
        <p>נשמח לשמוע מכם! ניתן ליצור איתנו קשר בדרכים הבאות:</p>
        
        <h2>פרטי התקשרות</h2>
        <ul>
          <li><strong>טלפון:</strong> 03-1234567</li>
          <li><strong>אימייל:</strong> info@example.com</li>
          <li><strong>כתובת:</strong> רחוב הדוגמה 123, תל אביב</li>
        </ul>
        
        <h2>שעות פעילות</h2>
        <ul>
          <li><strong>ראשון-חמישי:</strong> 09:00-18:00</li>
          <li><strong>שישי:</strong> 09:00-14:00</li>
          <li><strong>שבת:</strong> סגור</li>
        </ul>
        
        <p>אנו מחויבים לחזור אליכם תוך 24 שעות.</p>
      `,
      isPublished: true,
      metaTitle: 'צור קשר - החנות שלנו',
      metaDescription: 'ליצירת קשר איתנו - טלפון, אימייל וכתובת'
    },
    {
      title: 'מדיניות פרטיות',
      slug: 'privacy',
      content: `
        <h1>מדיניות פרטיות</h1>
        <p><strong>עדכון אחרון:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
        
        <h2>איסוף מידע</h2>
        <p>אנו אוספים מידע שאתם מספקים לנו ישירות, כגון כאשר אתם יוצרים חשבון או מבצעים הזמנה.</p>
        
        <h2>שימוש במידע</h2>
        <p>אנו משתמשים במידע שלכם כדי לספק ולשפר את השירותים שלנו, לעבד הזמנות ולתקשר איתכם.</p>
        
        <h2>שיתוף מידע</h2>
        <p>אנו לא משתפים את המידע האישי שלכם עם צדדים שלישיים, למעט במקרים הנדרשים על פי חוק.</p>
        
        <h2>אבטחת מידע</h2>
        <p>אנו נוקטים באמצעי אבטחה מתקדמים כדי להגן על המידע שלכם.</p>
        
        <h2>יצירת קשר</h2>
        <p>לשאלות בנושא מדיניות הפרטיות, ניתן ליצור איתנו קשר בכתובת: privacy@example.com</p>
      `,
      isPublished: true,
      metaTitle: 'מדיניות פרטיות',
      metaDescription: 'מדיניות הפרטיות שלנו - איך אנו מטפלים במידע שלכם'
    },
    {
      title: 'תנאי שימוש',
      slug: 'terms',
      content: `
        <h1>תנאי שימוש</h1>
        <p><strong>עדכון אחרון:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
        
        <h2>קבלת התנאים</h2>
        <p>השימוש באתר מהווה הסכמה לתנאי השימוש המפורטים להלן.</p>
        
        <h2>שימוש באתר</h2>
        <p>האתר מיועד לשימוש אישי ולא מסחרי. אסור לעשות שימוש באתר למטרות בלתי חוקיות.</p>
        
        <h2>הזמנות ותשלומים</h2>
        <p>כל ההזמנות כפופות לזמינות המוצרים ולאישור החנות.</p>
        
        <h2>זכויות יוצרים</h2>
        <p>כל התוכן באתר מוגן בזכויות יוצרים ואסור להעתיקו ללא אישור מראש.</p>
        
        <h2>שינויים בתנאים</h2>
        <p>אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת.</p>
      `,
      isPublished: true,
      metaTitle: 'תנאי שימוש',
      metaDescription: 'תנאי השימוש באתר שלנו'
    },
    {
      title: 'החזרות והחלפות',
      slug: 'returns',
      content: `
        <h1>החזרות והחלפות</h1>
        
        <h2>מדיניות החזרות</h2>
        <p>ניתן להחזיר מוצרים תוך 14 יום מיום הקנייה, בתנאי שהמוצר במצב חדש ובאריזה המקורית.</p>
        
        <h2>תהליך החזרה</h2>
        <ol>
          <li>צרו קשר איתנו לקבלת אישור החזרה</li>
          <li>אחזו את המוצר באריזה המקורית</li>
          <li>שלחו את המוצר לכתובת שנמסור לכם</li>
          <li>הכסף יוחזר תוך 7-14 ימי עסקים</li>
        </ol>
        
        <h2>החלפות</h2>
        <p>ניתן להחליף מוצרים בגודל או צבע שונה, בכפוף לזמינות.</p>
        
        <h2>מוצרים שלא ניתן להחזיר</h2>
        <ul>
          <li>מוצרים אישיים או היגייניים</li>
          <li>מוצרים שהותאמו אישית</li>
          <li>מוצרים שנפגמו על ידי הלקוח</li>
        </ul>
        
        <h2>יצירת קשר</h2>
        <p>לשאלות נוספות: returns@example.com או 03-1234567</p>
      `,
      isPublished: true,
      metaTitle: 'החזרות והחלפות',
      metaDescription: 'מדיניות החזרות וההחלפות שלנו'
    },
    {
      title: 'משלוחים',
      slug: 'shipping',
      content: `
        <h1>משלוחים</h1>
        
        <h2>אפשרויות משלוח</h2>
        <ul>
          <li><strong>משלוח רגיל:</strong> 3-5 ימי עסקים - 25₪</li>
          <li><strong>משלוח מהיר:</strong> 1-2 ימי עסקים - 45₪</li>
          <li><strong>איסוף עצמי:</strong> חינם מהחנות</li>
        </ul>
        
        <h2>משלוח חינם</h2>
        <p>משלוח חינם על הזמנות מעל 200₪ (משלוח רגיל בלבד).</p>
        
        <h2>זמני אספקה</h2>
        <p>זמני האספקה מתחילים לספור מרגע אישור ההזמנה ועיבוד התשלום.</p>
        
        <h2>אזורי חלוקה</h2>
        <p>אנו משלחים לכל רחבי הארץ. לאזורים מרוחקים עלולים להיות עלויות נוספות.</p>
        
        <h2>מעקב אחר המשלוח</h2>
        <p>תקבלו SMS עם מספר מעקב ברגע שהחבילה יוצאת למשלוח.</p>
        
        <h2>בעיות במשלוח</h2>
        <p>במקרה של בעיה במשלוח, אנא צרו קשר איתנו מיד: shipping@example.com</p>
      `,
      isPublished: true,
      metaTitle: 'משלוחים',
      metaDescription: 'מידע על אפשרויות המשלוח וזמני האספקה'
    }
  ];

  // יצירת העמודים
  for (const pageData of defaultPages) {
    const { metaTitle, metaDescription, ...cleanPageData } = pageData;
    await prisma.page.create({
      data: {
        storeId: parseInt(storeId),
        type: 'CONTENT',
        seoTitle: metaTitle,
        seoDescription: metaDescription,
        content: { html: pageData.content },
        ...cleanPageData
      }
    });
  }

  console.log(`✅ Created ${defaultPages.length} default pages`);
}

/**
 * יוצר הגדרות גלובליות ברירת מחדל
 */
async function createDefaultGlobalSettings(storeId) {
  console.log(`⚙️ Creating default global settings for store ${storeId}`);
  
  // הגדרות הדר
  await prisma.globalSettings.create({
    data: {
      storeId: parseInt(storeId),
      type: 'HEADER',
      settings: {
        logo: {
          type: 'text',
          text: 'החנות שלי',
          showText: true
        },
        navigation: {
          menuHandle: 'main-menu',
          showSearch: true,
          showAccount: true,
          showCart: true,
          showWishlist: true
        },
        topBar: {
          show: true,
          message: 'משלוח חינם על הזמנות מעל ₪200',
          backgroundColor: '#1f2937',
          textColor: '#ffffff'
        }
      },
      isActive: true
    }
  });

  // הגדרות פוטר
  await prisma.globalSettings.create({
    data: {
      storeId: parseInt(storeId),
      type: 'FOOTER',
      settings: {
        companyInfo: {
          name: 'החנות שלי',
          description: 'החנות המובילה למוצרים איכותיים',
          address: 'רחוב הדוגמה 123, תל אביב',
          phone: '03-1234567',
          email: 'info@example.com'
        },
        menus: [
          {
            title: 'קישורים מהירים',
            menuHandle: 'footer-menu'
          }
        ],
        social: {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: ''
        },
        newsletter: {
          show: true,
          title: 'הירשמו לניוזלטר',
          description: 'קבלו עדכונים על מוצרים חדשים והנחות מיוחדות'
        },
        copyright: `© ${new Date().getFullYear()} החנות שלי. כל הזכויות שמורות.`
      },
      isActive: true
    }
  });

  console.log(`✅ Created default global settings`);
} 
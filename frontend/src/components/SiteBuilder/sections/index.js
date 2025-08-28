/**
 * 🎨 QuickShop Site Builder - All Sections Registry
 * רישום כל הסקשנים הזמינים בבילדר
 */

import { 
  SECTION_CATEGORIES, 
  SETTING_TYPES, 
  createSectionSchema, 
  createSetting 
} from '../types/sections.js';
import { 
  Megaphone, 
  Target, 
  Grid3X3, 
  ShoppingBag, 
  Mail,
  Navigation,
  Layers
} from 'lucide-react';

// Header Section
export const headerSection = createSectionSchema({
  id: 'header',
  name: 'הדר האתר',
  category: SECTION_CATEGORIES.HEADER,
  icon: Navigation,
  description: 'הדר האתר עם לוגו, תפריט ועגלת קניות',
  settings: [
    // Header Design
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'header_design',
      label: 'עיצוב הדר',
      options: [
        { value: 'logo-center-menu-left', label: 'לוגו במרכז 1', group: 'לוגו ותפריט בשורה אחת' },
        { value: 'both-center', label: 'לוגו במרכז 2 (עם תפריט שני)', group: 'לוגו ותפריט בשורה אחת' },
        { value: 'logo-left-menu-center', label: 'לוגו משמאל', group: 'לוגו ותפריט בשורה אחת' },
        { value: 'logo-center__2l', label: 'לוגו במרכז', group: 'לוגו ותפריט ב-2 שורות' },
        { value: 'logo-left__2l', label: 'לוגו משמאל', group: 'לוגו ותפריט ב-2 שורות' }
      ],
      default: 'logo-center-menu-left'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'container',
      label: 'סוג מכולה',
      options: [
        { value: 'container-fluid', label: 'ברירת מחדל' },
        { value: 'w-full', label: 'רוחב מלא' },
        { value: 'container', label: 'השתמש במכולה מוגבלת' }
      ],
      default: 'container-fluid'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'header_sticky',
      label: 'דביק למעלה',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'transparent_on_top',
      label: 'שקוף למעלה',
      default: false
    }),

    // Logos Section
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'לוגואים'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'logo_text',
      label: 'טקסט לוגו',
      default: 'החנות שלי'
    }),
    createSetting({
      type: SETTING_TYPES.IMAGE,
      id: 'logo',
      label: 'לוגו ברירת מחדל'
    }),
    createSetting({
      type: SETTING_TYPES.IMAGE,
      id: 'logo_mobile',
      label: 'לוגו נייד'
    }),
    createSetting({
      type: SETTING_TYPES.IMAGE,
      id: 'logo_transparent',
      label: 'לוגו להדר שקוף'
    }),

    createSetting({
      type: SETTING_TYPES.RANGE,
      id: 'logo_max_width',
      label: 'רוחב לוגו (דסקטופ)',
      default: 145,
      min: 30,
      max: 450,
      step: 5,
      unit: 'px'
    }),
    createSetting({
      type: SETTING_TYPES.RANGE,
      id: 'sticky_logo_max_width',
      label: 'רוחב לוגו (דביק)',
      default: 145,
      min: 30,
      max: 450,
      step: 5,
      unit: 'px'
    }),
    createSetting({
      type: SETTING_TYPES.RANGE,
      id: 'mobile_logo_max_width',
      label: 'רוחב לוגו (נייד)',
      default: 110,
      min: 30,
      max: 450,
      step: 5,
      unit: 'px'
    }),

    // Menu Section
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תפריט'
    }),
    createSetting({
      type: SETTING_TYPES.LINK_LIST,
      id: 'main_menu',
      label: 'תפריט ראשי'
    }),
    createSetting({
      type: SETTING_TYPES.LINK_LIST,
      id: 'secondary_menu',
      label: 'תפריט משני',
      info: 'להדר עם 2 תפריטים'
    }),
    createSetting({
      type: SETTING_TYPES.LINK_LIST,
      id: 'mobile_menu',
      label: 'תפריט נייד',
      info: 'השאירו ריק כדי להשתמש בתפריט הראשי'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'uppercase_parent_level',
      label: 'רמה ראשונה באותיות גדולות',
      default: true
    }),

    // Addons Section
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוספות'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'search',
      label: 'חיפוש',
      options: [
        { value: 'hide', label: 'הסתר' },
        { value: 'show_icon', label: 'הצג אייקון' },
        { value: 'show_full', label: 'הצג תיבת חיפוש מלאה' }
      ],
      default: 'hide'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_account_icon',
      label: 'הצג אייקון חשבון',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_cart_icon',
      label: 'הצג אייקון עגלה',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_wishlist_icon',
      label: 'הצג אייקון רשימת משאלות',
      default: true
    }),

    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_currency_switcher',
      label: 'הצג בורר מטבע',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_country_selector',
      label: 'הצג בורר מדינה/אזור',
      default: false
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_language_switcher',
      label: 'הצג בורר שפה',
      default: true
    }),


  ],
  blocks: [
    {
      type: 'menu_item',
      name: 'פריט תפריט',
      settings: [
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'title',
          label: 'כותרת',
          default: 'דף חדש'
        }),
        createSetting({
          type: SETTING_TYPES.URL,
          id: 'link',
          label: 'קישור'
        }),
        createSetting({
          type: SETTING_TYPES.CHECKBOX,
          id: 'open_new_tab',
          label: 'פתח בטאב חדש',
          default: false
        })
      ]
    }
  ],
  max_blocks: 8,
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      logo_text: 'החנות שלי',
      logo_width: 120,
      show_search: true,
      show_cart: true,
      show_account: true,
      background_color: '#ffffff',
      text_color: '#1f2937',
      sticky_header: true,
      show_border: true
    },
    blocks: [
      {
        type: 'menu_item',
        settings: {
          title: 'בית',
          link: '/'
        }
      },
      {
        type: 'menu_item',
        settings: {
          title: 'מוצרים',
          link: '/products'
        }
      },
      {
        type: 'menu_item',
        settings: {
          title: 'אודות',
          link: '/about'
        }
      },
      {
        type: 'menu_item',
        settings: {
          title: 'צור קשר',
          link: '/contact'
        }
      }
    ]
  }]
});

// Announcement Bar Section
export const announcementSection = createSectionSchema({
  id: 'announcement',
  name: 'שורת הודעות',
  category: SECTION_CATEGORIES.HEADER,
  icon: Megaphone,
  description: 'הודעה חשובה בחלק העליון של הדף',
  settings: [
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'message',
      label: 'טקסט ההודעה',
      default: '🚚 משלוח חינם על הזמנות מעל ₪200 | 📞 שירות לקוחות 24/7'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'link',
      label: 'קישור (אופציונלי)'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#1f2937'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'text_color',
      label: 'צבע טקסט',
      default: '#ffffff'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'text_size',
      label: 'גודל טקסט',
      options: [
        { value: 'text-xs', label: 'קטן מאוד' },
        { value: 'text-sm', label: 'קטן' },
        { value: 'text-base', label: 'רגיל' },
        { value: 'text-lg', label: 'גדול' }
      ],
      default: 'text-sm'
    })
  ],
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      message: '🚚 משלוח חינם על הזמנות מעל ₪200 | 📞 שירות לקוחות 24/7',
      background_color: '#1f2937',
      text_color: '#ffffff',
      text_size: 'text-sm'
    }
  }]
});

// Hero Section
export const heroSection = createSectionSchema({
  id: 'hero',
  name: 'Hero Section',
  category: SECTION_CATEGORIES.HERO,
  icon: Target,
  description: 'קטע פתיחה מרשים עם כותרת וכפתורי פעולה',
  settings: [
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'subtitle',
      label: 'כותרת משנה',
      default: 'הקולקציה החדשה'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      default: 'גלו את הסגנון שלכם'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      default: 'קולקציה חדשה של בגדים איכותיים, עיצובים ייחודיים ונוחות מקסימלית לכל יום.'
    }),
    createSetting({
      type: SETTING_TYPES.IMAGE,
      id: 'background_image',
      label: 'תמונת רקע'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'כפתורי פעולה'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'button_primary_text',
      label: 'טקסט כפתור ראשי',
      default: 'קנו עכשיו'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'button_primary_link',
      label: 'קישור כפתור ראשי',
      default: '/products'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'button_secondary_text',
      label: 'טקסט כפתור משני',
      default: 'צפו בקולקציות'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'button_secondary_link',
      label: 'קישור כפתור משני',
      default: '/collections'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'פריסה ועיצוב'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'layout',
      label: 'סוג פריסה',
      options: [
        { value: 'center', label: 'מרכז' },
        { value: 'split', label: 'חלוקה' },
        { value: 'overlay', label: 'שכבת כיסוי' }
      ],
      default: 'split'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'height',
      label: 'גובה הסקשן',
      options: [
        { value: 'small', label: 'קטן (400px)' },
        { value: 'medium', label: 'בינוני (500px)' },
        { value: 'large', label: 'גדול (600px)' },
        { value: 'full', label: 'מסך מלא' }
      ],
      default: 'large'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#f9fafb'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'use_primary_color',
      label: 'השתמש בצבע ראשי גלובלי לכפתור',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'use_secondary_color',
      label: 'השתמש בצבע משני גלובלי לכפתור משני',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'text_alignment',
      label: 'יישור טקסט',
      options: [
        { value: 'left', label: 'שמאל' },
        { value: 'center', label: 'מרכז' },
        { value: 'right', label: 'ימין' }
      ],
      default: 'right'
    })
  ],
  blocks: [
    {
      type: 'stat',
      name: 'סטטיסטיקה',
      settings: [
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'value',
          label: 'ערך',
          default: '100+'
        }),
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'label',
          label: 'תווית',
          default: 'מוצרים'
        })
      ]
    }
  ],
  max_blocks: 4,
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      subtitle: 'הקולקציה החדשה',
      title: 'גלו את הסגנון שלכם',
      description: 'קולקציה חדשה של בגדים איכותיים, עיצובים ייחודיים ונוחות מקסימלית לכל יום.',
      button_primary_text: 'קנו עכשיו',
      button_primary_link: '/products',
      button_secondary_text: 'צפו בקולקציות',
      button_secondary_link: '/collections',
      layout: 'split',
      height: 'large',
      background_color: '#f9fafb',
      text_alignment: 'right'
    },
    blocks: [
      {
        type: 'stat',
        settings: {
          value: '100+',
          label: 'מוצרים'
        }
      },
      {
        type: 'stat',
        settings: {
          value: '5K+',
          label: 'לקוחות'
        }
      },
      {
        type: 'stat',
        settings: {
          value: '24/7',
          label: 'תמיכה'
        }
      }
    ]
  }]
});

// Categories Section
export const categoriesSection = createSectionSchema({
  id: 'categories',
  name: 'רשת קטגוריות',
  category: SECTION_CATEGORIES.PRODUCTS,
  icon: Grid3X3,
  description: 'הצגת קטגוריות המוצרים בפריסת רשת',
  settings: [
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'subtitle',
      label: 'כותרת משנה',
      default: 'קטגוריות פופולריות'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      default: 'גלו את הקטגוריות שלנו'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      default: 'מגוון רחב של מוצרים איכותיים בכל הקטגוריות שאתם אוהבים'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'פריסה'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'columns_desktop',
      label: 'עמודות בדסקטופ',
      options: [
        { value: '2', label: '2 עמודות' },
        { value: '3', label: '3 עמודות' },
        { value: '4', label: '4 עמודות' },
        { value: '5', label: '5 עמודות' }
      ],
      default: '4'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'columns_mobile',
      label: 'עמודות בנייד',
      options: [
        { value: '1', label: '1 עמודה' },
        { value: '2', label: '2 עמודות' }
      ],
      default: '2'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_product_count',
      label: 'הצג מספר מוצרים',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#f9fafb'
    })
  ],
  blocks: [
    {
      type: 'category',
      name: 'קטגוריה',
      settings: [
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'title',
          label: 'שם הקטגוריה',
          default: 'קטגוריה חדשה'
        }),
        createSetting({
          type: SETTING_TYPES.IMAGE,
          id: 'image',
          label: 'תמונה'
        }),
        createSetting({
          type: SETTING_TYPES.URL,
          id: 'link',
          label: 'קישור'
        })
      ]
    }
  ],
  max_blocks: 8,
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      subtitle: 'קטגוריות פופולריות',
      title: 'גלו את הקטגוריות שלנו',
      description: 'מגוון רחב של מוצרים איכותיים בכל הקטגוריות שאתם אוהבים',
      columns_desktop: '4',
      columns_mobile: '2',
      show_product_count: true,
      background_color: '#f9fafb'
    },
    blocks: [
      {
        type: 'category',
        settings: {
          title: 'חולצות',
          link: '/collections/shirts'
        }
      },
      {
        type: 'category',
        settings: {
          title: 'מכנסיים',
          link: '/collections/pants'
        }
      },
      {
        type: 'category',
        settings: {
          title: 'נעליים',
          link: '/collections/shoes'
        }
      },
      {
        type: 'category',
        settings: {
          title: 'אביזרים',
          link: '/collections/accessories'
        }
      }
    ]
  }]
});

// Featured Products Section
export const featuredProductsSection = createSectionSchema({
  id: 'featured_products',
  name: 'מוצרים מובילים',
  category: SECTION_CATEGORIES.PRODUCTS,
  icon: ShoppingBag,
  description: 'הצגת מוצרים נבחרים בפריסת רשת',
  settings: [
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'subtitle',
      label: 'כותרת משנה',
      default: 'המוצרים הנמכרים ביותר'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      default: 'המוצרים המובילים שלנו'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      default: 'המוצרים הפופולריים ביותר שלקוחותינו הכי אוהבים'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'הגדרות מוצרים'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'product_source',
      label: 'מקור המוצרים',
      options: [
        { value: 'featured', label: 'מוצרים מובילים' },
        { value: 'newest', label: 'מוצרים חדשים' },
        { value: 'best_selling', label: 'הנמכרים ביותר' },
        { value: 'on_sale', label: 'במבצע' }
      ],
      default: 'featured'
    }),
    createSetting({
      type: SETTING_TYPES.NUMBER,
      id: 'products_to_show',
      label: 'מספר מוצרים להצגה',
      default: 8,
      min: 2,
      max: 12
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'פריסה'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'columns_desktop',
      label: 'עמודות בדסקטופ',
      options: [
        { value: '2', label: '2 עמודות' },
        { value: '3', label: '3 עמודות' },
        { value: '4', label: '4 עמודות' },
        { value: '5', label: '5 עמודות' }
      ],
      default: '4'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'columns_mobile',
      label: 'עמודות בנייד',
      options: [
        { value: '1', label: '1 עמודה' },
        { value: '2', label: '2 עמודות' }
      ],
      default: '2'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_view_all',
      label: 'הצג כפתור "צפה בהכל"',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'view_all_text',
      label: 'טקסט כפתור "צפה בהכל"',
      default: 'צפו בכל המוצרים'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'view_all_link',
      label: 'קישור "צפה בהכל"',
      default: '/products'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#ffffff'
    })
  ],
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      subtitle: 'המוצרים הנמכרים ביותר',
      title: 'המוצרים המובילים שלנו',
      description: 'המוצרים הפופולריים ביותר שלקוחותינו הכי אוהבים',
      product_source: 'featured',
      products_to_show: 8,
      columns_desktop: '4',
      columns_mobile: '2',
      show_view_all: true,
      view_all_text: 'צפו בכל המוצרים',
      view_all_link: '/products',
      background_color: '#ffffff'
    }
  }]
});

// Newsletter Section
export const newsletterSection = createSectionSchema({
  id: 'newsletter',
  name: 'הרשמה לניוזלטר',
  category: SECTION_CATEGORIES.MARKETING,
  icon: Mail,
  description: 'טופס הרשמה לניוזלטר עם עיצוב מושך',
  settings: [
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת',
      default: 'הירשמו לניוזלטר'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      default: 'קבלו עדכונים על מוצרים חדשים, מבצעים מיוחדים והנחות בלעדיות'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'placeholder',
      label: 'טקסט מציין מקום',
      default: 'כתובת אימייל'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'button_text',
      label: 'טקסט כפתור',
      default: 'הירשמו'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#3b82f6'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'text_color',
      label: 'צבע טקסט',
      default: '#ffffff'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'layout',
      label: 'פריסה',
      options: [
        { value: 'center', label: 'מרכז' },
        { value: 'split', label: 'חלוקה' }
      ],
      default: 'center'
    })
  ],
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      title: 'הירשמו לניוזלטר',
      description: 'קבלו עדכונים על מוצרים חדשים, מבצעים מיוחדים והנחות בלעדיות',
      placeholder: 'כתובת אימייל',
      button_text: 'הירשמו',
      background_color: '#3b82f6',
      text_color: '#ffffff',
      layout: 'center'
    }
  }]
});

// Footer Section
export const footerSection = createSectionSchema({
  id: 'footer',
  name: 'פוטר האתר',
  category: SECTION_CATEGORIES.FOOTER,
  icon: Layers,
  description: 'פוטר האתר עם קישורים, מידע ורשתות חברתיות',
  settings: [
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'מידע כללי'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'store_name',
      label: 'שם החנות',
      default: 'החנות שלי'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור החנות',
      default: 'החנות המובילה למוצרי איכות עם שירות מעולה ומשלוחים מהירים'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'פרטי יצירת קשר'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'phone',
      label: 'טלפון',
      default: '03-1234567'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'email',
      label: 'אימייל',
      default: 'info@mystore.co.il'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'address',
      label: 'כתובת',
      default: 'רחוב הראשי 123, תל אביב'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'רשתות חברתיות'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'facebook_url',
      label: 'קישור פייסבוק'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'instagram_url',
      label: 'קישור אינסטגרם'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'whatsapp_url',
      label: 'קישור וואטסאפ'
    }),
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#1f2937'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'text_color',
      label: 'צבע טקסט',
      default: '#ffffff'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_newsletter',
      label: 'הצג הרשמה לניוזלטר',
      default: true
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_payment_icons',
      label: 'הצג אייקוני תשלום',
      default: true
    })
  ],
  blocks: [
    {
      type: 'footer_column',
      name: 'עמודת קישורים',
      settings: [
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'title',
          label: 'כותרת העמודה',
          default: 'קישורים מהירים'
        })
      ]
    },
    {
      type: 'footer_link',
      name: 'קישור',
      settings: [
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'title',
          label: 'טקסט הקישור',
          default: 'קישור חדש'
        }),
        createSetting({
          type: SETTING_TYPES.URL,
          id: 'link',
          label: 'כתובת הקישור'
        })
      ]
    }
  ],
  max_blocks: 12,
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      store_name: 'החנות שלי',
      description: 'החנות המובילה למוצרי איכות עם שירות מעולה ומשלוחים מהירים',
      phone: '03-1234567',
      email: 'info@mystore.co.il',
      address: 'רחוב הראשי 123, תל אביב',
      background_color: '#1f2937',
      text_color: '#ffffff',
      show_newsletter: true,
      show_payment_icons: true
    },
    blocks: [
      {
        type: 'footer_column',
        settings: {
          title: 'קישורים מהירים'
        }
      },
      {
        type: 'footer_link',
        settings: {
          title: 'אודות',
          link: '/about'
        }
      },
      {
        type: 'footer_link',
        settings: {
          title: 'צור קשר',
          link: '/contact'
        }
      },
      {
        type: 'footer_link',
        settings: {
          title: 'תנאי שימוש',
          link: '/terms'
        }
      },
      {
        type: 'footer_column',
        settings: {
          title: 'שירות לקוחות'
        }
      },
      {
        type: 'footer_link',
        settings: {
          title: 'מדיניות החזרות',
          link: '/returns'
        }
      },
      {
        type: 'footer_link',
        settings: {
          title: 'משלוחים',
          link: '/shipping'
        }
      },
      {
        type: 'footer_link',
        settings: {
          title: 'תמיכה',
          link: '/support'
        }
      }
    ]
  }]
});

// רישום כל הסקשנים
export const ALL_SECTIONS = [
  headerSection,
  announcementSection,
  heroSection,
  categoriesSection,
  featuredProductsSection,
  newsletterSection,
  footerSection
];

// קבלת סקשן לפי ID
export const getSectionById = (id) => {
  return ALL_SECTIONS.find(section => section.id === id);
};

// קבלת סקשנים לפי קטגוריה
export const getSectionsByCategory = (category) => {
  return ALL_SECTIONS.filter(section => section.category === category);
};

export default {
  ALL_SECTIONS,
  getSectionById,
  getSectionsByCategory,
  headerSection,
  announcementSection,
  heroSection,
  categoriesSection,
  featuredProductsSection,
  newsletterSection,
  footerSection
};

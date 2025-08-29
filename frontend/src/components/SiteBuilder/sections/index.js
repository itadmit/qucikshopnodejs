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
  Layers,
  MessageCircle,
  HelpCircle,
  Star,
  Award,
  CheckCircle,
  Users
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

    // Menu Section - Enhanced
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תפריט',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.MENU_PICKER,
      id: 'main_menu',
      label: 'תפריט ראשי',
      placeholder: 'בחר תפריט ראשי...',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.MENU_PICKER,
      id: 'secondary_menu',
      label: 'תפריט משני',
      placeholder: 'בחר תפריט משני...',
      info: 'להדר עם 2 תפריטים',
      conditional: { 
        setting: 'header_design', 
        operator: 'in', 
        value: ['both-center', 'logo-center__2l'] 
      },
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.MENU_PICKER,
      id: 'mobile_menu',
      label: 'תפריט נייד',
      placeholder: 'בחר תפריט נייד...',
      info: 'השאירו ריק כדי להשתמש בתפריט הראשי',
      group: 'content'
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

// Hero Section - Enhanced
export const heroSection = createSectionSchema({
  id: 'hero',
  name: 'Hero Section',
  category: SECTION_CATEGORIES.HERO,
  icon: Target,
  description: 'קטע פתיחה מרשים עם כותרת וכפתורי פעולה',
  settings: [
    // תוכן
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'subtitle',
      label: 'כותרת משנה',
      placeholder: 'הקולקציה החדשה',
      default: 'הקולקציה החדשה',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      placeholder: 'גלו את הסגנון שלכם',
      default: 'גלו את הסגנון שלכם',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      placeholder: 'תיאור מושך שמסביר את הערך שלכם',
      default: 'קולקציה חדשה של בגדים איכותיים, עיצובים ייחודיים ונוחות מקסימלית לכל יום.',
      group: 'content'
    }),

    // מדיה
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'מדיה',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'media_type',
      label: 'סוג מדיה',
      options: [
        { value: 'image', label: 'תמונה' },
        { value: 'video', label: 'וידאו' },
        { value: 'color', label: 'צבע רקע בלבד' }
      ],
      default: 'image',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.IMAGE,
      id: 'background_image',
      label: 'תמונת רקע',
      conditional: { setting: 'media_type', value: 'image' },
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.VIDEO,
      id: 'background_video',
      label: 'וידאו רקע',
      conditional: { setting: 'media_type', value: 'video' },
      group: 'content'
    }),

    // כפתורי פעולה
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'כפתורי פעולה',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_primary_button',
      label: 'הצג כפתור ראשי',
      default: true,
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'button_primary_text',
      label: 'טקסט כפתור ראשי',
      placeholder: 'קנו עכשיו',
      default: 'קנו עכשיו',
      conditional: { setting: 'show_primary_button', value: true },
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'button_primary_link',
      label: 'קישור כפתור ראשי',
      placeholder: '/products',
      default: '/products',
      conditional: { setting: 'show_primary_button', value: true },
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_secondary_button',
      label: 'הצג כפתור משני',
      default: true,
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'button_secondary_text',
      label: 'טקסט כפתור משני',
      placeholder: 'צפו בקולקציות',
      default: 'צפו בקולקציות',
      conditional: { setting: 'show_secondary_button', value: true },
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.URL,
      id: 'button_secondary_link',
      label: 'קישור כפתור משני',
      placeholder: '/collections',
      default: '/collections',
      conditional: { setting: 'show_secondary_button', value: true },
      group: 'content'
    }),

    // פריסה
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'פריסה',
      group: 'layout'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'layout',
      label: 'סוג פריסה',
      options: [
        { value: 'center', label: 'תוכן במרכז' },
        { value: 'split', label: 'חלוקה - תוכן משמאל, תמונה מימין' },
        { value: 'overlay', label: 'שכבת כיסוי - תוכן מעל התמונה' }
      ],
      default: 'split',
      group: 'layout'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'height',
      label: 'גובה הסקשן',
      options: [
        { value: 'small', label: 'קטן (400px)' },
        { value: 'medium', label: 'בינוני (500px)' },
        { value: 'large', label: 'גדול (600px)' },
        { value: 'full', label: 'מסך מלא (100vh)' }
      ],
      default: 'large',
      group: 'layout'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'content_alignment',
      label: 'יישור תוכן',
      options: [
        { value: 'left', label: 'שמאל' },
        { value: 'center', label: 'מרכז' },
        { value: 'right', label: 'ימין' }
      ],
      default: 'right',
      group: 'layout'
    }),

    // עיצוב
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב',
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#f9fafb',
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.RANGE,
      id: 'background_opacity',
      label: 'שקיפות רקע',
      min: 0,
      max: 100,
      step: 5,
      unit: '%',
      default: 100,
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'text_color',
      label: 'צבע טקסט',
      default: '#1f2937',
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'use_primary_color',
      label: 'השתמש בצבע ראשי גלובלי לכפתור',
      default: true,
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'use_secondary_color',
      label: 'השתמש בצבע משני גלובלי לכפתור משני',
      default: true,
      group: 'style'
    }),

    // אנימציות
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'אנימציות',
      group: 'behavior'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'entrance_animation',
      label: 'אנימציית כניסה',
      options: [
        { value: 'none', label: 'ללא אנימציה' },
        { value: 'fade-in', label: 'דהייה פנימה' },
        { value: 'slide-up', label: 'החלקה מלמעלה' },
        { value: 'slide-down', label: 'החלקה מלמטה' },
        { value: 'zoom-in', label: 'זום פנימה' }
      ],
      default: 'fade-in',
      group: 'behavior'
    }),
    createSetting({
      type: SETTING_TYPES.RANGE,
      id: 'animation_duration',
      label: 'משך אנימציה',
      min: 0.3,
      max: 2,
      step: 0.1,
      unit: 's',
      default: 0.8,
      conditional: { setting: 'entrance_animation', operator: 'not_equals', value: 'none' },
      group: 'behavior'
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

// Featured Products Section - Enhanced
export const featuredProductsSection = createSectionSchema({
  id: 'featured_products',
  name: 'מוצרים מובילים',
  category: SECTION_CATEGORIES.PRODUCTS,
  icon: ShoppingBag,
  description: 'הצגת מוצרים נבחרים בפריסת רשת',
  settings: [
    // תוכן
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'subtitle',
      label: 'כותרת משנה',
      placeholder: 'המוצרים הנמכרים ביותר',
      default: 'המוצרים הנמכרים ביותר',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      placeholder: 'המוצרים המובילים שלנו',
      default: 'המוצרים המובילים שלנו',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      placeholder: 'המוצרים הפופולריים ביותר שלקוחותינו הכי אוהבים',
      default: 'המוצרים הפופולריים ביותר שלקוחותינו הכי אוהבים',
      group: 'content'
    }),

    // מקור מוצרים
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'מקור מוצרים',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'product_source',
      label: 'מקור המוצרים',
      options: [
        { value: 'manual', label: 'בחירה ידנית' },
        { value: 'collection', label: 'מקולקציה' },
        { value: 'featured', label: 'מוצרים מובילים' },
        { value: 'newest', label: 'מוצרים חדשים' },
        { value: 'best_selling', label: 'הנמכרים ביותר' },
        { value: 'on_sale', label: 'במבצע' }
      ],
      default: 'featured',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.PRODUCT_LIST,
      id: 'manual_products',
      label: 'מוצרים ידניים',
      maxProducts: 12,
      conditional: { setting: 'product_source', value: 'manual' },
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.COLLECTION_PICKER,
      id: 'collection_id',
      label: 'בחר קולקציה',
      conditional: { setting: 'product_source', value: 'collection' },
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.RANGE,
      id: 'products_to_show',
      label: 'מספר מוצרים להצגה',
      min: 2,
      max: 12,
      step: 1,
      default: 8,
      conditional: { 
        setting: 'product_source', 
        operator: 'not_equals', 
        value: 'manual' 
      },
      group: 'content'
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

// ===== NEW SECTIONS =====

// Testimonials Section
export const testimonialsSection = createSectionSchema({
  id: 'testimonials',
  name: 'המלצות לקוחות',
  category: SECTION_CATEGORIES.SOCIAL,
  icon: MessageCircle,
  description: 'הצגת המלצות מלקוחות מרוצים',
  settings: [
    // תוכן
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'subtitle',
      label: 'כותרת משנה',
      placeholder: 'מה הלקוחות אומרים',
      default: 'מה הלקוחות אומרים',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      placeholder: 'המלצות מלקוחות מרוצים',
      default: 'המלצות מלקוחות מרוצים',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      placeholder: 'קראו מה הלקוחות שלנו חושבים על המוצרים והשירות',
      default: 'קראו מה הלקוחות שלנו חושבים על המוצרים והשירות',
      group: 'content'
    }),

    // פריסה
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'פריסה',
      group: 'layout'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'layout_type',
      label: 'סוג תצוגה',
      options: [
        { value: 'grid', label: 'רשת' },
        { value: 'carousel', label: 'קרוסלה' },
        { value: 'list', label: 'רשימה' }
      ],
      default: 'grid',
      group: 'layout'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'columns_desktop',
      label: 'עמודות בדסקטופ',
      options: [
        { value: '1', label: '1 עמודה' },
        { value: '2', label: '2 עמודות' },
        { value: '3', label: '3 עמודות' }
      ],
      default: '3',
      conditional: { setting: 'layout_type', operator: 'in', value: ['grid'] },
      group: 'layout'
    }),

    // עיצוב
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב',
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.CHECKBOX,
      id: 'show_ratings',
      label: 'הצג דירוגי כוכבים',
      default: true,
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#f9fafb',
      group: 'style'
    })
  ],
  blocks: [
    {
      type: 'testimonial',
      name: 'המלצה',
      settings: [
        createSetting({
          type: SETTING_TYPES.TEXTAREA,
          id: 'quote',
          label: 'ציטוט הלקוח',
          placeholder: 'שירות מעולה ומוצרים איכותיים...',
          default: 'שירות מעולה ומוצרים איכותיים. ממליץ בחום!'
        }),
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'customer_name',
          label: 'שם הלקוח',
          placeholder: 'יוסי כהן',
          default: 'יוסי כהן'
        }),
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'customer_title',
          label: 'תפקיד/חברה',
          placeholder: 'מנהל רכש, חברת ABC'
        }),
        createSetting({
          type: SETTING_TYPES.IMAGE,
          id: 'customer_photo',
          label: 'תמונת הלקוח'
        }),
        createSetting({
          type: SETTING_TYPES.RANGE,
          id: 'rating',
          label: 'דירוג (כוכבים)',
          min: 1,
          max: 5,
          step: 1,
          default: 5
        })
      ]
    }
  ],
  max_blocks: 6,
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      subtitle: 'מה הלקוחות אומרים',
      title: 'המלצות מלקוחות מרוצים',
      description: 'קראו מה הלקוחות שלנו חושבים על המוצרים והשירות',
      layout_type: 'grid',
      columns_desktop: '3',
      show_ratings: true,
      background_color: '#f9fafb'
    },
    blocks: [
      {
        type: 'testimonial',
        settings: {
          quote: 'שירות מעולה ומוצרים איכותיים. הזמנתי כמה פעמים וכל פעם מרוצה מחדש!',
          customer_name: 'שרה לוי',
          customer_title: 'לקוחה מרוצה',
          rating: 5
        }
      },
      {
        type: 'testimonial',
        settings: {
          quote: 'המשלוח היה מהיר והמוצרים הגיעו בדיוק כמו שהזמנתי. ממליץ בחום!',
          customer_name: 'דוד כהן',
          customer_title: 'לקוח קבוע',
          rating: 5
        }
      }
    ]
  }]
});

// FAQ Section
export const faqSection = createSectionSchema({
  id: 'faq',
  name: 'שאלות נפוצות',
  category: SECTION_CATEGORIES.CONTENT,
  icon: HelpCircle,
  description: 'רשימת שאלות ותשובות נפוצות',
  settings: [
    // תוכן
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      placeholder: 'שאלות נפוצות',
      default: 'שאלות נפוצות',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      placeholder: 'מצאו תשובות לשאלות הנפוצות ביותר',
      default: 'מצאו תשובות לשאלות הנפוצות ביותר',
      group: 'content'
    }),

    // עיצוב
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב',
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#ffffff',
      group: 'style'
    })
  ],
  blocks: [
    {
      type: 'faq_item',
      name: 'שאלה ותשובה',
      settings: [
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'question',
          label: 'השאלה',
          placeholder: 'מה זמני המשלוח?',
          default: 'מה זמני המשלוח?'
        }),
        createSetting({
          type: SETTING_TYPES.TEXTAREA,
          id: 'answer',
          label: 'התשובה',
          placeholder: 'אנחנו שולחים תוך 2-3 ימי עסקים...',
          default: 'אנחנו שולחים תוך 2-3 ימי עסקים לכל הארץ'
        })
      ]
    }
  ],
  max_blocks: 15,
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      title: 'שאלות נפוצות',
      description: 'מצאו תשובות לשאלות הנפוצות ביותר',
      background_color: '#ffffff'
    },
    blocks: [
      {
        type: 'faq_item',
        settings: {
          question: 'מה זמני המשלוח?',
          answer: 'אנחנו שולחים תוך 2-3 ימי עסקים לכל הארץ. משלוח חינם על הזמנות מעל ₪200.'
        }
      },
      {
        type: 'faq_item',
        settings: {
          question: 'איך אפשר להחזיר מוצר?',
          answer: 'ניתן להחזיר מוצרים תוך 14 יום מקבלת ההזמנה. המוצר צריך להיות במצב חדש ובאריזה המקורית.'
        }
      }
    ]
  }]
});

// Features Section
export const featuresSection = createSectionSchema({
  id: 'features',
  name: 'תכונות המוצר',
  category: SECTION_CATEGORIES.CONTENT,
  icon: Award,
  description: 'הצגת תכונות ויתרונות מרכזיים',
  settings: [
    // תוכן
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'תוכן',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXT,
      id: 'title',
      label: 'כותרת ראשית',
      placeholder: 'היתרונות שלנו',
      default: 'היתרונות שלנו',
      group: 'content'
    }),
    createSetting({
      type: SETTING_TYPES.TEXTAREA,
      id: 'description',
      label: 'תיאור',
      placeholder: 'גלו מה הופך אותנו למיוחדים ולמובילים בתחום',
      default: 'גלו מה הופך אותנו למיוחדים ולמובילים בתחום',
      group: 'content'
    }),

    // פריסה
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'פריסה',
      group: 'layout'
    }),
    createSetting({
      type: SETTING_TYPES.SELECT,
      id: 'columns_desktop',
      label: 'עמודות בדסקטופ',
      options: [
        { value: '2', label: '2 עמודות' },
        { value: '3', label: '3 עמודות' },
        { value: '4', label: '4 עמודות' }
      ],
      default: '3',
      group: 'layout'
    }),

    // עיצוב
    createSetting({
      type: SETTING_TYPES.HEADER,
      label: 'עיצוב',
      group: 'style'
    }),
    createSetting({
      type: SETTING_TYPES.COLOR,
      id: 'background_color',
      label: 'צבע רקע',
      default: '#ffffff',
      group: 'style'
    })
  ],
  blocks: [
    {
      type: 'feature',
      name: 'תכונה',
      settings: [
        createSetting({
          type: SETTING_TYPES.ICON_PICKER,
          id: 'icon',
          label: 'אייקון',
          default: 'check-circle'
        }),
        createSetting({
          type: SETTING_TYPES.TEXT,
          id: 'title',
          label: 'כותרת',
          placeholder: 'איכות מעולה',
          default: 'איכות מעולה'
        }),
        createSetting({
          type: SETTING_TYPES.TEXTAREA,
          id: 'description',
          label: 'תיאור',
          placeholder: 'מוצרים איכותיים עם אחריות מלאה',
          default: 'מוצרים איכותיים עם אחריות מלאה'
        })
      ]
    }
  ],
  max_blocks: 8,
  presets: [{
    name: 'ברירת מחדל',
    settings: {
      title: 'היתרונות שלנו',
      description: 'גלו מה הופך אותנו למיוחדים ולמובילים בתחום',
      columns_desktop: '3',
      background_color: '#ffffff'
    },
    blocks: [
      {
        type: 'feature',
        settings: {
          icon: 'shield',
          title: 'איכות מובטחת',
          description: 'כל המוצרים שלנו עוברים בדיקות איכות קפדניות'
        }
      },
      {
        type: 'feature',
        settings: {
          icon: 'truck',
          title: 'משלוח מהיר',
          description: 'משלוח תוך 2-3 ימי עסקים לכל הארץ'
        }
      },
      {
        type: 'feature',
        settings: {
          icon: 'heart',
          title: 'שירות אישי',
          description: 'צוות מקצועי לשירותכם 24/7'
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
  footerSection,
  // סקשנים חדשים
  testimonialsSection,
  faqSection,
  featuresSection
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
  footerSection,
  // סקשנים חדשים
  testimonialsSection,
  faqSection,
  featuresSection
};

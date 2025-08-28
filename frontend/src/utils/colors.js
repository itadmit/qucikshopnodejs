// פלטת הצבעים של המערכת
// מבוססת על עיצוב מודרני ונקי בסגנון Shopify

export const colors = {
  // צבעי יסוד
  primary: {
    50: '#d1eefd',   // כחול בהיר
    100: '#a3ddfa',
    200: '#75ccf7',
    300: '#47bbf4',
    400: '#1aa9f1',
    500: '#0891d1',  // כחול ראשי
    600: '#0674a7',
    700: '#04577d',
    800: '#023a53',
    900: '#001d29'
  },

  // צבעי סטטוס
  success: {
    50: '#e7f7e7',   // ירוק בהיר (מותאם למשפחת הצבעים)
    100: '#c3efc3',
    200: '#9fe79f',
    300: '#7bdf7b',
    400: '#57d757',
    500: '#33cf33',  // ירוק ראשי
    600: '#29a329',
    700: '#1f771f',
    800: '#154b15',
    900: '#0b1f0b'
  },

  warning: {
    50: '#fbefcc',   // צהוב
    100: '#f7dfaa',
    200: '#f3cf88',
    300: '#efbf66',
    400: '#ebaf44',
    500: '#e79f22',  // צהוב ראשי
    600: '#b97f1b',
    700: '#8b5f14',
    800: '#5d3f0d',
    900: '#2f1f06'
  },

  error: {
    50: '#fdacae',   // אדום
    100: '#fc9295',
    200: '#fb787c',
    300: '#fa5e63',
    400: '#f9444a',
    500: '#f82a31',  // אדום ראשי
    600: '#c62227',
    700: '#941a1d',
    800: '#621113',
    900: '#310909'
  },

  info: {
    50: '#d1eefd',   // כחול (זהה לצבע הראשי)
    100: '#a3ddfa',
    200: '#75ccf7',
    300: '#47bbf4',
    400: '#1aa9f1',
    500: '#0891d1',
    600: '#0674a7',
    700: '#04577d',
    800: '#023a53',
    900: '#001d29'
  },

  // צבעי מיוחדים
  purple: {
    50: '#e7cdff',   // סגול הצלחה
    100: '#d9b3ff',
    200: '#cb99ff',
    300: '#bd7fff',
    400: '#af65ff',
    500: '#a14bff',  // סגול ראשי
    600: '#813ccc',
    700: '#612d99',
    800: '#411e66',
    900: '#200f33'
  },

  purpleAlt: {
    50: '#e2dff2',   // סגול כשלון
    100: '#d1cceb',
    200: '#c0b9e4',
    300: '#afa6dd',
    400: '#9e93d6',
    500: '#8d80cf',  // סגול משני
    600: '#7166a5',
    700: '#554d7b',
    800: '#393351',
    900: '#1c1a28'
  },

  orange: {
    50: '#fee2d5',   // כתום
    100: '#fdd5c0',
    200: '#fcc8ab',
    300: '#fbbb96',
    400: '#faae81',
    500: '#f9a16c',  // כתום ראשי
    600: '#c78156',
    700: '#956141',
    800: '#63402b',
    900: '#322016'
  },

  // צבעי אפור
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  },

  // צבע אפור מיוחד מהרפרנס
  customGray: {
    50: '#f7f7f7',
    100: '#e9e9e9',  // האפור מהרפרנס
    200: '#d1d1d1',
    300: '#b9b9b9',
    400: '#a1a1a1',
    500: '#898989',
    600: '#6d6d6d',
    700: '#515151',
    800: '#353535',
    900: '#191919'
  }
};

// פונקציות עזר לצבעים
export const getStatusColor = (status, type = 'bg') => {
  const statusColors = {
    // סטטוסי הזמנות
    PENDING: type === 'bg' ? 'bg-warning-50 text-warning-700 border-warning-200' : 'text-warning-700',
    PROCESSING: type === 'bg' ? 'bg-info-50 text-info-700 border-info-200' : 'text-info-700',
    COMPLETED: type === 'bg' ? 'bg-success-50 text-success-700 border-success-200' : 'text-success-700',
    CANCELLED: type === 'bg' ? 'bg-error-50 text-error-700 border-error-200' : 'text-error-700',
    REFUNDED: type === 'bg' ? 'bg-customGray-100 text-customGray-700 border-customGray-200' : 'text-customGray-700',

    // סטטוסי תשלום
    PAID: type === 'bg' ? 'bg-success-50 text-success-700 border-success-200' : 'text-success-700',
    FAILED: type === 'bg' ? 'bg-error-50 text-error-700 border-error-200' : 'text-error-700',

    // סטטוסי משלוח
    UNFULFILLED: type === 'bg' ? 'bg-customGray-100 text-customGray-700 border-customGray-200' : 'text-customGray-700',
    PARTIALLY_FULFILLED: type === 'bg' ? 'bg-warning-50 text-warning-700 border-warning-200' : 'text-warning-700',
    FULFILLED: type === 'bg' ? 'bg-success-50 text-success-700 border-success-200' : 'text-success-700',

    // סטטוסי מוצרים
    ACTIVE: type === 'bg' ? 'bg-success-50 text-success-700 border-success-200' : 'text-success-700',
    DRAFT: type === 'bg' ? 'bg-customGray-100 text-customGray-700 border-customGray-200' : 'text-customGray-700',
    OUT_OF_STOCK: type === 'bg' ? 'bg-error-50 text-error-700 border-error-200' : 'text-error-700',
    ARCHIVED: type === 'bg' ? 'bg-warning-50 text-warning-700 border-warning-200' : 'text-warning-700'
  };

  return statusColors[status] || (type === 'bg' ? 'bg-customGray-100 text-customGray-700 border-customGray-200' : 'text-customGray-700');
};

// פונקציה לקבלת צבע לפי עדיפות
export const getPriorityColor = (priority) => {
  const priorityColors = {
    LOW: 'bg-success-50 text-success-700 border-success-200',
    MEDIUM: 'bg-warning-50 text-warning-700 border-warning-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    URGENT: 'bg-error-50 text-error-700 border-error-200'
  };

  return priorityColors[priority] || 'bg-customGray-100 text-customGray-700 border-customGray-200';
};

// פונקציה לקבלת צבע מלאי
export const getInventoryColor = (inventory) => {
  if (inventory === 0) {
    return 'bg-error-50 text-error-700 border-error-200';
  } else if (inventory < 10) {
    return 'bg-warning-50 text-warning-700 border-warning-200';
  } else {
    return 'bg-success-50 text-success-700 border-success-200';
  }
};

export default colors;

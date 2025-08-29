/**
 * 🎨 QuickShop Site Builder - Advanced Setting Types
 * מערכת סוגי הגדרות מתקדמת ומודולרית
 */

// סוגי הגדרות בסיסיים
export const BASIC_SETTING_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  RICHTEXT: 'richtext',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  COLOR: 'color',
  IMAGE: 'image',
  URL: 'url',
  RANGE: 'range',
  NUMBER: 'number',
  HEADER: 'header',
  PARAGRAPH: 'paragraph'
};

// סוגי הגדרות מתקדמים חדשים
export const ADVANCED_SETTING_TYPES = {
  FONT_PICKER: 'font_picker',
  COLLECTION_PICKER: 'collection_picker',
  PRODUCT_LIST: 'product_list',
  MENU_PICKER: 'menu_picker',
  VIDEO: 'video',
  RESPONSIVE_SELECT: 'responsive_select',
  RESPONSIVE_RANGE: 'responsive_range',
  ICON_PICKER: 'icon_picker',
  SHADOW_PICKER: 'shadow_picker',
  SPACING_PICKER: 'spacing_picker',
  ANIMATION_PICKER: 'animation_picker',
  CONDITIONAL_GROUP: 'conditional_group',
  BLOCK_LIST: 'block_list'
};

// כל סוגי ההגדרות
export const SETTING_TYPES = {
  ...BASIC_SETTING_TYPES,
  ...ADVANCED_SETTING_TYPES
};

// קבוצות הגדרות לוגיות
export const SETTING_GROUPS = {
  CONTENT: 'content',
  LAYOUT: 'layout', 
  STYLE: 'style',
  BEHAVIOR: 'behavior',
  ADVANCED: 'advanced'
};

// נקודות שבירה רספונסיביות
export const RESPONSIVE_BREAKPOINTS = {
  MOBILE: 'mobile',
  TABLET: 'tablet', 
  DESKTOP: 'desktop',
  DESKTOP_LARGE: 'desktop_large'
};

// הגדרות ברירת מחדל לנקודות שבירה
export const BREAKPOINT_CONFIG = {
  [RESPONSIVE_BREAKPOINTS.MOBILE]: {
    label: 'נייד',
    icon: 'Smartphone',
    maxWidth: 768
  },
  [RESPONSIVE_BREAKPOINTS.TABLET]: {
    label: 'טאבלט',
    icon: 'Tablet',
    minWidth: 769,
    maxWidth: 1024
  },
  [RESPONSIVE_BREAKPOINTS.DESKTOP]: {
    label: 'מחשב',
    icon: 'Monitor',
    minWidth: 1025,
    maxWidth: 1440
  },
  [RESPONSIVE_BREAKPOINTS.DESKTOP_LARGE]: {
    label: 'מחשב גדול',
    icon: 'MonitorSpeaker',
    minWidth: 1441
  }
};

// יוצר הגדרה בסיסית
export const createSetting = (config) => ({
  type: config.type,
  id: config.id,
  label: config.label,
  group: config.group || SETTING_GROUPS.CONTENT,
  default: config.default,
  info: config.info,
  placeholder: config.placeholder,
  options: config.options,
  min: config.min,
  max: config.max,
  step: config.step,
  unit: config.unit,
  conditional: config.conditional,
  responsive: config.responsive || false,
  required: config.required || false,
  validation: config.validation,
  helpText: config.helpText
});

// יוצר הגדרה רספונסיבית
export const createResponsiveSetting = (config) => ({
  ...createSetting(config),
  responsive: true,
  breakpoints: config.breakpoints || Object.keys(RESPONSIVE_BREAKPOINTS)
});

// יוצר קבוצת הגדרות
export const createSettingGroup = (config) => ({
  type: SETTING_TYPES.CONDITIONAL_GROUP,
  id: config.id,
  label: config.label,
  group: config.group || SETTING_GROUPS.CONTENT,
  collapsible: config.collapsible || false,
  collapsed: config.collapsed || false,
  conditional: config.conditional,
  settings: config.settings || []
});

// יוצר הגדרה מותנית
export const createConditionalSetting = (config) => ({
  ...createSetting(config),
  conditional: {
    setting: config.conditional.setting,
    operator: config.conditional.operator || 'equals',
    value: config.conditional.value
  }
});

// בדיקת תנאי הגדרה
export const checkSettingCondition = (conditional, allSettings) => {
  if (!conditional) return true;
  
  const { setting, operator = 'equals', value } = conditional;
  const settingValue = allSettings[setting];
  
  switch (operator) {
    case 'equals':
      return settingValue === value;
    case 'not_equals':
      return settingValue !== value;
    case 'in':
      return Array.isArray(value) && value.includes(settingValue);
    case 'not_in':
      return Array.isArray(value) && !value.includes(settingValue);
    case 'greater_than':
      return Number(settingValue) > Number(value);
    case 'less_than':
      return Number(settingValue) < Number(value);
    case 'exists':
      return settingValue !== undefined && settingValue !== null && settingValue !== '';
    case 'not_exists':
      return settingValue === undefined || settingValue === null || settingValue === '';
    default:
      return true;
  }
};

// ולידציה של הגדרה
export const validateSetting = (setting, value) => {
  if (setting.required && (!value || value === '')) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  if (setting.validation) {
    const { pattern, min, max, minLength, maxLength } = setting.validation;
    
    if (pattern && !new RegExp(pattern).test(value)) {
      return { isValid: false, error: 'פורמט לא תקין' };
    }
    
    if (min !== undefined && Number(value) < min) {
      return { isValid: false, error: `ערך מינימלי: ${min}` };
    }
    
    if (max !== undefined && Number(value) > max) {
      return { isValid: false, error: `ערך מקסימלי: ${max}` };
    }
    
    if (minLength !== undefined && String(value).length < minLength) {
      return { isValid: false, error: `אורך מינימלי: ${minLength} תווים` };
    }
    
    if (maxLength !== undefined && String(value).length > maxLength) {
      return { isValid: false, error: `אורך מקסימלי: ${maxLength} תווים` };
    }
  }
  
  return { isValid: true };
};

export default {
  SETTING_TYPES,
  SETTING_GROUPS,
  RESPONSIVE_BREAKPOINTS,
  BREAKPOINT_CONFIG,
  createSetting,
  createResponsiveSetting,
  createSettingGroup,
  createConditionalSetting,
  checkSettingCondition,
  validateSetting
};

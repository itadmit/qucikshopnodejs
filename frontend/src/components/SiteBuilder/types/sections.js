/**
 * 🎨 QuickShop Site Builder - Section Types & Schema
 * מערכת הסקשנים החדשה בהשראת שופיפיי ו-Minimog
 */

import { 
  SETTING_TYPES, 
  SETTING_GROUPS, 
  createSetting, 
  createResponsiveSetting, 
  createSettingGroup, 
  createConditionalSetting 
} from './settingTypes.js';

// קטגוריות הסקשנים מורחבות
export const SECTION_CATEGORIES = {
  HEADER: 'header',
  HERO: 'hero', 
  PRODUCTS: 'products',
  CONTENT: 'content',
  MARKETING: 'marketing',
  SOCIAL: 'social',
  FORMS: 'forms',
  MEDIA: 'media',
  FOOTER: 'footer'
};

// ייצוא סוגי הגדרות מהמודול החדש
export { SETTING_TYPES, SETTING_GROUPS };

// בסיס לכל סקשן
export const createSectionSchema = (config) => ({
  id: config.id,
  name: config.name,
  category: config.category,
  icon: config.icon,
  description: config.description,
  presets: config.presets || [],
  settings: config.settings || [],
  blocks: config.blocks || [],
  max_blocks: config.max_blocks,
  enabled_on: config.enabled_on || {
    templates: ['*']
  }
});

// ייצוא פונקציות יצירה מהמודול החדש
export { 
  createSetting, 
  createResponsiveSetting, 
  createSettingGroup, 
  createConditionalSetting 
} from './settingTypes.js';

// יוצר בלוק חדש
export const createBlock = (config) => ({
  type: config.type,
  name: config.name,
  settings: config.settings || []
});

export default {
  SECTION_CATEGORIES,
  SETTING_TYPES,
  createSectionSchema,
  createSetting,
  createBlock
};

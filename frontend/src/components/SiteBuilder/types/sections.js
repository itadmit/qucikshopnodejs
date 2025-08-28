/**
 * 🎨 QuickShop Site Builder - Section Types & Schema
 * מערכת הסקשנים החדשה בהשראת שופיפיי ו-Minimog
 */

// קטגוריות הסקשנים
export const SECTION_CATEGORIES = {
  HEADER: 'header',
  HERO: 'hero', 
  PRODUCTS: 'products',
  CONTENT: 'content',
  MARKETING: 'marketing',
  FOOTER: 'footer'
};

// סוגי הגדרות
export const SETTING_TYPES = {
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
  PARAGRAPH: 'paragraph',
  LINK_LIST: 'link_list',
  IMAGE_PICKER: 'image_picker'
};

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

// יוצר הגדרה חדשה
export const createSetting = (config) => ({
  type: config.type,
  id: config.id,
  label: config.label,
  default: config.default,
  info: config.info,
  options: config.options,
  min: config.min,
  max: config.max,
  step: config.step,
  unit: config.unit,
  placeholder: config.placeholder
});

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

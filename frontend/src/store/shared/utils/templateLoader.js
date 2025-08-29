/**
 * Template Loader - מנהל טעינת תבניות דינמי
 */

class TemplateLoader {
  constructor() {
    this.loadedTemplates = new Map();
    this.defaultTemplate = 'jupiter';
  }

  /**
   * טעינת תבנית באופן דינמי
   * @param {string} templateName - שם התבנית
   * @returns {Promise<Object>} - אובייקט התבנית
   */
  async loadTemplate(templateName) {
    // בדיקה אם התבנית כבר נטענה
    if (this.loadedTemplates.has(templateName)) {
      return this.loadedTemplates.get(templateName);
    }

    try {
      console.log(`🎨 Loading template: ${templateName}`);
      
      // טעינה מהשרת (אם קיים)
      let templateFromServer = null;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/templates/${templateName}`);
        if (response.ok) {
          templateFromServer = await response.json();
          console.log(`📡 Template ${templateName} loaded from server`);
        }
      } catch (serverError) {
        console.log(`⚠️ Could not load template from server, using local version:`, serverError.message);
      }
      
      // טעינה דינמית של התבנית המקומית
      const templateModule = await import(`../../templates/${templateName}/index.js`);
      const localTemplate = templateModule.default;
      
      // שילוב נתונים מהשרת עם התבנית המקומית
      const template = {
        ...localTemplate,
        ...(templateFromServer && {
          id: templateFromServer.id,
          version: templateFromServer.version,
          serverConfig: templateFromServer.config,
          metadata: {
            author: templateFromServer.author,
            thumbnail: templateFromServer.thumbnail,
            tags: templateFromServer.tags,
            category: templateFromServer.category,
            isPremium: templateFromServer.isPremium,
            price: templateFromServer.price
          }
        })
      };
      
      // וולידציה של התבנית
      this.validateTemplate(template);
      
      // שמירה בזיכרון לטעינה מהירה יותר בפעם הבאה
      this.loadedTemplates.set(templateName, template);
      
      console.log(`✅ Template ${templateName} loaded successfully`);
      return template;
      
    } catch (error) {
      console.error(`❌ Failed to load template ${templateName}:`, error);
      
      // fallback לתבנית ברירת מחדל
      if (templateName !== this.defaultTemplate) {
        console.log(`🔄 Falling back to default template: ${this.defaultTemplate}`);
        return this.loadTemplate(this.defaultTemplate);
      }
      
      throw new Error(`Failed to load template: ${templateName}`);
    }
  }

  /**
   * וולידציה של מבנה התבנית
   * @param {Object} template - אובייקט התבנית
   */
  validateTemplate(template) {
    const requiredFields = ['name', 'config', 'pages', 'components'];
    const requiredPages = ['HomePage', 'CategoryPage', 'ProductPage'];
    const requiredComponents = ['Header', 'Footer'];

    // בדיקת שדות חובה
    for (const field of requiredFields) {
      if (!template[field]) {
        throw new Error(`Template missing required field: ${field}`);
      }
    }

    // בדיקת דפים חובה
    for (const page of requiredPages) {
      if (!template.pages[page]) {
        throw new Error(`Template missing required page: ${page}`);
      }
    }

    // בדיקת קומפוננטים חובה
    for (const component of requiredComponents) {
      if (!template.components[component]) {
        throw new Error(`Template missing required component: ${component}`);
      }
    }
  }

  /**
   * קבלת רשימת תבניות זמינות
   * @returns {Promise<Array>} - רשימת תבניות
   */
  async getAvailableTemplates() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/templates`);
      if (response.ok) {
        const templates = await response.json();
        console.log(`📡 Loaded ${templates.length} templates from server`);
        return templates;
      } else {
        console.log('⚠️ Could not load templates from server, using local list');
        return this.getLocalTemplates();
      }
    } catch (error) {
      console.log('⚠️ Server not available, using local templates:', error.message);
      return this.getLocalTemplates();
    }
  }

  /**
   * קבלת רשימת תבניות מקומיות
   * @returns {Array} - רשימת תבניות מקומיות
   */
  getLocalTemplates() {
    return [
      {
        name: 'jupiter',
        displayName: 'Jupiter',
        description: 'תבנית מודרנית ונקייה עם עיצוב מינימליסטי',
        isPremium: false,
        category: 'מודרני',
        thumbnail: '/templates/jupiter-preview.svg',
        tags: ['עיצוב רספונסיבי', 'תמיכה ב-RTL', 'אנימציות חלקות', 'SEO מיטבי']
      }
    ];
  }

  /**
   * קבלת תבנית ברירת מחדל
   * @returns {string} - שם תבנית ברירת מחדל
   */
  getDefaultTemplate() {
    return this.defaultTemplate;
  }

  /**
   * ניקוי זיכרון התבניות
   */
  clearCache() {
    this.loadedTemplates.clear();
    console.log('🧹 Template cache cleared');
  }

  /**
   * טעינת תרגומים לתבנית
   * @param {string} templateName - שם התבנית
   * @param {string} locale - שפה (he/en)
   * @returns {Promise<Object>} - אובייקט התרגומים
   */
  async loadTemplateTranslations(templateName, locale = 'he') {
    try {
      const template = await this.loadTemplate(templateName);
      return template.translations[locale] || template.translations.he;
    } catch (error) {
      console.error(`Failed to load translations for ${templateName}:`, error);
      return {};
    }
  }
}

// יצירת instance יחיד (Singleton)
const templateLoader = new TemplateLoader();

export default templateLoader;

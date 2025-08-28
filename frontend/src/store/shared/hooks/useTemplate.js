import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import templateLoader from '../utils/templateLoader';

/**
 * Hook לניהול תבניות
 * @param {string} templateName - שם התבנית
 * @returns {Object} - אובייקט עם התבנית והמצב
 */
export const useTemplate = (templateName = 'jupiter') => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedTemplate = await templateLoader.loadTemplate(templateName);
        setTemplate(loadedTemplate);
        
        // טעינת תרגומים של התבנית
        const templateTranslations = await templateLoader.loadTemplateTranslations(
          templateName, 
          i18n.language
        );
        
        // הוספת תרגומי התבנית ל-i18n
        if (templateTranslations) {
          i18n.addResourceBundle(
            i18n.language, 
            `template_${templateName}`, 
            templateTranslations,
            true,
            true
          );
        }
        
      } catch (err) {
        console.error('Failed to load template:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateName, i18n]);

  return {
    template,
    loading,
    error,
    
    // Helper functions
    getPage: (pageName) => template?.pages[pageName],
    getComponent: (componentName) => template?.components[componentName],
    getConfig: () => template?.config,
    
    // Template utilities
    isLoaded: !!template,
    templateName: template?.name || templateName
  };
};

/**
 * Hook לקבלת רשימת תבניות זמינות
 * @returns {Object} - רשימת תבניות ופונקציות עזר
 */
export const useAvailableTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailableTemplates = async () => {
      try {
        setLoading(true);
        const availableTemplates = await templateLoader.getAvailableTemplates();
        
        // אם קיבלנו תבניות מהשרת, נשתמש בהן ישירות
        if (availableTemplates.length > 0 && availableTemplates[0].displayName) {
          setTemplates(availableTemplates);
        } else {
          // אחרת, נטען מידע על כל תבנית מקומית
          const templatesInfo = await Promise.all(
            availableTemplates.map(async (templateName) => {
              try {
                const template = await templateLoader.loadTemplate(typeof templateName === 'string' ? templateName : templateName.name);
                return {
                  name: template.name,
                  displayName: template.config.displayName,
                  description: template.config.description,
                  thumbnail: template.config.thumbnail,
                  isPremium: template.config.isPremium,
                  category: template.config.category,
                  features: template.config.features
                };
              } catch (error) {
                console.error(`Failed to load template info for ${templateName}:`, error);
                return null;
              }
            })
          );
          
          setTemplates(templatesInfo.filter(Boolean));
        }
      } catch (error) {
        console.error('Failed to load available templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableTemplates();
  }, []);

  return {
    templates,
    loading,
    defaultTemplate: templateLoader.getDefaultTemplate()
  };
};

export default useTemplate;

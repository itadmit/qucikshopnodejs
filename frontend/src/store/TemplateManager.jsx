import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTemplate } from './shared/hooks/useTemplate';

// Import core pages (שלא משתנים)
import CartPage from './core/pages/CartPage';
import CheckoutPage from './core/pages/CheckoutPage';
import ThankYouPage from './core/pages/ThankYouPage';

// Import shared components
import ProductRenderer from './shared/components/ProductRenderer';
import PageRenderer from './shared/components/PageRenderer';
import SectionRenderer from '../components/SiteBuilder/components/SectionRenderer.jsx';
import { getSectionById } from '../components/SiteBuilder/sections/index.js';

/**
 * Template Manager - מנהל הצגת תבניות
 * @param {Object} props - Props
 * @param {string} props.templateName - שם התבנית
 * @param {Object} props.storeData - נתוני החנות
 */
const TemplateManager = ({ templateName = 'jupiter', storeData }) => {
  const { template, loading, error, getPage, getComponent } = useTemplate(templateName);
  const location = useLocation();
  const [customPages, setCustomPages] = useState({});
  const [globalSettings, setGlobalSettings] = useState({ header: null, footer: null });
  const [loadingCustomPages, setLoadingCustomPages] = useState(true);

  // טעינת עמודים מותאמים אישית והגדרות גלובליות
  useEffect(() => {

    if (storeData?.slug) {
      loadCustomPages();
      loadGlobalSettings();
    }
  }, [storeData?.slug]);

  const loadCustomPages = async () => {
    try {
      console.log('📄 Loading custom pages...');
      setLoadingCustomPages(true);
      
      // טעינת כל סוגי העמודים
      const pageTypes = ['home', 'product', 'category', 'content'];
      const customPagesData = {};
      
      for (const pageType of pageTypes) {
        try {
          const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
          const response = await fetch(`${baseUrl}/custom-pages/${storeData.slug}/${pageType}`);
          if (response.ok) {
            const pageData = await response.json();
            customPagesData[pageType] = pageData;
            console.log(`📄 Custom ${pageType} page loaded for ${storeData.slug}`);
          } else if (response.status === 404) {
            // אין עמוד מותאם - נשתמש בברירת מחדל
            console.log(`📄 No custom ${pageType} page, using default template`);
          }
        } catch (pageError) {
          console.log(`⚠️ Could not load custom ${pageType} page:`, pageError.message);
        }
      }
      
      setCustomPages(customPagesData);
      
    } catch (error) {
      console.error('Error loading custom pages:', error);
    } finally {
      console.log('✅ Custom pages loading completed');
      setLoadingCustomPages(false);
    }
  };

  // טעינת הגדרות גלובליות (הדר ופוטר)
  const loadGlobalSettings = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      
      // טעינת הדר ופוטר במקביל
      const [headerResponse, footerResponse, menusResponse] = await Promise.all([
        fetch(`${baseUrl}/global-settings/${storeData.slug}/header`),
        fetch(`${baseUrl}/global-settings/${storeData.slug}/footer`),
        fetch(`${baseUrl}/menus/${storeData.slug}`)
      ]);

      const globalData = {};

      if (headerResponse.ok) {
        const headerData = await headerResponse.json();
        globalData.header = headerData;
        console.log('🎯 Global header loaded:', headerData);
      }

      if (footerResponse.ok) {
        const footerData = await footerResponse.json();
        globalData.footer = footerData;
        console.log('🎯 Global footer loaded:', footerData);
      }

      // טעינת תפריטים
      if (menusResponse.ok) {
        const menusData = await menusResponse.json();
        globalData.menus = menusData;
        console.log('🎯 Global menus loaded:', menusData);
        
        // חיבור התפריטים להגדרות הדר והפוטר
        if (globalData.header && globalData.header.settings?.navigation?.menuHandle) {
          const mainMenu = menusData.find(menu => menu.handle === globalData.header.settings.navigation.menuHandle);
          if (mainMenu) {
            globalData.header.menu = mainMenu;
            console.log('🔗 Main menu connected to header:', mainMenu);
          }
        }
        
        if (globalData.footer && globalData.footer.settings?.menus) {
          globalData.footer.settings.menus.forEach(menuConfig => {
            const footerMenu = menusData.find(menu => menu.handle === menuConfig.menuHandle);
            if (footerMenu) {
              menuConfig.menu = footerMenu;
              console.log('🔗 Footer menu connected:', footerMenu);
            }
          });
        }
      }

      setGlobalSettings(globalData);
      
    } catch (error) {
      console.error('Error loading global settings:', error);
    }
  };

  // פונקציה לקבלת עמוד מותאם או ברירת מחדל
  const getCustomPageOrDefault = (pageType, defaultComponent) => {
    const customPage = customPages[pageType];
    
    if (customPage && customPage.isPublished) {
      // יש עמוד מותאם פרסום - נציג אותו
      console.log(`✅ Using custom ${pageType} page:`, customPage);
      return (props) => (
        <PageRenderer 
          pageStructure={customPage.structure}
          storeData={storeData}
          isLoading={loadingCustomPages}
          {...props}
        />
      );
    }
    
    // עבור דף הבית - אם אין עמוד מותאם, נציג הודעה לבנות דף
    if (pageType === 'home') {
      return (props) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-tools-line text-4xl text-blue-600"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">דף הבית לא נבנה עדיין</h1>
            <p className="text-gray-600 mb-6">
              כדי להציג את החנות, צריך לבנות את דף הבית בבילדר
            </p>
            <a 
              href="https://my-quickshop.com/dashboard/design"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              בנה דף בית בבילדר
            </a>
          </div>
        </div>
      );
    }
    
    // עבור דפים אחרים - נציג ברירת מחדל
    return defaultComponent;
  };

  // Loading state
  if (loading || loadingCustomPages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">טוען תבנית...</p>
          <p className="text-gray-500 text-sm mt-2">תבנית: {templateName}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-red-600">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">שגיאה בטעינת התבנית</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // Get template components or use custom global settings
  const Header = globalSettings.header ? 
    () => <SectionRenderer 
      section={{
        id: 'global-header',
        type: 'header',
        settings: globalSettings.header.settings || {},
        blocks: globalSettings.header.blocks || []
      }}
      sectionSchema={getSectionById('header')}
      storeData={storeData} 
      isPreview={true} 
    /> :
    getComponent('Header');
  
  const Footer = globalSettings.footer ? 
    () => <SectionRenderer 
      section={{
        id: 'global-footer',
        type: 'footer',
        settings: globalSettings.footer.settings || {},
        blocks: globalSettings.footer.blocks || []
      }}
      sectionSchema={getSectionById('footer')} 
      storeData={storeData} 
      isPreview={true} 
    /> :
    getComponent('Footer');
  
  // Get pages - custom or default
  const HomePage = getCustomPageOrDefault('home', getPage('HomePage'));
  const CategoryPage = getCustomPageOrDefault('category', getPage('CategoryPage'));
  const ProductPage = getCustomPageOrDefault('product', getPage('ProductPage'));
  const CollectionsPage = getPage('CollectionsPage');
  const ProductsPage = getPage('ProductsPage');

  // Debug logging
  console.log('🔍 Template Manager Debug:', {
    templateName,
    hasTemplate: !!template,
    availablePages: template?.pages ? Object.keys(template.pages) : [],
    CollectionsPage: !!CollectionsPage,
    ProductsPage: !!ProductsPage
  });

  // Apply template class for styling
  const templateClass = `store-template-${template.name}`;

  return (
    <div className={`min-h-screen storefront-content ${templateClass}`}>
      {/* Header - מהתבנית */}
      {Header && <Header storeData={storeData} />}
      
      <main className="flex-1">
        <Routes>
          {/* דפי התבנית */}
          <Route 
            path="/" 
            element={HomePage ? <HomePage storeData={storeData} /> : <div>דף הבית לא זמין</div>} 
          />
          <Route 
            path="/collections" 
            element={CollectionsPage ? <CollectionsPage storeData={storeData} /> : (
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-red-600">⚠️</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-4">דף קולקציות לא זמין</h1>
                  <p className="text-gray-600 mb-6">
                    הדף עדיין לא נטען נכון. בדוק את הקונסול לפרטים נוספים.
                  </p>
                  <div className="text-left bg-gray-100 p-4 rounded-lg text-sm">
                    <p>Debug Info:</p>
                    <p>Template: {templateName}</p>
                    <p>CollectionsPage: {CollectionsPage ? 'Found' : 'Not Found'}</p>
                    <p>Available Pages: {template?.pages ? Object.keys(template.pages).join(', ') : 'None'}</p>
                  </div>
                </div>
              </div>
            )} 
          />
          <Route 
            path="/products" 
            element={ProductsPage ? <ProductsPage storeData={storeData} /> : (
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-red-600">⚠️</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-4">דף מוצרים לא זמין</h1>
                  <p className="text-gray-600 mb-6">
                    הדף עדיין לא נטען נכון. בדוק את הקונסול לפרטים נוספים.
                  </p>
                  <div className="text-left bg-gray-100 p-4 rounded-lg text-sm">
                    <p>Debug Info:</p>
                    <p>Template: {templateName}</p>
                    <p>ProductsPage: {ProductsPage ? 'Found' : 'Not Found'}</p>
                    <p>Available Pages: {template?.pages ? Object.keys(template.pages).join(', ') : 'None'}</p>
                  </div>
                </div>
              </div>
            )} 
          />
          <Route 
            path="/categories/:slug" 
            element={CategoryPage ? <CategoryPage storeData={storeData} /> : <div>דף קטגוריה לא זמין</div>} 
          />
          <Route 
            path="/products/:slug" 
            element={ProductPage ? <ProductPage storeData={storeData} /> : <div>דף מוצר לא זמין</div>} 
          />
          
          {/* דפים קבועים - לא משתנים בין תבניות */}
          <Route path="/cart" element={<CartPage storeData={storeData} />} />
          <Route path="/checkout" element={<CheckoutPage storeData={storeData} />} />
          <Route path="/thank-you/:orderId" element={<ThankYouPage storeData={storeData} />} />
          
          {/* 404 Page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-4">דף לא נמצא</h1>
                <p className="text-gray-600 mb-6">הדף שחיפשת לא קיים</p>
                <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                  חזור לעמוד הבית
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      
      {/* Footer - מהתבנית */}
      {Footer && <Footer storeData={storeData} />}
    </div>
  );
};

export default TemplateManager;

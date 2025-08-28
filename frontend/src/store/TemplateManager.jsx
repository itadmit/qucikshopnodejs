import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTemplate } from './shared/hooks/useTemplate';

// Import core pages (שלא משתנים)
import CartPage from './core/pages/CartPage';
import CheckoutPage from './core/pages/CheckoutPage';
import ThankYouPage from './core/pages/ThankYouPage';

/**
 * Template Manager - מנהל הצגת תבניות
 * @param {Object} props - Props
 * @param {string} props.templateName - שם התבנית
 * @param {Object} props.storeData - נתוני החנות
 */
const TemplateManager = ({ templateName = 'jupiter', storeData }) => {
  const { template, loading, error, getPage, getComponent } = useTemplate(templateName);

  // Loading state
  if (loading) {
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

  // Get template components
  const Header = getComponent('Header');
  const Footer = getComponent('Footer');
  const HomePage = getPage('HomePage');
  const CategoryPage = getPage('CategoryPage');
  const ProductPage = getPage('ProductPage');

  // Apply template class for styling
  const templateClass = `store-template-${template.name}`;

  return (
    <div className={`min-h-screen ${templateClass}`}>
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

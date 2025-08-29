import React from 'react';
import CategorySelector from '../../components/CategorySelector.jsx';

const ProductSidebar = ({ 
  productData, 
  setProductData,
  selectedCategories,
  setSelectedCategories,
  isDraft,
  setIsDraft,
  htmlToPlainText
}) => {
  const renderSeoTab = () => {
    // Auto-fill SEO fields if empty
    const displaySeoTitle = productData.seoTitle || productData.name || '';
    const displaySeoDescription = productData.seoDescription || htmlToPlainText(productData.shortDescription || productData.description) || '';
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">כותרת SEO</label>
          <input
            type="text"
            value={productData.seoTitle}
            onChange={(e) => setProductData({ ...productData, seoTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={productData.name || "כותרת למנועי חיפוש"}
          />
          <p className="text-xs text-gray-500 mt-1">
            מומלץ עד 60 תווים • {displaySeoTitle.length}/60 תווים
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">תיאור SEO</label>
          <textarea
            value={productData.seoDescription}
            onChange={(e) => setProductData({ ...productData, seoDescription: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={htmlToPlainText(productData.shortDescription || productData.description) || "תיאור למנועי חיפוש"}
          />
          <p className="text-xs text-gray-500 mt-1">
            מומלץ עד 160 תווים • {!productData.seoDescription && (productData.shortDescription || productData.description) ? 
              'יוצג: ' + htmlToPlainText(productData.shortDescription || productData.description).substring(0, 50) + '...' : 
              `${displaySeoDescription.length}/160 תווים`}
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">תצוגה מקדימה בגוגל</h4>
          <div className="space-y-1">
            <div className="text-blue-600 text-sm hover:underline cursor-pointer">
              {displaySeoTitle || 'כותרת המוצר'}
            </div>
            <div className="text-green-700 text-xs">
              yourstore.com/products/{productData.name?.toLowerCase().replace(/\s+/g, '-') || 'product-name'}
            </div>
            <div className="text-gray-600 text-xs">
              {displaySeoDescription || 'תיאור המוצר יופיע כאן...'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">סטטוס</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מצב פרסום</label>
              <select
                value={isDraft ? 'draft' : 'published'}
                onChange={(e) => setIsDraft(e.target.value === 'draft')}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'left 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="published">פורסם</option>
                <option value="draft">טיוטה</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Organization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ארגון מוצר</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריות מוצר</label>
              <CategorySelector
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                placeholder="בחר קטגוריות למוצר..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מקט</label>
              <input
                type="text"
                value={productData.sku}
                onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SHIRT-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ספק</label>
              <input
                type="text"
                placeholder="ספק המוצר"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ברקוד</label>
              <input
                type="text"
                placeholder="ברקוד המוצר"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">מוצר דיגיטלי</label>
                <p className="text-xs text-gray-500">מוצר שמועבר באופן דיגיטלי</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={productData.isDigital}
                  onChange={(e) => setProductData({ ...productData, isDigital: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">חייב במס</label>
                <p className="text-xs text-gray-500">המוצר כפוף למס מכירות</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={productData.taxable}
                  onChange={(e) => setProductData({ ...productData, taxable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">תגיות</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תגיות מוצר</label>
            <input
              type="text"
              value={productData.tags ? productData.tags.join(', ') : ''}
              onChange={(e) => {
                const tagsString = e.target.value;
                const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
                setProductData({ ...productData, tags: tagsArray });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="חולצה, כותנה, קיץ (מופרד בפסיקים)"
            />
            <p className="text-xs text-gray-500 mt-1">
              הפרד תגיות בפסיקים. התגיות עוזרות ללקוחות למצוא את המוצר
            </p>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">אופטימיזציה למנועי חיפוש</h3>
          {renderSeoTab()}
        </div>
      </div>
    </div>
  );
};

export default ProductSidebar;

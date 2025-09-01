import React from 'react';
import { Package, ShoppingBag, Layers } from 'lucide-react';
import { RichTextEditor } from '../../../ui/index.js';

// Helper function to generate slug from Hebrew text
const generateSlug = (text) => {
  if (!text) return '';
  
  // Hebrew to English transliteration map
  const hebrewToEnglish = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
    'ם': 'm', 'ן': 'n', 'נ': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f',
    'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
  };
  
  return text
    .toLowerCase()
    .split('')
    .map(char => hebrewToEnglish[char] || char)
    .join('')
    .replace(/[^a-z0-9\u0590-\u05FF]/g, '-') // Keep Hebrew chars and replace others with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
};

const ProductBasicInfo = ({ 
  productType, 
  setProductType, 
  productData, 
  setProductData 
}) => {
  const renderProductTypeSelection = () => (
    <div className="space-y-6">
      {/* Product Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">סוג מוצר</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            productType === 'SIMPLE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="productType"
              value="SIMPLE"
              checked={productType === 'SIMPLE'}
              onChange={(e) => setProductType(e.target.value)}
              className="sr-only"
            />
            <Package className="w-5 h-5 text-blue-600 ml-3" />
            <div>
              <div className="font-medium text-gray-900">מוצר פשוט</div>
              <div className="text-sm text-gray-500">מוצר בודד ללא וריאציות</div>
            </div>
          </label>

          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            productType === 'VARIABLE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="productType"
              value="VARIABLE"
              checked={productType === 'VARIABLE'}
              onChange={(e) => setProductType(e.target.value)}
              className="sr-only"
            />
            <ShoppingBag className="w-5 h-5 text-blue-600 ml-3" />
            <div>
              <div className="font-medium text-gray-900">מוצר עם וריאציות</div>
              <div className="text-sm text-gray-500">מידות, צבעים וכו'</div>
            </div>
          </label>

          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            productType === 'BUNDLE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="productType"
              value="BUNDLE"
              checked={productType === 'BUNDLE'}
              onChange={(e) => setProductType(e.target.value)}
              className="sr-only"
            />
            <Layers className="w-5 h-5 text-blue-600 ml-3" />
            <div>
              <div className="font-medium text-gray-900">בנדל</div>
              <div className="text-sm text-gray-500">חבילת מוצרים</div>
            </div>
          </label>
        </div>
      </div>

      {/* Basic Product Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">שם המוצר *</label>
          <input
            type="text"
            value={productData.name}
            onChange={(e) => {
              const newName = e.target.value;
              // Auto-generate slug from name if slug is empty or matches previous name
              const shouldUpdateSlug = !productData.slug || 
                productData.slug === generateSlug(productData.name);
              
              setProductData({ 
                ...productData, 
                name: newName,
                slug: shouldUpdateSlug ? generateSlug(newName) : productData.slug
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="חולצת טי קצרה"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (כתובת URL) *
            <span className="text-xs text-gray-500 mr-2">
              יופיע בכתובת: /products/{productData.slug || 'slug-המוצר'}
            </span>
          </label>
          <input
            type="text"
            value={productData.slug}
            onChange={(e) => setProductData({ ...productData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="חולצת-טי-קצרה"
            dir="ltr"
          />
          <div className="text-xs text-gray-500 mt-1">
            השתמש באותיות אנגליות, מספרים ומקפים בלבד. אל תשתמש ברווחים.
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            תיאור
            <span className="text-xs text-gray-500 mr-2">
              ({(productData.description || '').length}/50,000 תווים)
            </span>
          </label>
          <RichTextEditor
            value={productData.description}
            onChange={(content) => {
              if (content.length <= 50000) {
                setProductData({ ...productData, description: content });
              } else {
                alert('תיאור המוצר ארוך מדי. מקסימום 50,000 תווים מותר.');
              }
            }}
            placeholder="תיאור המוצר..."
            minHeight="150px"
            maxHeight="300px"
          />
          {(productData.description || '').length > 45000 && (
            <div className="text-sm text-orange-600 mt-1">
              ⚠️ התיאור מתקרב לגבול המקסימלי
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return renderProductTypeSelection();
};

export default ProductBasicInfo;

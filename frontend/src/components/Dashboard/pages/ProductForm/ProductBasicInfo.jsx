import React from 'react';
import { Package, ShoppingBag, Layers } from 'lucide-react';
import { RichTextEditor } from '../../../ui/index.js';

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
            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="חולצת טי קצרה"
          />
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

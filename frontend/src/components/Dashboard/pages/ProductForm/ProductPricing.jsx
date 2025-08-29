import React from 'react';
import { DollarSign, Package, Truck } from 'lucide-react';

const ProductPricing = ({ productData, setProductData }) => {
  return (
    <div className="space-y-6">
      {/* Pricing */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 ml-2" />
          תמחור
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מחיר *</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₪</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מחיר לפני הנחה</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={productData.comparePrice}
                onChange={(e) => setProductData({ ...productData, comparePrice: e.target.value })}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₪</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מחיר עלות</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={productData.costPrice}
                onChange={(e) => setProductData({ ...productData, costPrice: e.target.value })}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Package className="w-5 h-5 ml-2" />
          מלאי
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">מעקב מלאי</label>
              <p className="text-xs text-gray-500">עקוב אחר כמות המלאי של המוצר</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productData.trackInventory}
                onChange={(e) => setProductData({ ...productData, trackInventory: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {productData.trackInventory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">כמות במלאי</label>
                <input
                  type="number"
                  value={productData.inventoryQuantity}
                  onChange={(e) => setProductData({ ...productData, inventoryQuantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">רמת מלאי נמוכה</label>
                <input
                  type="number"
                  value={productData.lowStockThreshold}
                  onChange={(e) => setProductData({ ...productData, lowStockThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">אפשר הזמנה כשאין במלאי</label>
              <p className="text-xs text-gray-500">לקוחות יוכלו להזמין גם כשהמוצר אזל</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productData.allowBackorder}
                onChange={(e) => setProductData({ ...productData, allowBackorder: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Truck className="w-5 h-5 ml-2" />
          משלוח
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">דרוש משלוח</label>
              <p className="text-xs text-gray-500">המוצר דורש משלוח פיזי</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productData.requiresShipping}
                onChange={(e) => setProductData({ ...productData, requiresShipping: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {productData.requiresShipping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">משקל</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={productData.weight}
                    onChange={(e) => setProductData({ ...productData, weight: e.target.value })}
                    className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">ק"ג</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">מידות (ס"מ)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={productData.dimensions?.length || ''}
                    onChange={(e) => setProductData({ 
                      ...productData, 
                      dimensions: { ...productData.dimensions, length: e.target.value }
                    })}
                    className="w-full px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="אורך"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={productData.dimensions?.width || ''}
                    onChange={(e) => setProductData({ 
                      ...productData, 
                      dimensions: { ...productData.dimensions, width: e.target.value }
                    })}
                    className="w-full px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="רוחב"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={productData.dimensions?.height || ''}
                    onChange={(e) => setProductData({ 
                      ...productData, 
                      dimensions: { ...productData.dimensions, height: e.target.value }
                    })}
                    className="w-full px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="גובה"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductPricing;

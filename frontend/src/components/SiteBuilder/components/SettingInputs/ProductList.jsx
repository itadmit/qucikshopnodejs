/**
 * 🛒 Product List Component
 * בחירה ידנית של מוצרים ספציפיים עם גרירה וסידור
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Search, 
  Plus, 
  X, 
  GripVertical, 
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';
import { productsApi } from '../../../../services/builderApi';

const ProductList = ({ 
  value = [], 
  onChange, 
  maxProducts = 12,
  showImages = true,
  showPrices = true,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // טעינת מוצרים נבחרים בהתחלה
  useEffect(() => {
    const loadSelectedProducts = async () => {
      if (!value || value.length === 0) {
        setSelectedProducts([]);
        return;
      }

      setLoading(true);
      try {
        const storeSlug = localStorage.getItem('currentStore');
        if (!storeSlug) return;

        const productPromises = value.map(productId => 
          productsApi.getById(storeSlug, productId)
        );
        
        const loadedProducts = await Promise.all(productPromises);
        setSelectedProducts(loadedProducts.filter(Boolean));
      } catch (error) {
        console.error('Failed to load selected products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSelectedProducts();
  }, [value]);

  // חיפוש מוצרים
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const storeSlug = localStorage.getItem('currentStore');
        if (!storeSlug) return;

        const response = await productsApi.search(storeSlug, searchQuery, {
          limit: 20
        });
        
        // סינון מוצרים שכבר נבחרו
        const filteredResults = response.products.filter(product => 
          !value.includes(product.id)
        );
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Failed to search products:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, value]);

  // הוספת מוצר
  const addProduct = (product) => {
    if (value.length >= maxProducts) {
      alert(`ניתן לבחור עד ${maxProducts} מוצרים`);
      return;
    }

    const newValue = [...value, product.id];
    onChange(newValue);
    setSelectedProducts([...selectedProducts, product]);
    setSearchQuery('');
    setShowSearch(false);
  };

  // הסרת מוצר
  const removeProduct = (productId) => {
    const newValue = value.filter(id => id !== productId);
    onChange(newValue);
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  // שינוי סדר מוצרים (פשוט - ללא drag & drop מורכב)
  const moveProduct = (fromIndex, toIndex) => {
    const newSelectedProducts = [...selectedProducts];
    const newValue = [...value];
    
    // החלפת מקומות
    [newSelectedProducts[fromIndex], newSelectedProducts[toIndex]] = 
    [newSelectedProducts[toIndex], newSelectedProducts[fromIndex]];
    
    [newValue[fromIndex], newValue[toIndex]] = 
    [newValue[toIndex], newValue[fromIndex]];
    
    setSelectedProducts(newSelectedProducts);
    onChange(newValue);
  };

  return (
    <div className={`product-list ${className}`}>
      {/* כותרת וכפתור הוספה */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">
          מוצרים נבחרים ({selectedProducts.length}/{maxProducts})
        </div>
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          disabled={value.length >= maxProducts}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          הוסף מוצר
        </button>
      </div>

      {/* רשימת מוצרים נבחרים */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2 mb-4">
          {selectedProducts.map((product, index) => (
            <div 
              key={product.id}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg"
            >
              {/* ידית גרירה */}
              <div className="flex flex-col gap-1 cursor-move text-gray-400">
                {index > 0 && (
                  <button
                    onClick={() => moveProduct(index, index - 1)}
                    className="hover:text-gray-600"
                  >
                    ↑
                  </button>
                )}
                <GripVertical className="w-4 h-4" />
                {index < selectedProducts.length - 1 && (
                  <button
                    onClick={() => moveProduct(index, index + 1)}
                    className="hover:text-gray-600"
                  >
                    ↓
                  </button>
                )}
              </div>

              {/* תמונת מוצר */}
              {showImages && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              )}

              {/* פרטי מוצר */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {product.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  SKU: {product.sku || 'לא הוגדר'}
                </div>
                {showPrices && product.price && (
                  <div className="text-sm font-medium text-green-600">
                    ₪{product.price}
                  </div>
                )}
              </div>

              {/* כפתור הסרה */}
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* חיפוש מוצרים */}
      {showSearch && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש מוצרים..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* תוצאות חיפוש */}
          {loading && (
            <div className="text-center py-4 text-gray-500">
              מחפש מוצרים...
            </div>
          )}

          {!loading && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              לא נמצאו מוצרים
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map(product => (
                <div 
                  key={product.id}
                  className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => addProduct(product)}
                >
                  {showImages && (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    {showPrices && product.price && (
                      <div className="text-sm text-green-600">
                        ₪{product.price}
                      </div>
                    )}
                  </div>
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* הודעה כשאין מוצרים */}
      {selectedProducts.length === 0 && !showSearch && (
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <div className="text-sm">לא נבחרו מוצרים</div>
          <div className="text-xs text-gray-400 mt-1">
            לחץ על "הוסף מוצר" כדי להתחיל
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

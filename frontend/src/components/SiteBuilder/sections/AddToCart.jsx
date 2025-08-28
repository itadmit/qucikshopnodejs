/**
 * Add to Cart Component - Simple version for product pages
 */
import React from 'react';
import { ShoppingCart } from 'lucide-react';

const AddToCart = ({ settings, product, quantity, onQuantityChange, onAddToCart }) => {
  const buttonText = settings?.button_text || 'הוסף לסל';
  const buttonSize = settings?.button_size || 'large';
  const buttonWidth = settings?.button_width || 'full';
  const showQuantity = settings?.show_quantity !== false;
  const showStockInfo = settings?.show_stock_info !== false;

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const widthClasses = {
    auto: 'w-auto',
    full: 'w-full'
  };

  const isOutOfStock = product?.inventory_quantity === 0;
  const isLowStock = product?.inventory_quantity > 0 && product?.inventory_quantity <= 5;

  return (
    <div className="mb-6">
      {showQuantity && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            כמות
          </label>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => onQuantityChange?.(Math.max(1, quantity - 1))}
              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{quantity || 1}</span>
            <button
              onClick={() => onQuantityChange?.((quantity || 1) + 1)}
              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      )}

      {showStockInfo && (
        <div className="mb-4">
          {isOutOfStock ? (
            <p className="text-red-600 text-sm">אזל מהמלאי</p>
          ) : isLowStock ? (
            <p className="text-orange-600 text-sm">נותרו רק {product.inventory_quantity} יחידות</p>
          ) : (
            <p className="text-green-600 text-sm">במלאי</p>
          )}
        </div>
      )}

      <button
        onClick={() => onAddToCart?.(product, quantity || 1)}
        disabled={isOutOfStock}
        className={`${sizeClasses[buttonSize]} ${widthClasses[buttonWidth]} bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 space-x-reverse`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span>{isOutOfStock ? 'אזל מהמלאי' : buttonText}</span>
      </button>
    </div>
  );
};

export default AddToCart;

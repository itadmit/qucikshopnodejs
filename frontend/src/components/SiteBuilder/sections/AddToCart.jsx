import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

const AddToCart = ({ settings = {}, product, quantity, onQuantityChange, onAddToCart }) => {
  const {
    button_text = 'הוסף לסל',
    button_size = 'large',
    button_style = 'primary',
    button_width = 'full',
    show_quantity = true,
    show_icon = true,
    icon_position = 'right',
    quantity_style = 'buttons',
    max_quantity = 10,
    button_color = '#3b82f6',
    button_text_color = '#ffffff',
    border_radius = 'rounded-md',
    show_stock_info = true,
    stock_text = 'במלאי - {count} יחידות',
    out_of_stock_text = 'אזל מהמלאי'
  } = settings;

  const [isAdding, setIsAdding] = useState(false);
  
  // Use product data if available, otherwise fallback to demo data
  const inStock = product?.inStock !== undefined ? product.inStock : true;
  const stockCount = product?.stockQuantity || 15;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= max_quantity && onQuantityChange) {
      onQuantityChange(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (onAddToCart) {
      setIsAdding(true);
      try {
        await onAddToCart(quantity);
        // Dispatch event to open side cart
        window.dispatchEvent(new CustomEvent('openSideCart'));
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAdding(false);
      }
    } else {
      // Fallback for demo
      setIsAdding(true);
      setTimeout(() => {
        setIsAdding(false);
        alert(`נוסף לסל: ${quantity} יחידות`);
        // Dispatch event to open side cart
        window.dispatchEvent(new CustomEvent('openSideCart'));
      }, 1000);
    }
  };

  const getSizeClasses = () => {
    switch (button_size) {
      case 'small': return 'px-4 py-2 text-sm';
      case 'medium': return 'px-6 py-3 text-base';
      case 'large': return 'px-8 py-4 text-lg';
      default: return 'px-6 py-3 text-base';
    }
  };

  const getWidthClasses = () => {
    switch (button_width) {
      case 'auto': return 'w-auto';
      case 'half': return 'w-1/2';
      case 'full': return 'w-full';
      default: return 'w-full';
    }
  };

  const getButtonStyle = () => {
    if (button_style === 'custom') {
      return {
        backgroundColor: button_color,
        color: button_text_color,
        border: 'none'
      };
    }
    
    const styles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300',
      outline: 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600'
    };
    
    return { className: styles[button_style] || styles.primary };
  };

  const renderQuantitySelector = () => {
    if (!show_quantity) return null;

    if (quantity_style === 'buttons') {
      return (
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <span className="text-sm font-medium text-gray-700">כמות:</span>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 min-w-[3rem] text-center">{quantity || 1}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= max_quantity}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    if (quantity_style === 'input') {
      return (
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <label className="text-sm font-medium text-gray-700">כמות:</label>
          <input
            type="number"
            min="1"
            max={max_quantity}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    return null;
  };

  const renderStockInfo = () => {
    if (!show_stock_info) return null;

    return (
      <div className="mb-4">
        {inStock ? (
          <span className="text-sm text-green-600">
            {stock_text.replace('{count}', stockCount)}
          </span>
        ) : (
          <span className="text-sm text-red-600">
            {out_of_stock_text}
          </span>
        )}
      </div>
    );
  };

  const buttonStyleProps = getButtonStyle();
  const buttonClasses = `${getSizeClasses()} ${getWidthClasses()} ${border_radius} font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse ${buttonStyleProps.className || ''}`;

  return (
    <div className="space-y-4">
      {renderStockInfo()}
      {renderQuantitySelector()}
      
      <button
        onClick={handleAddToCart}
        disabled={!inStock || isAdding}
        className={buttonClasses}
        style={buttonStyleProps.className ? {} : buttonStyleProps}
      >
        {isAdding ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>מוסיף לסל...</span>
          </>
        ) : (
          <>
            {show_icon && icon_position === 'right' && <ShoppingCart className="w-5 h-5" />}
            <span>{inStock ? button_text : out_of_stock_text}</span>
            {show_icon && icon_position === 'left' && <ShoppingCart className="w-5 h-5" />}
          </>
        )}
      </button>
    </div>
  );
};

AddToCart.schema = {
  name: 'הוספה לסל',
  category: 'product',
  icon: 'ShoppingCart',
  schema: {
    settings: [
      {
        type: 'header',
        content: 'הגדרות כפתור'
      },
      {
        type: 'text',
        id: 'button_text',
        label: 'טקסט כפתור',
        default: 'הוסף לסל'
      },
      {
        type: 'select',
        id: 'button_size',
        label: 'גודל כפתור',
        options: [
          { value: 'small', label: 'קטן' },
          { value: 'medium', label: 'בינוני' },
          { value: 'large', label: 'גדול' }
        ],
        default: 'large'
      },
      {
        type: 'select',
        id: 'button_width',
        label: 'רוחב כפתור',
        options: [
          { value: 'auto', label: 'אוטומטי' },
          { value: 'half', label: 'חצי רוחב' },
          { value: 'full', label: 'רוחב מלא' }
        ],
        default: 'full'
      },
      {
        type: 'select',
        id: 'button_style',
        label: 'סגנון כפתור',
        options: [
          { value: 'primary', label: 'ראשי' },
          { value: 'secondary', label: 'משני' },
          { value: 'outline', label: 'מתאר' },
          { value: 'custom', label: 'מותאם אישית' }
        ],
        default: 'primary'
      },
      {
        type: 'color',
        id: 'button_color',
        label: 'צבע כפתור',
        default: '#3b82f6'
      },
      {
        type: 'color',
        id: 'button_text_color',
        label: 'צבע טקסט',
        default: '#ffffff'
      },
      {
        type: 'select',
        id: 'border_radius',
        label: 'עיגול פינות',
        options: [
          { value: 'rounded-none', label: 'ללא' },
          { value: 'rounded-sm', label: 'קטן' },
          { value: 'rounded-md', label: 'בינוני' },
          { value: 'rounded-lg', label: 'גדול' },
          { value: 'rounded-full', label: 'עגול לחלוטין' }
        ],
        default: 'rounded-md'
      },
      {
        type: 'header',
        content: 'אייקון'
      },
      {
        type: 'checkbox',
        id: 'show_icon',
        label: 'הצג אייקון',
        default: true
      },
      {
        type: 'select',
        id: 'icon_position',
        label: 'מיקום אייקון',
        options: [
          { value: 'right', label: 'ימין' },
          { value: 'left', label: 'שמאל' }
        ],
        default: 'right'
      },
      {
        type: 'header',
        content: 'כמות'
      },
      {
        type: 'checkbox',
        id: 'show_quantity',
        label: 'הצג בחירת כמות',
        default: true
      },
      {
        type: 'select',
        id: 'quantity_style',
        label: 'סגנון בחירת כמות',
        options: [
          { value: 'buttons', label: 'כפתורים' },
          { value: 'input', label: 'שדה קלט' }
        ],
        default: 'buttons'
      },
      {
        type: 'number',
        id: 'max_quantity',
        label: 'כמות מקסימלית',
        default: 10
      },
      {
        type: 'header',
        content: 'מידע מלאי'
      },
      {
        type: 'checkbox',
        id: 'show_stock_info',
        label: 'הצג מידע מלאי',
        default: true
      },
      {
        type: 'text',
        id: 'stock_text',
        label: 'טקסט במלאי',
        default: 'במלאי - {count} יחידות'
      },
      {
        type: 'text',
        id: 'out_of_stock_text',
        label: 'טקסט אזל מהמלאי',
        default: 'אזל מהמלאי'
      }
    ]
  }
};

export default AddToCart; 
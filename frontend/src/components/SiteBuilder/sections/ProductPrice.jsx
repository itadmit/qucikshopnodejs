import React from 'react';

const ProductPrice = ({ settings = {}, product }) => {
  const {
    show_compare_price = true,
    show_currency = true,
    price_size = 'text-2xl',
    price_weight = 'font-bold',
    price_color = '#000000',
    compare_price_size = 'text-lg',
    compare_price_color = '#999999',
    currency_position = 'after',
    alignment = 'text-right',
    show_sale_badge = true,
    sale_badge_text = 'מבצע',
    sale_badge_color = '#ef4444'
  } = settings;

  // Use product data if available, otherwise fallback to demo data
  const currentPrice = product?.price || 89.90;
  const comparePrice = product?.originalPrice || product?.comparePrice || 120.00;
  const currency = '₪';
  const isOnSale = comparePrice > currentPrice;

  const renderPrice = (price, isCompare = false) => {
    const priceText = price.toFixed(2);
    const sizeClass = isCompare ? compare_price_size : price_size;
    const colorStyle = { color: isCompare ? compare_price_color : price_color };
    const weightClass = isCompare ? 'font-normal line-through' : price_weight;

    if (currency_position === 'before') {
      return (
        <span className={`${sizeClass} ${weightClass}`} style={colorStyle}>
          {show_currency && currency}{priceText}
        </span>
      );
    } else {
      return (
        <span className={`${sizeClass} ${weightClass}`} style={colorStyle}>
          {priceText}{show_currency && currency}
        </span>
      );
    }
  };

  return (
    <div className={`${alignment} space-y-2`}>
      <div className="flex items-center justify-end space-x-3 space-x-reverse">
        {renderPrice(currentPrice)}
        {show_compare_price && isOnSale && renderPrice(comparePrice, true)}
        {show_sale_badge && isOnSale && (
          <span 
            className="px-2 py-1 text-xs font-medium text-white rounded"
            style={{ backgroundColor: sale_badge_color }}
          >
            {sale_badge_text}
          </span>
        )}
      </div>
      {isOnSale && (
        <div className="text-sm text-green-600">
          חסכת {(comparePrice - currentPrice).toFixed(2)}₪ ({Math.round(((comparePrice - currentPrice) / comparePrice) * 100)}%)
        </div>
      )}
    </div>
  );
};

ProductPrice.schema = {
  name: 'מחיר מוצר',
  category: 'product',
  icon: 'DollarSign',
  schema: {
    settings: [
      {
        type: 'header',
        content: 'הגדרות מחיר'
      },
      {
        type: 'checkbox',
        id: 'show_compare_price',
        label: 'הצג מחיר השוואה',
        default: true
      },
      {
        type: 'checkbox',
        id: 'show_currency',
        label: 'הצג סמל מטבע',
        default: true
      },
      {
        type: 'select',
        id: 'currency_position',
        label: 'מיקום מטבע',
        options: [
          { value: 'before', label: 'לפני המחיר' },
          { value: 'after', label: 'אחרי המחיר' }
        ],
        default: 'after'
      },
      {
        type: 'select',
        id: 'price_size',
        label: 'גודל מחיר',
        options: [
          { value: 'text-lg', label: 'קטן' },
          { value: 'text-xl', label: 'בינוני' },
          { value: 'text-2xl', label: 'גדול' },
          { value: 'text-3xl', label: 'גדול מאוד' }
        ],
        default: 'text-2xl'
      },
      {
        type: 'select',
        id: 'price_weight',
        label: 'עובי מחיר',
        options: [
          { value: 'font-normal', label: 'רגיל' },
          { value: 'font-medium', label: 'בינוני' },
          { value: 'font-semibold', label: 'מודגש' },
          { value: 'font-bold', label: 'מודגש מאוד' }
        ],
        default: 'font-bold'
      },
      {
        type: 'color',
        id: 'price_color',
        label: 'צבע מחיר',
        default: '#000000'
      },
      {
        type: 'header',
        content: 'מחיר השוואה'
      },
      {
        type: 'select',
        id: 'compare_price_size',
        label: 'גודל מחיר השוואה',
        options: [
          { value: 'text-sm', label: 'קטן' },
          { value: 'text-base', label: 'בינוני' },
          { value: 'text-lg', label: 'גדול' }
        ],
        default: 'text-lg'
      },
      {
        type: 'color',
        id: 'compare_price_color',
        label: 'צבע מחיר השוואה',
        default: '#999999'
      },
      {
        type: 'header',
        content: 'תג מבצע'
      },
      {
        type: 'checkbox',
        id: 'show_sale_badge',
        label: 'הצג תג מבצע',
        default: true
      },
      {
        type: 'text',
        id: 'sale_badge_text',
        label: 'טקסט תג מבצע',
        default: 'מבצע'
      },
      {
        type: 'color',
        id: 'sale_badge_color',
        label: 'צבע תג מבצע',
        default: '#ef4444'
      },
      {
        type: 'header',
        content: 'פריסה'
      },
      {
        type: 'select',
        id: 'alignment',
        label: 'יישור',
        options: [
          { value: 'text-right', label: 'ימין' },
          { value: 'text-center', label: 'מרכז' },
          { value: 'text-left', label: 'שמאל' }
        ],
        default: 'text-right'
      }
    ]
  }
};

export default ProductPrice; 
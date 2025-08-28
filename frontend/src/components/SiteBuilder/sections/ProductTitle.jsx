import React from 'react';

const ProductTitle = ({ settings = {}, product }) => {
  const {
    show_vendor = true,
    title_size = 'text-3xl',
    title_weight = 'font-bold',
    title_color = '#000000',
    vendor_size = 'text-sm',
    vendor_color = '#666666',
    alignment = 'text-right'
  } = settings;

  // Use product data if available, otherwise fallback to demo data
  const productName = product?.name || 'חולצת יוגב';
  const vendorName = product?.vendor || 'יוגב סטור';

  return (
    <div className={`${alignment} space-y-2`}>
      {show_vendor && (
        <div className={`${vendor_size}`} style={{ color: vendor_color }}>
          {vendorName}
        </div>
      )}
      <h1 
        className={`${title_size} ${title_weight}`}
        style={{ color: title_color }}
      >
        {productName}
      </h1>
    </div>
  );
};

ProductTitle.schema = {
  name: 'כותרת מוצר',
  category: 'product',
  icon: 'Type',
  schema: {
    settings: [
      {
        type: 'header',
        content: 'הגדרות כותרת'
      },
      {
        type: 'checkbox',
        id: 'show_vendor',
        label: 'הצג שם ספק',
        default: true
      },
      {
        type: 'select',
        id: 'title_size',
        label: 'גודל כותרת',
        options: [
          { value: 'text-xl', label: 'קטן' },
          { value: 'text-xl', label: 'בינוני' },
          { value: 'text-3xl', label: 'גדול' },
          { value: 'text-4xl', label: 'גדול מאוד' }
        ],
        default: 'text-3xl'
      },
      {
        type: 'select',
        id: 'title_weight',
        label: 'עובי כותרת',
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
        id: 'title_color',
        label: 'צבע כותרת',
        default: '#000000'
      },
      {
        type: 'header',
        content: 'הגדרות ספק'
      },
      {
        type: 'select',
        id: 'vendor_size',
        label: 'גודל שם ספק',
        options: [
          { value: 'text-xs', label: 'קטן מאוד' },
          { value: 'text-sm', label: 'קטן' },
          { value: 'text-base', label: 'בינוני' }
        ],
        default: 'text-sm'
      },
      {
        type: 'color',
        id: 'vendor_color',
        label: 'צבע שם ספק',
        default: '#666666'
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

export default ProductTitle; 
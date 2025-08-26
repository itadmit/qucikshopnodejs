import React, { useState } from 'react';

const ProductOptions = ({ settings = {}, product, selectedOptions, onOptionChange }) => {
  const {
    show_labels = true,
    label_size = 'text-sm',
    label_weight = 'font-medium',
    label_color = '#374151',
    option_style = 'dropdown',
    button_style = 'rounded',
    show_selected_value = true,
    spacing = 'space-y-4'
  } = settings;

  // Use product options if available, otherwise fallback to demo data
  const productOptions = product?.options?.length > 0 ? product.options : [
    {
      name: 'Size',
      label: 'מידה',
      type: 'text',
      values: ['S', 'M', 'L']
    },
    {
      name: 'Color',
      label: 'צבע',
      type: 'color',
      values: [
        { name: 'לבן', color: '#FFFFFF' },
        { name: 'שחור', color: '#000000' },
        { name: 'אדום', color: '#FF0000' }
      ]
    }
  ];

  const handleOptionChange = (optionName, value) => {
    if (onOptionChange) {
      onOptionChange(optionName, value);
    }
  };

  const renderOption = (option) => {
    if (option_style === 'dropdown') {
      return (
        <select
          value={selectedOptions?.[option.name] || (option.type === 'color' ? option.values[0]?.name : option.values[0]) || ''}
          onChange={(e) => handleOptionChange(option.name, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {option.type === 'color' ? 
            option.values.map((colorOption) => (
              <option key={colorOption.name} value={colorOption.name}>
                {colorOption.name}
              </option>
            )) :
            option.values.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))
          }
        </select>
      );
    }

    if (option_style === 'buttons') {
      return (
        <div className="flex flex-wrap gap-2">
          {option.type === 'color' ?
            option.values.map((colorOption) => (
              <button
                key={colorOption.name}
                onClick={() => handleOptionChange(option.name, colorOption.name)}
                className={`px-4 py-2 border ${button_style === 'rounded' ? 'rounded-md' : 'rounded-full'} ${
                  (selectedOptions?.[option.name] || option.values[0]?.name) === colorOption.name
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: colorOption.color }}
                  ></div>
                  <span>{colorOption.name}</span>
                </div>
              </button>
            )) :
            option.values.map((value) => (
              <button
                key={value}
                onClick={() => handleOptionChange(option.name, value)}
                className={`px-4 py-2 border ${button_style === 'rounded' ? 'rounded-md' : 'rounded-full'} ${
                  (selectedOptions?.[option.name] || option.values[0]) === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {value}
              </button>
            ))
          }
        </div>
      );
    }

    if (option_style === 'swatches' && option.type === 'color') {
      return (
        <div className="flex flex-wrap gap-2">
          {option.values.map((colorOption) => (
            <button
              key={colorOption.name}
              onClick={() => handleOptionChange(option.name, colorOption.name)}
              className={`w-8 h-8 rounded-full border-2 ${
                (selectedOptions?.[option.name] || option.values[0]?.name) === colorOption.name
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: colorOption.color }}
              title={colorOption.name}
            ></button>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={spacing}>
      {productOptions.map((option) => (
        <div key={option.name}>
          {show_labels && (
            <label 
              className={`block ${label_size} ${label_weight} mb-2`}
              style={{ color: label_color }}
            >
              {option.label}
              {show_selected_value && selectedOptions && selectedOptions[option.name] && (
                <span className="text-gray-500 font-normal mr-2">
                  ({selectedOptions[option.name]})
                </span>
              )}
            </label>
          )}
          {renderOption(option)}
        </div>
      ))}
    </div>
  );
};

ProductOptions.schema = {
  name: 'אפשרויות מוצר',
  category: 'product',
  icon: 'Settings',
  schema: {
    settings: [
      {
        type: 'header',
        content: 'הגדרות תוויות'
      },
      {
        type: 'checkbox',
        id: 'show_labels',
        label: 'הצג תוויות',
        default: true
      },
      {
        type: 'checkbox',
        id: 'show_selected_value',
        label: 'הצג ערך נבחר',
        default: true
      },
      {
        type: 'select',
        id: 'label_size',
        label: 'גודל תווית',
        options: [
          { value: 'text-xs', label: 'קטן מאוד' },
          { value: 'text-sm', label: 'קטן' },
          { value: 'text-base', label: 'בינוני' },
          { value: 'text-lg', label: 'גדול' }
        ],
        default: 'text-sm'
      },
      {
        type: 'select',
        id: 'label_weight',
        label: 'עובי תווית',
        options: [
          { value: 'font-normal', label: 'רגיל' },
          { value: 'font-medium', label: 'בינוני' },
          { value: 'font-semibold', label: 'מודגש' }
        ],
        default: 'font-medium'
      },
      {
        type: 'color',
        id: 'label_color',
        label: 'צבע תווית',
        default: '#374151'
      },
      {
        type: 'header',
        content: 'סגנון אפשרויות'
      },
      {
        type: 'select',
        id: 'option_style',
        label: 'סגנון תצוגה',
        options: [
          { value: 'dropdown', label: 'רשימה נפתחת' },
          { value: 'buttons', label: 'כפתורים' },
          { value: 'swatches', label: 'דוגמיות צבע' }
        ],
        default: 'dropdown'
      },
      {
        type: 'select',
        id: 'button_style',
        label: 'סגנון כפתורים',
        options: [
          { value: 'rounded', label: 'מעוגל' },
          { value: 'rounded-full', label: 'עגול לחלוטין' }
        ],
        default: 'rounded'
      },
      {
        type: 'header',
        content: 'פריסה'
      },
      {
        type: 'select',
        id: 'spacing',
        label: 'ריווח בין אפשרויות',
        options: [
          { value: 'space-y-2', label: 'קטן' },
          { value: 'space-y-4', label: 'בינוני' },
          { value: 'space-y-6', label: 'גדול' }
        ],
        default: 'space-y-4'
      }
    ]
  }
};

export default ProductOptions; 
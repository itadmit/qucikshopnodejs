/**
 * Product Options Component - Simple version for product pages
 */
import React from 'react';

const ProductOptions = ({ settings, product, selectedOptions, onOptionChange }) => {
  const showLabels = settings?.show_labels !== false;
  const optionStyle = settings?.option_style || 'buttons';
  const showSelectedValue = settings?.show_selected_value !== false;

  if (!product?.options || product.options.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {product.options.map((option, index) => (
        <div key={index} className="mb-4">
          {showLabels && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {option.name}
              {showSelectedValue && selectedOptions?.[option.name] && (
                <span className="text-gray-500">: {selectedOptions[option.name]}</span>
              )}
            </label>
          )}
          
          {optionStyle === 'buttons' ? (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value, valueIndex) => (
                <button
                  key={valueIndex}
                  onClick={() => onOptionChange?.(option.name, value)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    selectedOptions?.[option.name] === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          ) : (
            <select
              value={selectedOptions?.[option.name] || ''}
              onChange={(e) => onOptionChange?.(option.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">בחר {option.name}</option>
              {option.values.map((value, valueIndex) => (
                <option key={valueIndex} value={value}>
                  {value}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductOptions;

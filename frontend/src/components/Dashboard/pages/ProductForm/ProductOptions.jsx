import React from 'react';
import { Plus, Trash2, Palette, ImageIcon, Package } from 'lucide-react';


const ProductOptions = ({ 
  productOptions, 
  setProductOptions,
  handleAddOption,
  handleRemoveOption,
  handleAddOptionValue,
  handleRemoveOptionValue,
  handleOptionValueChange
}) => {
  // Available option types
  const optionTypes = [
    { value: 'COLOR', label: 'צבע', icon: Palette, description: 'בחירת צבע עם פלטה' },
    { value: 'IMAGE', label: 'תמונה', icon: ImageIcon, description: 'בחירה על בסיס תמונה' },
    { value: 'BUTTON', label: 'כפתור', icon: Package, description: 'כפתורי בחירה' }
  ];

  // Function to generate CSS for patterns
  const getPatternStyle = (pattern) => {
    const { type, primaryColor, secondaryColor } = pattern;
    
    switch (type) {
      case 'stripes':
        return {
          background: `repeating-linear-gradient(
            45deg,
            ${primaryColor},
            ${primaryColor} 3px,
            ${secondaryColor} 3px,
            ${secondaryColor} 6px
          )`
        };
      
      case 'checkered':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `
            linear-gradient(45deg, ${primaryColor} 25%, transparent 25%),
            linear-gradient(-45deg, ${primaryColor} 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${primaryColor} 75%),
            linear-gradient(-45deg, transparent 75%, ${primaryColor} 75%)
          `,
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
        };
      
      case 'dots':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(${primaryColor} 30%, transparent 30%)`,
          backgroundSize: '4px 4px'
        };
      
      case 'numbered': // Leopard spots pattern
        return {
          backgroundColor: '#F4A460', // Sandy brown base
          backgroundImage: `
            radial-gradient(ellipse 2px 1px at 2px 1px, #8B4513 70%, transparent 70%),
            radial-gradient(ellipse 1px 2px at 4px 3px, #A0522D 60%, transparent 60%),
            radial-gradient(ellipse 1.5px 1px at 1px 4px, #D2691E 65%, transparent 65%),
            radial-gradient(ellipse 1px 1px at 5px 1px, #CD853F 50%, transparent 50%)
          `,
          backgroundSize: '8px 6px, 6px 8px, 7px 5px, 5px 4px',
          backgroundPosition: '0 0, 3px 2px, 1px 3px, 4px 4px'
        };
      
      case 'hashed': // Snake scales pattern
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `
            radial-gradient(ellipse 3px 1.5px at center, ${primaryColor} 40%, transparent 40%),
            radial-gradient(ellipse 2px 1px at center, ${primaryColor} 30%, transparent 30%)
          `,
          backgroundSize: '6px 4px, 4px 3px',
          backgroundPosition: '0 0, 3px 2px'
        };
      
      case 'solid':
      default:
        return {
          backgroundColor: primaryColor
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">אפשרויות מוצר</h4>
        <button
          type="button"
          onClick={handleAddOption}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          הוסף אפשרות
        </button>
      </div>

      {productOptions.map((option, index) => (
        <div key={option.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-gray-900">אפשרות {index + 1}</h5>
            <button
              type="button"
              onClick={() => handleRemoveOption(option.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שם האפשרות</label>
              <input
                type="text"
                value={option.name}
                onChange={(e) => {
                  setProductOptions(prev => prev.map(o => 
                    o.id === option.id ? { ...o, name: e.target.value } : o
                  ));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="למשל: צבע, מידה, חומר"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סוג האפשרות</label>
              <select
                value={option.type}
                onChange={(e) => {
                  setProductOptions(prev => prev.map(o => 
                    o.id === option.id ? { ...o, type: e.target.value } : o
                  ));
                }}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                {optionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Option Values */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">ערכים</label>
              <button
                type="button"
                onClick={() => handleAddOptionValue(option.id)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + הוסף ערך
              </button>
            </div>
            
            <div className="space-y-3">
              {option.values.map((value, valueIndex) => (
                <div key={value.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={value.value}
                    onChange={(e) => handleOptionValueChange(option.id, value.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`ערך ${valueIndex + 1}`}
                  />
                  {option.type === 'COLOR' && (
                    <div className="flex items-center gap-2">
                      {/* Always show regular color picker */}
                      <input
                        type="color"
                        value={value.colorCode || '#000000'}
                        onChange={(e) => {
                          setProductOptions(prev => prev.map(o => 
                            o.id === option.id 
                              ? { ...o, values: o.values.map(v => 
                                  v.id === value.id ? { 
                                    ...v, 
                                    colorCode: e.target.value,
                                    // Keep pattern info but update primary color
                                    pattern: v.pattern ? { ...v.pattern, primaryColor: e.target.value } : null
                                  } : v
                                )}
                              : o
                          ));
                        }}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                      />
                      
                      {/* Mixed Color Preview */}
                      {value.mixedColor && value.mixedColor.type === 'mixed' && (
                        <div 
                          className="w-8 h-6 border border-gray-300 rounded flex-shrink-0"
                          style={{ background: value.mixedColor.hex }}
                          title={`צבע מעורב: ${value.mixedColor.name}`}
                        />
                      )}
                      
                      {/* Pattern Preview */}
                      {value.pattern && value.pattern.type !== 'solid' && (
                        <div 
                          className="w-8 h-6 border border-gray-300 rounded flex-shrink-0"
                          style={getPatternStyle(value.pattern)}
                          title={`דפוס: ${value.detectedPattern?.patternName || value.pattern.type}`}
                        />
                      )}
                      
                      {/* Compact Detection Messages */}
                      <div className="flex-1">
                        {value.detectedPattern && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ {value.detectedPattern.name}
                          </span>
                        )}
                        {value.detectedColor && !value.detectedPattern && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ {value.detectedColor.name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {(option.values.length > 1 && !(valueIndex === option.values.length - 1 && value.value === '')) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionValue(option.id, value.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {productOptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>אין אפשרויות מוגדרות</p>
          <p className="text-sm mt-2">הוסף אפשרויות כמו צבע, מידה או חומר</p>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;

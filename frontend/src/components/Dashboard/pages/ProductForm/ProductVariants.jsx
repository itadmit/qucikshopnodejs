import React, { useEffect } from 'react';
import { Package, DollarSign } from 'lucide-react';

const ProductVariants = ({ 
  productOptions, 
  variants, 
  setVariants,
  productData 
}) => {
  // Function to generate CSS for patterns
  const getPatternStyle = (pattern) => {
    const { type, primaryColor, secondaryColor } = pattern;
    
    switch (type) {
      case 'stripes':
        return {
          background: `repeating-linear-gradient(
            45deg,
            ${primaryColor},
            ${primaryColor} 2px,
            ${secondaryColor} 2px,
            ${secondaryColor} 4px
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
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
        };
      
      case 'dots':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(${primaryColor} 30%, transparent 30%)`,
          backgroundSize: '3px 3px'
        };
      
      case 'numbered': // Leopard spots
        return {
          backgroundColor: '#F4A460',
          backgroundImage: `
            radial-gradient(ellipse 1px 0.5px at 1px 0.5px, #8B4513 70%, transparent 70%),
            radial-gradient(ellipse 0.5px 1px at 2px 1.5px, #A0522D 60%, transparent 60%)
          `,
          backgroundSize: '4px 3px, 3px 4px',
          backgroundPosition: '0 0, 1.5px 1px'
        };
      
      case 'hashed': // Snake scales
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `
            radial-gradient(ellipse 1.5px 0.75px at center, ${primaryColor} 40%, transparent 40%)
          `,
          backgroundSize: '3px 2px'
        };
      
      case 'solid':
      default:
        return {
          backgroundColor: primaryColor
        };
    }
  };

  // Generate all possible combinations of option values
  const generateVariants = () => {
    // Filter out options that have values
    const validOptions = productOptions.filter(option => 
      option.values && option.values.length > 0 && 
      option.values.some(value => value.value && value.value.trim() !== '')
    );

    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }
    
    // Generate all possible combinations
    const combinations = validOptions.reduce((acc, option) => {
      if (acc.length === 0) {
        return option.values
          .filter(value => value.value && value.value.trim() !== '')
          .map(value => [{ optionId: option.id, valueId: value.id, value: value.value }]);
      }
      
      const newCombinations = [];
      acc.forEach(combination => {
        option.values
          .filter(value => value.value && value.value.trim() !== '')
          .forEach(value => {
            newCombinations.push([...combination, { optionId: option.id, valueId: value.id, value: value.value }]);
          });
      });
      return newCombinations;
    }, []);

    const newVariants = combinations.map((combination, index) => ({
      id: Date.now() + index,
      sku: `${productData.sku || 'PRODUCT'}-${index + 1}`,
      price: productData.price || '',
      comparePrice: productData.comparePrice || '',
      costPrice: productData.costPrice || '',
      inventoryQuantity: 0,
      weight: productData.weight || '',
      optionValues: combination,
      isActive: true
    }));

    setVariants(newVariants);
  };

  // Auto-generate variants when options change
  useEffect(() => {
    if (productOptions.length > 0) {
      generateVariants();
    } else {
      setVariants([]);
    }
  }, [productOptions, productData.sku, productData.price]);

  if (variants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>אין וריאציות</p>
        <p className="text-sm mt-2">הוסף אפשרויות למוצר כדי ליצור וריאציות אוטומטית</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <Package className="w-5 h-5 ml-2" />
          וריאציות מוצר ({variants.length})
        </h4>
        <button
          type="button"
          onClick={generateVariants}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          יצירה מחדש
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                וריאציה
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                מקט
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                מחיר
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                מחיר לפני הנחה
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                מלאי
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                •••
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variants.map((variant) => {
              // Find color option value to show color dot
              const colorOption = variant.optionValues.find(ov => {
                const option = productOptions.find(po => po.id === ov.optionId);
                return option && option.type === 'COLOR';
              });
              
              let colorDisplay = null;
              if (colorOption) {
                const option = productOptions.find(po => po.id === colorOption.optionId);
                const value = option?.values?.find(v => v.id === colorOption.valueId);
                if (value) {
                  if (value.mixedColor && value.mixedColor.type === 'mixed') {
                    // Show mixed color preview
                    colorDisplay = (
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300 inline-block"
                        style={{ background: value.mixedColor.hex }}
                        title={`צבע מעורב: ${value.mixedColor.name}`}
                      />
                    );
                  } else if (value.pattern && value.pattern.type !== 'solid') {
                    // Show pattern preview
                    colorDisplay = (
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300 inline-block"
                        style={getPatternStyle(value.pattern)}
                        title={`דפוס: ${value.pattern.type}`}
                      />
                    );
                  } else if (value.colorCode) {
                    // Show solid color
                    colorDisplay = (
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300 inline-block"
                        style={{ backgroundColor: value.colorCode }}
                        title={`צבע: ${value.colorCode}`}
                      />
                    );
                  }
                }
              }

              return (
                <tr key={variant.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {colorDisplay}
                      <span className={colorDisplay ? 'mr-2' : ''}>
                        {variant.optionValues.map(ov => ov.value).join(' / ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => {
                        setVariants(prev => prev.map(v => 
                          v.id === variant.id ? { ...v, sku: e.target.value } : v
                        ));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="מקט"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={variant.price}
                        onChange={(e) => {
                          setVariants(prev => prev.map(v => 
                            v.id === variant.id ? { ...v, price: e.target.value } : v
                          ));
                        }}
                        className="w-full px-3 py-2 pl-6 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₪</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={variant.comparePrice}
                        onChange={(e) => {
                          setVariants(prev => prev.map(v => 
                            v.id === variant.id ? { ...v, comparePrice: e.target.value } : v
                          ));
                        }}
                        className="w-full px-3 py-2 pl-6 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₪</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={variant.inventoryQuantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        setVariants(prev => prev.map(v => 
                          v.id === variant.id ? { ...v, inventoryQuantity: value === '' ? 0 : parseInt(value) || 0 } : v
                        ));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="הגדרות נוספות: משקל, פעיל, המשך למכור"
                    >
                      •••
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductVariants;
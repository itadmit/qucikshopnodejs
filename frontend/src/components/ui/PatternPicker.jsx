import React, { useState } from 'react';
import { ChevronDown, Palette, Grid, Circle } from 'lucide-react';

const PatternPicker = ({ 
  value = { type: 'solid', primaryColor: '#000000', secondaryColor: '#FFFFFF' }, 
  onChange,
  placeholder = 'בחר דפוס...'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // סוגי דפוסים זמינים
  const patternTypes = [
    { 
      id: 'solid', 
      name: 'חלק', 
      icon: Circle,
      description: 'צבע אחיד'
    },
    { 
      id: 'stripes', 
      name: 'פסים', 
      icon: Grid,
      description: 'פסים אלכסוניים'
    },
    { 
      id: 'checkered', 
      name: 'משובץ', 
      icon: Grid,
      description: 'דפוס שחמט'
    },
    { 
      id: 'dots', 
      name: 'מנוקד', 
      icon: Circle,
      description: 'נקודות עגולות'
    },
    { 
      id: 'numbered', 
      name: 'מנומר', 
      icon: Grid,
      description: 'דפוס מספרים'
    },
    { 
      id: 'hashed', 
      name: 'מנוחש', 
      icon: Grid,
      description: 'דפוס קווים מוצלבים'
    }
  ];

  // צבעים פופולריים לבחירה מהירה
  const quickColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  // יצירת CSS לדפוס
  const getPatternStyle = (pattern) => {
    const { type, primaryColor, secondaryColor } = pattern;
    
    switch (type) {
      case 'stripes':
        return {
          background: `repeating-linear-gradient(
            45deg,
            ${primaryColor},
            ${primaryColor} 8px,
            ${secondaryColor} 8px,
            ${secondaryColor} 16px
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
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
        };
      
      case 'dots':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(${primaryColor} 30%, transparent 30%)`,
          backgroundSize: '12px 12px'
        };
      
      case 'numbered':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `
            linear-gradient(90deg, ${primaryColor} 1px, transparent 1px),
            linear-gradient(${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          position: 'relative'
        };
      
      case 'hashed':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `
            linear-gradient(45deg, ${primaryColor} 1px, transparent 1px),
            linear-gradient(-45deg, ${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px'
        };
      
      case 'solid':
      default:
        return {
          backgroundColor: primaryColor
        };
    }
  };

  // עדכון דפוס
  const updatePattern = (updates) => {
    const newPattern = { ...value, ...updates };
    onChange(newPattern);
  };

  // קבלת שם הדפוס הנוכחי
  const getCurrentPatternName = () => {
    const pattern = patternTypes.find(p => p.id === value.type);
    return pattern ? pattern.name : 'דפוס';
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-3">
          {/* Pattern Preview */}
          <div 
            className="w-8 h-8 rounded border border-gray-300"
            style={getPatternStyle(value)}
          />
          <span className="text-sm text-gray-700">
            {getCurrentPatternName()} - {value.primaryColor}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4 space-y-4">
            
            {/* Pattern Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סוג דפוס</label>
              <div className="grid grid-cols-2 gap-2">
                {patternTypes.map((pattern) => (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => updatePattern({ type: pattern.id })}
                    className={`p-3 border rounded-lg text-right transition-colors ${
                      value.type === pattern.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <pattern.icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">{pattern.name}</div>
                        <div className="text-xs text-gray-500">{pattern.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                צבע {value.type === 'solid' ? 'ראשי' : 'ראשי'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value.primaryColor}
                  onChange={(e) => updatePattern({ primaryColor: e.target.value })}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={value.primaryColor}
                  onChange={(e) => updatePattern({ primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
              
              {/* Quick Colors */}
              <div className="flex gap-1 mt-2">
                {quickColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updatePattern({ primaryColor: color })}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Secondary Color (for patterns) */}
            {value.type !== 'solid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">צבע משני</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value.secondaryColor}
                    onChange={(e) => updatePattern({ secondaryColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value.secondaryColor}
                    onChange={(e) => updatePattern({ secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="#FFFFFF"
                  />
                </div>
                
                {/* Quick Colors */}
                <div className="flex gap-1 mt-2">
                  {quickColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updatePattern({ secondaryColor: color })}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Large Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תצוגה מקדימה</label>
              <div 
                className="w-full h-20 rounded-lg border border-gray-300"
                style={getPatternStyle(value)}
              />
            </div>

          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default PatternPicker;

/**
 * 🎨 ColorPicker Component - Shopify Style
 * קומפוננטת בחירת צבעים מקצועית בסגנון שופיפיי
 */

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, X, RotateCcw } from 'lucide-react';

const ColorPicker = ({ 
  value = '#3b82f6', 
  onChange, 
  label = 'צבע',
  showPresets = true,
  showPrimarySecondary = true,
  showTransparent = true,
  showClear = true,
  allowEmpty = false,
  primaryColor = '#3b82f6',
  secondaryColor = '#8b5cf6'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const dropdownRef = useRef(null);

  // צבעים מוכנים מראש (כמו שופיפיי)
  const presetColors = [
    '#000000', '#ffffff', '#f3f4f6', '#9ca3af', '#6b7280',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#dc2626', '#ea580c', '#d97706', '#ca8a04'
  ];

  // סגירה בלחיצה מחוץ לקומפוננטה
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (color) => {
    setCustomColor(color);
    onChange(color);
    setIsOpen(false);
  };

  const handleTransparent = () => {
    const transparentColor = 'transparent';
    setCustomColor(transparentColor);
    onChange(transparentColor);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearValue = allowEmpty ? '' : '#ffffff';
    setCustomColor(clearValue);
    onChange(clearValue);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  // בדיקה אם הצבע שקוף או ריק
  const isTransparent = value === 'transparent';
  const isEmpty = !value || value === '';
  const displayValue = isEmpty ? '#ffffff' : (isTransparent ? 'transparent' : value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Color Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-gray-300 flex-shrink-0 relative overflow-hidden">
            {isEmpty ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <X className="w-3 h-3 text-gray-400" />
              </div>
            ) : isTransparent ? (
              <div className="w-full h-full bg-transparent relative">
                {/* Checkerboard pattern for transparency */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                   linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                   linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                   linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                }} />
              </div>
            ) : (
              <div 
                className="w-full h-full"
                style={{ backgroundColor: displayValue }}
              />
            )}
          </div>
          <span className="text-sm text-gray-900 font-mono">
            {isEmpty ? 'ללא צבע' : isTransparent ? 'שקוף' : displayValue.toUpperCase()}
          </span>
        </div>
        <Palette className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          
          {/* Quick Actions */}
          {(showTransparent || showClear) && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                פעולות מהירות
              </h4>
              <div className="flex gap-2">
                {showTransparent && (
                  <button
                    onClick={handleTransparent}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    title="צבע שקוף"
                  >
                    <div className="w-4 h-4 rounded border border-gray-300 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-50" style={{
                        backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                         linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                         linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                         linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                        backgroundSize: '2px 2px',
                        backgroundPosition: '0 0, 0 1px, 1px -1px, -1px 0px'
                      }} />
                    </div>
                    <span>שקוף</span>
                  </button>
                )}
                {showClear && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    title="מחק צבע"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                    <span>מחק</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Primary/Secondary Colors */}
          {showPrimarySecondary && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                צבעי הערכת נושא
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleColorSelect(primaryColor)}
                  className="relative w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                  title="צבע ראשי"
                >
                  {value === primaryColor && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                  )}
                </button>
                <button
                  onClick={() => handleColorSelect(secondaryColor)}
                  className="relative w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  style={{ backgroundColor: secondaryColor }}
                  title="צבע משני"
                >
                  {value === secondaryColor && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Preset Colors */}
          {showPresets && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                צבעים נפוצים
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="relative w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-300 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {value === color && (
                      <Check 
                        className={`w-4 h-4 absolute inset-0 m-auto drop-shadow-sm ${
                          color === '#ffffff' || color === '#f3f4f6' ? 'text-gray-800' : 'text-white'
                        }`} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Color Input */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              צבע מותאם אישית
            </h4>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    onChange(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;

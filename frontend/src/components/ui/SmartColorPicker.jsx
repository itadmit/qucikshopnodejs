import React, { useState, useEffect } from 'react';
import { Check, Palette, Eye } from 'lucide-react';

const SmartColorPicker = ({ value = '', onChange, placeholder = 'הכנס שם צבע או קוד...' }) => {
  const [inputValue, setInputValue] = useState(value);
  const [detectedColor, setDetectedColor] = useState(null);
  const [showPredefined, setShowPredefined] = useState(false);

  // מאגר צבעים מוכנים מראש
  const predefinedColors = [
    { name: 'לבן', hex: '#FFFFFF', rgb: [255, 255, 255] },
    { name: 'שחור', hex: '#000000', rgb: [0, 0, 0] },
    { name: 'אדום', hex: '#FF0000', rgb: [255, 0, 0] },
    { name: 'כחול', hex: '#0000FF', rgb: [0, 0, 255] },
    { name: 'ירוק', hex: '#008000', rgb: [0, 128, 0] },
    { name: 'צהוב', hex: '#FFFF00', rgb: [255, 255, 0] },
    { name: 'כתום', hex: '#FFA500', rgb: [255, 165, 0] },
    { name: 'סגול', hex: '#800080', rgb: [128, 0, 128] },
    { name: 'ורוד', hex: '#FFC0CB', rgb: [255, 192, 203] },
    { name: 'חום', hex: '#A52A2A', rgb: [165, 42, 42] },
    { name: 'אפור', hex: '#808080', rgb: [128, 128, 128] },
    { name: 'כסף', hex: '#C0C0C0', rgb: [192, 192, 192] },
    { name: 'זהב', hex: '#FFD700', rgb: [255, 215, 0] },
    { name: 'ירוק בהיר', hex: '#90EE90', rgb: [144, 238, 144] },
    { name: 'כחול בהיר', hex: '#ADD8E6', rgb: [173, 216, 230] },
    { name: 'אדום כהה', hex: '#8B0000', rgb: [139, 0, 0] },
    { name: 'כחול כהה', hex: '#00008B', rgb: [0, 0, 139] },
    { name: 'ירוק כהה', hex: '#006400', rgb: [0, 100, 0] },
    { name: 'סגול כהה', hex: '#4B0082', rgb: [75, 0, 130] },
    { name: 'ורוד כהה', hex: '#C71585', rgb: [199, 21, 133] },
    { name: 'טורקיז', hex: '#40E0D0', rgb: [64, 224, 208] },
    { name: 'אינדיגו', hex: '#4B0082', rgb: [75, 0, 130] },
    { name: 'ליים', hex: '#00FF00', rgb: [0, 255, 0] },
    { name: 'מגנטה', hex: '#FF00FF', rgb: [255, 0, 255] },
    { name: 'ציאן', hex: '#00FFFF', rgb: [0, 255, 255] },
    { name: 'חרדל', hex: '#FFDB58', rgb: [255, 219, 88] },
    { name: 'אוליב', hex: '#808000', rgb: [128, 128, 0] },
    { name: 'נייבי', hex: '#000080', rgb: [0, 0, 128] },
    { name: 'מרון', hex: '#800000', rgb: [128, 0, 0] },
    { name: 'טיל', hex: '#008080', rgb: [0, 128, 128] }
  ];

  // פונקציה לחישוב מרחק בין צבעים (RGB)
  const colorDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  };

  // המרת HEX ל-RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };

  // זיהוי צבע לפי שם או קוד
  const detectColor = (input) => {
    if (!input) return null;

    const cleanInput = input.trim().toLowerCase();

    // חיפוש לפי שם
    const byName = predefinedColors.find(color => 
      color.name.toLowerCase().includes(cleanInput) ||
      cleanInput.includes(color.name.toLowerCase())
    );

    if (byName) {
      return byName;
    }

    // חיפוש לפי קוד HEX
    if (cleanInput.match(/^#?[0-9a-f]{3,6}$/i)) {
      const hex = cleanInput.startsWith('#') ? cleanInput : `#${cleanInput}`;
      const rgb = hexToRgb(hex);
      
      if (rgb) {
        // מציאת הצבע הקרוב ביותר
        let closestColor = predefinedColors[0];
        let minDistance = colorDistance(rgb, closestColor.rgb);

        predefinedColors.forEach(color => {
          const distance = colorDistance(rgb, color.rgb);
          if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
          }
        });

        // אם המרחק קטן מ-50, נחשיב שזה אותו צבע
        if (minDistance < 50) {
          return { ...closestColor, inputHex: hex };
        }
      }
    }

    return null;
  };

  // עדכון זיהוי צבע כשהקלט משתנה
  useEffect(() => {
    const detected = detectColor(inputValue);
    setDetectedColor(detected);
  }, [inputValue]);

  // עדכון הקלט כשהערך החיצוני משתנה
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleColorSelect = (color) => {
    setInputValue(color.hex);
    onChange(color.hex);
    setShowPredefined(false);
  };

  const handleDetectedColorApply = () => {
    if (detectedColor) {
      const hexToUse = detectedColor.inputHex || detectedColor.hex;
      setInputValue(hexToUse);
      onChange(hexToUse);
    }
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {/* Color Preview */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {inputValue && (
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: inputValue }}
            />
          )}
          <button
            type="button"
            onClick={() => setShowPredefined(!showPredefined)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Detection Alert */}
      {detectedColor && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                זוהה צבע "{detectedColor.name}" → {detectedColor.inputHex || detectedColor.hex}
              </span>
              <div 
                className="w-4 h-4 rounded border border-green-300"
                style={{ backgroundColor: detectedColor.hex }}
              />
            </div>
            <button
              type="button"
              onClick={handleDetectedColorApply}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              החל
            </button>
          </div>
        </div>
      )}

      {/* Predefined Colors Dropdown */}
      {showPredefined && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-3">צבעים מוכנים</h4>
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className="group relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`${color.name} - ${color.hex}`}
                >
                  <div 
                    className="w-8 h-8 rounded border border-gray-300 mx-auto"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs text-gray-600 mt-1 text-center truncate">
                    {color.name}
                  </div>
                  {inputValue === color.hex && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showPredefined && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPredefined(false)}
        />
      )}
    </div>
  );
};

export default SmartColorPicker;

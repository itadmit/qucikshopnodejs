/**
 * 🎨 Font Picker Component
 * בוחר פונטים מתקדם עם תמיכה בגוגל פונטס ופונטים מקומיים
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Type, Search, Check } from 'lucide-react';
import { Select } from '../../../ui';
import { fontApi } from '../../../../services/builderApi';
import { useFonts } from '../../../../hooks/useFonts';

const FontPicker = ({ 
  value, 
  onChange, 
  placeholder = 'בחר פונט...', 
  showPreview = true,
  hebrewSupport = true,
  className = '' 
}) => {
  const { t } = useTranslation();
  const { loadAndApplyFont } = useFonts();
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // פונטים מקומיים עם תמיכה בעברית
  const systemFonts = [
    { 
      family: 'Noto Sans Hebrew', 
      category: 'sans-serif',
      hebrewSupport: true,
      preview: 'Aa אב'
    },
    { 
      family: 'Assistant', 
      category: 'sans-serif',
      hebrewSupport: true,
      preview: 'Aa אב'
    },
    { 
      family: 'Heebo', 
      category: 'sans-serif',
      hebrewSupport: true,
      preview: 'Aa אב'
    },
    { 
      family: 'Rubik', 
      category: 'sans-serif',
      hebrewSupport: true,
      preview: 'Aa אב'
    },
    { 
      family: 'Inter', 
      category: 'sans-serif',
      hebrewSupport: false,
      preview: 'Aa'
    },
    { 
      family: 'Open Sans', 
      category: 'sans-serif',
      hebrewSupport: false,
      preview: 'Aa'
    },
    { 
      family: 'Roboto', 
      category: 'sans-serif',
      hebrewSupport: false,
      preview: 'Aa'
    }
  ];

  // טעינת פונטים מגוגל (אופציונלי)
  useEffect(() => {
    const loadGoogleFonts = async () => {
      setLoading(true);
      try {
        const googleFonts = await fontApi.getGoogleFonts();
        const filteredFonts = hebrewSupport 
          ? googleFonts.filter(font => font.hebrewSupport)
          : googleFonts;
        
        setFonts([...systemFonts, ...filteredFonts]);
      } catch (error) {
        console.error('Failed to load Google Fonts:', error);
        setFonts(systemFonts);
      } finally {
        setLoading(false);
      }
    };

    // loadGoogleFonts();
    // לעת עתה נשתמש רק בפונטים המקומיים
    setFonts(systemFonts);
  }, [hebrewSupport]);

  // סינון פונטים לפי חיפוש
  const filteredFonts = fonts.filter(font =>
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // יצירת אפשרויות לרשימה הנפתחת
  const fontOptions = filteredFonts.map(font => ({
    value: font.family,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{font.family}</span>
          {font.hebrewSupport && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
              עברית
            </span>
          )}
        </div>
        {showPreview && (
          <span 
            className="text-sm text-gray-600"
            style={{ fontFamily: font.family }}
          >
            {font.preview || 'Aa אב'}
          </span>
        )}
      </div>
    ),
    searchText: font.family
  }));

  // טיפול בשינוי פונט
  const handleFontChange = async (fontFamily) => {
    onChange(fontFamily);
    
    // טעינה והחלה של הפונט
    try {
      await loadAndApplyFont(fontFamily);
    } catch (error) {
      console.error('Failed to load font:', error);
    }
  };

  return (
    <div className={`font-picker ${className}`}>
      <Select
        value={value}
        onChange={handleFontChange}
        options={fontOptions}
        placeholder={placeholder}
        searchable
        searchPlaceholder="חפש פונט..."
        loading={loading}
        className="w-full"
        renderOption={(option) => option.label}
      />
      
      {/* תצוגה מקדימה של הפונט הנבחר */}
      {showPreview && value && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <div className="text-xs text-gray-500 mb-2">תצוגה מקדימה:</div>
          <div 
            className="text-lg"
            style={{ fontFamily: value }}
          >
            <div className="mb-1">The quick brown fox jumps over the lazy dog</div>
            <div>השועל החום הזריז קופץ מעל הכלב העצלן</div>
            <div className="text-sm text-gray-600 mt-2">
              1234567890 !@#$%^&*()
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontPicker;

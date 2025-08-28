/**
 * 🧪 Font Test Component
 * קומפוננטה לבדיקת הפונטים - הבילדר vs הסטורפרונט
 */

import React from 'react';
import { useFonts } from '../hooks/useFonts';
import useGlobalStyles from '../hooks/useGlobalStyles';

const FontTestComponent = () => {
  const { loadAndApplyFont, getAvailableFonts } = useFonts();
  const { updateSetting, globalSettings } = useGlobalStyles();

  const handleFontChange = async (fontName) => {
    await updateSetting('fontFamily', fontName);
    await loadAndApplyFont(fontName, '.storefront-content');
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">בדיקת מערכת הפונטים</h2>
      
      {/* Builder Section */}
      <div className="site-builder p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">אזור הבילדר (Noto Sans Hebrew)</h3>
        <p>זה הטקסט של הבילדר - צריך להישאר תמיד ב-Noto Sans Hebrew</p>
        <p>This is builder text - should always stay in Noto Sans Hebrew</p>
      </div>

      {/* Storefront Section */}
      <div className="storefront-content p-4 border-2 border-green-200 rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold mb-2">אזור הסטורפרונט (פונט נבחר)</h3>
        <p>זה הטקסט של הסטורפרונט - צריך להשתנות לפי הפונט שנבחר</p>
        <p>This is storefront text - should change based on selected font</p>
      </div>

      {/* Font Selector */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">בחירת פונט לסטורפרונט</h3>
        <div className="grid grid-cols-2 gap-2">
          {getAvailableFonts().map((font) => (
            <button
              key={font.value}
              onClick={() => handleFontChange(font.value)}
              className={`p-2 text-sm border rounded-lg transition-colors ${
                globalSettings.fontFamily === font.value
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          פונט נוכחי: {globalSettings.fontFamily || 'Noto Sans Hebrew'}
        </p>
      </div>

      {/* Color Test */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">בדיקת צבעים גלובליים</h3>
        <div className="space-y-2">
          <button className="btn-primary">כפתור ראשי</button>
          <button className="btn-secondary">כפתור משני</button>
          <button className="btn-outline-primary">כפתור מתאר</button>
          <div className="p-2 bg-primary-light text-primary">טקסט עם צבע ראשי</div>
          <div className="p-2 bg-secondary-light text-secondary">טקסט עם צבע משני</div>
        </div>
      </div>
    </div>
  );
};

export default FontTestComponent;

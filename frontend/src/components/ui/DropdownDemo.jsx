/**
 * 🧪 Dropdown Demo Component
 * דוגמאות שימוש בקומפוננטת הדרופ-דאון החדשה
 */

import React, { useState } from 'react';
import { Dropdown, Select } from './index';

const DropdownDemo = () => {
  const [selectedFont, setSelectedFont] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [searchableValue, setSearchableValue] = useState('');

  const fontOptions = [
    { value: 'Inter', label: 'Inter (אנגלית)' },
    { value: 'Heebo', label: 'Heebo (עברית + אנגלית)' },
    { value: 'Assistant', label: 'Assistant (עברית + אנגלית)' },
    { value: 'Rubik', label: 'Rubik (עברית + אנגלית)' },
    { value: 'Noto Sans Hebrew', label: 'Noto Sans Hebrew (עברית + אנגלית)' },
    { value: 'Open Sans', label: 'Open Sans (אנגלית)' },
    { value: 'Roboto', label: 'Roboto (אנגלית)' }
  ];

  const colorOptions = [
    { value: 'red', label: 'אדום' },
    { value: 'blue', label: 'כחול' },
    { value: 'green', label: 'ירוק' },
    { value: 'purple', label: 'סגול' },
    { value: 'orange', label: 'כתום' },
    { value: 'pink', label: 'ורוד' }
  ];

  const templateOptions = [
    { value: 'jupiter', label: 'Jupiter - קלאסי ומינימלי' },
    { value: 'mars', label: 'Mars - מודרני ודינמי' },
    { value: 'venus', label: 'Venus - אלגנטי ונקי' },
    { value: 'saturn', label: 'Saturn - עסקי ומקצועי' }
  ];

  const countryOptions = [
    { value: 'il', label: 'ישראל' },
    { value: 'us', label: 'ארצות הברית' },
    { value: 'uk', label: 'בריטניה' },
    { value: 'de', label: 'גרמניה' },
    { value: 'fr', label: 'צרפת' },
    { value: 'es', label: 'ספרד' },
    { value: 'it', label: 'איטליה' },
    { value: 'ca', label: 'קנדה' },
    { value: 'au', label: 'אוסטרליה' },
    { value: 'jp', label: 'יפן' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎨 דוגמאות לקומפוננטת Dropdown החדשה
        </h1>
        <p className="text-gray-600">
          קומפוננטה מקצועית עם תמיכה מלאה בעברית ו-RTL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Select */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Select בסיסי</h2>
          <Select
            label="בחירת גופן"
            options={fontOptions}
            value={selectedFont}
            onChange={setSelectedFont}
            placeholder="בחר גופן..."
            required
          />
          <p className="text-sm text-gray-600">נבחר: {selectedFont || 'לא נבחר'}</p>
        </div>

        {/* Multi-select with search */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">בחירה מרובה עם חיפוש</h2>
          <Dropdown
            label="בחירת צבעים"
            options={colorOptions}
            value={selectedColors}
            onChange={setSelectedColors}
            placeholder="בחר צבעים..."
            multiple
            searchable
            clearable
          />
          <p className="text-sm text-gray-600">
            נבחרו: {selectedColors.length > 0 ? selectedColors.join(', ') : 'לא נבחרו'}
          </p>
        </div>

        {/* Large variant with custom rendering */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">גודל גדול עם רנדור מותאם</h2>
          <Dropdown
            label="בחירת תבנית"
            options={templateOptions}
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            placeholder="בחר תבנית..."
            size="lg"
            variant="filled"
            renderOption={(option, selected) => (
              <div className="flex flex-col">
                <span className="font-medium">{option.label.split(' - ')[0]}</span>
                <span className="text-xs text-gray-500">{option.label.split(' - ')[1]}</span>
              </div>
            )}
          />
          <p className="text-sm text-gray-600">נבחר: {selectedTemplate || 'לא נבחר'}</p>
        </div>

        {/* Searchable with many options */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">חיפוש עם אפשרויות רבות</h2>
          <Dropdown
            label="בחירת מדינה"
            options={countryOptions}
            value={searchableValue}
            onChange={setSearchableValue}
            placeholder="חפש מדינה..."
            searchable
            clearable
            maxHeight="150px"
          />
          <p className="text-sm text-gray-600">נבחר: {searchableValue || 'לא נבחר'}</p>
        </div>

        {/* Disabled state */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">מצב לא פעיל</h2>
          <Select
            label="אפשרות לא זמינה"
            options={fontOptions}
            value=""
            onChange={() => {}}
            placeholder="לא ניתן לבחור..."
            disabled
          />
        </div>

        {/* Error state */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">מצב שגיאה</h2>
          <Select
            label="בחירה עם שגיאה"
            options={colorOptions}
            value=""
            onChange={() => {}}
            placeholder="בחר אפשרות..."
            error="שדה זה הוא חובה"
            required
          />
        </div>
      </div>

      {/* Features List */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">✨ תכונות הקומפוננטה</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              תמיכה מלאה ב-RTL ועברית
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              חיפוש בתוך האפשרויות
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              בחירה מרובה (Multi-select)
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              כפתור ניקוי (Clearable)
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              ניווט עם מקלדת
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              גדלים שונים (sm, md, lg)
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              סגנונות שונים (default, filled, outlined)
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              רנדור מותאם אישית
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              מצבי שגיאה ו-loading
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              אנימציות חלקות
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownDemo;

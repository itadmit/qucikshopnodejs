/**
 * 🎨 QuickShop Site Builder - Settings Panel
 * פאנל הגדרות מתקדם בהשראת שופיפיי עם תמיכה מלאה ב-RTL
 */

import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Type,
  Settings,
  Info
} from 'lucide-react';
import { Select } from '../../ui';
import { 
  FontPicker, 
  CollectionPicker, 
  ProductList, 
  MenuPicker, 
  IconPicker 
} from './SettingInputs';
import RichTextEditor from '../../ui/RichTextEditor';
import ColorPicker from './ui/ColorPicker';
import RangeSlider from './ui/RangeSlider';
import { SETTING_TYPES } from '../types/settingTypes';

// Custom Toggle Component like Shopify - RTL Compatible
const Toggle = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-900 text-right">{label}</span>
      <div dir="ltr">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
            checked 
              ? 'bg-gray-900 shadow-inner' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          role="switch"
          aria-checked={checked}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-200 ease-in-out ${
              checked 
                ? 'translate-x-6 shadow-md' 
                : 'translate-x-1 shadow-sm'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

const SettingsPanel = ({ 
  isOpen, 
  onClose, 
  section, 
  settings = {}, 
  onSettingChange,
  title = "הגדרות סקשן"
}) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Debug props (removed for production)
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  if (!isOpen) return null;

  // Load menus when component mounts
  React.useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const storeSlug = localStorage.getItem('currentStoreSlug') || 'yogevstore';
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      const response = await fetch(`${baseUrl}/menus/${storeSlug}`);
      
      if (response.ok) {
        const menusData = await response.json();
        setMenus(menusData);
      }
    } catch (error) {
      console.error('Error loading menus:', error);
    } finally {
      setLoadingMenus(false);
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const renderSettingInput = (setting) => {
    const value = settings[setting.id] !== undefined ? settings[setting.id] : setting.default;

    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onSettingChange(setting.id, e.target.value)}
            placeholder={setting.placeholder}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white hover:border-gray-400"
            dir="rtl"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onSettingChange(setting.id, e.target.value)}
            placeholder={setting.placeholder}
            rows={setting.rows || 3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white hover:border-gray-400 resize-none"
            dir="rtl"
          />
        );

      case 'richtext':
      case SETTING_TYPES.RICHTEXT:
        return (
          <div className="w-full">
            <RichTextEditor
              value={value || ''}
              onChange={(content) => onSettingChange(setting.id, content)}
              placeholder={setting.placeholder || 'הכנס תוכן עשיר...'}
              minHeight="150px"
              maxHeight="400px"
              dir="rtl"
              className="text-sm"
            />
          </div>
        );

      case 'select':
        return (
          <Select
            options={setting.options || []}
            value={value}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            placeholder={setting.placeholder || 'בחר אפשרות...'}
            size="sm"
            className="text-sm"
          />
        );

      // סוגי הגדרות חדשים
      case SETTING_TYPES.FONT_PICKER:
        return (
          <FontPicker
            value={value}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            placeholder={setting.placeholder}
            hebrewSupport={setting.hebrewSupport !== false}
            showPreview={setting.showPreview !== false}
          />
        );

      case SETTING_TYPES.COLLECTION_PICKER:
        return (
          <CollectionPicker
            value={value}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            placeholder={setting.placeholder}
            multiple={setting.multiple || false}
            showProductCount={setting.showProductCount !== false}
          />
        );

      case SETTING_TYPES.PRODUCT_LIST:
        return (
          <ProductList
            value={value}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            maxProducts={setting.maxProducts || 12}
            showImages={setting.showImages !== false}
            showPrices={setting.showPrices !== false}
          />
        );

      case SETTING_TYPES.MENU_PICKER:
        return (
          <MenuPicker
            value={value}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            placeholder={setting.placeholder}
            showPreview={setting.showPreview !== false}
          />
        );

      case SETTING_TYPES.ICON_PICKER:
        return (
          <IconPicker
            value={value}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            placeholder={setting.placeholder}
            size={setting.size || 'medium'}
            showPreview={setting.showPreview !== false}
          />
        );

      case SETTING_TYPES.VIDEO:
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // TODO: Upload video to server and get URL
                  onSettingChange(setting.id, URL.createObjectURL(file));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {value && (
              <div className="mt-2">
                <video 
                  src={value} 
                  controls 
                  className="w-full max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <Toggle
            checked={Boolean(value)}
            onChange={(checked) => onSettingChange(setting.id, checked)}
            label={setting.label}
          />
        );

      case 'color':
        return (
          <ColorPicker
            value={value}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            label=""
            showPresets={true}
            showPrimarySecondary={true}
            showTransparent={setting.allowTransparent !== false}
            showClear={setting.allowClear !== false}
            allowEmpty={setting.allowEmpty === true}
          />
        );

      case 'range':
        return (
          <RangeSlider
            value={value}
            min={setting.min || 0}
            max={setting.max || 100}
            step={setting.step || 1}
            onChange={(newValue) => onSettingChange(setting.id, newValue)}
            label=""
            showValue={true}
            unit={setting.unit || ''}
          />
        );

      case 'image':
      case 'image_picker':
        return (
          <div className="space-y-2">
            {value && (
              <div className="relative">
                <img 
                  src={value} 
                  alt="תמונה נבחרת" 
                  className="w-full h-32 object-cover rounded-md border"
                />
                <button
                  onClick={() => onSettingChange(setting.id, '')}
                  className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button
              onClick={() => {
                // כאן נוסיף לוגיקה לפתיחת בורר תמונות
                const url = prompt('הכניסו כתובת תמונה:');
                if (url) onSettingChange(setting.id, url);
              }}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              {value ? 'שנה תמונה' : 'בחר תמונה'}
            </button>
          </div>
        );

      case 'url':
        return (
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => onSettingChange(setting.id, e.target.value)}
              placeholder={setting.placeholder || 'https://example.com'}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
              dir="rtl"
            />
            <LinkIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        );

      case 'link_list':
        const selectedMenu = menus.find(menu => menu.handle === value);
        return (
          <div className="relative">
            <select
              value={value || ''}
              onChange={(e) => onSettingChange(setting.id, e.target.value)}
              disabled={loadingMenus}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-right bg-white"
              dir="rtl"
            >
              <option value="">בחר תפריט</option>
              {menus.map((menu) => (
                <option key={menu.handle} value={menu.handle}>
                  {menu.name} ({menu.items?.length || 0} פריטים)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            {loadingMenus && (
              <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        );

      case 'button':
        const buttonClasses = setting.buttonStyle === 'danger' 
          ? 'w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors'
          : 'w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors';
        
        return (
          <button
            onClick={() => {
              if (setting.id === 'resetPage') {
                if (confirm('האם אתה בטוח שברצונך לאפס את הדף למצב הדיפולטיבי? פעולה זו תמחק את כל השינויים שלך.')) {
                  onSettingChange('resetPage', true);
                }
              } else {
                onSettingChange(setting.id, true);
              }
            }}
            className={buttonClasses}
          >
            {setting.buttonText || setting.label}
          </button>
        );

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            סוג הגדרה לא נתמך: {setting.type}
          </div>
        );
    }
  };

  const renderSetting = (setting, index) => {
    if (setting.type === 'header') {
      return (
        <div key={index} className="border-b border-gray-200 pb-4 mb-6 first:border-b-0 first:pb-0 first:mb-4">
          <h3 className="text-sm font-semibold text-gray-900 text-right tracking-wide">{setting.label}</h3>
        </div>
      );
    }

    if (setting.type === 'paragraph') {
      return (
        <div key={index} className="text-xs text-gray-600 leading-relaxed text-right mb-4">
          {setting.content}
        </div>
      );
    }

    return (
      <div key={index} className="space-y-2">
        {setting.type !== 'checkbox' && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">
              {setting.label}
            </label>
            {setting.info && (
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-20 shadow-lg">
                  {setting.info}
                  <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="w-full">
          {renderSettingInput(setting)}
        </div>
      </div>
    );
  };

  // Handle general settings
  const isGeneralSettings = section?.id === 'general';
  const allSettings = isGeneralSettings ? getGeneralSettings() : (section?.settings || []);
  
  // Debug logging (removed for production)

  // Group settings by their group property - Shopify style
  const renderSettingsGroups = (settings) => {
    const groups = settings.reduce((acc, setting) => {
      const group = setting.group || 'general';
      if (!acc[group]) acc[group] = [];
      acc[group].push(setting);
      return acc;
    }, {});

    const groupOrder = ['content', 'layout', 'style', 'behavior', 'advanced', 'general'];
    const groupLabels = {
      content: 'תוכן',
      layout: 'פריסה', 
      style: 'עיצוב',
      behavior: 'התנהגות',
      advanced: 'מתקדם',
      general: 'כללי'
    };

    return groupOrder.map(groupKey => {
      if (!groups[groupKey] || groups[groupKey].length === 0) return null;
      
      return (
        <div key={groupKey} className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse pb-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              {groupLabels[groupKey]}
            </h3>
          </div>
          <div className="space-y-4">
            {groups[groupKey].map((setting, index) => renderSetting(setting, `${groupKey}-${index}`))}
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  // General settings configuration
  function getGeneralSettings() {
    return [
      // צבעי ערכת נושא
      {
        id: 'themeColors',
        type: 'header',
        label: 'צבעי ערכת נושא',
        group: 'design'
      },
      {
        id: 'primaryColor',
        type: 'color',
        label: 'צבע ראשי',
        default: '#3b82f6',
        info: 'צבע זה ישמש לכפתורים, קישורים ואלמנטים מרכזיים',
        group: 'design'
      },
      {
        id: 'secondaryColor', 
        type: 'color',
        label: 'צבע משני',
        default: '#8b5cf6',
        info: 'צבע זה ישמש לאלמנטים משניים והדגשות',
        group: 'design'
      },
      {
        id: 'accentColor',
        type: 'color',
        label: 'צבע הדגשה',
        default: '#10b981',
        info: 'צבע זה ישמש להדגשות מיוחדות ומבצעים',
        group: 'design'
      },
      {
        id: 'backgroundColor',
        type: 'color',
        label: 'צבע רקע כללי',
        default: '#ffffff',
        info: 'צבע הרקע הכללי של האתר',
        group: 'design'
      },
      {
        id: 'textColor',
        type: 'color',
        label: 'צבע טקסט ראשי',
        default: '#1f2937',
        info: 'צבע הטקסט הראשי באתר',
        group: 'design'
      },

      // טיפוגרפיה
      {
        id: 'typography',
        type: 'header',
        label: 'טיפוגרפיה',
        group: 'design'
      },
      {
        id: 'fontFamily',
        type: 'select',
        label: 'גופן ראשי',
        options: [
          { value: 'Inter', label: 'Inter (אנגלית)' },
          { value: 'Heebo', label: 'Heebo (עברית + אנגלית)' },
          { value: 'Assistant', label: 'Assistant (עברית + אנגלית)' },
          { value: 'Rubik', label: 'Rubik (עברית + אנגלית)' },
          { value: 'Noto Sans Hebrew', label: 'Noto Sans Hebrew (עברית + אנגלית)' },
          { value: 'Open Sans', label: 'Open Sans (אנגלית)' },
          { value: 'Roboto', label: 'Roboto (אנגלית)' },
          { value: 'Poppins', label: 'Poppins (אנגלית)' },
          { value: 'Montserrat', label: 'Montserrat (אנגלית)' }
        ],
        default: 'Noto Sans Hebrew',
        info: 'גופן זה ישמש לכל הטקסטים באתר',
        group: 'design'
      },
      {
        id: 'headingFontFamily',
        type: 'select',
        label: 'גופן כותרות',
        options: [
          { value: 'inherit', label: 'זהה לגופן הראשי' },
          { value: 'Inter', label: 'Inter (אנגלית)' },
          { value: 'Heebo', label: 'Heebo (עברית + אנגלית)' },
          { value: 'Assistant', label: 'Assistant (עברית + אנגלית)' },
          { value: 'Rubik', label: 'Rubik (עברית + אנגלית)' },
          { value: 'Noto Sans Hebrew', label: 'Noto Sans Hebrew (עברית + אנגלית)' },
          { value: 'Playfair Display', label: 'Playfair Display (אנגלית)' },
          { value: 'Merriweather', label: 'Merriweather (אנגלית)' }
        ],
        default: 'inherit',
        info: 'גופן זה ישמש לכותרות בלבד',
        group: 'design'
      },
      {
        id: 'fontSize',
        type: 'range',
        label: 'גודל גופן בסיסי',
        min: 14,
        max: 18,
        step: 1,
        unit: 'px',
        default: 16,
        info: 'גודל הגופן הבסיסי לטקסט רגיל',
        group: 'design'
      },

      // הגדרות כלליות
      {
        id: 'general',
        type: 'header',
        label: 'הגדרות כלליות',
        group: 'general'
      },
      {
        id: 'rtl',
        type: 'checkbox',
        label: 'תמיכה ב-RTL (עברית)',
        default: true,
        info: 'הפעלת תמיכה בכיוון כתיבה מימין לשמאל',
        group: 'general'
      },
      {
        id: 'containerWidth',
        type: 'select',
        label: 'רוחב מכולה מקסימלי',
        options: [
          { value: 'sm', label: 'קטן (640px)' },
          { value: 'md', label: 'בינוני (768px)' },
          { value: 'lg', label: 'גדול (1024px)' },
          { value: 'xl', label: 'גדול מאוד (1280px)' },
          { value: '2xl', label: 'ענק (1536px)' },
          { value: 'full', label: 'מלא (100%)' }
        ],
        default: 'xl',
        info: 'רוחב מקסימלי לתוכן האתר',
        group: 'general'
      },
      {
        id: 'borderRadius',
        type: 'range',
        label: 'עיגול פינות כללי',
        min: 0,
        max: 20,
        step: 1,
        unit: 'px',
        default: 8,
        info: 'רמת עיגול הפינות לכפתורים וקופסאות',
        group: 'general'
      },

      // פעולות
      {
        id: 'actions',
        type: 'header',
        label: 'פעולות',
        group: 'actions'
      },
      {
        id: 'resetPage',
        type: 'button',
        label: 'אפס דף למצב דיפולטיבי',
        buttonText: 'אפס דף',
        buttonStyle: 'danger',
        info: 'פעולה זו תמחק את כל השינויים ותחזיר את הדף למצב הדיפולטיבי',
        group: 'actions'
      }
    ];
  }

  return (
    <div className="settings-panel w-80 bg-white shadow-xl border-r border-gray-200 overflow-hidden flex flex-col h-full" dir="rtl">
      {/* Header - Shopify Style */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            {section?.icon ? (
              <section.icon className="w-4 h-4 text-gray-600" />
            ) : (
              <Settings className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isGeneralSettings ? 'הגדרות כלליות' : title}
            </h2>
            {section?.description && (
              <p className="text-xs text-gray-500 mt-0.5">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {allSettings.length > 0 ? (
          <div className="p-5 space-y-6">
            {renderSettingsGroups(allSettings)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">אין הגדרות זמינות</p>
            <p className="text-xs text-gray-500">בחר סקשן כדי לערוך את ההגדרות שלו</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;

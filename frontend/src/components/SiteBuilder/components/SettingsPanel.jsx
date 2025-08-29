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
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/menus/${storeSlug}`);
      
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right bg-white"
            dir="rtl"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onSettingChange(setting.id, e.target.value)}
            placeholder={setting.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-right bg-white"
            dir="rtl"
          />
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
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => onSettingChange(setting.id, e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onSettingChange(setting.id, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
              dir="rtl"
            />
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{setting.min}</span>
              <span className="text-xs text-gray-500">{setting.max}</span>
            </div>
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step || 1}
              value={value}
              onChange={(e) => onSettingChange(setting.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex items-center justify-center">
              <input
                type="number"
                value={value}
                onChange={(e) => onSettingChange(setting.id, parseInt(e.target.value))}
                min={setting.min}
                max={setting.max}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              {setting.unit && (
                <span className="mr-2 text-sm text-gray-500">{setting.unit}</span>
              )}
            </div>
          </div>
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
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
              dir="rtl"
            />
            <LinkIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-right bg-white"
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
      <div key={index} className="mb-4 last:mb-0">
        {setting.type !== 'checkbox' && (
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-900 text-right">
              {setting.label}
            </label>
            {setting.info && (
              <div className="group relative mr-2">
                <Info className="w-3 h-3 text-gray-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  {setting.info}
                </div>
              </div>
            )}
          </div>
        )}
        <div className={setting.type === 'checkbox' ? '' : 'bg-white'}>
          {renderSettingInput(setting)}
        </div>
      </div>
    );
  };

  // Handle general settings
  const isGeneralSettings = section?.id === 'general';
  const allSettings = isGeneralSettings ? getGeneralSettings() : (section?.settings || []);

  // General settings configuration
  function getGeneralSettings() {
    return [
      {
        id: 'primaryColor',
        type: 'color',
        label: 'צבע ראשי',
        default: '#3b82f6'
      },
      {
        id: 'secondaryColor', 
        type: 'color',
        label: 'צבע משני',
        default: '#8b5cf6'
      },
      {
        id: 'fontFamily',
        type: 'select',
        label: 'גופן',
        options: [
          { value: 'Inter', label: 'Inter (אנגלית)' },
          { value: 'Heebo', label: 'Heebo (עברית + אנגלית)' },
          { value: 'Assistant', label: 'Assistant (עברית + אנגלית)' },
          { value: 'Rubik', label: 'Rubik (עברית + אנגלית)' },
          { value: 'Noto Sans Hebrew', label: 'Noto Sans Hebrew (עברית + אנגלית)' },
          { value: 'Open Sans', label: 'Open Sans (אנגלית)' },
          { value: 'Roboto', label: 'Roboto (אנגלית)' }
        ],
        default: 'Noto Sans Hebrew'
      },
      {
        id: 'rtl',
        type: 'checkbox',
        label: 'תמיכה ב-RTL (עברית)',
        default: true
      },
      {
        id: 'resetPage',
        type: 'button',
        label: 'אפס דף למצב דיפולטיבי',
        buttonText: 'אפס דף',
        buttonStyle: 'danger',
        info: 'פעולה זו תמחק את כל השינויים ותחזיר את הדף למצב הדיפולטיבי'
      }
    ];
  }

  return (
    <div className="settings-panel w-80 bg-white shadow-xl border-r border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 text-right">
          {isGeneralSettings ? 'הגדרות כלליות' : title}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {allSettings.length > 0 ? (
          <div className="space-y-1">
            {allSettings.map((setting, index) => renderSetting(setting, index))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">אין הגדרות זמינות לסקשן זה</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;

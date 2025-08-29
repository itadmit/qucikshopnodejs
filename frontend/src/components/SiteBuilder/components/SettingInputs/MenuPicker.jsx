/**
 * 🧭 Menu Picker Component
 * בוחר תפריטים עם תצוגה מקדימה של פריטי התפריט
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, ChevronDown, ExternalLink, Home } from 'lucide-react';
import { Select } from '../../../ui';
import { menusApi } from '../../../../services/builderApi';

const MenuPicker = ({ 
  value, 
  onChange, 
  placeholder = 'בחר תפריט...', 
  showPreview = true,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // טעינת תפריטים מהשרת
  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const storeSlug = localStorage.getItem('currentStore');
        if (!storeSlug) {
          throw new Error('Store not found');
        }
        
        const response = await menusApi.getAll(storeSlug);
        setMenus(response.menus || []);
      } catch (err) {
        console.error('Failed to load menus:', err);
        setError('שגיאה בטעינת התפריטים');
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  // יצירת אפשרויות לרשימה הנפתחת
  const menuOptions = menus.map(menu => ({
    value: menu.id,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Menu className="w-4 h-4 text-gray-500" />
          <div>
            <div className="font-medium">{menu.name}</div>
            <div className="text-xs text-gray-500">
              {menu.handle} • {menu.items?.length || 0} פריטים
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {menu.location || 'ללא מיקום'}
        </div>
      </div>
    ),
    searchText: `${menu.name} ${menu.handle}`,
    menu: menu
  }));

  // הוספת אפשרות "ללא תפריט"
  const allOptions = [
    {
      value: '',
      label: (
        <div className="flex items-center gap-2 text-gray-500">
          <Menu className="w-4 h-4" />
          <span>ללא תפריט</span>
        </div>
      ),
      searchText: 'ללא תפריט none'
    },
    ...menuOptions
  ];

  // טיפול בשגיאה
  if (error) {
    return (
      <div className={`menu-picker ${className}`}>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <Menu className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`menu-picker ${className}`}>
      <Select
        value={value}
        onChange={onChange}
        options={allOptions}
        placeholder={placeholder}
        searchable
        searchPlaceholder="חפש תפריט..."
        loading={loading}
        className="w-full"
        renderOption={(option) => option.label}
      />
      
      {/* תצוגה מקדימה של התפריט הנבחר */}
      {showPreview && value && (
        <MenuPreview menuId={value} menus={menus} />
      )}
    </div>
  );
};

// קומפוננטת תצוגה מקדימה של תפריט
const MenuPreview = ({ menuId, menus }) => {
  const menu = menus.find(m => m.id === menuId);
  
  if (!menu || !menu.items || menu.items.length === 0) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
        <div className="text-sm text-gray-500 text-center">
          התפריט ריק או לא נמצא
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
      <div className="text-xs text-gray-500 mb-2">תצוגה מקדימה:</div>
      <div className="space-y-1">
        {menu.items.slice(0, 5).map((item, index) => (
          <MenuItemPreview key={index} item={item} level={0} />
        ))}
        {menu.items.length > 5 && (
          <div className="text-xs text-gray-400 mt-2">
            ועוד {menu.items.length - 5} פריטים...
          </div>
        )}
      </div>
    </div>
  );
};

// קומפוננטת תצוגה מקדימה של פריט תפריט
const MenuItemPreview = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  
  const getIcon = () => {
    switch (item.type) {
      case 'home':
        return <Home className="w-3 h-3" />;
      case 'external':
        return <ExternalLink className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`${level > 0 ? 'mr-4' : ''}`}>
      <div 
        className="flex items-center gap-2 py-1 text-sm hover:bg-white rounded px-2 cursor-pointer"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren && (
          <ChevronDown 
            className={`w-3 h-3 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
        {!hasChildren && <div className="w-3" />}
        
        {getIcon()}
        
        <span className={`flex-1 ${level > 0 ? 'text-gray-600' : 'text-gray-900'}`}>
          {item.title}
        </span>
        
        {item.target === '_blank' && (
          <ExternalLink className="w-3 h-3 text-gray-400" />
        )}
      </div>
      
      {hasChildren && isOpen && (
        <div className="mr-2">
          {item.children.map((child, index) => (
            <MenuItemPreview 
              key={index} 
              item={child} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPicker;

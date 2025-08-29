/**
 * 🎨 Icon Picker Component
 * בוחר אייקונים עם חיפוש וקטגוריות
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Grid3X3, 
  Star, 
  Heart, 
  ShoppingCart, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  Check,
  X,
  ChevronDown,
  Package,
  Truck,
  Shield,
  Zap,
  Award,
  Target,
  Smile,
  MessageCircle,
  Camera,
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  Download,
  Upload,
  Settings,
  Home,
  Building,
  Store
} from 'lucide-react';

const IconPicker = ({ 
  value, 
  onChange, 
  placeholder = 'בחר אייקון...', 
  size = 'medium',
  showPreview = true,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  // רשימת אייקונים מובנית (Lucide React)
  const iconLibrary = {
    // כלליים
    general: [
      { name: 'star', icon: Star, keywords: ['כוכב', 'דירוג', 'מועדף'] },
      { name: 'heart', icon: Heart, keywords: ['לב', 'אהבה', 'מועדף'] },
      { name: 'check', icon: Check, keywords: ['וי', 'אישור', 'נכון'] },
      { name: 'x', icon: X, keywords: ['איקס', 'סגירה', 'מחיקה'] },
      { name: 'search', icon: Search, keywords: ['חיפוש', 'מציאה'] },
      { name: 'settings', icon: Settings, keywords: ['הגדרות', 'ניהול'] },
      { name: 'grid', icon: Grid3X3, keywords: ['רשת', 'טבלה'] },
      { name: 'chevron-down', icon: ChevronDown, keywords: ['חץ', 'למטה'] }
    ],
    
    // אי-קומרס
    ecommerce: [
      { name: 'shopping-cart', icon: ShoppingCart, keywords: ['עגלה', 'קניות'] },
      { name: 'package', icon: Package, keywords: ['חבילה', 'מוצר'] },
      { name: 'truck', icon: Truck, keywords: ['משלוח', 'רכב'] },
      { name: 'store', icon: Store, keywords: ['חנות', 'קניון'] },
      { name: 'award', icon: Award, keywords: ['פרס', 'איכות'] },
      { name: 'shield', icon: Shield, keywords: ['מגן', 'אבטחה'] },
      { name: 'zap', icon: Zap, keywords: ['ברק', 'מהיר'] },
      { name: 'target', icon: Target, keywords: ['מטרה', 'דיוק'] }
    ],
    
    // תקשורת
    communication: [
      { name: 'mail', icon: Mail, keywords: ['מייל', 'אימייל'] },
      { name: 'phone', icon: Phone, keywords: ['טלפון', 'שיחה'] },
      { name: 'message-circle', icon: MessageCircle, keywords: ['הודעה', 'צ\'אט'] },
      { name: 'user', icon: User, keywords: ['משתמש', 'אדם'] },
      { name: 'smile', icon: Smile, keywords: ['חיוך', 'שמח'] }
    ],
    
    // מיקום וזמן
    location: [
      { name: 'map-pin', icon: MapPin, keywords: ['מפה', 'מיקום'] },
      { name: 'clock', icon: Clock, keywords: ['שעון', 'זמן'] },
      { name: 'home', icon: Home, keywords: ['בית', 'דף בית'] },
      { name: 'building', icon: Building, keywords: ['בניין', 'משרד'] }
    ],
    
    // מדיה
    media: [
      { name: 'camera', icon: Camera, keywords: ['מצלמה', 'צילום'] },
      { name: 'video', icon: Video, keywords: ['וידאו', 'סרטון'] },
      { name: 'music', icon: Music, keywords: ['מוזיקה', 'שיר'] },
      { name: 'image', icon: ImageIcon, keywords: ['תמונה', 'גרפיקה'] }
    ],
    
    // קבצים
    files: [
      { name: 'file-text', icon: FileText, keywords: ['קובץ', 'מסמך'] },
      { name: 'download', icon: Download, keywords: ['הורדה', 'שמירה'] },
      { name: 'upload', icon: Upload, keywords: ['העלאה', 'שליחה'] }
    ]
  };

  // קטגוריות
  const categories = [
    { id: 'all', name: 'הכל', count: Object.values(iconLibrary).flat().length },
    { id: 'general', name: 'כלליים', count: iconLibrary.general.length },
    { id: 'ecommerce', name: 'אי-קומרס', count: iconLibrary.ecommerce.length },
    { id: 'communication', name: 'תקשורת', count: iconLibrary.communication.length },
    { id: 'location', name: 'מיקום וזמן', count: iconLibrary.location.length },
    { id: 'media', name: 'מדיה', count: iconLibrary.media.length },
    { id: 'files', name: 'קבצים', count: iconLibrary.files.length }
  ];

  // קבלת כל האייקונים או לפי קטגוריה
  const getIcons = () => {
    const allIcons = selectedCategory === 'all' 
      ? Object.values(iconLibrary).flat()
      : iconLibrary[selectedCategory] || [];
    
    if (!searchQuery.trim()) return allIcons;
    
    return allIcons.filter(icon => 
      icon.name.includes(searchQuery.toLowerCase()) ||
      icon.keywords.some(keyword => 
        keyword.includes(searchQuery) || 
        searchQuery.includes(keyword)
      )
    );
  };

  const icons = getIcons();
  const selectedIcon = icons.find(icon => icon.name === value);

  // גדלי אייקונים
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <div className={`icon-picker relative ${className}`}>
      {/* כפתור בחירה */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          {selectedIcon ? (
            <>
              <selectedIcon.icon className={sizeClasses[size]} />
              <span className="text-sm">{selectedIcon.name}</span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* פאנל בחירה */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* חיפוש */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש אייקון..."
                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* קטגוריות */}
          <div className="flex overflow-x-auto border-b">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* רשת אייקונים */}
          <div className="p-3 max-h-48 overflow-y-auto">
            {icons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">לא נמצאו אייקונים</div>
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-2">
                {icons.map(icon => {
                  const IconComponent = icon.icon;
                  const isSelected = value === icon.name;
                  
                  return (
                    <button
                      key={icon.name}
                      onClick={() => {
                        onChange(icon.name);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                        isSelected ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                      }`}
                      title={icon.name}
                    >
                      <IconComponent className={sizeClasses[size]} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* כפתור ניקוי */}
          {value && (
            <div className="p-3 border-t">
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 border rounded-lg hover:bg-red-50"
              >
                הסר אייקון
              </button>
            </div>
          )}
        </div>
      )}

      {/* תצוגה מקדימה */}
      {showPreview && selectedIcon && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <div className="text-xs text-gray-500 mb-2">תצוגה מקדימה:</div>
          <div className="flex items-center gap-3">
            <selectedIcon.icon className="w-8 h-8 text-gray-700" />
            <div>
              <div className="font-medium text-sm">{selectedIcon.name}</div>
              <div className="text-xs text-gray-500">
                {selectedIcon.keywords.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* רקע לסגירה */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default IconPicker;

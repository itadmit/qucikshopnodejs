import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus,
  Layout,
  Type,
  Image,
  Star,
  MessageSquare,
  Grid3X3,
  Video,
  BarChart3,
  ShoppingBag,
  Calendar,
  Map,
  Users,
  Zap
} from 'lucide-react';

const SectionLibrary = ({ sections, onAddSection, compact = false }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories for sections
  const categories = [
    { id: 'all', name: 'הכל', icon: Grid3X3 },
    { id: 'headers', name: 'כותרות', icon: Layout },
    { id: 'content', name: 'תוכן', icon: Type },
    { id: 'product', name: 'מוצר', icon: ShoppingBag },
    { id: 'media', name: 'מדיה', icon: Image },
    { id: 'social_proof', name: 'הוכחה חברתית', icon: Star },
    { id: 'forms', name: 'טפסים', icon: MessageSquare },
    { id: 'ecommerce', name: 'מסחר אלקטרוני', icon: ShoppingBag },
    { id: 'analytics', name: 'אנליטיקה', icon: BarChart3 }
  ];

  // Filter sections based on search and category
  const filteredSections = sections.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = compact || selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {!compact && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">הוסף סקשן</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חפש סקשנים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 ml-3" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {compact && (
        <div className="p-4 border-b border-gray-200">
          {/* Search for compact mode */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="חפש סקשנים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {filteredSections.map(section => {
            const Icon = section.icon;
            
            // Get section preview info
            const getSectionPreview = (sectionId) => {
              const previews = {
                'product_title': {
                  description: 'כותרת המוצר ושם הספק עם הגדרות טיפוגרפיה',
                  preview: '🏷️',
                  color: 'bg-blue-50 text-blue-600'
                },
                'product_price': {
                  description: 'מחיר המוצר עם מבצעים וחיסכון',
                  preview: '💰',
                  color: 'bg-green-50 text-green-600'
                },
                'product_images': {
                  description: 'גלריית תמונות עם זום ותמונות ממוזערות',
                  preview: '🖼️',
                  color: 'bg-purple-50 text-purple-600'
                },
                'product_options': {
                  description: 'בחירת מידות, צבעים ואפשרויות נוספות',
                  preview: '⚙️',
                  color: 'bg-orange-50 text-orange-600'
                },
                'add_to_cart': {
                  description: 'כפתור הוספה לסל עם בחירת כמות',
                  preview: '🛒',
                  color: 'bg-red-50 text-red-600'
                },
                'hero': {
                  description: 'כותרת ראשית עם רקע ותמונה',
                  preview: '🎯',
                  color: 'bg-indigo-50 text-indigo-600'
                },
                'text_with_image': {
                  description: 'טקסט עם תמונה בפריסות שונות',
                  preview: '📝',
                  color: 'bg-gray-50 text-gray-600'
                },
                'gallery': {
                  description: 'גלריית תמונות ברשת או קרוסלה',
                  preview: '📷',
                  color: 'bg-pink-50 text-pink-600'
                },
                'testimonials': {
                  description: 'המלצות לקוחות עם דירוגים',
                  preview: '⭐',
                  color: 'bg-yellow-50 text-yellow-600'
                },
                'contact_form': {
                  description: 'טופס יצירת קשר מותאם אישית',
                  preview: '📧',
                  color: 'bg-teal-50 text-teal-600'
                }
              };
              
              return previews[sectionId] || {
                description: 'סקשן מותאם אישית',
                preview: '⚙️',
                color: 'bg-gray-50 text-gray-600'
              };
            };
            
            const sectionPreview = getSectionPreview(section.id);
            
            return (
              <div
                key={section.id}
                className="group border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
                onClick={() => onAddSection(section.id)}
              >
                {/* Header with preview */}
                <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${sectionPreview.color} group-hover:scale-110 transition-transform`}>
                    {sectionPreview.preview}
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-lg">
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {sectionPreview.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Settings preview */}
                <div className="px-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {section.schema.settings.filter(s => s.type !== 'header').slice(0, 4).map((setting, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-xs text-blue-700 rounded-full font-medium"
                      >
                        {setting.label}
                      </span>
                    ))}
                    {section.schema.settings.filter(s => s.type !== 'header').length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded-full">
                        +{section.schema.settings.filter(s => s.type !== 'header').length - 4} עוד
                      </span>
                    )}
                  </div>
                  
                  {/* Show available blocks count */}
                  {section.schema.blocks && section.schema.blocks.length > 0 && (
                    <div className="flex items-center mt-3 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg w-fit">
                      <Grid3X3 className="w-3 h-3 ml-1" />
                      {section.schema.blocks.length} בלוקים זמינים
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו סקשנים</h3>
            <p className="text-gray-500">נסה לשנות את מונחי החיפוש או הקטגוריה</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!compact && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <button
              onClick={() => onAddSection('hero')}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף Hero Section
            </button>
            <button
              onClick={() => onAddSection('text_with_image')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף טקסט עם תמונה
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionLibrary; 
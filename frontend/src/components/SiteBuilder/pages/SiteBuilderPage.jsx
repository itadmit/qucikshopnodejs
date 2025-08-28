import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Layout, 
  Eye, 
  Smartphone, 
  Monitor, 
  Save, 
  Undo, 
  Redo,
  Settings,
  Plus,
  Grid3X3,
  Type,
  Image,
  Video,
  ShoppingBag,
  Star,
  MessageSquare,
  Calendar,
  Map,
  BarChart3,
  ArrowRight,
  X,
  ChevronDown,
  Trash2,
  EyeOff,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import SectionLibrary from '../components/SectionLibrary';
import CanvasArea from '../components/CanvasArea';
import PropertiesPanel from '../components/PropertiesPanel';
import TemplateSelector from '../components/TemplateSelector';

// Import product sections
import ProductTitle from '../sections/ProductTitle';
import ProductPrice from '../sections/ProductPrice';
import ProductOptions from '../sections/ProductOptions';
import AddToCart from '../sections/AddToCart';
import ProductImages from '../sections/ProductImages';

const SiteBuilderPage = ({ user, onBack }) => {
  const { t } = useTranslation();
  const [currentTemplate, setCurrentTemplate] = useState('jupiter');
  const [selectedPage, setSelectedPage] = useState('home');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [selectedElement, setSelectedElement] = useState(null);
  const [pageStructure, setPageStructure] = useState({
    sections: [],
    settings: {}
  });

  // Default product page structure
  const getDefaultProductPageStructure = () => ({
    sections: [
      {
        id: 'product-images-1',
        type: 'product_images',
        settings: {
          layout: 'gallery',
          main_image_ratio: 'square',
          show_thumbnails: true,
          thumbnail_position: 'bottom',
          show_zoom: true,
          show_navigation: true
        }
      },
      {
        id: 'product-title-1',
        type: 'product_title',
        settings: {
          show_vendor: true,
          title_size: 'text-3xl',
          title_weight: 'font-bold',
          alignment: 'text-right'
        }
      },
      {
        id: 'product-price-1',
        type: 'product_price',
        settings: {
          show_compare_price: true,
          show_currency: true,
          price_size: 'text-xl',
          price_weight: 'font-bold',
          show_sale_badge: true
        }
      },
      {
        id: 'product-options-1',
        type: 'product_options',
        settings: {
          show_labels: true,
          option_style: 'buttons',
          show_selected_value: true
        }
      },
      {
        id: 'add-to-cart-1',
        type: 'add_to_cart',
        settings: {
          button_text: 'הוסף לסל',
          button_size: 'large',
          button_width: 'full',
          show_quantity: true,
          show_stock_info: true
        }
      }
    ],
    settings: {}
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Load page structure when page type changes
  useEffect(() => {
    if (selectedPage === 'product') {
      // Load existing product page structure or use default
      const existingStructure = localStorage.getItem(`page_structure_${selectedPage}`);
      if (existingStructure) {
        try {
          setPageStructure(JSON.parse(existingStructure));
        } catch (error) {
          console.error('Error loading page structure:', error);
          setPageStructure(getDefaultProductPageStructure());
        }
      } else {
        setPageStructure(getDefaultProductPageStructure());
      }
    } else {
      // For other pages, load existing or empty structure
      const existingStructure = localStorage.getItem(`page_structure_${selectedPage}`);
      if (existingStructure) {
        try {
          setPageStructure(JSON.parse(existingStructure));
        } catch (error) {
          console.error('Error loading page structure:', error);
          setPageStructure({ sections: [], settings: {} });
        }
      } else {
        setPageStructure({ sections: [], settings: {} });
      }
    }
  }, [selectedPage]);

  // Available page types
  const pageTypes = [
    { id: 'home', name: 'עמוד בית', icon: Layout },
    { id: 'product', name: 'עמוד מוצר', icon: ShoppingBag },
    { id: 'about', name: 'אודות', icon: Type },
    { id: 'contact', name: 'צור קשר', icon: MessageSquare },
    { id: 'services', name: 'שירותים', icon: Grid3X3 },
    { id: 'portfolio', name: 'תיק עבודות', icon: Image },
    { id: 'blog', name: 'בלוג', icon: Calendar }
  ];

  // Available sections
  const availableSections = [
    {
      id: 'hero',
      name: 'Hero Section',
      icon: Layout,
      category: 'headers',
      schema: {
        name: 'Hero Section',
        settings: [
          { type: 'header', content: 'תוכן' },
          { type: 'text', id: 'title', label: 'כותרת', default: 'ברוכים הבאים לאתר שלנו' },
          { type: 'textarea', id: 'subtitle', label: 'תת כותרת', default: 'אנחנו כאן כדי לעזור לכם' },
          { type: 'image_picker', id: 'background_image', label: 'תמונת רקע' },
          
          { type: 'header', content: 'טיפוגרפיה' },
          { type: 'select', id: 'title_size', label: 'גודל כותרת', options: [
            { value: 'small', label: 'קטן' },
            { value: 'medium', label: 'בינוני' },
            { value: 'large', label: 'גדול' },
            { value: 'extra_large', label: 'גדול מאוד' }
          ], default: 'large' },
          { type: 'select', id: 'title_weight', label: 'עובי כותרת', options: [
            { value: 'normal', label: 'רגיל' },
            { value: 'medium', label: 'בינוני' },
            { value: 'semibold', label: 'חצי מודגש' },
            { value: 'bold', label: 'מודגש' }
          ], default: 'bold' },
          
          { type: 'header', content: 'צבעים' },
          { type: 'color', id: 'text_color', label: 'צבע טקסט', default: '#ffffff' },
          { type: 'color', id: 'background_color', label: 'צבע רקע', default: '#000000' },
          { type: 'color', id: 'overlay_color', label: 'צבע שכבת כיסוי', default: '#000000' },
          
          { type: 'header', content: 'פריסה' },
          { type: 'select', id: 'alignment', label: 'יישור', options: [
            { value: 'left', label: 'שמאל' },
            { value: 'center', label: 'מרכז' },
            { value: 'right', label: 'ימין' }
          ], default: 'center' },
          { type: 'select', id: 'height', label: 'גובה', options: [
            { value: 'small', label: 'קטן (400px)' },
            { value: 'medium', label: 'בינוני (500px)' },
            { value: 'large', label: 'גדול (600px)' },
            { value: 'full', label: 'מסך מלא' }
          ], default: 'medium' },
          
          { type: 'header', content: 'ריווח' },
          { type: 'range', id: 'padding_top', label: 'ריווח עליון', min: 0, max: 100, step: 5, unit: 'px', default: 40 },
          { type: 'range', id: 'padding_bottom', label: 'ריווח תחתון', min: 0, max: 100, step: 5, unit: 'px', default: 40 },
          { type: 'range', id: 'padding_left', label: 'ריווח שמאלי', min: 0, max: 100, step: 5, unit: 'px', default: 20 },
          { type: 'range', id: 'padding_right', label: 'ריווח ימני', min: 0, max: 100, step: 5, unit: 'px', default: 20 }
        ],
        blocks: [
          {
            type: 'button',
            name: 'כפתור',
            settings: [
              { type: 'text', id: 'text', label: 'טקסט כפתור', default: 'לחץ כאן' },
              { type: 'url', id: 'link', label: 'קישור' },
              { type: 'select', id: 'style', label: 'סגנון', options: [
                { value: 'primary', label: 'ראשי' },
                { value: 'secondary', label: 'משני' },
                { value: 'outline', label: 'מתאר' }
              ], default: 'primary' }
            ]
          }
        ],
        presets: [
          {
            name: 'Hero עם כפתור',
            settings: {
              title: 'ברוכים הבאים לאתר שלנו',
              subtitle: 'אנחנו כאן כדי לעזור לכם להצליח'
            },
            blocks: [
              { type: 'button', settings: { text: 'התחל עכשיו', style: 'primary' } }
            ]
          }
        ]
      }
    },
    {
      id: 'text_with_image',
      name: 'טקסט עם תמונה',
      icon: Type,
      category: 'content',
      schema: {
        name: 'טקסט עם תמונה',
        settings: [
          { type: 'header', content: 'תוכן' },
          { type: 'text', id: 'heading', label: 'כותרת' },
          { type: 'richtext', id: 'content', label: 'תוכן' },
          { type: 'image_picker', id: 'image', label: 'תמונה' },
          
          { type: 'header', content: 'טיפוגרפיה' },
          { type: 'select', id: 'heading_size', label: 'גודל כותרת', options: [
            { value: 'small', label: 'קטן' },
            { value: 'medium', label: 'בינוני' },
            { value: 'large', label: 'גדול' }
          ], default: 'medium' },
          { type: 'select', id: 'text_size', label: 'גודל טקסט', options: [
            { value: 'small', label: 'קטן' },
            { value: 'medium', label: 'בינוני' },
            { value: 'large', label: 'גדול' }
          ], default: 'medium' },
          
          { type: 'header', content: 'צבעים' },
          { type: 'color', id: 'heading_color', label: 'צבע כותרת', default: '#000000' },
          { type: 'color', id: 'text_color', label: 'צבע טקסט', default: '#666666' },
          { type: 'color', id: 'background_color', label: 'צבע רקע', default: '#ffffff' },
          
          { type: 'header', content: 'פריסה' },
          { type: 'select', id: 'layout', label: 'פריסה', options: [
            { value: 'image_left', label: 'תמונה משמאל' },
            { value: 'image_right', label: 'תמונה מימין' },
            { value: 'image_top', label: 'תמונה למעלה' }
          ], default: 'image_right' },
          { type: 'select', id: 'alignment', label: 'יישור טקסט', options: [
            { value: 'left', label: 'שמאל' },
            { value: 'center', label: 'מרכז' },
            { value: 'right', label: 'ימין' }
          ], default: 'right' },
          
          { type: 'header', content: 'ריווח' },
          { type: 'range', id: 'section_padding', label: 'ריווח סקשן', min: 0, max: 100, step: 5, unit: 'px', default: 40 },
          { type: 'range', id: 'content_gap', label: 'רווח בין תמונה לטקסט', min: 0, max: 80, step: 5, unit: 'px', default: 30 }
        ]
      }
    },
    {
      id: 'gallery',
      name: 'גלריית תמונות',
      icon: Image,
      category: 'media',
      schema: {
        name: 'גלריית תמונות',
        settings: [
          { type: 'text', id: 'heading', label: 'כותרת גלריה' },
          { type: 'range', id: 'columns', label: 'מספר עמודות', min: 1, max: 6, default: 3 },
          { type: 'checkbox', id: 'show_captions', label: 'הצג כיתובים', default: false }
        ],
        blocks: [
          {
            type: 'image',
            name: 'תמונה',
            settings: [
              { type: 'image_picker', id: 'image', label: 'תמונה' },
              { type: 'text', id: 'caption', label: 'כיתוב' },
              { type: 'url', id: 'link', label: 'קישור' }
            ]
          }
        ]
      }
    },
    {
      id: 'testimonials',
      name: 'המלצות',
      icon: Star,
      category: 'social_proof',
      schema: {
        name: 'המלצות',
        settings: [
          { type: 'text', id: 'heading', label: 'כותרת', default: 'מה הלקוחות שלנו אומרים' },
          { type: 'select', id: 'layout', label: 'פריסה', options: [
            { value: 'grid', label: 'רשת' },
            { value: 'carousel', label: 'קרוסלה' }
          ], default: 'grid' }
        ],
        blocks: [
          {
            type: 'testimonial',
            name: 'המלצה',
            settings: [
              { type: 'richtext', id: 'quote', label: 'ציטוט' },
              { type: 'text', id: 'author', label: 'שם המליץ' },
              { type: 'text', id: 'position', label: 'תפקיד' },
              { type: 'image_picker', id: 'avatar', label: 'תמונת פרופיל' },
              { type: 'range', id: 'rating', label: 'דירוג', min: 1, max: 5, default: 5 }
            ]
          }
        ]
      }
    },
    {
      id: 'contact_form',
      name: 'טופס יצירת קשר',
      icon: MessageSquare,
      category: 'forms',
      schema: {
        name: 'טופס יצירת קשר',
        settings: [
          { type: 'text', id: 'heading', label: 'כותרת', default: 'צור קשר' },
          { type: 'textarea', id: 'description', label: 'תיאור' },
          { type: 'text', id: 'submit_text', label: 'טקסט כפתור שליחה', default: 'שלח הודעה' }
        ],
        blocks: [
          {
            type: 'field',
            name: 'שדה',
            settings: [
              { type: 'text', id: 'label', label: 'תווית שדה' },
              { type: 'select', id: 'type', label: 'סוג שדה', options: [
                { value: 'text', label: 'טקסט' },
                { value: 'email', label: 'אימייל' },
                { value: 'tel', label: 'טלפון' },
                { value: 'textarea', label: 'טקסט ארוך' }
              ], default: 'text' },
              { type: 'checkbox', id: 'required', label: 'שדה חובה', default: false }
            ]
          }
        ]
      }
    },
    // Product sections
    {
      id: 'product_title',
      name: 'כותרת מוצר',
      icon: Type,
      category: 'product',
      schema: ProductTitle.schema.schema
    },
    {
      id: 'product_price',
      name: 'מחיר מוצר',
      icon: DollarSign,
      category: 'product',
      schema: ProductPrice.schema.schema
    },
    {
      id: 'product_images',
      name: 'תמונות מוצר',
      icon: Image,
      category: 'product',
      schema: ProductImages.schema.schema
    },
    {
      id: 'product_options',
      name: 'אפשרויות מוצר',
      icon: Settings,
      category: 'product',
      schema: ProductOptions.schema.schema
    },
    {
      id: 'add_to_cart',
      name: 'הוספה לסל',
      icon: ShoppingCart,
      category: 'product',
      schema: AddToCart.schema.schema
    }
  ];

  // Save current state to history
  const saveToHistory = (newStructure) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newStructure)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Save to localStorage
    localStorage.setItem(`page_structure_${selectedPage}`, JSON.stringify(newStructure));
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPageStructure(history[historyIndex - 1]);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPageStructure(history[historyIndex + 1]);
    }
  };

  // Add section to page
  const addSection = (sectionType) => {
    const section = availableSections.find(s => s.id === sectionType);
    if (section) {
      const newSection = {
        id: `${sectionType}_${Date.now()}`,
        type: sectionType,
        settings: {},
        blocks: []
      };

      // Apply preset if available
      if (section.schema.presets && section.schema.presets.length > 0) {
        const preset = section.schema.presets[0];
        newSection.settings = { ...preset.settings };
        newSection.blocks = preset.blocks ? [...preset.blocks] : [];
      }

      const newStructure = {
        ...pageStructure,
        sections: [...pageStructure.sections, newSection]
      };
      
      setPageStructure(newStructure);
      saveToHistory(newStructure);
    }
  };

  // Remove section
  const removeSection = (sectionId) => {
    const newStructure = {
      ...pageStructure,
      sections: pageStructure.sections.filter(s => s.id !== sectionId)
    };
    setPageStructure(newStructure);
    saveToHistory(newStructure);
  };

  // Update section settings
  const updateSection = (sectionId, updates) => {
    const newStructure = {
      ...pageStructure,
      sections: pageStructure.sections.map(section => 
        section.id === sectionId 
          ? { ...section, ...updates }
          : section
      )
    };
    setPageStructure(newStructure);
    saveToHistory(newStructure);
  };

  // Save page
  const handleSave = async () => {
    try {
      // TODO: Implement save to backend
      console.log('Saving page:', selectedPage, pageStructure);
      alert('העמוד נשמר בהצלחה!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('שגיאה בשמירת העמוד');
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSidebarOpen(true);
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedCategory(null);
  };

  // Filter sections based on page type
  const getFilteredSections = () => {
    if (selectedPage === 'product') {
      // For product pages, show all sections but prioritize product sections
      return availableSections;
    }
    // For other pages, exclude product-specific sections
    return availableSections.filter(section => section.category !== 'product');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={onBack}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              חזור לדשבורד
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">עורך האתר</h1>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm text-gray-500">התבנית שאתה משתמש:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md font-medium">
                Jupiter
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Page Selector */}
            <div className="relative">
              <select 
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                style={{ backgroundImage: 'none' }}
              >
                {pageTypes.map(page => (
                  <option key={page.id} value={page.id}>{page.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Preview Mode Toggle */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center px-3 py-2 rounded-lg ${isPreviewMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-opacity-80`}
              >
                <Eye className="w-4 h-4 ml-2" />
                {isPreviewMode ? 'עריכה' : 'תצוגה מקדימה'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 ml-2" />
                שמור
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Sections Tree */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{selectedPage}</h2>
              <p className="text-sm text-gray-500 mt-1">עמוד בית</p>
            </div>
            
            {/* Sections List */}
            <div className="p-4">
              <div className="space-y-2">
                {pageStructure.sections.map((section, index) => {
                  const sectionSchema = availableSections.find(s => s.id === section.type);
                  const isSelected = selectedElement?.type === 'section' && selectedElement?.id === section.id;
                  
                  return (
                    <div key={section.id} className="border border-gray-200 rounded-lg">
                      {/* Section Header */}
                      <div 
                        className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedElement({ type: 'section', id: section.id })}
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            {sectionSchema?.icon && <sectionSchema.icon className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {sectionSchema?.name || section.type}
                            </div>
                            <div className="text-xs text-gray-500">סקשן {index + 1}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle section visibility
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSection(section.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Section Blocks */}
                      {section.blocks && section.blocks.length > 0 && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          {section.blocks.map((block, blockIndex) => (
                            <div 
                              key={blockIndex}
                              className="p-2 ml-8 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-100"
                              onClick={() => setSelectedElement({ type: 'block', sectionId: section.id, blockIndex })}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                                    <Type className="w-3 h-3 text-gray-500" />
                                  </div>
                                  <span className="text-sm text-gray-700">{block.type}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove block
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Add Section Button */}
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">הוסף סקשן</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Left Sidebar - Sliding Section Library */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'כל הסקשנים' : selectedCategory ? `סקשני ${selectedCategory}` : 'בחר סקשן'}
              </h3>
              <button
                onClick={closeSidebar}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedCategory && (
                <SectionLibrary 
                  sections={selectedCategory === 'all' ? getFilteredSections() : getFilteredSections().filter(s => s.category === selectedCategory)}
                  onAddSection={(sectionId) => {
                    addSection(sectionId);
                    closeSidebar();
                  }}
                  compact={true}
                />
              )}
            </div>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
        )}

        {/* Canvas Area */}
        <div className="flex-1">
          <CanvasArea
            pageStructure={pageStructure}
            previewMode={previewMode}
            isPreviewMode={isPreviewMode}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateSection={updateSection}
            onRemoveSection={removeSection}
            availableSections={getFilteredSections()}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {!isPreviewMode && (
          <>
            {/* Right Sidebar - Properties Panel */}
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
              <PropertiesPanel
                selectedElement={selectedElement}
                pageStructure={pageStructure}
                onUpdateSection={updateSection}
                availableSections={getFilteredSections()}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SiteBuilderPage; 
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Palette, 
  Monitor, 
  Smartphone, 
  Save, 
  Eye,
  Navigation,
  Layout,
  ShoppingBag,
  Grid3X3,
  Paintbrush,
  Settings,
  Globe,
  Layers,
  Zap,
  CheckCircle
} from 'lucide-react';

const DesignPage = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('header');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [designSettings, setDesignSettings] = useState({
    header: {
      showTopBar: true,
      topBarBgColor: '#000000',
      topBarTextColor: '#ffffff',
      showPhone: true,
      showEmail: true,
      showSocialLinks: true,
      headerBgColor: '#ffffff',
      logoSize: 'medium',
      navigationStyle: 'horizontal'
    },
    footer: {
      bgColor: '#1f2937',
      textColor: '#ffffff',
      showSocialLinks: true,
      showNewsletter: true,
      showLinks: true,
      layout: 'columns'
    },
    categoryPage: {
      layout: 'grid',
      productsPerRow: 4,
      showFilters: true,
      showSorting: true,
      cardStyle: 'modern'
    },
    productPage: {
      layout: 'sidebar',
      imageGalleryStyle: 'thumbnails',
      showRelatedProducts: true,
      showReviews: true,
      buttonStyle: 'rounded'
    }
  });

  const sections = [
    { 
      id: 'header', 
      icon: Navigation, 
      label: t('design.header') || 'הדר',
      description: 'עיצוב הדר העליון והתפריט',
      gradient: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)'
    },
    { 
      id: 'footer', 
      icon: Layout, 
      label: t('design.footer') || 'פוטר',
      description: 'עיצוב הפוטר התחתון',
      gradient: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)'
    },
    { 
      id: 'categoryPage', 
      icon: Grid3X3, 
      label: t('design.categoryPage') || 'עמוד קטגוריה',
      description: 'פריסת מוצרים וקטגוריות',
      gradient: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)'
    },
    { 
      id: 'productPage', 
      icon: ShoppingBag, 
      label: t('design.productPage') || 'עמוד מוצר',
      description: 'עיצוב דף המוצר הבודד',
      gradient: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)'
    }
  ];

  const handleSettingChange = (section, key, value) => {
    setDesignSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Custom Toggle Component
  const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 cursor-pointer">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
          <div 
            className="absolute top-[2px] right-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-200 ease-in-out"
            style={{
              transform: checked ? 'translateX(-1.2rem)' : 'translateX(0)'
            }}
          ></div>
        </div>
      </label>
    </div>
  );

  // Custom Color Picker Component
  const ColorPicker = ({ label, value, onChange, description }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        />
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );

  // Custom Select Component
  const CustomSelect = ({ label, value, onChange, options, description }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'left 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingLeft: '2.75rem'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  const renderHeaderSettings = () => (
    <div className="space-y-6">
      {/* Top Bar Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900">
              <Layers className="w-5 h-5 text-white" />
            </div>
                          <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">הגדרות Top Bar</h3>
                <p className="text-sm text-gray-700">התאם את הרצועה העליונה של האתר</p>
              </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <Toggle
            checked={designSettings.header.showTopBar}
            onChange={(e) => handleSettingChange('header', 'showTopBar', e.target.checked)}
            label="הצג Top Bar"
            description="הצג רצועה עליונה עם פרטי קשר ורשתות חברתיות"
          />

          {designSettings.header.showTopBar && (
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <ColorPicker
                label="צבע רקע Top Bar"
                value={designSettings.header.topBarBgColor}
                onChange={(e) => handleSettingChange('header', 'topBarBgColor', e.target.value)}
                description="בחר צבע רקע לרצועה העליונה"
              />

              <ColorPicker
                label="צבע טקסט Top Bar"
                value={designSettings.header.topBarTextColor}
                onChange={(e) => handleSettingChange('header', 'topBarTextColor', e.target.value)}
                description="בחר צבע טקסט לרצועה העליונה"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Toggle
                  checked={designSettings.header.showPhone}
                  onChange={(e) => handleSettingChange('header', 'showPhone', e.target.checked)}
                  label="הצג טלפון"
                />
                <Toggle
                  checked={designSettings.header.showEmail}
                  onChange={(e) => handleSettingChange('header', 'showEmail', e.target.checked)}
                  label="הצג אימייל"
                />
                <Toggle
                  checked={designSettings.header.showSocialLinks}
                  onChange={(e) => handleSettingChange('header', 'showSocialLinks', e.target.checked)}
                  label="רשתות חברתיות"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">הגדרות הדר ראשי</h3>
              <p className="text-sm text-gray-700">התאם את הלוגו והתפריט הראשי</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <ColorPicker
            label="צבע רקע הדר"
            value={designSettings.header.headerBgColor}
            onChange={(e) => handleSettingChange('header', 'headerBgColor', e.target.value)}
            description="בחר צבע רקע להדר הראשי"
          />

          <CustomSelect
            label="גודל לוגו"
            value={designSettings.header.logoSize}
            onChange={(e) => handleSettingChange('header', 'logoSize', e.target.value)}
            description="בחר את גודל הלוגו בהדר"
            options={[
              { value: 'small', label: 'קטן' },
              { value: 'medium', label: 'בינוני' },
              { value: 'large', label: 'גדול' }
            ]}
          />
        </div>
      </div>
    </div>
  );

  const renderFooterSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">הגדרות פוטר</h3>
              <p className="text-sm text-gray-700">התאם את הפוטר התחתון של האתר</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <ColorPicker
            label="צבע רקע"
            value={designSettings.footer.bgColor}
            onChange={(e) => handleSettingChange('footer', 'bgColor', e.target.value)}
            description="בחר צבע רקע לפוטר"
          />

          <ColorPicker
            label="צבע טקסט"
            value={designSettings.footer.textColor}
            onChange={(e) => handleSettingChange('footer', 'textColor', e.target.value)}
            description="בחר צבע טקסט לפוטר"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              checked={designSettings.footer.showSocialLinks}
              onChange={(e) => handleSettingChange('footer', 'showSocialLinks', e.target.checked)}
              label="רשתות חברתיות"
              description="הצג קישורים לרשתות חברתיות"
            />
            <Toggle
              checked={designSettings.footer.showNewsletter}
              onChange={(e) => handleSettingChange('footer', 'showNewsletter', e.target.checked)}
              label="הרשמה לניוזלטר"
              description="הצג טופס הרשמה לניוזלטר"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoryPageSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900">
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">הגדרות עמוד קטגוריה</h3>
              <p className="text-sm text-gray-700">התאם את פריסת המוצרים והקטגוריות</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <CustomSelect
            label="פריסת מוצרים"
            value={designSettings.categoryPage.layout}
            onChange={(e) => handleSettingChange('categoryPage', 'layout', e.target.value)}
            description="בחר איך להציג את המוצרים"
            options={[
              { value: 'grid', label: 'רשת' },
              { value: 'list', label: 'רשימה' }
            ]}
          />

          <CustomSelect
            label="מוצרים בשורה"
            value={designSettings.categoryPage.productsPerRow}
            onChange={(e) => handleSettingChange('categoryPage', 'productsPerRow', parseInt(e.target.value))}
            description="כמה מוצרים להציג בכל שורה"
            options={[
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' }
            ]}
          />

          <Toggle
            checked={designSettings.categoryPage.showFilters}
            onChange={(e) => handleSettingChange('categoryPage', 'showFilters', e.target.checked)}
            label="הצג מסננים"
            description="אפשר ללקוחות לסנן מוצרים"
          />
        </div>
      </div>
    </div>
  );

  const renderProductPageSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">הגדרות עמוד מוצר</h3>
              <p className="text-sm text-gray-700">התאם את עיצוב דף המוצר הבודד</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <CustomSelect
            label="פריסת עמוד"
            value={designSettings.productPage.layout}
            onChange={(e) => handleSettingChange('productPage', 'layout', e.target.value)}
            description="בחר את פריסת דף המוצר"
            options={[
              { value: 'sidebar', label: 'עם סיידבר' },
              { value: 'centered', label: 'מרוכז' }
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              checked={designSettings.productPage.showRelatedProducts}
              onChange={(e) => handleSettingChange('productPage', 'showRelatedProducts', e.target.checked)}
              label="מוצרים קשורים"
              description="הצג מוצרים דומים"
            />
            <Toggle
              checked={designSettings.productPage.showReviews}
              onChange={(e) => handleSettingChange('productPage', 'showReviews', e.target.checked)}
              label="ביקורות לקוחות"
              description="הצג ביקורות ודירוגים"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => {
    switch (activeSection) {
      case 'header':
        return renderHeaderSettings();
      case 'footer':
        return renderFooterSettings();
      case 'categoryPage':
        return renderCategoryPageSettings();
      case 'productPage':
        return renderProductPageSettings();
      default:
        return renderHeaderSettings();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Save settings to backend
      console.log('Saving design settings:', designSettings);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Paintbrush className="w-6 h-6 text-white" />
            </div>
            <div className="mr-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {t('design.title') || 'עיצוב האתר'}
              </h1>
              <p className="text-gray-600 mt-1">{t('design.subtitle') || 'התאם את עיצוב החנות שלך לפי הטעם שלך'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(270deg, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 ml-2 text-gray-800" />
                  קטגוריות עיצוב
                </h2>
              </div>
              <nav className="p-4 space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center p-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-gray-900 shadow-lg transform scale-105'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                      }`}
                      style={isActive ? { background: section.gradient } : {}}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ml-3 ${
                        isActive 
                          ? 'bg-gray-900' 
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{section.label}</div>
                        <div className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                          {section.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>


          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Action Bar */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900">
                    {(() => {
                      const Icon = sections.find(s => s.id === activeSection)?.icon;
                      return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
                    })()}
                  </div>
                  <div className="mr-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {sections.find(s => s.id === activeSection)?.label}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {sections.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 rtl:space-x-reverse">
                  <div className="relative">
                    <button
                      onClick={() => {
                        try {
                          // Open store homepage - force store view by adding a parameter or using a different approach
                          const storeUrl = 'http://localhost:5174/?preview=store';
                          const previewWindow = window.open(storeUrl, '_blank');
                          if (!previewWindow) {
                            alert('לא ניתן לפתוח תצוגה מקדימה. אנא בדוק שהחנות פועלת');
                          }
                        } catch (error) {
                          console.error('Error opening preview:', error);
                          alert('שגיאה בפתיחת תצוגה מקדימה');
                        }
                      }}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      תצוגה מקדימה
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      saveSuccess
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : isSaving
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 ml-2" />
                        נשמר בהצלחה!
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-4 h-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        שומר...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="space-y-6">
              {renderSettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPage; 
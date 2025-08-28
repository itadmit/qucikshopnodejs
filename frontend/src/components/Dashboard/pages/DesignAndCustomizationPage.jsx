import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Palette,
  Eye,
  Edit3,
  Check,
  Star,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  ArrowRight,
  Settings,
  Layout,
  Paintbrush,
  Globe,
  Crown,
  Zap,
  Code
} from 'lucide-react';
import apiService from '../../../services/api';
import { useAvailableTemplates } from '../../../store/shared/hooks/useTemplate';

const DesignAndCustomizationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentTemplate, setCurrentTemplate] = useState('jupiter');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [userStore, setUserStore] = useState(null);

  // Load available templates from server
  const { templates, loading: templatesLoading } = useAvailableTemplates();

  // Fallback templates if server is not available
  const fallbackTemplates = [
    {
      id: 'jupiter',
      name: 'Jupiter',
      description: 'תבנית מודרנית ונקייה עם עיצוב מינימליסטי',
      features: ['עיצוב רספונסיבי', 'תמיכה ב-RTL', 'אנימציות חלקות', 'SEO מיטבי'],
      preview: '/templates/jupiter-preview.svg',
      isPremium: false,
      isActive: true,
      category: 'מודרני',
      color: 'from-blue-500 to-purple-600',
      icon: '🪐'
    },
    {
      id: 'mars',
      name: 'Mars',
      description: 'תבנית עסקית מקצועית לחנויות גדולות',
      features: ['פריסה מתקדמת', 'כלי B2B', 'דוחות מתקדמים', 'אינטגרציות'],
      preview: '/templates/mars-preview.svg',
      isPremium: true,
      isActive: false,
      comingSoon: true,
      category: 'עסקי',
      color: 'from-red-500 to-orange-600',
      icon: '🔴'
    },
    {
      id: 'venus',
      name: 'Venus',
      description: 'תבנית אופנתית ואלגנטית לחנויות בגדים',
      features: ['גלריות מתקדמות', 'מסנני אופנה', 'עיצוב אלגנטי', 'קטלוג מתקדם'],
      preview: '/templates/venus-preview.svg',
      isPremium: true,
      isActive: false,
      comingSoon: true,
      category: 'אופנה',
      color: 'from-pink-500 to-rose-600',
      icon: '💎'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      description: 'תבנית טכנולוגית לחנויות אלקטרוניקה',
      features: ['השוואת מוצרים', 'מפרטים טכניים', 'עיצוב טכנולוגי', 'ביקורות מתקדמות'],
      preview: '/templates/saturn-preview.svg',
      isPremium: true,
      isActive: false,
      comingSoon: true,
      category: 'טכנולוגיה',
      color: 'from-gray-500 to-slate-600',
      icon: '🛸'
    }
  ];

  // Fetch user store data
  useEffect(() => {
    const fetchUserStore = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) return;
        
        apiService.setToken(token);
        const storeData = await apiService.getUserStore();
        setUserStore(storeData);
        
        // Set current template based on store data
        if (storeData?.templateName) {
          setCurrentTemplate(storeData.templateName);
        }
      } catch (err) {
        console.error('Failed to fetch user store:', err);
      }
    };

    fetchUserStore();
  }, []);

  const handleTemplateChange = async (templateId) => {
    const selectedTemplate = templates.find(t => t.id === templateId || t.name === templateId);
    
    if (selectedTemplate?.comingSoon) {
      return; // Don't allow selection of coming soon templates
    }

    setLoading(true);
    try {
      if (!userStore?.id) {
        throw new Error('No store found');
      }

      // Save template selection to backend using new API
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/templates/store/${userStore.id}/template`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateName: selectedTemplate?.name || templateId,
          templateId: selectedTemplate?.id || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      const result = await response.json();
      
      setCurrentTemplate(selectedTemplate?.name || templateId);
      console.log('Template changed successfully to:', selectedTemplate?.name || templateId);
      
      // Update userStore with new template
      setUserStore(prev => ({
        ...prev,
        templateName: selectedTemplate?.name || templateId,
        templateId: selectedTemplate?.id || null
      }));
      
    } catch (error) {
      console.error('Error changing template:', error);
      alert(`שגיאה בשינוי התבנית: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    try {
      const storeUrl = userStore?.slug 
        ? `http://${userStore.slug}.localhost:5173`
        : 'http://localhost:5174/?preview=store';
      
      const previewWindow = window.open(storeUrl, '_blank');
      if (!previewWindow) {
        alert('לא ניתן לפתוח תצוגה מקדימה. אנא בדוק שהחנות פועלת');
      }
    } catch (error) {
      console.error('Error opening preview:', error);
      alert('שגיאה בפתיחת תצוגה מקדימה');
    }
  };

  const handleAdvancedEdit = () => {
    // Navigate to the advanced site builder
    navigate('/dashboard/builder');
  };

  const handleBasicDesign = () => {
    // Navigate to the basic design settings
    navigate('/dashboard/design/basic');
  };

  const PreviewModeSelector = () => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      {[
        { id: 'desktop', icon: Monitor, label: 'דסקטופ' },
        { id: 'tablet', icon: Tablet, label: 'טאבלט' },
        { id: 'mobile', icon: Smartphone, label: 'מובייל' }
      ].map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => setPreviewMode(mode.id)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              previewMode === mode.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 ml-1" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );

  const TemplateCard = ({ template }) => {
    const isSelected = currentTemplate === template.id;
    const isComingSoon = template.comingSoon;
    
    return (
      <div 
        className={`relative bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
          isSelected 
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
            : 'border-gray-200 hover:border-gray-300'
        } ${isComingSoon ? 'opacity-75' : 'cursor-pointer'}`}
        onClick={() => !isComingSoon && handleTemplateChange(template.id)}
      >
        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              <Crown className="w-3 h-3 ml-1" />
              פרימיום
            </div>
          </div>
        )}

        {/* Coming Soon Badge */}
        {isComingSoon && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center z-20">
            <div className="text-center">
              <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900">בקרוב</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Template Preview */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl relative overflow-hidden">
          {template.preview ? (
            <img 
              src={template.preview} 
              alt={template.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback preview */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ display: template.preview ? 'none' : 'flex' }}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${template.color} flex items-center justify-center text-2xl shadow-lg`}>
              {template.icon}
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {template.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
          
          {/* Features */}
          <div className="space-y-1 mb-4">
            {template.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full ml-2"></div>
                {feature}
              </div>
            ))}
          </div>

          {/* Actions */}
          {!isComingSoon && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview();
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 ml-1" />
                תצוגה
              </button>
              
              {isSelected && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdvancedEdit();
                    }}
                    className="flex-1 flex items-center justify-center px-2 py-2 text-xs font-medium text-white rounded-lg transition-colors"
                    style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)', color: 'black' }}
                  >
                    <Edit3 className="w-3 h-3 ml-1" />
                    עריכה
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/design/editor/${template.name}`);
                    }}
                    className="flex-1 flex items-center justify-center px-2 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="עורך קוד מתקדם (למפתחים)"
                  >
                    <Code className="w-3 h-3 ml-1" />
                    קוד
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div className="mr-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  עיצוב והתאמה אישית
                </h1>
                <p className="text-gray-600 mt-1">בחר תבנית והתאם את עיצוב החנות שלך</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PreviewModeSelector />
              <button
                onClick={handlePreview}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <Eye className="w-4 h-4 ml-2" />
                תצוגה מקדימה
              </button>
            </div>
          </div>
        </div>

        {/* Current Template Info */}
        {currentTemplate && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${templates.find(t => t.id === currentTemplate)?.color} flex items-center justify-center text-xl shadow-lg`}>
                  {templates.find(t => t.id === currentTemplate)?.icon}
                </div>
                <div className="mr-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    התבנית הנוכחית: {templates.find(t => t.id === currentTemplate)?.name}
                  </h2>
                  <p className="text-gray-600">
                    {templates.find(t => t.id === currentTemplate)?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleBasicDesign}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4 ml-2" />
                  הגדרות בסיסיות
                </button>
                
                <button
                  onClick={handleAdvancedEdit}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg"
                  style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)', color: 'black' }}
                >
                  <Edit3 className="w-4 h-4 ml-2" />
                  עורך מתקדם
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">בחר תבנית</h2>
            <div className="flex items-center text-sm text-gray-600">
              <Sparkles className="w-4 h-4 ml-1" />
              {templatesLoading ? 'טוען...' : `${(templates.length > 0 ? templates : fallbackTemplates).filter(t => !t.comingSoon).length} תבניות זמינות`}
            </div>
          </div>

          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(templates.length > 0 ? templates : fallbackTemplates).map((template) => (
                <TemplateCard key={template.id || template.name} template={template} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">פעולות מהירות</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleBasicDesign}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                <Paintbrush className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">הגדרות עיצוב בסיסיות</h4>
                <p className="text-sm text-gray-600">צבעים, פונטים ופריסות</p>
              </div>
            </button>

            <button
              onClick={handleAdvancedEdit}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center ml-3">
                <Layout className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">עורך מתקדם</h4>
                <p className="text-sm text-gray-600">בניית דפים מותאמים אישית</p>
              </div>
            </button>

            <button
              onClick={handlePreview}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center ml-3">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">צפה בחנות</h4>
                <p className="text-sm text-gray-600">ראה איך החנות נראית ללקוחות</p>
              </div>
            </button>

            <button
              onClick={() => navigate(`/dashboard/design/editor/${currentTemplate}`)}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center ml-3">
                <Code className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">עורך קוד מתקדם</h4>
                <p className="text-sm text-gray-600">עריכת קוד התבנית (למפתחים)</p>
              </div>
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 ml-3"></div>
                <p className="text-gray-900 font-medium">מחליף תבנית...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignAndCustomizationPage;

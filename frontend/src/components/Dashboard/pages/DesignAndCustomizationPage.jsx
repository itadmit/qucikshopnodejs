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

  // Available templates - only Jupiter for now
  const availableTemplates = [
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
    }
  ];

  // Fetch user store data
  useEffect(() => {
    const fetchUserStore = async () => {
      try {
        const token = localStorage.getItem('authToken');
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
    const selectedTemplate = availableTemplates.find(t => t.id === templateId || t.name === templateId);

    setLoading(true);
    try {
      if (!userStore?.id) {
        throw new Error('No store found');
      }

      // Save template selection to backend using new API
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/templates/store/${userStore.id}/template`, {
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
                        ? `https://${userStore.slug}.my-quickshop.com`
        : 'https://my-quickshop.com/?preview=store';
      
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

            <button
              onClick={handlePreview}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <Eye className="w-4 h-4 ml-2" />
              תצוגה מקדימה
            </button>
          </div>
        </div>

        {/* Current Template Display */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">התבנית הנוכחית</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${availableTemplates.find(t => t.id === currentTemplate)?.color || 'from-blue-500 to-purple-600'} flex items-center justify-center text-2xl shadow-lg`}>
                {availableTemplates.find(t => t.id === currentTemplate)?.icon || '🪐'}
              </div>
              <div className="mr-6 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {availableTemplates.find(t => t.id === currentTemplate)?.name || 'Jupiter'}
                </h3>
                <p className="text-gray-600 mb-3">
                  {availableTemplates.find(t => t.id === currentTemplate)?.description || 'תבנית מודרנית ונקייה'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(availableTemplates.find(t => t.id === currentTemplate)?.features || ['עיצוב רספונסיבי', 'תמיכה ב-RTL', 'אנימציות חלקות']).map((feature, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  תצוגה מקדימה
                </button>
              </div>
            </div>

            {/* Template Actions - Inside the template area */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">פעולות תבנית</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/settings')}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">הגדרות תבנית</h4>
                      <p className="text-sm text-gray-600">צבעים, פונטים והגדרות כלליות</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={handleAdvancedEdit}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center ml-3">
                      <Layout className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">מעבר לבילדר</h4>
                      <p className="text-sm text-gray-600">עריכה ויזואלית של דפי החנות</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/design/editor/jupiter')}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center ml-3">
                      <Code className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">מעבר לקוד</h4>
                      <p className="text-sm text-gray-600">עריכת קוד התבנית (למפתחים מתקדמים)</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
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

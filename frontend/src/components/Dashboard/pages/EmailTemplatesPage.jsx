import { useState, useEffect } from 'react';
import { Mail, Edit, Eye, Send, Save, RotateCcw, Code, Palette, Type } from 'lucide-react';
import apiService from '../../../services/api.js';

const EmailTemplatesPage = ({ storeId }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [availableVariables, setAvailableVariables] = useState({});
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: ''
  });

  useEffect(() => {
    // Wait a bit for the token to be available
    const timer = setTimeout(() => {
      loadTemplates();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      if (!storeId) {
        console.log('No store ID provided');
        alert('לא נמצא מזהה חנות');
        return;
      }
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.log('No authentication token found');
        alert('נדרש להתחבר מחדש');
        return;
      }
      
      apiService.setToken(token);
      const response = await apiService.getEmailTemplates(storeId); // Use the passed storeId from props
      
      if (response.success) {
        setTemplates(response.data.templates);
        setAvailableVariables(response.data.availableVariables);
        
        // Select first template by default
        if (response.data.templates.length > 0) {
          selectTemplate(response.data.templates[0]);
        }
      } else {
        throw new Error(response.error || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        alert('אין הרשאה לגשת לתבניות המייל. נדרש להתחבר מחדש.');
      } else {
        alert('שגיאה בטעינת תבניות המייל: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent
    });
    setIsEditing(false);
    setIsPreviewMode(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsPreviewMode(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!storeId) {
        alert('לא נמצא מזהה חנות');
        return;
      }
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      apiService.setToken(token);

      const saveData = {
        storeId: storeId, // Use the passed storeId from props
        type: selectedTemplate.type,
        name: formData.name,
        subject: formData.subject,
        htmlContent: formData.htmlContent,
        isActive: true
      };

      const response = await apiService.saveEmailTemplate(saveData);
      
      if (response.success) {
        alert('התבנית נשמרה בהצלחה!');
        await loadTemplates();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('שגיאה בשמירת התבנית');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      apiService.setToken(token);

      const previewData = {
        storeId: storeId, // Use the passed storeId from props
        type: selectedTemplate.type,
        htmlContent: formData.htmlContent,
        subject: formData.subject
      };

      const response = await apiService.previewEmailTemplate(previewData);
      
      if (response.success) {
        setPreviewHtml(response.data.html);
        setIsPreviewMode(true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to preview template:', error);
      alert('שגיאה בתצוגה מקדימה');
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      alert('אנא הזן כתובת מייל לבדיקה');
      return;
    }

    try {
      setSendingTest(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      apiService.setToken(token);

      const testData = {
        storeId: storeId, // Use the passed storeId from props
        type: selectedTemplate.type,
        htmlContent: formData.htmlContent,
        subject: formData.subject,
        testEmail
      };

      const response = await apiService.sendTestEmail(testData);
      
      if (response.success) {
        alert('מייל בדיקה נשלח בהצלחה!');
        setTestEmail('');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('שגיאה בשליחת מייל הבדיקה');
    } finally {
      setSendingTest(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('האם אתה בטוח שברצונך לאפס את התבנית לברירת המחדל?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      apiService.setToken(token);

      await apiService.deleteEmailTemplate(selectedTemplate.type, storeId);
      alert('התבנית אופסה לברירת המחדל');
      await loadTemplates();
    } catch (error) {
      console.error('Failed to reset template:', error);
      alert('שגיאה באיפוס התבנית');
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('htmlContent');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;
      
      setFormData(prev => ({ ...prev, htmlContent: newText }));
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען תבניות מייל...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול תבניות מייל</h1>
        <p className="text-gray-600">עריכה והתאמה אישית של מיילים שנשלחים ללקוחות</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <Mail className="w-5 h-5 ml-2" />
                תבניות מייל
              </h2>
            </div>
            <div className="p-2">
              {templates.map((template) => (
                <button
                  key={template.type}
                  onClick={() => selectTemplate(template)}
                  className={`w-full text-right p-3 rounded-lg mb-2 transition-colors ${
                    selectedTemplate?.type === template.type
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {template.isDefault ? 'ברירת מחדל' : 'מותאם אישית'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {selectedTemplate.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {!isEditing && !isPreviewMode && (
                      <button
                        onClick={handleEdit}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4 ml-2" />
                        עריכה
                      </button>
                    )}
                    {(isEditing || isPreviewMode) && (
                      <>
                        <button
                          onClick={handlePreview}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          תצוגה מקדימה
                        </button>
                        {isEditing && (
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4 ml-2" />
                            {saving ? 'שומר...' : 'שמירה'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setIsPreviewMode(false);
                            setFormData({
                              name: selectedTemplate.name,
                              subject: selectedTemplate.subject,
                              htmlContent: selectedTemplate.htmlContent
                            });
                          }}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          ביטול
                        </button>
                      </>
                    )}
                    {!selectedTemplate.isDefault && (
                      <button
                        onClick={handleReset}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <RotateCcw className="w-4 h-4 ml-2" />
                        איפוס
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Editor */}
                    <div className="lg:col-span-2">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            שם התבנית
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            נושא המייל
                          </label>
                          <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="נושא המייל (ניתן להשתמש במשתנים כמו {{orderNumber}})"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            תוכן HTML
                          </label>
                          <textarea
                            id="htmlContent"
                            value={formData.htmlContent}
                            onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                            rows={20}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            placeholder="תוכן HTML של המייל..."
                          />
                        </div>

                        {/* Test Email */}
                        <div className="border-t pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            שליחת מייל בדיקה
                          </label>
                          <div className="flex space-x-2 space-x-reverse">
                            <input
                              type="email"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={handleSendTest}
                              disabled={sendingTest || !testEmail}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              <Send className="w-4 h-4 ml-2" />
                              {sendingTest ? 'שולח...' : 'שלח בדיקה'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Variables Panel */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Code className="w-4 h-4 ml-2" />
                          משתנים זמינים
                        </h3>
                        
                        {Object.entries(availableVariables).map(([category, variables]) => (
                          <div key={category} className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2 capitalize">
                              {category === 'basic' ? 'בסיסי' : 
                               category === 'order' ? 'הזמנה' :
                               category === 'loops' ? 'לולאות' :
                               category === 'conditions' ? 'תנאים' : category}
                            </h4>
                            <div className="space-y-1">
                              {Object.entries(variables).map(([key, description]) => (
                                <button
                                  key={key}
                                  onClick={() => insertVariable(key)}
                                  className="block w-full text-right text-sm px-2 py-1 bg-white rounded border hover:bg-blue-50 hover:border-blue-300"
                                  title={description}
                                >
                                  <code className="text-blue-600">{`{{${key}}}`}</code>
                                  <div className="text-xs text-gray-500 mt-1">{description}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : isPreviewMode ? (
                  <div className="border rounded-lg">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h3 className="font-medium text-gray-900">תצוגה מקדימה</h3>
                    </div>
                    <div className="p-4">
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full h-96 border rounded"
                        title="Email Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">נושא המייל</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm">{selectedTemplate.subject}</code>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">תוכן המייל</h3>
                      <div className="border rounded-lg">
                        <iframe
                          srcDoc={selectedTemplate.htmlContent}
                          className="w-full h-96 border rounded"
                          title="Template Content"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">בחר תבנית לעריכה</h3>
              <p className="text-gray-600">בחר תבנית מייל מהרשימה כדי להתחיל לערוך</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatesPage;

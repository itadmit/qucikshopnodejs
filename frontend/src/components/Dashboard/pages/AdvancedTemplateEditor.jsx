import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import * as Babel from '@babel/standalone';
import {
  Save,
  Play,
  Eye,
  AlertTriangle,
  CheckCircle,
  Code,
  FileText,
  Folder,
  ArrowLeft,
  Download,
  Upload,
  Settings
} from 'lucide-react';

/**
 * עורך קוד מתקדם לתבניות - למפתחים בלבד
 */
const AdvancedTemplateEditor = () => {
  const { t } = useTranslation();
  const { templateName } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // File tree structure
  const [fileTree, setFileTree] = useState({
    components: {},
    pages: {},
    styles: {},
    config: {},
    locales: {}
  });

  useEffect(() => {
    loadTemplate();
  }, [templateName]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      
      // Use Jupiter as default template if templateName is undefined
      const currentTemplateName = templateName || 'jupiter';
      
      // For now, show a message that this feature is coming soon
      alert('עורך הקוד המתקדם יהיה זמין בקרוב. כרגע ניתן להשתמש בעורך הבסיסי.');
      navigate('/dashboard/design');
      return;
      
      const templateData = await response.json();
      setTemplate(templateData);
      
      // Build file tree from template files
      if (templateData.files) {
        setFileTree(templateData.files);
        
        // Select first file by default
        const firstFile = getFirstFile(templateData.files);
        if (firstFile) {
          setSelectedFile(firstFile);
          setCode(firstFile.content || '// קובץ ריק');
        }
      }
      
    } catch (error) {
      console.error('Error loading template:', error);
      alert('שגיאה בטעינת התבנית');
      navigate('/dashboard/design');
    } finally {
      setLoading(false);
    }
  };

  const getFirstFile = (files) => {
    for (const category in files) {
      for (const fileName in files[category]) {
        return {
          category,
          name: fileName,
          content: files[category][fileName]
        };
      }
    }
    return null;
  };

  const validateCode = (newCode) => {
    const newErrors = [];
    const newWarnings = [];

    try {
      // Basic JSX validation using Babel
      if (selectedFile?.name.endsWith('.jsx')) {
        Babel.transform(newCode, {
          presets: ['react'],
          plugins: ['syntax-jsx']
        });
      }

      // Security checks
      const dangerousPatterns = [
        { pattern: /eval\s*\(/, message: 'שימוש ב-eval אסור מטעמי בטיחות' },
        { pattern: /Function\s*\(/, message: 'יצירת פונקציות דינמיות אסורה' },
        { pattern: /document\.write/, message: 'שימוש ב-document.write אסור' },
        { pattern: /innerHTML\s*=/, message: 'שימוש ב-innerHTML מסוכן' },
        { pattern: /dangerouslySetInnerHTML/, message: 'שימוש ב-dangerouslySetInnerHTML מסוכן' },
        { pattern: /import\s+.*\s+from\s+['"]http/, message: 'ייבוא מ-URL חיצוני אסור' }
      ];

      dangerousPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(newCode)) {
          newErrors.push(message);
        }
      });

      // Best practices warnings
      const warningPatterns = [
        { pattern: /console\.log/, message: 'מומלץ להסיר console.log בקוד פרודקשן' },
        { pattern: /debugger/, message: 'מומלץ להסיר debugger בקוד פרודקשן' },
        { pattern: /alert\s*\(/, message: 'מומלץ להשתמש ב-toast במקום alert' }
      ];

      warningPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(newCode)) {
          newWarnings.push(message);
        }
      });

    } catch (error) {
      newErrors.push(`שגיאת סינטקס: ${error.message}`);
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return newErrors.length === 0;
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    validateCode(newCode);
  };

  const handleSave = async () => {
    if (errors.length > 0) {
      alert('לא ניתן לשמור קוד עם שגיאות');
      return;
    }

    setSaving(true);
    try {
      // Update file in template
      const updatedFiles = { ...fileTree };
      if (selectedFile) {
        updatedFiles[selectedFile.category][selectedFile.name] = code;
      }

      // Save to server
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          files: updatedFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      setFileTree(updatedFiles);
      alert('התבנית נשמרה בהצלחה!');

    } catch (error) {
      console.error('Error saving template:', error);
      alert('שגיאה בשמירת התבנית');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (category, fileName) => {
    const fileContent = fileTree[category][fileName];
    setSelectedFile({ category, name: fileName, content: fileContent });
    setCode(typeof fileContent === 'string' ? fileContent : JSON.stringify(fileContent, null, 2));
  };

  const renderFileTree = () => {
    const categoryIcons = {
      components: <Code className="w-4 h-4" />,
      pages: <FileText className="w-4 h-4" />,
      styles: <Settings className="w-4 h-4" />,
      config: <Settings className="w-4 h-4" />,
      locales: <FileText className="w-4 h-4" />
    };

    return (
      <div className="space-y-2">
        {Object.entries(fileTree).map(([category, files]) => (
          <div key={category} className="border border-gray-200 rounded-lg">
            <div className="flex items-center p-3 bg-gray-50 border-b border-gray-200">
              {categoryIcons[category]}
              <span className="mr-2 font-medium text-gray-900 capitalize">{category}</span>
            </div>
            <div className="p-2 space-y-1">
              {Object.entries(files).map(([fileName, content]) => (
                <button
                  key={fileName}
                  onClick={() => handleFileSelect(category, fileName)}
                  className={`w-full text-right p-2 rounded text-sm transition-colors ${
                    selectedFile?.category === category && selectedFile?.name === fileName
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען עורך קוד...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard/design')}
              className="flex items-center text-gray-600 hover:text-gray-900 ml-4"
            >
              <ArrowLeft className="w-5 h-5 ml-1" />
              חזור
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              עורך קוד - {template?.displayName}
            </h1>
            {selectedFile && (
              <span className="mr-4 text-sm text-gray-500">
                {selectedFile.category}/{selectedFile.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Validation Status */}
            <div className="flex items-center">
              {errors.length > 0 ? (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  {errors.length} שגיאות
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 ml-1" />
                  תקין
                </div>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Eye className="w-4 h-4 ml-1" />
              {previewMode ? 'עריכה' : 'תצוגה'}
            </button>

            <button
              onClick={handleSave}
              disabled={saving || errors.length > 0}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 ml-1" />
              {saving ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* File Tree Sidebar */}
        <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-900 mb-4">קבצי התבנית</h3>
          {renderFileTree()}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={selectedFile?.name.endsWith('.jsx') ? 'javascript' : 
                       selectedFile?.name.endsWith('.css') ? 'css' :
                       selectedFile?.name.endsWith('.json') ? 'json' : 'text'}
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                theme: 'vs-dark'
              }}
            />
          </div>

          {/* Error/Warning Panel */}
          {(errors.length > 0 || warnings.length > 0) && (
            <div className="bg-white border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
              {errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-900 mb-2">שגיאות:</h4>
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-center text-sm text-red-700 mb-1">
                      <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">אזהרות:</h4>
                  {warnings.map((warning, index) => (
                    <div key={index} className="flex items-center text-sm text-yellow-700 mb-1">
                      <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedTemplateEditor;

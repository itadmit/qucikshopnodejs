import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../../config/environment.js';
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
      
      // Load template from server
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/templates/${currentTemplateName}`);
      if (!response.ok) {
        throw new Error('Template not found');
      }
      
      const templateData = await response.json();
      setTemplate(templateData);
      
      // Build file tree from template files
      if (templateData.files) {
        console.log('📁 Template files loaded:', templateData.files);
        setFileTree(templateData.files);
        
        // Select first JSX file by default (prefer components or pages)
        const firstFile = getFirstJSXFile(templateData.files);
        console.log('📄 Selected first file:', firstFile);
        if (firstFile) {
          setSelectedFile(firstFile);
          const codeContent = firstFile.content || '// קובץ ריק';
          setCode(codeContent);
          console.log('💾 Code set:', codeContent.substring(0, 100) + '...');
          
          // Force Monaco to update by setting a timeout
          setTimeout(() => {
            console.log('🔄 Force updating code in Monaco...');
            setCode(codeContent);
          }, 100);
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

  const getFirstJSXFile = (files) => {
    // Priority order: components, pages, styles, config, locales
    const priorities = ['components', 'pages', 'styles', 'config', 'locales'];
    
    for (const category of priorities) {
      if (files[category]) {
        for (const fileName in files[category]) {
          // Prefer JSX files
          if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) {
            return {
              category,
              name: fileName,
              content: files[category][fileName]
            };
          }
        }
      }
    }
    
    // If no JSX files found, return first file
    return getFirstFile(files);
  };

  const validateCode = (newCode) => {

    const newErrors = [];
    const newWarnings = [];

    try {
      // Basic security checks
      if (newCode.includes('eval(')) {
        newErrors.push({
          line: newCode.split('\n').findIndex(line => line.includes('eval(')) + 1,
          message: 'שימוש ב-eval() אסור מטעמי בטיחות',
          severity: 'error'
        });
      }

      if (newCode.includes('Function(')) {
        newErrors.push({
          line: newCode.split('\n').findIndex(line => line.includes('Function(')) + 1,
          message: 'שימוש ב-Function() אסור מטעמי בטיחות',
          severity: 'error'
        });
      }

      if (newCode.includes('innerHTML')) {
        newErrors.push({
          line: newCode.split('\n').findIndex(line => line.includes('innerHTML')) + 1,
          message: 'שימוש ב-innerHTML אסור מטעמי בטיחות',
          severity: 'error'
        });
      }

      if (newCode.includes('dangerouslySetInnerHTML')) {
        newErrors.push({
          line: newCode.split('\n').findIndex(line => line.includes('dangerouslySetInnerHTML')) + 1,
          message: 'שימוש ב-dangerouslySetInnerHTML אסור מטעמי בטיחות',
          severity: 'error'
        });
      }

      // Check for external URLs in imports
      const importRegex = /import.*from\s+['"`](https?:\/\/.*?)['"`]/g;
      let match;
      while ((match = importRegex.exec(newCode)) !== null) {
        const lineNumber = newCode.substring(0, match.index).split('\n').length;
        newErrors.push({
          line: lineNumber,
          message: `ייבוא מ-URL חיצוני אסור: ${match[1]}`,
          severity: 'error'
        });
      }

      // Warnings for debugging code
      if (newCode.includes('console.log')) {
        const lines = newCode.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('console.log')) {
            newWarnings.push({
              line: index + 1,
              message: 'מומלץ להסיר console.log לפני פרסום',
              severity: 'warning'
            });
          }
        });
      }

      if (newCode.includes('debugger')) {
        newWarnings.push({
          line: newCode.split('\n').findIndex(line => line.includes('debugger')) + 1,
          message: 'מומלץ להסיר debugger לפני פרסום',
          severity: 'warning'
        });
      }

      // Try to parse JSX with Babel
      if (selectedFile?.name?.endsWith('.jsx') || selectedFile?.name?.endsWith('.js')) {
        try {
          Babel.transform(newCode, {
            presets: ['react'],
            filename: selectedFile.name
          });
        } catch (babelError) {
          const errorLine = babelError.loc ? babelError.loc.line : 1;
          newErrors.push({
            line: errorLine,
            message: `שגיאת JSX: ${babelError.message}`,
            severity: 'error'
          });
        }
      }

    } catch (error) {
      newErrors.push({
        line: 1,
        message: `שגיאה בוולידציה: ${error.message}`,
        severity: 'error'
      });
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    
    return newErrors.length === 0;
  };

  const handleCodeChange = (newCode) => {
    console.log('✏️ Code changed:', newCode?.length, 'characters');
    setCode(newCode);
    validateCode(newCode);
  };

  const handleSave = async () => {
    if (!selectedFile || !template) return;

    setSaving(true);
    try {
      // Validate code before saving
      const isValid = validateCode(code);
      if (!isValid) {
        alert('יש שגיאות בקוד. אנא תקן אותן לפני השמירה.');
        return;
      }

      // Update file in template structure
      const updatedFiles = { ...fileTree };
      updatedFiles[selectedFile.category][selectedFile.name] = code;

      // Save to server
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          files: updatedFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      setFileTree(updatedFiles);
      alert('הקובץ נשמר בהצלחה!');

    } catch (error) {
      console.error('Error saving file:', error);
      alert('שגיאה בשמירת הקובץ');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (category, fileName) => {
    const fileContent = fileTree[category]?.[fileName] || '';
    console.log('🔄 File selected:', { category, fileName, contentLength: fileContent.length });
    console.log('📝 File content preview:', fileContent.substring(0, 200) + '...');
    
    setSelectedFile({ category, name: fileName, content: fileContent });
    setCode(fileContent);
    validateCode(fileContent);
  };

  const handlePreview = () => {
    // Open store preview in new tab
    const previewUrl = `https://my-quickshop.com/store-preview?template=${template.name}`;
    window.open(previewUrl, '_blank');
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) {
      return <Code className="w-4 h-4 text-blue-600" />;
    } else if (fileName.endsWith('.css')) {
      return <FileText className="w-4 h-4 text-green-600" />;
    } else if (fileName.endsWith('.json')) {
      return <Settings className="w-4 h-4 text-orange-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-600" />;
  };

  const renderFileTree = () => {
    return (
      <div className="bg-gray-50 border-r border-gray-200 w-56 p-3 h-full overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Files</h3>
        
        {Object.entries(fileTree).map(([category, files]) => (
          <div key={category} className="mb-4">
            <div className="flex items-center mb-2">
              <Folder className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {category}
              </span>
            </div>
            
            <div className="ml-3 space-y-1">
              {Object.keys(files).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => handleFileSelect(category, fileName)}
                  className={`w-full flex items-center px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors ${
                    selectedFile?.name === fileName && selectedFile?.category === category
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700'
                  }`}
                >
                  {getFileIcon(fileName)}
                  <span className="ml-1.5 truncate text-xs">{fileName}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderErrorsAndWarnings = () => {
    if (errors.length === 0 && warnings.length === 0) return null;

    return (
      <div className="bg-white border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Code Issues</h4>
        
        {errors.map((error, index) => (
          <div key={`error-${index}`} className="flex items-start mb-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-red-700 font-medium">Line {error.line}: </span>
              <span className="text-red-600">{error.message}</span>
            </div>
          </div>
        ))}
        
        {warnings.map((warning, index) => (
          <div key={`warning-${index}`} className="flex items-start mb-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-yellow-700 font-medium">Line {warning.line}: </span>
              <span className="text-yellow-600">{warning.message}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading code editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="ltr">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard/design')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Design
            </button>
            
            <div className="border-l border-gray-300 h-6 mx-4"></div>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Advanced Code Editor - {template?.displayName || 'Jupiter'}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedFile ? `${selectedFile.category}/${selectedFile.name}` : 'Select a file to edit'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {errors.length === 0 ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">No Errors</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm">{errors.length} Errors</span>
              </div>
            )}

            <button
              onClick={handlePreview}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </button>

            <button
              onClick={handleSave}
              disabled={saving || errors.length > 0}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                saving || errors.length > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Tree */}
        {renderFileTree()}

        {/* Editor */}
        <div className="flex-1 flex flex-col" dir="ltr">
          {selectedFile ? (
            <>
              <div className="flex-1" dir="ltr">
                <Editor
                  key={`${selectedFile.category}-${selectedFile.name}`}
                  height="100%"
                  defaultLanguage="javascript"
                  language={selectedFile.name.endsWith('.jsx') || selectedFile.name.endsWith('.js') ? 'javascript' : 
                           selectedFile.name.endsWith('.css') ? 'css' : 
                           selectedFile.name.endsWith('.json') ? 'json' : 'plaintext'}
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  loading={<div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    lineNumbersMinChars: 3,
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    contextmenu: true,
                    selectOnLineNumbers: true,
                    glyphMargin: false,
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'always',
                    renderLineHighlight: 'all',
                    renderWhitespace: 'selection',
                    cursorBlinking: 'blink',
                    mouseWheelZoom: true,
                    links: true,
                    colorDecorators: true,
                    accessibilitySupport: 'auto',
                    // Force LTR direction
                    readOnly: false,
                    domReadOnly: false,
                    // Add padding inside the editor
                    padding: {
                      top: 16,
                      bottom: 16
                    },
                    // Language and direction settings
                    unicodeHighlight: {
                      ambiguousCharacters: false,
                      invisibleCharacters: false
                    },
                    suggest: {
                      showKeywords: true,
                      showSnippets: true,
                      showClasses: true,
                      showFunctions: true,
                      showVariables: true
                    }
                  }}
                />
              </div>
              
              {/* Errors and Warnings Panel */}
              {renderErrorsAndWarnings()}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a file to edit</h3>
                <p className="text-gray-600">Choose a file from the file tree to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedTemplateEditor;
/**
 * 🎨 QuickShop Site Builder - Main Builder Page
 * הבילדר החדש בהשראת שופיפיי עם ממשק בעברית
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Import our new sections system
import { ALL_SECTIONS, getSectionById, getSectionsByCategory } from '../sections/index.js';
import { SECTION_CATEGORIES } from '../types/sections.js';
import SectionRenderer from '../components/SectionRenderer.jsx';

// Import new components
import BuilderHeader from '../components/BuilderHeader.jsx';
import BuilderSidebar from '../components/BuilderSidebar.jsx';
import BuilderCanvas from '../components/BuilderCanvas.jsx';
import AddSectionModal from '../components/AddSectionModal.jsx';

const SiteBuilderPage = ({ user, onBack }) => {
  const { t } = useTranslation();
  
  // State management
  const [selectedPage, setSelectedPage] = useState('home');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [pageStructure, setPageStructure] = useState({
    sections: [],
    settings: {}
  });
  const [globalStructure, setGlobalStructure] = useState({
    header: null,
    footer: null
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const [editingGlobal, setEditingGlobal] = useState(null); // 'header' | 'footer' | null
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Load page structure when component mounts
  useEffect(() => {
    if (user) {
    loadPageStructure();
    }
  }, [selectedPage, user?.id]); // Only depend on user.id to avoid double calls

  // Load page structure from server or create default
  const loadPageStructure = async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
      
      if (storeSlug) {
        try {
          const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
          const response = await fetch(`${baseUrl}/api/custom-pages/${storeSlug}/${selectedPage}`);
          if (response.ok) {
            const pageData = await response.json();
            console.log(`📄 Loaded existing ${selectedPage} page from server:`, pageData);
            setPageStructure(pageData.structure);
            return;
          }
        } catch (serverError) {
          // This is expected when no custom page exists - not an error
          console.log(`📄 No existing ${selectedPage} page found, creating default structure`);
        }
      }

      // Create default Jupiter-inspired home page structure
      if (selectedPage === 'home') {
        const defaultStructure = createDefaultHomePageStructure();
        setPageStructure(defaultStructure);
        saveToHistory(defaultStructure);
        
        // Also create default global structure if not exists
        const defaultGlobal = createDefaultGlobalStructure();
        setGlobalStructure(defaultGlobal);
      }
      
    } catch (error) {
      console.error('Error loading page structure:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  // Create default home page structure based on Jupiter/Minimog (without header/footer)
  const createDefaultHomePageStructure = () => {
    const announcementSection = getSectionById('announcement');
    const heroSection = getSectionById('hero');
    const categoriesSection = getSectionById('categories');
    const featuredProductsSection = getSectionById('featured_products');
    const newsletterSection = getSectionById('newsletter');

    return {
      sections: [
        {
          id: `announcement_${Date.now()}`,
          type: 'announcement',
          settings: announcementSection.presets[0].settings
        },
        {
          id: `hero_${Date.now() + 1}`,
          type: 'hero',
          settings: heroSection.presets[0].settings,
          blocks: heroSection.presets[0].blocks || []
        },
        {
          id: `categories_${Date.now() + 2}`,
          type: 'categories',
          settings: categoriesSection.presets[0].settings,
          blocks: categoriesSection.presets[0].blocks || []
        },
        {
          id: `featured_products_${Date.now() + 3}`,
          type: 'featured_products',
          settings: featuredProductsSection.presets[0].settings
        },
        {
          id: `newsletter_${Date.now() + 4}`,
          type: 'newsletter',
          settings: newsletterSection.presets[0].settings
        }
      ],
      settings: {
        templateName: 'Jupiter',
        pageType: 'home',
        rtl: true,
        fontFamily: 'Inter',
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6'
      }
    };
  };

  // Create default global structure (header & footer)
  const createDefaultGlobalStructure = () => {
    const headerSection = getSectionById('header');
    const footerSection = getSectionById('footer');

    return {
      header: {
        id: `header_global`,
        type: 'header',
        settings: headerSection.presets[0].settings,
        blocks: headerSection.presets[0].blocks || []
      },
      footer: {
        id: `footer_global`,
        type: 'footer',
        settings: footerSection.presets[0].settings,
        blocks: footerSection.presets[0].blocks || []
      }
    };
  };

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
    const sectionSchema = getSectionById(sectionType);
    if (sectionSchema) {
      const newSection = {
        id: `${sectionType}_${Date.now()}`,
        type: sectionType,
        settings: sectionSchema.presets[0]?.settings || {},
        blocks: sectionSchema.presets[0]?.blocks || []
      };

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
      sections: pageStructure.sections.filter(section => section.id !== sectionId)
    };
    
    setPageStructure(newStructure);
    saveToHistory(newStructure);
    
    // Clear selection if removed section was selected
    if (selectedElement?.id === sectionId) {
      setSelectedElement(null);
    }
  };

  // Update section
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

  // Duplicate section
  const duplicateSection = (sectionId) => {
    const sectionToDuplicate = pageStructure.sections.find(s => s.id === sectionId);
    if (sectionToDuplicate) {
      const newSection = {
        ...JSON.parse(JSON.stringify(sectionToDuplicate)),
        id: `${sectionToDuplicate.type}_${Date.now()}`
      };

      const sectionIndex = pageStructure.sections.findIndex(s => s.id === sectionId);
      const newSections = [...pageStructure.sections];
      newSections.splice(sectionIndex + 1, 0, newSection);

      const newStructure = {
        ...pageStructure,
        sections: newSections
      };
      
      setPageStructure(newStructure);
      saveToHistory(newStructure);
    }
  };

  // Handle drag start
  const handleDragStart = (e, sectionId, index) => {
    setDraggedSection({ id: sectionId, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // Handle drop
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedSection && draggedSection.index !== dropIndex) {
      const newSections = [...pageStructure.sections];
      const [movedSection] = newSections.splice(draggedSection.index, 1);
      newSections.splice(dropIndex, 0, movedSection);
      
      const newStructure = {
        ...pageStructure,
        sections: newSections
      };
      
      setPageStructure(newStructure);
      saveToHistory(newStructure);
    }
    
    setDraggedSection(null);
    setDragOverIndex(null);
  };

  // Save page to server
  const savePage = async () => {
    try {
      const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
      if (!storeSlug) {
        alert('לא נמצאה חנות לשמירה');
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      const response = await fetch(`${baseUrl}/api/custom-pages/${storeSlug}/${selectedPage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          structure: pageStructure,
          settings: pageStructure.settings,
          isPublished: true
        })
      });

      if (response.ok) {
        alert('הדף נשמר בהצלחה!');
      } else {
        throw new Error('Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('שגיאה בשמירת הדף');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50" dir="rtl">
      {/* Header */}
      <BuilderHeader
        selectedPage={selectedPage}
        editingGlobal={editingGlobal}
        isPreviewMode={isPreviewMode}
        previewMode={previewMode}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onClose={onBack}
        onPageChange={({ editingGlobal: newEditingGlobal, selectedPage: newSelectedPage }) => {
          setEditingGlobal(newEditingGlobal);
          setSelectedPage(newSelectedPage);
        }}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        onPreviewModeChange={setPreviewMode}
        onUndo={undo}
        onRedo={redo}
        onSave={savePageStructure}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
            >
            <X className="w-6 h-6" />
            </button>
          <h1 className="text-xl font-semibold text-gray-900">בילדר האתר</h1>
          
          {/* Page/Global Selector */}
          <div className="flex items-center space-x-2 space-x-reverse">
              <select 
              value={editingGlobal || selectedPage}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'header' || value === 'footer') {
                  setEditingGlobal(value);
                  setSelectedPage('home'); // Keep page as home when editing global
                } else {
                  setEditingGlobal(null);
                  setSelectedPage(value);
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <optgroup label="עמודים">
                <option value="home">עמוד בית</option>
                <option value="product">עמוד מוצר</option>
                <option value="category">עמוד קטגוריה</option>
                <option value="about">אודות</option>
                <option value="contact">צור קשר</option>
              </optgroup>
              <optgroup label="גלובלי">
                <option value="header">הדר האתר</option>
                <option value="footer">פוטר האתר</option>
              </optgroup>
              </select>
            
            {editingGlobal && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                עריכה גלובלית
              </span>
            )}
          </div>
            </div>

        <div className="flex items-center space-x-4 space-x-reverse">
            {/* Preview Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
          <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <Redo className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-2 rounded ${isPreviewMode ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
              <Eye className="w-4 h-4" />
              </button>
              <button
              onClick={savePage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
              >
              <Save className="w-4 h-4" />
              <span>שמור</span>
              </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sections List */}
        {!isPreviewMode && leftSidebarOpen && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingGlobal ? `עריכת ${editingGlobal === 'header' ? 'הדר' : 'פוטר'}` : 'סקשנים'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingGlobal 
                  ? `עורך את ה${editingGlobal === 'header' ? 'הדר' : 'פוטר'} הגלובלי`
                  : 'גרור וזרוק לסידור מחדש'
                }
              </p>
            </div>
            
            {/* Sections List */}
            <div className="p-4">
              {editingGlobal ? (
                // Show global section info
                <div className="space-y-4">
                  {globalStructure[editingGlobal] && (
                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div>
                            <div className="font-medium text-gray-900">
                              {editingGlobal === 'header' ? 'הדר האתר' : 'פוטר האתר'}
                            </div>
                            <div className="text-xs text-gray-500">
                              מופיע בכל עמודי האתר
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-2">💡 טיפ:</p>
                    <p>השינויים כאן יחולו על כל עמודי האתר. ה{editingGlobal === 'header' ? 'הדר' : 'פוטר'} יופיע באופן קבוע בכל מקום.</p>
                  </div>
                </div>
              ) : (
                // Show page sections
                <div>
                  <div className="space-y-2">
                    {pageStructure.sections.map((section, index) => {
                  const sectionSchema = getSectionById(section.type);
                  const isSelected = selectedElement?.type === 'section' && selectedElement?.id === section.id;
                  
                  return (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, section.id, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onClick={() => setSelectedElement({ type: 'section', id: section.id })}
                      className={`group p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                      } ${dragOverIndex === index ? 'border-t-4 border-t-blue-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              {sectionSchema?.icon ? (
                                <sectionSchema.icon className={`w-4 h-4 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-600'
                                }`} />
                              ) : (
                                <Layout className={`w-4 h-4 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-600'
                                }`} />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {sectionSchema?.name || section.type}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {sectionSchema?.description || 'סקשן מותאם אישית'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElement({ type: 'section', id: section.id });
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                            title="הגדרות"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSection(section.id);
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                            title="שכפל"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('האם אתה בטוח שברצונך למחוק את הסקשן הזה?')) {
                                removeSection(section.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded"
                            title="מחק"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
                  
                  {/* Add Section Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowAddSectionModal(true)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-center transition-colors group"
                    >
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-600 group-hover:text-blue-600">הוסף סקשן</div>
                      <div className="text-xs text-gray-500">בחר מתוך הספרייה</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
            
        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto">
          <div className={`mx-auto transition-all duration-300 ${
            previewMode === 'mobile' ? 'max-w-sm' : 'max-w-none'
          }`}>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">טוען את הדף...</p>
                </div>
              </div>
            ) : editingGlobal ? (
              // Render global section (header or footer)
              <div className="relative">
                {globalStructure[editingGlobal] && (
                  <div className="relative group hover:ring-2 hover:ring-blue-300">
                    <SectionRenderer
                      section={globalStructure[editingGlobal]}
                      sectionSchema={getSectionById(editingGlobal)}
                      isPreviewMode={isPreviewMode}
                      previewMode={previewMode}
                      onUpdateSection={(updates) => {
                        setGlobalStructure(prev => ({
                          ...prev,
                          [editingGlobal]: { ...prev[editingGlobal], ...updates }
                        }));
                      }}
                    />
                  </div>
              )}
            </div>
            ) : pageStructure.sections.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">התחל לבנות את הדף שלך</h3>
                  <p className="text-gray-500 mb-4">הוסף סקשנים מהסיידבר השמאלי</p>
          </div>
        </div>
            ) : (
              <div className="relative">
                {pageStructure.sections.map((section, index) => {
                  const sectionSchema = getSectionById(section.type);
                  const isSelected = selectedElement?.type === 'section' && selectedElement?.id === section.id;
                  
                  return (
                    <div
                      key={section.id}
                      className={`relative group ${
                        !isPreviewMode ? 'hover:ring-2 hover:ring-blue-300' : ''
                      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isPreviewMode) {
                          setSelectedElement({ type: 'section', id: section.id });
                        }
                      }}
                    >
                      {/* Section Controls */}
        {!isPreviewMode && (
                        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex items-center">
                            <span className="px-3 py-1 text-xs font-medium text-gray-700">
                              {sectionSchema?.name || section.type}
                            </span>
                            <div className="border-r border-gray-200 h-6"></div>
              <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSection(section.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
              </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('האם אתה בטוח שברצונך למחוק את הסקשן הזה?')) {
                                  removeSection(section.id);
                                }
                              }}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                                </div>
                              </div>
                      )}

                      {/* Section Content */}
                      <SectionRenderer
                        section={section}
                        sectionSchema={sectionSchema}
                        isPreviewMode={isPreviewMode}
                        previewMode={previewMode}
                        onUpdateSection={(updates) => updateSection(section.id, updates)}
                      />
                    </div>
                          );
                        })}
                      </div>
            )}
                    </div>
              </div>

        {/* Right Sidebar - Properties Panel */}
        {!isPreviewMode && rightSidebarOpen && selectedElement && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">הגדרות</h2>
              <p className="text-sm text-gray-500 mt-1">ערוך את הסקשן הנבחר</p>
            </div>

            <div className="p-4">
              {selectedElement.type === 'section' && (
                <div>
                  <p className="text-sm text-gray-600">
                    פאנל הגדרות יתווסף בקרוב...
                  </p>
                </div>
              )}
              </div>
            </div>
        )}

        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">הוסף סקשן</h2>
                  <p className="text-sm text-gray-500 mt-1">בחר סקשן מהספרייה להוספה לדף</p>
                </div>
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="חפש סקשנים..."
                    value={sectionSearchTerm}
                    onChange={(e) => setSectionSearchTerm(e.target.value)}
                    className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sections Grid */}
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_SECTIONS
                    .filter(section => 
                      !sectionSearchTerm || 
                      section.name.toLowerCase().includes(sectionSearchTerm.toLowerCase()) ||
                      section.description.toLowerCase().includes(sectionSearchTerm.toLowerCase())
                    )
                    .map((sectionSchema) => {
                      const IconComponent = sectionSchema.icon;
                      return (
                        <button
                          key={sectionSchema.id}
                          onClick={() => {
                            addSection(sectionSchema.id);
                            setShowAddSectionModal(false);
                            setSectionSearchTerm('');
                          }}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-right transition-colors group"
                        >
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 mb-1">{sectionSchema.name}</div>
                              <div className="text-xs text-gray-500 line-clamp-2">{sectionSchema.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteBuilderPage; 

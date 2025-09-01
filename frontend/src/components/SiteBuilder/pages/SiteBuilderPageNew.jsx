/**
 * 🎨 QuickShop Site Builder - Main Builder Page (Refactored)
 * הבילדר החדש בהשראת שופיפיי עם ממשק בעברית - מחולק לקומפוננטות
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../../../config/environment.js';

// Import our new sections system
import { ALL_SECTIONS, getSectionById } from '../sections/index.js';

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
  }, [selectedPage, user?.id]);

  const loadPageStructure = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || getApiUrl('');
      const response = await fetch(`${baseUrl}/api/custom-pages/${user.store}/${selectedPage}`);
      
      if (response.ok) {
        const data = await response.json();
        setPageStructure(data);
        saveToHistory(data);
        console.log(`📄 Loaded ${selectedPage} page structure:`, data);
      } else {
        console.log(`📄 No existing ${selectedPage} page found, creating default structure`);
      }
    } catch (serverError) {
      console.log(`📄 No existing ${selectedPage} page found, creating default structure`);
    }

    // Create default Jupiter-inspired home page structure (without header/footer)
    if (selectedPage === 'home') {
      const defaultStructure = createDefaultHomePageStructure();
      setPageStructure(defaultStructure);
      saveToHistory(defaultStructure);
      
      // Also create default global structure if not exists
      const defaultGlobal = createDefaultGlobalStructure();
      setGlobalStructure(defaultGlobal);
    }
    
    setIsLoading(false);
    loadingRef.current = false;
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
  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPageStructure(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPageStructure(history[historyIndex + 1]);
    }
  };

  // Add new section
  const addSection = (sectionType) => {
    const sectionSchema = getSectionById(sectionType);
    if (!sectionSchema) return;

    const newSection = {
      id: `${sectionType}_${Date.now()}`,
      type: sectionType,
      settings: sectionSchema.presets?.[0]?.settings || {},
      blocks: sectionSchema.presets?.[0]?.blocks || []
    };

    const newStructure = {
      ...pageStructure,
      sections: [...pageStructure.sections, newSection]
    };

    setPageStructure(newStructure);
    saveToHistory(newStructure);
    setSelectedElement({ type: 'section', id: newSection.id });
  };

  // Remove section
  const removeSection = (sectionId) => {
    const newStructure = {
      ...pageStructure,
      sections: pageStructure.sections.filter(s => s.id !== sectionId)
    };
    setPageStructure(newStructure);
    saveToHistory(newStructure);
    
    if (selectedElement?.id === sectionId) {
      setSelectedElement(null);
    }
  };

  // Duplicate section
  const duplicateSection = (sectionId) => {
    const sectionToDuplicate = pageStructure.sections.find(s => s.id === sectionId);
    if (!sectionToDuplicate) return;

    const newSection = {
      ...sectionToDuplicate,
      id: `${sectionToDuplicate.type}_${Date.now()}`
    };

    const sectionIndex = pageStructure.sections.findIndex(s => s.id === sectionId);
    const newSections = [...pageStructure.sections];
    newSections.splice(sectionIndex + 1, 0, newSection);

    const newStructure = { ...pageStructure, sections: newSections };
    setPageStructure(newStructure);
    saveToHistory(newStructure);
  };

  // Drag and drop handlers
  const handleDragStart = (e, sectionId, index) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ sectionId, index }));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { sectionId, index: dragIndex } = dragData;

      if (dragIndex === dropIndex) return;

      const newSections = [...pageStructure.sections];
      const draggedSection = newSections[dragIndex];
      
      // Remove from old position
      newSections.splice(dragIndex, 1);
      
      // Insert at new position
      const adjustedDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newSections.splice(adjustedDropIndex, 0, draggedSection);

      const newStructure = { ...pageStructure, sections: newSections };
      setPageStructure(newStructure);
      saveToHistory(newStructure);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  // Save page structure to server
  const savePageStructure = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || getApiUrl('');
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/api/custom-pages/${user.store}/${selectedPage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          structure: pageStructure,
          settings: pageStructure.settings || {},
          isPublished: true
        }),
      });

      if (response.ok) {
        console.log('✅ Page structure saved successfully');
        // You could show a success message here
      } else {
        throw new Error('Failed to save');
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
        userStore={user?.stores?.[0]}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <BuilderSidebar
          isOpen={!isPreviewMode && leftSidebarOpen}
          selectedPage={selectedPage}
          pageStructure={pageStructure}
          globalStructure={globalStructure}
          editingGlobal={editingGlobal}
          selectedElement={selectedElement}
          dragOverIndex={dragOverIndex}
          onSectionSelect={setSelectedElement}
          onGlobalEdit={setEditingGlobal}
          onSectionDragStart={handleDragStart}
          onSectionDragOver={handleDragOver}
          onSectionDrop={handleDrop}
          onSectionDuplicate={duplicateSection}
          onSectionRemove={removeSection}
          onAddSectionClick={() => setShowAddSectionModal(true)}
        />

        {/* Canvas */}
        <BuilderCanvas
          isLoading={isLoading}
          editingGlobal={editingGlobal}
          globalStructure={globalStructure}
          pageStructure={pageStructure}
          previewMode={previewMode}
          isPreviewMode={isPreviewMode}
          onUpdateSection={(sectionId, updates) => {
            const updatedSections = pageStructure.sections.map(s =>
              s.id === sectionId ? { ...s, ...updates } : s
            );
            const newStructure = { ...pageStructure, sections: updatedSections };
            setPageStructure(newStructure);
            saveToHistory(newStructure);
          }}
          onUpdateGlobalSection={(globalType, updates) => {
            setGlobalStructure(prev => ({
              ...prev,
              [globalType]: { ...prev[globalType], ...updates }
            }));
          }}
        />

        {/* Settings Panel */}
        {!isPreviewMode && rightSidebarOpen && selectedElement && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">הגדרות</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedElement.type === 'section' ? 'הגדרות הסקשן' : 'הגדרות כלליות'}
              </p>
            </div>
            
            <div className="p-4">
              {selectedElement.type === 'section' && (
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-2 text-gray-300">⚙️</div>
                    <p>פאנל הגדרות בפיתוח</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Section Modal */}
        <AddSectionModal
          isOpen={showAddSectionModal}
          onClose={() => setShowAddSectionModal(false)}
          onAddSection={addSection}
        />
      </div>
    </div>
  );
};

export default SiteBuilderPage;

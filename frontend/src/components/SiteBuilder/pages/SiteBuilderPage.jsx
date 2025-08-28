/**
 * 🎨 QuickShop Site Builder - Main Builder Page (Refactored)
 * הבילדר החדש בהשראת שופיפיי עם ממשק בעברית - מחולק לקומפוננטות
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Import our new sections system
import { ALL_SECTIONS, getSectionById } from '../sections/index.js';

// Import new components
import BuilderHeader from '../components/BuilderHeader.jsx';
import BuilderSidebar from '../components/BuilderSidebar.jsx';
import BuilderCanvas from '../components/BuilderCanvas.jsx';
import AddSectionModal from '../components/AddSectionModal.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import Toast from '../../../store/core/components/Toast.jsx';

// Import hooks for global styles management
import useGlobalStyles from '../../../hooks/useGlobalStyles.js';
import { useFonts } from '../../../hooks/useFonts.js';

const SiteBuilderPage = ({ user, onBack }) => {
  const { t } = useTranslation();
  
  // Global styles management
  const { updateSetting: updateGlobalStyle, globalSettings } = useGlobalStyles();
  const { loadAndApplyFont } = useFonts();

  // Apply current font to canvas when component mounts or font changes
  useEffect(() => {
    if (globalSettings.fontFamily) {
      loadAndApplyFont(globalSettings.fontFamily);
    }
  }, [globalSettings.fontFamily, loadAndApplyFont]);
  
  // State management
  const [selectedPage, setSelectedPage] = useState('home');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [pageStructure, setPageStructure] = useState({
    sections: [],
    settings: {}
  });
  // Create default global structure
  const createDefaultGlobalStructure = () => ({
    header: {
      type: 'header',
        settings: {
        header_design: 'logo-center-menu-left',
        container: 'container-fluid',
        header_sticky: true,
        transparent_on_top: false,
        logo_text: user?.stores?.[0]?.name || 'החנות שלי',
        logo_max_width: 145,
        sticky_logo_max_width: 145,
        mobile_logo_max_width: 110,
        uppercase_parent_level: true,
        search: 'hide',
        show_account_icon: true,
        show_cart_icon: true,
        show_wishlist_icon: true,
        show_currency_switcher: true,
        show_country_selector: false,
        show_language_switcher: true
      }
    },
    footer: {
      type: 'footer',
    settings: {}
    }
  });

  const [globalStructure, setGlobalStructure] = useState(createDefaultGlobalStructure);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const [editingGlobal, setEditingGlobal] = useState(null); // 'header' | 'footer' | null
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const saveTimeoutRef = useRef(null);

    // Load page structure and global settings when component mounts
  useEffect(() => {
    if (user) {
    loadPageStructure();
      loadGlobalSettings();
    }
  }, [selectedPage, user?.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadPageStructure = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    let pageLoaded = false;
    try {
      const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/custom-pages/${storeSlug}/${selectedPage}`);
      
          if (response.ok) {
        const data = await response.json();
        const pageStructureData = {
          sections: data.structure?.sections || [],
          settings: data.settings || {}
        };
        setPageStructure(pageStructureData);
        saveToHistory(pageStructureData);
        console.log(`📄 Loaded ${selectedPage} page structure:`, data);
        console.log(`📄 Sections loaded:`, pageStructureData.sections?.length || 0, pageStructureData.sections);
        pageLoaded = true;
      } else {
        console.log(`📄 No existing ${selectedPage} page found, creating default structure`);
          }
        } catch (serverError) {
      console.log(`📄 No existing ${selectedPage} page found, creating default structure`);
    }

    // Create default Jupiter-inspired home page structure (without header/footer) - ONLY if page wasn't loaded
    if (selectedPage === 'home' && !pageLoaded) {
      console.log('🏗️ Creating default home page structure because no saved page found');
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

  // Load global settings (header & footer)
  const loadGlobalSettings = async () => {
    const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
    if (!storeSlug) {
      console.warn('No user store found, using default global structure');
      setGlobalStructure(createDefaultGlobalStructure());
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const [headerResponse, footerResponse] = await Promise.all([
        fetch(`${baseUrl}/api/global-settings/${storeSlug}/header`),
        fetch(`${baseUrl}/api/global-settings/${storeSlug}/footer`)
      ]);

      const headerData = headerResponse.ok ? await headerResponse.json() : null;
      const footerData = footerResponse.ok ? await footerResponse.json() : null;

      setGlobalStructure({
        header: headerData ? {
          type: 'header',
          settings: headerData.settings || {},
          blocks: headerData.blocks || []
        } : createDefaultGlobalStructure().header,
        footer: footerData ? {
          type: 'footer', 
          settings: footerData.settings || {},
          blocks: footerData.blocks || []
        } : createDefaultGlobalStructure().footer
      });

        } catch (error) {
      console.error('Error loading global settings:', error);
      // Fallback to default structure
      setGlobalStructure(createDefaultGlobalStructure());
    }
  };

  // Save global settings with debounce
  const saveGlobalSettings = useCallback(async (type, settings, blocks) => {
    const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
    if (!storeSlug) {
      console.warn('No user store found, cannot save global settings');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/global-settings/${storeSlug}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings,
          blocks
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save global settings');
      }

      const data = await response.json();
      // console.log(`${type} settings saved successfully:`, data);
      
    } catch (error) {
      console.error(`Error saving ${type} settings:`, error);
    }
  }, [user]);

  // Debounced save function
  const debouncedSaveGlobalSettings = useCallback((type, settings, blocks) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveGlobalSettings(type, settings, blocks);
    }, 500); // Save after 500ms of no changes
  }, [saveGlobalSettings]);

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
    console.log('🗑️ Removing section:', {
      sectionId,
      currentSectionsCount: pageStructure.sections?.length || 0,
      sectionsBeforeRemoval: pageStructure.sections?.map(s => ({ id: s.id, type: s.type }))
    });
    
    const newStructure = {
      ...pageStructure,
      sections: pageStructure.sections.filter(s => s.id !== sectionId)
    };
    
    console.log('🗑️ After removal:', {
      newSectionsCount: newStructure.sections?.length || 0,
      sectionsAfterRemoval: newStructure.sections?.map(s => ({ id: s.id, type: s.type }))
    });
    
    setPageStructure(newStructure);
    saveToHistory(newStructure);
    
    if (selectedElement?.id === sectionId) {
      setSelectedElement(null);
    }
    
    console.log('🔄 State updated, newStructure has:', newStructure.sections?.length || 0, 'sections');
  };

  // Reset page to default structure
  const resetPage = async () => {
    console.log('🔄 Resetting page to default structure');
    
    // Delete the page from server first
    try {
      const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`${baseUrl}/api/custom-pages/${storeSlug}/${selectedPage}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok || response.status === 404) {
        console.log('✅ Page deleted from server');
      }
    } catch (error) {
      console.warn('Failed to delete page from server:', error);
    }
    
    // Create default structure
    if (selectedPage === 'home') {
      const defaultStructure = createDefaultHomePageStructure();
      setPageStructure(defaultStructure);
      saveToHistory(defaultStructure);
      
      setToastMessage('הדף אופס למצב הדיפולטיבי!');
      setToastType('success');
      setShowToast(true);
    }
  };

  // Handle general settings
  const handleGeneralSettings = () => {
    setEditingGlobal(editingGlobal === 'general' ? null : 'general');
    setSelectedElement(null);
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
  const savePageStructure = async (structureToSave = pageStructure) => {
    try {
      const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const dataToSend = {
        structure: {
          sections: structureToSave.sections || []
        },
        settings: structureToSave.settings || {},
        isPublished: true
      };
      
      console.log('🚀 Saving page structure:', {
        storeSlug,
        selectedPage,
        sectionsCount: structureToSave.sections?.length || 0,
        currentPageStructureSections: pageStructure.sections?.length || 0,
        structureToSaveSections: structureToSave.sections,
        currentPageStructure: pageStructure,
        dataToSend
      });
      
      // אם אין סקשנים, נמחק את הדף מהשרת
      if (!structureToSave.sections || structureToSave.sections.length === 0) {
        console.log('🗑️ Deleting empty page from server');
        const response = await fetch(`${baseUrl}/api/custom-pages/${storeSlug}/${selectedPage}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok || response.status === 404) {
          console.log('✅ Empty page deleted successfully');
          setToastMessage('הדף נמחק בהצלחה!');
          setToastType('success');
          setShowToast(true);
        } else {
          throw new Error('Failed to delete empty page');
        }
        return;
      }
      
      const response = await fetch(`${baseUrl}/api/custom-pages/${storeSlug}/${selectedPage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log('✅ Page structure saved successfully');
        setToastMessage('הדף נשמר בהצלחה!');
        setToastType('success');
        setShowToast(true);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setToastMessage('שגיאה בשמירת הדף');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="site-builder h-screen flex flex-col bg-gray-50" dir="rtl">
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
        onSave={() => {
          console.log('💾 Manual save clicked, current pageStructure:', pageStructure.sections?.length || 0, 'sections');
          savePageStructure(pageStructure);
        }}
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
          onGeneralSettings={handleGeneralSettings}
        />

        {/* Canvas and Settings Panel */}
        <div className="flex-1 flex">
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
          {!isPreviewMode && rightSidebarOpen && (selectedElement || editingGlobal) && (
            <SettingsPanel
              isOpen={true}
          onClose={() => {
            setSelectedElement(null);
            setEditingGlobal(null);
          }}
          section={editingGlobal === 'general' 
            ? { id: 'general', name: 'הגדרות כלליות' }
            : editingGlobal 
              ? getSectionById(editingGlobal) 
              : selectedElement?.type === 'section' 
                ? getSectionById(selectedElement.sectionType) 
                : null
          }
          settings={editingGlobal === 'general'
            ? pageStructure.settings || {}
            : editingGlobal 
              ? globalStructure[editingGlobal]?.settings || {}
              : selectedElement?.settings || {}
          }
          onSettingChange={(settingId, value) => {
            if (editingGlobal === 'general') {
              // Handle reset page button
              if (settingId === 'resetPage') {
                resetPage();
                return;
              }
              
              // Update global styles immediately
              updateGlobalStyle(settingId, value);
              
              // Update general page settings
              const newStructure = {
                ...pageStructure,
                settings: {
                  ...pageStructure.settings,
                  [settingId]: value
                }
              };
              setPageStructure(newStructure);
              saveToHistory(newStructure);
            } else if (editingGlobal) {
              // Update global section settings
              setGlobalStructure(prev => {
                const newGlobalStructure = {
                  ...prev,
                  [editingGlobal]: {
                    ...prev[editingGlobal],
                    settings: {
                      ...prev[editingGlobal]?.settings,
                      [settingId]: value
                    }
                  }
                };
                
                // Save to database with debounce
                const updatedSection = newGlobalStructure[editingGlobal];
                debouncedSaveGlobalSettings(editingGlobal, updatedSection.settings, updatedSection.blocks);
                
                return newGlobalStructure;
              });
            } else if (selectedElement?.type === 'section') {
              // Update page section settings
              const updatedSections = pageStructure.sections.map(section => 
                section.id === selectedElement.id 
                  ? { ...section, settings: { ...section.settings, [settingId]: value } }
                  : section
              );
              const newStructure = { ...pageStructure, sections: updatedSections };
              setPageStructure(newStructure);
              saveToHistory(newStructure);
            }
          }}
          title={editingGlobal 
            ? `הגדרות ${editingGlobal === 'header' ? 'הדר' : 'פוטר'} האתר`
            : selectedElement?.type === 'section' 
              ? 'הגדרות הסקשן' 
              : 'הגדרות כלליות'
          }
            />
          )}
        </div>

        {/* Add Section Modal */}
        <AddSectionModal
          isOpen={showAddSectionModal}
          onClose={() => setShowAddSectionModal(false)}
          onAddSection={addSection}
        />

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      </div>
    </div>
  );
};

export default SiteBuilderPage; 

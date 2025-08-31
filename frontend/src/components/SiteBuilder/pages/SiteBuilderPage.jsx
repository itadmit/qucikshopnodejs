/**
 * 🎨 QuickShop Site Builder - Main Builder Page (Refactored)
 * הבילדר החדש בהשראת שופיפיי עם ממשק בעברית - מחולק לקומפוננטות
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import '../SiteBuilder.css';

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
  const location = useLocation();
  
  // Global styles management
  const { updateSetting: updateGlobalStyle, globalSettings } = useGlobalStyles();
  const { loadAndApplyFont } = useFonts();

  // Apply current font to canvas when component mounts or font changes
  useEffect(() => {
    if (globalSettings.fontFamily) {
      loadAndApplyFont(globalSettings.fontFamily);
    }
  }, [globalSettings.fontFamily, loadAndApplyFont]);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(location.search);
  const pageIdFromUrl = urlParams.get('pageId');
  const typeFromUrl = urlParams.get('type');
  
  // State management
  const [selectedPage, setSelectedPage] = useState('home');
  const [currentPageData, setCurrentPageData] = useState(null);
  const [pages, setPages] = useState([]);
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

  // Load page from URL parameters on mount
  useEffect(() => {
    console.log('🔍 URL Params Check:', { pageIdFromUrl, typeFromUrl, user: !!user });
    if (pageIdFromUrl && typeFromUrl === 'content' && user) {
      console.log('📄 Loading page from URL:', pageIdFromUrl);
      loadPageFromId(pageIdFromUrl);
    }
  }, [pageIdFromUrl, typeFromUrl, user]);

    // Load page structure and global settings when component mounts
  useEffect(() => {
    if (user && !pageIdFromUrl) {
    loadPageStructure();
      loadGlobalSettings();
    }
    // טען את רשימת העמודים
    if (user?.stores?.[0]?.id) {
      loadPages();
    }
  }, [selectedPage, user?.id, pageIdFromUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Load specific page by ID from URL parameter
  const loadPageFromId = async (pageId) => {
    console.log('🚀 loadPageFromId called with pageId:', pageId);
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const isDevelopment = window.location.port === '5173';
      const baseUrl = isDevelopment 
        ? 'http://3.64.187.151:3001/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      // First, get the page data to know its slug
      const pageResponse = await fetch(`${baseUrl}/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        setCurrentPageData(pageData);
        setSelectedPage(pageData.slug);
        
        // Try to load existing page structure
        const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
        const structureResponse = await fetch(`${baseUrl}/custom-pages/${storeSlug}/${pageData.slug}`);
        
        if (structureResponse.ok) {
          const data = await structureResponse.json();
          const pageStructureData = {
            sections: data.structure?.sections || [],
            settings: data.settings || {}
          };
          setPageStructure(pageStructureData);
          saveToHistory(pageStructureData);
          console.log(`📄 Loaded ${pageData.slug} page structure:`, data);
        } else {
          // Create default content page structure (not home page)
          console.log(`📄 No existing ${pageData.slug} page found, creating default content structure`);
          const defaultContentStructure = createDefaultContentPageStructure(pageData.title);
          setPageStructure(defaultContentStructure);
          saveToHistory(defaultContentStructure);
        }
      } else {
        console.error('Failed to load page data');
        // Fallback to home page
        setSelectedPage('home');
        loadPageStructure();
      }
    } catch (error) {
      console.error('Error loading page:', error);
      // Fallback to home page
      setSelectedPage('home');
      loadPageStructure();
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  // Load pages list from server
  const loadPages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storeId = user?.stores?.[0]?.id;
      
      if (!storeId) return;
      
      const isDevelopment = window.location.port === '5173';
      const baseUrl = isDevelopment 
        ? 'http://3.64.187.151:3001/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      const response = await fetch(`${baseUrl}/pages/store/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Loaded pages:', data);
        setPages(data);
      }
    } catch (error) {
      console.error('שגיאה בטעינת העמודים:', error);
    }
  };

  const loadPageStructure = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    let pageLoaded = false;
    try {
      const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      const response = await fetch(`${baseUrl}/custom-pages/${storeSlug}/${selectedPage}`);
      
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

    // Create default structures for different page types - ONLY if page wasn't loaded
    if (!pageLoaded) {
      let defaultStructure;
      
      if (selectedPage === 'home') {
        console.log('🏗️ Creating default home page structure because no saved page found');
        defaultStructure = createDefaultHomePageStructure();
      } else if (selectedPage === 'product') {
        console.log('🏗️ Creating default product page structure because no saved page found');
        defaultStructure = createDefaultProductPageStructure();
      } else {
        console.log('🏗️ Creating default content page structure because no saved page found');
        defaultStructure = createDefaultContentPageStructure();
      }
      
      setPageStructure(defaultStructure);
      saveToHistory(defaultStructure);
      
      // Also create default global structure if not exists (for home page)
      if (selectedPage === 'home') {
        const defaultGlobal = createDefaultGlobalStructure();
        setGlobalStructure(defaultGlobal);
      }
    }
    
    setIsLoading(false);
    loadingRef.current = false;
  };

  // Create default content page structure (simple content page)
  const createDefaultContentPageStructure = (pageTitle = 'עמוד תוכן') => {
    return {
      sections: [
        {
          id: 'content_text_' + Date.now(),
          type: 'rich_text',
          settings: {
            content: `<h1 style="text-align: center;">${pageTitle}</h1><p style="text-align: center;">כאן יופיע התוכן</p>`,
            container: 'container',
            text_align: 'center',
            max_width: 800,
            padding_top: 60,
            padding_bottom: 60,
            background_color: '#ffffff',
            text_color: '#1f2937',
            border_radius: 0,
            add_shadow: false
          }
        }
      ],
      settings: {
        seo_title: pageTitle,
        seo_description: `עמוד ${pageTitle} באתר`
      }
    };
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
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      const [headerResponse, footerResponse] = await Promise.all([
        fetch(`${baseUrl}/global-settings/${storeSlug}/header`),
        fetch(`${baseUrl}/global-settings/${storeSlug}/footer`)
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
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      const response = await fetch(`${baseUrl}/global-settings/${storeSlug}/${type}`, {
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

  // Create default product page structure
  const createDefaultProductPageStructure = () => {
    return {
      sections: [
        {
          id: `product_images_${Date.now()}`,
          type: 'product_images',
          settings: {
            layout: 'gallery',
            show_thumbnails: true,
            image_aspect_ratio: 'square',
            zoom_enabled: true
          }
        },
        {
          id: `product_title_${Date.now() + 1}`,
          type: 'product_title',
          settings: {
            show_vendor: false,
            title_size: 'text-3xl',
            title_weight: 'font-bold',
            alignment: 'text-right'
          }
        },
        {
          id: `product_price_${Date.now() + 2}`,
          type: 'product_price',
          settings: {
            show_compare_price: true,
            show_unit_price: false,
            price_size: 'text-2xl',
            alignment: 'text-right'
          }
        },
        {
          id: `product_options_${Date.now() + 3}`,
          type: 'product_options',
          settings: {
            show_labels: true,
            option_style: 'buttons',
            show_selected_value: true
          }
        },
        {
          id: `add_to_cart_${Date.now() + 4}`,
          type: 'add_to_cart',
          settings: {
            show_quantity_selector: true,
            button_style: 'primary',
            button_size: 'large',
            show_buy_now: false
          }
        }
      ],
      settings: {
        templateName: 'Jupiter',
        pageType: 'product',
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
    
    setSelectedElement({ type: 'section', id: newSection.id, sectionType: sectionType });
    setRightSidebarOpen(true);
    setEditingGlobal(null);
    
    // גלילה אוטומטית לסקשן החדש
    setTimeout(() => {
      const sectionElement = document.querySelector(`[data-section-id="${newSection.id}"]`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
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
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${baseUrl}/custom-pages/${storeSlug}/${selectedPage}`, {
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

  // Reset page to default content
  const resetToDefaultContent = () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את העמוד לתוכן ברירת מחדל? פעולה זו תמחק את כל התוכן הקיים.')) {
      const pageTitle = currentPageData?.title || selectedPage;
      const defaultStructure = createDefaultContentPageStructure(pageTitle);
      setPageStructure(defaultStructure);
      saveToHistory(defaultStructure);
      
      setToastMessage('העמוד אופס לתוכן ברירת מחדל!');
      setToastType('success');
      setShowToast(true);
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
  const savePageStructure = async (structureToSave = pageStructure) => {
    try {
      const storeSlug = user?.stores?.[0]?.slug || localStorage.getItem('currentStoreSlug');
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';
      const token = localStorage.getItem('authToken');
      
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
        const response = await fetch(`${baseUrl}/custom-pages/${storeSlug}/${selectedPage}`, {
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
      
      const response = await fetch(`${baseUrl}/custom-pages/${storeSlug}/${selectedPage}`, {
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
          console.log('🔄 Page change requested:', { newEditingGlobal, newSelectedPage, currentPage: selectedPage });
          
          setEditingGlobal(newEditingGlobal);
          setSelectedPage(newSelectedPage);
          
          // אם זה לא עריכה גלובלית, טען את התוכן של העמוד החדש
          if (!newEditingGlobal && newSelectedPage !== selectedPage) {
            console.log('📄 Loading new page content:', newSelectedPage);
            
            // נקה את הנתונים הקיימים
            setCurrentPageData(null);
            
            // בדוק אם זה עמוד תוכן דינמי
            const isDynamicPage = pages.some(page => page.slug === newSelectedPage);
            
            if (isDynamicPage) {
              // מצא את העמוד ב-pages array
              const pageData = pages.find(page => page.slug === newSelectedPage);
              if (pageData) {
                console.log('🔍 Found dynamic page data:', pageData);
                loadPageFromId(pageData.id);
              }
            } else {
              // עמוד סטטי - טען את המבנה הרגיל
              console.log('📋 Loading static page structure for:', newSelectedPage);
              loadPageStructure();
            }
          }
        }}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        onPreviewModeChange={setPreviewMode}
        onUndo={undo}
        onRedo={redo}
        onSave={() => {
          console.log('💾 Manual save clicked, current pageStructure:', pageStructure.sections?.length || 0, 'sections');
          savePageStructure(pageStructure);
        }}
        onResetToDefault={resetToDefaultContent}
        userStore={user?.stores?.[0]}
        currentPageData={currentPageData}
        pages={pages}
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
            onSectionClick={(sectionId, sectionType) => {
              console.log('🎯 Section clicked:', { sectionId, sectionType });
              setSelectedElement({ 
                type: 'section', 
                id: sectionId, 
                sectionType: sectionType 
              });
              setRightSidebarOpen(true);
              setEditingGlobal(null);
            }}
          />

          {/* Settings Panel */}
          {!isPreviewMode && rightSidebarOpen && (selectedElement || editingGlobal) && (
            <div className="animate-slide-in-left">
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
              : selectedElement?.type === 'section' 
                ? pageStructure.sections.find(s => s.id === selectedElement.id)?.settings || {}
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
            </div>
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

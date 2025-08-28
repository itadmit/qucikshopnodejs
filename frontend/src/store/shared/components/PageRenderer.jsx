import React from 'react';

// Import the same SectionRenderer from the site builder
import SectionRenderer from '../../../components/SiteBuilder/components/SectionRenderer.jsx';
import { getSectionById } from '../../../components/SiteBuilder/sections/index.js';

/**
 * Page Renderer - מציג דפים מותאמים מהבילדר
 * משתמש באותו SectionRenderer כמו בבילדר לקבלת WYSIWYG מושלם
 * @param {Object} props
 * @param {Object} props.pageStructure - מבנה הדף מהבילדר
 * @param {Object} props.storeData - נתוני החנות
 */
const PageRenderer = ({ pageStructure, storeData, isLoading = false }) => {
  
  // Debug logging
  console.log('🎨 PageRenderer received:', { pageStructure, storeData, isLoading });

  // Show skeleton while loading
  if (isLoading || !pageStructure) {
    console.log('💀 Showing page skeleton!', { isLoading, hasPageStructure: !!pageStructure });
    return (
      <div className="page-renderer">
        {/* Page skeleton */}
        <div className="space-y-8 animate-pulse">
          {/* Hero section skeleton */}
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          
          {/* Content sections skeleton */}
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            {/* Categories skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
            
            {/* Products skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageStructure.sections) {
    console.warn('No page sections found');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">אין תוכן להצגה</p>
        </div>
      </div>
    );
  }

  // Apply page settings as CSS variables if needed
  const pageSettings = pageStructure.settings || {};
  const pageStyle = {
    '--primary-color': pageSettings.primaryColor || '#3b82f6',
    '--secondary-color': pageSettings.secondaryColor || '#8b5cf6',
    '--font-family': pageSettings.fontFamily || 'Inter',
    direction: pageSettings.rtl ? 'rtl' : 'ltr'
  };

  return (
    <div className="page-renderer" style={pageStyle}>
      {pageStructure.sections.map((section, index) => (
        <SectionRenderer
          key={section.id || index}
          section={section}
          sectionSchema={getSectionById(section.type)}
          storeData={storeData}
          isPreview={true}
          // Pass any additional props needed for store display
        />
      ))}
    </div>
  );
};

export default PageRenderer;

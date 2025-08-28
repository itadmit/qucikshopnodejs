/**
 * 🎨 QuickShop Site Builder - Canvas Component
 * אזור הקנבס המרכזי
 */

import React from 'react';
import { Layout } from 'lucide-react';
import SectionRenderer from './SectionRenderer';
import { getSectionById } from '../sections';

const BuilderCanvas = ({
  isLoading,
  editingGlobal,
  globalStructure,
  pageStructure,
  previewMode,
  isPreviewMode,
  onUpdateSection,
  onUpdateGlobalSection
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען את הדף...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={`mx-auto transition-all duration-300 ${
        previewMode === 'mobile' ? 'max-w-sm' : 'max-w-none'
      }`}>
        {/* Always render header, page content, and footer */}
        <div className="min-h-screen flex flex-col">
          {/* Header Section - Always visible */}
          <HeaderSection
            globalStructure={globalStructure}
            editingGlobal={editingGlobal}
            isPreviewMode={isPreviewMode}
            previewMode={previewMode}
            onUpdateGlobalSection={onUpdateGlobalSection}
          />

          {/* Page Content */}
          <div className="flex-1">
            {isLoading ? (
              <LoadingState />
            ) : pageStructure.sections.length === 0 ? (
              <EmptyCanvas />
            ) : (
              <PageSectionsCanvas
                pageStructure={pageStructure}
                isPreviewMode={isPreviewMode}
                previewMode={previewMode}
                onUpdateSection={onUpdateSection}
              />
            )}
          </div>

          {/* Footer Section - Always visible */}
          <FooterSection
            globalStructure={globalStructure}
            editingGlobal={editingGlobal}
            isPreviewMode={isPreviewMode}
            previewMode={previewMode}
            onUpdateGlobalSection={onUpdateGlobalSection}
          />
        </div>
      </div>
    </div>
  );
};

// Header Section Component
const HeaderSection = ({
  globalStructure,
  editingGlobal,
  isPreviewMode,
  previewMode,
  onUpdateGlobalSection
}) => {
  const headerSection = globalStructure.header;
  const isEditing = editingGlobal === 'header';
  
  if (!headerSection) {
    return (
      <div className={`bg-gray-100 border-2 ${isEditing ? 'border-blue-500' : 'border-dashed border-gray-300'} p-8`}>
        <div className="text-center text-gray-500">
          <Layout className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">הדר האתר</p>
          <p className="text-xs">לחץ על "הדר" בסיידבר לעריכה</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isEditing ? 'ring-2 ring-blue-500' : ''} ${!isPreviewMode ? 'hover:ring-2 hover:ring-blue-300' : ''}`}>
      {!isPreviewMode && (
        <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white px-2 py-1 rounded text-xs">
          הדר האתר
        </div>
      )}
      <SectionRenderer
        section={headerSection}
        sectionSchema={getSectionById('header')}
        isPreviewMode={isPreviewMode}
        previewMode={previewMode}
        onUpdateSection={(updates) => onUpdateGlobalSection('header', updates)}
      />
    </div>
  );
};

// Footer Section Component
const FooterSection = ({
  globalStructure,
  editingGlobal,
  isPreviewMode,
  previewMode,
  onUpdateGlobalSection
}) => {
  const footerSection = globalStructure.footer;
  const isEditing = editingGlobal === 'footer';
  
  if (!footerSection) {
    return (
      <div className={`bg-gray-100 border-2 ${isEditing ? 'border-blue-500' : 'border-dashed border-gray-300'} p-8`}>
        <div className="text-center text-gray-500">
          <Layout className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">פוטר האתר</p>
          <p className="text-xs">לחץ על "פוטר" בסיידבר לעריכה</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isEditing ? 'ring-2 ring-blue-500' : ''} ${!isPreviewMode ? 'hover:ring-2 hover:ring-blue-300' : ''}`}>
      {!isPreviewMode && (
        <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white px-2 py-1 rounded text-xs">
          פוטר האתר
        </div>
      )}
      <SectionRenderer
        section={footerSection}
        sectionSchema={getSectionById('footer')}
        isPreviewMode={isPreviewMode}
        previewMode={previewMode}
        onUpdateSection={(updates) => onUpdateGlobalSection('footer', updates)}
      />
    </div>
  );
};

// Loading State Component
const LoadingState = () => {
  return (
    <div className="h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">טוען את הדף...</p>
      </div>
    </div>
  );
};

// Global Section Canvas (Header/Footer editing)
const GlobalSectionCanvas = ({
  editingGlobal,
  globalStructure,
  isPreviewMode,
  previewMode,
  onUpdateGlobalSection
}) => {
  const section = globalStructure[editingGlobal];
  
  if (!section) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {editingGlobal === 'header' ? 'הדר האתר' : 'פוטר האתר'}
          </h3>
          <p className="text-gray-500">טוען את ההגדרות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative group hover:ring-2 hover:ring-blue-300">
        <SectionRenderer
          section={section}
          sectionSchema={getSectionById(editingGlobal)}
          isPreviewMode={isPreviewMode}
          previewMode={previewMode}
          onUpdateSection={(updates) => onUpdateGlobalSection(editingGlobal, updates)}
        />
      </div>
    </div>
  );
};

// Page Sections Canvas
const PageSectionsCanvas = ({
  pageStructure,
  isPreviewMode,
  previewMode,
  onUpdateSection
}) => {
  return (
    <div className="space-y-4">
      {pageStructure.sections.map((section, index) => {
        const sectionSchema = getSectionById(section.type);
        
        return (
          <div key={section.id} className="relative group">
            <SectionRenderer
              section={section}
              sectionSchema={sectionSchema}
              isPreviewMode={isPreviewMode}
              previewMode={previewMode}
              onUpdateSection={(updates) => onUpdateSection(section.id, updates)}
            />
            
            {/* Section overlay for editing */}
            {!isPreviewMode && (
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-lg pointer-events-none">
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {sectionSchema?.name || section.type}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Empty Canvas State
const EmptyCanvas = () => {
  return (
    <div className="h-96 flex items-center justify-center">
      <div className="text-center">
        <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">התחל לבנות את הדף שלך</h3>
        <p className="text-gray-500 mb-4">הוסף סקשנים מהסיידבר השמאלי</p>
        <div className="text-sm text-gray-400">
          גרור סקשנים או לחץ על "הוסף סקשן" כדי להתחיל
        </div>
      </div>
    </div>
  );
};

export default BuilderCanvas;

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  GripVertical, 
  Edit3, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff,
  Copy,
  Settings,
  ChevronUp,
  ChevronDown,
  Layout,
  Type,
  Image,
  MessageSquare
} from 'lucide-react';
import SectionRenderer from './SectionRenderer';

const CanvasArea = ({ 
  pageStructure, 
  previewMode, 
  isPreviewMode, 
  selectedElement, 
  onSelectElement, 
  onUpdateSection, 
  onRemoveSection,
  availableSections,
  onCategorySelect 
}) => {
  const { t } = useTranslation();
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const canvasRef = useRef(null);

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
      
      onUpdateSection(null, { sections: newSections });
    }
    
    setDraggedSection(null);
    setDragOverIndex(null);
  };

  // Handle section selection
  const handleSectionClick = (sectionId, e) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onSelectElement({ type: 'section', id: sectionId });
    }
  };

  // Duplicate section
  const duplicateSection = (section) => {
    const newSection = {
      ...section,
      id: `${section.type}_${Date.now()}`
    };
    
    const sectionIndex = pageStructure.sections.findIndex(s => s.id === section.id);
    const newSections = [...pageStructure.sections];
    newSections.splice(sectionIndex + 1, 0, newSection);
    
    onUpdateSection(null, { sections: newSections });
  };

  // Move section up/down
  const moveSectionUp = (sectionId) => {
    const sectionIndex = pageStructure.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex > 0) {
      const newSections = [...pageStructure.sections];
      [newSections[sectionIndex], newSections[sectionIndex - 1]] = 
      [newSections[sectionIndex - 1], newSections[sectionIndex]];
      onUpdateSection(null, { sections: newSections });
    }
  };

  const moveSectionDown = (sectionId) => {
    const sectionIndex = pageStructure.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex < pageStructure.sections.length - 1) {
      const newSections = [...pageStructure.sections];
      [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
      [newSections[sectionIndex + 1], newSections[sectionIndex]];
      onUpdateSection(null, { sections: newSections });
    }
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId) => {
    const section = pageStructure.sections.find(s => s.id === sectionId);
    if (section) {
      onUpdateSection(sectionId, { 
        settings: { 
          ...section.settings, 
          hidden: !section.settings.hidden 
        } 
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Canvas Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <h3 className="font-medium text-gray-900">
              {isPreviewMode ? 'תצוגה מקדימה' : 'עריכה'}
            </h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
              <span>{pageStructure.sections.length} סקשנים</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm text-gray-500">
              {previewMode === 'desktop' ? 'תצוגת מחשב' : 'תצוגת נייד'}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-y-auto">
        <div 
          ref={canvasRef}
          className={`mx-auto transition-all duration-300 ${
            previewMode === 'desktop' 
              ? 'max-w-full' 
              : 'max-w-sm'
          } ${isPreviewMode ? 'bg-white' : 'bg-white shadow-lg'} min-h-full`}
          onClick={() => !isPreviewMode && onSelectElement(null)}
        >
          {pageStructure.sections.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center min-h-96 p-8">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  התחל לבנות את העמוד שלך
                </h3>
                <p className="text-gray-500 mb-6">
                  בחר קטגוריה כדי להתחיל להוסיף סקשנים לעמוד
                </p>
                
                {!isPreviewMode && onCategorySelect && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => onCategorySelect('headers')}
                      className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <Layout className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">כותרות</span>
                    </button>
                    
                    <button 
                      onClick={() => onCategorySelect('content')}
                      className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <Type className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">תוכן</span>
                    </button>
                    
                    <button 
                      onClick={() => onCategorySelect('product')}
                      className="flex flex-col items-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <Layout className="w-8 h-8 text-blue-500 group-hover:text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">מוצר</span>
                    </button>
                    
                    <button 
                      onClick={() => onCategorySelect('product')}
                      className="flex flex-col items-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <Layout className="w-8 h-8 text-blue-500 group-hover:text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">מוצר</span>
                    </button>
                    
                    <button 
                      onClick={() => onCategorySelect('media')}
                      className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <Image className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">מדיה</span>
                    </button>
                    
                    <button 
                      onClick={() => onCategorySelect('forms')}
                      className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <MessageSquare className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">טפסים</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Render sections
            <div className="relative">
              {pageStructure.sections.map((section, index) => {
                const sectionSchema = availableSections.find(s => s.id === section.type);
                const isSelected = selectedElement?.type === 'section' && selectedElement?.id === section.id;
                const isHidden = section.settings?.hidden;
                
                return (
                  <div
                    key={section.id}
                    className={`relative group ${
                      isPreviewMode ? '' : 'hover:ring-2 hover:ring-blue-300'
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
                      isHidden ? 'opacity-50' : ''
                    } ${dragOverIndex === index ? 'border-t-4 border-blue-500' : ''}`}
                    draggable={!isPreviewMode}
                    onDragStart={(e) => handleDragStart(e, section.id, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={(e) => handleSectionClick(section.id, e)}
                  >
                    {/* Section Controls */}
                    {!isPreviewMode && (
                      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse bg-white rounded-lg shadow-lg border p-1">
                          {/* Drag Handle */}
                          <button className="p-1 text-gray-500 hover:text-gray-700 cursor-move">
                            <GripVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Move Up */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSectionUp(section.id);
                            }}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          
                          {/* Move Down */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSectionDown(section.id);
                            }}
                            disabled={index === pageStructure.sections.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          {/* Visibility Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionVisibility(section.id);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          
                          {/* Duplicate */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSection(section);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          {/* Settings */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectElement({ type: 'section', id: section.id });
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('האם אתה בטוח שברצונך למחוק את הסקשן הזה?')) {
                                onRemoveSection(section.id);
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Section Label */}
                    {!isPreviewMode && (
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {sectionSchema?.name || section.type}
                        </div>
                      </div>
                    )}

                    {/* Section Content */}
                    <SectionRenderer
                      section={section}
                      sectionSchema={sectionSchema}
                      isPreviewMode={isPreviewMode}
                      previewMode={previewMode}
                      onUpdateSection={onUpdateSection}
                    />
                  </div>
                );
              })}
              
              {/* Drop zone at the end */}
              {!isPreviewMode && (
                <div className="space-y-4">
                  <div
                    className={`h-12 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors ${
                      dragOverIndex === pageStructure.sections.length ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, pageStructure.sections.length)}
                    onDrop={(e) => handleDrop(e, pageStructure.sections.length)}
                  >
                    <span className="text-gray-500 text-sm">גרור סקשן לכאן</span>
                  </div>
                  
                  {/* Add Section Button */}
                  {onCategorySelect && (
                    <div className="flex justify-center">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button 
                          onClick={() => onCategorySelect('headers')}
                          className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        >
                          <Layout className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">כותרות</span>
                        </button>
                        
                        <button 
                          onClick={() => onCategorySelect('content')}
                          className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        >
                          <Type className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">תוכן</span>
                        </button>
                        
                        <button 
                          onClick={() => onCategorySelect('product')}
                          className="flex flex-col items-center p-3 border border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        >
                          <Layout className="w-5 h-5 text-blue-500 group-hover:text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-blue-700 group-hover:text-blue-800">מוצר</span>
                        </button>
                        
                        <button 
                          onClick={() => onCategorySelect('media')}
                          className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        >
                          <Image className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">מדיה</span>
                        </button>
                        
                        <button 
                          onClick={() => onCategorySelect('forms')}
                          className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        >
                          <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">טפסים</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasArea; 
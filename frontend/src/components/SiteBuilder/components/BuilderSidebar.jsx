/**
 * 🎨 QuickShop Site Builder - Left Sidebar Component
 * סיידבר שמאלי בהשראת שופיפיי
 */

import React from 'react';
import { 
  Layout, 
  Settings, 
  Plus,
  Copy,
  Trash2,
  GripVertical,
  RotateCcw
} from 'lucide-react';
import { getSectionById } from '../sections';

const BuilderSidebar = ({ 
  isOpen,
  selectedPage,
  pageStructure,
  globalStructure,
  editingGlobal,
  selectedElement,
  dragOverIndex,
  onSectionSelect,
  onGlobalEdit,
  onSectionDragStart,
  onSectionDragOver,
  onSectionDrop,
  onSectionDuplicate,
  onSectionRemove,
  onAddSectionClick,
  onGeneralSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="builder-sidebar w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{selectedPage}</h2>
        <p className="text-sm text-gray-500 mt-1">גרור וזרוק לסידור מחדש</p>
      </div>
      
      {/* Sections List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Global Header Section */}
        <div className="border-b border-gray-100">
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">הדר</div>
            <div
              onClick={() => {
                // Toggle header editing - if already editing header, stop editing, otherwise start
                onGlobalEdit(editingGlobal === 'header' ? null : 'header');
              }}
              className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                editingGlobal === 'header' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center flex-1 space-x-3 space-x-reverse">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${
                  editingGlobal === 'header' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Layout className={`w-3 h-3 ${
                    editingGlobal === 'header' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <span className="text-sm font-medium text-gray-900">הדר</span>
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Page Sections */}
        <div className="px-4 py-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">תבנית</div>
          <div className="space-y-1">
            {pageStructure.sections.map((section, index) => {
              const sectionSchema = getSectionById(section.type);
              const isSelected = selectedElement?.type === 'section' && selectedElement?.id === section.id;
              
              return (
                <SectionItem
                  key={section.id}
                  section={section}
                  sectionSchema={sectionSchema}
                  index={index}
                  isSelected={isSelected}
                  isDragOver={dragOverIndex === index}
                  onSelect={onSectionSelect}
                  onDragStart={onSectionDragStart}
                  onDragOver={onSectionDragOver}
                  onDrop={onSectionDrop}
                  onDuplicate={onSectionDuplicate}
                  onRemove={onSectionRemove}
                />
              );
            })}
          </div>
          
          {/* Add Section Button */}
          <button
            onClick={onAddSectionClick}
            className="w-full mt-3 py-2 px-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-center transition-colors group flex items-center justify-center space-x-2 space-x-reverse"
          >
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
            <span className="text-sm text-gray-600 group-hover:text-blue-600">הוסף סקשן</span>
          </button>
        </div>

        {/* Global Footer Section */}
        <div className="border-t border-gray-100 mt-4">
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">פוטר</div>
            <div
              onClick={() => {
                // Toggle footer editing - if already editing footer, stop editing, otherwise start
                onGlobalEdit(editingGlobal === 'footer' ? null : 'footer');
              }}
              className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                editingGlobal === 'footer' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center flex-1 space-x-3 space-x-reverse">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${
                  editingGlobal === 'footer' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Layout className={`w-3 h-3 ${
                    editingGlobal === 'footer' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <span className="text-sm font-medium text-gray-900">פוטר</span>
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

      </div>
      
      {/* General Settings - Fixed at bottom like Shopify */}
      <div className="mt-auto border-t border-gray-100 bg-gray-50">
        <div className="px-4 py-3">
          {/* General Settings */}
          <div
            onClick={() => onGeneralSettings && onGeneralSettings()}
            className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
              editingGlobal === 'general' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center flex-1 space-x-3 space-x-reverse">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                editingGlobal === 'general' ? 'bg-blue-100' : 'bg-gray-200'
              }`}>
                <Settings className={`w-3 h-3 ${
                  editingGlobal === 'general' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <span className="text-sm font-medium text-gray-900">הגדרות כלליות</span>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Item Component
const SectionItem = ({
  section,
  sectionSchema,
  index,
  isSelected,
  isDragOver,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDuplicate,
  onRemove
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, section.id, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={() => onSelect({ type: 'section', id: section.id })}
      className={`group flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-50 border border-blue-200' 
          : 'hover:bg-gray-50'
      } ${isDragOver ? 'border-t-2 border-t-blue-500' : ''}`}
    >
      <div className="flex items-center flex-1 space-x-3 space-x-reverse">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {sectionSchema?.icon ? (
            <sectionSchema.icon className={`w-3 h-3 ${
              isSelected ? 'text-blue-600' : 'text-gray-600'
            }`} />
          ) : (
            <Layout className={`w-3 h-3 ${
              isSelected ? 'text-blue-600' : 'text-gray-600'
            }`} />
          )}
        </div>
        <span className="text-sm font-medium text-gray-900 truncate">
          {sectionSchema?.name || section.type}
        </span>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect({ type: 'section', id: section.id });
          }}
          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
          title="הגדרות"
        >
          <Settings className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(section.id);
          }}
          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
          title="שכפל"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('האם אתה בטוח שברצונך למחוק את הסקשן הזה?')) {
              onRemove(section.id);
            }
          }}
          className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded"
          title="מחק"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
          <GripVertical className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default BuilderSidebar;

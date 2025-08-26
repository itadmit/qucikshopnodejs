import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Type,
  Image as ImageIcon,
  Palette,
  Link,
  ToggleLeft,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff
} from 'lucide-react';

const PropertiesPanel = ({ 
  selectedElement, 
  pageStructure, 
  onUpdateSection, 
  availableSections 
}) => {
  const { t } = useTranslation();
  const [expandedBlocks, setExpandedBlocks] = useState({});

  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">מאפיינים</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">בחר אלמנט לעריכה</h3>
            <p className="text-gray-500">לחץ על סקשן או בלוק כדי לערוך את המאפיינים שלו</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle different element types
  let section, sectionSchema, block, blockSchema;
  
  if (selectedElement.type === 'section') {
    section = pageStructure.sections.find(s => s.id === selectedElement.id);
    sectionSchema = availableSections.find(s => s.id === section?.type);
  } else if (selectedElement.type === 'block') {
    section = pageStructure.sections.find(s => s.id === selectedElement.sectionId);
    sectionSchema = availableSections.find(s => s.id === section?.type);
    block = section?.blocks?.[selectedElement.blockIndex];
    blockSchema = sectionSchema?.schema?.blocks?.find(b => b.type === block?.type);
  }

  if (!section || !sectionSchema) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">אלמנט לא נמצא</h3>
          <p className="text-gray-500">האלמנט שנבחר לא קיים יותר</p>
        </div>
      </div>
    );
  }

  // Update section or block setting
  const updateSetting = (settingId, value) => {
    if (selectedElement.type === 'section') {
      onUpdateSection(section.id, {
        settings: {
          ...section.settings,
          [settingId]: value
        }
      });
    } else if (selectedElement.type === 'block') {
      const updatedBlocks = [...section.blocks];
      updatedBlocks[selectedElement.blockIndex] = {
        ...block,
        settings: {
          ...block.settings,
          [settingId]: value
        }
      };
      onUpdateSection(section.id, {
        blocks: updatedBlocks
      });
    }
  };

  // Add block to section
  const addBlock = (blockType) => {
    const blockSchema = sectionSchema.schema.blocks?.find(b => b.type === blockType);
    if (blockSchema) {
      const newBlock = {
        id: `${blockType}_${Date.now()}`,
        type: blockType,
        settings: {}
      };

      // Apply default values
      blockSchema.settings?.forEach(setting => {
        if (setting.default !== undefined) {
          newBlock.settings[setting.id] = setting.default;
        }
      });

      onUpdateSection(section.id, {
        blocks: [...(section.blocks || []), newBlock]
      });
    }
  };

  // Update block setting
  const updateBlockSetting = (blockId, settingId, value) => {
    const updatedBlocks = (section.blocks || []).map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            settings: { ...block.settings, [settingId]: value }
          }
        : block
    );

    onUpdateSection(section.id, { blocks: updatedBlocks });
  };

  // Remove block
  const removeBlock = (blockId) => {
    const updatedBlocks = (section.blocks || []).filter(block => block.id !== blockId);
    onUpdateSection(section.id, { blocks: updatedBlocks });
  };

  // Toggle block expansion
  const toggleBlockExpansion = (blockId) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  // Render setting input based on type
  const renderSettingInput = (setting, value, onChange) => {
    const inputId = `setting-${setting.id}`;

    switch (setting.type) {
      case 'header':
        return (
          <div className="pt-4 pb-2 border-t border-gray-200 first:border-t-0 first:pt-0">
            <h4 className="text-sm font-semibold text-gray-900">{setting.content}</h4>
          </div>
        );
        
      case 'text':
        return (
          <input
            id={inputId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={setting.placeholder || setting.label}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={inputId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={setting.placeholder || setting.label}
          />
        );

      case 'richtext':
        return (
          <textarea
            id={inputId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={setting.placeholder || setting.label}
          />
        );

      case 'select':
        return (
          <div className="relative">
            <select
              id={inputId}
              value={value || setting.default || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              style={{ backgroundImage: 'none' }}
            >
              {setting.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              id={inputId}
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="ml-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{setting.label}</span>
          </label>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <input
              id={inputId}
              type="color"
              value={value || setting.default || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || setting.default || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              id={inputId}
              type="range"
              min={setting.min || 0}
              max={setting.max || 100}
              step={setting.step || 1}
              value={value || setting.default || setting.min || 0}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{setting.min || 0}{setting.unit || ''}</span>
              <span className="font-medium">
                {value || setting.default || setting.min || 0}{setting.unit || ''}
              </span>
              <span>{setting.max || 100}{setting.unit || ''}</span>
            </div>
          </div>
        );

      case 'image_picker':
        return (
          <div className="space-y-2">
            <input
              id={inputId}
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="הכנס URL של תמונה"
            />
            {value && (
              <div className="relative">
                <img 
                  src={value} 
                  alt="תצוגה מקדימה"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'url':
        return (
          <input
            id={inputId}
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        );

      default:
        return (
          <input
            id={inputId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={setting.label}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedElement.type === 'block' ? blockSchema?.name || block?.type : sectionSchema.name}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedElement.type === 'block' ? 'עריכת בלוק' : 'עריכת סקשן'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Block Settings */}
        {selectedElement.type === 'block' && blockSchema?.settings && blockSchema.settings.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">הגדרות בלוק</h3>
            <div className="space-y-4">
              {blockSchema.settings.map((setting, index) => (
                <div key={setting.id || `header-${index}`}>
                  {setting.type === 'header' ? (
                    renderSettingInput(setting, null, null)
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {setting.label}
                        {setting.info && (
                          <span className="block text-xs text-gray-500 mt-1">
                            {setting.info}
                          </span>
                        )}
                      </label>
                      {renderSettingInput(
                        setting,
                        block.settings?.[setting.id],
                        (value) => updateSetting(setting.id, value)
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Section Settings */}
        {selectedElement.type === 'section' && sectionSchema.schema.settings && sectionSchema.schema.settings.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">הגדרות סקשן</h3>
            <div className="space-y-4">
              {sectionSchema.schema.settings.map((setting, index) => (
                <div key={setting.id || `header-${index}`}>
                  {setting.type === 'header' ? (
                    renderSettingInput(setting, null, null)
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {setting.label}
                        {setting.info && (
                          <span className="block text-xs text-gray-500 mt-1">
                            {setting.info}
                          </span>
                        )}
                      </label>
                      {renderSettingInput(
                        setting,
                        section.settings[setting.id],
                        (value) => updateSetting(setting.id, value)
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blocks */}
        {sectionSchema.schema.blocks && sectionSchema.schema.blocks.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">בלוקים</h3>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addBlock(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">הוסף בלוק</option>
                  {sectionSchema.schema.blocks.map(blockType => (
                    <option key={blockType.type} value={blockType.type}>
                      {blockType.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Existing Blocks */}
            <div className="space-y-3">
              {(section.blocks || []).map((block, index) => {
                const blockSchema = sectionSchema.schema.blocks.find(b => b.type === block.type);
                const isExpanded = expandedBlocks[block.id];

                return (
                  <div key={block.id} className="border border-gray-200 rounded-lg">
                    {/* Block Header */}
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <button
                        onClick={() => toggleBlockExpansion(block.id)}
                        className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span>{blockSchema?.name || block.type} #{index + 1}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('האם אתה בטוח שברצונך למחוק את הבלוק הזה?')) {
                            removeBlock(block.id);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Block Settings */}
                    {isExpanded && blockSchema?.settings && (
                      <div className="p-3 space-y-3">
                        {blockSchema.settings.map((setting, settingIndex) => (
                          <div key={setting.id || `block-setting-${settingIndex}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {setting.label}
                            </label>
                            {renderSettingInput(
                              setting,
                              block.settings[setting.id],
                              (value) => updateBlockSetting(block.id, setting.id, value)
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {(!section.blocks || section.blocks.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm">אין בלוקים בסקשן זה</p>
                <p className="text-xs">השתמש בתפריט למעלה כדי להוסיף בלוק</p>
              </div>
            )}
          </div>
        )}

        {/* Section Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <button
              onClick={() => {
                const isHidden = section.settings?.hidden;
                updateSetting('hidden', !isHidden);
              }}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                section.settings?.hidden
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.settings?.hidden ? (
                <>
                  <EyeOff className="w-4 h-4 ml-2" />
                  הצג סקשן
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 ml-2" />
                  הסתר סקשן
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel; 
/**
 * 🎨 QuickShop Site Builder - Header Component
 * כותרת הבילדר עם כפתורי פעולה
 */

import React from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Undo, 
  Redo, 
  Save 
} from 'lucide-react';

const BuilderHeader = ({
  selectedPage,
  editingGlobal,
  isPreviewMode,
  previewMode,
  canUndo,
  canRedo,
  onClose,
  onPageChange,
  onPreviewToggle,
  onPreviewModeChange,
  onUndo,
  onRedo,
  onSave
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                  onPageChange({ editingGlobal: value, selectedPage: 'home' });
                } else {
                  onPageChange({ editingGlobal: null, selectedPage: value });
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
              onClick={() => onPreviewModeChange('desktop')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPreviewModeChange('tablet')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPreviewModeChange('mobile')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={onPreviewToggle}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">{isPreviewMode ? 'עריכה' : 'תצוגה מקדימה'}</span>
            </button>
            <button
              onClick={onSave}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">שמור</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderHeader;

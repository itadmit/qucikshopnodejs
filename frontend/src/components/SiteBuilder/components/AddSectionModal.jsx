/**
 * 🎨 QuickShop Site Builder - Add Section Modal Component
 * מודל להוספת סקשנים חדשים
 */

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { ALL_SECTIONS } from '../sections';

const AddSectionModal = ({ isOpen, onClose, onAddSection }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredSections = ALL_SECTIONS.filter(section => 
    !searchTerm || 
    section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSection = (sectionId) => {
    onAddSection(sectionId);
    onClose();
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">הוסף סקשן</h2>
            <p className="text-sm text-gray-500 mt-1">בחר סקשן מהספרייה להוספה לדף</p>
          </div>
          <button
            onClick={onClose}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sections Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map((sectionSchema) => {
              const IconComponent = sectionSchema.icon;
              return (
                <button
                  key={sectionSchema.id}
                  onClick={() => handleAddSection(sectionSchema.id)}
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
  );
};

export default AddSectionModal;

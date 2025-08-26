import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Star } from 'lucide-react';

const TemplateSelector = ({ currentTemplate, onTemplateChange }) => {
  const { t } = useTranslation();
  
  const templates = [
    {
      id: 'jupiter',
      name: 'Jupiter',
      description: 'תבנית מודרנית ומתקדמת עם בילדר מתקדם',
      preview: '/templates/jupiter-preview.jpg',
      isPremium: false,
      isActive: true
    },
    {
      id: 'mars',
      name: 'Mars',
      description: 'תבנית עסקית מינימליסטית',
      preview: '/templates/mars-preview.jpg',
      isPremium: true,
      isActive: false,
      comingSoon: true
    },
    {
      id: 'venus',
      name: 'Venus',
      description: 'תבנית אופנתית לחנויות בגדים',
      preview: '/templates/venus-preview.jpg',
      isPremium: true,
      isActive: false,
      comingSoon: true
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">בחר תבנית</h2>
        <p className="text-gray-600">כרגע יש רק תבנית אחת זמינה. תבניות נוספות יגיעו בקרוב</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
              currentTemplate === template.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            } ${!template.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (template.isActive && !template.comingSoon) {
                onTemplateChange(template.id);
              }
            }}
          >
            {/* Preview Image */}
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              {template.preview ? (
                <img 
                  src={template.preview} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-400 mb-2">
                    {template.name}
                  </div>
                  <div className="text-sm text-gray-500">תצוגה מקדימה</div>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {template.isPremium && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                  {currentTemplate === template.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {template.isPremium ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      פרימיום
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      חינם
                    </span>
                  )}
                  
                  {template.comingSoon && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      בקרוב
                    </span>
                  )}
                </div>

                {template.isActive && !template.comingSoon && (
                  <button
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      currentTemplate === template.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {currentTemplate === template.id ? 'נבחר' : 'בחר'}
                  </button>
                )}
              </div>
            </div>

            {/* Coming Soon Overlay */}
            {template.comingSoon && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-lg font-semibold mb-1">בקרוב</div>
                  <div className="text-sm opacity-90">תבנית זו תהיה זמינה בעדכון הבא</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Template Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">התבנית הנוכחית</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-blue-800">
              {templates.find(t => t.id === currentTemplate)?.name || 'Jupiter'}
            </div>
            <div className="text-sm text-blue-600">
              {templates.find(t => t.id === currentTemplate)?.description || 'תבנית ברירת המחדל'}
            </div>
          </div>
          <div className="text-sm text-blue-600">
            גרסה 1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 
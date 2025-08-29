import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { RichTextEditor } from '../../../ui/index.js';

const CustomFieldsTab = ({ 
  customFields, 
  customFieldValues, 
  setCustomFieldValues 
}) => {
  return (
    <div className="space-y-6">
      {customFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>אין שדות מותאמים אישית מוגדרים</p>
          <p className="text-sm mt-2">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/dashboard/settings/custom-fields');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-blue-600 hover:text-blue-700 inline-flex items-center"
            >
              לך לניהול שדות מותאמים אישית
              <ExternalLink className="w-4 h-4 mr-1" />
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {customFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.isRequired && <span className="text-red-500 mr-1">*</span>}
              </label>
              
              {field.helpText && (
                <p className="text-xs text-gray-500 mb-2">{field.helpText}</p>
              )}

              {field.type === 'TEXT' && (
                <input
                  type="text"
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder}
                  required={field.isRequired}
                />
              )}
              
              {field.type === 'TEXTAREA' && (
                <textarea
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder}
                  required={field.isRequired}
                />
              )}

              {field.type === 'RICH_TEXT' && (
                <RichTextEditor
                  value={customFieldValues[field.name] || ''}
                  onChange={(content) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: content
                  })}
                  placeholder={field.placeholder || 'הכנס תוכן עשיר...'}
                  minHeight="120px"
                  maxHeight="200px"
                />
              )}
              
              {field.type === 'NUMBER' && (
                <input
                  type="number"
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder}
                  required={field.isRequired}
                />
              )}

              {field.type === 'EMAIL' && (
                <input
                  type="email"
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder}
                  required={field.isRequired}
                />
              )}

              {field.type === 'PHONE' && (
                <input
                  type="tel"
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder}
                  required={field.isRequired}
                />
              )}

              {field.type === 'URL' && (
                <input
                  type="url"
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder}
                  required={field.isRequired}
                />
              )}

              {field.type === 'DATE' && (
                <input
                  type="date"
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={field.isRequired}
                />
              )}

              {field.type === 'CHECKBOX' && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customFieldValues[field.name] === 'true'}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.name]: e.target.checked ? 'true' : 'false'
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-700">{field.placeholder || 'סמן אם כן'}</span>
                </label>
              )}

              {field.type === 'DROPDOWN' && field.options && (
                <select
                  value={customFieldValues[field.name] || ''}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.value
                  })}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  required={field.isRequired}
                >
                  <option value="">{field.placeholder || 'בחר אפשרות'}</option>
                  {field.options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {field.type === 'RADIO' && field.options && (
                <div className="space-y-2">
                  {field.options.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name={field.name}
                        value={option}
                        checked={customFieldValues[field.name] === option}
                        onChange={(e) => setCustomFieldValues({
                          ...customFieldValues,
                          [field.name]: e.target.value
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        required={field.isRequired}
                      />
                      <span className="mr-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomFieldsTab;

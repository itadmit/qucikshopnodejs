import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Info,
  Settings,
  Type,
  Hash,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  ChevronDown,
  FileText,
  Link,
  ToggleLeft
} from 'lucide-react';
import apiService from '../../../services/api.js';
import { RichTextEditor } from '../../ui/index.js';

const CustomFieldsPage = () => {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'TEXT',
    isRequired: false,
    placeholder: '',
    helpText: '',
    defaultValue: '',
    options: []
  });

  const fieldTypes = [
    { value: 'TEXT', label: 'טקסט', icon: Type, description: 'שדה טקסט חופשי' },
    { value: 'TEXTAREA', label: 'טקסט ארוך', icon: FileText, description: 'שדה טקסט מרובה שורות' },
    { value: 'RICH_TEXT', label: 'טקסט עשיר', icon: FileText, description: 'עורך טקסט עם עיצוב' },
    { value: 'NUMBER', label: 'מספר', icon: Hash, description: 'שדה מספרי' },
    { value: 'EMAIL', label: 'אימייל', icon: Mail, description: 'כתובת אימייל' },
    { value: 'PHONE', label: 'טלפון', icon: Phone, description: 'מספר טלפון' },
    { value: 'URL', label: 'קישור', icon: Link, description: 'כתובת אתר' },
    { value: 'DATE', label: 'תאריך', icon: Calendar, description: 'בחירת תאריך' },
    { value: 'CHECKBOX', label: 'תיבת סימון', icon: CheckSquare, description: 'כן/לא' },
    { value: 'DROPDOWN', label: 'רשימה נפתחת', icon: ChevronDown, description: 'בחירה מרשימה' },
    { value: 'RADIO', label: 'כפתורי בחירה', icon: ToggleLeft, description: 'בחירה אחת מכמה' }
  ];

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      apiService.setToken(token);
      const result = await apiService.getCustomFields();
      
      if (result.success) {
        setCustomFields(result.data || []);
      } else {
        setCustomFields(result || []);
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
      setCustomFields([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      apiService.setToken(token);
      
      // Generate name if not provided
      let fieldName = formData.name.trim();
      if (!fieldName) {
        // Auto-generate from label
        fieldName = formData.label.toLowerCase()
          .replace(/[א-ת]/g, '') // Remove Hebrew characters
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .replace(/[^a-z0-9_]/g, '') // Remove special characters
          .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
          .replace(/_+/g, '_') // Replace multiple underscores with single
          || `field_${Date.now()}`; // Fallback if nothing remains
      }

      const submitData = {
        ...formData,
        name: fieldName,
        options: ['DROPDOWN', 'RADIO'].includes(formData.type) ? formData.options : null
      };
      
      if (editingField) {
        await apiService.updateCustomField(editingField.id, submitData);
      } else {
        await apiService.createCustomField(submitData);
      }
      
      await loadCustomFields();
      handleCancel();
      
    } catch (error) {
      console.error('Error saving custom field:', error);
      alert('שגיאה בשמירת השדה');
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      isRequired: field.isRequired,
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      defaultValue: field.defaultValue || '',
      options: field.options || []
    });
    setShowForm(true);
  };

  const handleDelete = async (fieldId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את השדה? פעולה זו לא ניתנת לביטול.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      apiService.setToken(token);
      await apiService.deleteCustomField(fieldId);
      await loadCustomFields();
    } catch (error) {
      console.error('Error deleting custom field:', error);
      alert('שגיאה במחיקת השדה');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingField(null);
    setFormData({
      name: '',
      label: '',
      type: 'TEXT',
      isRequired: false,
      placeholder: '',
      helpText: '',
      defaultValue: '',
      options: []
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">שדות מותאמים אישית</h1>
          <p className="text-gray-600 mt-1">הוסף שדות נוספים למוצרים שלך</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          הוסף שדה חדש
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 ml-3" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">מה הם שדות מותאמים אישית?</p>
            <p>שדות מותאמים אישית מאפשרים לך להוסיף מידע נוסף למוצרים שלך, כמו טבלת מידות, רשימת מרכיבים, הוראות שימוש ועוד. השדות יופיעו בעמוד יצירת/עריכת המוצר.</p>
          </div>
        </div>
      </div>

      {/* Custom Fields List */}
      {customFields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין שדות מותאמים אישית</h3>
          <p className="text-gray-500 mb-4">התחל ביצירת השדה הראשון שלך</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            צור שדה ראשון
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שם השדה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סוג
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  חובה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customFields.map((field) => {
                const fieldType = fieldTypes.find(t => t.value === field.type);
                return (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{field.label}</div>
                        <div className="text-sm text-gray-500 font-mono">{field.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {fieldType?.icon && <fieldType.icon className="w-4 h-4 text-gray-400 ml-2" />}
                        <span className="text-sm text-gray-900">{fieldType?.label || field.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        field.isRequired 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {field.isRequired ? 'חובה' : 'אופציונלי'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(field)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(field.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingField ? 'עריכת שדה מותאם אישית' : 'שדה מותאם אישית חדש'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Field Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תווית השדה <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="למשל: טבלת מידות"
                  />
                </div>

                {/* Field Name (ID) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מזהה השדה (באנגלית)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="size_table (יווצר אוטומטית אם ריק)"
                    pattern="[a-z0-9_]*"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    מזהה ייחודי באנגלית בלבד (אותיות קטנות, מספרים וקו תחתון). אם ריק - יווצר אוטומטית מהתווית.
                  </p>
                </div>

                {/* Field Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סוג השדה <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options for Dropdown/Radio */}
                {['DROPDOWN', 'RADIO'].includes(formData.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אפשרויות
                    </label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`אפשרות ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        הוסף אפשרות
                      </button>
                    </div>
                  </div>
                )}

                {/* Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    טקסט עזר
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="טקסט שיופיע בשדה הריק"
                  />
                </div>

                {/* Help Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הסבר נוסף
                  </label>
                  <textarea
                    value={formData.helpText}
                    onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="הסבר נוסף שיעזור למשתמש למלא את השדה"
                  />
                </div>

                {/* Default Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ערך ברירת מחדל
                  </label>
                  <input
                    type="text"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ערך שיופיע כברירת מחדל"
                  />
                </div>

                {/* Required Field */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRequired" className="mr-2 text-sm text-gray-700">
                    שדה חובה
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingField ? 'עדכן' : 'שמור'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsPage;

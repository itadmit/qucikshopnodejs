import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../../config/environment.js';
import {
  Store,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Palette,
  Globe,
  Package
} from 'lucide-react';
import api from '../../../services/api';

const CreateStore = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeSlug: '',
    templateName: 'jupiter'
  });

  const templates = [
    {
      id: 'jupiter',
      name: 'Jupiter',
      description: 'תבנית מודרנית ונקייה, מושלמת לכל סוג של חנות',
      features: ['עיצוב רספונסיבי', 'תמיכה ב-RTL', 'אנימציות חלקות'],
      icon: '🪐',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from store name
    if (name === 'storeName') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        storeSlug: slug
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/partners/stores/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'אירעה שגיאה ביצירת החנות');
      }
      
      setSuccess(true);
      
      // Redirect to stores list after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/partners/dashboard/stores');
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'אירעה שגיאה ביצירת החנות');
    } finally {
      setLoading(false);
    }
  };

  const isValidSlug = (slug) => {
    return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">החנות נוצרה בהצלחה!</h2>
          <p className="text-gray-600 mb-4">החנות שלך מוכנה לעריכה ופיתוח</p>
          <p className="text-sm text-gray-500">מעביר אותך לרשימת החנויות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/partners/dashboard/stores')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowRight className="w-4 h-4 ml-2 rotate-180" />
          חזרה לחנויות
        </button>
        <h1 className="text-3xl font-bold text-gray-900">יצירת חנות חדשה</h1>
        <p className="text-gray-600 mt-2">צור חנות פיתוח חדשה ללקוח שלך</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 ml-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Store className="w-5 h-5 ml-2 text-gray-600" />
            פרטי החנות
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם החנות
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                placeholder="לדוגמה: החנות של יוסי"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                השם שיופיע בחנות ובלוגו
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כתובת החנות (URL)
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="storeSlug"
                  value={formData.storeSlug}
                  onChange={handleChange}
                  required
                  placeholder="my-store"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  pattern="[a-z0-9\-]+"
                />
                <span className="bg-gray-50 border border-r-0 border-gray-300 px-4 py-2 rounded-l-lg text-gray-600">
                  .quickshop.co.il
                </span>
              </div>
              {formData.storeSlug && !isValidSlug(formData.storeSlug) && (
                <p className="text-sm text-red-600 mt-1">
                  הכתובת יכולה להכיל רק אותיות באנגלית קטנות, מספרים ומקפים
                </p>
              )}
              {formData.storeSlug && isValidSlug(formData.storeSlug) && (
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <CheckCircle className="w-4 h-4 ml-1" />
                  כתובת תקינה
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Palette className="w-5 h-5 ml-2 text-gray-600" />
            בחר תבנית
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <label
                key={template.id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition ${
                  formData.templateName === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="templateName"
                  value={template.id}
                  checked={formData.templateName === template.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-2xl flex-shrink-0 ml-4`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <ul className="mt-3 space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-500 flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {formData.templateName === template.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mr-3" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Development Store Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 ml-3" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">חנות פיתוח</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• החנות תיווצר במצב פיתוח ללא תשלום</li>
                <li>• תוכל לערוך ולהתאים את החנות ללקוח</li>
                <li>• כשהחנות מוכנה, תוכל להעביר את הבעלות ללקוח</li>
                <li>• תקבל עמלה כשהחנות תעבור לתוכנית בתשלום</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/partners/dashboard/stores')}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={loading || !formData.storeName || !formData.storeSlug || !isValidSlug(formData.storeSlug)}
            className="px-6 py-3 text-black rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg font-medium"
            style={{ background: loading || !formData.storeName || !formData.storeSlug || !isValidSlug(formData.storeSlug) ? '#f3f4f6' : 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin ml-2"></div>
                יוצר חנות...
              </>
            ) : (
              <>
                צור חנות
                <ArrowRight className="w-4 h-4 mr-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStore;

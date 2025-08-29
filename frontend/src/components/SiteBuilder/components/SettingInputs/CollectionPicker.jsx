/**
 * 🛍️ Collection Picker Component
 * בוחר קולקציות עם חיפוש ותצוגה מקדימה
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Search, Check, Grid3X3 } from 'lucide-react';
import { Select } from '../../../ui';
import { collectionsApi } from '../../../../services/builderApi';

const CollectionPicker = ({ 
  value, 
  onChange, 
  placeholder = 'בחר קולקציה...', 
  multiple = false,
  showProductCount = true,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // טעינת קולקציות מהשרת
  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const storeSlug = localStorage.getItem('currentStore');
        if (!storeSlug) {
          throw new Error('Store not found');
        }
        
        const response = await collectionsApi.getAll(storeSlug);
        setCollections(response.collections || []);
      } catch (err) {
        console.error('Failed to load collections:', err);
        setError('שגיאה בטעינת הקולקציות');
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  // יצירת אפשרויות לרשימה הנפתחת
  const collectionOptions = collections.map(collection => ({
    value: collection.id,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-gray-500" />
          <div>
            <div className="font-medium">{collection.name}</div>
            {collection.description && (
              <div className="text-xs text-gray-500 truncate max-w-[200px]">
                {collection.description}
              </div>
            )}
          </div>
        </div>
        {showProductCount && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {collection.productCount || 0} מוצרים
          </span>
        )}
      </div>
    ),
    searchText: `${collection.name} ${collection.description || ''}`,
    collection: collection
  }));

  // הוספת אפשרות "כל המוצרים"
  const allOptions = [
    {
      value: 'all',
      label: (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-blue-600">כל המוצרים</span>
        </div>
      ),
      searchText: 'כל המוצרים all products'
    },
    ...collectionOptions
  ];

  // טיפול בשגיאה
  if (error) {
    return (
      <div className={`collection-picker ${className}`}>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <Package className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`collection-picker ${className}`}>
      <Select
        value={value}
        onChange={onChange}
        options={allOptions}
        placeholder={placeholder}
        searchable
        searchPlaceholder="חפש קולקציה..."
        loading={loading}
        multiple={multiple}
        className="w-full"
        renderOption={(option) => option.label}
      />
      
      {/* תצוגת הקולקציה הנבחרת */}
      {value && value !== 'all' && !multiple && (
        <CollectionPreview collectionId={value} collections={collections} />
      )}
      
      {/* תצוגת קולקציות מרובות */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map(collectionId => (
            <CollectionPreview 
              key={collectionId} 
              collectionId={collectionId} 
              collections={collections}
              compact 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// קומפוננטת תצוגה מקדימה של קולקציה
const CollectionPreview = ({ collectionId, collections, compact = false }) => {
  const collection = collections.find(c => c.id === collectionId);
  
  if (!collection) return null;

  return (
    <div className={`mt-3 p-3 bg-gray-50 rounded-lg border ${compact ? 'py-2' : ''}`}>
      <div className="flex items-center gap-3">
        {collection.image && (
          <img 
            src={collection.image} 
            alt={collection.name}
            className={`rounded object-cover ${compact ? 'w-8 h-8' : 'w-12 h-12'}`}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>
            {collection.name}
          </div>
          {!compact && collection.description && (
            <div className="text-sm text-gray-500 truncate">
              {collection.description}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {collection.productCount || 0} מוצרים
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionPicker;

import { 
  ArrowRight, 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Video,
  Palette,
  Ruler,
  Tag,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import MediaUploader from '../components/MediaUploader.jsx';

const ProductFormPage = ({ productId = null }) => {
  const [productType, setProductType] = useState('SIMPLE'); // 'SIMPLE' or 'VARIABLE'
  const [isDraft, setIsDraft] = useState(true);
  const fileInputRef = useRef(null);
  
  // Product basic info
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    trackInventory: true,
    inventoryQuantity: 0,
    allowBackorder: false,
    weight: '',
    requiresShipping: true,
    isDigital: false,
    tags: [],
    category: '',
    seoTitle: '',
    seoDescription: '',
    publishedAt: ''
  });

  // Custom fields
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});

  // Load custom fields
  React.useEffect(() => {
    const loadCustomFields = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/custom-fields', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const fields = await response.json();
          setCustomFields(fields);
          
          // Initialize custom field values
          const initialValues = {};
          fields.forEach(field => {
            initialValues[field.name] = field.defaultValue || '';
          });
          setCustomFieldValues(initialValues);
        }
      } catch (error) {
        console.error('Error loading custom fields:', error);
      }
    };

    loadCustomFields();
  }, []);

  // Media management
  const [media, setMedia] = useState([]);
  const [primaryVideo, setPrimaryVideo] = useState(null);

  // Product options (for variants)
  const [productOptions, setProductOptions] = useState([]);
  const [variants, setVariants] = useState([]);

  // Available option types
  const optionTypes = [
    { value: 'COLOR', label: 'צבע', icon: Palette, description: 'בחירת צבע עם פלטה' },
    { value: 'TEXT', label: 'טקסט', icon: Tag, description: 'טקסט חופשי (מידה, חומר וכו)' },
    { value: 'IMAGE', label: 'תמונה', icon: ImageIcon, description: 'בחירה על בסיס תמונה' },
    { value: 'BUTTON', label: 'כפתור', icon: Package, description: 'כפתורי בחירה' }
  ];



  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      name: '',
      type: 'TEXT',
      displayType: 'DROPDOWN',
      values: [{ id: Date.now(), value: '', colorCode: '', imageUrl: '', sortOrder: 0 }] // Start with one empty value
    };
    setProductOptions([...productOptions, newOption]);
  };

  const handleAddOptionValue = (optionId) => {
    const newValue = {
      id: Date.now() + Math.random(),
      value: '',
      colorCode: '',
      imageUrl: '',
      sortOrder: 0
    };
    
    setProductOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { ...option, values: [...option.values, newValue] }
        : option
    ));
  };

  const handleOptionValueChange = (optionId, valueId, newValue) => {
    setProductOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { 
            ...option, 
            values: option.values.map(val => 
              val.id === valueId ? { ...val, value: newValue } : val
            )
          }
        : option
    ));

    // Auto-add new empty input when user types in the last input
    const option = productOptions.find(opt => opt.id === optionId);
    if (option) {
      const valueIndex = option.values.findIndex(val => val.id === valueId);
      const isLastValue = valueIndex === option.values.length - 1;
      const isNotEmpty = newValue.trim() !== '';
      
      if (isLastValue && isNotEmpty) {
        handleAddOptionValue(optionId);
      }
    }
  };

  const handleRemoveOptionValue = (optionId, valueId) => {
    setProductOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { 
            ...option, 
            values: option.values.filter(val => val.id !== valueId)
          }
        : option
    ));
  };

  const generateVariants = () => {
    if (productOptions.length === 0) return;
    
    // Filter out empty values
    const validOptions = productOptions.map(option => ({
      ...option,
      values: option.values.filter(val => val.value.trim() !== '')
    })).filter(option => option.values.length > 0);

    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }
    
    // Generate all possible combinations
    const combinations = validOptions.reduce((acc, option) => {
      if (acc.length === 0) {
        return option.values.map(value => [{ optionId: option.id, valueId: value.id, value: value.value }]);
      }
      
      const newCombinations = [];
      acc.forEach(combination => {
        option.values.forEach(value => {
          newCombinations.push([...combination, { optionId: option.id, valueId: value.id, value: value.value }]);
        });
      });
      return newCombinations;
    }, []);

    const newVariants = combinations.map((combination, index) => ({
      id: Date.now() + index,
      sku: `${productData.sku || 'PRODUCT'}-${index + 1}`,
      price: productData.price || '',
      comparePrice: productData.comparePrice || '',
      costPrice: productData.costPrice || '',
      inventoryQuantity: 0,
      weight: productData.weight || '',
      optionValues: combination,
      isActive: true
    }));

    setVariants(newVariants);
  };

  // Auto-generate variants when options change
  React.useEffect(() => {
    if (productType === 'VARIABLE' && productOptions.length > 0) {
      generateVariants();
    }
  }, [productOptions, productType, productData.sku, productData.price]);

  const handleSaveProduct = async () => {
    try {
      const saveData = {
        storeId: 1, // TODO: Get from context
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription,
        sku: productData.sku,
        price: productData.price,
        comparePrice: productData.comparePrice,
        costPrice: productData.costPrice,
        categoryId: productData.category,
        trackInventory: productData.trackInventory,
        inventoryQuantity: productData.inventoryQuantity,
        allowBackorder: productData.allowBackorder,
        weight: productData.weight,
        requiresShipping: productData.requiresShipping,
        isDigital: productData.isDigital,
        seoTitle: productData.seoTitle,
        seoDescription: productData.seoDescription,
        tags: JSON.stringify(productData.tags),
        customFields: customFieldValues,
        media: media.map(item => ({
          url: item.url,
          type: item.type,
          altText: item.altText,
          isPrimary: item.isPrimary,
          sortOrder: 0
        })),
        variants: variants,
        productOptions: productOptions
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      const result = await response.json();
      alert('המוצר נשמר בהצלחה!');
      
      // Redirect to products list or edit page
      // window.location.href = `/dashboard/products/${result.data.id}`;
    } catch (error) {
      console.error('Save product error:', error);
      alert('שגיאה בשמירת המוצר');
    }
  };

  const handleMediaUpload = async (files) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', 'products');

      const response = await fetch('/api/media/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      const newMediaItems = result.data.map(uploadResult => ({
        id: Date.now() + Math.random(),
        url: uploadResult.url,
        key: uploadResult.key,
        type: uploadResult.mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        isPrimary: media.length === 0,
        altText: '',
        colorOptionValueId: null,
        originalName: uploadResult.originalName,
        size: uploadResult.size
      }));

      setMedia(prev => [...prev, ...newMediaItems]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('שגיאה בהעלאת הקבצים');
    }
  };

  const ColorPicker = ({ value, onChange }) => {
    const colors = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
      '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
      '#808080', '#000080', '#008000', '#800000'
    ];

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {colors.map(color => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-full border-2 ${value === color ? 'border-gray-800' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
        />
      </div>
    );
  };

  const OptionValueEditor = ({ option, value, onChange, onDelete }) => {
    return (
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="שם הערך"
            value={value.value}
            onChange={(e) => onChange({ ...value, value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {option.type === 'COLOR' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">צבע</label>
            <ColorPicker 
              value={value.colorCode} 
              onChange={(color) => onChange({ ...value, colorCode: color })}
            />
          </div>
        )}

        {option.type === 'IMAGE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תמונה</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {value.imageUrl ? (
                <img src={value.imageUrl} alt={value.value} className="w-16 h-16 mx-auto rounded-lg object-cover" />
              ) : (
                <div>
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">העלה תמונה</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Product Type Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">סוג מוצר</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            productType === 'SIMPLE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="productType"
              value="SIMPLE"
              checked={productType === 'SIMPLE'}
              onChange={(e) => setProductType(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center">
              <Package className="w-5 h-5 text-blue-600 ml-3" />
              <div>
                <div className="font-medium text-gray-900">מוצר פשוט</div>
                <div className="text-sm text-gray-500">מוצר יחיד ללא וריאציות</div>
              </div>
            </div>
          </label>
          
          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            productType === 'VARIABLE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="productType"
              value="VARIABLE"
              checked={productType === 'VARIABLE'}
              onChange={(e) => setProductType(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-blue-600 ml-3" />
              <div>
                <div className="font-medium text-gray-900">מוצר עם וריאציות</div>
                <div className="text-sm text-gray-500">מוצר עם אפשרויות שונות (צבע, מידה וכו')</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שם המוצר *</label>
            <input
              type="text"
              value={productData.name}
              onChange={(e) => setProductData({ ...productData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="הכנס שם מוצר"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
            <input
              type="text"
              value={productData.sku}
              onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="קוד מוצר יחודי"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
            <select
              value={productData.category}
              onChange={(e) => setProductData({ ...productData, category: e.target.value })}
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'left 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">בחר קטגוריה</option>
              <option value="בגדים">בגדים</option>
              <option value="נעליים">נעליים</option>
              <option value="אביזרים">אביזרים</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תיאור קצר</label>
            <textarea
              value={productData.shortDescription}
              onChange={(e) => setProductData({ ...productData, shortDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="תיאור קצר למוצר"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תיאור מלא</label>
            <textarea
              value={productData.description}
              onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="תיאור מפורט למוצר"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      {productType === 'SIMPLE' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 ml-2" />
            תמחור
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מחיר *</label>
              <input
                type="number"
                step="0.01"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מחיר לפני הנחה</label>
              <input
                type="number"
                step="0.01"
                value={productData.comparePrice}
                onChange={(e) => setProductData({ ...productData, comparePrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מחיר עלות</label>
              <input
                type="number"
                step="0.01"
                value={productData.costPrice}
                onChange={(e) => setProductData({ ...productData, costPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-6">
      <MediaUploader
        media={media}
        onUpload={(newMediaItems) => {
          setMedia(prev => [...prev, ...newMediaItems]);
        }}
        onDelete={(mediaId) => {
          setMedia(prev => prev.filter(m => m.id !== mediaId));
        }}
        maxFiles={10}
      />

      {/* Video as Primary */}
      {media.some(m => m.type === 'VIDEO') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 ml-2" />
            <h4 className="font-medium text-yellow-800">וידאו כתמונה ראשית</h4>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            ניתן להגדיר וידאו כתמונה ראשית של המוצר. הוידאו יוצג במקום התמונה הראשית.
          </p>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={primaryVideo !== null}
              onChange={(e) => {
                if (e.target.checked) {
                  const videoItem = media.find(m => m.type === 'VIDEO');
                  setPrimaryVideo(videoItem?.id || null);
                } else {
                  setPrimaryVideo(null);
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
            />
            <span className="text-sm text-yellow-800">השתמש בוידאו כתמונה ראשית</span>
          </label>
        </div>
      )}
    </div>
  );

  const renderVariantsTab = () => (
    <div className="space-y-6">
      {productType === 'SIMPLE' ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">מוצר פשוט</h3>
          <p className="text-gray-500 mb-4">מוצר פשוט אינו תומך בוריאציות</p>
          <button
            type="button"
            onClick={() => setProductType('VARIABLE')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            המר למוצר עם וריאציות
          </button>
        </div>
      ) : (
        <>
          {/* Product Options */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">אפשרויות מוצר</h3>
              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הוסף אפשרות
              </button>
            </div>

            {productOptions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">הוסף אפשרויות כמו צבע, מידה או חומר</p>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  הוסף אפשרות ראשונה
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {productOptions.map((option, optionIndex) => (
                  <div key={option.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">אפשרות {optionIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => setProductOptions(prev => prev.filter(o => o.id !== option.id))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">שם האפשרות</label>
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => {
                            setProductOptions(prev => prev.map(o => 
                              o.id === option.id ? { ...o, name: e.target.value } : o
                            ));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="למשל: צבע, מידה, חומר"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">סוג האפשרות</label>
                        <select
                          value={option.type}
                          onChange={(e) => {
                            setProductOptions(prev => prev.map(o => 
                              o.id === option.id ? { ...o, type: e.target.value } : o
                            ));
                          }}
                          className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'left 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          {optionTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Option Values */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">ערכים</label>
                        <button
                          type="button"
                          onClick={() => handleAddOptionValue(option.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
                        >
                          <Plus className="w-3 h-3" />
                          הוסף ערך
                        </button>
                      </div>

                      <div className="space-y-3">
                        {option.values.map((value, valueIndex) => (
                          <div key={value.id} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={value.value}
                              onChange={(e) => handleOptionValueChange(option.id, value.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`ערך ${valueIndex + 1}`}
                            />
                            {option.type === 'COLOR' && (
                              <input
                                type="color"
                                value={value.colorCode || '#000000'}
                                onChange={(e) => {
                                  setProductOptions(prev => prev.map(o => 
                                    o.id === option.id 
                                      ? { ...o, values: o.values.map(v => v.id === value.id ? { ...v, colorCode: e.target.value } : v) }
                                      : o
                                  ));
                                }}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                            )}
                            {option.values.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOptionValue(option.id, value.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Auto-generated variants info */}
                {variants.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 ml-2" />
                      <span className="text-green-800 font-medium">
                        נוצרו {variants.length} וריאציות אוטומטית
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generated Variants */}
          {variants.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">וריאציות שנוצרו</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        וריאציה
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        מחיר
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        מלאי
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעיל
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {variants.map((variant) => (
                      <tr key={variant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {variant.optionValues.map(ov => ov.value).join(' / ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => {
                              setVariants(prev => prev.map(v => 
                                v.id === variant.id ? { ...v, sku: e.target.value } : v
                              ));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => {
                              setVariants(prev => prev.map(v => 
                                v.id === variant.id ? { ...v, price: e.target.value } : v
                              ));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={variant.inventoryQuantity}
                            onChange={(e) => {
                              setVariants(prev => prev.map(v => 
                                v.id === variant.id ? { ...v, inventoryQuantity: parseInt(e.target.value) || 0 } : v
                              ));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={(e) => {
                              setVariants(prev => prev.map(v => 
                                v.id === variant.id ? { ...v, isActive: e.target.checked } : v
                              ));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">מעקב מלאי</h4>
          <p className="text-sm text-gray-500">עקוב אחר כמות המוצרים במלאי</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={productData.trackInventory}
            onChange={(e) => setProductData({ ...productData, trackInventory: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {productData.trackInventory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">כמות במלאי</label>
          <input
            type="number"
            value={productData.inventoryQuantity}
            onChange={(e) => setProductData({ ...productData, inventoryQuantity: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">משקל (ק"ג)</label>
        <input
          type="number"
          step="0.01"
          value={productData.weight}
          onChange={(e) => setProductData({ ...productData, weight: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">אפשר הזמנות ללא מלאי</h4>
          <p className="text-sm text-gray-500">אפשר ללקוחות להזמין גם כשאין במלאי</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={productData.allowBackorder}
            onChange={(e) => setProductData({ ...productData, allowBackorder: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">דורש משלוח</h4>
          <p className="text-sm text-gray-500">המוצר דורש משלוח פיזי</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={productData.requiresShipping}
            onChange={(e) => setProductData({ ...productData, requiresShipping: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">מוצר דיגיטלי</h4>
          <p className="text-sm text-gray-500">המוצר הוא קובץ דיגיטלי</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={productData.isDigital}
            onChange={(e) => setProductData({ ...productData, isDigital: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderSeoTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">כותרת SEO</label>
        <input
          type="text"
          value={productData.seoTitle}
          onChange={(e) => setProductData({ ...productData, seoTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="כותרת למנועי חיפוש"
        />
        <p className="text-xs text-gray-500 mt-1">מומלץ עד 60 תווים</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">תיאור SEO</label>
        <textarea
          value={productData.seoDescription}
          onChange={(e) => setProductData({ ...productData, seoDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="תיאור למנועי חיפוש"
        />
        <p className="text-xs text-gray-500 mt-1">מומלץ עד 160 תווים</p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 text-sm">תצוגה מקדימה בגוגל</h4>
        <div className="space-y-1">
          <div className="text-blue-600 text-sm hover:underline cursor-pointer">
            {productData.seoTitle || productData.name || 'כותרת המוצר'}
          </div>
          <div className="text-green-700 text-xs">
            yourstore.com/products/{productData.name?.toLowerCase().replace(/\s+/g, '-') || 'product-name'}
          </div>
          <div className="text-gray-600 text-xs">
            {productData.seoDescription || productData.shortDescription || 'תיאור המוצר יופיע כאן...'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomFieldsTab = () => (
    <div className="space-y-6">
      {customFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>אין שדות מותאמים אישית מוגדרים</p>
          <p className="text-sm mt-2">ניתן להוסיף שדות מותאמים אישית בהגדרות החנות</p>
        </div>
      ) : (
        customFields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.isRequired && <span className="text-red-500 mr-1">*</span>}
            </label>
            
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
            
            {field.type === 'CHECKBOX' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={customFieldValues[field.name] === 'true'}
                  onChange={(e) => setCustomFieldValues({
                    ...customFieldValues,
                    [field.name]: e.target.checked ? 'true' : 'false'
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="mr-2 text-sm text-gray-700">{field.placeholder}</span>
              </div>
            )}
            
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/dashboard/products');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="p-2 hover:bg-gray-100 rounded-lg ml-3"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {productId ? 'עריכת מוצר' : 'מוצר חדש'}
            </h1>
            <p className="text-gray-600">
              {productId ? 'ערוך את פרטי המוצר' : 'צור מוצר חדש לחנות שלך'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" />
            תצוגה מקדימה
          </button>
          <button 
            onClick={() => setIsDraft(!isDraft)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isDraft 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isDraft ? 'שמור כטיוטה' : 'פרסם'}
          </button>
          <button 
            onClick={handleSaveProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            שמור מוצר
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-full">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 ml-2" />
              מידע בסיסי
            </h2>
            {renderBasicTab()}
          </div>

          {/* Media */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 ml-2" />
              תמונות ווידאו
            </h2>
            {renderMediaTab()}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 ml-2" />
              וריאציות
            </h2>
            {renderVariantsTab()}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 pb-8">
          {/* Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">סטטוס</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סטטוס מוצר</label>
                <select 
                  value={isDraft ? 'draft' : 'active'}
                  onChange={(e) => setIsDraft(e.target.value === 'draft')}
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'left 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="draft">טיוטה</option>
                  <option value="active">פעיל</option>
                  <option value="inactive">לא פעיל</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תאריך פרסום</label>
                <input
                  type="datetime-local"
                  value={productData.publishedAt || ''}
                  onChange={(e) => setProductData({ ...productData, publishedAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ארגון</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
                <select 
                  value={productData.category}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">בחר קטגוריה</option>
                  <option value="בגדים">בגדים</option>
                  <option value="נעליים">נעליים</option>
                  <option value="אביזרים">אביזרים</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תגיות</label>
                <input
                  type="text"
                  value={productData.tags ? productData.tags.join(', ') : ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setProductData({ ...productData, tags });
                  }}
                  placeholder="הוסף תגיות מופרדות בפסיקים"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">מלאי</h3>
            {renderInventoryTab()}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-4 h-4 ml-2" />
              SEO
            </h3>
            {renderSeoTab()}
          </div>

          {/* Custom Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-4 h-4 ml-2" />
              שדות מותאמים אישית
            </h3>
            {renderCustomFieldsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;

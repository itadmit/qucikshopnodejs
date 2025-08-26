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
import { useState, useRef } from 'react';

const ProductFormPage = ({ productId = null }) => {
  const [activeTab, setActiveTab] = useState('basic');
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
    seoDescription: ''
  });

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

  const tabs = [
    { id: 'basic', label: 'מידע בסיסי', icon: Info },
    { id: 'media', label: 'מדיה', icon: ImageIcon },
    { id: 'variants', label: 'וריאציות', icon: Settings },
    { id: 'inventory', label: 'מלאי', icon: BarChart3 },
    { id: 'seo', label: 'SEO', icon: Eye }
  ];

  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      name: '',
      type: 'TEXT',
      displayType: 'DROPDOWN',
      values: []
    };
    setProductOptions([...productOptions, newOption]);
  };

  const handleAddOptionValue = (optionId) => {
    const newValue = {
      id: Date.now(),
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

  const generateVariants = () => {
    if (productOptions.length === 0) return;
    
    // Generate all possible combinations
    const combinations = productOptions.reduce((acc, option) => {
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
      sku: `${productData.sku}-${index + 1}`,
      price: productData.price,
      comparePrice: productData.comparePrice,
      costPrice: productData.costPrice,
      inventoryQuantity: 0,
      weight: productData.weight,
      optionValues: combination,
      isActive: true
    }));

    setVariants(newVariants);
  };

  const handleMediaUpload = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMedia = {
          id: Date.now() + Math.random(),
          file,
          url: e.target.result,
          type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          isPrimary: media.length === 0,
          altText: '',
          colorOptionValueId: null
        };
        setMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      {/* Media Upload */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">תמונות ווידאו</h3>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            העלה קבצים
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleMediaUpload(e.target.files)}
          className="hidden"
        />

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item, index) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {item.type === 'IMAGE' ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" />
                )}
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex gap-2">
                  {!item.isPrimary && (
                    <button
                      type="button"
                      onClick={() => {
                        setMedia(prev => prev.map((m, i) => ({ ...m, isPrimary: i === index })));
                      }}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                      title="הגדר כתמונה ראשית"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMedia(prev => prev.filter(m => m.id !== item.id))}
                    className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {item.isPrimary && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  ראשית
                </div>
              )}
              
              {item.type === 'VIDEO' && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  וידאו
                </div>
              )}
            </div>
          ))}

          {/* Upload placeholder */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">העלה</span>
          </button>
        </div>
      </div>

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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        {option.values.map((value) => (
                          <OptionValueEditor
                            key={value.id}
                            option={option}
                            value={value}
                            onChange={(updatedValue) => {
                              setProductOptions(prev => prev.map(o => 
                                o.id === option.id 
                                  ? { ...o, values: o.values.map(v => v.id === value.id ? updatedValue : v) }
                                  : o
                              ));
                            }}
                            onDelete={() => {
                              setProductOptions(prev => prev.map(o => 
                                o.id === option.id 
                                  ? { ...o, values: o.values.filter(v => v.id !== value.id) }
                                  : o
                              ));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Generate Variants Button */}
                {productOptions.every(option => option.values.length > 0) && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={generateVariants}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      צור וריאציות ({productOptions.reduce((acc, option) => acc * option.values.length, 1)} וריאציות)
                    </button>
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
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 ml-2" />
          ניהול מלאי
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={productData.trackInventory}
              onChange={(e) => setProductData({ ...productData, trackInventory: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
            />
            <span className="text-sm text-gray-700">עקוב אחר כמות במלאי</span>
          </label>

          {productData.trackInventory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">כמות במלאי</label>
                <input
                  type="number"
                  value={productData.inventoryQuantity}
                  onChange={(e) => setProductData({ ...productData, inventoryQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productData.allowBackorder}
                    onChange={(e) => setProductData({ ...productData, allowBackorder: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
                  />
                  <span className="text-sm text-gray-700">אפשר הזמנה כשאין במלאי</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4">משלוח</h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={productData.requiresShipping}
              onChange={(e) => setProductData({ ...productData, requiresShipping: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
            />
            <span className="text-sm text-gray-700">מוצר פיזי הדורש משלוח</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={productData.isDigital}
              onChange={(e) => setProductData({ ...productData, isDigital: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
            />
            <span className="text-sm text-gray-700">מוצר דיגיטלי</span>
          </label>

          {productData.requiresShipping && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">משקל (גרם)</label>
              <input
                type="number"
                value={productData.weight}
                onChange={(e) => setProductData({ ...productData, weight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSeoTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 ml-2" />
          אופטימיזציה למנועי חיפוש
        </h3>
        
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
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">תצוגה מקדימה בגוגל</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="text-blue-600 text-lg hover:underline cursor-pointer">
            {productData.seoTitle || productData.name || 'כותרת המוצר'}
          </div>
          <div className="text-green-700 text-sm">
            yourstore.com/products/{productData.name?.toLowerCase().replace(/\s+/g, '-') || 'product-name'}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {productData.seoDescription || productData.shortDescription || 'תיאור המוצר יופיע כאן...'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button className="p-2 hover:bg-gray-100 rounded-lg ml-3">
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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            שמור מוצר
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8 rtl:space-x-reverse">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'media' && renderMediaTab()}
        {activeTab === 'variants' && renderVariantsTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'seo' && renderSeoTab()}
      </div>
    </div>
  );
};

export default ProductFormPage;

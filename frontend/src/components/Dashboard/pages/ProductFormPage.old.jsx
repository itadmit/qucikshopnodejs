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
import CategorySelector from '../components/CategorySelector.jsx';
import apiService from '../../../services/api.js';
import { RichTextEditor, SmartColorPicker } from '../../ui/index.js';

const ProductFormPage = ({ productId = null }) => {
  const [productType, setProductType] = useState('SIMPLE'); // 'SIMPLE', 'VARIABLE', or 'BUNDLE'
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
  
  // Categories
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Helper function to convert HTML to plain text for SEO
  const htmlToPlainText = (html) => {
    if (!html) return '';
    
    // First, replace block elements with spaces to preserve word separation
    let cleanHtml = html
      .replace(/<\/?(div|p|br|h[1-6]|li|ul|ol)[^>]*>/gi, ' ')
      .replace(/<[^>]*>/g, ''); // Remove all other HTML tags
    
    // Decode HTML entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up whitespace - replace multiple spaces/newlines with single space
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  };

  // Load custom fields and product data
  React.useEffect(() => {
    const loadCustomFields = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) return;
        
        apiService.setToken(token);
        const result = await apiService.getCustomFields();
        
        if (result.success) {
          setCustomFields(result.data || []);
          
          // Initialize custom field values
          const initialValues = {};
          (result.data || []).forEach(field => {
            initialValues[field.name] = field.defaultValue || '';
          });
          setCustomFieldValues(initialValues);
        }
      } catch (error) {
        console.error('Error loading custom fields:', error);
      }
    };

    const loadProductData = async () => {
      if (productId) {
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('authToken');
          if (!token) return;
          
          apiService.setToken(token);
          const product = await apiService.getProduct(productId);
          
          if (product) {
            setProductData({
              name: product.name || '',
              description: product.description || '',
              shortDescription: product.shortDescription || '',
              sku: product.sku || '',
              price: product.price || '',
              comparePrice: product.comparePrice || '',
              costPrice: product.costPrice || '',
              trackInventory: product.trackInventory ?? true,
              inventoryQuantity: product.inventoryQuantity || 0,
              allowBackorder: product.allowBackorder || false,
              weight: product.weight || '',
              requiresShipping: product.requiresShipping ?? true,
              isDigital: product.isDigital || false,
              tags: product.tags ? JSON.parse(product.tags) : [],
              category: product.categoryId || '',
              seoTitle: product.seoTitle || '',
              seoDescription: product.seoDescription || '',
              publishedAt: product.publishedAt || ''
            });
            
            if (product.media) {
              setMedia(product.media);
            }
            
            if (product.productOptions) {
              setProductOptions(product.productOptions);
            }
            
            if (product.variants) {
              setVariants(product.variants);
            }

            // Load custom field values from product
            if (product.customFields) {
              try {
                const productCustomFields = typeof product.customFields === 'string' 
                  ? JSON.parse(product.customFields) 
                  : product.customFields;
                setCustomFieldValues(productCustomFields);
              } catch (error) {
                console.error('Error parsing product custom fields:', error);
              }
            }
            
            setIsDraft(product.status === 'DRAFT');
          }
        } catch (error) {
          console.error('Error loading product:', error);
        }
      }
    };

    loadCustomFields();
    loadProductData();
  }, [productId]);

  // Load available products for bundle
  React.useEffect(() => {
    const loadAvailableProducts = async () => {
      if (productType !== 'BUNDLE') return;
      
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const storeId = 1; // TODO: Get from context
        
        if (!token) return;
        
        apiService.setToken(token);
        const result = await apiService.getProducts({ storeId });
        
        if (result.success) {
          // Filter out bundle products to prevent circular references
          const products = result.data.filter(p => p.type !== 'BUNDLE');
          setAvailableProducts(products);
        }
      } catch (error) {
        console.error('Error loading available products:', error);
      }
    };

    loadAvailableProducts();
  }, [productType]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-search-container')) {
        setShowProductDropdown(null);
        setProductSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Media management
  const [media, setMedia] = useState([]);
  const [primaryVideo, setPrimaryVideo] = useState(null);

  // Product options (for variants)
  const [productOptions, setProductOptions] = useState([]);
  const [variants, setVariants] = useState([]);

  // Bundle items (for bundle products)
  const [bundleItems, setBundleItems] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(null);

  // Available option types
  const optionTypes = [
    { value: 'COLOR', label: 'צבע', icon: Palette, description: 'בחירת צבע עם פלטה' },
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

  // Bundle item management functions
  const handleAddBundleItem = () => {
    const newItem = {
      id: Date.now(),
      productId: '',
      variantId: null,
      quantity: 1,
      isOptional: false,
      discountType: null,
      discountValue: null
    };
    setBundleItems([...bundleItems, newItem]);
  };

  const handleRemoveBundleItem = (itemId) => {
    setBundleItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleBundleItemChange = (itemId, field, value) => {
    setBundleItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  // Filter products based on search term
  const getFilteredProducts = (searchTerm = '') => {
    if (!searchTerm.trim()) return availableProducts;
    
    return availableProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleProductSelect = (itemId, product) => {
    handleBundleItemChange(itemId, 'productId', product.id);
    setShowProductDropdown(null);
    setProductSearchTerm('');
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
        type: productType,
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
        productOptions: productOptions,
        bundleItems: productType === 'BUNDLE' ? bundleItems.filter(item => item.productId) : []
      };

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      apiService.setToken(token);
      
      const result = productId 
        ? await apiService.updateProduct(productId, saveData)
        : await apiService.createProduct(saveData);
      alert(productId ? 'המוצר עודכן בהצלחה!' : 'המוצר נשמר בהצלחה!');
      
      // Redirect back to products list
      window.history.pushState({}, '', '/dashboard/products');
      window.dispatchEvent(new PopStateEvent('popstate'));
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

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      apiService.setToken(token);
      const result = await apiService.uploadMedia(files, 'products');
      
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">סוג מוצר</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
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
              <Package className="w-4 h-4 text-blue-600 ml-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">מוצר פשוט</div>
                <div className="text-xs text-gray-500">ללא וריאציות</div>
              </div>
            </div>
          </label>
          
          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
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
              <Settings className="w-4 h-4 text-blue-600 ml-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">עם וריאציות</div>
                <div className="text-xs text-gray-500">צבע, מידה וכו'</div>
              </div>
            </div>
          </label>

          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            productType === 'BUNDLE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="productType"
              value="BUNDLE"
              checked={productType === 'BUNDLE'}
              onChange={(e) => setProductType(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center">
              <Package className="w-4 h-4 text-blue-600 ml-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">מוצר בנדל</div>
                <div className="text-xs text-gray-500">מספר מוצרים</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SKU (יחידת מלאי)</label>
          <input
            type="text"
            value={productData.sku}
            onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="קוד מוצר יחודי"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ברקוד (ISBN, UPC, GTIN וכו')</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ברקוד המוצר"
          />
        </div>
      </div>
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
      ) : productType === 'BUNDLE' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">רכיבי הבנדל</h3>
            <button
              type="button"
              onClick={handleAddBundleItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              הוסף מוצר לבנדל
            </button>
          </div>

          {bundleItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">הוסף מוצרים לבנדל</p>
              <button
                type="button"
                onClick={handleAddBundleItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                הוסף מוצר ראשון
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bundleItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">מוצר {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveBundleItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">מוצר</label>
                      
                      {/* Selected Product Display */}
                      {item.productId ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            {(() => {
                              const selectedProduct = availableProducts.find(p => p.id == item.productId);
                              return selectedProduct ? (
                                <>
                                  {selectedProduct.media && selectedProduct.media[0] && (
                                    <img 
                                      src={selectedProduct.media[0].media?.s3Url || selectedProduct.media[0].url} 
                                      alt={selectedProduct.name}
                                      className="w-8 h-8 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium text-sm">{selectedProduct.name}</div>
                                    <div className="text-xs text-gray-500">₪{selectedProduct.price}</div>
                                  </div>
                                </>
                              ) : (
                                <span className="text-gray-500">מוצר לא נמצא</span>
                              );
                            })()}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleBundleItemChange(item.id, 'productId', '');
                              setShowProductDropdown(null);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* Product Search Input */
                        <div className="relative product-search-container">
                          <input
                            type="text"
                            placeholder="חפש מוצר..."
                            value={showProductDropdown === item.id ? productSearchTerm : ''}
                            onChange={(e) => {
                              setProductSearchTerm(e.target.value);
                              setShowProductDropdown(item.id);
                            }}
                            onFocus={() => setShowProductDropdown(item.id)}
                            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                          
                          {/* Search Results Dropdown */}
                          {showProductDropdown === item.id && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {getFilteredProducts(productSearchTerm).length === 0 ? (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  {productSearchTerm ? 'לא נמצאו מוצרים' : 'התחל להקליד לחיפוש'}
                                </div>
                              ) : (
                                getFilteredProducts(productSearchTerm).map(product => (
                                  <div
                                    key={product.id}
                                    onClick={() => handleProductSelect(item.id, product)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                      {product.media && product.media[0] && (
                                        <img 
                                          src={product.media[0].media?.s3Url || product.media[0].url} 
                                          alt={product.name}
                                          className="w-10 h-10 rounded object-cover"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 truncate">
                                          {product.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          SKU: {product.sku || 'N/A'} • ₪{product.price}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                          מלאי: {product.inventoryQuantity || 0} יחידות
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">כמות</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleBundleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isOptional}
                          onChange={(e) => handleBundleItemChange(item.id, 'isOptional', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
                        />
                        <span className="text-sm text-gray-700">אופציונלי</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
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
                              <div className="w-64">
                                <SmartColorPicker
                                  value={value.colorCode || ''}
                                  onChange={(color) => {
                                    setProductOptions(prev => prev.map(o => 
                                      o.id === option.id 
                                        ? { ...o, values: o.values.map(v => v.id === value.id ? { ...v, colorCode: color } : v) }
                                        : o
                                    ));
                                  }}
                                  placeholder="הכנס שם צבע או קוד..."
                                />
                              </div>
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
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderSeoTab = () => {
    // Auto-fill SEO fields if empty
    const displaySeoTitle = productData.seoTitle || productData.name || '';
    const displaySeoDescription = productData.seoDescription || htmlToPlainText(productData.shortDescription || productData.description) || '';
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">כותרת SEO</label>
          <input
            type="text"
            value={productData.seoTitle}
            onChange={(e) => setProductData({ ...productData, seoTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={productData.name || "כותרת למנועי חיפוש"}
          />
          <p className="text-xs text-gray-500 mt-1">
            מומלץ עד 60 תווים • {!productData.seoTitle && productData.name ? 'יוצג: ' + productData.name : `${displaySeoTitle.length}/60 תווים`}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">תיאור SEO</label>
          <textarea
            value={productData.seoDescription}
            onChange={(e) => setProductData({ ...productData, seoDescription: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={htmlToPlainText(productData.shortDescription || productData.description) || "תיאור למנועי חיפוש"}
          />
          <p className="text-xs text-gray-500 mt-1">
            מומלץ עד 160 תווים • {!productData.seoDescription && (productData.shortDescription || productData.description) ? 
              'יוצג: ' + htmlToPlainText(productData.shortDescription || productData.description).substring(0, 50) + '...' : 
              `${displaySeoDescription.length}/160 תווים`}
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 text-sm">תצוגה מקדימה בגוגל</h4>
          <div className="space-y-1">
            <div className="text-blue-600 text-sm hover:underline cursor-pointer">
              {displaySeoTitle || 'כותרת המוצר'}
            </div>
            <div className="text-green-700 text-xs">
              yourstore.com/products/{productData.name?.toLowerCase().replace(/\s+/g, '-') || 'product-name'}
            </div>
            <div className="text-gray-600 text-xs">
              {displaySeoDescription || 'תיאור המוצר יופיע כאן...'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomFieldsTab = () => (
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
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              לחץ כאן כדי להוסיף שדות מותאמים אישית
            </button>
          </p>
        </div>
      ) : (
        customFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
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
                <span className="mr-2 text-sm text-gray-700">{field.placeholder || field.label}</span>
              </div>
            )}

            {field.type === 'DROPDOWN' && field.options && (
              <select
                value={customFieldValues[field.name] || ''}
                onChange={(e) => setCustomFieldValues({
                  ...customFieldValues,
                  [field.name]: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      required={field.isRequired}
                    />
                    <span className="mr-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
             {/* Header */}
       <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
         <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              <h1 className="text-2xl font-semibold text-gray-900">
                {productId ? 'עריכת מוצר' : 'הוסף מוצר'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              תצוגה מקדימה
            </button>
            <button 
              onClick={handleSaveProduct}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              שמור
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title and Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">כותרת</label>
                    <input
                      type="text"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="חולצת טי קצרה"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">תיאור</label>
                    <RichTextEditor
                      value={productData.description}
                      onChange={(content) => setProductData({ ...productData, description: content })}
                      placeholder="תיאור המוצר..."
                      minHeight="150px"
                      maxHeight="300px"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">מדיה</h3>
                {renderMediaTab()}
              </div>
            </div>

            {/* Product Type & Variants/Bundle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {productType === 'BUNDLE' ? 'רכיבי בנדל' : productType === 'VARIABLE' ? 'וריאציות' : 'סוג מוצר'}
                </h3>
                {renderBasicTab()}
                {productType !== 'SIMPLE' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {renderVariantsTab()}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            {(productType === 'SIMPLE' || productType === 'BUNDLE') && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">תמחור</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">מחיר</label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                        <input
                          type="number"
                          step="0.01"
                          value={productData.price}
                          onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">השווה במחיר</label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                        <input
                          type="number"
                          step="0.01"
                          value={productData.comparePrice}
                          onChange={(e) => setProductData({ ...productData, comparePrice: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">מחיר עלות</label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                        <input
                          type="number"
                          step="0.01"
                          value={productData.costPrice}
                          onChange={(e) => setProductData({ ...productData, costPrice: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Fields */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">שדות מותאמים אישית</h3>
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState({}, '', '/dashboard/settings/custom-fields');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    נהל שדות מותאמים
                  </button>
                </div>
                {renderCustomFieldsTab()}
              </div>
            </div>


          </div>

                     {/* Right Column - Sidebar */}
           <div className="space-y-6">
            
            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">סטטוס</h3>
                <div className="space-y-4">
                  <div>
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
                      <option value="active">פעיל</option>
                      <option value="draft">טיוטה</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Organization */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">ארגון מוצר</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריות מוצר</label>
                    <CategorySelector
                      selectedCategories={selectedCategories}
                      onCategoriesChange={setSelectedCategories}
                      placeholder="בחר קטגוריות למוצר..."
                    />
                  </div>
                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ספק</label>
                    <input
                      type="text"
                      placeholder="ספק המוצר"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">מלאי</h3>
                {renderInventoryTab()}
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">משלוח</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">זהו מוצר פיזי</div>
                      <div className="text-sm text-gray-500">הלקוחות יקבלו מוצר פיזי</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productData.requiresShipping}
                        onChange={(e) => setProductData({ ...productData, requiresShipping: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {productData.requiresShipping && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">משקל</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={productData.weight}
                          onChange={(e) => setProductData({ ...productData, weight: e.target.value })}
                          className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.0"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">ק"ג</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">אופטימיזציה למנועי חיפוש</h3>
                {renderSeoTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;

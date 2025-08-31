import React, { useState, useRef } from 'react';
import { Eye, Save, ArrowRight } from 'lucide-react';
import apiService from '../../../services/api.js';

// Import sub-components
import ProductBasicInfo from './ProductForm/ProductBasicInfo.jsx';
import ProductPricing from './ProductForm/ProductPricing.jsx';
import ProductOptions from './ProductForm/ProductOptions.jsx';
import ProductVariants from './ProductForm/ProductVariants.jsx';
import ProductMedia from './ProductForm/ProductMedia.jsx';
import ProductSidebar from './ProductForm/ProductSidebar.jsx';
import CustomFieldsTab from './ProductForm/CustomFieldsTab.jsx';

const ProductFormPage = ({ productId = null }) => {
  const [productType, setProductType] = useState('SIMPLE');
  const [isDraft, setIsDraft] = useState(true);
  const fileInputRef = useRef(null);
  const [currentStore, setCurrentStore] = useState(null);
  const [isLoading, setIsLoading] = useState(!!productId);
  
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
    inventoryQuantity: '',
    allowBackorder: false,
    lowStockThreshold: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    requiresShipping: true,
    isDigital: false,
    taxable: true,
    tags: [],
    seoTitle: '',
    seoDescription: '',
    publishedAt: ''
  });

  // Images
  const [productImages, setProductImages] = useState([]);

  // Options and variants
  const [productOptions, setProductOptions] = useState([]);
  const [variants, setVariants] = useState([]);

  // Bundle items (for bundle products)
  const [bundleItems, setBundleItems] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(null);

  // Custom fields
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  
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
        // Set token before API call
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No token found for loading custom fields');
          return;
        }
        
        apiService.setToken(token);
        const response = await apiService.get('/custom-fields');
        if (response.success && response.data) {
          setCustomFields(response.data);
        }
      } catch (error) {
        console.error('Error loading custom fields:', error);
      }
    };

    const loadProductData = async () => {
      if (productId) {
        try {
          setIsLoading(true);
          // Set token before API call
          const token = localStorage.getItem('authToken');
          if (!token) {
            console.error('No token found for loading product');
            setIsLoading(false);
            return;
          }
          
          apiService.setToken(token);
          const response = await apiService.get(`/products/${productId}`);
          
          if (response.success && response.data) {
            const product = response.data;
            setProductData({
              name: product.name || '',
              description: product.description || '',
              shortDescription: product.shortDescription || '',
              sku: product.sku || '',
              price: product.price || '',
              comparePrice: product.comparePrice || '',
              costPrice: product.costPrice || '',
              trackInventory: product.trackInventory ?? true,
              inventoryQuantity: product.inventoryQuantity || '',
              allowBackorder: product.allowBackorder ?? false,
              lowStockThreshold: product.lowStockThreshold || '',
              weight: product.weight || '',
              dimensions: product.dimensions || { length: '', width: '', height: '' },
              requiresShipping: product.requiresShipping ?? true,
              isDigital: product.isDigital ?? false,
              taxable: product.taxable ?? true,
              tags: product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [],
              seoTitle: product.seoTitle || '',
              seoDescription: product.seoDescription || '',
              publishedAt: product.publishedAt || ''
            });
            
            setProductType(product.type || 'SIMPLE');
            setIsDraft(product.status === 'DRAFT');
            
            // Load categories
            if (product.category) {
              setSelectedCategories([{
                id: product.category.id,
                name: product.category.name
              }]);
            } else {
              setSelectedCategories([]);
            }
            // Add uniqueId to existing product images for drag & drop
            const imagesWithUniqueId = (product.media || []).map((mediaItem, index) => ({
              id: mediaItem.id,
              url: mediaItem.media.s3Url,
              key: mediaItem.media.s3Key,
              type: mediaItem.type,
              isPrimary: mediaItem.isPrimary,
              altText: mediaItem.altText,
              originalName: mediaItem.media.originalFilename,
              size: mediaItem.media.fileSize,
              uniqueId: `product-media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${index}`
            }));
            setProductImages(imagesWithUniqueId);
            setProductOptions(product.options || []);
            setVariants(product.variants || []);
            setBundleItems(product.bundleItems || []);

            // Parse custom fields if they exist
            if (product.customFields) {
              try {
                const parsedCustomFields = typeof product.customFields === 'string' 
                  ? JSON.parse(product.customFields) 
                  : product.customFields;
                setCustomFieldValues(parsedCustomFields);
              } catch (error) {
                console.error('Error parsing custom fields:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error loading product:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCustomFields();
    loadProductData();
  }, [productId]);

  // Option handlers
  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      name: '',
      type: 'COLOR',
      values: [{ id: Date.now(), value: '', colorCode: '' }]
    };
    setProductOptions([...productOptions, newOption]);
  };

  const handleRemoveOption = (optionId) => {
    setProductOptions(productOptions.filter(option => option.id !== optionId));
  };

  const handleAddOptionValue = (optionId) => {
    setProductOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { ...option, values: [...option.values, { id: Date.now(), value: '', colorCode: '' }] }
        : option
    ));
  };

  const handleRemoveOptionValue = (optionId, valueId) => {
    setProductOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { ...option, values: option.values.filter(value => value.id !== valueId) }
        : option
    ));
  };

  // מאגר צבעים לזיהוי
  const colorDatabase = [
    { name: 'לבן', hex: '#FFFFFF' },
    { name: 'שחור', hex: '#000000' },
    { name: 'אדום', hex: '#FF0000' },
    { name: 'כחול', hex: '#0000FF' },
    { name: 'ירוק', hex: '#008000' },
    { name: 'צהוב', hex: '#FFFF00' },
    { name: 'כתום', hex: '#FFA500' },
    { name: 'סגול', hex: '#800080' },
    { name: 'ורוד', hex: '#FFC0CB' },
    { name: 'חום', hex: '#A52A2A' },
    { name: 'אפור', hex: '#808080' },
    { name: 'כסף', hex: '#C0C0C0' },
    { name: 'זהב', hex: '#FFD700' },
    
    // גוונים בהירים
    { name: 'ירוק בהיר', hex: '#90EE90' },
    { name: 'כחול בהיר', hex: '#ADD8E6' },
    { name: 'אדום בהיר', hex: '#FF6B6B' },
    { name: 'צהוב בהיר', hex: '#FFFF99' },
    { name: 'ורוד בהיר', hex: '#FFB6C1' },
    { name: 'סגול בהיר', hex: '#DDA0DD' },
    
    // גוונים כהים
    { name: 'אדום כהה', hex: '#8B0000' },
    { name: 'כחול כהה', hex: '#00008B' },
    { name: 'ירוק כהה', hex: '#006400' },
    { name: 'סגול כהה', hex: '#4B0082' },
    { name: 'ורוד כהה', hex: '#C71585' },
    { name: 'צהוב כהה', hex: '#B8860B' },
    { name: 'כתום כהה', hex: '#FF8C00' },
    
    // צבעים מיוחדים
    { name: 'טורקיז', hex: '#40E0D0' },
    { name: 'ליים', hex: '#00FF00' },
    { name: 'מגנטה', hex: '#FF00FF' },
    { name: 'ציאן', hex: '#00FFFF' },
    { name: 'נייבי', hex: '#000080' },
    { name: 'מרון', hex: '#800000' },
    { name: 'אוליב', hex: '#808000' },
    { name: 'טיל', hex: '#008080' },
    { name: 'אינדיגו', hex: '#4B0082' },
    { name: 'חרדל', hex: '#FFDB58' },
    { name: 'קורל', hex: '#FF7F50' },
    { name: 'סלמון', hex: '#FA8072' },
    { name: 'פוקסיה', hex: '#FF00FF' },
    { name: 'אקווה', hex: '#00FFFF' },
    
    // צבעי תכשיטים ומתכות
    { name: 'רוז גולד', hex: '#E8B4B8' },
    { name: 'רוז-גולד', hex: '#E8B4B8' },
    { name: 'זהב ורוד', hex: '#E8B4B8' },
    { name: 'זהב לבן', hex: '#F5F5DC' },
    { name: 'זהב צהוב', hex: '#FFD700' },
    { name: 'פלטינה', hex: '#E5E4E2' },
    { name: 'פלטינום', hex: '#E5E4E2' },
    { name: 'כסף סטרלינג', hex: '#C0C0C0' },
    { name: 'כסף עתיק', hex: '#C9C0BB' },
    { name: 'נחושת', hex: '#B87333' },
    { name: 'ברונזה', hex: '#CD7F32' },
    { name: 'פליז', hex: '#B5A642' },
    { name: 'טיטניום', hex: '#878681' },
    { name: 'פלדה', hex: '#71797E' },
    
    // אבני חן וצבעים יקרים
    { name: 'יהלום', hex: '#B9F2FF' },
    { name: 'אמרלד', hex: '#50C878' },
    { name: 'רובי', hex: '#E0115F' },
    { name: 'ספיר', hex: '#0F52BA' },
    { name: 'פנינה', hex: '#F8F6F0' },
    { name: 'אוניקס', hex: '#353839' },
    { name: 'אמטיסט', hex: '#9966CC' },
    { name: 'טופז', hex: '#FFC87C' },
    { name: 'אקוומרין', hex: '#7FFFD4' },
    { name: 'גרנט', hex: '#733635' },
    { name: 'פרידוט', hex: '#9ACD32' },
    { name: 'ציטרין', hex: '#E4D00A' }
  ];

  // פונקציה לזיהוי צבע או דפוס
  const detectColorOrPattern = (input) => {
    if (!input) return null;
    
    const cleanInput = input.trim().toLowerCase();
    
    // זיהוי דפוסים
    const patterns = {
      'פסים': 'stripes',
      'משובץ': 'checkered', 
      'מנוקד': 'dots',
      'נקודות': 'dots',
      'מנומר': 'numbered',
      'מנוחש': 'hashed',
      'חלק': 'solid'
    };
    
    // בדיקה אם יש דפוס בקלט
    const foundPattern = Object.keys(patterns).find(pattern => 
      cleanInput.includes(pattern)
    );
    
    if (foundPattern) {
      // חילוץ הצבע מהטקסט
      const colorPart = cleanInput.replace(foundPattern, '').trim();
      const baseColor = detectColor(colorPart);
      
      return {
        type: 'pattern',
        pattern: patterns[foundPattern],
        patternName: foundPattern,
        color: baseColor,
        fullName: input
      };
    }
    
    // אם לא נמצא דפוס, חפש צבע רגיל
    return detectColor(input);
  };

  // פונקציה לזיהוי צבע (הפונקציה המקורית)
  const detectColor = (colorName) => {
    if (!colorName) return null;
    
    const cleanName = colorName.trim().toLowerCase();
    
    // זיהוי צבעים מעורבים (חצי-חצי)
    const words = cleanName.split(/\s+/);
    if (words.length === 2) {
      const firstColor = findSingleColor(words[0]);
      const secondColor = findSingleColor(words[1]);
      
      if (firstColor && secondColor) {
        return {
          name: `${firstColor.name} ${secondColor.name}`,
          hex: createMixedColorGradient(firstColor.hex, secondColor.hex),
          type: 'mixed',
          colors: [firstColor, secondColor]
        };
      }
    }
    
    // אם לא זוהו שני צבעים, חפש צבע יחיד
    return findSingleColor(cleanName);
  };

  // פונקציה עזר לחיפוש צבע יחיד
  const findSingleColor = (colorName) => {
    if (!colorName) return null;
    
    const cleanName = colorName.trim().toLowerCase();
    
    // חיפוש מדויק קודם
    let foundColor = colorDatabase.find(color => 
      color.name.toLowerCase() === cleanName
    );
    
    if (foundColor) return foundColor;
    
    // חיפוש חלקי - אם הקלט מכיל את שם הצבע
    foundColor = colorDatabase.find(color => 
      cleanName.includes(color.name.toLowerCase())
    );
    
    if (foundColor) return foundColor;
    
    // חיפוש הפוך - אם שם הצבע מכיל את הקלט
    foundColor = colorDatabase.find(color => 
      color.name.toLowerCase().includes(cleanName)
    );
    
    if (foundColor) return foundColor;
    
    // חיפוש מתקדם - מילים נפרדות
    const inputWords = cleanName.split(/\s+/);
    foundColor = colorDatabase.find(color => {
      const colorWords = color.name.toLowerCase().split(/\s+/);
      return inputWords.every(inputWord => 
        colorWords.some(colorWord => 
          colorWord.includes(inputWord) || inputWord.includes(colorWord)
        )
      );
    });
    
    return foundColor;
  };

  // פונקציה ליצירת גרדיאנט לצבעים מעורבים
  const createMixedColorGradient = (color1, color2) => {
    return `linear-gradient(90deg, ${color1} 50%, ${color2} 50%)`;
  };

  const handleOptionValueChange = (optionId, valueId, newValue) => {
    setProductOptions(prev => prev.map(option => {
      if (option.id === optionId) {
        const updatedOption = { ...option };
        
        // עדכון הערך
        updatedOption.values = option.values.map(value => {
          if (value.id === valueId) {
            const updatedValue = { ...value, value: newValue };
            
            // זיהוי צבע או דפוס אוטומטי אם זה אפשרות צבע
            if (option.type === 'COLOR') {
              const detected = detectColorOrPattern(newValue);
              
              if (detected) {
                if (detected.type === 'pattern') {
                  // זוהה דפוס
                  updatedValue.pattern = {
                    type: detected.pattern,
                    primaryColor: detected.color ? detected.color.hex : '#000000',
                    secondaryColor: '#FFFFFF'
                  };
                  updatedValue.detectedPattern = {
                    name: detected.fullName,
                    pattern: detected.patternName,
                    color: detected.color ? detected.color.name : 'שחור'
                  };
                  updatedValue.colorCode = detected.color ? detected.color.hex : '#000000';
                } else {
                  // זוהה צבע רגיל או מעורב - נקה דפוס קודם
                  if (detected.type === 'mixed') {
                    // צבע מעורב - שמור כגרדיאנט
                    updatedValue.colorCode = detected.colors[0].hex; // צבע ראשי לקולור פיקר
                    updatedValue.mixedColor = detected; // שמור את המידע המלא
                    updatedValue.detectedColor = detected;
                  } else {
                    // צבע רגיל
                    updatedValue.colorCode = detected.hex;
                    updatedValue.detectedColor = detected;
                    updatedValue.mixedColor = null;
                  }
                  updatedValue.pattern = null;
                  updatedValue.detectedPattern = null;
                }
                
                // הסרת החיווי מיידית (ללא השהיה)
                // setTimeout removed to improve performance
              } else {
                // לא זוהה כלום - נקה הכל
                updatedValue.pattern = null;
                updatedValue.detectedPattern = null;
                updatedValue.detectedColor = null;
              }
            }
            
            return updatedValue;
          }
          return value;
        });
        
        // אם זה הערך האחרון ויש בו תוכן, הוסף ערך ריק חדש
        const lastValue = updatedOption.values[updatedOption.values.length - 1];
        if (lastValue.id === valueId && newValue.trim() !== '' && updatedOption.values.length < 10) {
          updatedOption.values.push({
            id: Date.now() + Math.random(), // וודא שה-ID יהיה ייחודי
            value: '',
            colorCode: option.type === 'COLOR' ? '#000000' : undefined
          });
        }
        
        return updatedOption;
      }
      
      return option;
    }));
  };

  // פונקציית אימות
  const validateProduct = () => {
    const errors = [];

    // בדיקת שדות חובה
    if (!productData.name || productData.name.trim() === '') {
      errors.push('שם המוצר הוא שדה חובה');
    }

    if (!productData.sku || productData.sku.trim() === '') {
      errors.push('מקט הוא שדה חובה');
    }

    // בדיקת מחיר למוצר פשוט
    if (productType === 'SIMPLE') {
      if (!productData.price || productData.price === '') {
        errors.push('מחיר המוצר הוא שדה חובה');
      } else if (parseFloat(productData.price) < 0) {
        errors.push('מחיר המוצר לא יכול להיות שלילי');
      } else if (parseFloat(productData.price) === 0) {
        // מחיר 0 דורש אישור מיוחד
        const confirmFree = window.confirm('האם אתה בטוח שהמוצר חינמי (מחיר 0)?');
        if (!confirmFree) {
          errors.push('אנא אשר שהמוצר אכן חינמי או הזן מחיר');
        }
      }
    }

    // בדיקת אפשרויות למוצר עם וריאציות
    if (productType === 'VARIABLE') {
      const validOptions = productOptions.filter(option => 
        option.values && option.values.length > 0 && 
        option.values.some(value => value.value && value.value.trim() !== '')
      );
      
      if (validOptions.length === 0) {
        errors.push('מוצר עם וריאציות חייב לכלול לפחות אפשרות אחת עם ערכים');
      }

      // בדיקת מחירי וריאציות
      const emptyPriceVariants = variants.filter(variant => 
        !variant.price || variant.price === ''
      );
      
      const negativePriceVariants = variants.filter(variant => 
        variant.price && parseFloat(variant.price) < 0
      );

      const zeroPriceVariants = variants.filter(variant => 
        variant.price && parseFloat(variant.price) === 0
      );
      
      if (emptyPriceVariants.length > 0) {
        errors.push('כל הוריאציות חייבות לכלול מחיר');
      }
      
      if (negativePriceVariants.length > 0) {
        errors.push('מחיר הוריאציות לא יכול להיות שלילי');
      }

      if (zeroPriceVariants.length > 0) {
        const confirmFreeVariants = window.confirm(`יש ${zeroPriceVariants.length} וריאציות עם מחיר 0. האם זה נכון?`);
        if (!confirmFreeVariants) {
          errors.push('אנא אשר שהוריאציות עם מחיר 0 אכן חינמיות');
        }
      }
    }

    return errors;
  };

  // Save product
  const handleSaveProduct = async () => {
    try {
      // אימות לפני שמירה
      const errors = validateProduct();
      if (errors.length > 0) {
        setValidationErrors(errors);
        // גלילה לראש הדף כדי לראות את השגיאות
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // נקה שגיאות קודמות
      setValidationErrors([]);

      // Get current store dynamically
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token for save:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      if (!token) {
        alert('שגיאה: לא נמצא טוקן אימות');
        return;
      }
      
      apiService.setToken(token);
      const userStores = await apiService.getUserStores();
      if (!userStores || userStores.length === 0) {
        alert('שגיאה: לא נמצאו חנויות');
        return;
      }
      
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      const currentStore = selectedStoreId 
        ? userStores.find(store => store.id.toString() === selectedStoreId)
        : userStores[0];
      
      if (!currentStore) {
        alert('שגיאה: לא נמצאה חנות תקינה');
        return;
      }

      // Save current store for component use
      setCurrentStore(currentStore);

      const saveData = {
        storeId: currentStore.id,
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription,
        sku: productData.sku,
        type: productType,
        categoryId: selectedCategories.length > 0 ? selectedCategories[0].id : null,
        price: productData.price,
        comparePrice: productData.comparePrice,
        costPrice: productData.costPrice,
        trackInventory: productData.trackInventory,
        inventoryQuantity: productData.inventoryQuantity,
        allowBackorder: productData.allowBackorder,
        lowStockThreshold: productData.lowStockThreshold,
        weight: productData.weight,
        dimensions: productData.dimensions,
        requiresShipping: productData.requiresShipping,
        isDigital: productData.isDigital,
        taxable: productData.taxable,
        tags: JSON.stringify(productData.tags),
        status: isDraft ? 'DRAFT' : 'ACTIVE',
        seoTitle: productData.seoTitle,
        seoDescription: productData.seoDescription,
        images: productImages,
        options: productOptions,
        variants: variants,
        bundleItems: bundleItems,
        customFields: JSON.stringify(customFieldValues)
      };

      let result;
      if (productId) {
        result = await apiService.put(`/products/${productId}`, saveData);
      } else {
        result = await apiService.post('/products', saveData);
      }

      if (result) {
        // Store success message for the products page
        localStorage.setItem('productSaveSuccess', 'המוצר נשמר בהצלחה!');
        
        // Navigate back to products page
        window.history.pushState({}, '', '/dashboard/products');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('שגיאה בשמירת המוצר');
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/dashboard/products');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני מוצר...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה למוצרים
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {productId ? 'עריכת מוצר' : 'הוסף מוצר'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Eye className="w-4 h-4 ml-2" />
                תצוגה מקדימה
              </button>
              <button 
                onClick={handleSaveProduct}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 ml-2" />
                שמור
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-red-800">
                  יש לתקן את השגיאות הבאות:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">מידע בסיסי</h3>
                <ProductBasicInfo
                  productType={productType}
                  setProductType={setProductType}
                  productData={productData}
                  setProductData={setProductData}
                />
              </div>
            </div>

            {/* Pricing & Inventory - Only for Simple Products */}
            {productType === 'SIMPLE' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <ProductPricing
                    productData={productData}
                    setProductData={setProductData}
                  />
                </div>
              </div>
            )}

            {/* Media */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">מדיה</h3>
                <ProductMedia
                  productImages={productImages}
                  setProductImages={setProductImages}
                  fileInputRef={fileInputRef}
                  storeId={currentStore?.id}
                />
              </div>
            </div>

            {/* Options (for VARIABLE products) */}
            {productType === 'VARIABLE' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <ProductOptions
                    productOptions={productOptions}
                    setProductOptions={setProductOptions}
                    handleAddOption={handleAddOption}
                    handleRemoveOption={handleRemoveOption}
                    handleAddOptionValue={handleAddOptionValue}
                    handleRemoveOptionValue={handleRemoveOptionValue}
                    handleOptionValueChange={handleOptionValueChange}
                  />
                </div>
              </div>
            )}

            {/* Variants (for VARIABLE products) */}
            {productType === 'VARIABLE' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <ProductVariants
                    productOptions={productOptions}
                    variants={variants}
                    setVariants={setVariants}
                    productData={productData}
                  />
                </div>
              </div>
            )}

            {/* Custom Fields */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">שדות מותאמים אישית</h3>
                <CustomFieldsTab
                  customFields={customFields}
                  customFieldValues={customFieldValues}
                  setCustomFieldValues={setCustomFieldValues}
                />
              </div>
            </div>

            </div>

          {/* Right Column - Sidebar */}
          <ProductSidebar
            productData={productData}
            setProductData={setProductData}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            isDraft={isDraft}
            setIsDraft={setIsDraft}
            htmlToPlainText={htmlToPlainText}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;

import React, { useState, useRef } from 'react';
import apiService from '../../../services/api.js';

// Import sub-components
import ProductBasicInfo from './ProductForm/ProductBasicInfo.jsx';
import ProductOptions from './ProductForm/ProductOptions.jsx';
import ProductMedia from './ProductForm/ProductMedia.jsx';
import ProductSidebar from './ProductForm/ProductSidebar.jsx';
import CustomFieldsTab from './ProductForm/CustomFieldsTab.jsx';

const ProductFormPage = ({ productId = null }) => {
  const [productType, setProductType] = useState('SIMPLE');
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
    inventoryQuantity: '',
    lowStockThreshold: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    shippingRequired: true,
    taxable: true,
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
          const product = await apiService.get(`/products/${productId}`);
          
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
              inventoryQuantity: product.inventoryQuantity || '',
              lowStockThreshold: product.lowStockThreshold || '',
              weight: product.weight || '',
              dimensions: product.dimensions || { length: '', width: '', height: '' },
              shippingRequired: product.shippingRequired ?? true,
              taxable: product.taxable ?? true,
              seoTitle: product.seoTitle || '',
              seoDescription: product.seoDescription || '',
              publishedAt: product.publishedAt || ''
            });

            setProductType(product.type || 'SIMPLE');
            setIsDraft(product.status === 'DRAFT');
            setProductImages(product.images || []);
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

  const handleOptionValueChange = (optionId, valueId, newValue) => {
    setProductOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { ...option, values: option.values.map(value => 
            value.id === valueId ? { ...value, value: newValue } : value
          )}
        : option
    ));
  };

  // Save product
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
        trackInventory: productData.trackInventory,
        inventoryQuantity: productData.inventoryQuantity,
        lowStockThreshold: productData.lowStockThreshold,
        weight: productData.weight,
        dimensions: productData.dimensions,
        shippingRequired: productData.shippingRequired,
        taxable: productData.taxable,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
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
        alert('המוצר נשמר בהצלחה!');
        if (!productId) {
          window.history.pushState({}, '', '/dashboard/products');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {productType === 'BUNDLE' ? 'רכיבי בנדל' : productType === 'VARIABLE' ? 'וריאציות' : 'סוג מוצר'}
                </h3>
                <ProductBasicInfo
                  productType={productType}
                  setProductType={setProductType}
                  productData={productData}
                  setProductData={setProductData}
                />
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">מדיה</h3>
                <ProductMedia
                  productImages={productImages}
                  setProductImages={setProductImages}
                  fileInputRef={fileInputRef}
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
            onSave={handleSaveProduct}
            onBack={handleBack}
            htmlToPlainText={htmlToPlainText}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;

import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getApiUrl } from '../../../../config/environment.js';
import { useTranslation } from 'react-i18next'
import { Heart, Share2, Star, ChevronLeft, ChevronRight, ZoomIn, Truck, Shield, RotateCcw, Award, X } from 'lucide-react'
import ProductRenderer from '../../../shared/components/ProductRenderer'
import ProductDiscountBadge from '../../../shared/components/ProductDiscountBadge'
import analyticsTracker from '../../../../utils/analyticsTracker'
import discountService from '../../../../services/discountService'
import cartService from '../../../../services/cartService'

const JupiterProductPage = ({ storeData }) => {
  const { t } = useTranslation()
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [pageStructure, setPageStructure] = useState(null)
  const [useCustomDesign, setUseCustomDesign] = useState(true)
  const [discountData, setDiscountData] = useState(null)
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [reviews] = useState([
    { id: 1, name: 'דני כהן', rating: 5, comment: 'מוצר מעולה! איכות גבוהה ושירות מהיר', date: '2024-01-15' },
    { id: 2, name: 'שרה לוי', rating: 4, comment: 'מאוד מרוצה מהקנייה. הגיע בזמן ובאיכות טובה', date: '2024-01-10' },
    { id: 3, name: 'יוסי אברהם', rating: 5, comment: 'בדיוק מה שחיפשתי! ממליץ בחום', date: '2024-01-05' }
  ])
  const imageRef = useRef(null)

  useEffect(() => {
    if (storeData && slug) {
      fetchProductData()
      fetchPageDesign()
      // Initialize cart service
      cartService.init(storeData.slug)
    }
  }, [storeData, slug])

  // Update selected variant when options change
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Find matching variant based on selected options
      const matchingVariant = product.variants.find(variant => {
        return variant.optionValues.every(optionValue => {
          return selectedOptions[optionValue.option.name] === optionValue.optionValue.value
        })
      })
      setSelectedVariant(matchingVariant)
    }
  }, [selectedOptions, product])

  const fetchPageDesign = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (
        import.meta.env.DEV 
          ? 'http://localhost:3001/api'
          : getApiUrl('')
      )
      
      const response = await fetch(`${apiUrl}/stores/${storeData.slug}/design/product-page`)
      if (response.ok) {
        const designData = await response.json()
        setPageStructure(designData)
      }
    } catch (error) {
      console.error('Error fetching page design:', error)
      setUseCustomDesign(false) // Fallback to original design
    }
  }

  const fetchProductData = async () => {
    try {
      setLoading(true)
      
      // Decode the slug in case it contains Hebrew characters
      const decodedSlug = decodeURIComponent(slug)
      console.log('🔍 Fetching product with slug:', decodedSlug)
      
      const apiUrl = import.meta.env.VITE_API_URL || (
        import.meta.env.DEV 
          ? 'http://localhost:3001/api'
          : getApiUrl('')
      )
      
      const fullUrl = `${apiUrl}/stores/${storeData.slug}/products/${encodeURIComponent(decodedSlug)}`
      console.log('📡 Full API URL:', fullUrl)
      
      const response = await fetch(fullUrl)
      
      if (response.ok) {
        const productData = await response.json()
        console.log('✅ Product data received:', productData)

        setProduct(productData)
        
        // Track product view
        if (productData) {
          analyticsTracker.trackProductView(
            productData.id,
            productData.name,
            productData.category?.name,
            productData.price
          )
        }
      } else {
        console.error('❌ API Response not OK:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Error response body:', errorText)
      }
      
    } catch (error) {
      console.error('Error fetching product data:', error)
      
      // Fallback to mock data
      const mockProduct = {
        id: 1,
        name: 'אוזניות אלחוטיות מקצועיות',
        slug: 'wireless-headphones',
        description: 'אוזניות אלחוטיות איכותיות עם ביטול רעשים פעיל, סוללה לעד 30 שעות ואיכות שמע מעולה. מתאימות לשימוש יומיומי, ספורט ועבודה מהבית.',
        price: 299,
        originalPrice: 399,
        sku: 'WH-001',
        category: 'אלקטרוניקה',
        inStock: true,
        stockQuantity: 15,
        rating: 4.5,
        reviewCount: 128,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
        ],
        options: [
          {
            name: 'צבע',
            type: 'color',
            values: [
              { name: 'שחור', value: '#000000' },
              { name: 'לבן', value: '#ffffff' },
              { name: 'כחול', value: '#3b82f6' }
            ]
          }
        ],
        specifications: {
          'משקל': '250 גרם',
          'חיבור': 'Bluetooth 5.0',
          'סוללה': '30 שעות',
          'ביטול רעשים': 'כן',
          'מיקרופון': 'כן'
        }
      }

      setProduct(mockProduct)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }))
  }

  const handleQuantityChange = async (newQuantity) => {
    setQuantity(newQuantity)
    
    // חישוב הנחות מחדש עם הכמות החדשה
    if (product && storeData) {
      await calculateProductDiscounts(newQuantity)
    }
  }

  const calculateProductDiscounts = async (qty = quantity) => {
    if (!product || !storeData) return
    
    setIsCalculatingPrice(true)
    try {
      const result = await discountService.getProductDiscounts(product, qty, storeData.slug)
      setDiscountData(result)
    } catch (error) {
      // Silently handle discount calculation errors - not critical for product display
      console.warn('לא ניתן לחשב הנחות (לא קריטי):', error.message)
      setDiscountData(null)
    } finally {
      setIsCalculatingPrice(false)
    }
  }

  // חישוב הנחות כשהמוצר נטען
  useEffect(() => {
    if (product && storeData) {
      calculateProductDiscounts()
    }
  }, [product, storeData])

  const handleAddToCart = async (qty) => {
    // Use the existing addToCart function
    const originalQuantity = quantity
    setQuantity(qty)
    addToCart()
    setQuantity(originalQuantity)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }

  const addToCart = async () => {
    console.log('🛒 addToCart function called!', { 
      inStock: product.inStock, 
      addingToCart, 
      productType: product.type,
      selectedVariant 
    })
    
    if (!product.inStock || addingToCart) {
      console.log('❌ Blocked: product not in stock or already adding')
      return
    }
    
    // Validate variant selection for variable products
    if (product.type === 'VARIABLE' && !selectedVariant) {
      console.log('❌ Blocked: variable product but no variant selected')
      alert('אנא בחר את כל האפשרויות הנדרשות')
      return
    }
    
    console.log('✅ Proceeding with add to cart...')
    setAddingToCart(true)
    
    try {
      let result
      
      if (product.type === 'BUNDLE') {
        // Handle bundle products with legacy method for now
        result = await cartService.addItemLegacy(product.id, {
          name: product.name,
          price: product.price,
          imageUrl: product.images[0],
          quantity: quantity,
          type: 'BUNDLE',
          bundleItems: product.bundleItems.map(bundleItem => ({
            productId: bundleItem.product.id,
            variantId: bundleItem.variant?.id,
            name: bundleItem.product.name,
            price: bundleItem.variant?.price || bundleItem.product.price,
            imageUrl: bundleItem.product.image,
            quantity: bundleItem.quantity,
            isOptional: bundleItem.isOptional,
            options: bundleItem.variant?.options || {}
          }))
        })
      } else {
        // Handle simple and variable products with API
        const currentPrice = selectedVariant?.price || product.price
        const currentImageUrl = product.images[0]
        
        result = await cartService.addItem(product.id, {
          variantId: selectedVariant?.id,
          quantity: quantity,
          selectedOptions: selectedOptions,
          skipApiCall: true, // Use legacy method for now until API is fully tested
          name: product.name,
          price: currentPrice,
          imageUrl: currentImageUrl
        })
      }
      
      if (result.success) {
        // Show success message and open side cart
        const message = selectedVariant 
          ? `${product.name} (${Object.values(selectedOptions).join(', ')}) נוסף לעגלה!`
          : `${product.name} נוסף לעגלה!`
        
        console.log('🛒 Dispatching openSideCart event:', message)
        
        // Dispatch event to open side cart
        window.dispatchEvent(new CustomEvent('openSideCart', {
          detail: { message }
        }))
        
        // Also try the old event name for backward compatibility
        window.dispatchEvent(new Event('openSideCart'))
        
        // Track add to cart event
        analyticsTracker.trackAddToCart(
          product.id,
          product.name,
          quantity,
          selectedVariant?.price || product.price,
          product.category?.name
        )
      } else {
        console.error('❌ Add to cart failed:', result.message)
        alert(result.message || 'שגיאה בהוספה לעגלה')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('שגיאה בהוספה לעגלה')
    } finally {
      setAddingToCart(false)
    }
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">טוען מוצר...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">מוצר לא נמצא</h1>
          <p className="text-gray-600 mb-6">המוצר שחיפשת לא קיים במערכת</p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            חזור למוצרים
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Image Zoom Modal */}
      {showImageZoom && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageZoom(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {useCustomDesign && pageStructure ? (
          // Use custom design from site builder
          <ProductRenderer 
            pageStructure={pageStructure}
            product={product}
            selectedOptions={selectedOptions}
            onOptionChange={handleOptionChange}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
          />
        ) : (
          // Enhanced professional design
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image with Zoom */}
              <div className="relative group">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg">
                  {product.images && product.images.length > 0 ? (
                    <>
                      <img
                        ref={imageRef}
                        src={product.images[selectedImage]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                        onClick={() => setShowImageZoom(true)}
                      />
                      {/* Zoom Icon */}
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-5 h-5 text-gray-700" />
                      </div>
                      {/* Navigation Arrows */}
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : product.images.length - 1)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => setSelectedImage(selectedImage < product.images.length - 1 ? selectedImage + 1 : 0)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-400">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                            <circle cx="9" cy="9" r="2"></circle>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">אין תמונה זמינה</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-3 rtl:space-x-reverse overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-blue-500 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-green-700 font-medium">אחריות מלאה</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-blue-700 font-medium">משלוח מהיר</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-purple-700 font-medium">החזרה חינם</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                <Link to="/" className="hover:text-gray-700 transition-colors">בית</Link>
                <ChevronLeft className="w-4 h-4 mx-2 text-gray-400" />
                <Link to="/products" className="hover:text-gray-700 transition-colors">{product.category || 'מוצרים'}</Link>
                <ChevronLeft className="w-4 h-4 mx-2 text-gray-400" />
                <span className="text-gray-900 font-medium">{product.name}</span>
              </nav>

              {/* Product Title & Actions */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="font-medium">מק״ט:</span>
                      <span className="mr-1 font-mono bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                    </span>
                    {product.rating && (
                      <div className="flex items-center">
                        <div className="flex items-center ml-1">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-gray-600">({product.reviewCount || reviews.length} ביקורות)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-full border-2 transition-all duration-200 ${
                      isWishlisted 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 rounded-full border-2 border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                {/* Discount Badges */}
                <ProductDiscountBadge 
                  product={product}
                  quantity={quantity}
                  storeSlug={storeData.slug}
                />

                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  {/* Current Price */}
                  <div className="flex flex-col">
                    <span className={`text-4xl font-bold ${
                      discountData && discountData.total < discountData.subtotal 
                        ? 'text-green-600' 
                        : 'text-gray-900'
                    }`}>
                      {isCalculatingPrice ? (
                        <div className="flex items-center">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-2"></div>
                          מחשב...
                        </div>
                      ) : discountData && discountData.success ? (
                        formatPrice(discountData.total)
                      ) : (
                        formatPrice((selectedVariant?.price || product.price) * quantity)
                      )}
                    </span>
                    
                    {/* Original Price (if discounted) */}
                    {discountData && discountData.total < discountData.subtotal && (
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(discountData.subtotal)}
                      </span>
                    )}
                  </div>

                  {/* Original Product Discount (if exists) */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        חסכון {formatPrice(product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                </div>

                {/* Discount Details */}
                {discountData && discountData.appliedDiscounts && discountData.appliedDiscounts.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-medium text-green-800 flex items-center">
                      <Award className="w-4 h-4 ml-1" />
                      הנחות פעילות:
                    </h4>
                    {discountData.appliedDiscounts.map((discount, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-green-700">
                          {discount.name || discountService.getDiscountMessage(discount)}
                        </span>
                        <span className="font-medium text-green-800">
                          -{formatPrice(discount.amount)}
                        </span>
                      </div>
                    ))}
                    
                    {discountData.savings > 0 && (
                      <div className="border-t border-green-300 pt-2 mt-2">
                        <div className="flex justify-between items-center font-medium text-green-800">
                          <span>סה"כ חיסכון:</span>
                          <span>{formatPrice(discountData.savings)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
                
              {/* Stock Status */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-50 p-4 rounded-xl">
                {selectedVariant ? (
                  <>
                    <div className={`w-3 h-3 rounded-full ${selectedVariant.inventoryQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${selectedVariant.inventoryQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedVariant.inventoryQuantity > 0 ? `במלאי (${selectedVariant.inventoryQuantity} יחידות)` : 'אזל מהמלאי'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? `במלאי (${product.stockQuantity} יחידות)` : 'אזל מהמלאי'}
                    </span>
                  </>
                )}
              </div>

              {/* Product Options */}
              {product.options && product.options.length > 0 && product.options.map((option) => (
                <div key={option.name} className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-900">
                    {option.name}
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  
                  {option.type === 'color' && (
                    <div className="flex space-x-3 rtl:space-x-reverse">
                      {option.values.map((value) => (
                        <button
                          key={value.name || value.value}
                          onClick={() => setSelectedOptions({...selectedOptions, [option.name]: value.name || value.value})}
                          className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${
                            selectedOptions[option.name] === (value.name || value.value) 
                              ? 'border-blue-500 scale-110 shadow-lg' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: value.value || value.colorCode }}
                          title={value.name || value.value}
                        />
                      ))}
                    </div>
                  )}
                  
                  {(option.type === 'text' || option.type === 'select' || !option.type) && (
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((value) => (
                        <button
                          key={value.name || value.value}
                          onClick={() => setSelectedOptions({...selectedOptions, [option.name]: value.name || value.value})}
                          className={`px-6 py-3 border-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selectedOptions[option.name] === (value.name || value.value)
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          {value.name || value.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Variant Selection for Variable Products */}
              {product.type === 'VARIABLE' && product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <Award className="w-4 h-4 ml-1" />
                      מידע על הוריאציה הנבחרת:
                    </h4>
                    {selectedVariant ? (
                      <div className="space-y-1 text-sm text-blue-700">
                        <div>מחיר: {formatPrice(selectedVariant.price || product.price)}</div>
                        {selectedVariant.sku && <div>מק״ט: {selectedVariant.sku}</div>}
                        <div>במלאי: {selectedVariant.inventoryQuantity || 0} יחידות</div>
                        <div className="text-xs text-blue-600 mt-2">
                          אפשרויות: {Object.entries(selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-blue-700">
                        אנא בחר את כל האפשרויות הנדרשות
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900">כמות</label>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <span className="text-xl font-bold">-</span>
                  </button>
                  <span className="w-20 text-center font-bold text-xl bg-gray-50 py-3 rounded-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-3">
                <button
                  onClick={addToCart}
                  disabled={!product.inStock || addingToCart || (product.type === 'VARIABLE' && !selectedVariant)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 text-lg font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block ml-2 rtl:ml-0 rtl:mr-2"></div>
                      מוסיף לעגלה...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 inline-block ml-2 rtl:ml-0 rtl:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 004 16h16M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                      </svg>
                      {!product.inStock 
                        ? 'אזל מהמלאי' 
                        : product.type === 'VARIABLE' && !selectedVariant
                          ? 'בחר אפשרויות'
                          : 'הוסף לעגלה'
                      }
                    </>
                  )}
                </button>
              </div>

              {/* Product Details Tabs */}
              <div className="mt-8">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 rtl:space-x-reverse">
                    {['description', 'specifications', 'reviews'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab === 'description' && 'תיאור'}
                        {tab === 'specifications' && 'מפרט טכני'}
                        {tab === 'reviews' && 'ביקורות'}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="py-6">
                  {activeTab === 'description' && (
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
                    </div>
                  )}

                  {activeTab === 'specifications' && product.specifications && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-3 border-b border-gray-200 last:border-0">
                            <dt className="font-semibold text-gray-900">{key}:</dt>
                            <dd className="text-gray-700">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                          <div className="flex items-center">
                            {renderStars(product.rating || 4.5)}
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{product.rating || 4.5}</span>
                          <span className="text-gray-600">מתוך 5 כוכבים</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {product.reviewCount || reviews.length} ביקורות
                        </span>
                      </div>

                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {review.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{review.name}</p>
                                  <div className="flex items-center">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bundle Items */}
              {product.type === 'BUNDLE' && product.bundleItems && product.bundleItems.length > 0 && (
                <div className="space-y-4 bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Award className="w-6 h-6 ml-2 text-blue-600" />
                    מה כלול בבנדל?
                  </h3>
                  <div className="space-y-3">
                    {product.bundleItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                          {item.product.image && (
                            <img 
                              src={item.product.image} 
                              alt={item.product.name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                            {item.variant && (
                              <p className="text-sm text-gray-500">
                                {item.variant.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                              </p>
                            )}
                            <p className="text-sm text-blue-600 font-medium">כמות: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">{formatPrice(item.product.price)}</p>
                          {item.isOptional && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">אופציונלי</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JupiterProductPage
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProductRenderer from '../components/ProductRenderer'
import ProductDiscountBadge from '../components/ProductDiscountBadge'
import analyticsTracker from '../../utils/analyticsTracker'
import discountService from '../../services/discountService'

const ProductPage = ({ storeData }) => {
  const { t } = useTranslation()
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [pageStructure, setPageStructure] = useState(null)
  const [useCustomDesign, setUseCustomDesign] = useState(true)
  const [discountData, setDiscountData] = useState(null)
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)

  useEffect(() => {
    if (storeData && slug) {
      fetchProductData()
      fetchPageDesign()
    }
  }, [storeData, slug])

  const fetchPageDesign = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/stores/${storeData.slug}/design/product-page`)
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
      
      const response = await fetch(`http://localhost:3001/api/stores/${storeData.slug}/products/${slug}`)
      
      if (response.ok) {
        const productData = await response.json()
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
      }
      
    } catch (error) {
      console.error('Error fetching product data:', error)
      
      // Fallback to mock data
      const mockProduct = {
        id: 1,
        name: 'אוזניות אלחוטיות מקצועיות',
        slug: 'wireless-headphones',
        description: 'אוזניות אלחוטיות איכותיות עם ביטול רעשים פעיל, סוללה לעד 30 שעות ואיכות שמע מעולה.',
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
      console.error('שגיאה בחישוב הנחות מוצר:', error)
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

  const addToCart = () => {
    if (!product.inStock) return
    
    const cartKey = `cart_${storeData.slug}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    
    if (product.type === 'BUNDLE') {
      // For bundle products, add each item separately but mark them as part of a bundle
      const bundleId = `bundle_${Date.now()}`
      
      product.bundleItems.forEach(bundleItem => {
        if (bundleItem.isOptional) return // Skip optional items for now
        
        const existingItemIndex = existingCart.findIndex(item => 
          item.id === bundleItem.product.id && 
          item.variantId === bundleItem.variant?.id
        )
        
        const itemQuantity = bundleItem.quantity * quantity
        
        if (existingItemIndex > -1) {
          existingCart[existingItemIndex].quantity += itemQuantity
        } else {
          existingCart.push({
            id: bundleItem.product.id,
            name: bundleItem.product.name,
            price: bundleItem.product.price,
            imageUrl: bundleItem.product.image,
            quantity: itemQuantity,
            variantId: bundleItem.variant?.id || null,
            variantOptions: bundleItem.variant?.options || null,
            bundleId: bundleId,
            bundleName: product.name,
            storeSlug: storeData.slug
          })
        }
      })
      
      alert(`${product.name} (בנדל) נוסף לעגלה!`)
    } else {
      // Regular product logic
      const existingItemIndex = existingCart.findIndex(item => item.id === product.id)
      
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += quantity
      } else {
        existingCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.images[0],
          quantity: quantity,
          options: selectedOptions,
          storeSlug: storeData.slug
        })
      }
      
      alert(`${product.name} נוסף לעגלה!`)
    }
    
    localStorage.setItem(cartKey, JSON.stringify(existingCart))
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Track add to cart event
    analyticsTracker.trackAddToCart(
      product.id,
      product.name,
      quantity,
      product.price,
      product.category?.name
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">מוצר לא נמצא</h1>
          <p className="text-gray-600">המוצר שחיפשת לא קיים במערכת</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
          // Fallback to original design
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 rtl:space-x-reverse">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-200'
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
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500">
              <span>בית</span>
              <i className="ri-arrow-left-s-line mx-2 rtl:rotate-180"></i>
              <span>{product.category}</span>
              <i className="ri-arrow-left-s-line mx-2 rtl:rotate-180"></i>
              <span className="text-gray-900">{product.name}</span>
            </nav>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="text-sm text-gray-500">מק״ט: {product.sku}</div>
            </div>

            {/* Price */}
            <div className="space-y-3">
              {/* Discount Badges */}
              <ProductDiscountBadge 
                product={product}
                quantity={quantity}
                storeSlug={storeData.slug}
              />

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {/* Current Price */}
                <div className="flex flex-col">
                  <span className={`text-3xl font-bold ${
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
                      formatPrice(product.price * quantity)
                    )}
                  </span>
                  
                  {/* Original Price (if discounted) */}
                  {discountData && discountData.total < discountData.subtotal && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(discountData.subtotal)}
                    </span>
                  )}
                </div>

                {/* Original Product Discount (if exists) */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      חסכון {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Discount Details */}
              {discountData && discountData.appliedDiscounts && discountData.appliedDiscounts.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium text-green-800 flex items-center">
                    <i className="ri-discount-percent-line ml-1"></i>
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
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <i className={`ri-checkbox-circle-line ${product.inStock ? 'text-green-600' : 'text-red-600'}`}></i>
                <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? `במלאי (${product.stockQuantity} יחידות)` : 'אזל מהמלאי'}
                </span>
              </div>
            </div>

            {/* Product Options */}
            {product.options && product.options.map((option) => (
              <div key={option.name} className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  {option.name}
                </label>
                
                {option.type === 'color' && (
                  <div className="flex space-x-3 rtl:space-x-reverse">
                    {option.values.map((value) => (
                      <button
                        key={value.name}
                        onClick={() => setSelectedOptions({...selectedOptions, [option.name]: value.name})}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedOptions[option.name] === value.name ? 'border-primary-600' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: value.value }}
                        title={value.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">כמות</label>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <i className="ri-subtract-line"></i>
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="ri-shopping-cart-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                {product.inStock ? 'הוסף לעגלה' : 'אזל מהמלאי'}
              </button>
            </div>

            {/* Product Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">תיאור המוצר</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Bundle Items */}
            {product.type === 'BUNDLE' && product.bundleItems && product.bundleItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">מה כלול בבנדל?</h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  {product.bundleItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {item.product.image && (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          {item.variant && (
                            <p className="text-sm text-gray-500">
                              {item.variant.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-blue-600">כמות: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{formatPrice(item.product.price)}</p>
                        {item.isOptional && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">אופציונלי</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">מפרט טכני</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="font-medium text-gray-900">{key}:</dt>
                        <dd className="text-gray-600">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductPage

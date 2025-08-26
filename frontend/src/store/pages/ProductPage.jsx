import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProductRenderer from '../components/ProductRenderer'

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

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity)
  }

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
    
    localStorage.setItem(cartKey, JSON.stringify(existingCart))
    window.dispatchEvent(new Event('cartUpdated'))
    alert(`${product.name} נוסף לעגלה!`)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">מוצר לא נמצא</h1>
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
            <div className="space-y-2">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
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
        </div>
        )}
      </div>
    </div>
  )
}

export default ProductPage

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ProductCard = ({ product, storeSlug, index = 0 }) => {
  const { t } = useTranslation()

  const addToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.inStock) return
    
    // Get existing cart for this store
    const cartKey = `cart_${storeSlug}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    
    // Check if product already exists
    const existingItemIndex = existingCart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex > -1) {
      // Update quantity
      existingCart[existingItemIndex].quantity += 1
    } else {
      // Add new item
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        storeSlug: storeSlug
      })
    }
    
    // Save to localStorage
    localStorage.setItem(cartKey, JSON.stringify(existingCart))
    
    // Dispatch event to update cart count
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Show success message (you can replace with a toast notification)
    alert(`${product.name} נוסף לעגלה!`)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="ri-star-fill text-yellow-400"></i>)
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="ri-star-half-fill text-yellow-400"></i>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line text-gray-300"></i>)
    }

    return stars
  }

  return (
    <div
      className="group modern-card bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100"
      style={{animationDelay: `${index * 150}ms`}}
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Sale Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
          )}
          
          {/* Out of Stock Badge */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold">
                אזל מהמלאי
              </span>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-full shadow-lg hover:bg-white transition-colors">
              <i className="ri-heart-line"></i>
            </button>
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-gray-500 text-sm mr-2 rtl:mr-0 rtl:ml-2">
              ({product.reviewCount})
            </span>
          </div>
        )}
        
        {/* Product Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Category */}
        <p className="text-gray-600 text-sm mb-4">
          {product.category}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-2xl font-black text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={addToCart}
          disabled={!product.inStock}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            product.inStock
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.inStock ? 'הוסף לעגלה' : 'אזל מהמלאי'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard

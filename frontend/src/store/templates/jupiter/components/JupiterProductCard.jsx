import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingBag, Star, Eye, Zap, Gift, Tag } from 'lucide-react'

const JupiterProductCard = ({ product, storeSlug, index = 0 }) => {
  const { t } = useTranslation()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const addToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.inStock || isAddingToCart) return
    
    setIsAddingToCart(true)
    
    // Get existing cart for this store
    const cartKey = `cart_${storeSlug}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    
    try {
      if (product.type === 'BUNDLE' && product.bundleItems) {
        // For bundle products, add each item separately but mark them as part of a bundle
        const bundleId = `bundle_${Date.now()}`
        
        product.bundleItems.forEach(bundleItem => {
          if (bundleItem.isOptional) return // Skip optional items for now
          
          const existingItemIndex = existingCart.findIndex(item => 
            item.id === bundleItem.product.id && 
            item.variantId === bundleItem.variant?.id
          )
          
          if (existingItemIndex > -1) {
            existingCart[existingItemIndex].quantity += bundleItem.quantity
          } else {
            existingCart.push({
              id: bundleItem.product.id,
              name: bundleItem.product.name,
              price: bundleItem.product.price,
              imageUrl: bundleItem.product.image,
              quantity: bundleItem.quantity,
              variantId: bundleItem.variant?.id || null,
              variantOptions: bundleItem.variant?.options || null,
              bundleId: bundleId,
              bundleName: product.name,
              storeSlug: storeSlug
            })
          }
        })
        
        // Dispatch event to open side cart
        window.dispatchEvent(new CustomEvent('openSideCart', {
          detail: { message: `${product.name} (בנדל) נוסף לעגלה בהצלחה! 🎉` }
        }))
      } else {
        // Regular product logic
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
        
        // Dispatch event to open side cart
        window.dispatchEvent(new CustomEvent('openSideCart', {
          detail: { message: `${product.name} נוסף לעגלה בהצלחה! 🛒` }
        }))
      }
      
      // Save to localStorage
      localStorage.setItem(cartKey, JSON.stringify(existingCart))
      
      // Dispatch event to update cart count
      window.dispatchEvent(new Event('cartUpdated'))
      
      // Small delay for better UX
      setTimeout(() => {
        setIsAddingToCart(false)
      }, 800)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }

  const toggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    // Here you would typically save to wishlist API
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
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

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2 animate-fade-in"
      style={{animationDelay: `${index * 100}ms`}}
    >
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.slug}`}>
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          </div>
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex flex-col gap-2">
          {/* Sale Badge */}
          {discountPercentage > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse-glow">
              <Tag className="w-3 h-3 inline ml-1" />
              -{discountPercentage}%
            </div>
          )}
          
          {/* Bundle Badge */}
          {product.type === 'BUNDLE' && (
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              <Gift className="w-3 h-3 inline ml-1" />
              בנדל
            </div>
          )}
          
          {/* Hot Badge */}
          {product.isHot && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-bounce-subtle">
              <Zap className="w-3 h-3 inline ml-1" />
              חם!
            </div>
          )}
        </div>
        
        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold shadow-xl">
              אזל מהמלאי
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex flex-col gap-2">
            <button 
              onClick={toggleWishlist}
              className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                isWishlisted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            
            <Link 
              to={`/products/${product.slug}`}
              className="p-2.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Add to Cart (Bottom) */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <button
            onClick={addToCart}
            disabled={!product.inStock || isAddingToCart}
            className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm ${
              product.inStock
                ? isAddingToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-white/95 text-gray-900 hover:bg-white hover:shadow-xl'
                : 'bg-gray-400/80 text-white cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                נוסף...
              </div>
            ) : product.inStock ? (
              <div className="flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 ml-2" />
                הוסף מהר
              </div>
            ) : (
              'אזל מהמלאי'
            )}
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-gray-500 text-sm mr-2 rtl:mr-0 rtl:ml-2 font-medium">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        
        {/* Product Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {/* Category */}
        {product.category && (
          <p className="text-gray-500 text-sm mb-3 font-medium">
            {product.category}
          </p>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-2xl font-black text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {discountPercentage > 0 && (
            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-bold">
              חסכון {formatPrice(product.originalPrice - product.price)}
            </div>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={addToCart}
          disabled={!product.inStock || isAddingToCart}
          className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 ripple ${
            product.inStock
              ? isAddingToCart
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
              מוסיף לעגלה...
            </div>
          ) : product.inStock ? (
            <div className="flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 ml-2" />
              הוסף לעגלה
            </div>
          ) : (
            'אזל מהמלאי'
          )}
        </button>
      </div>
    </div>
  )
}

export default JupiterProductCard
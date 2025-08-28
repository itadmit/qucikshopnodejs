import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Plus, Minus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import analyticsTracker from '../../utils/analyticsTracker'
import CouponInput from './CouponInput'
import discountService from '../../services/discountService'

const SideCart = ({ isOpen, onClose, storeData }) => {
  const { t } = useTranslation()
  const [cartItems, setCartItems] = useState([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [discountData, setDiscountData] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isCalculatingDiscounts, setIsCalculatingDiscounts] = useState(false)

  useEffect(() => {
    if (storeData && isOpen) {
      loadCartItems()
    }
  }, [storeData, isOpen])

  useEffect(() => {
    // Listen for cart updates
    const handleCartUpdate = () => {
      if (storeData) {
        loadCartItems()
      }
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [storeData])

  const loadCartItems = async () => {
    if (!storeData) return
    const cartKey = `cart_${storeData.slug}`
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    setCartItems(cart)
    
    // חישוב הנחות אוטומטיות
    if (cart.length > 0) {
      await calculateDiscounts(cart)
    } else {
      setDiscountData(null)
      setAppliedCoupon(null)
    }
  }

  const calculateDiscounts = async (cart, couponCode = appliedCoupon) => {
    if (!storeData || cart.length === 0) return
    
    setIsCalculatingDiscounts(true)
    try {
      const result = await discountService.calculateDiscounts(
        { items: cart },
        storeData.slug,
        couponCode
      )
      
      if (result.success) {
        setDiscountData(result)
      }
    } catch (error) {
      console.error('שגיאה בחישוב הנחות:', error)
    } finally {
      setIsCalculatingDiscounts(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    
    setCartItems(updatedCart)
    const cartKey = `cart_${storeData.slug}`
    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
    
    // חישוב הנחות מחדש
    await calculateDiscounts(updatedCart)
  }

  const removeItem = async (itemId) => {
    // מציאת הפריט שמוסר
    const itemToRemove = cartItems.find(item => item.id === itemId);
    
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    const cartKey = `cart_${storeData.slug}`
    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
    
    // מעקב אחר הסרה מהעגלה
    if (itemToRemove) {
      analyticsTracker.trackRemoveFromCart(
        itemToRemove.id,
        itemToRemove.name,
        itemToRemove.quantity,
        itemToRemove.price,
        itemToRemove.category
      );
    }
    
    // חישוב הנחות מחדש
    if (updatedCart.length > 0) {
      await calculateDiscounts(updatedCart)
    } else {
      setDiscountData(null)
      setAppliedCoupon(null)
    }
  }

  const getTotalPrice = () => {
    // אם יש נתוני הנחות, נשתמש בהם
    if (discountData && discountData.success) {
      return discountData.total
    }
    // אחרת חישוב בסיסי
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleDiscountApplied = async (discountResult, couponCode) => {
    setDiscountData(discountResult)
    setAppliedCoupon(couponCode)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }

  // Load shipping settings
  const getShippingSettings = () => {
    const savedSettings = localStorage.getItem('shippingSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.general || { freeShippingThreshold: 200, defaultShippingRate: 15 };
    }
    return { freeShippingThreshold: 200, defaultShippingRate: 15 };
  };

  // Free shipping calculation
  const shippingSettings = getShippingSettings();
  const FREE_SHIPPING_THRESHOLD = shippingSettings.freeShippingThreshold;
  const SHIPPING_RATE = shippingSettings.defaultShippingRate;
  const currentTotal = getTotalPrice()
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - currentTotal)
  const freeShippingProgress = Math.min(100, (currentTotal / FREE_SHIPPING_THRESHOLD) * 100)
  const hasEarnedFreeShipping = currentTotal >= FREE_SHIPPING_THRESHOLD

  // Celebration effect when reaching free shipping
  useEffect(() => {
    if (hasEarnedFreeShipping && cartItems.length > 0) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [hasEarnedFreeShipping, cartItems.length])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Side Cart */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 ml-2" />
            עגלת קניות
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {cartItems.length > 0 && (
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Truck className={`w-4 h-4 ml-2 ${hasEarnedFreeShipping ? 'text-green-600' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${hasEarnedFreeShipping ? 'text-green-700' : 'text-blue-700'}`}>
                  {hasEarnedFreeShipping ? 'זכית במשלוח חינם!' : 'משלוח חינם'}
                </span>
              </div>
              {!hasEarnedFreeShipping && (
                <span className="text-xs text-gray-600">
                  מעל {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out animate-progress-fill ${
                    hasEarnedFreeShipping 
                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                      : 'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
              
              {/* Progress Text */}
              <div className="mt-2 text-center">
                {hasEarnedFreeShipping ? (
                  <span className={`text-sm font-medium text-green-700 flex items-center justify-center ${showCelebration ? 'animate-celebration' : ''}`}>
                    <Truck className="w-4 h-4 ml-1" />
                    🎉 משלוח חינם זמין! 🎉
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">
                    הוסף עוד <span className="font-semibold text-blue-600">{formatPrice(amountForFreeShipping)}</span> לקבלת משלוח חינם
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">העגלה ריקה</h3>
              <p className="text-gray-500 mb-6">הוסף מוצרים לעגלה כדי להמשיך</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                המשך קניות
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 space-x-reverse bg-gray-50 rounded-lg p-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)}
                      </p>
                      
                      {/* Options */}
                      {item.options && Object.keys(item.options).length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.entries(item.options).map(([key, value]) => (
                            <span key={key} className="ml-2">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="mx-3 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 space-y-4">
                {/* Coupon Input */}
                <CouponInput
                  cart={{ items: cartItems }}
                  storeSlug={storeData.slug}
                  onDiscountApplied={handleDiscountApplied}
                  appliedCoupon={appliedCoupon}
                />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm">
                    <span>סכום ביניים:</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>

                  {/* Discounts */}
                  {discountData && discountData.appliedDiscounts && discountData.appliedDiscounts.length > 0 && (
                    <div className="space-y-1">
                      {discountData.appliedDiscounts.map((discount, index) => (
                        <div key={index} className="flex justify-between items-center text-sm text-green-600">
                          <span className="flex items-center">
                            <i className="ri-discount-percent-line ml-1"></i>
                            {discount.name || discountService.getDiscountMessage(discount)}
                          </span>
                          <span>-{formatPrice(discount.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between items-center text-sm">
                    <span>משלוח:</span>
                    <span className={discountData?.shipping === 0 ? 'text-green-600' : ''}>
                      {discountData?.shipping === 0 ? 'חינם' : formatPrice(discountData?.shipping || SHIPPING_RATE)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                    <span>סה"כ לתשלום:</span>
                    <span className="flex items-center">
                      {isCalculatingDiscounts && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-2"></div>
                      )}
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>

                  {/* Savings Display */}
                  {discountData && discountData.savings > 0 && (
                    <div className="text-center text-sm text-green-600 font-medium bg-green-50 rounded-lg p-2">
                      🎉 חסכת {formatPrice(discountData.savings)} בהזמנה זו!
                    </div>
                  )}
                </div>

                {/* Shipping Info */}
                <div className={`text-sm p-3 rounded-lg border ${
                  hasEarnedFreeShipping 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  <div className="flex items-center justify-center">
                    <Truck className="w-4 h-4 ml-1" />
                    {hasEarnedFreeShipping ? (
                      <span className="font-medium">משלוח חינם כלול!</span>
                    ) : (
                      <span>משלוח: {formatPrice(SHIPPING_RATE)} (חינם מעל {formatPrice(FREE_SHIPPING_THRESHOLD)})</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors block"
                  >
                    צפה בעגלה
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors block"
                  >
                    המשך לתשלום
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SideCart 
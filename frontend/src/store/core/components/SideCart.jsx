import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  X, Plus, Minus, ShoppingBag, Trash2, Truck, 
  Gift, Tag, Sparkles, ArrowRight, CreditCard,
  Shield, Clock, Star
} from 'lucide-react'
import analyticsTracker from '../../../utils/analyticsTracker'
import CouponInput from './CouponInput'
import discountService from '../../../services/discountService'

const SideCart = ({ isOpen, onClose, storeData }) => {
  const { t } = useTranslation()
  const [cartItems, setCartItems] = useState([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [discountData, setDiscountData] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isCalculatingDiscounts, setIsCalculatingDiscounts] = useState(false)
  const [animatingItems, setAnimatingItems] = useState(new Set())
  const [removingItems, setRemovingItems] = useState(new Set())

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

    // Add animation
    setAnimatingItems(prev => new Set([...prev, itemId]))
    setTimeout(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }, 300)

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
    
    // Add remove animation
    setRemovingItems(prev => new Set([...prev, itemId]))
    
    setTimeout(() => {
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
        calculateDiscounts(updatedCart)
      } else {
        setDiscountData(null)
        setAppliedCoupon(null)
      }
      
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }, 300)
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
      <div className={`fixed top-0 left-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ShoppingBag className="w-6 h-6 ml-2 text-blue-600" />
            עגלת קניות
            {cartItems.length > 0 && (
              <span className="mr-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {cartItems.length}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {cartItems.length > 0 && (
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Truck className={`w-5 h-5 ml-2 ${hasEarnedFreeShipping ? 'text-green-600' : 'text-blue-600'}`} />
                <span className={`text-sm font-bold ${hasEarnedFreeShipping ? 'text-green-700' : 'text-blue-700'}`}>
                  {hasEarnedFreeShipping ? '🎉 זכית במשלוח חינם!' : 'משלוח חינם'}
                </span>
              </div>
              {!hasEarnedFreeShipping && (
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                  מעל {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${
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
                  <span className={`text-sm font-bold text-green-700 flex items-center justify-center ${showCelebration ? 'animate-bounce' : ''}`}>
                    <Sparkles className="w-4 h-4 ml-1" />
                    משלוח חינם זמין! 🚚✨
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">
                    הוסף עוד <span className="font-bold text-blue-600">{formatPrice(amountForFreeShipping)}</span> לקבלת משלוח חינם
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
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">העגלה ריקה</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                הוסף מוצרים לעגלה כדי להמשיך<br />
                ותיהנה ממבצעים מיוחדים!
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                התחל קניות
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center space-x-4 space-x-reverse bg-gray-50 rounded-xl p-4 transition-all duration-300 ${
                      animatingItems.has(item.id) ? 'scale-105 shadow-lg' : ''
                    } ${
                      removingItems.has(item.id) ? 'opacity-0 scale-95 -translate-x-full' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm font-semibold text-blue-600 mb-2">
                        {formatPrice(item.price)}
                      </p>
                      
                      {/* Options/Variants */}
                      {item.options && Object.keys(item.options).length > 0 && (
                        <div className="text-xs text-gray-500 mb-2 bg-white px-2 py-1 rounded-lg">
                          {Object.entries(item.options).map(([key, value]) => (
                            <span key={key} className="ml-2 rtl:ml-0 rtl:mr-2">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Bundle Info */}
                      {item.bundleId && item.bundleName && (
                        <div className="text-xs text-purple-600 mb-2 flex items-center bg-purple-50 px-2 py-1 rounded-lg">
                          <Gift className="w-3 h-3 ml-1 rtl:ml-0 rtl:mr-1" />
                          חלק מבנדל: {item.bundleName}
                        </div>
                      )}
                      
                      {/* Variant SKU */}
                      {item.sku && (
                        <div className="text-xs text-gray-400 mb-2">
                          מק״ט: {item.sku}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="mx-4 text-sm font-bold min-w-[2rem] text-center bg-white px-3 py-1 rounded-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                {/* Coupon Input */}
                <CouponInput
                  cart={{ items: cartItems }}
                  storeSlug={storeData.slug}
                  onDiscountApplied={handleDiscountApplied}
                  appliedCoupon={appliedCoupon}
                />

                {/* Price Breakdown */}
                <div className="space-y-3 bg-white rounded-xl p-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">סכום ביניים:</span>
                    <span className="font-semibold">{formatPrice(getSubtotal())}</span>
                  </div>

                  {/* Discounts */}
                  {discountData && discountData.appliedDiscounts && discountData.appliedDiscounts.length > 0 && (
                    <div className="space-y-2 border-t border-gray-100 pt-2">
                      {discountData.appliedDiscounts.map((discount, index) => (
                        <div key={index} className="flex justify-between items-center text-sm text-green-600">
                          <span className="flex items-center">
                            <Tag className="w-4 h-4 ml-1" />
                            {discount.name || discountService.getDiscountMessage(discount)}
                          </span>
                          <span className="font-semibold">-{formatPrice(discount.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-2">
                    <span className="text-gray-600 flex items-center">
                      <Truck className="w-4 h-4 ml-1" />
                      משלוח:
                    </span>
                    <span className={`font-semibold ${discountData?.shipping === 0 || hasEarnedFreeShipping ? 'text-green-600' : ''}`}>
                      {discountData?.shipping === 0 || hasEarnedFreeShipping ? 'חינם 🎉' : formatPrice(discountData?.shipping || SHIPPING_RATE)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-bold border-t-2 border-gray-200 pt-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                    <span>סה"כ לתשלום:</span>
                    <span className="flex items-center text-blue-600">
                      {isCalculatingDiscounts && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-2"></div>
                      )}
                      {formatPrice(getTotalPrice() + (hasEarnedFreeShipping ? 0 : SHIPPING_RATE))}
                    </span>
                  </div>

                  {/* Savings Display */}
                  {discountData && discountData.savings > 0 && (
                    <div className="text-center text-sm text-green-600 font-bold bg-green-50 rounded-xl p-3 border border-green-200">
                      <Sparkles className="w-4 h-4 inline ml-1" />
                      חסכת {formatPrice(discountData.savings)} בהזמנה זו! 🎉
                    </div>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <span className="text-green-700 font-medium">תשלום מאובטח</span>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <span className="text-blue-700 font-medium">משלוח מהיר</span>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <Star className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <span className="text-purple-700 font-medium">שירות מעולה</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-xl text-center font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    צפה בעגלה המלאה
                    <ArrowRight className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl text-center font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <CreditCard className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
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
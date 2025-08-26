import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const CartPage = ({ storeData }) => {
  const { t } = useTranslation()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (storeData) {
      loadCartItems()
    }
    setLoading(false)
  }, [storeData])

  const loadCartItems = () => {
    const cartKey = `cart_${storeData.slug}`
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    setCartItems(cart)
  }

  const updateQuantity = (itemId, newQuantity) => {
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
  }

  const removeItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    const cartKey = `cart_${storeData.slug}`
    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const clearCart = () => {
    setCartItems([])
    const cartKey = `cart_${storeData.slug}`
    localStorage.removeItem(cartKey)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    return subtotal > 200 ? 0 : 25 // Free shipping over 200 ILS
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">עגלת הקניות</h1>
          <nav className="text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">בית</Link>
            <i className="ri-arrow-left-s-line mx-2 rtl:rotate-180"></i>
            <span className="text-gray-900">עגלת קניות</span>
          </nav>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-shopping-cart-line text-4xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">העגלה ריקה</h2>
            <p className="text-gray-600 mb-8">נראה שעדיין לא הוספת מוצרים לעגלה</p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              המשך קנייה
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    פריטים בעגלה ({cartItems.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <i className="ri-delete-bin-line ml-1 rtl:ml-0 rtl:mr-1"></i>
                    רוקן עגלה
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        
                        {/* Options */}
                        {item.options && Object.entries(item.options).length > 0 && (
                          <div className="text-sm text-gray-500 mb-2">
                            {Object.entries(item.options).map(([key, value]) => (
                              <span key={key} className="ml-4 rtl:ml-0 rtl:mr-4 first:mr-0 rtl:first:mr-0 rtl:first:ml-0">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                            >
                              <i className="ri-subtract-line text-sm"></i>
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                            >
                              <i className="ri-add-line text-sm"></i>
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-left rtl:text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPrice(item.price)} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="הסר מוצר"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">סיכום הזמנה</h3>
                
                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">סכום ביניים:</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">משלוח:</span>
                    <span className="font-medium">
                      {calculateShipping() === 0 ? (
                        <span className="text-green-600">חינם</span>
                      ) : (
                        formatPrice(calculateShipping())
                      )}
                    </span>
                  </div>

                  {/* Free Shipping Notice */}
                  {calculateShipping() > 0 && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                      הוסף עוד {formatPrice(200 - calculateSubtotal())} לקבלת משלוח חינם
                    </div>
                  )}

                  <hr className="border-gray-200" />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>סה״כ לתשלום:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 text-lg font-semibold mt-6 block text-center rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <i className="ri-secure-payment-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                  המשך לתשלום
                </Link>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 mt-3 block text-center rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  המשך קנייה
                </Link>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                    <i className="ri-shield-check-line text-green-600"></i>
                    <span>תשלום מאובטח ובטוח</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage

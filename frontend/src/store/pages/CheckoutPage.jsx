import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const CheckoutPage = ({ storeData }) => {
  const { t } = useTranslation()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'credit-card',
    notes: ''
  })

  useEffect(() => {
    if (storeData) {
      const cartKey = `cart_${storeData.slug}`
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
      setCartItems(cart)
    }
  }, [storeData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
    return subtotal > 200 ? 0 : 25
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        storeSlug: storeData.slug,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        items: cartItems,
        totals: {
          subtotal: calculateSubtotal(),
          shipping: calculateShipping(),
          total: calculateTotal()
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      }

      console.log('Order data:', orderData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Clear cart and redirect to success page
      const cartKey = `cart_${storeData.slug}`
      localStorage.removeItem(cartKey)
      window.dispatchEvent(new Event('cartUpdated'))
      
      alert('ההזמנה בוצעה בהצלחה! תקבלו אישור במייל בקרוב.')
      
      window.location.href = '/'

    } catch (error) {
      console.error('Error submitting order:', error)
      alert('אירעה שגיאה בעת ביצוע ההזמנה. אנא נסו שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">העגלה ריקה</h1>
          <p className="text-gray-600 mb-6">אין פריטים בעגלה לביצוע הזמנה</p>
          <a href="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">חזור לעמוד הבית</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ביצוע הזמנה</h1>
          <nav className="text-sm text-gray-500">
            <a href="/" className="hover:text-primary-600">בית</a>
            <i className="ri-arrow-left-s-line mx-2 rtl:rotate-180"></i>
            <a href="/cart" className="hover:text-primary-600">עגלה</a>
            <i className="ri-arrow-left-s-line mx-2 rtl:rotate-180"></i>
            <span className="text-gray-900">תשלום</span>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">פרטים אישיים</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שם פרטי *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שם משפחה *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אימייל *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      טלפון *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">כתובת למשלוח</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      כתובת *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="רחוב ומספר בית"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        עיר *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מיקוד
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">אמצעי תשלום</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      checked={formData.paymentMethod === 'credit-card'}
                      onChange={handleInputChange}
                      className="ml-3 rtl:ml-0 rtl:mr-3"
                    />
                    <div className="flex items-center">
                      <i className="ri-bank-card-line text-xl text-gray-600 ml-3 rtl:ml-0 rtl:mr-3"></i>
                      <div>
                        <div className="font-medium">כרטיס אשראי</div>
                        <div className="text-sm text-gray-500">ויזה, מאסטרקארד, אמריקן אקספרס</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">הערות להזמנה</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="הערות מיוחדות להזמנה (אופציונלי)"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">סיכום הזמנה</h3>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          כמות: {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-200 mb-4" />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">סכום ביניים:</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">משלוח:</span>
                    <span>
                      {calculateShipping() === 0 ? (
                        <span className="text-green-600">חינם</span>
                      ) : (
                        formatPrice(calculateShipping())
                      )}
                    </span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>סה״כ לתשלום:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 text-lg font-semibold mt-6 rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin ml-2 rtl:ml-0 rtl:mr-2"></i>
                      מעבד הזמנה...
                    </>
                  ) : (
                    <>
                      <i className="ri-secure-payment-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                      בצע הזמנה
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                    <i className="ri-shield-check-line text-green-600"></i>
                    <span>תשלום מאובטח ובטוח</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage

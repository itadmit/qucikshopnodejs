import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import analyticsTracker from '../../utils/analyticsTracker'

const ThankYouPage = ({ storeData }) => {
  const { t } = useTranslation()
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (storeData && orderId) {
      fetchOrderData()
    }
  }, [storeData, orderId])

  const fetchOrderData = async () => {
    try {
      setLoading(true)
      
      // נסה לקבל נתוני הזמנה מה-URL params (לבדיקה)
      const orderTotal = searchParams.get('total')
      const orderItems = searchParams.get('items')
      
      if (orderTotal && orderItems) {
        const parsedItems = JSON.parse(decodeURIComponent(orderItems))
        const mockOrderData = {
          id: orderId,
          orderNumber: `ORD-${orderId}`,
          total: parseFloat(orderTotal),
          items: parsedItems,
          customerEmail: searchParams.get('email') || 'customer@example.com',
          status: 'confirmed',
          createdAt: new Date().toISOString()
        }
        
        setOrderData(mockOrderData)
        
        // מעקב אחר השלמת הזמנה באנליטיקה הפנימית שלנו
        analyticsTracker.trackPurchase(
          mockOrderData.id,
          mockOrderData.total,
          mockOrderData.items
        )
        
        // מעקב אחר צפייה בעמוד תודה
        analyticsTracker.trackThankYouPageView(
          mockOrderData.id,
          mockOrderData.total
        )
        
        // מעקב נוסף - conversion completed
        analyticsTracker.trackEvent('conversion_completed', {
          orderId: mockOrderData.id,
          orderNumber: mockOrderData.orderNumber,
          total: mockOrderData.total,
          itemCount: mockOrderData.items.length,
          customerEmail: mockOrderData.customerEmail,
          source: 'thank_you_page'
        })
        
      } else {
        // ניסיון לקבל נתונים מהשרת (אם יש API)
        try {
          const response = await fetch(`http://localhost:3001/api/orders/${orderId}`)
          if (response.ok) {
            const data = await response.json()
            setOrderData(data)
            
            // מעקב אחר השלמת הזמנה
            analyticsTracker.trackPurchase(data.id, data.total, data.items)
            analyticsTracker.trackEvent('conversion_completed', {
              orderId: data.id,
              orderNumber: data.orderNumber,
              total: data.total,
              itemCount: data.items.length
            })
          } else {
            throw new Error('Order not found')
          }
        } catch (apiError) {
          // Fallback - הזמנה בסיסית
          const fallbackOrder = {
            id: orderId,
            orderNumber: `ORD-${orderId}`,
            total: 0,
            items: [],
            status: 'confirmed'
          }
          setOrderData(fallbackOrder)
        }
      }
      
    } catch (error) {
      console.error('Error fetching order data:', error)
      setError('שגיאה בטעינת פרטי ההזמנה')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }

  const handleContinueShopping = () => {
    // מעקב אחר המשך קנייה
    analyticsTracker.trackEvent('continue_shopping_clicked', {
      source: 'thank_you_page',
      orderId: orderData?.id
    })
    
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">טוען פרטי הזמנה...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-red-600"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">{error}</h1>
          <button
            onClick={handleContinueShopping}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            חזרה לחנות
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* הודעת הצלחה */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-4xl text-green-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">תודה על ההזמנה!</h1>
          <p className="text-lg text-gray-600 mb-2">ההזמנה שלך התקבלה בהצלחה</p>
          {orderData?.orderNumber && (
            <p className="text-sm text-gray-500">מספר הזמנה: {orderData.orderNumber}</p>
          )}
        </div>

        {/* פרטי ההזמנה */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">פרטי ההזמנה</h2>
            
            {orderData?.items && orderData.items.length > 0 ? (
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName || item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.productName || item.name}
                        </h3>
                        <p className="text-sm text-gray-500">כמות: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* סיכום */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">סה"כ לתשלום:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(orderData.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">פרטי המוצרים יישלחו אליך במייל</p>
              </div>
            )}
          </div>
        </div>

        {/* מידע נוסף */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* מה הלאה */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="ri-mail-line text-blue-600 ml-2"></i>
              מה הלאה?
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mt-1 ml-2 flex-shrink-0"></i>
                <span>תקבלו אישור הזמנה במייל תוך כמה דקות</span>
              </li>
              <li className="flex items-start">
                <i className="ri-truck-line text-blue-500 mt-1 ml-2 flex-shrink-0"></i>
                <span>נתחיל להכין את ההזמנה שלכם</span>
              </li>
              <li className="flex items-start">
                <i className="ri-notification-line text-purple-500 mt-1 ml-2 flex-shrink-0"></i>
                <span>תקבלו עדכון כשההזמנה תישלח</span>
              </li>
            </ul>
          </div>

          {/* פרטי קשר */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="ri-customer-service-line text-green-600 ml-2"></i>
              צריכים עזרה?
            </h3>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center">
                <i className="ri-mail-line text-gray-400 ml-2"></i>
                <span>support@{storeData?.domain || 'store.com'}</span>
              </p>
              <p className="flex items-center">
                <i className="ri-phone-line text-gray-400 ml-2"></i>
                <span>{storeData?.phone || '050-123-4567'}</span>
              </p>
              <p className="text-sm">
                אנחנו כאן לעזור! פנו אלינו בכל שאלה או בעיה
              </p>
            </div>
          </div>
        </div>

        {/* כפתורי פעולה */}
        <div className="text-center space-y-4">
          <button
            onClick={handleContinueShopping}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <i className="ri-shopping-bag-line ml-2"></i>
            המשך קנייה
          </button>
          
          <div className="flex justify-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => {
                analyticsTracker.trackOrderShare(orderData?.id, 'whatsapp')
                const text = `הזמנתי מ${storeData?.name || 'החנות'} - הזמנה ${orderData?.orderNumber || orderId}`
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`
                window.open(url, '_blank')
              }}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              <i className="ri-whatsapp-line text-2xl"></i>
            </button>
            
            <button
              onClick={() => {
                analyticsTracker.trackOrderShare(orderData?.id, 'facebook')
                const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`
                window.open(url, '_blank')
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <i className="ri-facebook-line text-2xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYouPage

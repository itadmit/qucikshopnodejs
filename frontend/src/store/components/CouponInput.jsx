import { useState } from 'react'
import discountService from '../../services/discountService'

const CouponInput = ({ 
  cart, 
  storeSlug, 
  onDiscountApplied, 
  appliedCoupon = null,
  customer = null 
}) => {
  const [couponCode, setCouponCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('אנא הזן קוד קופון')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await discountService.validateCoupon(
        couponCode.trim().toUpperCase(),
        cart,
        storeSlug,
        customer
      )

      if (result.valid) {
        // חישוב הנחות מחדש עם הקופון
        const discountResult = await discountService.calculateDiscounts(
          cart,
          storeSlug,
          couponCode.trim().toUpperCase(),
          customer
        )

        if (discountResult.success) {
          setSuccess(`קופון הוחל בהצלחה! חסכת ${discountService.formatPrice(discountResult.discountAmount)}`)
          onDiscountApplied(discountResult, couponCode.trim().toUpperCase())
          setCouponCode('')
        } else {
          setError(discountResult.error || 'שגיאה בהחלת הקופון')
        }
      } else {
        setError(result.error || 'קוד קופון לא תקין')
      }
    } catch (error) {
      console.error('שגיאה בהחלת קופון:', error)
      setError('שגיאה בהחלת הקופון. אנא נסה שוב.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCoupon = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // חישוב מחדש ללא קופון
      const discountResult = await discountService.calculateDiscounts(
        cart,
        storeSlug,
        null,
        customer
      )

      onDiscountApplied(discountResult, null)
      setSuccess('קופון הוסר בהצלחה')
      
      // הסרת הודעת הצלחה אחרי 3 שניות
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('שגיאה בהסרת קופון:', error)
      setError('שגיאה בהסרת הקופון')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon()
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-900">קוד קופון</h3>
      
      {appliedCoupon ? (
        // תצוגת קופון מוחל
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                {appliedCoupon}
              </span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={isLoading}
              className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'הסר'
              )}
            </button>
          </div>
        </div>
      ) : (
        // תצוגת הזנת קופון
        <div className="space-y-3">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="הזן קוד קופון"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isLoading || !couponCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'החל'
              )}
            </button>
          </div>
        </div>
      )}

      {/* הודעות שגיאה והצלחה */}
      {error && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 text-sm">
          <i className="ri-error-warning-line"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600 text-sm">
          <i className="ri-checkbox-circle-line"></i>
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}

export default CouponInput

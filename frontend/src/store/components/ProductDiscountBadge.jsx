import { useState, useEffect } from 'react'
import discountService from '../../services/discountService'

const ProductDiscountBadge = ({ product, quantity = 1, storeSlug }) => {
  const [discounts, setDiscounts] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product && storeSlug) {
      checkProductDiscounts()
    }
  }, [product, quantity, storeSlug])

  const checkProductDiscounts = async () => {
    setLoading(true)
    try {
      const result = await discountService.getProductDiscounts(product, quantity, storeSlug)
      
      if (result.success && result.appliedDiscounts.length > 0) {
        setDiscounts(result)
      } else {
        setDiscounts(null)
      }
    } catch (error) {
      console.error('שגיאה בבדיקת הנחות מוצר:', error)
      setDiscounts(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-32"></div>
    )
  }

  if (!discounts || !discounts.appliedDiscounts.length) {
    return null
  }

  const mainDiscount = discounts.appliedDiscounts[0]
  const savingsPercentage = discountService.calculateSavingsPercentage(
    discounts.subtotal,
    discounts.total
  )

  return (
    <div className="space-y-2">
      {/* Main Discount Badge */}
      <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
        <i className="ri-discount-percent-line ml-1"></i>
        <span>
          {mainDiscount.discountType === 'PERCENTAGE' 
            ? `${mainDiscount.discountValue}% הנחה`
            : `חסוך ${discountService.formatPrice(mainDiscount.amount)}`
          }
        </span>
      </div>

      {/* Additional Discounts */}
      {discounts.appliedDiscounts.length > 1 && (
        <div className="text-sm text-green-600 font-medium">
          + {discounts.appliedDiscounts.length - 1} הנחות נוספות
        </div>
      )}

      {/* Free Shipping Badge */}
      {discountService.hasFreeShippingDiscount(discounts.appliedDiscounts) && (
        <div className="inline-flex items-center bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          <i className="ri-truck-line ml-1"></i>
          משלוח חינם
        </div>
      )}

      {/* Savings Summary */}
      {savingsPercentage > 0 && (
        <div className="text-sm text-gray-600">
          חסוך {savingsPercentage}% • {discountService.formatPrice(discounts.savings)}
        </div>
      )}

      {/* Influencer Credit */}
      {mainDiscount.influencer && (
        <div className="text-xs text-gray-500 flex items-center">
          <i className="ri-user-star-line ml-1"></i>
          בשיתוף {mainDiscount.influencer.name}
        </div>
      )}
    </div>
  )
}

export default ProductDiscountBadge

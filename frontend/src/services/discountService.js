/**
 * שירות חישוב הנחות וקופונים בצד הלקוח
 * מספק ממשק אחיד לחישוב הנחות בכל רכיבי הממשק
 */

import { getApiConfig, devLog, devError } from '../config/local.js';

class DiscountService {
  constructor() {
    const apiConfig = getApiConfig();
    this.apiBase = apiConfig.baseUrl;
    this.timeout = apiConfig.timeout;
    devLog('DiscountService initialized', { apiBase: this.apiBase });
  }

  /**
   * חישוב הנחות עבור עגלת קניות
   * @param {Object} cart - עגלת הקניות
   * @param {string} storeSlug - slug של החנות
   * @param {string} couponCode - קוד קופון (אופציונלי)
   * @param {Object} customer - פרטי הלקוח (אופציונלי)
   * @returns {Promise<Object>} תוצאת החישוב
   */
  async calculateDiscounts(cart, storeSlug, couponCode = null, customer = null) {
    devLog('Calculating discounts', { storeSlug, couponCode, itemCount: cart?.items?.length });
    
    try {
      const response = await fetch(`${this.apiBase}/coupons/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cart,
          storeSlug,
          couponCode,
          customer
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'שגיאה בחישוב הנחות')
      }

      devLog('Discounts calculated successfully', result);
      return result
    } catch (error) {
      devError('שגיאה בחישוב הנחות:', error)
      
      // fallback לחישוב בסיסי
      const fallbackResult = this.calculateBasicTotals(cart);
      devLog('Using fallback calculation', fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * בדיקת תוקף קופון
   * @param {string} couponCode - קוד הקופון
   * @param {Object} cart - עגלת הקניות
   * @param {string} storeSlug - slug של החנות
   * @param {Object} customer - פרטי הלקוח (אופציונלי)
   * @returns {Promise<Object>} תוצאת הבדיקה
   */
  async validateCoupon(couponCode, cart, storeSlug, customer = null) {
    try {
      const response = await fetch(`${this.apiBase}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          couponCode,
          cart,
          storeSlug,
          customer
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'שגיאה בבדיקת קופון')
      }

      return result
    } catch (error) {
      console.error('שגיאה בבדיקת קופון:', error)
      return {
        valid: false,
        error: error.message || 'שגיאה בבדיקת קופון'
      }
    }
  }

  /**
   * חישוב בסיסי ללא הנחות (fallback)
   * @param {Object} cart - עגלת הקניות
   * @returns {Object} תוצאת החישוב הבסיסי
   */
  calculateBasicTotals(cart) {
    const items = cart.items || cart || []
    
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)

    const shipping = this.calculateBasicShipping(subtotal)
    const total = subtotal + shipping

    return {
      success: true,
      subtotal,
      shipping,
      originalShipping: shipping,
      discountAmount: 0,
      total,
      appliedDiscounts: [],
      savings: 0
    }
  }

  /**
   * חישוב משלוח בסיסי
   * @param {number} subtotal - סכום משנה
   * @returns {number} עלות משלוח
   */
  calculateBasicShipping(subtotal) {
    const freeShippingThreshold = 200
    const shippingCost = 25
    
    return subtotal >= freeShippingThreshold ? 0 : shippingCost
  }

  /**
   * פורמט מחיר לתצוגה
   * @param {number} price - המחיר
   * @returns {string} מחיר מפורמט
   */
  formatPrice(price) {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }

  /**
   * חישוב אחוז החיסכון
   * @param {number} originalPrice - מחיר מקורי
   * @param {number} finalPrice - מחיר סופי
   * @returns {number} אחוז החיסכון
   */
  calculateSavingsPercentage(originalPrice, finalPrice) {
    if (originalPrice <= 0) return 0
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
  }

  /**
   * בדיקה האם יש הנחת משלוח חינם
   * @param {Array} appliedDiscounts - הנחות שהוחלו
   * @returns {boolean} האם יש הנחת משלוח חינם
   */
  hasFreeShippingDiscount(appliedDiscounts) {
    return appliedDiscounts.some(discount => 
      discount.discountType === 'FREE_SHIPPING'
    )
  }

  /**
   * קבלת הודעת הנחה לתצוגה
   * @param {Object} discount - פרטי ההנחה
   * @returns {string} הודעת ההנחה
   */
  getDiscountMessage(discount) {
    switch (discount.discountType) {
      case 'PERCENTAGE':
        return `הנחה של ${discount.discountValue}%`
      
      case 'FIXED_AMOUNT':
        return `הנחה של ${this.formatPrice(discount.amount)}`
      
      case 'FREE_SHIPPING':
        return 'משלוח חינם'
      
      case 'BUY_X_GET_Y':
        return `קנה ${discount.buyQuantity} קבל ${discount.getQuantity} חינם`
      
      case 'TIERED':
        return 'הנחה מדורגת'
      
      default:
        return discount.name || 'הנחה'
    }
  }

  /**
   * בדיקה כמה נותר עד משלוח חינם
   * @param {number} subtotal - סכום משנה נוכחי
   * @param {number} freeShippingThreshold - סף משלוח חינם
   * @returns {number} כמה נותר עד משלוח חינם
   */
  getAmountUntilFreeShipping(subtotal, freeShippingThreshold = 200) {
    return Math.max(0, freeShippingThreshold - subtotal)
  }

  /**
   * יצירת הודעת עידוד לקנייה נוספת
   * @param {number} amountLeft - כמה נותר עד משלוח חינם
   * @returns {string} הודעת עידוד
   */
  getFreeShippingMessage(amountLeft) {
    if (amountLeft <= 0) {
      return '🎉 זכית במשלוח חינם!'
    }
    
    return `הוסף עוד ${this.formatPrice(amountLeft)} לקבלת משלוח חינם`
  }

  /**
   * חישוב הנחות עבור מוצר בודד (לתצוגה בעמוד מוצר)
   * @param {Object} product - פרטי המוצר
   * @param {number} quantity - כמות
   * @param {string} storeSlug - slug של החנות
   * @returns {Promise<Object>} הנחות רלוונטיות למוצר
   */
  async getProductDiscounts(product, quantity = 1, storeSlug) {
    const mockCart = {
      items: [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        categoryId: product.categoryId
      }]
    }

    return await this.calculateDiscounts(mockCart, storeSlug)
  }

  /**
   * עדכון עגלה עם הנחות מחושבות
   * @param {Array} cartItems - פריטי העגלה
   * @param {Object} discountResult - תוצאת חישוב ההנחות
   * @returns {Object} עגלה מעודכנת עם הנחות
   */
  applyDiscountsToCart(cartItems, discountResult) {
    return {
      items: cartItems,
      subtotal: discountResult.subtotal,
      shipping: discountResult.shipping,
      discountAmount: discountResult.discountAmount,
      total: discountResult.total,
      appliedDiscounts: discountResult.appliedDiscounts,
      savings: discountResult.savings
    }
  }

  /**
   * בדיקה האם קופון שייך למשפיען
   * @param {Object} discount - פרטי ההנחה
   * @returns {boolean} האם זה קופון משפיען
   */
  isInfluencerDiscount(discount) {
    return discount.influencer && discount.influencer.id
  }

  /**
   * קבלת פרטי משפיען מהנחה
   * @param {Object} discount - פרטי ההנחה
   * @returns {Object|null} פרטי המשפיען או null
   */
  getInfluencerInfo(discount) {
    if (!this.isInfluencerDiscount(discount)) {
      return null
    }

    return {
      name: discount.influencer.name,
      code: discount.influencer.code,
      email: discount.influencer.email
    }
  }
}

// יצירת instance יחיד לשימוש בכל האפליקציה
const discountService = new DiscountService()

export default discountService

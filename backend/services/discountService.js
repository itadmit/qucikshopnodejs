/**
 * מנוע חישוב הנחות וקופונים מאוחד
 * מחשב הנחות בזמן אמת עבור כל שלבי הרכישה
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class DiscountService {
  /**
   * מחשב הנחות עבור עגלת קניות
   * @param {Object} cart - עגלת הקניות
   * @param {Array} cart.items - פריטי העגלה
   * @param {string} storeSlug - slug של החנות
   * @param {string} couponCode - קוד קופון (אופציונלי)
   * @param {Object} customer - פרטי הלקוח (אופציונלי)
   * @returns {Object} תוצאת החישוב עם הנחות
   */
  async calculateDiscounts(cart, storeSlug, couponCode = null, customer = null) {
    try {
      // קבלת פרטי החנות
      const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
      })

      if (!store) {
        throw new Error('חנות לא נמצאה')
      }

      // חישוב סכום בסיס
      const subtotal = this.calculateSubtotal(cart.items)
      const shipping = this.calculateShipping(subtotal, store)
      
      let totalDiscount = 0
      let appliedDiscounts = []
      let couponDiscount = null
      let automaticDiscounts = []

      // בדיקת קופון אם הוזן
      if (couponCode) {
        couponDiscount = await this.applyCoupon(couponCode, cart, store, customer)
        if (couponDiscount.valid) {
          totalDiscount += couponDiscount.amount
          appliedDiscounts.push(couponDiscount)
        }
      }

      // בדיקת הנחות אוטומטיות
      automaticDiscounts = await this.getApplicableAutomaticDiscounts(cart, store, customer)
      
      // מיון הנחות לפי עדיפות וחישוב
      automaticDiscounts = this.sortDiscountsByPriority(automaticDiscounts)
      
      for (const discount of automaticDiscounts) {
        const discountAmount = this.calculateDiscountAmount(discount, cart, subtotal)
        if (discountAmount > 0) {
          totalDiscount += discountAmount
          appliedDiscounts.push({
            type: 'automatic',
            id: discount.id,
            name: discount.name,
            amount: discountAmount,
            discountType: discount.discountType
          })
        }
      }

      // חישוב סופי
      const discountedSubtotal = Math.max(0, subtotal - totalDiscount)
      const hasFreeShipping = appliedDiscounts.some(d => d.discountType === 'FREE_SHIPPING')
      const finalShipping = hasFreeShipping ? 0 : shipping
      const total = discountedSubtotal + finalShipping

      return {
        success: true,
        subtotal,
        shipping: finalShipping,
        originalShipping: shipping,
        discountAmount: totalDiscount,
        total,
        appliedDiscounts,
        savings: totalDiscount + (shipping - finalShipping)
      }

    } catch (error) {
      console.error('שגיאה בחישוב הנחות:', error)
      return {
        success: false,
        error: error.message,
        subtotal: this.calculateSubtotal(cart.items),
        shipping: this.calculateShipping(this.calculateSubtotal(cart.items)),
        discountAmount: 0,
        total: this.calculateSubtotal(cart.items) + this.calculateShipping(this.calculateSubtotal(cart.items)),
        appliedDiscounts: []
      }
    }
  }

  /**
   * חישוב סכום משנה
   */
  calculateSubtotal(items) {
    return items.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)
  }

  /**
   * חישוב עלות משלוח
   */
  calculateShipping(subtotal, store = null) {
    // כללי משלוח בסיסיים - ניתן להתאים לפי החנות
    const freeShippingThreshold = store?.settings?.freeShippingThreshold || 200
    const shippingCost = store?.settings?.shippingCost || 25
    
    return subtotal >= freeShippingThreshold ? 0 : shippingCost
  }

  /**
   * החלת קופון
   */
  async applyCoupon(couponCode, cart, store, customer) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode,
        storeId: store.id,
        status: 'ACTIVE'
      },
      include: {
        influencer: true
      }
    })

    if (!coupon) {
      return { valid: false, error: 'קוד קופון לא תקין' }
    }

    // בדיקת תוקף
    const now = new Date()
    if (coupon.startsAt && now < coupon.startsAt) {
      return { valid: false, error: 'הקופון עדיין לא פעיל' }
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return { valid: false, error: 'הקופון פג תוקף' }
    }

    // בדיקת מגבלות שימוש
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, error: 'הקופון הגיע למגבלת השימוש' }
    }

    // בדיקת סכום מינימלי
    const subtotal = this.calculateSubtotal(cart.items)
    if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
      return { 
        valid: false, 
        error: `נדרש סכום מינימלי של ${coupon.minimumAmount} ש"ח` 
      }
    }

    // בדיקת תנאי מוצרים/קטגוריות
    if (!this.checkProductConditions(coupon, cart.items)) {
      return { valid: false, error: 'הקופון לא חל על המוצרים בעגלה' }
    }

    // חישוב סכום ההנחה
    const discountAmount = this.calculateDiscountAmount(coupon, cart, subtotal)

    return {
      valid: true,
      type: 'coupon',
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      amount: discountAmount,
      discountType: coupon.discountType,
      influencer: coupon.influencer
    }
  }

  /**
   * קבלת הנחות אוטומטיות רלוונטיות
   */
  async getApplicableAutomaticDiscounts(cart, store, customer) {
    const now = new Date()
    const subtotal = this.calculateSubtotal(cart.items)

    const discounts = await prisma.automaticDiscount.findMany({
      where: {
        storeId: store.id,
        status: 'ACTIVE',
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } }
        ],
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ],
        OR: [
          { minimumAmount: null },
          { minimumAmount: { lte: subtotal } }
        ]
      },
      include: {
        influencer: true
      }
    })

    // סינון לפי תנאי מוצרים ולקוחות
    return discounts.filter(discount => {
      return this.checkProductConditions(discount, cart.items) &&
             this.checkCustomerConditions(discount, customer)
    })
  }

  /**
   * בדיקת תנאי מוצרים וקטגוריות
   */
  checkProductConditions(discount, cartItems) {
    // אם אין תנאי מוצרים - ההנחה חלה על הכל
    if (!discount.applicableProducts && !discount.applicableCategories) {
      return true
    }

    // בדיקת מוצרים ספציפיים
    if (discount.applicableProducts) {
      const applicableProductIds = discount.applicableProducts
      const hasApplicableProduct = cartItems.some(item => 
        applicableProductIds.includes(item.id)
      )
      if (!hasApplicableProduct) return false
    }

    // בדיקת קטגוריות
    if (discount.applicableCategories) {
      const applicableCategoryIds = discount.applicableCategories
      const hasApplicableCategory = cartItems.some(item => 
        item.categoryId && applicableCategoryIds.includes(item.categoryId)
      )
      if (!hasApplicableCategory) return false
    }

    // בדיקת מוצרים מוחרגים
    if (discount.excludedProducts) {
      const excludedProductIds = discount.excludedProducts
      const hasExcludedProduct = cartItems.some(item => 
        excludedProductIds.includes(item.id)
      )
      if (hasExcludedProduct) return false
    }

    return true
  }

  /**
   * בדיקת תנאי לקוחות
   */
  checkCustomerConditions(discount, customer) {
    if (!discount.customerSegments || !customer) {
      return true
    }

    // כאן ניתן להוסיף לוגיקה מורכבת יותר לסגמנטציה
    // לדוגמה: לקוחות חדשים, לקוחות VIP, לפי סכום הזמנות וכו'
    
    return true
  }

  /**
   * מיון הנחות לפי עדיפות
   */
  sortDiscountsByPriority(discounts) {
    return discounts.sort((a, b) => b.priority - a.priority)
  }

  /**
   * חישוב סכום הנחה
   */
  calculateDiscountAmount(discount, cart, subtotal) {
    switch (discount.discountType) {
      case 'PERCENTAGE':
        let percentageDiscount = subtotal * (discount.discountValue / 100)
        if (discount.maximumDiscount) {
          percentageDiscount = Math.min(percentageDiscount, discount.maximumDiscount)
        }
        return percentageDiscount

      case 'FIXED_AMOUNT':
        return Math.min(discount.discountValue, subtotal)

      case 'FREE_SHIPPING':
        return 0 // המשלוח יטופל בנפרד

      case 'BUY_X_GET_Y':
        return this.calculateBOGODiscount(discount, cart.items)

      case 'TIERED':
        return this.calculateTieredDiscount(discount, cart.items, subtotal)

      default:
        return 0
    }
  }

  /**
   * חישוב הנחת BOGO (קנה X קבל Y)
   */
  calculateBOGODiscount(discount, cartItems) {
    if (!discount.buyQuantity || !discount.getQuantity) return 0

    // מציאת מוצרים רלוונטיים
    let applicableItems = cartItems
    if (discount.applicableProducts) {
      applicableItems = cartItems.filter(item => 
        discount.applicableProducts.includes(item.id)
      )
    }

    let totalDiscount = 0
    
    for (const item of applicableItems) {
      const setsOfBuy = Math.floor(item.quantity / discount.buyQuantity)
      const freeItems = setsOfBuy * discount.getQuantity
      const discountPerItem = item.price
      totalDiscount += freeItems * discountPerItem
    }

    return totalDiscount
  }

  /**
   * חישוב הנחה מדורגת
   */
  calculateTieredDiscount(discount, cartItems, subtotal) {
    if (!discount.tieredRules) return 0

    // מיון הכללים לפי סכום עולה
    const rules = discount.tieredRules.sort((a, b) => a.minAmount - b.minAmount)
    
    let applicableRule = null
    for (const rule of rules) {
      if (subtotal >= rule.minAmount) {
        applicableRule = rule
      }
    }

    if (!applicableRule) return 0

    if (applicableRule.discountType === 'PERCENTAGE') {
      let discountAmount = subtotal * (applicableRule.discountValue / 100)
      if (applicableRule.maxDiscount) {
        discountAmount = Math.min(discountAmount, applicableRule.maxDiscount)
      }
      return discountAmount
    } else if (applicableRule.discountType === 'FIXED_AMOUNT') {
      return Math.min(applicableRule.discountValue, subtotal)
    }

    return 0
  }

  /**
   * רישום שימוש בקופון
   */
  async recordCouponUsage(couponId, orderId, customerId, sessionId, discountAmount, orderTotal) {
    try {
      // רישום השימוש
      await prisma.couponUsage.create({
        data: {
          couponId,
          orderId,
          customerId,
          sessionId,
          discountAmount,
          orderTotal
        }
      })

      // עדכון מונה השימושים בקופון
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: {
            increment: 1
          }
        }
      })

      // עדכון סטטיסטיקות משפיען אם רלוונטי
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
        include: { influencer: true }
      })

      if (coupon.influencer) {
        await this.updateInfluencerStats(coupon.influencer.id, discountAmount, orderTotal)
      }

    } catch (error) {
      console.error('שגיאה ברישום שימוש בקופון:', error)
    }
  }

  /**
   * עדכון סטטיסטיקות משפיען
   */
  async updateInfluencerStats(influencerId, discountAmount, orderTotal) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId }
    })

    const commission = orderTotal * influencer.commissionRate

    // עדכון או יצירת סטטיסטיקה יומית
    await prisma.influencerStats.upsert({
      where: {
        influencerId_date: {
          influencerId,
          date: today
        }
      },
      update: {
        orders: { increment: 1 },
        revenue: { increment: orderTotal },
        commission: { increment: commission },
        couponUses: { increment: 1 }
      },
      create: {
        influencerId,
        date: today,
        orders: 1,
        revenue: orderTotal,
        commission,
        couponUses: 1
      }
    })

    // עדכון סטטיסטיקות כלליות של המשפיען
    await prisma.influencer.update({
      where: { id: influencerId },
      data: {
        totalEarnings: { increment: commission },
        totalOrders: { increment: 1 }
      }
    })
  }

  /**
   * קבלת סטטיסטיקות משפיען
   */
  async getInfluencerStats(influencerId, startDate = null, endDate = null) {
    const where = { influencerId }
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    const stats = await prisma.influencerStats.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    const summary = stats.reduce((acc, stat) => ({
      totalOrders: acc.totalOrders + stat.orders,
      totalRevenue: acc.totalRevenue + stat.revenue,
      totalCommission: acc.totalCommission + stat.commission,
      totalCouponUses: acc.totalCouponUses + stat.couponUses
    }), {
      totalOrders: 0,
      totalRevenue: 0,
      totalCommission: 0,
      totalCouponUses: 0
    })

    return {
      summary,
      dailyStats: stats
    }
  }
}

export { DiscountService }
export default new DiscountService()

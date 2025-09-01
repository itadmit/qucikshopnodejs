import { useState, useEffect, useCallback } from 'react'
import cartService from '../../../services/cartService'

/**
 * Custom hook for real-time cart synchronization
 * Provides cart state and methods with automatic updates
 */
export const useCartSync = (storeSlug) => {
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize cart service and load initial data
  useEffect(() => {
    if (storeSlug) {
      cartService.init(storeSlug)
      loadCartData()
    }
  }, [storeSlug])

  // Load cart data from service
  const loadCartData = useCallback(() => {
    try {
      const items = cartService.getItems()
      const count = cartService.getItemCount()
      const total = cartService.getTotal()
      
      setCartItems(items)
      setCartCount(count)
      setCartTotal(total)
      setError(null)
    } catch (err) {
      console.error('Error loading cart data:', err)
      setError('שגיאה בטעינת נתוני העגלה')
    }
  }, [])

  // Listen for cart updates
  useEffect(() => {
    if (!storeSlug) return

    // Listen to cart service updates
    const unsubscribe = cartService.addListener(loadCartData)

    // Listen to global cart events
    const handleCartUpdate = () => loadCartData()
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      unsubscribe()
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [storeSlug, loadCartData])

  // Add item to cart
  const addItem = useCallback(async (productId, options = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await cartService.addItem(productId, options)
      if (result.success) {
        loadCartData()
        return result
      } else {
        setError(result.message || 'שגיאה בהוספה לעגלה')
        return result
      }
    } catch (err) {
      console.error('Error adding item to cart:', err)
      setError('שגיאה בהוספה לעגלה')
      return { success: false, message: 'שגיאה בהוספה לעגלה' }
    } finally {
      setIsLoading(false)
    }
  }, [loadCartData])

  // Update item quantity
  const updateQuantity = useCallback(async (itemId, quantity) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await cartService.updateQuantity(itemId, quantity)
      if (result.success) {
        loadCartData()
        return result
      } else {
        setError(result.message || 'שגיאה בעדכון הכמות')
        return result
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('שגיאה בעדכון הכמות')
      return { success: false, message: 'שגיאה בעדכון הכמות' }
    } finally {
      setIsLoading(false)
    }
  }, [loadCartData])

  // Remove item from cart
  const removeItem = useCallback(async (itemId) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await cartService.removeItem(itemId)
      if (result.success) {
        loadCartData()
        return result
      } else {
        setError(result.message || 'שגיאה בהסרה מהעגלה')
        return result
      }
    } catch (err) {
      console.error('Error removing item:', err)
      setError('שגיאה בהסרה מהעגלה')
      return { success: false, message: 'שגיאה בהסרה מהעגלה' }
    } finally {
      setIsLoading(false)
    }
  }, [loadCartData])

  // Clear entire cart
  const clearCart = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await cartService.clearCart()
      if (result.success) {
        loadCartData()
        return result
      } else {
        setError(result.message || 'שגיאה בניקוי העגלה')
        return result
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('שגיאה בניקוי העגלה')
      return { success: false, message: 'שגיאה בניקוי העגלה' }
    } finally {
      setIsLoading(false)
    }
  }, [loadCartData])

  // Format price helper
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }, [])

  return {
    // State
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    error,
    
    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: loadCartData,
    
    // Helpers
    formatPrice,
    isEmpty: cartCount === 0,
    hasItems: cartCount > 0
  }
}

export default useCartSync

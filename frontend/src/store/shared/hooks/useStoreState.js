import { useState, useEffect, useCallback, createContext, useContext } from 'react'

// Create context for store state
const StoreStateContext = createContext()

/**
 * Store State Provider Component
 * Provides global state management for the store
 */
export const StoreStateProvider = ({ children, storeData }) => {
  const [state, setState] = useState({
    // UI State
    sideCartOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    
    // User State
    wishlist: [],
    recentlyViewed: [],
    
    // Notifications
    notifications: [],
    toasts: [],
    
    // Loading States
    isLoading: false,
    
    // Store Data
    storeData: storeData || null
  })

  // Update store data when prop changes
  useEffect(() => {
    if (storeData) {
      setState(prev => ({ ...prev, storeData }))
    }
  }, [storeData])

  // Load persisted state from localStorage
  useEffect(() => {
    if (storeData?.slug) {
      try {
        const wishlistKey = `wishlist_${storeData.slug}`
        const recentlyViewedKey = `recently_viewed_${storeData.slug}`
        
        const savedWishlist = localStorage.getItem(wishlistKey)
        const savedRecentlyViewed = localStorage.getItem(recentlyViewedKey)
        
        setState(prev => ({
          ...prev,
          wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
          recentlyViewed: savedRecentlyViewed ? JSON.parse(savedRecentlyViewed) : []
        }))
      } catch (error) {
        console.error('Error loading persisted state:', error)
      }
    }
  }, [storeData?.slug])

  // Generic state updater
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // UI Actions
  const openSideCart = useCallback(() => {
    updateState({ sideCartOpen: true })
  }, [updateState])

  const closeSideCart = useCallback(() => {
    updateState({ sideCartOpen: false })
  }, [updateState])

  const toggleSideCart = useCallback(() => {
    setState(prev => ({ ...prev, sideCartOpen: !prev.sideCartOpen }))
  }, [])

  const openSearch = useCallback(() => {
    updateState({ searchOpen: true })
  }, [updateState])

  const closeSearch = useCallback(() => {
    updateState({ searchOpen: false })
  }, [updateState])

  const toggleMobileMenu = useCallback(() => {
    setState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))
  }, [])

  // Wishlist Actions
  const addToWishlist = useCallback((product) => {
    if (!storeData?.slug) return
    
    setState(prev => {
      const isAlreadyInWishlist = prev.wishlist.some(item => item.id === product.id)
      if (isAlreadyInWishlist) return prev
      
      const newWishlist = [...prev.wishlist, { ...product, addedAt: new Date().toISOString() }]
      
      // Persist to localStorage
      try {
        localStorage.setItem(`wishlist_${storeData.slug}`, JSON.stringify(newWishlist))
      } catch (error) {
        console.error('Error saving wishlist:', error)
      }
      
      return { ...prev, wishlist: newWishlist }
    })
  }, [storeData?.slug])

  const removeFromWishlist = useCallback((productId) => {
    if (!storeData?.slug) return
    
    setState(prev => {
      const newWishlist = prev.wishlist.filter(item => item.id !== productId)
      
      // Persist to localStorage
      try {
        localStorage.setItem(`wishlist_${storeData.slug}`, JSON.stringify(newWishlist))
      } catch (error) {
        console.error('Error saving wishlist:', error)
      }
      
      return { ...prev, wishlist: newWishlist }
    })
  }, [storeData?.slug])

  const isInWishlist = useCallback((productId) => {
    return state.wishlist.some(item => item.id === productId)
  }, [state.wishlist])

  // Recently Viewed Actions
  const addToRecentlyViewed = useCallback((product) => {
    if (!storeData?.slug) return
    
    setState(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.recentlyViewed.filter(item => item.id !== product.id)
      
      // Add to beginning and limit to 10 items
      const newRecentlyViewed = [
        { ...product, viewedAt: new Date().toISOString() },
        ...filtered
      ].slice(0, 10)
      
      // Persist to localStorage
      try {
        localStorage.setItem(`recently_viewed_${storeData.slug}`, JSON.stringify(newRecentlyViewed))
      } catch (error) {
        console.error('Error saving recently viewed:', error)
      }
      
      return { ...prev, recentlyViewed: newRecentlyViewed }
    })
  }, [storeData?.slug])

  // Notification Actions
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString()
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }
    
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications].slice(0, 50) // Limit to 50
    }))
    
    return id
  }, [])

  const markNotificationAsRead = useCallback((notificationId) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    }))
  }, [])

  const removeNotification = useCallback((notificationId) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notif => notif.id !== notificationId)
    }))
  }, [])

  // Toast Actions
  const addToast = useCallback((toast) => {
    const id = Date.now().toString()
    const newToast = {
      id,
      timestamp: new Date().toISOString(),
      duration: 4000,
      type: 'success',
      ...toast
    }
    
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, newToast]
    }))
    
    // Auto remove after duration
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toasts: prev.toasts.filter(t => t.id !== id)
      }))
    }, newToast.duration)
    
    return id
  }, [])

  const removeToast = useCallback((toastId) => {
    setState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(toast => toast.id !== toastId)
    }))
  }, [])

  // Loading Actions
  const setLoading = useCallback((loading) => {
    updateState({ isLoading: loading })
  }, [updateState])

  const value = {
    // State
    ...state,
    
    // UI Actions
    openSideCart,
    closeSideCart,
    toggleSideCart,
    openSearch,
    closeSearch,
    toggleMobileMenu,
    
    // Wishlist Actions
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    
    // Recently Viewed Actions
    addToRecentlyViewed,
    
    // Notification Actions
    addNotification,
    markNotificationAsRead,
    removeNotification,
    
    // Toast Actions
    addToast,
    removeToast,
    
    // Loading Actions
    setLoading,
    
    // Generic State Update
    updateState
  }

  return (
    <StoreStateContext.Provider value={value}>
      {children}
    </StoreStateContext.Provider>
  )
}

/**
 * Hook to use store state
 */
export const useStoreState = () => {
  const context = useContext(StoreStateContext)
  if (!context) {
    throw new Error('useStoreState must be used within a StoreStateProvider')
  }
  return context
}

/**
 * Hook for wishlist functionality
 */
export const useWishlist = () => {
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useStoreState()
  
  const toggleWishlist = useCallback((product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      return false
    } else {
      addToWishlist(product)
      return true
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist])
  
  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    wishlistCount: wishlist.length
  }
}

/**
 * Hook for notifications
 */
export const useNotifications = () => {
  const { 
    notifications, 
    addNotification, 
    markNotificationAsRead, 
    removeNotification 
  } = useStoreState()
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  return {
    notifications,
    addNotification,
    markNotificationAsRead,
    removeNotification,
    unreadCount
  }
}

/**
 * Hook for toasts
 */
export const useToasts = () => {
  const { toasts, addToast, removeToast } = useStoreState()
  
  const showSuccess = useCallback((message, options = {}) => {
    return addToast({ message, type: 'success', ...options })
  }, [addToast])
  
  const showError = useCallback((message, options = {}) => {
    return addToast({ message, type: 'error', ...options })
  }, [addToast])
  
  const showInfo = useCallback((message, options = {}) => {
    return addToast({ message, type: 'info', ...options })
  }, [addToast])
  
  const showCart = useCallback((message, options = {}) => {
    return addToast({ message, type: 'cart', ...options })
  }, [addToast])
  
  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showCart
  }
}

export default useStoreState

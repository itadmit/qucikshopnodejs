import { getApiUrl } from '../config/environment.js';

class CartService {
  constructor() {
    this.cartKey = null;
    this.listeners = new Set();
  }

  // Initialize cart for specific store
  init(storeSlug) {
    this.cartKey = `cart_${storeSlug}`;
    this.storeSlug = storeSlug;
  }

  // Get cart items from localStorage
  getCartItems() {
    if (!this.cartKey) return [];
    const cart = localStorage.getItem(this.cartKey);
    return cart ? JSON.parse(cart) : [];
  }

  // Save cart items to localStorage
  saveCartItems(items) {
    if (!this.cartKey) return;
    localStorage.setItem(this.cartKey, JSON.stringify(items));
    this.notifyListeners();
  }

  // Add listener for cart changes
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    const items = this.getCartItems();
    this.listeners.forEach(callback => callback(items));
    // Also dispatch window event for backward compatibility
    window.dispatchEvent(new Event('cartUpdated'));
  }

  // Get cart item count
  getItemCount() {
    const items = this.getCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  // Add item to cart (with API validation)
  async addItem(productId, options = {}) {
    try {
      const {
        variantId = null,
        quantity = 1,
        selectedOptions = {},
        skipApiCall = false
      } = options;

      // If skipApiCall is true, use legacy localStorage method
      if (skipApiCall) {
        return this.addItemLegacy(productId, options);
      }

      // Call API to validate and get item data
      const response = await fetch(getApiUrl('/cart/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity,
          options: selectedOptions
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'שגיאה בהוספה לעגלה');
      }

      // Add to local cart
      const cartItems = this.getCartItems();
      const existingItemIndex = cartItems.findIndex(item => 
        item.productId === productId && 
        item.variantId === variantId &&
        JSON.stringify(item.options) === JSON.stringify(selectedOptions)
      );

      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({
          ...result.item,
          id: `${productId}_${variantId || 'simple'}_${Date.now()}`, // Unique cart item ID
          addedAt: new Date().toISOString()
        });
      }

      this.saveCartItems(cartItems);

      return {
        success: true,
        message: result.message,
        item: result.item
      };

    } catch (error) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        message: error.message || 'שגיאה בהוספה לעגלה'
      };
    }
  }

  // Legacy add item method (for backward compatibility)
  addItemLegacy(productId, options = {}) {
    const {
      name,
      price,
      imageUrl,
      quantity = 1,
      selectedOptions = {},
      variantId = null,
      type = 'SIMPLE',
      bundleItems = []
    } = options;

    const cartItems = this.getCartItems();
    
    if (type === 'BUNDLE') {
      // Handle bundle products
      const bundleId = `bundle_${Date.now()}`;
      
      bundleItems.forEach(bundleItem => {
        if (bundleItem.isOptional) return;
        
        const existingItemIndex = cartItems.findIndex(item => 
          item.productId === bundleItem.productId && 
          item.variantId === bundleItem.variantId
        );
        
        const itemQuantity = bundleItem.quantity * quantity;
        
        if (existingItemIndex > -1) {
          cartItems[existingItemIndex].quantity += itemQuantity;
        } else {
          cartItems.push({
            id: `${bundleItem.productId}_${bundleItem.variantId || 'simple'}_${Date.now()}`,
            productId: bundleItem.productId,
            variantId: bundleItem.variantId,
            name: bundleItem.name,
            price: bundleItem.price,
            imageUrl: bundleItem.imageUrl,
            quantity: itemQuantity,
            options: bundleItem.options || {},
            bundleId: bundleId,
            bundleName: name,
            storeSlug: this.storeSlug,
            addedAt: new Date().toISOString()
          });
        }
      });
    } else {
      // Handle simple/variable products
      const existingItemIndex = cartItems.findIndex(item => 
        item.productId === productId && 
        item.variantId === variantId &&
        JSON.stringify(item.options) === JSON.stringify(selectedOptions)
      );
      
      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({
          id: `${productId}_${variantId || 'simple'}_${Date.now()}`,
          productId: productId,
          variantId: variantId,
          name: name,
          price: price,
          imageUrl: imageUrl,
          quantity: quantity,
          options: selectedOptions,
          storeSlug: this.storeSlug,
          addedAt: new Date().toISOString()
        });
      }
    }
    
    this.saveCartItems(cartItems);
    
    return {
      success: true,
      message: `${name} נוסף לעגלה בהצלחה`
    };
  }

  // Update item quantity
  updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
      return this.removeItem(itemId);
    }

    const cartItems = this.getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      cartItems[itemIndex].quantity = newQuantity;
      this.saveCartItems(cartItems);
      return { success: true };
    }
    
    return { success: false, message: 'פריט לא נמצא' };
  }

  // Remove item from cart
  removeItem(itemId) {
    const cartItems = this.getCartItems();
    const filteredItems = cartItems.filter(item => item.id !== itemId);
    this.saveCartItems(filteredItems);
    return { success: true };
  }

  // Clear entire cart
  clearCart() {
    this.saveCartItems([]);
    return { success: true };
  }

  // Validate cart items with server
  async validateCart() {
    try {
      const cartItems = this.getCartItems();
      
      if (cartItems.length === 0) {
        return { success: true, items: [], errors: null };
      }

      const response = await fetch(getApiUrl('/cart/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ items: cartItems })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'שגיאה בבדיקת העגלה');
      }

      // Update local cart with validated data
      const validatedItems = result.items.map(item => {
        const localItem = cartItems.find(local => 
          local.productId === item.productId && 
          local.variantId === item.variantId
        );
        return {
          ...localItem,
          ...item,
          id: localItem?.id || item.id // Keep local ID
        };
      });

      this.saveCartItems(validatedItems);

      return result;

    } catch (error) {
      console.error('Cart validation error:', error);
      return {
        success: false,
        message: error.message || 'שגיאה בבדיקת העגלה'
      };
    }
  }

  // Calculate cart totals
  async calculateTotals(couponCode = null) {
    try {
      const cartItems = this.getCartItems();
      
      if (cartItems.length === 0) {
        return {
          success: true,
          subtotal: 0,
          discounts: [],
          discountAmount: 0,
          shipping: 0,
          total: 0
        };
      }

      const response = await fetch(getApiUrl('/cart/calculate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          items: cartItems,
          couponCode 
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'שגיאה בחישוב העגלה');
      }

      return result;

    } catch (error) {
      console.error('Cart calculation error:', error);
      
      // Fallback to local calculation
      const cartItems = this.getCartItems();
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        success: false,
        subtotal,
        discounts: [],
        discountAmount: 0,
        shipping: subtotal >= 200 ? 0 : 25, // Default shipping logic
        total: subtotal + (subtotal >= 200 ? 0 : 25),
        message: error.message || 'שגיאה בחישוב העגלה'
      };
    }
  }

  // Get cart summary
  getCartSummary() {
    const items = this.getCartItems();
    const itemCount = this.getItemCount();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      items,
      itemCount,
      subtotal,
      isEmpty: items.length === 0
    };
  }

  // Format price
  formatPrice(price) {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  }
}

// Create singleton instance
const cartService = new CartService();

export default cartService;

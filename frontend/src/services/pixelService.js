/**
 * שירות מקיף לניהול פיקסלים ומעקב
 * תומך ב-Facebook Pixel, Google Analytics, Google Tag Manager
 */

class PixelService {
  constructor() {
    this.isInitialized = false;
    this.storeSettings = null;
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * אתחול הפיקסלים עם הגדרות החנות
   */
  async init(storeSettings) {
    this.storeSettings = storeSettings;
    
    if (this.debugMode) {

    }

    // אתחול Facebook Pixel
    if (storeSettings.facebookPixelId) {
      await this.initFacebookPixel(storeSettings.facebookPixelId);
    }

    // אתחול Google Analytics
    if (storeSettings.googleAnalyticsId) {
      await this.initGoogleAnalytics(storeSettings.googleAnalyticsId);
    }

    // אתחול Google Tag Manager
    if (storeSettings.googleTagManagerId) {
      await this.initGoogleTagManager(storeSettings.googleTagManagerId);
    }

    this.isInitialized = true;
    
    if (this.debugMode) {

    }
  }

  /**
   * אתחול Facebook Pixel
   */
  async initFacebookPixel(pixelId) {
    return new Promise((resolve) => {
      // בדיקה אם הסקריפט כבר נטען
      if (window.fbq) {
        resolve();
        return;
      }

      // יצירת הסקריפט
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      script.onload = () => {
        // אתחול הפיקסל
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        
        if (this.debugMode) {

        }
        resolve();
      };

      // הוספת הקוד הבסיסי
      window._fbq = window._fbq || [];
      window.fbq = function() {
        window._fbq.push(arguments);
      };

      document.head.appendChild(script);

      // הוספת noscript fallback
      const noscript = document.createElement('noscript');
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.head.appendChild(noscript);
    });
  }

  /**
   * אתחול Google Analytics 4
   */
  async initGoogleAnalytics(measurementId) {
    return new Promise((resolve) => {
      // בדיקה אם הסקריפט כבר נטען
      if (window.gtag) {
        resolve();
        return;
      }

      // יצירת הסקריפט
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      
      script.onload = () => {
        // אתחול gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        
        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
          send_page_view: true,
          currency: 'ILS'
        });
        
        if (this.debugMode) {

        }
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  /**
   * אתחול Google Tag Manager
   */
  async initGoogleTagManager(containerId) {
    return new Promise((resolve) => {
      // בדיקה אם הסקריפט כבר נטען
      if (window.google_tag_manager) {
        resolve();
        return;
      }

      // הוספת dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      // יצירת הסקריפט
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
      
      script.onload = () => {
        if (this.debugMode) {

        }
        resolve();
      };

      document.head.appendChild(script);

      // הוספת noscript fallback
      const noscript = document.createElement('noscript');
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${containerId}`;
      iframe.height = 0;
      iframe.width = 0;
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.appendChild(noscript);
    });
  }

  /**
   * מעקב אחר צפייה בדף
   */
  trackPageView(page = window.location.pathname, title = document.title) {
    if (!this.isInitialized) return;

    const eventData = {
      page_title: title,
      page_location: window.location.href,
      page_path: page
    };

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', eventData);
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        ...eventData
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * מעקב אחר צפייה במוצר
   */
  trackViewContent(productData) {
    if (!this.isInitialized) return;

    const eventData = {
      content_type: 'product',
      content_ids: [productData.id.toString()],
      content_name: productData.name,
      content_category: productData.category || '',
      value: productData.price || 0,
      currency: 'ILS'
    };

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: eventData.content_ids,
        content_type: eventData.content_type,
        content_name: eventData.content_name,
        content_category: eventData.content_category,
        value: eventData.value,
        currency: eventData.currency
      });
    }

    // Google Analytics Enhanced Ecommerce
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: eventData.currency,
        value: eventData.value,
        items: [{
          item_id: productData.id.toString(),
          item_name: productData.name,
          item_category: productData.category || '',
          price: productData.price || 0,
          quantity: 1
        }]
      });
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: eventData.currency,
          value: eventData.value,
          items: [{
            item_id: productData.id.toString(),
            item_name: productData.name,
            item_category: productData.category || '',
            price: productData.price || 0,
            quantity: 1
          }]
        }
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * מעקב אחר הוספה לעגלה
   */
  trackAddToCart(productData, quantity = 1) {
    if (!this.isInitialized) return;

    const value = (productData.price || 0) * quantity;
    
    const eventData = {
      content_ids: [productData.id.toString()],
      content_type: 'product',
      content_name: productData.name,
      value: value,
      currency: 'ILS'
    };

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: eventData.content_ids,
        content_type: eventData.content_type,
        content_name: eventData.content_name,
        value: eventData.value,
        currency: eventData.currency
      });
    }

    // Google Analytics Enhanced Ecommerce
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: eventData.currency,
        value: eventData.value,
        items: [{
          item_id: productData.id.toString(),
          item_name: productData.name,
          item_category: productData.category || '',
          price: productData.price || 0,
          quantity: quantity
        }]
      });
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: eventData.currency,
          value: eventData.value,
          items: [{
            item_id: productData.id.toString(),
            item_name: productData.name,
            item_category: productData.category || '',
            price: productData.price || 0,
            quantity: quantity
          }]
        }
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * מעקב אחר הסרה מהעגלה
   */
  trackRemoveFromCart(productData, quantity = 1) {
    if (!this.isInitialized) return;

    const value = (productData.price || 0) * quantity;

    // Google Analytics Enhanced Ecommerce
    if (window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'ILS',
        value: value,
        items: [{
          item_id: productData.id.toString(),
          item_name: productData.name,
          item_category: productData.category || '',
          price: productData.price || 0,
          quantity: quantity
        }]
      });
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'remove_from_cart',
        ecommerce: {
          currency: 'ILS',
          value: value,
          items: [{
            item_id: productData.id.toString(),
            item_name: productData.name,
            item_category: productData.category || '',
            price: productData.price || 0,
            quantity: quantity
          }]
        }
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * מעקב אחר תחילת תהליך רכישה
   */
  trackBeginCheckout(cartData) {
    if (!this.isInitialized) return;

    const items = cartData.items.map(item => ({
      item_id: item.id.toString(),
      item_name: item.name,
      item_category: item.category || '',
      price: item.price || 0,
      quantity: item.quantity || 1
    }));

    const eventData = {
      content_ids: items.map(item => item.item_id),
      content_type: 'product',
      value: cartData.value || 0,
      currency: 'ILS',
      num_items: cartData.itemCount || items.length
    };

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: eventData.content_ids,
        content_type: eventData.content_type,
        value: eventData.value,
        currency: eventData.currency,
        num_items: eventData.num_items
      });
    }

    // Google Analytics Enhanced Ecommerce
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: eventData.currency,
        value: eventData.value,
        items: items
      });
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: eventData.currency,
          value: eventData.value,
          items: items
        }
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * מעקב אחר השלמת רכישה
   */
  trackPurchase(orderData) {
    if (!this.isInitialized) return;

    const items = orderData.items.map(item => ({
      item_id: item.productId.toString(),
      item_name: item.productName,
      item_category: item.category || '',
      price: item.price || 0,
      quantity: item.quantity || 1
    }));

    const eventData = {
      content_ids: items.map(item => item.item_id),
      content_type: 'product',
      value: orderData.revenue || 0,
      currency: 'ILS',
      transaction_id: orderData.orderId
    };

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: eventData.content_ids,
        content_type: eventData.content_type,
        value: eventData.value,
        currency: eventData.currency
      });
    }

    // Google Analytics Enhanced Ecommerce
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: eventData.transaction_id,
        value: eventData.value,
        currency: eventData.currency,
        items: items
      });
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: eventData.transaction_id,
          value: eventData.value,
          currency: eventData.currency,
          items: items
        }
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * מעקב אחר חיפוש
   */
  trackSearch(searchTerm, resultsCount = null) {
    if (!this.isInitialized) return;

    const eventData = {
      search_term: searchTerm,
      results_count: resultsCount
    };

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Search', {
        search_string: searchTerm
      });
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm
      });
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'search',
        search_term: searchTerm,
        results_count: resultsCount
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * מעקב אחר אירוע מותאם אישית
   */
  trackCustomEvent(eventName, eventData = {}) {
    if (!this.isInitialized) return;

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('trackCustom', eventName, eventData);
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData
      });
    }

    if (this.debugMode) {

    }
  }

  /**
   * קבלת מידע על הפיקסלים הפעילים
   */
  getActivePixels() {
    return {
      facebookPixel: !!window.fbq && !!this.storeSettings?.facebookPixelId,
      googleAnalytics: !!window.gtag && !!this.storeSettings?.googleAnalyticsId,
      googleTagManager: !!window.dataLayer && !!this.storeSettings?.googleTagManagerId,
      isInitialized: this.isInitialized
    };
  }

  /**
   * בדיקת תקינות הגדרות הפיקסלים
   */
  validateSettings(settings) {
    const errors = [];

    if (settings.facebookPixelId && !/^\d{15,16}$/.test(settings.facebookPixelId)) {
      errors.push('Facebook Pixel ID must be 15-16 digits');
    }

    if (settings.googleAnalyticsId && !/^G-[A-Z0-9]{10}$/.test(settings.googleAnalyticsId)) {
      errors.push('Google Analytics ID must be in format G-XXXXXXXXXX');
    }

    if (settings.googleTagManagerId && !/^GTM-[A-Z0-9]{7}$/.test(settings.googleTagManagerId)) {
      errors.push('Google Tag Manager ID must be in format GTM-XXXXXXX');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// יצירת instance יחיד
const pixelService = new PixelService();

export default pixelService;

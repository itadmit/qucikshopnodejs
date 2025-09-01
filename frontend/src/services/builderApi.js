/**
 * 🎨 QuickShop Site Builder - API Services
 * שירותי API לבילדר האתרים עם חיבור לבקאנד
 */

import { getApiUrl } from '../config/environment.js';

const baseUrl = getApiUrl();

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const storeSlug = localStorage.getItem('currentStore');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Collections API
export const collectionsApi = {
  // Get all collections for store
  getAll: async (storeSlug) => {
    return apiCall(`/api/collections/${storeSlug}`);
  },
  
  // Get collection by ID
  getById: async (storeSlug, collectionId) => {
    return apiCall(`/api/collections/${storeSlug}/${collectionId}`);
  },
  
  // Search collections
  search: async (storeSlug, query) => {
    return apiCall(`/api/collections/${storeSlug}/search?q=${encodeURIComponent(query)}`);
  }
};

// Products API
export const productsApi = {
  // Get all products for store
  getAll: async (storeSlug, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/products/${storeSlug}${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get products by collection
  getByCollection: async (storeSlug, collectionId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/products/${storeSlug}/collection/${collectionId}${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get featured products
  getFeatured: async (storeSlug, limit = 8) => {
    return apiCall(`/api/products/${storeSlug}/featured?limit=${limit}`);
  },
  
  // Get new products
  getNew: async (storeSlug, limit = 8) => {
    return apiCall(`/api/products/${storeSlug}/new?limit=${limit}`);
  },
  
  // Search products
  search: async (storeSlug, query, params = {}) => {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return apiCall(`/api/products/${storeSlug}/search?${queryString}`);
  },
  
  // Get product by ID
  getById: async (storeSlug, productId) => {
    return apiCall(`/api/products/${storeSlug}/${productId}`);
  }
};

// Menus API
export const menusApi = {
  // Get all menus for store
  getAll: async (storeSlug) => {
    return apiCall(`/api/menus/${storeSlug}`);
  },
  
  // Get menu by ID
  getById: async (storeSlug, menuId) => {
    return apiCall(`/api/menus/${storeSlug}/${menuId}`);
  },
  
  // Get menu by handle
  getByHandle: async (storeSlug, handle) => {
    return apiCall(`/api/menus/${storeSlug}/handle/${handle}`);
  }
};

// Media API
export const mediaApi = {
  // Upload image
  uploadImage: async (file, folder = 'sections') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return apiCall('/api/media/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },
  
  // Upload video
  uploadVideo: async (file, folder = 'videos') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return apiCall('/api/media/upload-video', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },
  
  // Get media library
  getLibrary: async (type = 'all', page = 1, limit = 20) => {
    return apiCall(`/api/media/library?type=${type}&page=${page}&limit=${limit}`);
  }
};

// Newsletter API
export const newsletterApi = {
  // Subscribe to newsletter
  subscribe: async (storeSlug, email, name = '') => {
    return apiCall(`/api/newsletter/${storeSlug}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ email, name })
    });
  },
  
  // Get newsletter settings
  getSettings: async (storeSlug) => {
    return apiCall(`/api/newsletter/${storeSlug}/settings`);
  },
  
  // Update newsletter settings
  updateSettings: async (storeSlug, settings) => {
    return apiCall(`/api/newsletter/${storeSlug}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};

// Contact Form API
export const contactApi = {
  // Submit contact form
  submit: async (storeSlug, formData) => {
    return apiCall(`/api/contact/${storeSlug}/submit`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },
  
  // Get contact form settings
  getSettings: async (storeSlug) => {
    return apiCall(`/api/contact/${storeSlug}/settings`);
  },
  
  // Update contact form settings
  updateSettings: async (storeSlug, settings) => {
    return apiCall(`/api/contact/${storeSlug}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};

// Blog API
export const blogApi = {
  // Get blog posts
  getPosts: async (storeSlug, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/blog/${storeSlug}/posts${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get recent posts
  getRecent: async (storeSlug, limit = 6) => {
    return apiCall(`/api/blog/${storeSlug}/posts/recent?limit=${limit}`);
  },
  
  // Get post by slug
  getBySlug: async (storeSlug, slug) => {
    return apiCall(`/api/blog/${storeSlug}/posts/${slug}`);
  }
};

// Analytics API
export const analyticsApi = {
  // Get basic stats for social proof
  getStats: async (storeSlug) => {
    return apiCall(`/api/analytics/${storeSlug}/stats`);
  },
  
  // Get recent activity for social proof
  getRecentActivity: async (storeSlug, limit = 10) => {
    return apiCall(`/api/analytics/${storeSlug}/recent-activity?limit=${limit}`);
  }
};

// Testimonials API (if you have a testimonials system)
export const testimonialsApi = {
  // Get testimonials
  getAll: async (storeSlug, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/testimonials/${storeSlug}${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get featured testimonials
  getFeatured: async (storeSlug, limit = 6) => {
    return apiCall(`/api/testimonials/${storeSlug}/featured?limit=${limit}`);
  }
};

// FAQ API (if you have an FAQ system)
export const faqApi = {
  // Get FAQ items
  getAll: async (storeSlug, category = null) => {
    const url = category 
      ? `/api/faq/${storeSlug}?category=${category}`
      : `/api/faq/${storeSlug}`;
    return apiCall(url);
  },
  
  // Get FAQ categories
  getCategories: async (storeSlug) => {
    return apiCall(`/api/faq/${storeSlug}/categories`);
  }
};

// Store Settings API
export const storeSettingsApi = {
  // Get store information
  getStoreInfo: async (storeSlug) => {
    return apiCall(`/api/stores/${storeSlug}/info`);
  },
  
  // Get store location for map
  getLocation: async (storeSlug) => {
    return apiCall(`/api/stores/${storeSlug}/location`);
  },
  
  // Update store location
  updateLocation: async (storeSlug, location) => {
    return apiCall(`/api/stores/${storeSlug}/location`, {
      method: 'PUT',
      body: JSON.stringify(location)
    });
  }
};

// Font API (for font picker)
export const fontApi = {
  // Get available Google Fonts
  getGoogleFonts: async () => {
    // This could be cached or fetched from Google Fonts API
    return apiCall('/api/fonts/google');
  },
  
  // Get system fonts
  getSystemFonts: () => {
    return Promise.resolve([
      { family: 'Arial', category: 'sans-serif' },
      { family: 'Helvetica', category: 'sans-serif' },
      { family: 'Times New Roman', category: 'serif' },
      { family: 'Georgia', category: 'serif' },
      { family: 'Courier New', category: 'monospace' },
      { family: 'Noto Sans Hebrew', category: 'sans-serif' },
      { family: 'Assistant', category: 'sans-serif' },
      { family: 'Heebo', category: 'sans-serif' },
      { family: 'Rubik', category: 'sans-serif' }
    ]);
  }
};

// Icon API (for icon picker)
export const iconApi = {
  // Get available icon libraries
  getLibraries: () => {
    return Promise.resolve([
      { id: 'lucide', name: 'Lucide', count: 1000 },
      { id: 'heroicons', name: 'Heroicons', count: 500 },
      { id: 'feather', name: 'Feather', count: 300 }
    ]);
  },
  
  // Get icons by library
  getIcons: async (library, category = null) => {
    // This would return icon data for the picker
    return apiCall(`/api/icons/${library}${category ? `?category=${category}` : ''}`);
  }
};

// Export all APIs
export default {
  collections: collectionsApi,
  products: productsApi,
  menus: menusApi,
  media: mediaApi,
  newsletter: newsletterApi,
  contact: contactApi,
  blog: blogApi,
  analytics: analyticsApi,
  testimonials: testimonialsApi,
  faq: faqApi,
  storeSettings: storeSettingsApi,
  fonts: fontApi,
  icons: iconApi
};

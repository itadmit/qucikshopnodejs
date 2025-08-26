// Test API connection
import apiService from '../services/api.js';

export async function testApiConnection() {
  try {
    // Test health endpoint
    const health = await apiService.healthCheck();
    
    // Check if user is logged in with real token
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      apiService.setToken(existingToken);
    
      try {
        await apiService.getDashboardStats();
      } catch (error) {
        // If token is invalid, clear it
        if (error.message.includes('Invalid or expired token') || error.message.includes('401')) {
          localStorage.removeItem('authToken');
          apiService.setToken(null);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testApiConnection();
}

// Add global function to clear token for debugging
window.clearAuthToken = () => {
  localStorage.removeItem('authToken');
  console.log('🗑️ Auth token cleared from localStorage');
  location.reload();
};

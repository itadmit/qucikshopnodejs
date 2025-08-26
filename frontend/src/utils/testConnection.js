// Test API connection
import apiService from '../services/api.js';

export async function testApiConnection() {
  try {
    console.log('🔄 Testing API connection...');
    
    // Test health endpoint
    const health = await apiService.healthCheck();
    console.log('✅ Health check:', health);
    
    // Test with mock token for dashboard endpoints
    apiService.setToken('mock-token-for-testing');
    
    try {
      const stats = await apiService.getDashboardStats();
      console.log('✅ Dashboard stats:', stats);
    } catch (error) {
      console.log('⚠️ Dashboard stats (expected auth error):', error.message);
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

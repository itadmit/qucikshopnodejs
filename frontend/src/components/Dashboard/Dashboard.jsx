import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import apiService from '../../services/api.js';
import { 
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Palette,
  Menu,
  Layout,
  Truck,
  Percent
} from 'lucide-react';

// Import components
import DashboardHeader from './components/DashboardHeader.jsx';
import DashboardSidebar from './components/DashboardSidebar.jsx';

// Import pages
import OverviewPage from './pages/OverviewPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import DesignPage from './pages/DesignPage.jsx';
import MenusPage from './pages/MenusPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ShippingPage from './pages/ShippingPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx';
import CouponsPage from './pages/CouponsPage.jsx';
import CouponFormPage from './pages/CouponFormPage.jsx';
import AutomaticDiscountFormPage from './pages/AutomaticDiscountFormPage.jsx';
import SiteBuilderPage from '../SiteBuilder/pages/SiteBuilderPage.jsx';
import OnboardingTour from './components/OnboardingTour.jsx';

const Dashboard = ({ user, onLogout, onBack, onNavigateToBuilder }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userStore, setUserStore] = useState(null);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // Fetch user store data
  const fetchUserStore = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.log('No token found for user store');
        return;
      }
      
      apiService.setToken(token);
      const storeData = await apiService.getUserStore();
      setUserStore(storeData);
    } catch (err) {
      console.error('Failed to fetch user store:', err);
    }
  };

  // Handle store change
  const handleStoreChange = async (newStore) => {
    try {
      setUserStore(newStore);
      // Save selected store to localStorage for persistence
      localStorage.setItem('selectedStoreId', newStore.id);
      
      // Refresh dashboard data for the new store
      await fetchDashboardData();
      
      console.log('🔄 Switched to store:', newStore.name);
    } catch (err) {
      console.error('Failed to switch store:', err);
    }
  };

  // Dashboard data states
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    productsGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    revenueGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManualTourStart, setIsManualTourStart] = useState(false);

  // Handle onboarding tour completion
  const handleOnboardingComplete = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        apiService.setToken(token);
        await apiService.completeOnboarding();
        
        // עדכן את המשתמש ב-localStorage
        const updatedUser = { ...user, hasCompletedOnboarding: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('🎯 Dashboard: Onboarding completed, user updated');
      }
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    }
  };

  // Handle manual tour start
  const handleStartTour = () => {
    console.log('🎯 Dashboard: Starting manual tour, current state:', isManualTourStart);
    setIsManualTourStart(true);
  };

  // Handle manual tour close
  const handleManualTourClose = () => {
    setIsManualTourStart(false);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        setError('נדרש להתחבר כדי לצפות בנתונים');
        return;
      }
      
      // Set token in API service
      apiService.setToken(token);
      
      const [statsData, ordersData, productsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentOrders(),
        apiService.getPopularProducts()
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData);
      setPopularProducts(productsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      
      // If authentication error, clear token and redirect to login
      if (err.message.includes('401') || err.message.includes('403')) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('פג תוקף ההתחברות. אנא התחבר מחדש.');
        setTimeout(() => {
          onLogout();
        }, 2000);
        return;
      }
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUserStore();
  }, []);

  // Listen for location changes
  useEffect(() => {
    const newPath = location.pathname;
    setCurrentPath(newPath);
    
    if (newPath.includes('/products')) {
      setActiveTab('products');
    } else if (newPath.includes('/orders')) {
      setActiveTab('orders');
    } else if (newPath.includes('/customers')) {
      setActiveTab('customers');
    } else if (newPath.includes('/analytics')) {
      setActiveTab('analytics');
    } else if (newPath.includes('/design')) {
      setActiveTab('design');
    } else if (newPath.includes('/builder')) {
      setActiveTab('builder');
    } else if (newPath.includes('/menus')) {
      setActiveTab('menus');
    } else if (newPath.includes('/coupons')) {
      setActiveTab('coupons');
    } else if (newPath.includes('/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // Menu items for sidebar navigation
  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('dashboard.overview') || 'סקירה כללית' },
    { id: 'products', icon: ShoppingBag, label: t('dashboard.products') || 'מוצרים' },
    { id: 'orders', icon: ShoppingCart, label: t('dashboard.orders') || 'הזמנות' },
    { id: 'customers', icon: Users, label: t('dashboard.customers') || 'לקוחות' },
    { id: 'coupons', icon: Percent, label: t('dashboard.coupons') || 'קופונים והנחות' },
    { id: 'analytics', icon: BarChart3, label: t('dashboard.analytics') || 'אנליטיקס' },
    { id: 'design', icon: Palette, label: t('dashboard.design') || 'עיצוב האתר' },
    { id: 'builder', icon: Layout, label: t('dashboard.builder') || 'עורך האתר' },
    { id: 'menus', icon: Menu, label: t('dashboard.menus') || 'תפריטים' },
    { id: 'settings', icon: Settings, label: t('dashboard.settings') || 'הגדרות' }
  ];

  // Handle builder navigation
  useEffect(() => {
    if (activeTab === 'builder' && onNavigateToBuilder) {
      onNavigateToBuilder();
    }
  }, [activeTab, onNavigateToBuilder]);

  const renderTabContent = () => {
    // Check if we're on specific pages
    if (currentPath === '/dashboard/products/new' || currentPath.includes('/products/new')) {
      return <ProductFormPage />;
    }
    // Check for product edit page
    if (currentPath.includes('/dashboard/products/') && currentPath.includes('/edit')) {
      const productId = currentPath.split('/')[3]; // Extract product ID from URL
      return <ProductFormPage productId={productId} />;
    }
    if (currentPath === '/dashboard/products' || currentPath.includes('/products')) {
      return <ProductsPage />;
    }
    // Check for order details page
    if (currentPath.includes('/dashboard/orders/') && currentPath !== '/dashboard/orders') {
      const orderId = currentPath.split('/')[3]; // Extract order ID from URL
      return <OrderDetailsPage orderId={orderId} />;
    }
    // Check for coupon form pages
    if (currentPath === '/dashboard/coupons/new') {
      return <CouponFormPage />;
    }
    if (currentPath.includes('/dashboard/coupons/') && currentPath.includes('/edit')) {
      const couponId = currentPath.split('/')[3]; // Extract coupon ID from URL
      return <CouponFormPage />;
    }
    // Check for automatic discount form pages
    if (currentPath === '/dashboard/automatic-discounts/new') {
      return <AutomaticDiscountFormPage />;
    }
    if (currentPath.includes('/dashboard/automatic-discounts/') && currentPath.includes('/edit')) {
      const discountId = currentPath.split('/')[3]; // Extract discount ID from URL
      return <AutomaticDiscountFormPage />;
    }
    
    switch (activeTab) {
      case 'overview':
        return <OverviewPage stats={stats} recentOrders={recentOrders} popularProducts={popularProducts} userStore={userStore} />;
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'customers':
        return <CustomersPage />;
      case 'analytics':
        return <AnalyticsPage userStore={userStore} />;
      case 'design':
        return <DesignPage />;
      case 'builder':
        // Builder navigation is handled by useEffect above
        return <OverviewPage stats={stats} recentOrders={recentOrders} popularProducts={popularProducts} userStore={userStore} />;
      case 'menus':
        return <MenusPage />;
      case 'coupons':
        return <CouponsPage storeId={userStore?.id} />;
      case 'settings':
        return <SettingsPage userStore={userStore} />;
      default:
        return <OverviewPage stats={stats} recentOrders={recentOrders} popularProducts={popularProducts} userStore={userStore} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <ShoppingBag className="w-16 h-16 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת הנתונים</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden" dir="rtl" data-tour="welcome">
      {/* Sidebar */}
      <DashboardSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          user={user}
          userStore={userStore}
          activeTab={activeTab}
          menuItems={menuItems}
          loading={loading}
          fetchDashboardData={fetchDashboardData}
          setSidebarOpen={setSidebarOpen}
          onLogout={onLogout}
          onStartTour={handleStartTour}
          onStoreChange={handleStoreChange}
        />

                {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Onboarding Tour */}
      <OnboardingTour 
        user={user} 
        onComplete={handleOnboardingComplete}
        isManualStart={isManualTourStart}
        onManualClose={handleManualTourClose}
      />
    </div>
  );
};

export default Dashboard;
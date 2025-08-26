import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api.js';
import { 
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';

// Import components
import DashboardHeader from './components/DashboardHeader.jsx';
import DashboardSidebar from './components/DashboardSidebar.jsx';

// Import pages
import OverviewPage from './pages/OverviewPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const Dashboard = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userStore, setUserStore] = useState(null);

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

  // Menu items for sidebar navigation
  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('dashboard.overview') || 'סקירה כללית' },
    { id: 'products', icon: ShoppingBag, label: t('dashboard.products') || 'מוצרים' },
    { id: 'orders', icon: ShoppingCart, label: t('dashboard.orders') || 'הזמנות' },
    { id: 'customers', icon: Users, label: t('dashboard.customers') || 'לקוחות' },
    { id: 'analytics', icon: BarChart3, label: t('dashboard.analytics') || 'אנליטיקס' },
    { id: 'settings', icon: Settings, label: t('dashboard.settings') || 'הגדרות' }
  ];

  const renderTabContent = () => {
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
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
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
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
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
      <div className="flex-1">
        <DashboardHeader 
          user={user}
          userStore={userStore}
          activeTab={activeTab}
          menuItems={menuItems}
          loading={loading}
          fetchDashboardData={fetchDashboardData}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
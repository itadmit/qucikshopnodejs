import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Calendar,
  Copy,
  CheckCircle
} from 'lucide-react';

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const [influencerData, setInfluencerData] = useState(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    activeCoupons: 0,
    conversionRate: 0
  });
  const [coupons, setCoupons] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('influencerToken');
    const storedData = localStorage.getItem('influencerData');
    
    if (!token || !storedData) {
      navigate('/influencer/login');
      return;
    }
    
    setInfluencerData(JSON.parse(storedData));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('influencerToken');
      
      // Load stats
      const statsResponse = await fetch('http://localhost:3001/api/influencer-dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      // Load coupons
      const couponsResponse = await fetch('http://localhost:3001/api/influencer-dashboard/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (couponsResponse.ok) {
        const couponsData = await couponsResponse.json();
        setCoupons(couponsData);
      }
      
      // Load recent orders
      const ordersResponse = await fetch('http://localhost:3001/api/influencer-dashboard/recent-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('influencerToken');
    localStorage.removeItem('influencerData');
    navigate('/influencer/login');
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">דשבורד משפיען</h1>
                <p className="text-sm text-gray-600">שלום, {influencerData?.name}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>יציאה</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">סה"כ רווחים</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPrice(stats.totalEarnings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">סה"כ הזמנות</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">קופונים פעילים</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeCoupons}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">אחוז המרה</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-sm p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">אחוז העמלה שלך</h2>
              <p className="text-3xl font-bold">
                {(influencerData?.commissionRate * 100).toFixed(1)}%
              </p>
              <p className="text-purple-100 mt-1">מכל מכירה דרך הקופונים שלך</p>
            </div>
            <div className="text-6xl opacity-20">
              <DollarSign />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Coupons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">הקופונים שלי</h2>
            
            {coupons.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין קופונים משויכים עדיין</p>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{coupon.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        coupon.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coupon.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copiedCode === coupon.code ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      <span className="text-gray-600">
                        {coupon.discountType === 'PERCENTAGE' 
                          ? `${coupon.discountValue}%`
                          : formatPrice(coupon.discountValue)
                        }
                      </span>
                    </div>
                    
                    {coupon.description && (
                      <p className="text-sm text-gray-600 mt-2">{coupon.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>שימושים: {coupon.usageCount || 0}</span>
                      {coupon.expiresAt && (
                        <span>תוקף עד: {formatDate(coupon.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">הזמנות אחרונות</h2>
            
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין הזמנות עדיין</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        הזמנה #{order.id}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        קופון: <code className="bg-gray-100 px-1 rounded">{order.couponCode}</code>
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      העמלה שלך: {formatPrice(order.commission)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InfluencerDashboard;

import { 
  ShoppingCart,
  TrendingUp,
  Package,
  Plus,
  DollarSign,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import StoreSetupTodos from '../components/StoreSetupTodos.jsx';

const StatCard = ({ title, value, change, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center ml-3"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
      )}
    </div>
    <div>
      <p className="text-xl font-bold text-gray-900 mb-1">{value?.toLocaleString('he-IL') || '0'}</p>
      {change !== undefined && (
        <p className={`text-sm flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
          {Math.abs(change)}% מהחודש הקודם
        </p>
      )}
    </div>
  </div>
);

const OverviewPage = ({ stats, recentOrders, popularProducts, userStore }) => {
  const [dateRange, setDateRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">סקירה כללית</h1>
          <p className="text-gray-600">מבט על הביצועים של החנות שלך</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 pl-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="7d">7 ימים אחרונים</option>
            <option value="30d">30 ימים אחרונים</option>
            <option value="90d">90 ימים אחרונים</option>
            <option value="1y">שנה אחרונה</option>
          </select>
          <button 
            onClick={handleRefresh}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            ייצא דוח
          </button>
        </div>
      </div>

      {/* Version Update Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <span className="text-blue-600 text-sm font-medium">🚀</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">גרסה חדשה 2.1.0</h3>
              <p className="text-xs text-blue-700">מערכת פריסה אוטומטית, בדיקות בריאות משופרות ועוד!</p>
            </div>
          </div>
          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            עדכון חדש
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="overview-stats">
        <StatCard
          title="הכנסות כוללות"
          subtitle="30 ימים אחרונים"
          value={`₪${stats.totalRevenue?.toLocaleString('he-IL') || '0'}`}
          change={stats.revenueGrowth}
          trend={stats.revenueGrowth}
          icon={DollarSign}
          color="#dcfce7"
        />
        <StatCard
          title="הזמנות"
          subtitle="הזמנות שהתקבלו"
          value={stats.totalOrders}
          change={stats.ordersGrowth}
          trend={stats.ordersGrowth}
          icon={ShoppingCart}
          color="#dbeafe"
        />
        <StatCard
          title="לקוחות"
          subtitle="לקוחות רשומים"
          value={stats.totalCustomers}
          change={stats.customersGrowth}
          trend={stats.customersGrowth}
          icon={Users}
          color="#f3e8ff"
        />
        <StatCard
          title="צפיות בחנות"
          subtitle="ביקורים באתר"
          value={stats.storeViews || 0}
          change={stats.viewsGrowth}
          trend={stats.viewsGrowth}
          icon={Eye}
          color="#fef3c7"
        />
      </div>

      {/* Store Setup & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Store Setup Todos - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 p-6">
          <StoreSetupTodos storeId={userStore?.id} compact={true} />
        </div>

        {/* Quick Actions - 1/3 width */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">פעולות מהירות</h3>
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/dashboard/products/new');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-600 ml-3" />
                <span className="font-medium text-gray-900">הוסף מוצר חדש</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="w-5 h-5 text-green-600 ml-3" />
                <span className="font-medium text-gray-900">צור הזמנה ידנית</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 ml-3" />
                <span className="font-medium text-gray-900">הוסף לקוח</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-orange-600 ml-3" />
                <span className="font-medium text-gray-900">צפה בדוחות</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders - 6/12 width */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">הזמנות אחרונות</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {recentOrders?.length || 0} חדשות
              </span>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3">
            {recentOrders?.length > 0 ? recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                    <span className="text-xs font-medium text-blue-600">#{order.id}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{order.customerName || 'אורח'}</p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('he-IL') : 'היום'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">₪{order.total?.toLocaleString('he-IL') || '0'}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'DELIVERED' ? 'נמסר' :
                     order.status === 'PROCESSING' ? 'בעיבוד' : 'ממתין'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm">אין הזמנות אחרונות</p>
              </div>
            )}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            צפה בכל ההזמנות ←
          </button>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">מוצרים מובילים</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {popularProducts?.length > 0 ? popularProducts.slice(0, 5).map((product, index) => (
              <div key={product.id || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center ml-3">
                    <span className="text-xs font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales || 0} מכירות</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">₪{(product.price || 0).toLocaleString('he-IL')}</p>
                  <p className="text-xs text-green-600">+{product.growth || 0}%</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm">אין מוצרים פופולריים</p>
              </div>
            )}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            צפה בכל המוצרים ←
          </button>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">ביצועי מכירות</h3>
            <p className="text-sm text-gray-600">מכירות יומיות ב-30 הימים האחרונים</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-lg flex items-center justify-center border border-blue-200/50">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 mb-4 mx-auto w-fit">
              <TrendingUp className="w-16 h-16 text-blue-500 mx-auto" />
            </div>
            <p className="text-gray-700 font-medium text-lg mb-2">גרף ביצועים</p>
            <p className="text-gray-500">יתווסף בקרוב</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;


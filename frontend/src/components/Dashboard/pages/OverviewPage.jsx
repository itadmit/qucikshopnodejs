import { 
  ShoppingCart,
  TrendingUp,
  Package,
  Plus
} from 'lucide-react';
import StoreSetupTodos from '../components/StoreSetupTodos.jsx';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      </div>
      <div className="mr-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString('he-IL') || '0'}</p>
        {change !== undefined && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% מהחודש הקודם
          </p>
        )}
      </div>
    </div>
  </div>
);

const OverviewPage = ({ stats, recentOrders, popularProducts, userStore }) => {
  return (
    <div className="space-y-8">
      {/* Store Setup Todos */}
      <StoreSetupTodos storeId={userStore?.id} />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="סה״כ מוצרים"
          value={stats.totalProducts}
          change={stats.productsGrowth}
          icon={Package}
          color="#e1f5fe"
        />
        <StatCard
          title="הזמנות"
          value={stats.totalOrders}
          change={stats.ordersGrowth}
          icon={ShoppingCart}
          color="#f3e5f5"
        />
        <StatCard
          title="לקוחות"
          value={stats.totalCustomers}
          change={stats.customersGrowth}
          icon={TrendingUp}
          color="#e8f5e8"
        />
        <StatCard
          title="הכנסות"
          value={`₪${stats.totalRevenue?.toLocaleString('he-IL') || '0'}`}
          change={stats.revenueGrowth}
          icon={TrendingUp}
          color="#fbecc9"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">הזמנות אחרונות</h3>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div>
                  <p className="font-medium text-gray-900">#{order.id}</p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">₪{order.total?.toLocaleString('he-IL') || '0'}</p>
                  <p className="text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('he-IL') : 'ללא תאריך'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                אין הזמנות אחרונות
              </div>
            )}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            צפה בכל ההזמנות ←
          </button>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">מוצרים מובילים</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {popularProducts.length > 0 ? popularProducts.slice(0, 3).map((product, index) => (
              <div key={product.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales || 0} מכירות</p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">₪{(product.price || 0).toLocaleString('he-IL')}</p>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                אין מוצרים פופולריים
              </div>
            )}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            צפה בכל המוצרים ←
          </button>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="p-4">
        <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">משימות אחרונות</h3>
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
            style={{background: 'linear-gradient(270deg, #fbece3 0%, #eaceff 100%)', color: 'black'}}
          >
            <Plus className="w-4 h-4" style={{color: 'black'}} />
            <span className="font-medium" style={{color: 'black'}}>משימה חדשה</span>
          </button>
        </div>
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">אין משימות עדיין</p>
          <p className="text-gray-500">צור משימה חדשה כדי להתחיל</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default OverviewPage;

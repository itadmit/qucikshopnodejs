import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Users, 
  Eye, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock
} from 'lucide-react';
import api from '../../../services/api';

const AnalyticsPage = ({ userStore }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // קבלת נתונים מהשרת
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!userStore?.id) {
        throw new Error('Store not found');
      }

      const response = await api.get(`/analytics/dashboard/${userStore.id}`);
      
      // השרת מחזיר {success: true, data: {...}} אז הנתונים נמצאים ב-response.data
      if (response.data.success && response.data.data) {
        setAnalyticsData(response.data.data);
      } else {
        setAnalyticsData(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userStore?.id]);

  // קבלת נתונים בזמן אמת
  const fetchRealTimeData = useCallback(async () => {
    try {
      if (!userStore?.id) return;

      console.log('Fetching real-time data for store:', userStore.id);
      const response = await api.get(`/analytics/realtime/${userStore.id}`);
      console.log('Real-time response:', response.data);
      
      // הנתונים נמצאים ישירות ב-response.data, לא ב-response.data.data
      if (response.data.success && response.data.data) {
        setRealTimeData(response.data.data);
      } else {
        setRealTimeData(response.data);
      }
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching real-time data:', err);
    }
  }, [userStore?.id]);

  useEffect(() => {
    if (userStore?.id) {
      fetchAnalyticsData();
      fetchRealTimeData();

      // עדכון נתונים בזמן אמת כל 30 שניות (אופטימיזציה - פחות עומס על השרת)
      const realTimeInterval = setInterval(() => {
        // בדיקה שהעמוד פעיל ולא מוסתר
        if (!document.hidden) {
          fetchRealTimeData();
        }
      }, 30000);

      // עדכון נתונים כלליים כל דקה
      const dataInterval = setInterval(() => {
        if (!document.hidden) {
          fetchAnalyticsData();
        }
      }, 60000);
      
      return () => {
        clearInterval(realTimeInterval);
        clearInterval(dataInterval);
      };
    }
  }, [userStore?.id, fetchAnalyticsData, fetchRealTimeData]); // הוספת הפונקציות ל-dependencies

  // רכיב כרטיס מטריקה
  const MetricCard = ({ title, value, change, subtitle, icon: Icon, color = 'blue', isRealTime = false }) => {
    const isPositive = change >= 0;
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };

    return (
      <div className={`bg-white rounded-lg border p-6 ${isRealTime ? 'border-green-200 shadow-lg' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {isRealTime && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            
            {/* כיתוב משני או שינוי */}
            {subtitle ? (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            ) : change !== undefined ? (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 ml-1" />
                )}
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 mr-1">מאתמול</span>
              </div>
            ) : null}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // רכיב נתונים בזמן אמת
  const RealTimeWidget = () => {
    if (!realTimeData) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">פעילות בזמן אמת</h3>
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
            <span className="text-sm font-medium">פעיל עכשיו</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* משתמשים פעילים ב-10 דקות האחרונות */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 ml-2" />
                <span className="text-gray-800 font-medium">פעילים ב-10 דקות האחרונות</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {realTimeData.activeUsers || 0}
              </span>
            </div>
            <p className="text-xs text-blue-600">
              כולל גולשים שביקרו או צפו בדפים ב-10 דקות האחרונות
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-purple-500 ml-2" />
              <span className="text-gray-700">צפיות בשעה האחרונה</span>
            </div>
            <span className="text-xl font-bold text-purple-600">
              {realTimeData.currentHour?.pageViews || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-green-500 ml-2" />
              <span className="text-gray-700">אירועים ב-30 דקות</span>
            </div>
            <span className="text-lg font-semibold text-green-600">
              {realTimeData.recentActivity || 0}
            </span>
          </div>
          
          {/* אינדיקטור פעילות */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">עדכון אחרון</span>
              <span className="text-gray-600">
                {new Date().toLocaleTimeString('he-IL', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">אנליטיקה</h1>
            <p className="text-gray-600">צפה בנתונים ובדוחות</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">טוען נתונים...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">אנליטיקה</h1>
            <p className="text-gray-600">צפה בנתונים ובדוחות</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת הנתונים</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchAnalyticsData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">אנליטיקה</h1>
            <p className="text-gray-600">צפה בנתונים ובדוחות</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין נתונים עדיין</h3>
            <p className="text-gray-500">הנתונים והדוחות יופיעו כאן כשתתחיל לקבל הזמנות</p>
          </div>
        </div>
      </div>
    );
  }

  const { realTime, growth, summary } = analyticsData;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">אנליטיקה</h1>
          <p className="text-gray-600">צפה בנתונים ובדוחות בזמן אמת</p>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="text-sm text-gray-500">
            עדכון אחרון: {lastUpdate.toLocaleTimeString('he-IL', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <button 
            onClick={() => {
              fetchAnalyticsData();
              fetchRealTimeData();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Activity className="w-4 h-4 ml-2" />
            רענן נתונים
          </button>
        </div>
      </div>

      {/* מטריקות עיקריות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* כרטיסיית מבקרים בזמן אמת */}
        <MetricCard
          title="מבקרים בזמן אמת"
          value={realTimeData?.activeUsers || 0}
          subtitle="10 דקות אחרונות"
          icon={Users}
          color="green"
          isRealTime={true}
        />
        <MetricCard
          title="מבקרים היום"
          value={realTime.today.uniqueVisitors.toLocaleString()}
          change={growth.visitors}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="צפיות בדף"
          value={realTime.today.pageViews.toLocaleString()}
          change={growth.pageViews}
          icon={Eye}
          color="purple"
        />
        <MetricCard
          title="הזמנות היום"
          value={realTime.today.orders.toLocaleString()}
          change={growth.orders}
          icon={ShoppingCart}
          color="green"
        />
        <MetricCard
          title="הכנסות היום"
          value={`₪${realTime.today.revenue.toLocaleString()}`}
          change={growth.revenue}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* נתונים בזמן אמת נוספים */}
      <RealTimeWidget />

      {/* סיכום שבועי */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">סיכום השבוע האחרון</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.totalVisitors.toLocaleString()}</p>
            <p className="text-sm text-gray-600">סך מבקרים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{summary.totalPageViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600">סך צפיות</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{summary.totalOrders.toLocaleString()}</p>
            <p className="text-sm text-gray-600">סך הזמנות</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">₪{summary.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">סך הכנסות</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{summary.avgConversionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">שיעור המרה ממוצע</p>
          </div>
        </div>
      </div>

      {/* שיעור המרה */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ביצועים היום</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">שיעור המרה</span>
            <span className="text-lg font-semibold text-green-600">
              {realTime.today.conversionRate.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.min(realTime.today.conversionRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

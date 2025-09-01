import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../../config/environment.js';
import { BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  DollarSign,
  Store,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from 'lucide-react';

const PartnerAnalytics = ({ partner }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('revenue');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(`${getApiUrl('/partners/analytics')}?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // נתונים דמה לצורך הדגמה
      setAnalytics({
        summary: {
          totalRevenue: 2450,
          totalStores: 3,
          activeStores: 2,
          totalCommissions: 1850,
          monthlyGrowth: 15.3,
          storeGrowth: 25.0,
          revenueGrowth: 12.8
        },
        chartData: {
          revenue: [
            { date: '2025-01-01', value: 150 },
            { date: '2025-01-02', value: 200 },
            { date: '2025-01-03', value: 180 },
            { date: '2025-01-04', value: 220 },
            { date: '2025-01-05', value: 300 },
            { date: '2025-01-06', value: 280 },
            { date: '2025-01-07', value: 350 }
          ],
          stores: [
            { date: '2025-01-01', value: 1 },
            { date: '2025-01-02', value: 1 },
            { date: '2025-01-03', value: 2 },
            { date: '2025-01-04', value: 2 },
            { date: '2025-01-05', value: 3 },
            { date: '2025-01-06', value: 3 },
            { date: '2025-01-07', value: 3 }
          ],
          commissions: [
            { date: '2025-01-01', value: 85 },
            { date: '2025-01-02', value: 170 },
            { date: '2025-01-03', value: 255 },
            { date: '2025-01-04', value: 340 },
            { date: '2025-01-05', value: 425 },
            { date: '2025-01-06', value: 510 },
            { date: '2025-01-07', value: 595 }
          ]
        },
        topStores: [
          { name: 'תדמית', revenue: 1200, commissions: 850, growth: 25.5 },
          { name: 'חנות דמו', revenue: 800, commissions: 600, growth: 15.2 },
          { name: 'חנות בדיקה', revenue: 450, commissions: 400, growth: -5.1 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const SimpleChart = ({ data, type, color = 'blue' }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="flex items-end justify-between h-32 gap-1">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full bg-${color}-500 rounded-t transition-all duration-300 hover:bg-${color}-600`}
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${formatDate(point.date)}: ${type === 'revenue' ? formatCurrency(point.value) : point.value}`}
              />
              <span className="text-xs text-gray-500 mt-1">
                {formatDate(point.date)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">אנליטיקה</h1>
          <p className="text-gray-600 mt-2">עקוב אחר הביצועים והמגמות שלך</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 ימים אחרונים</option>
            <option value="30d">30 ימים אחרונים</option>
            <option value="90d">90 ימים אחרונים</option>
            <option value="1y">שנה אחרונה</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
            רענן
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <Download className="w-4 h-4" />
            ייצוא
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              {getGrowthIcon(analytics.summary.revenueGrowth)}
              <span className={`text-sm font-medium ${getGrowthColor(analytics.summary.revenueGrowth)}`}>
                {Math.abs(analytics.summary.revenueGrowth)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.totalRevenue)}</p>
          <p className="text-sm text-gray-600 mt-1">סה"כ הכנסות</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1">
              {getGrowthIcon(analytics.summary.storeGrowth)}
              <span className={`text-sm font-medium ${getGrowthColor(analytics.summary.storeGrowth)}`}>
                {Math.abs(analytics.summary.storeGrowth)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalStores}</p>
          <p className="text-sm text-gray-600 mt-1">סה"כ חנויות</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1">
              {getGrowthIcon(analytics.summary.monthlyGrowth)}
              <span className={`text-sm font-medium ${getGrowthColor(analytics.summary.monthlyGrowth)}`}>
                {Math.abs(analytics.summary.monthlyGrowth)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.totalCommissions)}</p>
          <p className="text-sm text-gray-600 mt-1">סה"כ עמלות</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">פעילות</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.summary.activeStores}</p>
          <p className="text-sm text-gray-600 mt-1">חנויות פעילות</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">הכנסות לאורך זמן</h3>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="revenue">הכנסות</option>
              <option value="commissions">עמלות</option>
              <option value="stores">חנויות</option>
            </select>
          </div>
          <SimpleChart 
            data={analytics.chartData[chartType]} 
            type={chartType}
            color={chartType === 'revenue' ? 'green' : chartType === 'commissions' ? 'purple' : 'blue'}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">החנויות המובילות</h3>
          <div className="space-y-4">
            {analytics.topStores.map((store, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{store.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(store.revenue)} הכנסות</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{formatCurrency(store.commissions)}</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(store.growth)}
                    <span className={`text-sm ${getGrowthColor(store.growth)}`}>
                      {Math.abs(store.growth)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">תובנות ביצועים</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">צמיחה חזקה</h4>
            <p className="text-sm text-gray-600">
              הרווחים שלך גדלו ב-{analytics.summary.revenueGrowth}% בחודש האחרון
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">הרחבת פורטפוליו</h4>
            <p className="text-sm text-gray-600">
              יש לך {analytics.summary.totalStores} חנויות פעילות עם פוטנציאל לצמיחה
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">עמלות יציבות</h4>
            <p className="text-sm text-gray-600">
              קצב העמלות שלך עקבי עם מגמת צמיחה חיובית
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerAnalytics;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity
} from 'lucide-react';
import api from '../../../services/api';

const PartnerOverview = ({ partner }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/partners/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">אירעה שגיאה בטעינת הנתונים</p>
      </div>
    );
  }

  const { stats, stores, recentCommissions, commissionRate } = dashboardData;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          שלום, {partner?.firstName} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          ברוך הבא לפאנל השותפים שלך. כאן תוכל לנהל את החנויות שלך ולעקוב אחר הרווחים.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">סה"כ</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalStores}</div>
          <p className="text-sm text-gray-600 mt-1">חנויות</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">פעילות</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeStores}</div>
          <p className="text-sm text-gray-600 mt-1">חנויות פעילות</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">רווחים</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</div>
          <p className="text-sm text-gray-600 mt-1">סה"כ עמלות</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">ממתין</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingEarnings)}</div>
          <p className="text-sm text-gray-600 mt-1">עמלות בהמתנה</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Stores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">חנויות אחרונות</h2>
              <Link
                to="/partners/dashboard/stores"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                הצג הכל
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stores.length > 0 ? (
              stores.map((store) => (
                <div key={store.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.store.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        נוצרה ב-{formatDate(store.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {store.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          פעילה
                        </span>
                      ) : store.status === 'DEVELOPMENT' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          בפיתוח
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          הועברה
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">עדיין לא יצרת חנויות</p>
                <Link
                  to="/partners/dashboard/stores/new"
                  className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                >
                  צור חנות ראשונה →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Commissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">עמלות אחרונות</h2>
              <Link
                to="/partners/dashboard/commissions"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                הצג הכל
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCommissions.length > 0 ? (
              recentCommissions.map((commission) => (
                <div key={commission.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {commission.partnerStore.store.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(commission.earnedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(commission.amount)}</p>
                      {commission.status === 'PAID' ? (
                        <span className="text-xs text-green-600">שולם</span>
                      ) : commission.status === 'APPROVED' ? (
                        <span className="text-xs text-blue-600">אושר</span>
                      ) : (
                        <span className="text-xs text-yellow-600">ממתין</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">אין עמלות עדיין</p>
                <p className="text-sm text-gray-400 mt-2">
                  עמלות יופיעו כאן כשחנויות יעברו לתשלום
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commission Rate Banner */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">העמלה הנוכחית שלך</h3>
            <p className="text-blue-100">
              אתה מרוויח {formatCurrency(commissionRate)} על כל חנות פעילה
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{formatCurrency(commissionRate)}</p>
            <p className="text-sm text-blue-100 mt-1">לחנות</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/partners/dashboard/stores/new"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                צור חנות חדשה
              </h3>
              <p className="text-sm text-gray-500 mt-1">התחל בפיתוח חנות חדשה</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
        </Link>

        <Link
          to="/partners/dashboard/resources"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                מרכז משאבים
              </h3>
              <p className="text-sm text-gray-500 mt-1">מדריכים וכלי עזרה</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
        </Link>

        <Link
          to="/partners/dashboard/analytics"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                דוחות וניתוחים
              </h3>
              <p className="text-sm text-gray-500 mt-1">נתונים מפורטים על הביצועים</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PartnerOverview;

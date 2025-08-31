import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  ChevronDown,
  Receipt
} from 'lucide-react';

const PartnerCommissions = ({ partner }) => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalPending: 0,
    totalPaid: 0,
    thisMonthEarned: 0,
    lastMonthEarned: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    fetchCommissions();
  }, [filterStatus, filterPeriod]);

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem('partnerToken');
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPeriod !== 'all') params.append('period', filterPeriod);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/partners/commissions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch commissions');
      }
      
      const data = await response.json();
      setCommissions(data.commissions || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching commissions:', error);
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
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            ממתין
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            מאושר
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CreditCard className="w-3 h-3 mr-1" />
            שולם
          </span>
        );
      default:
        return null;
    }
  };

  const requestPayout = async () => {
    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/partners/payouts/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to request payout');
      }
      
      // רענן את הנתונים
      fetchCommissions();
      alert('בקשת המשיכה נשלחה בהצלחה!');
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('אירעה שגיאה בשליחת בקשת המשיכה');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">עמלות</h1>
        <p className="text-gray-600 mt-2">עקוב אחר הרווחים והתשלומים שלך</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">סה"כ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarned)}</p>
          <p className="text-sm text-gray-600 mt-1">סה"כ הרווחים</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs text-gray-500">ממתין</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPending)}</p>
          <p className="text-sm text-gray-600 mt-1">ממתין לאישור</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">זמין למשיכה</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
          <p className="text-sm text-gray-600 mt-1">זמין למשיכה</p>
          {stats.totalPaid >= 500 && (
            <button
              onClick={requestPayout}
              className="mt-3 w-full text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition"
            >
              בקש משיכה
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">החודש</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthEarned)}</p>
          <div className="flex items-center mt-1">
            {stats.monthlyGrowth > 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
              </>
            ) : stats.monthlyGrowth < 0 ? (
              <>
                <ArrowDownRight className="w-4 h-4 text-red-500 ml-1" />
                <span className="text-sm text-red-600">{stats.monthlyGrowth}%</span>
              </>
            ) : (
              <span className="text-sm text-gray-600">ללא שינוי</span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="PENDING">ממתין</option>
              <option value="APPROVED">מאושר</option>
              <option value="PAID">שולם</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">כל התקופה</option>
              <option value="today">היום</option>
              <option value="week">השבוע</option>
              <option value="month">החודש</option>
              <option value="year">השנה</option>
            </select>
          </div>
          <button className="mr-auto flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <Download className="w-4 h-4" />
            ייצוא לאקסל
          </button>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    חנות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סכום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(commission.earnedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {commission.partnerStore.store.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {commission.partnerStore.store.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(commission.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(commission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">אין עמלות עדיין</h3>
            <p className="text-gray-600">
              העמלות יופיעו כאן כשהחנויות שיצרת יעברו לתוכנית בתשלום
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 ml-3" />
          <div className="text-sm text-blue-800">
            <h4 className="font-semibold mb-2">איך זה עובד?</h4>
            <ul className="space-y-1">
              <li>• תקבל עמלה עבור כל חנות שתעבור לתוכנית בתשלום</li>
              <li>• העמלה משולמת בסוף כל חודש</li>
              <li>• ניתן למשוך כספים החל מ-500 ₪</li>
              <li>• עמלות נשמרות למשך 90 יום מיום ההפעלה</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerCommissions;
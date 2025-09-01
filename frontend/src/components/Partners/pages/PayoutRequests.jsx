import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../../config/environment.js';
import { Wallet,
  Plus,
  Calendar,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  User,
  DollarSign,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

const PayoutRequests = ({ partner }) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPayouts();
    fetchAvailableBalance();
  }, [filterStatus]);

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem('partnerToken');
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`${getApiUrl('/partners/payouts')}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payouts');
      }
      
      const data = await response.json();
      setPayouts(data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      // נתונים דמה
      setPayouts([
        {
          id: 1,
          amount: 850,
          status: 'PENDING',
          requestedAt: '2025-01-15T10:00:00Z',
          processedAt: null,
          bankDetails: { accountNumber: '****1234', bankName: 'בנק הפועלים' },
          notes: null
        },
        {
          id: 2,
          amount: 1200,
          status: 'COMPLETED',
          requestedAt: '2025-01-01T10:00:00Z',
          processedAt: '2025-01-03T14:30:00Z',
          bankDetails: { accountNumber: '****1234', bankName: 'בנק הפועלים' },
          transactionId: 'TXN-123456'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBalance = async () => {
    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(getApiUrl('/partners/commissions/balance'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const data = await response.json();
      setAvailableBalance(data.availableBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setAvailableBalance(1450); // נתון דמה
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            ממתין לעיבוד
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="w-4 h-4 mr-1" />
            בעיבוד
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            הושלם
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <X className="w-4 h-4 mr-1" />
            נדחה
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">בקשות משיכה</h1>
          <p className="text-gray-600 mt-2">נהל את בקשות המשיכה והתשלומים שלך</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          disabled={availableBalance < 500}
          className="text-black px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ 
            background: availableBalance >= 500 
              ? 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' 
              : '#f3f4f6' 
          }}
        >
          <Plus className="w-5 h-5" />
          בקש משיכה
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">יתרה זמינה למשיכה</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(availableBalance)}</p>
              <p className="text-sm text-gray-600 mt-1">
                {availableBalance >= 500 ? 'ניתן למשוך החל מ-500 ₪' : 'מינימום למשיכה: 500 ₪'}
              </p>
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-green-600">
              <ArrowUpRight className="w-5 h-5" />
              <span className="text-sm font-medium">+12.5% מהחודש הקודם</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
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
              <option value="PROCESSING">בעיבוד</option>
              <option value="COMPLETED">הושלם</option>
              <option value="REJECTED">נדחה</option>
            </select>
          </div>
          <button className="mr-auto flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <Download className="w-4 h-4" />
            ייצוא לאקסל
          </button>
        </div>
      </div>

      {/* Payouts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase">
                    תאריך בקשה
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase">
                    סכום
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase">
                    סטטוס
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase">
                    חשבון בנק
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase">
                    תאריך עיבוד
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payout.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{payout.bankDetails?.bankName}</span>
                        <span className="text-gray-500">({payout.bankDetails?.accountNumber})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-700">
                        פרטים
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">אין בקשות משיכה עדיין</h3>
            <p className="text-gray-600 mb-6">
              כשתצבור יתרה של 500 ₪ לפחות, תוכל לבקש משיכה
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              disabled={availableBalance < 500}
              className="text-black px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: availableBalance >= 500 
                  ? 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' 
                  : '#f3f4f6' 
              }}
            >
              בקש משיכה ראשונה
            </button>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && (
        <PayoutRequestModal
          availableBalance={availableBalance}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            fetchPayouts();
            fetchAvailableBalance();
          }}
        />
      )}
    </div>
  );
};

// Modal Component
const PayoutRequestModal = ({ availableBalance, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    branchNumber: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(getApiUrl('/partners/payouts/request'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          bankDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountHolder: formData.accountHolder,
            branchNumber: formData.branchNumber
          },
          notes: formData.notes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'אירעה שגיאה בשליחת הבקשה');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">בקשת משיכה</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Available Balance */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-800">יתרה זמינה</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(availableBalance)}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סכום למשיכה
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="500"
                max={availableBalance}
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                מינימום: 500 ₪, מקסימום: {formatCurrency(availableBalance)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם הבנק
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">בחר בנק</option>
                <option value="בנק הפועלים">בנק הפועלים</option>
                <option value="בנק לאומי">בנק לאומי</option>
                <option value="בנק דיסקונט">בנק דיסקונט</option>
                <option value="בנק מזרחי">בנק מזרחי</option>
                <option value="בנק יהב">בנק יהב</option>
                <option value="בנק אוצר החייל">בנק אוצר החייל</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מספר חשבון
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                  placeholder="123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מספר סניף
                </label>
                <input
                  type="text"
                  name="branchNumber"
                  value={formData.branchNumber}
                  onChange={handleChange}
                  required
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם בעל החשבון
              </label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                required
                placeholder="ישראל ישראלי"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                הערות (אופציונלי)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="הערות נוספות..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-black px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  שולח...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  שלח בקשה
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutRequests;

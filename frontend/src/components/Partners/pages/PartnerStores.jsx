import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Store,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Send,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  ShoppingCart,
  Users as UsersIcon,
  ArrowRight
} from 'lucide-react';
import api from '../../../services/api';
import CreateStore from './CreateStore';
import TransferStore from './TransferStore';

const PartnerStores = ({ partner }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [location.pathname]); // רענון כשחוזרים לדף או כשהקומפוננטה נטענת

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/partners/stores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            פעילה
          </span>
        );
      case 'DEVELOPMENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            בפיתוח
          </span>
        );
      case 'TRANSFERRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            הועברה
          </span>
        );
      default:
        return null;
    }
  };

  const copyStoreUrl = (slug) => {
    const url = `https://${slug}.quickshop.co.il`;
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  };

  const filteredStores = stores && Array.isArray(stores) ? stores.filter(store => {
    const matchesSearch = store.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.store.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || store.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) : [];

  const totalCommissions = stores && Array.isArray(stores) ? stores.reduce((sum, store) => {
    return sum + store.commissions.reduce((s, c) => s + parseFloat(c.amount), 0);
  }, 0) : 0;

  return (
    <Routes>
      <Route path="/" element={
        <div>
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">החנויות שלי</h1>
                <p className="text-gray-600 mt-2">נהל את כל החנויות שיצרת</p>
              </div>
            </div>
            <div className="flex justify-start">
              <Link
                to="/partners/dashboard/stores/new"
                className="text-black px-6 py-3 rounded-xl flex items-center space-x-2 space-x-reverse hover:opacity-90 transition-all duration-200 shadow-lg font-medium"
                style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}
              >
                <Plus className="w-5 h-5" />
                <span>חנות חדשה</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">סה"כ חנויות</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stores?.length || 0}</p>
                </div>
                <Store className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">חנויות פעילות</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stores?.filter(s => s.status === 'ACTIVE').length || 0}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">סה"כ עמלות</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCommissions)}</p>
                </div>
                <Package className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="חיפוש לפי שם או כתובת..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">כל החנויות</option>
                  <option value="DEVELOPMENT">בפיתוח</option>
                  <option value="TRANSFERRED">הועברו</option>
                  <option value="ACTIVE">פעילות</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stores List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((partnerStore) => (
                <div key={partnerStore.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{partnerStore.store.name}</h3>
                        <p className="text-sm text-gray-500">{partnerStore.store.slug}.quickshop.co.il</p>
                      </div>
                      {getStatusBadge(partnerStore.status)}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">נוצרה</span>
                        <span className="text-gray-900">{formatDate(partnerStore.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">מוצרים</span>
                        <span className="text-gray-900">{partnerStore.store._count.products}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">הזמנות</span>
                        <span className="text-gray-900">{partnerStore.store._count.orders}</span>
                      </div>
                      {partnerStore.commissions.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">עמלות</span>
                          <span className="text-green-600 font-semibold">
                            {formatCurrency(partnerStore.commissions.reduce((s, c) => s + parseFloat(c.amount), 0))}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {partnerStore.status === 'DEVELOPMENT' ? (
                        <>
                          <a
                            href={`https://${partnerStore.store.slug}.quickshop.co.il`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            צפה
                          </a>
                          <button
                            onClick={() => {
                              setSelectedStore(partnerStore);
                              setShowTransferModal(true);
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1"
                          >
                            <Send className="w-4 h-4" />
                            העבר
                          </button>
                        </>
                      ) : (
                        <>
                          <a
                            href={`https://${partnerStore.store.slug}.quickshop.co.il`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            צפה
                          </a>
                          <button
                            onClick={() => copyStoreUrl(partnerStore.store.slug)}
                            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'לא נמצאו חנויות' : 'עדיין אין לך חנויות'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'נסה לשנות את מילות החיפוש או הסינון'
                  : 'צור את החנות הראשונה שלך והתחל להרוויח עמלות'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link
                  to="/partners/dashboard/stores/new"
                  className="inline-flex items-center px-6 py-3 text-black rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg font-medium"
                  style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}
                >
                  <Plus className="w-5 h-5 ml-2" />
                  צור חנות ראשונה
                </Link>
              )}
            </div>
          )}

          {/* Transfer Modal */}
          {showTransferModal && selectedStore && (
            <TransferStore
              store={selectedStore}
              onClose={() => {
                setShowTransferModal(false);
                setSelectedStore(null);
              }}
              onSuccess={() => {
                setShowTransferModal(false);
                setSelectedStore(null);
                fetchStores();
              }}
            />
          )}
        </div>
      } />
      <Route path="/new" element={<CreateStore onSuccess={() => navigate('/partners/dashboard/stores')} />} />
    </Routes>
  );
};

export default PartnerStores;

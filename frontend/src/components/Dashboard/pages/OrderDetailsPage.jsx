import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Phone,
  Mail,
  Edit,
  Printer,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Plus,
  MessageSquare,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import apiService from '../../../services/api.js';

const OrderDetailsPage = ({ orderId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Fetch order data from API
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (!token) {
          navigate('/dashboard/orders');
          return;
        }
        
        apiService.setToken(token);
        const result = await apiService.getOrder(orderId);
        
        if (result.success) {
          setOrder(result.data);
        } else {
          console.error('Failed to fetch order');
          navigate('/dashboard/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        navigate('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  // Only use real data from API
  if (!order && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">הזמנה לא נמצאה</h3>
          <p className="text-gray-500 mb-6">לא ניתן לטעון את פרטי ההזמנה</p>
          <button 
            onClick={() => navigate('/dashboard/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            חזור לרשימת הזמנות
          </button>
        </div>
      </div>
    );
  }

  const displayOrder = order;

  const getStatusBadge = (status, type = 'order') => {
    const statusConfig = {
      order: {
        PENDING: { label: t('orderDetails.status.pending', 'ממתין'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        PROCESSING: { label: t('orderDetails.status.processing', 'בעיבוד'), color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
        SHIPPED: { label: t('orderDetails.status.shipped', 'נשלח'), color: 'bg-purple-100 text-purple-800', icon: Truck },
        DELIVERED: { label: t('orderDetails.status.delivered', 'נמסר'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
        CANCELLED: { label: t('orderDetails.status.cancelled', 'בוטל'), color: 'bg-red-100 text-red-800', icon: X }
      },
      payment: {
        PENDING: { label: t('orderDetails.payment.pending', 'ממתין לתשלום'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        PAID: { label: t('orderDetails.payment.paid', 'שולם'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
        FAILED: { label: t('orderDetails.payment.failed', 'נכשל'), color: 'bg-red-100 text-red-800', icon: AlertCircle },
        REFUNDED: { label: t('orderDetails.payment.refunded', 'הוחזר'), color: 'bg-gray-100 text-gray-800', icon: RefreshCw }
      },
      fulfillment: {
        UNFULFILLED: { label: t('orderDetails.fulfillment.unfulfilled', 'לא מולא'), color: 'bg-gray-100 text-gray-800', icon: Package },
        PARTIAL: { label: t('orderDetails.fulfillment.partial', 'מולא חלקית'), color: 'bg-yellow-100 text-yellow-800', icon: Package },
        FULFILLED: { label: t('orderDetails.fulfillment.fulfilled', 'מולא'), color: 'bg-green-100 text-green-800', icon: CheckCircle }
      }
    };

    const config = statusConfig[type][status] || statusConfig[type].PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleStatusUpdate = (newStatus) => {
    // TODO: API call to update status
    setOrder(prev => ({ ...prev, status: newStatus }));
    setShowStatusModal(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      content: newNote,
      createdAt: new Date().toISOString(),
      createdBy: 'יוגב אדמיט'
    };
    
    setOrder(prev => ({
      ...prev,
      notes: [note, ...prev.notes]
    }));
    setNewNote('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('orderDetails.loading', 'טוען פרטי הזמנה...')}</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('orderDetails.header.title', 'הזמנה #{{orderNumber}}', { orderNumber: displayOrder.orderNumber })}</h1>
              <p className="text-gray-600">{t('orderDetails.header.createdAt', 'נוצרה ב-{{date}}', { date: formatDate(displayOrder.createdAt) })}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              <Printer className="w-4 h-4 ml-2" />
              {t('orderDetails.actions.print', 'הדפס')}
            </button>
            <button 
              onClick={() => setShowStatusModal(true)}
              className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit className="w-4 h-4 ml-2" />
              {t('orderDetails.actions.updateStatus', 'עדכן סטטוס')}
            </button>
          </div>
        </div>
        
        {/* Status Badges */}
        <div className="flex items-center space-x-4 space-x-reverse pt-4 border-t border-gray-100 mt-4">
          {getStatusBadge(displayOrder.status, 'order')}
          {getStatusBadge(displayOrder.paymentStatus, 'payment')}
          {getStatusBadge(displayOrder.fulfillmentStatus, 'fulfillment')}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          {[
            { id: 'details', label: t('orderDetails.tabs.details', 'פרטי הזמנה'), icon: Package },
            { id: 'timeline', label: t('orderDetails.tabs.timeline', 'ציר זמן'), icon: Calendar },
            { id: 'notes', label: t('orderDetails.tabs.notes', 'הערות'), icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 ml-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 ml-2 text-gray-500" />
                {t('orderDetails.sections.orderItems', 'פריטי ההזמנה')}
              </h3>
              <div className="space-y-4">
                {(displayOrder.items || []).map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 space-x-reverse p-4 border border-gray-100 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                      {item.variantOptions && (
                        <div className="flex space-x-2 space-x-reverse mt-1">
                          {Object.entries(item.variantOptions).map(([key, value]) => (
                            <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">כמות: {item.quantity}</p>
                      <p className="text-sm text-gray-500">{formatPrice(item.price)} ליחידה</p>
                      <p className="font-semibold text-gray-900">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">סכום ביניים:</span>
                    <span>{formatPrice(displayOrder.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">משלוח:</span>
                    <span>{formatPrice(displayOrder.shippingAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">מע"מ:</span>
                    <span>{formatPrice(displayOrder.taxAmount || 0)}</span>
                  </div>
                  {(displayOrder.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>הנחה:</span>
                      <span>-{formatPrice(displayOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span>סה"כ:</span>
                    <span>{formatPrice(displayOrder.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  {t('orderDetails.sections.customerInfo', 'פרטי לקוח')}
                </h3>
                <button className="text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {displayOrder.customer?.firstName} {displayOrder.customer?.lastName}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 ml-2" />
                  {displayOrder.customer?.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 ml-2" />
                  {displayOrder.customer?.phone}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 ml-2" />
                {t('orderDetails.sections.shippingAddress', 'כתובת משלוח')}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {displayOrder.shippingAddress?.firstName} {displayOrder.shippingAddress?.lastName}
                </p>
                <p>{displayOrder.shippingAddress?.addressLine1}</p>
                {displayOrder.shippingAddress?.addressLine2 && <p>{displayOrder.shippingAddress.addressLine2}</p>}
                <p>{displayOrder.shippingAddress?.city} {displayOrder.shippingAddress?.postalCode}</p>
                <p>{displayOrder.shippingAddress?.country}</p>
                <p className="flex items-center mt-2">
                  <Phone className="w-4 h-4 ml-1" />
                  {displayOrder.shippingAddress?.phone}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 ml-2" />
                {t('orderDetails.sections.paymentInfo', 'פרטי תשלום')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">אמצעי תשלום:</span>
                  <span className="font-medium">{displayOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">מספר כרטיס:</span>
                  <span className="font-medium">{displayOrder.paymentReference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">סטטוס:</span>
                  {getStatusBadge(displayOrder.paymentStatus, 'payment')}
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 ml-2" />
                {t('orderDetails.sections.shippingInfo', 'פרטי משלוח')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">שיטת משלוח:</span>
                  <span className="font-medium">{displayOrder.shippingMethod}</span>
                </div>
                {displayOrder.trackingNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">מספר מעקב:</span>
                    <div className="flex items-center">
                      <span className="font-medium ml-2">{displayOrder.trackingNumber}</span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">סטטוס:</span>
                  {getStatusBadge(displayOrder.fulfillmentStatus, 'fulfillment')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">ציר זמן של ההזמנה</h3>
          <div className="space-y-6">
            {(displayOrder.timeline || []).map((event, index) => (
              <div key={event.id} className="flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  event.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {event.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="mr-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${event.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {event.title}
                    </h4>
                    {event.timestamp && (
                      <span className="text-sm text-gray-500">
                        {formatDate(event.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${event.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                    {event.description}
                  </p>
                </div>
                {index < displayOrder.timeline.length - 1 && (
                  <div className={`absolute right-4 mt-8 w-0.5 h-6 ${
                    event.completed ? 'bg-green-200' : 'bg-gray-200'
                  }`} style={{ marginRight: '15px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Add Note */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">הוסף הערה</h3>
            <div className="space-y-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="הכנס הערה על ההזמנה..."
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף הערה
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">הערות קיימות</h3>
            <div className="space-y-4">
              {(displayOrder.notes || []).map((note) => (
                <div key={note.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{note.createdBy}</span>
                    <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">עדכן סטטוס הזמנה</h3>
            <div className="space-y-3">
              {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`w-full text-right p-3 rounded-lg border transition-colors ${
                    displayOrder.status === status
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {getStatusBadge(status, 'order')}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;

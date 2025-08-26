import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Send,
  Printer
} from 'lucide-react';
import { useState } from 'react';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Mock data - יוחלף בנתונים אמיתיים מה-API
  const orders = [
    {
      id: 1001,
      orderNumber: 'ORD-1001',
      customer: {
        name: 'יוסי כהן',
        email: 'yossi@example.com',
        phone: '050-1234567'
      },
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      total: 299.90,
      currency: 'ILS',
      items: [
        { name: 'חולצת כותנה קלאסית', quantity: 2, price: 89.90 },
        { name: 'נעלי ספורט', quantity: 1, price: 120.10 }
      ],
      shippingAddress: {
        street: 'רחוב הרצל 123',
        city: 'תל אביב',
        postalCode: '12345'
      },
      createdAt: '2024-01-15T10:30:00Z',
      notes: 'משלוח דחוף'
    },
    {
      id: 1002,
      orderNumber: 'ORD-1002',
      customer: {
        name: 'שרה לוי',
        email: 'sarah@example.com',
        phone: '052-9876543'
      },
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      total: 159.80,
      currency: 'ILS',
      items: [
        { name: 'תיק גב עמיד', quantity: 1, price: 149.90 },
        { name: 'משלוח', quantity: 1, price: 9.90 }
      ],
      shippingAddress: {
        street: 'שדרות רוטשילד 45',
        city: 'תל אביב',
        postalCode: '65784'
      },
      trackingNumber: 'TRK123456789',
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: 1003,
      orderNumber: 'ORD-1003',
      customer: {
        name: 'דוד אברהם',
        email: 'david@example.com',
        phone: '054-5555555'
      },
      status: 'PENDING',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED',
      total: 89.90,
      currency: 'ILS',
      items: [
        { name: 'חולצת כותנה קלאסית', quantity: 1, price: 89.90 }
      ],
      shippingAddress: {
        street: 'רחוב בן גוריון 78',
        city: 'חיפה',
        postalCode: '31000'
      },
      createdAt: '2024-01-13T09:15:00Z'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { 
        label: 'ממתין', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      PROCESSING: { 
        label: 'בעיבוד', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Package 
      },
      SHIPPED: { 
        label: 'נשלח', 
        color: 'bg-purple-100 text-purple-800', 
        icon: Truck 
      },
      DELIVERED: { 
        label: 'נמסר', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle2 
      },
      CANCELLED: { 
        label: 'בוטל', 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle 
      },
      REFUNDED: { 
        label: 'הוחזר', 
        color: 'bg-gray-100 text-gray-800', 
        icon: AlertCircle 
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'ממתין לתשלום', color: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'שולם', color: 'bg-green-100 text-green-800' },
      FAILED: { label: 'נכשל', color: 'bg-red-100 text-red-800' },
      REFUNDED: { label: 'הוחזר', color: 'bg-gray-100 text-gray-800' },
      PARTIALLY_REFUNDED: { label: 'הוחזר חלקית', color: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const OrderCard = ({ order }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-3"
            checked={selectedOrders.includes(order.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedOrders([...selectedOrders, order.id]);
              } else {
                setSelectedOrders(selectedOrders.filter(id => id !== order.id));
              }
            }}
          />
          <div>
            <h3 className="font-medium text-gray-900">#{order.orderNumber}</h3>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('he-IL')} • {new Date(order.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <User className="w-4 h-4 ml-2" />
            {order.customer.name}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Mail className="w-4 h-4 ml-2" />
            {order.customer.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 ml-2" />
            {order.customer.phone}
          </div>
        </div>
        <div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <MapPin className="w-4 h-4 ml-2" />
            {order.shippingAddress.city}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <DollarSign className="w-4 h-4 ml-2" />
            ₪{order.total.toLocaleString('he-IL')}
          </div>
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {order.items.length} פריטים
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
              <Truck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderRow = ({ order }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={selectedOrders.includes(order.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedOrders([...selectedOrders, order.id]);
            } else {
              setSelectedOrders(selectedOrders.filter(id => id !== order.id));
            }
          }}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
        <div className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString('he-IL')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{order.customer.name}</div>
        <div className="text-sm text-gray-500">{order.customer.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(order.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getPaymentStatusBadge(order.paymentStatus)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₪{order.total.toLocaleString('he-IL')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.items.length} פריטים
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2">
          <button className="text-blue-600 hover:text-blue-900">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <Edit className="w-4 h-4" />
          </button>
          <button className="text-green-600 hover:text-green-900">
            <Truck className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const [viewMode, setViewMode] = useState('cards');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הזמנות</h1>
          <p className="text-gray-600">נהל את ההזמנות והמשלוחים שלך</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            ייצא
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            רענן
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            הזמנה חדשה
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="חפש הזמנות..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="PENDING">ממתין</option>
            <option value="PROCESSING">בעיבוד</option>
            <option value="SHIPPED">נשלח</option>
            <option value="DELIVERED">נמסר</option>
            <option value="CANCELLED">בוטל</option>
          </select>

          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="all">כל התשלומים</option>
            <option value="PAID">שולם</option>
            <option value="PENDING">ממתין לתשלום</option>
            <option value="FAILED">נכשל</option>
            <option value="REFUNDED">הוחזר</option>
          </select>

          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="all">כל התאריכים</option>
            <option value="today">היום</option>
            <option value="week">השבוע</option>
            <option value="month">החודש</option>
            <option value="quarter">הרבעון</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedOrders.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedOrders.length} הזמנות נבחרו
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-50">
                עדכן סטטוס
              </button>
              <button className="px-3 py-1 text-sm bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-50 flex items-center gap-1">
                <Printer className="w-3 h-3" />
                הדפס
              </button>
              <button className="px-3 py-1 text-sm bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-50 flex items-center gap-1">
                <Send className="w-3 h-3" />
                שלח מייל
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Display */}
      {orders.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedOrders.length === orders.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(orders.map(o => o.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    הזמנה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    לקוח
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תשלום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סכום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פריטים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הזמנות עדיין</h3>
            <p className="text-gray-500 mb-6">ההזמנות יופיעו כאן כשלקוחות יזמינו מהחנות שלך</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              צור הזמנה ידנית
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            מציג 1-{orders.length} מתוך {orders.length} הזמנות
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              הקודם
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" disabled>
              הבא
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

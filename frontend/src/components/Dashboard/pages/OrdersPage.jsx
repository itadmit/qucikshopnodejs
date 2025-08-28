import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Download, 
  RefreshCw,
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
  Printer,
  Archive,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import apiService from '../../../services/api.js';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Define columns for DataTable
  const columns = [
    {
      key: 'orderNumber',
      header: 'הזמנה',
      accessor: 'orderNumber',
      sortable: true,
      render: (order) => (
        <div className="text-sm font-medium text-gray-900">
          {order.orderNumber}
        </div>
      )
    },
    {
      key: 'customer',
      header: 'לקוח',
      sortable: true,
      render: (order) => (
        <div>
          <div className="text-sm text-gray-900">{order.customer?.name}</div>
          <div className="text-sm text-gray-500">{order.customer?.email}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'סטטוס',
      accessor: 'status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'PENDING', label: 'ממתין' },
        { value: 'PROCESSING', label: 'בעיבוד' },
        { value: 'SHIPPED', label: 'נשלח' },
        { value: 'DELIVERED', label: 'נמסר' },
        { value: 'CANCELLED', label: 'בוטל' }
      ],
      render: (order) => <StatusBadge status={order.status} type="order" />
    },
    {
      key: 'paymentStatus',
      header: 'תשלום',
      accessor: 'paymentStatus',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'PENDING', label: 'ממתין' },
        { value: 'PAID', label: 'שולם' },
        { value: 'FAILED', label: 'נכשל' },
        { value: 'REFUNDED', label: 'הוחזר' }
      ],
      render: (order) => <StatusBadge status={order.paymentStatus} type="payment" />
    },
    {
      key: 'totalAmount',
      header: 'סכום',
      accessor: 'totalAmount',
      sortable: true,
      render: (order) => (
        <div className="text-sm text-gray-900">
          ₪{order.totalAmount?.toLocaleString('he-IL')}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'תאריך',
      accessor: 'createdAt',
      sortable: true,
      render: (order) => (
        <div className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString('he-IL')}
        </div>
      )
    }
  ];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const storeId = localStorage.getItem('currentStoreId') || '1';
        
        if (!token) {
          console.log('No token found for orders');
          setOrders([]);
          return;
        }
        
        apiService.setToken(token);
        const result = await apiService.getOrders({ storeId });
        
        if (result.success) {
          setOrders(result.data);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Status badge component
  const StatusBadge = ({ status, type = 'order' }) => {
    const statusConfig = {
      order: {
        PENDING: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        PROCESSING: { label: 'בעיבוד', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
        SHIPPED: { label: 'נשלח', color: 'bg-purple-100 text-purple-800', icon: Truck },
        DELIVERED: { label: 'נמסר', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
        CANCELLED: { label: 'בוטל', color: 'bg-red-100 text-red-800', icon: XCircle }
      },
      payment: {
        PENDING: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        PAID: { label: 'שולם', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
        FAILED: { label: 'נכשל', color: 'bg-red-100 text-red-800', icon: XCircle },
        REFUNDED: { label: 'הוחזר', color: 'bg-gray-100 text-gray-800', icon: RefreshCw }
      },
      fulfillment: {
        UNFULFILLED: { label: 'לא מולא', color: 'bg-gray-100 text-gray-800', icon: Package },
        PARTIALLY_FULFILLED: { label: 'מולא חלקית', color: 'bg-yellow-100 text-yellow-800', icon: Package },
        FULFILLED: { label: 'מולא', color: 'bg-green-100 text-green-800', icon: CheckCircle2 }
      }
    };

    const config = statusConfig[type][status] || statusConfig[type].PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - Different from Products */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">הזמנות</h1>
          <p className="text-gray-600">נהל והתעקב אחר הזמנות הלקוחות שלך</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            ייצא הזמנות
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            צור הזמנה ידנית
          </button>
        </div>
      </div>

      {/* Orders Statistics - Different from Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">סך הזמנות</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {orders.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">הזמנות ממתינות</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {orders.filter(o => o.status === 'PENDING').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">הזמנות הושלמו</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">הכנסות החודש</dt>
                <dd className="text-lg font-medium text-gray-900">
                  ₪{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString('he-IL')}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חפש הזמנות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="PENDING">ממתין</option>
              <option value="PROCESSING">בעיבוד</option>
              <option value="SHIPPED">נשלח</option>
              <option value="DELIVERED">נמסר</option>
              <option value="CANCELLED">בוטל</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">טוען הזמנות...</h3>
            <p className="text-gray-500">אנא המתן בזמן שאנחנו טוענים את ההזמנות שלך</p>
          </div>
        </div>
      ) : (
        <DataTable
          data={orders}
          columns={columns}
          title="רשימת הזמנות"
          subtitle={`${orders.length} הזמנות בסך הכל`}
          searchable={true}
          filterable={true}
          selectable={true}
          sortable={true}
          loading={loading}
          actions={[
            {
              label: 'ייצא הזמנות',
              icon: Download,
              onClick: () => console.log('Export orders')
            },
            {
              label: 'צור הזמנה ידנית',
              icon: Plus,
              variant: 'primary',
              onClick: () => console.log('Create manual order')
            }
          ]}
          bulkActions={[
            {
              label: 'עדכן סטטוס',
              icon: Edit,
              onClick: (selectedIds) => console.log('Update status for:', selectedIds)
            },
            {
              label: 'הדפס',
              icon: Printer,
              onClick: (selectedIds) => console.log('Print:', selectedIds)
            }
          ]}
          emptyState={
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין הזמנות עדיין</h3>
              <p className="text-gray-500 mb-6">כשלקוחות יבצעו הזמנות, הן יופיעו כאן</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
                <Plus className="w-4 h-4" />
                צור הזמנה ידנית
              </button>
            </div>
          }
          onRowClick={(order) => {
            navigate(`/dashboard/orders/${order.id}`);
          }}
          pagination={true}
          itemsPerPage={10}
          className="shadow-sm"
        />
      )}




    </div>
  );
};

export default OrdersPage;

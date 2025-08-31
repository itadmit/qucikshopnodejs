import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Download, 
  Upload,
  Eye,
  Edit,
  Copy,
  Trash2,
  Tag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import { DashboardPageSkeleton } from '../components/Skeleton.jsx';
import Toast from '../../../store/core/components/Toast.jsx';
import apiService from '../../../services/api.js';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Check for success message from localStorage
  useEffect(() => {
    const successMessage = localStorage.getItem('productSaveSuccess');
    if (successMessage) {
      setToastMessage(successMessage);
      setToastType('success');
      setShowToast(true);
      localStorage.removeItem('productSaveSuccess'); // Clean up
    }
  }, []);

  // Define columns for DataTable
  const columns = [
    {
      key: 'image',
      header: 'תמונה',
      render: (product) => (
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      header: 'שם המוצר',
      accessor: 'name',
      sortable: true,
      render: (product) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.sku}</div>
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
        { value: 'ACTIVE', label: 'פעיל' },
        { value: 'DRAFT', label: 'טיוטה' },
        { value: 'ARCHIVED', label: 'בארכיון' }
      ],
      render: (product) => <StatusBadge status={product.status} />
    },
    {
      key: 'type',
      header: 'סוג',
      accessor: 'type',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'SIMPLE', label: 'פשוט' },
        { value: 'VARIABLE', label: 'משתנה' },
        { value: 'BUNDLE', label: 'חבילה' }
      ],
      render: (product) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.type === 'SIMPLE' ? 'פשוט' : product.type === 'VARIABLE' ? 'משתנה' : 'חבילה'}
        </span>
      )
    },
    {
      key: 'price',
      header: 'מחיר',
      accessor: 'price',
      sortable: true,
      render: (product) => (
        <div className="text-sm text-gray-900">
          ₪{product.price?.toLocaleString('he-IL')}
        </div>
      )
    },
    {
      key: 'inventory',
      header: 'מלאי',
      accessor: 'inventory',
      sortable: true,
      render: (product) => (
        <div className="text-sm text-gray-900">
          {product.inventory || 0}
        </div>
      )
    },
    {
      key: 'category',
      header: 'קטגוריה',
      accessor: 'category',
      sortable: true,
      filterable: true,
      render: (product) => (
        <span className="text-sm text-gray-600">
          {product.category || 'כללי'}
        </span>
      )
    },
    {
      key: 'variants',
      header: 'וריאנטים',
      accessor: 'variants',
      sortable: true,
      render: (product) => (
        <span className="text-sm text-gray-600">
          {product.variants > 0 ? `${product.variants} וריאנטים` : '-'}
        </span>
      )
    }
  ];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      ACTIVE: { 
        label: 'פעיל', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle2
      },
      DRAFT: { 
        label: 'טיוטה', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Edit
      },
      ARCHIVED: { 
        label: 'בארכיון', 
        className: 'bg-gray-100 text-gray-800',
        icon: Package
      }
    };

    const statusConfig = config[status] || config.DRAFT;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No token found for products');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      apiService.setToken(token);
      
      // Get selected store ID from localStorage (should be set by dashboard)
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      let result;
      
      if (!selectedStoreId) {
        // If no store selected, get user's stores first
        const userStores = await apiService.getUserStores();
        if (!userStores || userStores.length === 0) {
          console.log('No stores found for user');
          setProducts([]);
          return;
        }
        
        const currentStore = userStores[0];
        localStorage.setItem('selectedStoreId', currentStore.id.toString());
        setCurrentStore(currentStore);
        result = await apiService.getProducts({ storeId: currentStore.id });
      } else {
        // Use cached store ID directly but also get store details
        const userStores = await apiService.getUserStores();
        const store = userStores?.find(s => s.id.toString() === selectedStoreId);
        if (store) {
          setCurrentStore(store);
        }
        result = await apiService.getProducts({ storeId: parseInt(selectedStoreId) });
      }

      if (result.success) {
        // Transform API data to match component expectations
        const transformedProducts = result.data.map(product => ({
          id: product.id,
          name: product.name,
          slug: product.slug, // Add slug for proper linking
          sku: product.sku,
          status: product.status || 'ACTIVE',
          type: product._count?.variants > 0 ? 'VARIABLE' : 'SIMPLE',
          price: parseFloat(product.price || 0),
          inventory: product.inventoryQuantity || 0,
          sales: 0, // TODO: Get from analytics
          image: product.media?.[0]?.media?.s3Url || null,
          media: product.media, // Keep original media data for image display
          variants: product._count?.variants || 0,
          category: product.category?.name || 'כללי'
        }));
        setProducts(transformedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete single product
  const handleDeleteProduct = async (product) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המוצר "${product.name}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('authToken');
      apiService.setToken(token);
      
      const result = await apiService.deleteProduct(product.id);
      
      if (result.success) {
        await fetchProducts();
      } else {
        alert(`שגיאה במחיקת המוצר: ${result.error || 'שגיאה לא ידועה'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`שגיאה במחיקת המוצר: ${error.message || 'שגיאה לא ידועה'}`);
    } finally {
      setDeleting(false);
    }
  };

  // Delete multiple products
  const handleBulkDelete = async (selectedIds) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק ${selectedIds.length} מוצרים?`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('authToken');
      apiService.setToken(token);
      
      // Delete products one by one (can be optimized with bulk API later)
      for (const productId of selectedIds) {
        await apiService.deleteProduct(productId);
      }
      
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert(`שגיאה במחיקת המוצרים: ${error.message || 'שגיאה לא ידועה'}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">מוצרים</h1>
          <p className="text-gray-600">נהל את המוצרים והמלאי שלך</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            ייבא
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            ייצא
          </button>
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/dashboard/products/new');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            הוסף מוצר
          </button>
        </div>
      </div>

      {/* Products Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">סך המוצרים</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">מוצרים פעילים</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">טיוטות</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.status === 'DRAFT').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">מלאי נמוך</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.inventory < 10).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {loading ? (
        <DashboardPageSkeleton hasTable={true} tableRows={6} />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          title="רשימת מוצרים"
          subtitle={`${products.length} מוצרים בסך הכל`}
          searchable={true}
          filterable={true}
          selectable={true}
          sortable={true}
          loading={loading}
          actions={[
            {
              label: 'ייבא מוצרים',
              icon: Upload,
              onClick: () => console.log('Import products')
            },
            {
              label: 'ייצא מוצרים',
              icon: Download,
              onClick: () => console.log('Export products')
            },
            {
              label: 'הוסף מוצר',
              icon: Plus,
              variant: 'primary',
              onClick: () => {
                window.history.pushState({}, '', '/dashboard/products/new');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }
          ]}
          bulkActions={[
            {
              label: 'עדכן סטטוס',
              icon: Edit,
              onClick: (selectedIds) => console.log('Update status for:', selectedIds)
            },
            {
              label: 'מחק מוצרים',
              icon: Trash2,
              variant: 'danger',
              onClick: handleBulkDelete,
              disabled: deleting
            }
          ]}
          emptyState={
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין מוצרים עדיין</h3>
              <p className="text-gray-500 mb-6">התחל בהוספת המוצר הראשון שלך</p>
              <button 
                onClick={() => {
                  window.history.pushState({}, '', '/dashboard/products/new');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                הוסף מוצר ראשון
              </button>
            </div>
          }
          onRowClick={(product) => {
            window.history.pushState({}, '', `/dashboard/products/${product.id}/edit`);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          rowActions={[
            {
              label: 'צפה בחנות',
              icon: Eye,
              variant: 'secondary',
              onClick: (product) => {
                const productSlug = product.slug || product.id;
                // Use current store slug if available, otherwise fallback to yogevstore
                const storeSlug = currentStore?.slug || 'yogevstore';
                const storeUrl = `https://${storeSlug}.my-quickshop.com/products/${productSlug}`;
                window.open(storeUrl, '_blank');
              }
            },
            {
              label: 'ערוך מוצר',
              icon: Edit,
              variant: 'primary',
              onClick: (product) => {
                window.history.pushState({}, '', `/dashboard/products/${product.id}/edit`);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            },
            {
              label: 'שכפל מוצר',
              icon: Copy,
              onClick: (product) => {
                console.log('Duplicate product:', product.id);
              }
            },
            {
              label: 'מחק מוצר',
              icon: Trash2,
              variant: 'danger',
              onClick: handleDeleteProduct,
              disabled: deleting
            }
          ]}
          pagination={true}
          itemsPerPage={10}
          className=""
        />
      )}
      
      {/* Toast */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};

export default ProductsPage;

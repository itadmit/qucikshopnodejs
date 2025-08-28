import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  Grid3X3,
  List,
  Download,
  Upload,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable.jsx';
import apiService from '../../../services/api.js';

const ProductsPage = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define columns for DataTable
  const columns = [
    {
      key: 'image',
      header: 'תמונה',
      render: (product) => (
        <div className="flex items-center">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>
      )
    },
    {
      key: 'name',
      header: 'מוצר',
      accessor: 'name',
      sortable: true,
      render: (product) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
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
        { value: 'INACTIVE', label: 'לא פעיל' }
      ],
      render: (product) => getStatusBadge(product.status)
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
      ]
    },
    {
      key: 'price',
      header: 'מחיר',
      accessor: 'price',
      sortable: true,
      render: (product) => `₪${product.price?.toLocaleString('he-IL') || '0'}`
    },
    {
      key: 'inventory',
      header: 'מלאי',
      accessor: 'inventory',
      sortable: true,
      render: (product) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          product.inventory === 0 ? 'bg-red-100 text-red-800' :
          product.inventory < 10 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {product.inventory}
        </span>
      )
    },
    {
      key: 'category',
      header: 'קטגוריה',
      accessor: 'category',
      sortable: true,
      filterable: true,
      filterOptions: [] // Will be populated from API data
    }
  ];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const storeId = localStorage.getItem('currentStoreId') || '1'; // Default to store 1
        
        if (!token) {
          console.log('No token found for products');
          setProducts([]);
          return;
        }
        
        apiService.setToken(token);
        const result = await apiService.getProducts({ storeId });

        if (result.success) {
          // Transform API data to match component expectations
          const transformedProducts = result.data.map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            status: product.status || 'ACTIVE',
            type: product.variants?.length > 0 ? 'VARIABLE' : 'SIMPLE',
            price: parseFloat(product.price || 0),
            inventory: product.inventoryQuantity || 0,
            sales: 0, // TODO: Get from analytics
            image: product.media?.[0]?.media?.s3Url || null,
            variants: product.variants?.length || 0,
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

    fetchProducts();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          פעיל
        </span>;
      case 'DRAFT':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 ml-1" />
          טיוטה
        </span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <EyeOff className="w-3 h-3 ml-1" />
          לא פעיל
        </span>;
      default:
        return null;
    }
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
            checked={selectedProducts.includes(product.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedProducts([...selectedProducts, product.id]);
              } else {
                setSelectedProducts(selectedProducts.filter(id => id !== product.id));
              }
            }}
          />
          <img 
            src={product.image} 
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
          />
        </div>
        <div className="relative">
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">₪{product.price}</span>
          {getStatusBadge(product.status)}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>מלאי: {product.inventory}</span>
          <span>נמכרו: {product.sales}</span>
        </div>
        
        {product.type === 'VARIABLE' && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {product.variants} וריאציות
          </div>
        )}
      </div>
    </div>
  );

  const ProductRow = ({ product }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={selectedProducts.includes(product.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts([...selectedProducts, product.id]);
            } else {
              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
            }
          }}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover bg-gray-100 ml-3"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{product.sku}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(product.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.type === 'VARIABLE' ? `${product.variants} וריאציות` : 'מוצר פשוט'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₪{product.price}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.inventory}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.category}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              window.history.pushState({}, '', `/dashboard/products/${product.id}/edit`);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-blue-600 hover:text-blue-900"
            title="ערוך מוצר"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <Copy className="w-4 h-4" />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חפש מוצרים..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'left 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="all">כל הסטטוסים</option>
              <option value="ACTIVE">פעיל</option>
              <option value="DRAFT">טיוטה</option>
              <option value="INACTIVE">לא פעיל</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'left 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="name">מיין לפי שם</option>
              <option value="price">מיין לפי מחיר</option>
              <option value="inventory">מיין לפי מלאי</option>
              <option value="sales">מיין לפי מכירות</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedProducts.length} מוצרים נבחרו
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-50">
                עדכן סטטוס
              </button>
              <button className="px-3 py-1 text-sm bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-50">
                עדכן קטגוריה
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                מחק
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">טוען מוצרים...</h3>
            <p className="text-gray-500">אנא המתן בזמן שאנחנו טוענים את המוצרים שלך</p>
          </div>
        </div>
      ) : products.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <DataTable
            data={products}
            columns={columns}
            searchable={false}
            filterable={false}
            selectable={true}
            sortable={true}
            loading={false}
            pagination={false}
            className=""
          />
        )
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 p-8">
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
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            מציג 1-{products.length} מתוך {products.length} מוצרים
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

export default ProductsPage;

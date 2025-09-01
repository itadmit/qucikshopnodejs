import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getApiUrl } from '../../../config/environment.js';
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, Download } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import { DashboardPageSkeleton } from '../components/Skeleton'

const CouponsPage = ({ storeId }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'coupons')
  const [coupons, setCoupons] = useState([])
  const [automaticDiscounts, setAutomaticDiscounts] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // Define columns for Coupons DataTable
  const couponColumns = [
    {
      key: 'code',
      header: 'קוד קופון',
      accessor: 'code',
      sortable: true,
      render: (coupon) => (
        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
      )
    },
    {
      key: 'name',
      header: 'שם',
      accessor: 'name',
      sortable: true,
      render: (coupon) => (
        <div className="text-sm text-gray-900">{coupon.name}</div>
      )
    },
    {
      key: 'discountType',
      header: 'סוג הנחה',
      accessor: 'discountType',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'PERCENTAGE', label: 'אחוזים' },
        { value: 'FIXED_AMOUNT', label: 'סכום קבוע' },
        { value: 'FREE_SHIPPING', label: 'משלוח חינם' }
      ],
      render: (coupon) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          coupon.discountType === 'PERCENTAGE' ? 'bg-blue-100 text-blue-800' :
          coupon.discountType === 'FIXED_AMOUNT' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {coupon.discountType === 'PERCENTAGE' ? 'אחוזים' :
           coupon.discountType === 'FIXED_AMOUNT' ? 'סכום קבוע' : 'משלוח חינם'}
        </span>
      )
    },
    {
      key: 'discountValue',
      header: 'ערך',
      accessor: 'discountValue',
      sortable: true,
      render: (coupon) => (
        <div className="text-sm text-gray-900">
          {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` :
           coupon.discountType === 'FIXED_AMOUNT' ? `₪${coupon.discountValue}` : 'חינם'}
        </div>
      )
    },
    {
      key: 'usageCount',
      header: 'שימושים',
      accessor: 'usageCount',
      sortable: true,
      render: (coupon) => (
        <div className="text-sm text-gray-900">
          {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'סטטוס',
      accessor: 'isActive',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: true, label: 'פעיל' },
        { value: false, label: 'לא פעיל' }
      ],
      render: (coupon) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {coupon.isActive ? (
            <>
              <Eye className="w-3 h-3 ml-1" />
              פעיל
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 ml-1" />
              לא פעיל
            </>
          )}
        </span>
      )
    },
    {
      key: 'expiresAt',
      header: 'תפוגה',
      accessor: 'expiresAt',
      sortable: true,
      render: (coupon) => (
        <div className="text-sm text-gray-900">
          {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('he-IL') : 'ללא תפוגה'}
        </div>
      )
    }
  ];

  useEffect(() => {
    if (storeId) {
      loadData()
    }
  }, [storeId, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'coupons') {
        await loadCoupons()
      } else if (activeTab === 'automatic') {
        await loadAutomaticDiscounts()
      } else if (activeTab === 'influencers') {
        await loadInfluencers()
      }
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCoupons = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/coupons?storeId=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('שגיאה בטעינת קופונים:', error)
    }
  }

  const loadAutomaticDiscounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/automatic-discounts?storeId=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAutomaticDiscounts(data)
      }
    } catch (error) {
      console.error('שגיאה בטעינת הנחות אוטומטיות:', error)
    }
  }

  const loadInfluencers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/influencers?storeId=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInfluencers(data)
      }
    } catch (error) {
      console.error('שגיאה בטעינת משפיענים:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL')
  }

  const handleDeleteInfluencer = async (influencerId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המשפיען? פעולה זו לא ניתנת לביטול.')) {
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/influencers/${influencerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        // Reload influencers list
        loadInfluencers()
      } else {
        const error = await response.json()
        alert(error.message || 'שגיאה במחיקת המשפיען')
      }
    } catch (error) {
      console.error('Error deleting influencer:', error)
      alert('שגיאה במחיקת המשפיען')
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הקופון? פעולה זו לא ניתנת לביטול.')) {
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        // Reload coupons list
        loadCoupons()
      } else {
        const error = await response.json()
        alert(error.message || 'שגיאה במחיקת הקופון')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('שגיאה במחיקת הקופון')
    }
  }

  const handleDeleteDiscount = async (discountId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את ההנחה האוטומטית? פעולה זו לא ניתנת לביטול.')) {
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/automatic-discounts/${discountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        // Reload automatic discounts list
        loadAutomaticDiscounts()
      } else {
        const error = await response.json()
        alert(error.message || 'שגיאה במחיקת ההנחה')
      }
    } catch (error) {
      console.error('Error deleting discount:', error)
      alert('שגיאה במחיקת ההנחה')
    }
  }

  const getDiscountTypeLabel = (type) => {
    const types = {
      'PERCENTAGE': 'אחוז',
      'FIXED_AMOUNT': 'סכום קבוע',
      'FREE_SHIPPING': 'משלוח חינם',
      'BUY_X_GET_Y': 'קנה X קבל Y',
      'TIERED': 'מדורג',
      'BUNDLE': 'בנדל'
    }
    return types[type] || type
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', label: 'פעיל' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', label: 'לא פעיל' },
      'EXPIRED': { color: 'bg-red-100 text-red-800', label: 'פג תוקף' },
      'USED_UP': { color: 'bg-yellow-100 text-yellow-800', label: 'מוצה' },
      'PENDING': { color: 'bg-blue-100 text-blue-800', label: 'ממתין' }
    }
    
    const config = statusConfig[status] || statusConfig['INACTIVE']
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">קופונים והנחות</h1>
            <p className="text-gray-600 mt-1">נהל קופונים, הנחות אוטומטיות ומשפיענים</p>
          </div>
        
        <button
          onClick={() => {
            if (activeTab === 'coupons') {
              navigate('/dashboard/coupons/new')
            } else if (activeTab === 'automatic') {
              navigate('/dashboard/automatic-discounts/new')
            } else {
              setShowCreateModal(true)
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'coupons' ? 'קופון חדש' : 
           activeTab === 'influencers' ? 'משפיען חדש' : 'הנחה אוטומטית חדשה'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'coupons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="ri-coupon-3-line ml-2"></i>
            קופונים
          </button>
          
          <button
            onClick={() => setActiveTab('automatic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'automatic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="ri-magic-line ml-2"></i>
            הנחות אוטומטיות
          </button>
          
          <button
            onClick={() => setActiveTab('influencers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'influencers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="ri-user-star-line ml-2"></i>
            משפיענים
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <DashboardPageSkeleton hasTable={true} tableRows={5} />
      ) : (
        <div>
          {/* Coupons Tab */}
          {activeTab === 'coupons' && (
            <DataTable
              data={coupons}
              columns={couponColumns}
              title="רשימת קופונים"
              subtitle={`${coupons.length} קופונים בסך הכל`}
              searchable={true}
              filterable={true}
              selectable={true}
              sortable={true}
              loading={loading}
              pagination={true}
              itemsPerPage={10}
              actions={[
                {
                  label: 'ייצא קופונים',
                  icon: Download,
                  onClick: () => console.log('Export coupons')
                },
                {
                  label: 'קופון חדש',
                  icon: Plus,
                  variant: 'primary',
                  onClick: () => navigate('/dashboard/coupons/new')
                }
              ]}
              bulkActions={[
                {
                  label: 'הפעל קופונים',
                  icon: Eye,
                  onClick: (selectedIds) => console.log('Activate coupons:', selectedIds)
                },
                {
                  label: 'השבת קופונים',
                  icon: EyeOff,
                  onClick: (selectedIds) => console.log('Deactivate coupons:', selectedIds)
                },
                {
                  label: 'מחק קופונים',
                  icon: Trash2,
                  onClick: (selectedIds) => {
                    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedIds.length} קופונים?`)) {
                      console.log('Delete coupons:', selectedIds);
                    }
                  }
                }
              ]}
              rowActions={[
                {
                  label: 'ערוך קופון',
                  icon: Edit,
                  variant: 'primary',
                  onClick: (coupon) => {
                    navigate(`/dashboard/coupons/${coupon.id}/edit`);
                  }
                },
                {
                  label: 'שכפל קופון',
                  icon: Copy,
                  onClick: (coupon) => {
                    console.log('Duplicate coupon:', coupon.id);
                  }
                },
                {
                  label: 'הפעל/השבת',
                  icon: Eye,
                  onClick: (coupon) => {
                    console.log('Toggle coupon status:', coupon.id);
                  }
                },
                {
                  label: 'מחק קופון',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: (coupon) => {
                    if (confirm(`האם אתה בטוח שברצונך למחוק את הקופון "${coupon.name}"?`)) {
                      console.log('Delete coupon:', coupon.id);
                    }
                  }
                }
              ]}
              onRowClick={(coupon) => {
                navigate(`/dashboard/coupons/${coupon.id}/edit`);
              }}
              emptyState={
                <div className="text-center py-12">
                  <i className="ri-coupon-3-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין קופונים עדיין</h3>
                  <p className="text-gray-600 mb-4">צור את הקופון הראשון שלך כדי להתחיל</p>
                  <button
                    onClick={() => navigate('/dashboard/coupons/new')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    צור קופון ראשון
                  </button>
                </div>
              }
              className="shadow-sm"
            />
          )}

          {/* Automatic Discounts Tab */}
          {activeTab === 'automatic' && (
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">הנחות אוטומטיות</h2>
                <button
                  onClick={() => navigate('/dashboard/automatic-discounts/new')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  הנחה אוטומטית חדשה
                </button>
              </div>
              
              {automaticDiscounts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <i className="ri-magic-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין הנחות אוטומטיות עדיין</h3>
                  <p className="text-gray-600 mb-4">צור את ההנחה האוטומטית הראשונה שלך כדי להתחיל</p>
                  <button
                    onClick={() => navigate('/dashboard/automatic-discounts/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    צור הנחה אוטומטית חדשה
                  </button>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          שם
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          סוג הנחה
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ערך
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          עדיפות
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
                      {automaticDiscounts.map((discount) => (
                        <tr key={discount.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {discount.name}
                            </div>
                            {discount.description && (
                              <div className="text-sm text-gray-500">
                                {discount.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getDiscountTypeLabel(discount.discountType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {discount.discountType === 'PERCENTAGE' && `${discount.discountValue}%`}
                            {discount.discountType === 'FIXED_AMOUNT' && formatPrice(discount.discountValue)}
                            {discount.discountType === 'FREE_SHIPPING' && 'משלוח חינם'}
                            {discount.discountType === 'BUY_X_GET_Y' && `קנה ${discount.buyQuantity} קבל ${discount.getQuantity}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {discount.priority}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(discount.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/dashboard/automatic-discounts/${discount.id}/edit`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <i className="ri-bar-chart-line"></i>
                              </button>
                              <button 
                                onClick={() => handleDeleteDiscount(discount.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Influencers Tab */}
          {activeTab === 'influencers' && (
            <div className="space-y-4">
              {influencers.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-user-star-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין משפיענים עדיין</h3>
                  <p className="text-gray-600 mb-4">הוסף את המשפיען הראשון שלך</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    הוסף משפיען חדש
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {influencers.map((influencer) => (
                    <div key={influencer.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className="ri-user-star-line text-blue-600"></i>
                          </div>
                          <div className="mr-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {influencer.name}
                            </h3>
                            <p className="text-sm text-gray-500">{influencer.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(influencer.status)}
                      </div>
                      
                      <div className="space-y-3">
                        {influencer.phone && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">טלפון:</span>
                            <span className="text-sm font-medium">
                              {influencer.phone}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">אחוז עמלה:</span>
                          <span className="text-sm font-medium">
                            {(influencer.commissionRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">סה"כ הכנסות:</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatPrice(influencer.totalEarnings || 0)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">הזמנות:</span>
                          <span className="text-sm font-medium">
                            {influencer.totalOrders || 0}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">קופונים משויכים:</span>
                          <span className="text-sm font-medium">
                            {influencer._count?.coupons || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setEditingItem(influencer)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            <i className="ri-edit-line ml-1"></i>
                            עריכה
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            <i className="ri-bar-chart-line ml-1"></i>
                            סטטיסטיקות
                          </button>
                          <button
                            onClick={() => handleDeleteInfluencer(influencer.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            <i className="ri-delete-bin-line ml-1"></i>
                            מחק
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Influencer Modal */}
      {showCreateModal && activeTab === 'influencers' && (
        <CreateInfluencerModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          storeId={storeId}
          onSuccess={loadData}
        />
      )}
        </div>
      </div>
    </div>
  )
}

// Modal Component for Influencer Creation
const CreateInfluencerModal = ({ isOpen, onClose, storeId, onSuccess }) => {
  if (!isOpen) return null
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    commissionRate: '10'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'שם משפיען נדרש'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'כתובת אימייל נדרשת'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'סיסמה נדרשת'
    } else if (formData.password.length < 6) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים'
    }
    
    if (!formData.commissionRate || formData.commissionRate <= 0 || formData.commissionRate > 100) {
      newErrors.commissionRate = 'אחוז עמלה חייב להיות בין 1-100'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async () => {
    if (!validate()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/influencers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...formData,
          storeId,
          commissionRate: parseFloat(formData.commissionRate) / 100 // Convert percentage to decimal
        })
      })
      
      if (response.ok) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          commissionRate: '10'
        })
        setErrors({})
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'שגיאה ביצירת המשפיען' })
      }
    } catch (error) {
      setErrors({ submit: 'שגיאה בחיבור לשרת' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">משפיען חדש</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        {/* Influencer Form */}
        <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-4">פרטי משפיען</h4>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם מלא *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="לדוגמה: יוסי כהן"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כתובת אימייל *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טלפון
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="050-1234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="הגדר סיסמה למשפיען"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">סיסמה זו תשמש את המשפיען להתחברות למערכת</p>
            </div>
            
            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                אחוז עמלה *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                  placeholder="10"
                  min="1"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.commissionRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              {errors.commissionRate && <p className="text-red-500 text-sm mt-1">{errors.commissionRate}</p>}
              <p className="text-xs text-gray-500 mt-1">זהו אחוז העמלה שיראה המשפיען בנתונים שלו</p>
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ביטול
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>}
              צור משפיען
            </button>
          </div>
      </div>
    </div>
  )
}

// Helper functions remain the same
const getDiscountTypeLabel = (type) => {
  const labels = {
    PERCENTAGE: 'אחוז',
    FIXED_AMOUNT: 'סכום קבוע',
    FREE_SHIPPING: 'משלוח חינם',
    BUY_X_GET_Y: 'קנה X קבל Y',
    TIERED: 'הנחה מדורגת',
    BUNDLE: 'הנחת חבילה'
  }
  return labels[type] || type
}

const getStatusBadge = (status) => {
  if (status === 'ACTIVE') {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        פעיל
      </span>
    )
  }
  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
      לא פעיל
    </span>
  )
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(price)
}

export default CouponsPage
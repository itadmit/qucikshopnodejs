import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Save } from 'lucide-react'

const CouponFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [influencers, setInfluencers] = useState([])
  const [storeId, setStoreId] = useState(null)
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    customerLimit: '',
    startsAt: '',
    expiresAt: '',
    applicableProducts: [],
    applicableCategories: [],
    excludedProducts: [],
    excludedCategories: [],
    influencerId: null
  })

  // Load store data and influencers
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3001/api/dashboard/user-store', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const store = await response.json()
          setStoreId(store.id)
          loadInfluencers(store.id)
        }
      } catch (error) {
        console.error('Error fetching store:', error)
      }
    }
    
    fetchStoreData()
  }, [])

  // Load existing coupon if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadCoupon()
    }
  }, [id, isEditMode])

  const loadInfluencers = async (storeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/influencers?storeId=${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInfluencers(data.filter(inf => inf.status === 'ACTIVE'))
      }
    } catch (error) {
      console.error('Error loading influencers:', error)
    }
  }

  const loadCoupon = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/coupons/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const coupon = await response.json()
        setFormData({
          ...coupon,
          startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : '',
          expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : ''
        })
      }
    } catch (error) {
      console.error('Error loading coupon:', error)
    } finally {
      setLoading(false)
    }
  }

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
    
    if (!formData.code.trim()) {
      newErrors.code = 'קוד קופון נדרש'
    } else if (formData.code.length < 3) {
      newErrors.code = 'קוד קופון חייב להכיל לפחות 3 תווים'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'שם קופון נדרש'
    }
    
    if (formData.discountType !== 'FREE_SHIPPING') {
      if (!formData.discountValue || formData.discountValue <= 0) {
        newErrors.discountValue = 'ערך הנחה נדרש'
      }
      
      if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
        newErrors.discountValue = 'אחוז הנחה לא יכול להיות יותר מ-100%'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const url = isEditMode 
        ? `http://localhost:3001/api/coupons/${id}`
        : 'http://localhost:3001/api/coupons'
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        storeId,
        discountValue: formData.discountType === 'FREE_SHIPPING' ? 0 : parseFloat(formData.discountValue),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : null,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        customerLimit: formData.customerLimit ? parseInt(formData.customerLimit) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        influencerId: formData.influencerId ? parseInt(formData.influencerId) : null
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        navigate('/dashboard/coupons')
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'שגיאה בשמירת הקופון' })
      }
    } catch (error) {
      setErrors({ submit: 'שגיאה בחיבור לשרת' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/coupons')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          חזור לקופונים
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'עריכת קופון' : 'קופון חדש'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'ערוך את פרטי הקופון' : 'צור קוד הנחה חדש ללקוחות שלך'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">פרטים בסיסיים</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                קוד קופון *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="לדוגמה: SAVE20"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEditMode}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם קופון *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="לדוגמה: הנחת קיץ 20%"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תיאור
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור אופציונלי לקופון"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Discount Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות הנחה</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סוג הנחה *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => handleInputChange('discountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PERCENTAGE">אחוז</option>
                <option value="FIXED_AMOUNT">סכום קבוע</option>
                <option value="FREE_SHIPPING">משלוח חינם</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ערך הנחה *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => handleInputChange('discountValue', e.target.value)}
                  placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '50'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.discountValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={formData.discountType === 'FREE_SHIPPING'}
                />
                {formData.discountType === 'PERCENTAGE' && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                )}
                {formData.discountType === 'FIXED_AMOUNT' && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                )}
              </div>
              {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>}
            </div>

            {/* Minimum Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סכום מינימלי לרכישה
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.minimumAmount}
                  onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
              </div>
            </div>

            {/* Maximum Discount */}
            {formData.discountType === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הנחה מקסימלית
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.maximumDiscount}
                    onChange={(e) => handleInputChange('maximumDiscount', e.target.value)}
                    placeholder="200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Limits */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">מגבלות שימוש</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מגבלת שימוש כללית
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">השאר ריק לשימוש בלתי מוגבל</p>
            </div>

            {/* Customer Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מגבלת שימוש ללקוח
              </label>
              <input
                type="number"
                value={formData.customerLimit}
                onChange={(e) => handleInputChange('customerLimit', e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">כמה פעמים כל לקוח יכול להשתמש בקופון</p>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">תאריכי תוקף</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תאריך התחלה
              </label>
              <input
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) => handleInputChange('startsAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תאריך סיום
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Influencer Assignment */}
        {influencers.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">שיוך למשפיען</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                בחר משפיען
              </label>
              <select
                value={formData.influencerId || ''}
                onChange={(e) => handleInputChange('influencerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ללא שיוך למשפיען</option>
                {influencers.map(influencer => (
                  <option key={influencer.id} value={influencer.id}>
                    {influencer.name} ({influencer.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                שיוך הקופון למשפיען יאפשר לו לראות סטטיסטיקות על השימוש בקופון
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => navigate('/dashboard/coupons')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ביטול
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>}
            <Save className="w-4 h-4 ml-2" />
            {isEditMode ? 'עדכן קופון' : 'צור קופון'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CouponFormPage

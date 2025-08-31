import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Save } from 'lucide-react'
import apiService from '../../../services/api.js'

const AutomaticDiscountFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [storeId, setStoreId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumAmount: '',
    maximumDiscount: '',
    priority: '0',
    stackable: false,
    startsAt: '',
    expiresAt: '',
    buyQuantity: '',
    getQuantity: '',
    applicableProducts: [],
    applicableCategories: [],
    excludedProducts: [],
    excludedCategories: [],
    // Advanced BOGO fields
    buySource: 'all',
    buyProducts: [],
    buyCategories: [],
    getSource: 'same',
    getProducts: [],
    getCategories: [],
    getDiscountType: 'percentage',
    getDiscountValue: '50'
  })

  // Load store data
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/dashboard/user-store`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const store = await response.json()
          setStoreId(store.id)
        }
      } catch (error) {
        console.error('Error fetching store:', error)
      }
    }
    
    fetchStoreData()
  }, [])

  // Load existing discount if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadDiscount()
    }
  }, [id, isEditMode])

  const loadDiscount = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/automatic-discounts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const discount = await response.json()
        setFormData({
          ...discount,
          startsAt: discount.startsAt ? new Date(discount.startsAt).toISOString().slice(0, 16) : '',
          expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().slice(0, 16) : ''
        })
      }
    } catch (error) {
      console.error('Error loading discount:', error)
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'שם הנחה נדרש'
    }
    
    if (formData.discountType !== 'FREE_SHIPPING' && formData.discountType !== 'BUY_X_GET_Y') {
      if (!formData.discountValue || formData.discountValue <= 0) {
        newErrors.discountValue = 'ערך הנחה נדרש'
      }
      
      if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
        newErrors.discountValue = 'אחוז הנחה לא יכול להיות יותר מ-100%'
      }
    }
    
    if (formData.discountType === 'BUY_X_GET_Y') {
      if (!formData.buyQuantity || formData.buyQuantity <= 0) {
        newErrors.buyQuantity = 'כמות קנייה נדרשת'
      }
      if (!formData.getQuantity || formData.getQuantity <= 0) {
        newErrors.getQuantity = 'כמות מתנה נדרשת'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const url = isEditMode 
        ? `${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/automatic-discounts/${id}`
        : `${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/automatic-discounts`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        storeId,
        discountValue: formData.discountType === 'FREE_SHIPPING' || formData.discountType === 'BUY_X_GET_Y' 
          ? 0 
          : parseFloat(formData.discountValue),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : null,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        priority: parseInt(formData.priority),
        buyQuantity: formData.buyQuantity ? parseInt(formData.buyQuantity) : null,
        getQuantity: formData.getQuantity ? parseInt(formData.getQuantity) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        // Advanced BOGO fields
        buyProducts: formData.buySource === 'products' ? formData.buyProducts : null,
        buyCategories: formData.buySource === 'categories' ? formData.buyCategories : null,
        getProducts: formData.getSource === 'products' ? formData.getProducts : null,
        getCategories: formData.getSource === 'categories' ? formData.getCategories : null,
        getDiscountType: formData.discountType === 'BUY_X_GET_Y' ? formData.getDiscountType : null,
        getDiscountValue: formData.discountType === 'BUY_X_GET_Y' && formData.getDiscountType !== 'free' 
          ? parseFloat(formData.getDiscountValue) 
          : null
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
        navigate('/dashboard/coupons', { state: { activeTab: 'automatic' } })
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'שגיאה בשמירת ההנחה' })
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
          onClick={() => navigate('/dashboard/coupons', { state: { activeTab: 'automatic' } })}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          חזור להנחות
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'עריכת הנחה אוטומטית' : 'הנחה אוטומטית חדשה'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'ערוך את פרטי ההנחה האוטומטית' : 'צור הנחה אוטומטית שתוחל על המוצרים באופן אוטומטי'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">פרטים בסיסיים</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם הנחה *
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

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                עדיפות
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">הנחות עם עדיפות גבוהה יותר יוחלו קודם</p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תיאור
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור אופציונלי להנחה"
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
                <option value="BUY_X_GET_Y">קנה X קבל Y</option>
              </select>
            </div>

            {/* Discount Value */}
            {formData.discountType !== 'FREE_SHIPPING' && formData.discountType !== 'BUY_X_GET_Y' && (
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
            )}

            {/* BOGO Settings */}
            {formData.discountType === 'BUY_X_GET_Y' && (
              <div className="col-span-2 space-y-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">הגדרות קנה X קבל Y</h4>
                
                {/* Buy Section */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-700">מה הלקוח צריך לקנות:</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        כמות לקנייה *
                      </label>
                      <input
                        type="number"
                        value={formData.buyQuantity}
                        onChange={(e) => handleInputChange('buyQuantity', e.target.value)}
                        placeholder="2"
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.buyQuantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.buyQuantity && <p className="text-red-500 text-sm mt-1">{errors.buyQuantity}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        מקור המוצרים
                      </label>
                      <select
                        value={formData.buySource || 'all'}
                        onChange={(e) => handleInputChange('buySource', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">כל המוצרים</option>
                        <option value="categories">קטגוריות ספציפיות</option>
                        <option value="products">מוצרים ספציפיים</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Buy Categories/Products Selection */}
                  {formData.buySource === 'categories' && (
                    <CategorySelector
                      selected={formData.buyCategories || []}
                      onChange={(categories) => handleInputChange('buyCategories', categories)}
                      label="בחר קטגוריות לקנייה"
                    />
                  )}
                  
                  {formData.buySource === 'products' && (
                    <ProductSelector
                      selected={formData.buyProducts || []}
                      onChange={(products) => handleInputChange('buyProducts', products)}
                      label="בחר מוצרים לקנייה"
                    />
                  )}
                </div>
                
                {/* Get Section */}
                <div className="space-y-4 border-t pt-4">
                  <h5 className="text-sm font-medium text-gray-700">מה הלקוח מקבל:</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        כמות לקבלה *
                      </label>
                      <input
                        type="number"
                        value={formData.getQuantity}
                        onChange={(e) => handleInputChange('getQuantity', e.target.value)}
                        placeholder="1"
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.getQuantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.getQuantity && <p className="text-red-500 text-sm mt-1">{errors.getQuantity}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        יעד ההנחה
                      </label>
                      <select
                        value={formData.getSource || 'same'}
                        onChange={(e) => handleInputChange('getSource', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="same">אותם מוצרים</option>
                        <option value="categories">קטגוריות ספציפיות</option>
                        <option value="products">מוצרים ספציפיים</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Get Categories/Products Selection */}
                  {formData.getSource === 'categories' && (
                    <CategorySelector
                      selected={formData.getCategories || []}
                      onChange={(categories) => handleInputChange('getCategories', categories)}
                      label="בחר קטגוריות לקבלת הנחה"
                    />
                  )}
                  
                  {formData.getSource === 'products' && (
                    <ProductSelector
                      selected={formData.getProducts || []}
                      onChange={(products) => handleInputChange('getProducts', products)}
                      label="בחר מוצרים לקבלת הנחה"
                    />
                  )}
                  
                  {/* Discount Type for Get Items */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      סוג ההנחה על המוצרים המתקבלים
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="getDiscountType"
                          value="percentage"
                          checked={formData.getDiscountType === 'percentage'}
                          onChange={(e) => handleInputChange('getDiscountType', e.target.value)}
                          className="ml-2"
                        />
                        <span className="text-sm">אחוז הנחה</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="getDiscountType"
                          value="fixed"
                          checked={formData.getDiscountType === 'fixed'}
                          onChange={(e) => handleInputChange('getDiscountType', e.target.value)}
                          className="ml-2"
                        />
                        <span className="text-sm">סכום קבוע</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="getDiscountType"
                          value="fixed_price"
                          checked={formData.getDiscountType === 'fixed_price'}
                          onChange={(e) => handleInputChange('getDiscountType', e.target.value)}
                          className="ml-2"
                        />
                        <span className="text-sm">מחיר קבוע</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="getDiscountType"
                          value="free"
                          checked={formData.getDiscountType === 'free'}
                          onChange={(e) => handleInputChange('getDiscountType', e.target.value)}
                          className="ml-2"
                        />
                        <span className="text-sm">חינם</span>
                      </label>
                    </div>
                    
                    {/* Discount Value Input */}
                    {formData.getDiscountType && formData.getDiscountType !== 'free' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formData.getDiscountType === 'percentage' ? 'אחוז הנחה' : 
                           formData.getDiscountType === 'fixed' ? 'סכום הנחה' : 'מחיר קבוע'} *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.getDiscountValue}
                            onChange={(e) => handleInputChange('getDiscountValue', e.target.value)}
                            placeholder={formData.getDiscountType === 'percentage' ? "50" : "20"}
                            min="0"
                            max={formData.getDiscountType === 'percentage' ? "100" : undefined}
                            step={formData.getDiscountType === 'percentage' ? "1" : "0.01"}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.getDiscountValue ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {formData.getDiscountType === 'percentage' ? '%' : '₪'}
                          </span>
                        </div>
                        {errors.getDiscountValue && <p className="text-red-500 text-sm mt-1">{errors.getDiscountValue}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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

            {/* Stackable */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.stackable}
                  onChange={(e) => handleInputChange('stackable', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="mr-2 text-sm font-medium text-gray-700">
                  אפשר שילוב עם הנחות אחרות
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 mr-6">
                אם מסומן, ההנחה תוחל יחד עם הנחות אחרות
              </p>
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

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => navigate('/dashboard/coupons', { state: { activeTab: 'automatic' } })}
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
            {isEditMode ? 'עדכן הנחה' : 'צור הנחה'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Category Selector Component
const CategorySelector = ({ selected = [], onChange, label }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchCategories()
  }, [])
  
  const fetchCategories = async () => {
    try {
      // Get current store dynamically
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      apiService.setToken(token);
      const userStores = await apiService.getUserStores();
      if (!userStores || userStores.length === 0) return;
      
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      const currentStore = selectedStoreId 
        ? userStores.find(store => store.id.toString() === selectedStoreId)
        : userStores[0];
      
      if (!currentStore) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/products/categories?storeId=${currentStore.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleToggle = (categoryId) => {
    const newSelected = selected.includes(categoryId)
      ? selected.filter(id => id !== categoryId)
      : [...selected, categoryId]
    onChange(newSelected)
  }
  
  if (loading) return <div className="text-gray-500">טוען קטגוריות...</div>
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
        {categories.map(category => (
          <label key={category.id} className="flex items-center hover:bg-gray-50 p-2 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(category.id)}
              onChange={() => handleToggle(category.id)}
              className="ml-2"
            />
            <span className="text-sm">{category.name}</span>
          </label>
        ))}
        {categories.length === 0 && (
          <p className="text-gray-500 text-sm">אין קטגוריות זמינות</p>
        )}
      </div>
    </div>
  )
}

// Product Selector Component
const ProductSelector = ({ selected = [], onChange, label }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    fetchProducts()
  }, [])
  
  const fetchProducts = async () => {
    try {
      // Get current store dynamically
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      apiService.setToken(token);
      const userStores = await apiService.getUserStores();
      if (!userStores || userStores.length === 0) return;
      
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      const currentStore = selectedStoreId 
        ? userStores.find(store => store.id.toString() === selectedStoreId)
        : userStores[0];
      
      if (!currentStore) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/products?storeId=${currentStore.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleToggle = (productId) => {
    const newSelected = selected.includes(productId)
      ? selected.filter(id => id !== productId)
      : [...selected, productId]
    onChange(newSelected)
  }
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  if (loading) return <div className="text-gray-500">טוען מוצרים...</div>
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        placeholder="חפש מוצרים..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
        {filteredProducts.map(product => (
          <label key={product.id} className="flex items-center hover:bg-gray-50 p-2 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(product.id)}
              onChange={() => handleToggle(product.id)}
              className="ml-2"
            />
            <span className="text-sm">{product.name}</span>
            <span className="text-gray-500 text-xs mr-2">₪{product.price}</span>
          </label>
        ))}
        {filteredProducts.length === 0 && (
          <p className="text-gray-500 text-sm">לא נמצאו מוצרים</p>
        )}
      </div>
    </div>
  )
}

export default AutomaticDiscountFormPage

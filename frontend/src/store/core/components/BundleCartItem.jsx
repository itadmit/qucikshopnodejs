import { useState } from 'react'
import { Trash2, Plus, Minus, Gift, ChevronDown, ChevronUp } from 'lucide-react'

const BundleCartItem = ({ 
  bundleItems, 
  bundleId, 
  bundleName, 
  onUpdateQuantity, 
  onRemoveBundle,
  formatPrice 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Calculate bundle totals
  const bundleQuantity = bundleItems[0]?.quantity || 1
  const bundleTotal = bundleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const handleQuantityChange = (change) => {
    // Update all bundle items proportionally
    bundleItems.forEach(item => {
      const newQuantity = Math.max(0, item.quantity + (change * (item.quantity / bundleQuantity)))
      onUpdateQuantity(item.id, Math.round(newQuantity))
    })
  }
  
  const handleRemoveBundle = () => {
    // Remove all bundle items
    bundleItems.forEach(item => {
      onRemoveBundle(item.id)
    })
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
      {/* Bundle Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 flex items-center">
              <Gift className="w-4 h-4 text-blue-500 ml-1 rtl:ml-0 rtl:mr-1" />
              {bundleName}
            </h3>
            <p className="text-sm text-gray-500">
              בנדל של {bundleItems.length} מוצרים
            </p>
          </div>
        </div>
        
        <div className="text-left rtl:text-right">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(bundleTotal)}
          </div>
          <div className="text-sm text-gray-500">
            סה״כ לבנדל
          </div>
        </div>
      </div>
      
      {/* Bundle Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse bg-white rounded-lg border">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={bundleQuantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
              {bundleQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>{isExpanded ? 'הסתר פרטים' : 'הצג פרטים'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Remove Bundle Button */}
        <button
          onClick={handleRemoveBundle}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="הסר בנדל"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Bundle Items Details */}
      {isExpanded && (
        <div className="space-y-2 pt-3 border-t border-blue-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            מוצרים בבנדל:
          </h4>
          {bundleItems.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    {item.name}
                  </h5>
                  {item.options && Object.keys(item.options).length > 0 && (
                    <div className="text-xs text-gray-500">
                      {Object.entries(item.options).map(([key, value]) => (
                        <span key={key} className="ml-2 rtl:ml-0 rtl:mr-2">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.sku && (
                    <div className="text-xs text-gray-400">
                      מק״ט: {item.sku}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-left rtl:text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPrice(item.price)} × {item.quantity}
                </div>
              </div>
            </div>
          ))}
          
          {/* Bundle Savings */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                <Gift className="w-4 h-4 inline ml-1 rtl:ml-0 rtl:mr-1" />
                חיסכון בבנדל:
              </span>
              <span className="text-sm font-bold text-green-800">
                חסכת בקנייה משותפת!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BundleCartItem

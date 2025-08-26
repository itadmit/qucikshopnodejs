import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const CartIcon = ({ itemsCount = 0 }) => {
  const { t } = useTranslation()

  return (
    <Link 
      to="/cart" 
      className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors group"
      aria-label={t('nav.cart')}
    >
      <i className="ri-shopping-cart-line text-xl"></i>
      {itemsCount > 0 && (
        <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
          {itemsCount > 99 ? '99+' : itemsCount}
        </span>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {t('nav.cart')} {itemsCount > 0 && `(${itemsCount})`}
      </div>
    </Link>
  )
}

export default CartIcon

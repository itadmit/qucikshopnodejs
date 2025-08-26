import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import CartIcon from './CartIcon'

const StoreHeader = ({ storeData, isOwner }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItemsCount, setCartItemsCount] = useState(0)

  useEffect(() => {
    // Load cart items count from localStorage
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem(`cart_${storeData?.slug}`) || '[]')
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartItemsCount(totalItems)
    }

    updateCartCount()
    
    // Listen for cart updates
    const handleCartUpdate = () => updateCartCount()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [storeData?.slug])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus()
      }, 100)
    }
  }

  if (!storeData) return null

  console.log('🔍 StoreHeader rendering with cartItemsCount:', cartItemsCount)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {storeData.phone && (
                <span className="flex items-center">
                  <i className="ri-phone-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                  {storeData.phone}
                </span>
              )}
              {storeData.email && (
                <span className="flex items-center">
                  <i className="ri-mail-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                  {storeData.email}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {isOwner && (
                <a 
                  href="http://localhost:5173" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <i className="ri-dashboard-line ml-1 rtl:ml-0 rtl:mr-1"></i>
                  נהל חנות
                </a>
              )}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <LanguageSwitcher />
                <div className="w-px h-4 bg-white/30"></div>
                <a href="#" className="hover:text-primary-200 transition-colors">
                  <i className="ri-facebook-fill"></i>
                </a>
                <a href="#" className="hover:text-primary-200 transition-colors">
                  <i className="ri-instagram-line"></i>
                </a>
                <a href="#" className="hover:text-primary-200 transition-colors">
                  <i className="ri-whatsapp-line"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            {storeData.logoUrl ? (
              <img 
                src={storeData.logoUrl} 
                alt={storeData.name}
                className="h-10 w-auto"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {storeData.name?.charAt(0) || 'ח'}
                </span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900">
              {storeData.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/categories" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.categories')}
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.products')}
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.about')}
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Search */}
            <div className="relative">
              <button
                onClick={toggleSearch}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label={t('nav.search')}
              >
                <i className="ri-search-line text-xl"></i>
              </button>
              
              {isSearchOpen && (
                <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <form onSubmit={handleSearch} className="p-4">
                    <div className="relative">
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('nav.search')}
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <i className="ri-search-line absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
              aria-label="רשימת משאלות"
            >
              <i className="ri-heart-line text-xl"></i>
              {/* Wishlist count badge - you can add this later */}
            </Link>

            {/* Account */}
            <Link 
              to="/account" 
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label={t('nav.account')}
            >
              <i className="ri-user-line text-xl"></i>
            </Link>

            {/* Cart */}
            <CartIcon itemsCount={cartItemsCount} />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="תפריט"
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {isOwner && (
                <a 
                  href="http://localhost:5173" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center border border-primary-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="ri-dashboard-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                  נהל חנות
                </a>
              )}
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/categories" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.categories')}
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.products')}
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse">
                  <Link 
                    to="/wishlist" 
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="ri-heart-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                    רשימת משאלות
                  </Link>
                  <Link 
                    to="/account" 
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="ri-user-line ml-2 rtl:ml-0 rtl:mr-2"></i>
                    {t('nav.account')}
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Search Overlay for Mobile */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSearchOpen(false)}
        />
      )}
    </header>
  )
}

export default StoreHeader

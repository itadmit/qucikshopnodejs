import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, LayoutDashboard, Facebook, Instagram, MessageCircle, Search, Heart, User, Menu, X } from 'lucide-react'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import CartIcon from './CartIcon'
import SideCart from './SideCart'
import Toast from './Toast'

const StoreHeader = ({ storeData, isOwner }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

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
    
    // Listen for open side cart events
    const handleOpenSideCart = () => {
      setIsCartOpen(true)
      setToastMessage('המוצר נוסף לעגלה בהצלחה!')
      setShowToast(true)
    }
    window.addEventListener('openSideCart', handleOpenSideCart)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('openSideCart', handleOpenSideCart)
    }
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

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-black text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {storeData.phone && (
                <span className="flex items-center">
                  <Phone className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {storeData.phone}
                </span>
              )}
              {storeData.email && (
                <span className="flex items-center">
                  <Mail className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
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
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center border border-white/20"
                >
                  <LayoutDashboard className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />
                  נהל חנות
                </a>
              )}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <LanguageSwitcher />
                <div className="w-px h-4 bg-white/20"></div>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  <MessageCircle className="w-4 h-4" />
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
                <Search className="w-5 h-5" />
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
                      <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
              <Heart className="w-5 h-5" />
              {/* Wishlist count badge - you can add this later */}
            </Link>

            {/* Account */}
            <Link 
              to="/account" 
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label={t('nav.account')}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <CartIcon 
              itemsCount={cartItemsCount} 
              onClick={() => setIsCartOpen(true)}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="תפריט"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  <LayoutDashboard className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
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
                    <Heart className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                    רשימת משאלות
                  </Link>
                  <Link 
                    to="/account" 
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
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

      {/* Side Cart */}
      <SideCart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeData={storeData}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />
    </header>
  )
}

export default StoreHeader

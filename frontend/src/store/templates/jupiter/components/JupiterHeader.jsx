import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Phone, Mail, LayoutDashboard, Facebook, Instagram, MessageCircle, 
  Search, Heart, User, Menu, X, Truck, ShoppingBag, Bell, 
  ChevronDown, MapPin, Clock, Star
} from 'lucide-react'
import LanguageSwitcher from '../../../../components/LanguageSwitcher'
import CartIcon from '../../../core/components/CartIcon'
import SideCart from '../../../core/components/SideCart'
import Toast from '../../../core/components/Toast'
import cartService from '../../../../services/cartService'

const JupiterHeader = ({ storeData }) => {
  const isOwner = storeData?.isOwner || false;
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const searchRef = useRef(null)

  // Mock categories - in real app, fetch from API
  const categories = [
    { id: 1, name: 'אלקטרוניקה', slug: 'electronics', count: 45 },
    { id: 2, name: 'אופנה', slug: 'fashion', count: 32 },
    { id: 3, name: 'בית וגן', slug: 'home-garden', count: 28 },
    { id: 4, name: 'ספורט', slug: 'sports', count: 19 },
    { id: 5, name: 'יופי ובריאות', slug: 'beauty-health', count: 24 }
  ]

  // Mock search suggestions
  const mockSuggestions = [
    'אוזניות אלחוטיות',
    'טלפון סמארטפון',
    'מחשב נייד',
    'שעון חכם',
    'מקלדת גיימינג'
  ]

  // Helper function to preserve URL parameters when navigating
  const getUrlWithParams = (path) => {
    const currentParams = new URLSearchParams(window.location.search)
    if (currentParams.toString()) {
      return `${path}?${currentParams.toString()}`
    }
    return path
  }

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (storeData?.slug) {
      // Initialize cart service
      cartService.init(storeData.slug)
      
      // Load cart items count
      const updateCartCount = () => {
        setCartItemsCount(cartService.getItemCount())
      }

      updateCartCount()
      
      // Listen for cart updates using cart service
      const unsubscribe = cartService.addListener(() => {
        setCartItemsCount(cartService.getItemCount())
      })
      
      // Listen for cart updates (backward compatibility)
      const handleCartUpdate = () => updateCartCount()
      window.addEventListener('cartUpdated', handleCartUpdate)
      
      // Listen for open side cart events
      const handleOpenSideCart = (event) => {
        console.log('🎯 Header received openSideCart event:', event)
        setIsCartOpen(true)
        const message = event.detail?.message || 'המוצר נוסף לעגלה בהצלחה!'
        setToastMessage(message)
        setShowToast(true)
        console.log('✅ Side cart opened with message:', message)
      }
      
      window.addEventListener('openSideCart', handleOpenSideCart)
      
      return () => {
        unsubscribe()
        window.removeEventListener('cartUpdated', handleCartUpdate)
        window.removeEventListener('openSideCart', handleOpenSideCart)
      }
    }
  }, [storeData?.slug])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const currentParams = new URLSearchParams(window.location.search)
      currentParams.set('search', searchQuery.trim())
      navigate(`/products?${currentParams.toString()}`)
      setSearchQuery('')
      setIsSearchOpen(false)
      setShowSearchSuggestions(false)
    }
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.length > 0) {
      // Filter suggestions based on input
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.includes(value)
      )
      setSearchSuggestions(filtered.slice(0, 5))
      setShowSearchSuggestions(true)
    } else {
      setShowSearchSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion)
    setShowSearchSuggestions(false)
    // Auto-submit search
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.set('search', suggestion)
    navigate(`/products?${currentParams.toString()}`)
    setSearchQuery('')
    setIsSearchOpen(false)
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
    <header className={`bg-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'shadow-xl backdrop-blur-sm bg-white/95' : ''
    }`}>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>משלוח חינם על הזמנות מעל ₪200</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="hidden sm:flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>שירות לקוחות 24/7</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/30"></div>
              <div className="hidden md:flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>דירוג 4.9/5 מ-1000+ לקוחות</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              {storeData.phone && (
                <a href={`tel:${storeData.phone}`} className="flex items-center hover:text-blue-300 transition-colors">
                  <Phone className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {storeData.phone}
                </a>
              )}
              {storeData.email && (
                <a href={`mailto:${storeData.email}`} className="flex items-center hover:text-blue-300 transition-colors">
                  <Mail className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {storeData.email}
                </a>
              )}
              {storeData.address && (
                <div className="hidden lg:flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {storeData.address}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {isOwner && (
                <a 
                  href="https://my-quickshop.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center border border-white/20 shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />
                  נהל חנות
                </a>
              )}
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <LanguageSwitcher />
                <div className="w-px h-4 bg-white/20 mx-2"></div>
                <a href="#" className="hover:text-blue-300 transition-colors p-1 rounded">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-blue-300 transition-colors p-1 rounded">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-blue-300 transition-colors p-1 rounded">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Left Side - Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse justify-start">
            <Link 
              to={getUrlWithParams("/")} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors relative ${
                location.pathname === '/' ? 'text-blue-600' : ''
              }`}
            >
              {t('nav.home')}
              {location.pathname === '/' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                קטגוריות
                <ChevronDown className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
              </button>
              
              {showCategories && (
                <div 
                  className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  onMouseEnter={() => setShowCategories(true)}
                  onMouseLeave={() => setShowCategories(false)}
                >
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.slug}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link 
              to={getUrlWithParams("/products")} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors relative ${
                location.pathname === '/products' ? 'text-blue-600' : ''
              }`}
            >
              כל המוצרים
              {location.pathname === '/products' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </Link>
            
            <Link 
              to={getUrlWithParams("/about")} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors relative ${
                location.pathname === '/about' ? 'text-blue-600' : ''
              }`}
            >
              אודות
              {location.pathname === '/about' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          </nav>
          
          {/* Mobile: Empty div for grid alignment */}
          <div className="lg:hidden"></div>

          {/* Center - Logo */}
          <Link to={getUrlWithParams("/")} className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
            {storeData.logoUrl ? (
              <img 
                src={storeData.logoUrl} 
                alt={storeData.name}
                className="h-12 w-auto transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {storeData.name?.charAt(0) || 'ח'}
                </span>
              </div>
            )}
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">
              {storeData.name}
            </span>
          </Link>

          {/* Right Side - Actions */}
          <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={toggleSearch}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                aria-label={t('nav.search')}
              >
                <Search className="w-5 h-5" />
              </button>
              
              {isSearchOpen && (
                <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                  <form onSubmit={handleSearch} className="p-4">
                    <div className="relative">
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        placeholder="חפש מוצרים..."
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Search className="w-5 h-5 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {/* Search Suggestions */}
                    {showSearchSuggestions && searchSuggestions.length > 0 && (
                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <p className="text-xs text-gray-500 mb-2 px-2">הצעות חיפוש:</p>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 relative"
              aria-label="רשימת משאלות"
            >
              <Heart className="w-5 h-5" />
              {/* Wishlist count badge - you can add this later */}
            </Link>

            {/* Account */}
            <Link 
              to="/account" 
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              aria-label={t('nav.account')}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              aria-label="תפריט"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-6 py-4 border-t border-gray-200 bg-gray-50 rounded-xl">
            <div className="flex flex-col space-y-2 px-4">
              {isOwner && (
                <a 
                  href="https://my-quickshop.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                  נהל חנות
                </a>
              )}
              
              <Link 
                to={getUrlWithParams("/")} 
                className="text-gray-700 hover:text-blue-600 hover:bg-white font-medium transition-colors px-4 py-3 rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              
              {/* Mobile Categories */}
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-gray-500 mb-2">קטגוריות</p>
                <div className="space-y-1">
                  {categories.slice(0, 3).map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.slug}`}
                      className="block text-gray-600 hover:text-blue-600 transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <Link 
                to={getUrlWithParams("/products")} 
                className="text-gray-700 hover:text-blue-600 hover:bg-white font-medium transition-colors px-4 py-3 rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                כל המוצרים
              </Link>
              
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-blue-600 hover:bg-white font-medium transition-colors px-4 py-3 rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-blue-600 hover:bg-white font-medium transition-colors px-4 py-3 rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse">
                  <Link 
                    to="/wishlist" 
                    className="flex items-center text-gray-700 hover:text-red-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                    רשימת משאלות
                  </Link>
                  <Link 
                    to="/account" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
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

export default JupiterHeader
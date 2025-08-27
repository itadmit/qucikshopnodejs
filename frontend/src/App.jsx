import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  RiShoppingCartLine, 
  RiStoreLine, 
  RiUserLine, 
  RiCheckLine,
  RiArrowRightLine,
  RiStarLine,
  RiShieldCheckLine,
  RiSpeedUpLine,
  RiCustomerService2Line
} from '@remixicon/react'
import AuthModal from './components/AuthModal'
import LanguageSwitcher from './components/LanguageSwitcher'
import Dashboard from './components/Dashboard/Dashboard'
import StoreApp from './store/StoreApp'
import SiteBuilderPage from './components/SiteBuilder/pages/SiteBuilderPage'

function App() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' })
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [storeSlug, setStoreSlug] = useState(null)

  // Check if this is a store subdomain or main app
  useEffect(() => {
    console.log('🔄 App initialization started')
    const hostname = window.location.hostname
    const pathname = location.pathname
    const urlParams = new URLSearchParams(window.location.search)
    
    console.log('Current pathname:', pathname)
    
    let detectedStoreSlug = null
    
    // Check if preview=store parameter is present (for design preview)
    if (urlParams.get('preview') === 'store') {
      detectedStoreSlug = 'yogevstore' // Default store for preview
    }
    // Check if it's a subdomain (e.g., mystore.quickshop.com or mystore.localhost)
    else if (hostname.includes('.') && !hostname.startsWith('www')) {
      const subdomain = hostname.split('.')[0]
      // Don't treat 'admin', 'api', 'www' as store slugs
      if (!['admin', 'api', 'www', 'localhost'].includes(subdomain)) {
        detectedStoreSlug = subdomain
      }
    }
    // Or check if it's a path (e.g., quickshop.com/stores/mystore)
    else if (pathname.startsWith('/stores/')) {
      detectedStoreSlug = pathname.split('/')[2]
    }
    
    setStoreSlug(detectedStoreSlug)
    
    // Only check user auth if this is the main app (not a store)
    if (!detectedStoreSlug) {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          console.log('User loaded from localStorage:', parsedUser)
        } catch (error) {
          console.error('Error parsing user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      } else if (token && !userData) {
        // If we have a token but no user data, try to fetch it
        console.log('Token found but no user data, this might cause issues')
      }
    }
    
    setIsLoading(false)
  }, [location.pathname, navigate])

  // No automatic navigation - let Routes handle it

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const handleAuthSuccess = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setAuthModal({ isOpen: false, mode: 'login' })
    
    // Auto redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard')
    }, 500)
  }

  const plans = [
    {
      id: 'basic',
      name: 'בסיסי',
      price: '299',
      description: 'לאתרים ללא סליקה',
      features: [
        'עד 100 מוצרים',
        'תבנית Jupiter',
        'תמיכה בסיסית',
        'SSL חינם',
        'גיבויים יומיים'
      ]
    },
    {
      id: 'pro',
      name: 'מקצועי',
      price: '399',
      description: '+ 0.5% מעסקה',
      popular: true,
      features: [
        'מוצרים ללא הגבלה',
        'כל התבניות',
        'סליקת אשראי',
        'קופונים והנחות',
        'אנליטיקס מתקדם',
        'תמיכה מועדפת'
      ]
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    )
  }

  // If this is a store subdomain, show the store app
  if (storeSlug) {
    return <StoreApp storeSlug={storeSlug} />
  }

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    )
  }

  // Main App Routes
  return (
    <Routes>
      <Route path="/dashboard/*" element={
        user ? (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            onBack={() => navigate('/')}
            onNavigateToBuilder={() => navigate('/builder')}
          />
        ) : (
          <HomePage />
        )
      } />
      <Route path="/builder" element={
        user ? (
          <SiteBuilderPage 
            user={user} 
            onBack={() => navigate('/dashboard')} 
          />
        ) : (
          <HomePage />
        )
      } />
      <Route path="/stores/:slug" element={<StoreApp />} />
      <Route path="/" element={<HomePage />} />
    </Routes>
  )

  function HomePage() {

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
                <RiStoreLine className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QuickShop החדש
              </h1>
            </div>
            
            <nav className="flex items-center space-x-8 rtl:space-x-reverse">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">{t('nav.features')}</a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">{t('nav.pricing')}</a>
              <LanguageSwitcher />
              
              {user ? (
                // Logged in state
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700">
                    <RiUserLine className="h-5 w-5" />
                    <span className="text-sm font-medium">שלום, {user.firstName}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t('nav.dashboard')}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    התנתק
                  </button>
                </div>
              ) : (
                // Not logged in state
                <>
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                    className="text-gray-700 hover:text-purple-600 font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('nav.login')}
                  </button>
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t('nav.getStarted')}
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-right">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/50 rounded-full px-4 py-2 mb-6">
                <span className="text-purple-700 font-medium text-sm">🚀 פלטפורמת החנויות המובילה בישראל</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                החנות הדיגיטלית שלך
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                  מוכנה תוך דקות
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                פלטפורמת SaaS מתקדמת ליצירת חנויות אונליין מקצועיות עם כל מה שצריך - ניהול מוצרים, עגלת קניות, קופונים, סליקה ועוד
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                >
                  התחל ניסיון חינם
                  <RiArrowRightLine className="mr-2 h-5 w-5" />
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                  צפה בדמו
                </button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <RiShieldCheckLine className="h-4 w-4 text-green-500 ml-2" />
                  <span>אבטחה מתקדמת</span>
                </div>
                <div className="flex items-center">
                  <RiSpeedUpLine className="h-4 w-4 text-blue-500 ml-2" />
                  <span>הקמה תוך 5 דקות</span>
                </div>
                <div className="flex items-center">
                  <RiCustomerService2Line className="h-4 w-4 text-purple-500 ml-2" />
                  <span>תמיכה 24/7</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Visual/Stats */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">למה לבחור ב-QuickShop?</h3>
                  <p className="text-gray-600">הנתונים מדברים בעד עצמם</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">1000+</div>
                    <div className="text-gray-600 text-sm font-medium">חנויות פעילות</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                    <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                    <div className="text-gray-600 text-sm font-medium">זמינות שרת</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                    <div className="text-gray-600 text-sm font-medium">תמיכה טכנית</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl">
                    <div className="text-3xl font-bold text-orange-600 mb-2">5 דק׳</div>
                    <div className="text-gray-600 text-sm font-medium">זמן הקמה</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-2xl border border-purple-200/30">
                  <div className="flex items-center justify-center">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">ד</div>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">ש</div>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">מ</div>
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
                    </div>
                    <span className="mr-3 text-gray-700 font-medium text-sm">מצטרפים אלינו מדי יום</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-full px-6 py-3 mb-6 shadow-sm">
              <span className="text-gray-700 font-medium text-sm">✨ כל מה שצריך לחנות מצליחה</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              פתרון מלא ומתקדם לכל סוחר דיגיטלי
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              כל הכלים שאתה צריך כדי להקים, לנהל ולהצמיח את החנות הדיגיטלית שלך
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl w-14 h-14 mb-6">
                <RiStoreLine className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">תבנית Jupiter</h3>
              <p className="text-gray-600 leading-relaxed">עיצוב מודרני ומותאם נייד עם בילדר דפים מתקדם ואפשרויות התאמה אישית</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl w-14 h-14 mb-6">
                <RiShoppingCartLine className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">עגלת קניות חכמה</h3>
              <p className="text-gray-600 leading-relaxed">מערכת קוקיז מתקדמת עם בדיקת מלאי בזמן אמת וחוויית קנייה מותאמת</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl w-14 h-14 mb-6">
                <RiUserLine className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">ניהול מוצרים</h3>
              <p className="text-gray-600 leading-relaxed">מוצרים פשוטים ווריאציות עם תמיכה בתמונות ווידאו ומערכת קטגוריות מתקדמת</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl w-14 h-14 mb-6">
                <RiStarLine className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">קופונים והנחות</h3>
              <p className="text-gray-600 leading-relaxed">מערכת קופונים מתקדמת עם הנחות אוטומטיות, BOGO וקמפיינים מותאמים</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl w-14 h-14 mb-6">
                <RiShieldCheckLine className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">סליקת אשראי</h3>
              <p className="text-gray-600 leading-relaxed">חיבור מאובטח לחברות סליקה מובילות עם הגנה מתקדמת ותמיכה בכל כרטיסי האשראי</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl w-14 h-14 mb-6">
                <RiSpeedUpLine className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">מדיה מתקדמת</h3>
              <p className="text-gray-600 leading-relaxed">העלאה ל-S3 עם המרה ל-WebP, אופטימיזציה אוטומטית ומודל מדיה מתקדם</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Apps & Integrations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/50 rounded-full px-6 py-3 mb-6">
              <span className="text-purple-700 font-medium text-sm">📱 אפליקציות ואינטגרציות</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              נגישות מכל מקום ואינטגרציה מלאה
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              נהל את החנות שלך מכל מקום עם האפליקציות שלנו ותיהנה מאינטגרציה מלאה עם חברות הסליקה והמשלוחים המובילות
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Mobile Apps */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 mb-6">
                <div className="flex justify-center space-x-4 rtl:space-x-reverse mb-6">
                  <div className="bg-black rounded-2xl p-4 shadow-lg">
                    <div className="text-white text-2xl">📱</div>
                  </div>
                  <div className="bg-green-500 rounded-2xl p-4 shadow-lg">
                    <div className="text-white text-2xl">🤖</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">אפליקציות ניידות</h3>
                <p className="text-gray-600 mb-6">נהל את החנות שלך בדרכים עם האפליקציות המתקדמות שלנו</p>
                <div className="flex flex-col space-y-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-black rounded-lg p-2 ml-3">
                      <span className="text-white text-sm font-bold">iOS</span>
                    </div>
                    <span className="text-gray-700 font-medium">אפליקציית iPhone</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-green-500 rounded-lg p-2 ml-3">
                      <span className="text-white text-sm font-bold">Android</span>
                    </div>
                    <span className="text-gray-700 font-medium">אפליקציית Android</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Partners */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 mb-6">
                <div className="bg-blue-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6">
                  <RiShieldCheckLine className="h-8 w-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">חברות סליקה</h3>
                <p className="text-gray-600 mb-6">אינטגרציה מלאה עם חברות הסליקה המובילות בישראל</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">PayPal</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">פייפלוס</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">הייפ</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">פלאקארד</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Partners */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 mb-6">
                <div className="bg-green-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6">
                  <RiSpeedUpLine className="h-8 w-8 text-green-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">חברות משלוחים</h3>
                <p className="text-gray-600 mb-6">חיבור אוטומטי לחברות המשלוחים המובילות</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">קרגו</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">HFD</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">פוקוס</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <span className="text-gray-700 font-medium text-sm">נגב איקומרס</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Benefits */}
          <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">למה האינטגרציות שלנו מיוחדות?</h3>
              <p className="text-gray-600">חיבור אוטומטי וסנכרון מלא ללא מאמץ</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <span className="text-purple-600 text-xl">⚡</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">הגדרה מהירה</h4>
                <p className="text-gray-600 text-sm">חיבור תוך דקות ללא צורך בידע טכני</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <span className="text-blue-600 text-xl">🔄</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">סנכרון אוטומטי</h4>
                <p className="text-gray-600 text-sm">עדכון מלאי ומשלוחים בזמן אמת</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">עמלות מועדפות</h4>
                <p className="text-gray-600 text-sm">תעריפים מיוחדים ללקוחות QuickShop</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-full px-6 py-3 mb-6 shadow-sm">
              <span className="text-gray-700 font-medium text-sm">💎 מחירים שקופים וללא הפתעות</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              בחר את התוכנית המתאימה לך
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              תוכניות גמישות שגדלות איתך
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 relative ${plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      🔥 הכי פופולרי
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    ₪{plan.price}
                    <span className="text-lg text-gray-600">/חודש</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1 ml-3 flex-shrink-0">
                        <RiCheckLine className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-md ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                      : 'bg-white hover:bg-gray-50 text-purple-700 border-2 border-purple-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  התחל עכשיו
                </button>
              </div>
            ))}
          </div>

          {/* Quick benefits */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100">
              <span className="text-gray-700 text-sm">💳 ללא עמלות הקמה</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100">
              <span className="text-gray-700 text-sm">🔄 ביטול בכל עת</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100">
              <span className="text-gray-700 text-sm">📞 תמיכה חינם</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100/80 backdrop-blur-sm border border-purple-200/50 rounded-full px-6 py-3 mb-6">
              <span className="text-purple-700 font-semibold text-sm">⭐ לקוחות מרוצים מספרים</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              סיפורי הצלחה
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                מהלקוחות שלנו
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              גלו איך עסקים כמו שלכם הצליחו להכפיל את המכירות עם QuickShop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  ד
                </div>
                <div className="mr-4">
                  <h4 className="font-bold text-gray-900">דני כהן</h4>
                  <p className="text-gray-600 text-sm">חנות אופנה "סטייל"</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "תוך חודש הכפלנו את המכירות! הפלטפורמה קלה לשימוש והתמיכה מעולה. הלקוחות אוהבים את החוויה החדשה."
              </p>
              <div className="flex text-yellow-400">
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  ש
                </div>
                <div className="mr-4">
                  <h4 className="font-bold text-gray-900">שרה לוי</h4>
                  <p className="text-gray-600 text-sm">חנות תכשיטים "יהלום"</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "המעבר היה חלק לחלוטין. הצוות עזר לנו בכל שלב והתוצאות מדברות בעד עצמן - 300% עלייה במכירות אונליין!"
              </p>
              <div className="flex text-yellow-400">
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  מ
                </div>
                <div className="mr-4">
                  <h4 className="font-bold text-gray-900">מיכאל רוזן</h4>
                  <p className="text-gray-600 text-sm">חנות אלקטרוניקה "טק"</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "הפתרון הטכני המושלם! ניהול המלאי, הזמנות ותשלומים - הכל במקום אחד. חסכנו שעות עבודה כל יום."
              </p>
              <div className="flex text-yellow-400">
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
                <RiStarLine className="h-5 w-5 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            מוכן להתחיל?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            הצטרף לאלפי סוחרים שכבר בחרו ב-QuickShop וגדלו את העסק שלהם
          </p>
          
          {/* Success stories preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white mb-1">₪2.5M</div>
              <div className="text-purple-200 text-sm">מכירות חודשיות ממוצעות</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white mb-1">85%</div>
              <div className="text-purple-200 text-sm">עלייה במכירות שנתיות</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-purple-200 text-sm">דירוג שביעות רצון</div>
            </div>
          </div>
          <button 
            onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
            className="bg-white text-purple-600 hover:bg-gray-50 font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 inline-flex items-center"
          >
            התחל ניסיון חינם ל-14 יום
            <RiArrowRightLine className="mr-3 h-6 w-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
                  <RiStoreLine className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">QuickShop החדש</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
                פלטפורמת SaaS מתקדמת לחנויות אונליין עם כל מה שצריך להצלחה דיגיטלית
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">1000+</div>
                  <div className="text-gray-400 text-sm">חנויות</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-pink-400">99.9%</div>
                  <div className="text-gray-400 text-sm">זמינות</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">24/7</div>
                  <div className="text-gray-400 text-sm">תמיכה</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-xl text-white">מוצר</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#features" className="hover:text-purple-400 transition-colors text-lg">תכונות</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 transition-colors text-lg">מחירים</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">דמו</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">תבניות</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-xl text-white">תמיכה</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">מרכז עזרה</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">צור קשר</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">סטטוס מערכת</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">מדריכים</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-lg">&copy; 2024 QuickShop החדש. כל הזכויות שמורות.</p>
            <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">תנאי שימוש</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">מדיניות פרטיות</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">עוגיות</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
  }
}

export default App
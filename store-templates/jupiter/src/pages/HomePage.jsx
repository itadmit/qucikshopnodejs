import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import CategoryCard from '../components/CategoryCard'

const HomePage = ({ storeData }) => {
  const { t } = useTranslation()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      // Mock data for now - will be connected to API later
      const mockCategories = [
        {
          id: 1,
          name: 'אלקטרוניקה',
          slug: 'electronics',
          imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
          productCount: 25
        },
        {
          id: 2,
          name: 'אופנה',
          slug: 'fashion',
          imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
          productCount: 18
        },
        {
          id: 3,
          name: 'בית וגן',
          slug: 'home-garden',
          imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
          productCount: 32
        },
        {
          id: 4,
          name: 'ספורט',
          slug: 'sports',
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          productCount: 15
        }
      ]

      const mockProducts = [
        {
          id: 1,
          name: 'אוזניות אלחוטיות',
          slug: 'wireless-headphones',
          price: 299,
          originalPrice: 399,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          category: 'אלקטרוניקה',
          inStock: true,
          rating: 4.5,
          reviewCount: 128
        },
        {
          id: 2,
          name: 'חולצת פולו',
          slug: 'polo-shirt',
          price: 89,
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          category: 'אופנה',
          inStock: true,
          rating: 4.2,
          reviewCount: 64
        },
        {
          id: 3,
          name: 'צמח נוי',
          slug: 'decorative-plant',
          price: 45,
          imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
          category: 'בית וגן',
          inStock: false,
          rating: 4.8,
          reviewCount: 92
        },
        {
          id: 4,
          name: 'נעלי ריצה',
          slug: 'running-shoes',
          price: 259,
          originalPrice: 329,
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          category: 'ספורט',
          inStock: true,
          rating: 4.6,
          reviewCount: 156
        }
      ]

      setCategories(mockCategories)
      setFeaturedProducts(mockProducts)
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Shopify Style */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)'
      }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 text-center lg:text-right">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <span className="text-sm font-medium text-gray-800">✨ החנות המובילה בישראל</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight">
                  <span className="block">החנות</span>
                  <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    שלך
                  </span>
                  <span className="block">מתחילה כאן</span>
                </h1>
                <p className="text-xl lg:text-xl text-gray-700 leading-relaxed max-w-2xl">
                  גלו אלפי מוצרים איכותיים, משלוח מהיר וחינם, ושירות לקוחות מעולה. 
                  <span className="font-semibold">הקניות שלכם מתחילות כאן!</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                <Link
                  to="/products"
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    התחילו לקנות עכשיו
                    <i className="ri-arrow-left-line mr-3 rtl:mr-0 rtl:ml-3 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"></i>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold text-lg rounded-2xl border-2 border-white/50 hover:bg-white hover:border-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  למידע נוסף
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600 font-medium">מוצרים</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600 font-medium">לקוחות מרוצים</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600 font-medium">תמיכה</div>
                </div>
              </div>
            </div>
            
            <div className="relative lg:order-first">
              {/* Main Product Showcase */}
              <div className="relative">
                <div className="aspect-square bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/30">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop"
                    alt="מוצר מוביל"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating Product Cards */}
                <div className="absolute -top-6 -right-6 rtl:-right-auto rtl:-left-6 bg-white rounded-2xl shadow-xl p-4 animate-float">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img 
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&h=60&fit=crop" 
                      alt="מוצר" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">אוזניות אלחוטיות</div>
                      <div className="text-xs text-gray-500">₪299</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 rtl:-left-auto rtl:-right-6 bg-white rounded-2xl shadow-xl p-4 animate-float" style={{animationDelay: '1s'}}>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img 
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop" 
                      alt="מוצר" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">נעלי ריצה</div>
                      <div className="text-xs text-gray-500">₪259</div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-1/4 -left-8 rtl:-left-auto rtl:-right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce opacity-80"></div>
                <div className="absolute bottom-1/4 -right-8 rtl:-right-auto rtl:-left-8 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section - Enhanced Shopify Style */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
              ✨ למה לבחור בנו?
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              החוויה הטובה ביותר
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                לקנייה אונליין
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              אנחנו מתחייבים לספק לכם את השירות הטוב ביותר עם מוצרים איכותיים, משלוח מהיר ותמיכה מעולה
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group modern-card bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <i className="ri-shield-check-line text-3xl text-white"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-xs"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                איכות מובטחת
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                כל המוצרים שלנו עוברים בדיקת איכות קפדנית ומגיעים עם אחריות מלאה
              </p>
            </div>
            
            <div className="group modern-card bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <i className="ri-rocket-line text-3xl text-white"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">24h</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                משלוח מהיר
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                משלוח חינם עד הבית תוך 24 שעות לכל רחבי הארץ
              </p>
            </div>
            
            <div className="group modern-card bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <i className="ri-headphone-line text-3xl text-white"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">24/7</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                תמיכה 24/7
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                צוות התמיכה שלנו זמין עבורכם 24 שעות ביממה, 7 ימים בשבוע
              </p>
            </div>
            
            <div className="group modern-card bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <i className="ri-money-dollar-circle-line text-3xl text-white"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="ri-percent-line text-white text-xs"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                מחירים הוגנים
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                מחירים תחרותיים ומבצעים מיוחדים לחברי המועדון שלנו
              </p>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-20 text-center">
            <p className="text-gray-500 mb-8 font-medium">מהימנים על ידי אלפי לקוחות מרוצים</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <span className="font-bold text-gray-700">4.9/5</span>
                <span className="text-gray-500">דירוג ממוצע</span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <i className="ri-shield-check-fill text-green-500 text-xl"></i>
                <span className="font-bold text-gray-700">SSL</span>
                <span className="text-gray-500">מאובטח</span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <i className="ri-truck-fill text-blue-500 text-xl"></i>
                <span className="font-bold text-gray-700">50K+</span>
                <span className="text-gray-500">משלוחים</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              🛍️ קטגוריות פופולריות
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              גלו את
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                הקטגוריות שלנו
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              מגוון רחב של מוצרים איכותיים בכל הקטגוריות שאתם אוהבים
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="group modern-card bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transform hover:-translate-y-2 transition-all duration-300"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
                    {category.productCount} מוצרים
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    גלו את המוצרים הטובים ביותר בקטגוריית {category.name}
                  </p>
                  <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    צפו בכל המוצרים
                    <i className="ri-arrow-left-line mr-2 rtl:mr-0 rtl:ml-2"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Enhanced */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              🔥 המוצרים הנמכרים ביותר
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              המוצרים
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                המובילים שלנו
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              המוצרים הפופולריים ביותר שלקוחותינו הכי אוהבים
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-full hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              צפו בכל המוצרים
              <i className="ri-arrow-left-line mr-2 rtl:mr-0 rtl:ml-2"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group modern-card bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100"
                style={{animationDelay: `${index * 150}ms`}}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold">
                        אזל מהמלאי
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                      <i className="ri-heart-line"></i>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-yellow-400 text-sm`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm mr-2 rtl:mr-0 rtl:ml-2">
                      ({product.reviewCount})
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {product.category}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-xl font-black text-gray-900">
                        ₪{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ₪{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      product.inStock
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'הוסף לעגלה' : 'אזל מהמלאי'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              {t('footer.newsletter')}
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed">
              קבלו עדכונים על מוצרים חדשים, מבצעים מיוחדים והנחות בלעדיות
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('footer.email')}
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

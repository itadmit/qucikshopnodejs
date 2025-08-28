import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Truck, 
  RefreshCw, 
  MessageCircle, 
  CreditCard,
  Star,
  ShoppingCart,
  ArrowRight,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Check,
  Gift,
  Zap,
  Shield,
  Clock,
  Award,
  Heart,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import JupiterProductCard from '../components/JupiterProductCard'
import JupiterCategoryCard from '../components/JupiterCategoryCard'

const JupiterHomePage = ({ storeData }) => {
  const { t } = useTranslation()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (storeData) {
      fetchStoreContent()
    }
  }, [storeData])

  const fetchStoreContent = async () => {
    try {
      setLoading(true)
      
      // Fetch categories and products for this store
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/stores/${storeData.slug}/categories`),
        fetch(`http://localhost:3001/api/stores/${storeData.slug}/products/featured`)
      ])
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setFeaturedProducts(productsData)
      }
      
    } catch (error) {
      console.error('Error fetching store content:', error)
      
      // Fallback to mock data for development
      setCategories([
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
      ])

      setFeaturedProducts([
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
      ])
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
    <div className="min-h-screen bg-white">
      {/* Classic Hero Section - Split Layout */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh] items-center gap-8 py-12">
            
            {/* Content Side */}
            <div className="space-y-8 text-center lg:text-right order-2 lg:order-1 py-12 lg:py-0">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2 rtl:ml-0 rtl:mr-2"></span>
                הקולקציה החדשה של {storeData.name}
              </div>
              
              <div className="space-y-4">
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  <span className="block">גלו את</span>
                  <span className="block text-gray-600">הסגנון שלכם</span>
                </h1>
                <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {storeData.description || 'קולקציה חדשה של בגדים איכותיים, עיצובים ייחודיים ונוחות מקסימלית לכל יום.'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  קנו עכשיו
                </Link>
                <Link
                  to="/collections"
                  className="border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-colors duration-300 flex items-center gap-2 text-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  צפו בקולקציות
                </Link>
              </div>
              
              {/* Simple Stats */}
              <div className="flex justify-center lg:justify-start space-x-6 rtl:space-x-reverse pt-6">
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <ShoppingCart className="w-3 h-3 text-gray-600" />
                    <div className="text-lg font-bold text-gray-900">100+</div>
                  </div>
                  <div className="text-xs text-gray-600">מוצרים</div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-gray-600" />
                    <div className="text-lg font-bold text-gray-900">5K+</div>
                  </div>
                  <div className="text-xs text-gray-600">לקוחות</div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <div className="text-lg font-bold text-gray-900">24/7</div>
                  </div>
                  <div className="text-xs text-gray-600">תמיכה</div>
                </div>
              </div>
            </div>
            
            {/* Image Side */}
            <div className="relative order-1 lg:order-2 p-4">
              <div className="relative aspect-square lg:aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
                <img
                  src={featuredProducts[0]?.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop"}
                    alt="מוצר מוביל"
                    className="w-full h-full object-cover"
                  />
                
                {/* Floating Product Info */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {featuredProducts[0]?.name || 'המוצר הנבחר שלנו'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {featuredProducts[0]?.category || 'קולקציה חדשה'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      ₪{featuredProducts[0]?.price || '299'}
                    </span>
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      הוסף לעגלה
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Categories - Classic Style */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              קנו לפי קטגוריות
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              מצאו בדיוק מה שאתם מחפשים בקטגוריות המובחרות שלנו
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                <div className="absolute bottom-6 left-6 right-6 text-center">
                  <h3 className="text-white font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.productCount} מוצרים</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Grid - Modern Classic */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                המוצרים המובילים
              </h2>
              <p className="text-lg text-gray-600">
                הקולקציה הנבחרת שלנו במיוחד עבורכם
              </p>
            </div>
            <Link
              to="/products"
              className="hidden lg:inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300"
            >
              צפו בהכל
              <i className="ri-arrow-left-line mr-2 rtl:mr-0 rtl:ml-2"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
                      חסכון ₪{product.originalPrice - product.price}
                    </div>
                  )}
                  <button className="absolute bottom-4 left-4 right-4 bg-gray-900 text-white py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    הוסף לעגלה
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-xl font-bold text-gray-900">₪{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₪{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 lg:hidden">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300"
            >
              צפו בכל המוצרים
              <i className="ri-arrow-left-line mr-2 rtl:mr-0 rtl:ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* This Week's Highlights */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              הדגשים של השבוע
            </h2>
            <p className="text-base text-gray-600">
              המוצרים החמים ביותר שלא כדאי לפספס
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dynamic badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {index % 3 === 0 && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        חדש
                      </span>
                    )}
                    {index % 3 === 1 && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        מבצע
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₪{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">₪{product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section - Mix & Match */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Before/After Image */}
            <div className="relative">
              <div className="relative aspect-[4/5] bg-gray-200 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex">
                  {/* Before */}
                  <div className="w-1/2 relative">
                    <img
                      src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop"
                      alt="לפני"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                      לפני
                    </div>
                  </div>
                  
                  {/* After */}
                  <div className="w-1/2 relative">
                    <img
                      src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&sat=-100"
                      alt="אחרי"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                      אחרי
                    </div>
                  </div>
                </div>
                
                {/* Slider Handle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 text-center lg:text-right">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Mix & Match
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                שלבו חלקים שעוצבו במיוחד
              </h2>
              
              <p className="text-base text-gray-600">
                זו ההזדמנות שלכם לשדרג את הארון עם מגוון סגנונות וגזרות שמתאימים לכולם.
              </p>
              
              <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                קנו Mix & Match
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Showcase - 3 Large Images */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
            
            {/* Vintage Handbags */}
            <div className="relative group bg-gray-200 rounded-2xl overflow-hidden cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop"
                alt="תיקים וינטאג'"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-sm mb-2 opacity-80">הגעות חדשות</p>
                <h3 className="text-2xl font-bold mb-4">תיקים וינטאג'</h3>
              </div>
            </div>

            {/* Leather Boots */}
            <div className="relative group bg-gray-200 rounded-2xl overflow-hidden cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop"
                alt="מגפי עור"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-sm mb-2 opacity-80">הגעות חדשות</p>
                <h3 className="text-2xl font-bold mb-4">מגפי עור</h3>
              </div>
            </div>

            {/* Tailored Skirts */}
            <div className="relative group bg-gray-200 rounded-2xl overflow-hidden cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop"
                alt="חצאיות מחויטות"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-sm mb-2 opacity-80">הגעות חדשות</p>
                <h3 className="text-2xl font-bold mb-4">חצאיות מחויטות</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content */}
            <div className="space-y-6 text-white">
              <div className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium gap-2">
                <Clock className="w-4 h-4" />
                מבצע מוגבל
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold">
                <span className="block">תזוזו קדימה עם</span>
                <span className="block text-yellow-400">60% הנחה</span>
                <span className="block">על חולצות כבדות</span>
              </h2>
              
              <p className="text-base lg:text-lg text-gray-300">
                השילוב המושלם של נוחות ועמידות עכשיו בהישג יד, במחיר שקשה לסרב לו.
              </p>
              
              <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                קנו בקולקציה
              </button>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop"
                alt="חולצה 1"
                className="w-full aspect-[3/4] object-cover rounded-2xl"
              />
              <img
                src="https://images.unsplash.com/photo-1583743814966-8936f37f3a3e?w=300&h=400&fit=crop"
                alt="חולצה 2"
                className="w-full aspect-[3/4] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">משלוח חינם</h3>
              <p className="text-sm text-gray-600">משלוח חינם על הזמנות מעל ₪130</p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">החזר כספי מובטח</h3>
              <p className="text-sm text-gray-600">תוך 30 יום להחלפה</p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">תמיכה אונליין</h3>
              <p className="text-sm text-gray-600">24 שעות ביום, 7 ימים בשבוע</p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">תשלום גמיש</h3>
              <p className="text-sm text-gray-600">תשלום במספר כרטיסי אשראי</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Clean & Simple */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto space-y-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              בואו ניצור קשר
            </h2>
            <p className="text-gray-300 text-base">
              הירשמו לניוזלטר שלנו וקבלו 10% הנחה על ההזמנה הראשונה
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="הכניסו את כתובת האימייל שלכם"
                className="flex-1 px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                הירשמו עכשיו
              </button>
            </form>
            
            <p className="text-gray-400 text-sm">
              אנחנו מכבדים את הפרטיות שלכם ולא נשלח ספאם
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default JupiterHomePage

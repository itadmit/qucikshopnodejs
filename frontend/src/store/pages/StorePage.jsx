import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import CategoryCard from '../components/CategoryCard'

const StorePage = ({ storeData }) => {
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
                <span className="text-sm font-medium text-gray-800">✨ {storeData.name}</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight">
                  <span className="block">ברוכים הבאים</span>
                  <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    לחנות שלנו
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                  {storeData.description || 'גלו אלפי מוצרים איכותיים, משלוח מהיר וחינם, ושירות לקוחות מעולה.'}
                  <span className="font-semibold block mt-2">הקניות שלכם מתחילות כאן!</span>
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
                  <div className="text-3xl font-black text-gray-900">{featuredProducts.length * 25}+</div>
                  <div className="text-sm text-gray-600 font-medium">מוצרים</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-gray-900">1K+</div>
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
                    src={featuredProducts[0]?.imageUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop"}
                    alt="מוצר מוביל"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating Product Cards */}
                {featuredProducts.slice(1, 3).map((product, index) => (
                  <div 
                    key={product.id}
                    className={`absolute bg-white rounded-2xl shadow-xl p-4 animate-float ${
                      index === 0 
                        ? '-top-6 -right-6 rtl:-right-auto rtl:-left-6' 
                        : '-bottom-6 -left-6 rtl:-left-auto rtl:-right-6'
                    }`}
                    style={{animationDelay: `${index}s`}}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">₪{product.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
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

      {/* Categories Section */}
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
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
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
              <ProductCard key={product.id} product={product} storeSlug={storeData.slug} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              הירשמו לניוזלטר
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed">
              קבלו עדכונים על מוצרים חדשים, מבצעים מיוחדים והנחות בלעדיות
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="כתובת אימייל"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                הירשמו
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StorePage

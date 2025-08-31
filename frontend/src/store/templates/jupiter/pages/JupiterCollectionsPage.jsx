import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Filter, Grid, List, ArrowRight, ShoppingBag, Star, TrendingUp } from 'lucide-react'

const JupiterCollectionsPage = ({ storeData }) => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    if (storeData) {
      fetchCategories()
    }
  }, [storeData])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // Fetch categories from API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/stores/${storeData.slug}/categories`)
      
      if (response.ok) {
        const categoriesData = await response.json()
        setCategories(categoriesData)
      } else {
        // Fallback to mock data
        const mockCategories = [
          {
            id: 1,
            name: 'אלקטרוניקה',
            slug: 'electronics',
            description: 'מוצרי אלקטרוניקה מתקדמים ואיכותיים',
            imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
            productCount: 25,
            featured: true,
            color: '#3B82F6'
          },
          {
            id: 2,
            name: 'אופנה',
            slug: 'fashion',
            description: 'בגדים וסגנון לכל אירוע',
            imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
            productCount: 18,
            featured: true,
            color: '#EF4444'
          },
          {
            id: 3,
            name: 'בית וגן',
            slug: 'home-garden',
            description: 'כל מה שצריך לבית ולגינה',
            imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
            productCount: 32,
            featured: false,
            color: '#10B981'
          },
          {
            id: 4,
            name: 'ספורט',
            slug: 'sports',
            description: 'ציוד ספורט ופעילות גופנית',
            imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
            productCount: 15,
            featured: false,
            color: '#F59E0B'
          },
          {
            id: 5,
            name: 'יופי ובריאות',
            slug: 'beauty-health',
            description: 'מוצרי יופי וטיפוח',
            imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
            productCount: 22,
            featured: true,
            color: '#8B5CF6'
          },
          {
            id: 6,
            name: 'ילדים ותינוקות',
            slug: 'kids-babies',
            description: 'כל מה שצריך לילדים ולתינוקות',
            imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600',
            productCount: 19,
            featured: false,
            color: '#EC4899'
          },
          {
            id: 7,
            name: 'מזון ומשקאות',
            slug: 'food-drinks',
            description: 'מוצרי מזון איכותיים',
            imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
            productCount: 41,
            featured: false,
            color: '#F97316'
          },
          {
            id: 8,
            name: 'רכב ואופנועים',
            slug: 'automotive',
            description: 'אביזרים וחלקי חילוף לרכב',
            imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
            productCount: 13,
            featured: false,
            color: '#6B7280'
          }
        ]
        setCategories(mockCategories)
      }
      
    } catch (error) {
      console.error('Error fetching categories:', error)
      
      // Fallback to mock data on error
      const mockCategories = [
        {
          id: 1,
          name: 'אלקטרוניקה',
          slug: 'electronics',
          description: 'מוצרי אלקטרוניקה מתקדמים ואיכותיים',
          imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
          productCount: 25,
          featured: true,
          color: '#3B82F6'
        },
        {
          id: 2,
          name: 'אופנה',
          slug: 'fashion',
          description: 'בגדים וסגנון לכל אירוע',
          imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
          productCount: 18,
          featured: true,
          color: '#EF4444'
        }
      ]
      setCategories(mockCategories)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'products':
        return b.productCount - a.productCount
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      case 'name':
      default:
        return a.name.localeCompare(b.name, 'he')
    }
  })

  const featuredCategories = sortedCategories.filter(cat => cat.featured)
  const regularCategories = sortedCategories.filter(cat => !cat.featured)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">טוען קולקציות...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-l from-gray-900 to-gray-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              גלו את הקולקציות שלנו
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              מגוון רחב של קטגוריות מובחרות במיוחד עבורכם
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>{categories.length} קטגוריות</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>{categories.reduce((sum, cat) => sum + cat.productCount, 0)} מוצרים</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="חיפוש קטגוריות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
              >
                <option value="name">מיון לפי שם</option>
                <option value="products">מיון לפי כמות מוצרים</option>
                <option value="featured">מיון לפי מובלטות</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">קטגוריות מובלטות</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        מובלט
                      </span>
                    </div>

                    {/* Category Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {category.productCount} מוצרים
                        </span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {featuredCategories.length > 0 ? 'כל הקטגוריות' : 'הקטגוריות שלנו'}
            </h2>
            <span className="text-gray-600">
              {sortedCategories.length} קטגוריות נמצאו
            </span>
          </div>

          {sortedCategories.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(featuredCategories.length > 0 ? regularCategories : sortedCategories).map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {category.productCount} מוצרים
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(featuredCategories.length > 0 ? regularCategories : sortedCategories).map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="group flex items-center bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ml-4">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-2 line-clamp-1">
                        {category.description}
                      </p>
                      <span className="text-sm text-gray-500">
                        {category.productCount} מוצרים
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                לא נמצאו קטגוריות
              </h3>
              <p className="text-gray-600 mb-6">
                נסה לשנות את מונחי החיפוש או הסר פילטרים
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                נקה חיפוש
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default JupiterCollectionsPage

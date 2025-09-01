import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getApiUrl } from '../../../../config/environment.js';
import { useTranslation } from 'react-i18next'
import { Search, Filter, SlidersHorizontal, Grid, List, ArrowUpDown, ShoppingBag, Star, Heart, Eye } from 'lucide-react'
import JupiterProductCard from '../components/JupiterProductCard'

const JupiterProductsPage = ({ storeData }) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name')
  const [filterBy, setFilterBy] = useState(searchParams.get('filter') || 'all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (storeData) {
      fetchProductsAndCategories()
    }
  }, [storeData])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (sortBy !== 'name') params.set('sort', sortBy)
    if (filterBy !== 'all') params.set('filter', filterBy)
    
    setSearchParams(params)
  }, [searchTerm, selectedCategory, sortBy, filterBy, setSearchParams])

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true)
      
      // Build query parameters for products
      const productParams = new URLSearchParams()
      if (searchTerm) productParams.set('search', searchTerm)
      if (selectedCategory && selectedCategory !== 'all') productParams.set('category', selectedCategory)
      if (sortBy) productParams.set('sortBy', sortBy)
      
      // Fetch products and categories
      const productsUrl = `${import.meta.env.VITE_API_URL || getApiUrl('')}/stores/${storeData.slug}/products${productParams.toString() ? `?${productParams.toString()}` : ''}`
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(productsUrl),
        fetch(`${import.meta.env.VITE_API_URL || getApiUrl('')}/stores/${storeData.slug}/categories`)
      ])
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
      
      // If no data from API, use mock data
      if (!productsResponse.ok || !categoriesResponse.ok) {
        setMockData()
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockCategories = [
      { id: 1, name: 'אלקטרוניקה', slug: 'electronics' },
      { id: 2, name: 'אופנה', slug: 'fashion' },
      { id: 3, name: 'בית וגן', slug: 'home-garden' },
      { id: 4, name: 'ספורט', slug: 'sports' },
      { id: 5, name: 'יופי ובריאות', slug: 'beauty-health' }
    ]

    const mockProducts = [
      {
        id: 1,
        name: 'אוזניות אלחוטיות מתקדמות',
        slug: 'wireless-headphones-advanced',
        price: 299,
        originalPrice: 399,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'אלקטרוניקה',
        categorySlug: 'electronics',
        inStock: true,
        rating: 4.5,
        reviewCount: 128,
        isNew: true,
        isSale: true
      },
      {
        id: 2,
        name: 'חולצת פולו קלאסית',
        slug: 'classic-polo-shirt',
        price: 89,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        category: 'אופנה',
        categorySlug: 'fashion',
        inStock: true,
        rating: 4.2,
        reviewCount: 64,
        isNew: false,
        isSale: false
      },
      {
        id: 3,
        name: 'צמח נוי לבית',
        slug: 'decorative-house-plant',
        price: 45,
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        category: 'בית וגן',
        categorySlug: 'home-garden',
        inStock: false,
        rating: 4.8,
        reviewCount: 92,
        isNew: true,
        isSale: false
      },
      {
        id: 4,
        name: 'נעלי ריצה מקצועיות',
        slug: 'professional-running-shoes',
        price: 259,
        originalPrice: 329,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        category: 'ספורט',
        categorySlug: 'sports',
        inStock: true,
        rating: 4.6,
        reviewCount: 156,
        isNew: false,
        isSale: true
      },
      {
        id: 5,
        name: 'סמארטפון חדיש',
        slug: 'modern-smartphone',
        price: 1299,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        category: 'אלקטרוניקה',
        categorySlug: 'electronics',
        inStock: true,
        rating: 4.7,
        reviewCount: 89,
        isNew: true,
        isSale: false
      },
      {
        id: 6,
        name: 'מחשב נייד עבודה',
        slug: 'work-laptop',
        price: 2499,
        originalPrice: 2799,
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        category: 'אלקטרוניקה',
        categorySlug: 'electronics',
        inStock: false,
        rating: 4.3,
        reviewCount: 156,
        isNew: false,
        isSale: true
      },
      {
        id: 7,
        name: 'שמלה אלגנטית',
        slug: 'elegant-dress',
        price: 199,
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        category: 'אופנה',
        categorySlug: 'fashion',
        inStock: true,
        rating: 4.4,
        reviewCount: 73,
        isNew: true,
        isSale: false
      },
      {
        id: 8,
        name: 'כיסא משרדי ארגונומי',
        slug: 'ergonomic-office-chair',
        price: 599,
        originalPrice: 799,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        category: 'בית וגן',
        categorySlug: 'home-garden',
        inStock: true,
        rating: 4.6,
        reviewCount: 112,
        isNew: false,
        isSale: true
      }
    ]

    setCategories(mockCategories)
    setProducts(mockProducts)
  }

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory
    
    // Status filter
    let matchesFilter = true
    if (filterBy === 'sale') {
      matchesFilter = product.originalPrice && product.originalPrice > product.price
    } else if (filterBy === 'in-stock') {
      matchesFilter = product.inStock
    } else if (filterBy === 'new') {
      matchesFilter = product.isNew
    }
    
    // Price range filter
    let matchesPrice = true
    if (priceRange.min && product.price < parseFloat(priceRange.min)) {
      matchesPrice = false
    }
    if (priceRange.max && product.price > parseFloat(priceRange.max)) {
      matchesPrice = false
    }
    
    return matchesSearch && matchesCategory && matchesFilter && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      case 'popular':
        return (b.reviewCount || 0) - (a.reviewCount || 0)
      case 'name':
      default:
        return a.name.localeCompare(b.name, 'he')
    }
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setFilterBy('all')
    setPriceRange({ min: '', max: '' })
    setSortBy('name')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">טוען מוצרים...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-gray-900 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              כל המוצרים שלנו
            </h1>
            <p className="text-xl text-gray-200 mb-6">
              גלו את המגוון הרחב של המוצרים האיכותיים שלנו
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>{products.length} מוצרים</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>{categories.length} קטגוריות</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="חיפוש מוצרים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>פילטרים</span>
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
              >
                <option value="name">מיון לפי שם</option>
                <option value="price-low">מחיר: נמוך לגבוה</option>
                <option value="price-high">מחיר: גבוה לנמוך</option>
                <option value="rating">דירוג</option>
                <option value="newest">החדשים ביותר</option>
                <option value="popular">הפופולריים ביותר</option>
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

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  >
                    <option value="all">כל הקטגוריות</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">סטטוס</label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  >
                    <option value="all">כל המוצרים</option>
                    <option value="sale">במבצע</option>
                    <option value="in-stock">במלאי</option>
                    <option value="new">חדש</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">טווח מחירים</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="מ-"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="עד"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    נקה פילטרים
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {sortedProducts.length} מוצרים נמצאו
            </h2>
            {(searchTerm || selectedCategory !== 'all' || filterBy !== 'all') && (
              <p className="text-gray-600 text-sm mt-1">
                מסונן לפי: {searchTerm && `"${searchTerm}"`} 
                {selectedCategory !== 'all' && ` קטגוריה: ${categories.find(c => c.slug === selectedCategory)?.name}`}
                {filterBy !== 'all' && ` סטטוס: ${filterBy}`}
              </p>
            )}
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product, index) => (
                <JupiterProductCard 
                  key={product.id} 
                  product={product} 
                  storeSlug={storeData.slug} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product, index) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-gray-900">₪{product.price}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">₪{product.originalPrice}</span>
                              )}
                            </div>
                            {product.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">{product.rating}</span>
                                <span className="text-sm text-gray-500">({product.reviewCount})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                            הוסף לעגלה
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              לא נמצאו מוצרים
            </h3>
            <p className="text-gray-600 mb-6">
              נסה לשנות את מונחי החיפוש או הפילטרים
            </p>
            <button
              onClick={clearFilters}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              נקה את כל הפילטרים
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JupiterProductsPage

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import JupiterProductCard from '../components/JupiterProductCard'

const JupiterCategoryPage = ({ storeData }) => {
  const { t } = useTranslation()
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    if (storeData && slug) {
      fetchCategoryData()
    }
  }, [storeData, slug])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      
      // Fetch category and its products
      const [categoryResponse, productsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/stores/${storeData.slug}/categories/${slug}`),
        fetch(`${import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api'}/stores/${storeData.slug}/categories/${slug}/products`)
      ])
      
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        setCategory(categoryData)
      }
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
      
    } catch (error) {
      console.error('Error fetching category data:', error)
      
      // Fallback to mock data
      const mockCategory = {
        id: 1,
        name: 'אלקטרוניקה',
        slug: 'electronics',
        description: 'מוצרי אלקטרוניקה מתקדמים ואיכותיים',
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800'
      }

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
          id: 5,
          name: 'טלפון חכם',
          slug: 'smartphone',
          price: 1299,
          imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
          category: 'אלקטרוניקה',
          inStock: true,
          rating: 4.7,
          reviewCount: 89
        },
        {
          id: 6,
          name: 'מחשב נייד',
          slug: 'laptop',
          price: 2499,
          originalPrice: 2799,
          imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
          category: 'אלקטרוניקה',
          inStock: false,
          rating: 4.3,
          reviewCount: 156
        }
      ]

      setCategory(mockCategory)
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'name':
      default:
        return a.name.localeCompare(b.name, 'he')
    }
  })

  const filteredProducts = sortedProducts.filter(product => {
    if (filterBy === 'sale') {
      return product.originalPrice && product.originalPrice > product.price
    }
    if (filterBy === 'in-stock') {
      return product.inStock
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">קטגוריה לא נמצאה</h1>
          <p className="text-gray-600">הקטגוריה שחיפשת לא קיימת במערכת</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero */}
      <div className="relative h-64 bg-gray-900">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-200 text-lg">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-gray-600">
              {filteredProducts.length} מוצרים נמצאו
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'left 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="all">כל המוצרים</option>
                <option value="sale">במבצע</option>
                <option value="in-stock">במלאי</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'left 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="name">מיון לפי שם</option>
                <option value="price-low">מחיר: נמוך לגבוה</option>
                <option value="price-high">מחיר: גבוה לנמוך</option>
                <option value="rating">דירוג</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
                <JupiterProductCard key={product.id} product={product} storeSlug={storeData.slug} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              לא נמצאו מוצרים
            </h3>
            <p className="text-gray-600">
              נסה לשנות את הפילטרים או חזור מאוחר יותר
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JupiterCategoryPage

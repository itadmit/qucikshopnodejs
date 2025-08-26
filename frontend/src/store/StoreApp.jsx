import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import StoreHeader from './components/StoreHeader'
import StoreFooter from './components/StoreFooter'
import StorePage from './pages/StorePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'

const StoreApp = ({ storeSlug }) => {
  const { i18n } = useTranslation()
  const [storeData, setStoreData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchStoreData()
  }, [storeSlug])

  const checkOwnership = async (storeData) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      let userData = localStorage.getItem('user')
      
      console.log('🔍 Checking ownership...')
      console.log('Token exists:', !!token)
      console.log('User data exists:', !!userData)
      
      if (!token) {
        console.log('❌ No token found - user not logged in')
        console.log('💡 To manage this store, please login at: http://localhost:5173')
        setIsOwner(false)
        return
      }
      
      // If we have token but no user data, try to fetch user info
      if (!userData) {
        console.log('🔄 Token found but no user data, fetching from server...')
        try {
          const response = await fetch('http://localhost:3001/api/dashboard/user-store', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const userStoreData = await response.json()
            if (userStoreData.user) {
              // Save user data to localStorage
              localStorage.setItem('user', JSON.stringify(userStoreData.user))
              userData = JSON.stringify(userStoreData.user)
              console.log('✅ User data fetched and saved:', userStoreData.user)
            }
          } else {
            console.log('❌ Failed to fetch user data from server - token might be invalid')
            // If we get 403, the token is probably invalid, so clear it
            if (response.status === 403) {
              console.log('🗑️ Clearing invalid token')
              localStorage.removeItem('token')
              localStorage.removeItem('authToken')
              localStorage.removeItem('user')
            }
            setIsOwner(false)
            return
          }
        } catch (fetchError) {
          console.error('Error fetching user data:', fetchError)
          setIsOwner(false)
          return
        }
      }
      
      if (!userData) {
        console.log('❌ Still no user data available')
        setIsOwner(false)
        return
      }
      
      const user = JSON.parse(userData)
      console.log('👤 Current user:', user)
      console.log('🏪 Store owner:', storeData.owner)
      
      // Check if the current user is the store owner
      if (user.id && storeData.owner && user.id === storeData.owner.id) {
        setIsOwner(true)
        console.log('🔑 Store owner detected! User ID:', user.id, 'Owner ID:', storeData.owner.id)
      } else {
        setIsOwner(false)
        console.log('❌ Not store owner. User ID:', user.id, 'Owner ID:', storeData.owner?.id)
      }
    } catch (error) {
      console.error('Error checking ownership:', error)
      setIsOwner(false)
    }
  }

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch store data from API
      const response = await fetch(`http://localhost:3001/api/stores/${storeSlug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('החנות לא נמצאה')
        } else {
          setError('שגיאה בטעינת החנות')
        }
        return
      }
      
      const data = await response.json()
      setStoreData(data)
      
      // Check if current user is the store owner
      await checkOwnership(data)
      
      // Update document title and meta
      document.title = data.name || 'החנות שלי'
      if (data.description) {
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
          metaDescription.content = data.description
        } else {
          const meta = document.createElement('meta')
          meta.name = 'description'
          meta.content = data.description
          document.head.appendChild(meta)
        }
      }
      
      // Set favicon if available
      if (data.faviconUrl) {
        let favicon = document.querySelector('link[rel="icon"]')
        if (!favicon) {
          favicon = document.createElement('link')
          favicon.rel = 'icon'
          document.head.appendChild(favicon)
        }
        favicon.href = data.faviconUrl
      }
      
    } catch (error) {
      console.error('Error fetching store data:', error)
      setError('שגיאה בחיבור לשרת')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">טוען את החנות...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-red-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">
            {error === 'החנות לא נמצאה' 
              ? 'החנות שחיפשת לא קיימת או לא פעילה כרגע'
              : 'אנא נסה שוב מאוחר יותר או צור קשר עם התמיכה'
            }
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    )
  }

  // Apply store template (currently only Jupiter)
  const templateClass = `store-template-${storeData.templateName || 'jupiter'}`

  return (
    <div className={`min-h-screen ${templateClass}`}>
      <Router>
        <StoreHeader storeData={storeData} isOwner={isOwner} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<StorePage storeData={storeData} />} />
            <Route path="/categories/:slug" element={<CategoryPage storeData={storeData} />} />
            <Route path="/products/:slug" element={<ProductPage storeData={storeData} />} />
            <Route path="/cart" element={<CartPage storeData={storeData} />} />
            <Route path="/checkout" element={<CheckoutPage storeData={storeData} />} />
            {/* Add more routes as needed */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">דף לא נמצא</h1>
                  <p className="text-gray-600 mb-6">הדף שחיפשת לא קיים</p>
                  <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">
                    חזור לעמוד הבית
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
        <StoreFooter storeData={storeData} />
      </Router>
    </div>
  )
}

export default StoreApp

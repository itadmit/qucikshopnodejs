import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const JupiterFooter = ({ storeData }) => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  if (!storeData) return null

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {storeData.logoUrl ? (
                <img 
                  src={storeData.logoUrl} 
                  alt={storeData.name}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {storeData.name?.charAt(0) || 'ח'}
                  </span>
                </div>
              )}
              <span className="text-lg font-bold">
                {storeData.name}
              </span>
            </div>
            
            {storeData.description && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {storeData.description}
              </p>
            )}
            
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <i className="ri-whatsapp-line text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <i className="ri-twitter-line text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.categories')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">שירות לקוחות</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/support" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  תמיכה
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  משלוחים
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  החזרות
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  שאלות נפוצות
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('nav.contact')}</h3>
            <div className="space-y-3">
              {storeData.phone && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <i className="ri-phone-line text-primary-400"></i>
                  <span className="text-gray-300 text-sm">{storeData.phone}</span>
                </div>
              )}
              {storeData.email && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <i className="ri-mail-line text-primary-400"></i>
                  <span className="text-gray-300 text-sm">{storeData.email}</span>
                </div>
              )}
              {storeData.address && (
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <i className="ri-map-pin-line text-primary-400 mt-1"></i>
                  <span className="text-gray-300 text-sm leading-relaxed">
                    {storeData.address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} {storeData.name}. כל הזכויות שמורות.
            </div>
            
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                מדיניות פרטיות
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                תנאי שימוש
              </Link>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-gray-400 text-sm">מופעל על ידי</span>
                <span className="text-primary-400 font-medium text-sm">QuickShop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default JupiterFooter

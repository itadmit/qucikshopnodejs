import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const JupiterCategoryCard = ({ category, index = 0 }) => {
  const { t } = useTranslation()

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group modern-card bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transform hover:-translate-y-2 transition-all duration-300"
      style={{animationDelay: `${index * 100}ms`}}
    >
      <div className="relative overflow-hidden">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
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
  )
}

export default JupiterCategoryCard

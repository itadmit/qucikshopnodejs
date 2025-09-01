// Jupiter Template Export
import JupiterHomePage from './pages/JupiterHomePage.jsx';
import JupiterCategoryPage from './pages/JupiterCategoryPage.jsx';
import JupiterProductPage from './pages/JupiterProductPage.jsx';
import JupiterCollectionsPage from './pages/JupiterCollectionsPage.jsx';
import JupiterProductsPage from './pages/JupiterProductsPage.jsx';
import JupiterHeader from './components/JupiterHeader.jsx';
import JupiterFooter from './components/JupiterFooter.jsx';
import JupiterCategoryCard from './components/JupiterCategoryCard.jsx';
import JupiterProductCard from './components/JupiterProductCard.jsx';

// Import styles
import './styles/jupiter.css';

// Import config and translations
import config from './config/jupiter-config.json';
import heTranslations from './locales/he.json';
import enTranslations from './locales/en.json';

const JupiterTemplate = {
  name: 'jupiter',
  config,
  
  // Pages
  pages: {
    HomePage: JupiterHomePage,
    CategoryPage: JupiterCategoryPage,
    ProductPage: JupiterProductPage,
    CollectionsPage: JupiterCollectionsPage,
    ProductsPage: JupiterProductsPage
  },
  
  // Components
  components: {
    Header: JupiterHeader,
    Footer: JupiterFooter,
    CategoryCard: JupiterCategoryCard,
    ProductCard: JupiterProductCard
  },
  
  // Translations
  translations: {
    he: heTranslations,
    en: enTranslations
  },
  
  // Template-specific utilities
  utils: {
    // יכול להכיל פונקציות עזר ספציפיות לתבנית
  }
};

export default JupiterTemplate;

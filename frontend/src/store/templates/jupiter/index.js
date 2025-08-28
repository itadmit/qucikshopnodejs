// Jupiter Template Export
import JupiterHomePage from './pages/JupiterHomePage';
import JupiterCategoryPage from './pages/JupiterCategoryPage';
import JupiterProductPage from './pages/JupiterProductPage';
import JupiterHeader from './components/JupiterHeader';
import JupiterFooter from './components/JupiterFooter';
import JupiterCategoryCard from './components/JupiterCategoryCard';
import JupiterProductCard from './components/JupiterProductCard';

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
    ProductPage: JupiterProductPage
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

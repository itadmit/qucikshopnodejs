/**
 * 🎨 QuickShop Site Builder - Section Renderer
 * מעבד הסקשנים החדש בהשראת שופיפיי
 */

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Star, 
  MessageSquare, 
  Play,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  Settings,
  Search,
  User,
  Menu,
  Facebook,
  Instagram,
  CreditCard
} from 'lucide-react';

const SectionRenderer = ({ 
  section, 
  sectionSchema, 
  isPreviewMode = false, 
  previewMode = 'desktop',
  onUpdateSection 
}) => {
  const [menuData, setMenuData] = useState({});
  const [isLoadingMenus, setIsLoadingMenus] = useState(true); // Always start with loading for headers
  
  // Load menu data for header sections
  useEffect(() => {
    console.log('🎯 SectionRenderer useEffect:', { sectionType: section.type, isLoadingMenus });
    if (section.type === 'header') {
      console.log('📡 Starting to load menu data...');
      loadMenuData();
    } else {
      // For non-header sections, don't show loading
      setIsLoadingMenus(false);
    }
  }, [section.type, section.settings]);

  const loadMenuData = async () => {
    try {
      console.log('🔄 Setting isLoadingMenus to true');
      setIsLoadingMenus(true);
      const storeSlug = localStorage.getItem('currentStoreSlug') || 'yogevstore';
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Load menus that are referenced in settings
      const menuPromises = [];
      const menuHandles = [];
      
      if (section.settings?.main_menu) {
        menuHandles.push(section.settings.main_menu);
      }
      if (section.settings?.secondary_menu) {
        menuHandles.push(section.settings.secondary_menu);
      }
      if (section.settings?.mobile_menu) {
        menuHandles.push(section.settings.mobile_menu);
      }
      
      for (const handle of menuHandles) {
        menuPromises.push(
          fetch(`${baseUrl}/api/menus/${storeSlug}/${handle}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => ({ handle, data }))
        );
      }
      
      const results = await Promise.all(menuPromises);
      const newMenuData = {};
      
      results.forEach(result => {
        if (result.data) {
          newMenuData[result.handle] = result.data;
        }
      });
      
      setMenuData(newMenuData);
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      console.log('✅ Setting isLoadingMenus to false');
      setIsLoadingMenus(false);
    }
  };
  
  // Get setting value with fallback to default
  const getSetting = (settingId, fallback = '') => {
    const setting = sectionSchema?.settings?.find(s => s.id === settingId);
    return section.settings?.[settingId] ?? setting?.default ?? fallback;
  };

  // Get block settings
  const getBlockSetting = (block, settingId, fallback = '') => {
    const blockSchema = sectionSchema?.blocks?.find(b => b.type === block.type);
    const setting = blockSchema?.settings?.find(s => s.id === settingId);
    return block.settings?.[settingId] ?? setting?.default ?? fallback;
  };

  // Render different section types
  const renderSectionContent = () => {
    switch (section.type) {
      case 'header':
        return renderHeaderSection();
      case 'announcement':
        return renderAnnouncementSection();
      case 'hero':
        return renderHeroSection();
      case 'categories':
        return renderCategoriesSection();
      case 'featured_products':
        return renderFeaturedProductsSection();
      case 'newsletter':
        return renderNewsletterSection();
      case 'footer':
        return renderFooterSection();
      // סקשנים חדשים
      case 'testimonials':
        return renderTestimonialsSection();
      case 'faq':
        return renderFaqSection();
      case 'features':
        return renderFeaturesSection();
      case 'gallery':
        return renderGallerySection();
      case 'video':
        return renderVideoSection();
      case 'contact_form':
        return renderContactFormSection();
      case 'map':
        return renderMapSection();
      case 'blog_posts':
        return renderBlogPostsSection();
      case 'countdown':
        return renderCountdownSection();
      case 'social_proof':
        return renderSocialProofSection();
      default:
        return renderDefaultSection();
    }
  };

  // 📢 Announcement Section
  const renderAnnouncementSection = () => {
    const message = getSetting('message');
    const link = getSetting('link');
    const backgroundColor = getSetting('background_color');
    const textColor = getSetting('text_color');
    const textSize = getSetting('text_size');
    
    const content = (
      <div 
        className={`py-3 px-6 text-center ${textSize} font-medium`}
        style={{ backgroundColor, color: textColor }}
      >
        {message}
      </div>
    );

    return link ? (
      <a href={link} className="block hover:opacity-90 transition-opacity">
        {content}
      </a>
    ) : content;
  };

  // 🎯 Hero Section
  const renderHeroSection = () => {
    const subtitle = getSetting('subtitle');
    const title = getSetting('title');
    const description = getSetting('description');
    const mediaType = getSetting('media_type', 'image');
    const backgroundImage = getSetting('background_image');
    const backgroundVideo = getSetting('background_video');
    const backgroundColor = getSetting('background_color');
    const textAlignment = getSetting('text_alignment');
    const layout = getSetting('layout');
    const height = getSetting('height');
    const showPrimaryButton = getSetting('show_primary_button', true);
    const buttonPrimaryText = getSetting('button_primary_text');
    const buttonPrimaryLink = getSetting('button_primary_link');
    const showSecondaryButton = getSetting('show_secondary_button', false);
    const buttonSecondaryText = getSetting('button_secondary_text');
    const buttonSecondaryLink = getSetting('button_secondary_link');
    const usePrimaryColor = getSetting('use_primary_color', true);
    const useSecondaryColor = getSetting('use_secondary_color', true);

    const heightClasses = {
      small: 'min-h-96',
      medium: 'min-h-[500px]',
      large: 'min-h-[600px]',
      full: 'min-h-screen'
    };

    const textAlignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    return (
      <div 
        className={`relative ${heightClasses[height] || heightClasses.large} flex items-center justify-center overflow-hidden`}
        style={{
          backgroundImage: mediaType === 'image' && backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: mediaType === 'color' || (!backgroundImage && !backgroundVideo) ? backgroundColor : undefined,
        }}
      >
        {/* Background Video */}
        {mediaType === 'video' && backgroundVideo && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}
        
        {/* Overlay */}
        {(mediaType === 'image' && backgroundImage) || (mediaType === 'video' && backgroundVideo) ? (
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        ) : null}
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          {layout === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={textAlignClasses[textAlignment] || textAlignClasses.right}>
                {renderHeroContent()}
              </div>
              <div className="hidden lg:block">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-24 h-24 text-gray-400" />
                </div>
              </div>
            </div>
          ) : (
            <div className={`max-w-4xl mx-auto ${textAlignClasses[textAlignment] || textAlignClasses.center}`}>
              {renderHeroContent()}
            </div>
          )}
        </div>
      </div>
    );

    function renderHeroContent() {
      return (
        <>
          {subtitle && (
            <p className={`font-semibold mb-2 ${usePrimaryColor ? 'text-primary' : 'text-blue-600'}`}>
              {subtitle}
            </p>
          )}
          {title && (
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-xl mb-8 text-gray-600">
              {description}
            </p>
          )}
          
          {/* CTA Buttons */}
          {(showPrimaryButton || showSecondaryButton) && (
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {showPrimaryButton && buttonPrimaryText && (
                <a 
                  href={buttonPrimaryLink || '#'}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    usePrimaryColor 
                      ? 'btn-primary' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {buttonPrimaryText}
                </a>
              )}
              {showSecondaryButton && buttonSecondaryText && (
                <a 
                  href={buttonSecondaryLink || '#'}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    useSecondaryColor 
                      ? 'btn-outline-primary border-2' 
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {buttonSecondaryText}
                </a>
              )}
            </div>
          )}


        </>
      );
    }
  };

  // 📂 Categories Section
  const renderCategoriesSection = () => {
    const subtitle = getSetting('subtitle');
    const title = getSetting('title');
    const description = getSetting('description');
    const backgroundColor = getSetting('background_color');
    const columnsDesktop = getSetting('columns_desktop');
    const columnsMobile = getSetting('columns_mobile');
    const showProductCount = getSetting('show_product_count');

    const gridClasses = {
      desktop: {
        '2': 'lg:grid-cols-2',
        '3': 'lg:grid-cols-3',
        '4': 'lg:grid-cols-4',
        '5': 'lg:grid-cols-5'
      },
      mobile: {
        '1': 'grid-cols-1',
        '2': 'grid-cols-2'
      }
    };

    return (
      <div className="py-16 px-6" style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            {subtitle && (
              <p className="text-blue-600 font-semibold mb-2">{subtitle}</p>
            )}
            {title && <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>}
            {description && (
              <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
            )}
          </div>
          
          <div className={`grid ${gridClasses.mobile[columnsMobile] || 'grid-cols-2'} ${gridClasses.desktop[columnsDesktop] || 'lg:grid-cols-4'} gap-6`}>
            {section.blocks && section.blocks.length > 0 ? (
              section.blocks.map((block, index) => {
                if (block.type === 'category') {
                  const categoryTitle = getBlockSetting(block, 'title');
                  const image = getBlockSetting(block, 'image');
                  const link = getBlockSetting(block, 'link');
                  
                  const content = (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        {image ? (
                          <img src={image} alt={categoryTitle} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-gray-900">{categoryTitle}</h3>
                        {showProductCount && (
                          <p className="text-sm text-gray-500 mt-1">10 מוצרים</p>
                        )}
                      </div>
                    </div>
                  );

                  return link ? (
                    <a key={index} href={link} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={index}>
                      {content}
                    </div>
                  );
                }
                return null;
              })
            ) : (
              // Default placeholder categories
              [1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900">קטגוריה {item}</h3>
                    {showProductCount && (
                      <p className="text-sm text-gray-500 mt-1">10 מוצרים</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // 🛍️ Featured Products Section
  const renderFeaturedProductsSection = () => {
    const subtitle = getSetting('subtitle');
    const title = getSetting('title');
    const description = getSetting('description');
    const backgroundColor = getSetting('background_color');
    const columnsDesktop = getSetting('columns_desktop');
    const columnsMobile = getSetting('columns_mobile');
    const showViewAll = getSetting('show_view_all');
    const viewAllText = getSetting('view_all_text');
    const viewAllLink = getSetting('view_all_link');
    const productsToShow = getSetting('products_to_show');

    const gridClasses = {
      desktop: {
        '2': 'lg:grid-cols-2',
        '3': 'lg:grid-cols-3',
        '4': 'lg:grid-cols-4',
        '5': 'lg:grid-cols-5'
      },
      mobile: {
        '1': 'grid-cols-1',
        '2': 'grid-cols-2'
      }
    };

    return (
      <div className="py-16 px-6" style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            {subtitle && (
              <p className="text-blue-600 font-semibold mb-2">{subtitle}</p>
            )}
            {title && <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>}
            {description && (
              <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
            )}
          </div>
          
          <div className={`grid ${gridClasses.mobile[columnsMobile] || 'grid-cols-2'} ${gridClasses.desktop[columnsDesktop] || 'lg:grid-cols-4'} gap-6 mb-8`}>
            {Array.from({ length: productsToShow || 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">מוצר {index + 1}</h3>
                  <p className="text-sm text-gray-600 mb-3">תיאור קצר של המוצר</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">₪{99 + index * 10}</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                      הוסף לעגלה
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showViewAll && viewAllText && (
            <div className="text-center">
              <a 
                href={viewAllLink || '#'}
                className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {viewAllText}
                <ExternalLink className="w-4 h-4 mr-2" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 📧 Newsletter Section
  const renderNewsletterSection = () => {
    const title = getSetting('title');
    const description = getSetting('description');
    const placeholder = getSetting('placeholder');
    const buttonText = getSetting('button_text');
    const backgroundColor = getSetting('background_color');
    const textColor = getSetting('text_color');
    const layout = getSetting('layout');

    return (
      <div 
        className="py-16 px-6"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
          {description && <p className="text-lg mb-8 opacity-90">{description}</p>}
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
            />
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Header Section
  const renderHeaderSection = () => {
    // Get basic settings even during loading to maintain layout consistency
    const headerDesign = getSetting('header_design', 'logo-center-menu-left');
    const container = getSetting('container', 'container-fluid');
    const headerSticky = getSetting('header_sticky', true);
    const transparentOnTop = getSetting('transparent_on_top', false);
    const logoText = getSetting('logo_text', 'החנות שלי');
    
    // Determine container class
    const containerClass = container === 'w-full' ? 'w-full px-6' : 
                          container === 'container' ? 'container mx-auto px-6' : 
                          'max-w-7xl mx-auto px-6';

    // Determine header background (transparent or solid)
    const headerBg = transparentOnTop ? 'bg-transparent' : 'bg-white';
    const headerClasses = `${headerSticky ? 'sticky top-0 z-50' : ''} ${headerBg} border-b border-gray-200 transition-all duration-300`;

    // Show skeleton for headers while loading
    const shouldShowSkeleton = section.type === 'header' && isLoadingMenus;
    
    console.log('🔄 Header loading state:', { 
      isLoadingMenus, 
      shouldShowSkeleton, 
      sectionType: section.type
    });
    
    if (shouldShowSkeleton) {
      console.log('💀 Showing header skeleton!');
      return (
        <header className={headerClasses}>
          <div className={containerClass}>
            {/* Skeleton layout based on header design */}
            {headerDesign === 'logo-center-menu-left' && (
              <div className="flex items-center justify-between h-16">
                {/* Left: Menu skeleton */}
                <div className="flex items-center space-x-6 rtl:space-x-reverse">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Center: Logo skeleton */}
                <div className="flex items-center">
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Right: Icons skeleton */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {/* Search icon */}
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  {/* Wishlist icon */}
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  {/* Cart with number */}
                  <div className="relative">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  {/* Currency */}
                  <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
                  {/* Country */}
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            )}
            
            {headerDesign === 'logo-left-menu-center' && (
              <div className="flex items-center h-16">
                {/* Left: Logo skeleton */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Center: Menu skeleton - use flex-1 to center properly */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Right: Icons skeleton */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            )}
            
            {/* Default layout for other designs */}
            {!['logo-center-menu-left', 'logo-left-menu-center'].includes(headerDesign) && (
              <div className="flex items-center h-16">
                {/* Logo area skeleton */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Menu area skeleton - centered with flex-1 */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Right side icons skeleton */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </header>
      );
    }

    // Get additional header settings
    const logo = getSetting('logo');
    const logoMobile = getSetting('logo_mobile');
    const logoTransparent = getSetting('logo_transparent');
    const logoMaxWidth = getSetting('logo_max_width', 145);
    const stickyLogoMaxWidth = getSetting('sticky_logo_max_width', 145);
    const mobileLogoMaxWidth = getSetting('mobile_logo_max_width', 110);
    const uppercaseParentLevel = getSetting('uppercase_parent_level', true);
    const search = getSetting('search', 'hide');
    const showAccountIcon = getSetting('show_account_icon', true);
    const showCartIcon = getSetting('show_cart_icon', true);
    const showWishlistIcon = getSetting('show_wishlist_icon', true);
    const showCurrencySwitcher = getSetting('show_currency_switcher', true);
    const showCountrySelector = getSetting('show_country_selector', false);
    const showLanguageSwitcher = getSetting('show_language_switcher', true);

    return (
      <header className={headerClasses}>
        <div className={`${containerClass} py-4`}>
          {renderHeaderLayout()}
        </div>
      </header>
    );

    // Render different header layouts based on design
    function renderHeaderLayout() {
      switch (headerDesign) {
        case 'logo-center-menu-left':
          return renderLogoCenterMenuLeft();
        case 'both-center':
          return renderBothCenter();
        case 'logo-left-menu-center':
          return renderLogoLeftMenuCenter();
        case 'logo-center__2l':
          return renderLogoCenterTwoLines();
        case 'logo-left__2l':
          return renderLogoLeftTwoLines();
        default:
          return renderLogoCenterMenuLeft();
      }
    }

    // Logo Center, Menu Left layout
    function renderLogoCenterMenuLeft() {
      return (
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {renderMenuItems()}
          </nav>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center md:flex-none">
            {renderLogo()}
          </div>

          {/* Right: Icons */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {renderHeaderIcons()}
          </div>
        </div>
      );
    }

    // Logo Left, Menu Center layout
    function renderLogoLeftMenuCenter() {
      return (
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            {renderLogo()}
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {renderMenuItems()}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {renderHeaderIcons()}
          </div>
        </div>
      );
    }

    // Both Center layout (logo and menu centered)
    function renderBothCenter() {
      return (
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            {renderLogo()}
          </div>
          
          <div className="flex items-center justify-between w-full">
            {/* Left: Navigation */}
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              {renderMenuItems()}
            </nav>

            {/* Right: Icons */}
            <div className="flex items-center space-x-4 space-x-reverse">
              {renderHeaderIcons()}
            </div>
          </div>
        </div>
      );
    }

    // Two lines layouts
    function renderLogoCenterTwoLines() {
      return (
        <div className="space-y-4">
          {/* First line: Logo centered */}
          <div className="flex justify-center">
            {renderLogo()}
          </div>
          
          {/* Second line: Menu and icons */}
          <div className="flex items-center justify-between">
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse mx-auto">
              {renderMenuItems()}
            </nav>
            <div className="flex items-center space-x-4 space-x-reverse">
              {renderHeaderIcons()}
            </div>
          </div>
        </div>
      );
    }

    function renderLogoLeftTwoLines() {
      return (
        <div className="space-y-4">
          {/* First line: Logo left, icons right */}
          <div className="flex items-center justify-between">
            {renderLogo()}
            <div className="flex items-center space-x-4 space-x-reverse">
              {renderHeaderIcons()}
            </div>
          </div>
          
          {/* Second line: Menu centered */}
          <div className="flex justify-center">
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              {renderMenuItems()}
            </nav>
          </div>
        </div>
      );
    }

    // Render logo with responsive sizing
    function renderLogo() {
      const currentLogo = transparentOnTop && logoTransparent ? logoTransparent : logo;
      
      return (
        <div className="flex items-center">
          {currentLogo ? (
            <img 
              src={currentLogo} 
              alt={logoText} 
              className="h-auto max-h-12 hidden md:block"
              style={{ width: `${logoMaxWidth}px` }}
            />
          ) : (
            <div className="text-xl font-bold text-gray-900 hidden md:block">
              {logoText}
            </div>
          )}
          
          {/* Mobile logo */}
          {(logoMobile || currentLogo) ? (
            <img 
              src={logoMobile || currentLogo} 
              alt={logoText} 
              className="h-auto max-h-10 md:hidden"
              style={{ width: `${mobileLogoMaxWidth}px` }}
            />
          ) : (
            <div className="text-lg font-bold text-gray-900 md:hidden">
              {logoText}
            </div>
          )}
        </div>
      );
    }

    // Render menu items
    function renderMenuItems() {
      const mainMenuHandle = getSetting('main_menu');
      const menu = menuData[mainMenuHandle];
      
      if (!menu || !menu.items) {
        // Fallback to blocks if no menu is selected
        return section.blocks && section.blocks.map((block, index) => {
          if (block.type === 'menu_item') {
            const title = getBlockSetting(block, 'title');
            const link = getBlockSetting(block, 'link');
            const openNewTab = getBlockSetting(block, 'open_new_tab');
            
            return (
              <a
                key={index}
                href={link || '#'}
                target={openNewTab ? '_blank' : '_self'}
                rel={openNewTab ? 'noopener noreferrer' : undefined}
                className={`hover:text-blue-600 transition-colors ${
                  uppercaseParentLevel ? 'uppercase tracking-wide text-sm' : ''
                }`}
              >
                {title}
              </a>
            );
          }
          return null;
        });
      }

      // Render menu items from API
      return menu.items.map((item, index) => (
        <a
          key={item.id || index}
          href={item.url || '#'}
          target={item.target || '_self'}
          rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
          className={`hover:text-blue-600 transition-colors ${
            uppercaseParentLevel ? 'uppercase tracking-wide text-sm' : ''
          }`}
        >
          {item.title}
        </a>
      ));
    }

    // Render header icons
    function renderHeaderIcons() {
      return (
        <>
          {/* Search */}
          {search === 'show_icon' && (
            <button className="p-2 hover:text-blue-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}
          {search === 'show_full' && (
            <div className="hidden lg:flex items-center">
              <input
                type="search"
                placeholder="חיפוש..."
                className="px-3 py-1 border border-gray-300 rounded-md text-sm w-48"
              />
            </div>
          )}

          {/* Account */}
          {showAccountIcon && (
            <button className="p-2 hover:text-blue-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
          )}

          {/* Wishlist */}
          {showWishlistIcon && (
            <button className="p-2 hover:text-blue-600 transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Cart */}
          {showCartIcon && (
            <button className="p-2 hover:text-blue-600 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </button>
          )}

          {/* Language Switcher */}
          {showLanguageSwitcher && (
            <select className="text-sm border-0 bg-transparent cursor-pointer">
              <option value="he">עברית</option>
              <option value="en">English</option>
            </select>
          )}

          {/* Currency Switcher */}
          {showCurrencySwitcher && (
            <select className="text-sm border-0 bg-transparent cursor-pointer">
              <option value="ILS">₪ ILS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          )}

          {/* Country Selector */}
          {showCountrySelector && (
            <select className="text-sm border-0 bg-transparent cursor-pointer">
              <option value="IL">🇮🇱 ישראל</option>
              <option value="US">🇺🇸 USA</option>
            </select>
          )}
          
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:text-blue-600 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </>
      );
    }
  };

  // Footer Section
  const renderFooterSection = () => {
    // Show skeleton while loading (footer doesn't usually load menus, but for consistency)
    if (isLoadingMenus && section.type === 'footer') {
      return (
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse">
              {/* Footer columns skeleton */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-5 bg-gray-700 rounded w-2/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Bottom bar skeleton */}
            <div className="border-t border-gray-700 mt-8 pt-8 flex justify-between items-center">
              <div className="h-4 bg-gray-700 rounded w-48"></div>
              <div className="flex space-x-4 rtl:space-x-reverse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </footer>
      );
    }

    const storeName = getSetting('store_name');
    const description = getSetting('description');
    const phone = getSetting('phone');
    const email = getSetting('email');
    const address = getSetting('address');
    const facebookUrl = getSetting('facebook_url');
    const instagramUrl = getSetting('instagram_url');
    const whatsappUrl = getSetting('whatsapp_url');
    const backgroundColor = getSetting('background_color');
    const textColor = getSetting('text_color');
    const showNewsletter = getSetting('show_newsletter');
    const showPaymentIcons = getSetting('show_payment_icons');

    // Group blocks by columns
    const columns = [];
    let currentColumn = null;
    
    section.blocks?.forEach(block => {
      if (block.type === 'footer_column') {
        currentColumn = {
          title: getBlockSetting(block, 'title'),
          links: []
        };
        columns.push(currentColumn);
      } else if (block.type === 'footer_link' && currentColumn) {
        currentColumn.links.push({
          title: getBlockSetting(block, 'title'),
          link: getBlockSetting(block, 'link')
        });
      }
    });

    return (
      <footer 
        className="py-16 px-6"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Store Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                {storeName}
              </h3>
              {description && (
                <p className="text-sm opacity-80 mb-4" style={{ color: textColor }}>
                  {description}
                </p>
              )}
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                {phone && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-4 h-4" />
                    <span>{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Mail className="w-4 h-4" />
                    <span>{email}</span>
                  </div>
                )}
                {address && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4" />
                    <span>{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Columns */}
            {columns.map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4" style={{ color: textColor }}>
                  {column.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href={link.link || '#'}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                        style={{ color: textColor }}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            {showNewsletter && (
              <div>
                <h4 className="font-semibold mb-4" style={{ color: textColor }}>
                  הירשמו לניוזלטר
                </h4>
                <p className="text-sm opacity-80 mb-4" style={{ color: textColor }}>
                  קבלו עדכונים על מוצרים חדשים ומבצעים
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="כתובת אימייל"
                    className="flex-1 px-3 py-2 rounded-r-lg border-0 text-gray-900"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-l-lg hover:bg-blue-700 transition-colors">
                    הירשמו
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-opacity-20 pt-8 flex flex-col md:flex-row justify-between items-center">
            {/* Social Media */}
            <div className="flex items-center space-x-4 space-x-reverse mb-4 md:mb-0">
              {facebookUrl && (
                <a href={facebookUrl} className="hover:opacity-75 transition-opacity">
                  <Facebook className="w-5 h-5" style={{ color: textColor }} />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} className="hover:opacity-75 transition-opacity">
                  <Instagram className="w-5 h-5" style={{ color: textColor }} />
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} className="hover:opacity-75 transition-opacity">
                  <Phone className="w-5 h-5" style={{ color: textColor }} />
                </a>
              )}
            </div>

            {/* Payment Icons */}
            {showPaymentIcons && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm opacity-80 ml-2">אמצעי תשלום:</span>
                <CreditCard className="w-6 h-6 opacity-60" style={{ color: textColor }} />
                <CreditCard className="w-6 h-6 opacity-60" style={{ color: textColor }} />
                <CreditCard className="w-6 h-6 opacity-60" style={{ color: textColor }} />
              </div>
            )}
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 pt-8 border-t border-opacity-20">
            <p className="text-sm opacity-60" style={{ color: textColor }}>
              © {new Date().getFullYear()} {storeName}. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    );
  };

  // 💬 Testimonials Section
  const renderTestimonialsSection = () => {
    const title = getSetting('title');
    const subtitle = getSetting('subtitle');
    const description = getSetting('description');
    const layoutType = getSetting('layout_type');
    const columnsDesktop = getSetting('columns_desktop');
    const showRatings = getSetting('show_ratings');
    const backgroundColor = getSetting('background_color');
    
    const testimonials = section.blocks || [];
    
    return (
      <div className="py-16 px-6" style={{ backgroundColor }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {subtitle && (
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
          
          {/* Testimonials Grid */}
          <div className={`grid gap-8 ${
            layoutType === 'grid' 
              ? `md:grid-cols-${columnsDesktop} grid-cols-1`
              : 'grid-cols-1 space-y-8'
          }`}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                {showRatings && getBlockSetting(testimonial, 'rating') && (
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < getBlockSetting(testimonial, 'rating') 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                )}
                <blockquote className="text-gray-700 mb-4">
                  "{getBlockSetting(testimonial, 'quote')}"
                </blockquote>
                <div className="flex items-center">
                  {getBlockSetting(testimonial, 'customer_photo') && (
                    <img 
                      src={getBlockSetting(testimonial, 'customer_photo')} 
                      alt={getBlockSetting(testimonial, 'customer_name')}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">
                      {getBlockSetting(testimonial, 'customer_name')}
                    </div>
                    {getBlockSetting(testimonial, 'customer_title') && (
                      <div className="text-sm text-gray-600">
                        {getBlockSetting(testimonial, 'customer_title')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {testimonials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>אין המלצות להצגה</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🗺️ Map Section  
  const renderMapSection = () => {
    const title = getSetting('title');
    const description = getSetting('description');
    const address = getSetting('address');
    const phone = getSetting('phone');
    const email = getSetting('email');
    const hours = getSetting('hours');
    const mapUrl = getSetting('map_url');
    const layoutType = getSetting('layout_type');
    const mapHeight = getSetting('map_height');
    const backgroundColor = getSetting('background_color');
    
    return (
      <div className="py-16 px-6" style={{ backgroundColor }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600">
                {description}
              </p>
            )}
          </div>
          
          {/* Map and Info */}
          <div className={`${layoutType === 'side_by_side' ? 'grid md:grid-cols-2 gap-8' : 'space-y-8'}`}>
            {/* Map */}
            <div className="bg-gray-200 rounded-lg overflow-hidden" style={{ height: `${mapHeight}px` }}>
              {mapUrl ? (
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>הוסף קישור למפה בהגדרות</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Contact Info */}
            {layoutType !== 'map_only' && (
              <div className="space-y-6">
                {address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">כתובת</h3>
                      <p className="text-gray-600 whitespace-pre-line">{address}</p>
                    </div>
                  </div>
                )}
                
                {phone && (
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">טלפון</h3>
                      <p className="text-gray-600">{phone}</p>
                    </div>
                  </div>
                )}
                
                {email && (
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">אימייל</h3>
                      <p className="text-gray-600">{email}</p>
                    </div>
                  </div>
                )}
                
                {hours && (
                  <div className="flex items-start">
                    <Settings className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">שעות פתיחה</h3>
                      <p className="text-gray-600 whitespace-pre-line">{hours}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ❓ FAQ Section
  const renderFaqSection = () => {
    const title = getSetting('title');
    const description = getSetting('description');
    const backgroundColor = getSetting('background_color');
    
    const faqs = section.blocks || [];
    
    return (
      <div className="py-16 px-6" style={{ backgroundColor }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600">
                {description}
              </p>
            )}
          </div>
          
          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg">
                <button className="w-full px-6 py-4 text-right font-semibold text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>{getBlockSetting(faq, 'question')}</span>
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </button>
                <div className="px-6 pb-4 text-gray-700 text-right">
                  {getBlockSetting(faq, 'answer')}
                </div>
              </div>
            ))}
          </div>
          
          {faqs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>אין שאלות להצגה</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ⭐ Features Section
  const renderFeaturesSection = () => {
    const title = getSetting('title');
    const description = getSetting('description');
    const columnsDesktop = getSetting('columns_desktop');
    const backgroundColor = getSetting('background_color');
    
    const features = section.blocks || [];
    
    return (
      <div className="py-16 px-6" style={{ backgroundColor }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
          
          {/* Features Grid */}
          <div className={`grid gap-8 md:grid-cols-${columnsDesktop} grid-cols-1`}>
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {getBlockSetting(feature, 'title')}
                </h3>
                <p className="text-gray-600">
                  {getBlockSetting(feature, 'description')}
                </p>
              </div>
            ))}
          </div>
          
          {features.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>אין תכונות להצגה</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Placeholder functions for remaining sections
  const renderGallerySection = () => renderDefaultSection();
  const renderVideoSection = () => renderDefaultSection();
  const renderContactFormSection = () => renderDefaultSection();
  const renderBlogPostsSection = () => renderDefaultSection();
  const renderCountdownSection = () => renderDefaultSection();
  const renderSocialProofSection = () => renderDefaultSection();

  // Default section renderer
  const renderDefaultSection = () => {
    return (
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Layout className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {sectionSchema?.name || section.type}
          </h3>
          <p className="text-gray-500">
            סקשן זה עדיין לא מוכן לתצוגה
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`section-${section.type} ${section.settings?.hidden ? 'hidden' : ''}`}>
      {renderSectionContent()}
    </div>
  );
};

export default SectionRenderer;

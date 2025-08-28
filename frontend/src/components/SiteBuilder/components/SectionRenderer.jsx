import React from 'react';
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
  Settings
} from 'lucide-react';

// Import product components
import ProductTitle from '../sections/ProductTitle';
import ProductPrice from '../sections/ProductPrice';
import ProductOptions from '../sections/ProductOptions';
import AddToCart from '../sections/AddToCart';
import ProductImages from '../sections/ProductImages';

const SectionRenderer = ({ section, sectionSchema, isPreviewMode, previewMode, onUpdateSection }) => {
  
  // Get setting value with fallback to default
  const getSetting = (settingId) => {
    const setting = sectionSchema?.schema?.settings?.find(s => s.id === settingId);
    return section.settings[settingId] ?? setting?.default ?? '';
  };

  // Render different section types
  const renderSectionContent = () => {
    switch (section.type) {
      case 'hero':
        return renderHeroSection();
      case 'text_with_image':
        return renderTextWithImageSection();
      case 'gallery':
        return renderGallerySection();
      case 'testimonials':
        return renderTestimonialsSection();
      case 'contact_form':
        return renderContactFormSection();
      case 'product_title':
        return <ProductTitle settings={section.settings} />;
      case 'product_price':
        return <ProductPrice settings={section.settings} />;
      case 'product_images':
        return <ProductImages settings={section.settings} />;
      case 'product_options':
        return <ProductOptions settings={section.settings} />;
      case 'add_to_cart':
        return <AddToCart settings={section.settings} />;
      default:
        return renderDefaultSection();
    }
  };

  // Hero Section
  const renderHeroSection = () => {
    const title = getSetting('title');
    const subtitle = getSetting('subtitle');
    const backgroundImage = getSetting('background_image');
    const textColor = getSetting('text_color');
    const alignment = getSetting('alignment');

    return (
      <div 
        className={`relative min-h-96 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white`}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: textColor
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className={`relative z-10 max-w-4xl mx-auto px-6 text-${alignment}`}>
          {title && (
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xl md:text-xl mb-8 opacity-90">
              {subtitle}
            </p>
          )}
          
          {/* Render buttons from blocks */}
          <div className="flex flex-wrap gap-4 justify-center">
            {section.blocks?.map((block, index) => {
              if (block.type === 'button') {
                return (
                  <button
                    key={index}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                      block.settings?.style === 'primary' 
                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                        : block.settings?.style === 'secondary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    {block.settings?.text || 'לחץ כאן'}
                  </button>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };

  // Text with Image Section
  const renderTextWithImageSection = () => {
    const heading = getSetting('heading');
    const content = getSetting('content');
    const image = getSetting('image');
    const layout = getSetting('layout');

    const isImageLeft = layout === 'image_left';
    const isImageTop = layout === 'image_top';

    return (
      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`grid gap-12 items-center ${
            isImageTop 
              ? 'grid-cols-1' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {/* Image */}
            <div className={`${isImageLeft ? 'lg:order-1' : 'lg:order-2'} ${isImageTop ? 'order-1' : ''}`}>
              {image ? (
                <img 
                  src={image} 
                  alt={heading}
                  className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-64 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className={`${isImageLeft ? 'lg:order-2' : 'lg:order-1'} ${isImageTop ? 'order-2' : ''}`}>
              {heading && (
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  {heading}
                </h2>
              )}
              {content && (
                <div 
                  className="text-lg text-gray-600 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Gallery Section
  const renderGallerySection = () => {
    const heading = getSetting('heading');
    const columns = getSetting('columns') || 3;
    const showCaptions = getSetting('show_captions');

    return (
      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {heading && (
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
              {heading}
            </h2>
          )}
          
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`}>
            {section.blocks?.map((block, index) => {
              if (block.type === 'image') {
                return (
                  <div key={index} className="group cursor-pointer">
                    {block.settings?.image ? (
                      <img 
                        src={block.settings.image}
                        alt={block.settings?.caption || ''}
                        className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {showCaptions && block.settings?.caption && (
                      <p className="mt-3 text-center text-gray-600">
                        {block.settings.caption}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })}
            
            {/* Add placeholder images if no blocks */}
            {(!section.blocks || section.blocks.length === 0) && (
              <>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Testimonials Section
  const renderTestimonialsSection = () => {
    const heading = getSetting('heading');
    const layout = getSetting('layout');

    return (
      <div className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {heading && (
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
              {heading}
            </h2>
          )}
          
          <div className={`grid gap-8 ${
            layout === 'carousel' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {section.blocks?.map((block, index) => {
              if (block.type === 'testimonial') {
                const rating = block.settings?.rating || 5;
                return (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                    {/* Rating */}
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    
                    {/* Quote */}
                    {block.settings?.quote && (
                      <blockquote className="text-gray-700 mb-6 italic">
                        "{block.settings.quote}"
                      </blockquote>
                    )}
                    
                    {/* Author */}
                    <div className="flex items-center">
                      {block.settings?.avatar ? (
                        <img 
                          src={block.settings.avatar}
                          alt={block.settings?.author || ''}
                          className="w-12 h-12 rounded-full object-cover ml-4"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full ml-4"></div>
                      )}
                      <div>
                        {block.settings?.author && (
                          <div className="font-semibold text-gray-900">
                            {block.settings.author}
                          </div>
                        )}
                        {block.settings?.position && (
                          <div className="text-sm text-gray-500">
                            {block.settings.position}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
            
            {/* Placeholder testimonials if no blocks */}
            {(!section.blocks || section.blocks.length === 0) && (
              <>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-6 italic">
                      "זהו ציטוט לדוגמה של המלצה מלקוח מרוצה"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full ml-4"></div>
                      <div>
                        <div className="font-semibold text-gray-900">שם הלקוח</div>
                        <div className="text-sm text-gray-500">תפקיד</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Contact Form Section
  const renderContactFormSection = () => {
    const heading = getSetting('heading');
    const description = getSetting('description');
    const submitText = getSetting('submit_text');

    return (
      <div className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          {heading && (
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6">
              {heading}
            </h2>
          )}
          
          {description && (
            <p className="text-lg text-gray-600 text-center mb-12">
              {description}
            </p>
          )}
          
          <form className="space-y-6">
            {section.blocks?.map((block, index) => {
              if (block.type === 'field') {
                const fieldType = block.settings?.type || 'text';
                const label = block.settings?.label;
                const required = block.settings?.required;
                
                return (
                  <div key={index}>
                    {label && (
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                    )}
                    
                    {fieldType === 'textarea' ? (
                      <textarea
                        rows={4}
                        required={required}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={label}
                      />
                    ) : (
                      <input
                        type={fieldType}
                        required={required}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={label}
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}
            
            {/* Default fields if no blocks */}
            {(!section.blocks || section.blocks.length === 0) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שם מלא</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="הכנס את שמך המלא"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">אימייל</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="הכנס את כתובת האימייל שלך"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">הודעה</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="כתב את ההודעה שלך כאן"
                  />
                </div>
              </>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {submitText || 'שלח הודעה'}
            </button>
          </form>
        </div>
      </div>
    );
  };

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
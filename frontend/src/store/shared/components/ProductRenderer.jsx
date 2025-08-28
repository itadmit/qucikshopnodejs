import React from 'react';

// Import product components from site builder
import ProductTitle from '../../../components/SiteBuilder/sections/ProductTitle';
import ProductPrice from '../../../components/SiteBuilder/sections/ProductPrice';
import ProductOptions from '../../../components/SiteBuilder/sections/ProductOptions';
import AddToCart from '../../../components/SiteBuilder/sections/AddToCart';
import ProductImages from '../../../components/SiteBuilder/sections/ProductImages';

const ProductRenderer = ({ pageStructure, product, selectedOptions, onOptionChange, quantity, onQuantityChange, onAddToCart }) => {
  
  const renderSection = (section) => {
    // Merge section settings with product data
    const sectionProps = {
      settings: section.settings,
      product,
      selectedOptions,
      onOptionChange,
      quantity,
      onQuantityChange,
      onAddToCart
    };

    switch (section.type) {
      case 'product_title':
        return <ProductTitle {...sectionProps} />;
      case 'product_price':
        return <ProductPrice {...sectionProps} />;
      case 'product_images':
        return <ProductImages {...sectionProps} />;
      case 'product_options':
        return <ProductOptions {...sectionProps} />;
      case 'add_to_cart':
        return <AddToCart {...sectionProps} />;
      default:
        return null;
    }
  };

  if (!pageStructure || !pageStructure.sections) {
    return null;
  }

  // Split sections into left and right columns
  const leftColumnSections = pageStructure.sections.filter(section => 
    section.type === 'product_images'
  );
  
  const rightColumnSections = pageStructure.sections.filter(section => 
    section.type !== 'product_images'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Column - Images */}
      <div className="space-y-6 order-1 lg:order-1">
        {leftColumnSections.map((section) => (
          <div key={section.id} className="w-full">
            {renderSection(section)}
          </div>
        ))}
      </div>
      
      {/* Right Column - Product Info */}
      <div className="space-y-6 order-2 lg:order-2">
        {rightColumnSections.map((section) => (
          <div key={section.id} className="w-full">
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRenderer; 
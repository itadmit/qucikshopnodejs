/**
 * Product Title Component - Simple version for product pages
 */
import React from 'react';

const ProductTitle = ({ settings, product }) => {
  const showVendor = settings?.show_vendor !== false;
  const titleSize = settings?.title_size || 'text-3xl';
  const titleWeight = settings?.title_weight || 'font-bold';
  const alignment = settings?.alignment || 'text-right';

  return (
    <div className={`${alignment} mb-4`}>
      {showVendor && product?.vendor && (
        <p className="text-sm text-gray-600 mb-2">{product.vendor}</p>
      )}
      <h1 className={`${titleSize} ${titleWeight} text-gray-900`}>
        {product?.title || 'שם המוצר'}
      </h1>
    </div>
  );
};

export default ProductTitle;

/**
 * Product Price Component - Simple version for product pages
 */
import React from 'react';

const ProductPrice = ({ settings, product }) => {
  const showComparePrice = settings?.show_compare_price !== false;
  const showCurrency = settings?.show_currency !== false;
  const priceSize = settings?.price_size || 'text-xl';
  const priceWeight = settings?.price_weight || 'font-bold';
  const showSaleBadge = settings?.show_sale_badge !== false;

  const price = product?.price || 99;
  const comparePrice = product?.compare_at_price;
  const isOnSale = comparePrice && comparePrice > price;

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2 space-x-reverse">
        <span className={`${priceSize} ${priceWeight} text-gray-900`}>
          {showCurrency && '₪'}{price}
        </span>
        {showComparePrice && isOnSale && (
          <span className="text-lg text-gray-500 line-through">
            {showCurrency && '₪'}{comparePrice}
          </span>
        )}
        {showSaleBadge && isOnSale && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
            מבצע
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductPrice;

import React from 'react';
import MediaUploader from '../../components/MediaUploader.jsx';

const ProductMedia = ({ 
  productImages, 
  setProductImages, 
  fileInputRef,
  storeId 
}) => {
  return (
    <div className="space-y-4">
      <MediaUploader
        media={productImages}
        onUpload={(newMediaItems, isReorder = false) => {
          if (isReorder) {
            // Replacing entire array (for reordering)
            setProductImages(newMediaItems);
          } else {
            // Adding new items
            setProductImages(prev => [...prev, ...newMediaItems]);
          }
        }}
        onDelete={(uniqueId) => {
          setProductImages(prev => prev.filter(item => item.uniqueId !== uniqueId));
        }}
        maxFiles={10}
        storeId={storeId}
        folder="products"
      />
      
      {productImages.length > 0 && (
        <div className="text-sm text-gray-600">
          {productImages.length} תמונות נבחרו
        </div>
      )}
    </div>
  );
};

export default ProductMedia;

import React from 'react';
import MediaUploader from '../../components/MediaUploader.jsx';

const ProductMedia = ({ 
  productImages, 
  setProductImages, 
  fileInputRef 
}) => {
  return (
    <div className="space-y-4">
      <MediaUploader
        images={productImages}
        onImagesChange={setProductImages}
        maxImages={10}
        fileInputRef={fileInputRef}
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

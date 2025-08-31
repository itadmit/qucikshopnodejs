/**
 * Product Images Component - Simple version for product pages
 */
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Image } from 'lucide-react';

const ProductImages = ({ settings, product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  const layout = settings?.layout || 'gallery';
  const showThumbnails = settings?.show_thumbnails !== false;
  const imageAspectRatio = settings?.image_aspect_ratio || 'square';
  const zoomEnabled = settings?.zoom_enabled !== false;

  // Transform product media to images format
  let images = [];
  if (product?.media && product.media.length > 0) {
    images = product.media.map(mediaItem => ({
      src: mediaItem.media?.s3Url || mediaItem.s3Url,
      alt: mediaItem.media?.altText || mediaItem.altText || product.name
    }));
  } else if (product?.images && product.images.length > 0) {
    // Handle both string array and object array formats
    images = product.images.map(image => {
      if (typeof image === 'string') {
        return { src: image, alt: product.name };
      }
      return { src: image.src, alt: image.alt || product.name };
    });
  }
  
  // Check if we need to show placeholder
  const showPlaceholder = images.length === 0;

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="mb-6">
      {/* Main Image */}
      <div className={`relative ${aspectRatioClasses[imageAspectRatio]} bg-gray-100 rounded-lg overflow-hidden mb-4`}>
        {showPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-gray-300 mx-auto mb-2" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <p className="text-gray-400 text-sm">אין תמונה</p>
            </div>
          </div>
        ) : (
          <img
            src={images[currentImageIndex]?.src}
            alt={images[currentImageIndex]?.alt || 'תמונת מוצר'}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Navigation Arrows */}
        {!showPlaceholder && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        {!showPlaceholder && zoomEnabled && (
          <button
            onClick={() => setShowZoom(true)}
            className="absolute top-2 left-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        )}

        {/* Image Counter */}
        {!showPlaceholder && images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {!showPlaceholder && showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 space-x-reverse overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === currentImageIndex
                  ? 'border-blue-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt || `תמונה ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {showZoom && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[currentImageIndex]?.src}
              alt={images[currentImageIndex]?.alt || 'תמונת מוצר'}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImages;

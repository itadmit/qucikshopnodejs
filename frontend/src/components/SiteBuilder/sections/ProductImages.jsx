import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const ProductImages = ({ settings = {}, product }) => {
  const {
    layout = 'gallery',
    main_image_ratio = 'square',
    thumbnail_size = 'small',
    show_thumbnails = true,
    thumbnail_position = 'bottom',
    show_zoom = true,
    show_navigation = true,
    border_radius = 'rounded-lg',
    spacing = 'gap-4'
  } = settings;

  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Use product images if available, otherwise fallback to demo data
  const productImages = product?.images?.length > 0 ? 
    product.images.map((url, index) => ({
      id: index + 1,
      url: url,
      alt: `${product.name || 'מוצר'} - תמונה ${index + 1}`
    })) : [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
      alt: 'חולצת יוגב - תמונה ראשית'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop',
      alt: 'חולצת יוגב - צד'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=600&fit=crop',
      alt: 'חולצת יוגב - גב'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop',
      alt: 'חולצת יוגב - פרטים'
    }
  ];

  const getRatioClasses = () => {
    switch (main_image_ratio) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  };

  const getThumbnailSize = () => {
    switch (thumbnail_size) {
      case 'small': return 'w-16 h-16';
      case 'medium': return 'w-20 h-20';
      case 'large': return 'w-24 h-24';
      default: return 'w-16 h-16';
    }
  };

  const handlePrevious = () => {
    setSelectedImage(prev => prev === 0 ? productImages.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setSelectedImage(prev => prev === productImages.length - 1 ? 0 : prev + 1);
  };

  const renderMainImage = () => (
    <div className={`relative ${getRatioClasses()} ${border_radius} overflow-hidden bg-gray-100`}>
      <img
        src={productImages[selectedImage]?.url}
        alt={productImages[selectedImage]?.alt}
        className={`w-full h-full object-cover cursor-pointer ${isZoomed ? 'scale-150' : 'scale-100'} transition-transform duration-300`}
        onClick={() => show_zoom && setIsZoomed(!isZoomed)}
      />
      
      {show_zoom && (
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-4 left-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      )}

      {show_navigation && productImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Image indicators */}
      {productImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 space-x-reverse">
          {productImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedImage ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderThumbnails = () => {
    if (!show_thumbnails || productImages.length <= 1) return null;

    const thumbnailClasses = `${getThumbnailSize()} ${border_radius} overflow-hidden cursor-pointer transition-opacity`;

    return (
      <div className={`flex ${thumbnail_position === 'right' || thumbnail_position === 'left' ? 'flex-col' : 'flex-row'} ${spacing}`}>
        {productImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={`${thumbnailClasses} ${
              index === selectedImage ? 'opacity-100 ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  };

  if (layout === 'carousel') {
    return (
      <div className="space-y-4">
        {renderMainImage()}
        {renderThumbnails()}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 ${spacing}`}>
        {productImages.map((image, index) => (
          <div
            key={image.id}
            className={`${getRatioClasses()} ${border_radius} overflow-hidden cursor-pointer`}
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    );
  }

  // Gallery layout (default)
  const isVertical = thumbnail_position === 'right' || thumbnail_position === 'left';
  const flexDirection = isVertical ? 'flex-row' : 'flex-col';
  const reverseOrder = thumbnail_position === 'top' || thumbnail_position === 'right';

  return (
    <div className={`flex ${flexDirection} ${reverseOrder ? 'flex-row-reverse' : ''} ${spacing}`}>
      <div className={isVertical ? 'flex-1' : 'w-full'}>
        {renderMainImage()}
      </div>
      {renderThumbnails()}
    </div>
  );
};

ProductImages.schema = {
  name: 'תמונות מוצר',
  category: 'product',
  icon: 'Image',
  schema: {
    settings: [
      {
        type: 'header',
        content: 'פריסה'
      },
      {
        type: 'select',
        id: 'layout',
        label: 'סוג פריסה',
        options: [
          { value: 'gallery', label: 'גלריה' },
          { value: 'carousel', label: 'קרוסלה' },
          { value: 'grid', label: 'רשת' }
        ],
        default: 'gallery'
      },
      {
        type: 'select',
        id: 'main_image_ratio',
        label: 'יחס גובה-רוחב תמונה ראשית',
        options: [
          { value: 'square', label: 'מרובע (1:1)' },
          { value: 'portrait', label: 'לאורך (3:4)' },
          { value: 'landscape', label: 'לרוחב (4:3)' }
        ],
        default: 'square'
      },
      {
        type: 'select',
        id: 'spacing',
        label: 'ריווח',
        options: [
          { value: 'gap-2', label: 'קטן' },
          { value: 'gap-4', label: 'בינוני' },
          { value: 'gap-6', label: 'גדול' }
        ],
        default: 'gap-4'
      },
      {
        type: 'header',
        content: 'תמונות ממוזערות'
      },
      {
        type: 'checkbox',
        id: 'show_thumbnails',
        label: 'הצג תמונות ממוזערות',
        default: true
      },
      {
        type: 'select',
        id: 'thumbnail_position',
        label: 'מיקום תמונות ממוזערות',
        options: [
          { value: 'bottom', label: 'למטה' },
          { value: 'top', label: 'למעלה' },
          { value: 'right', label: 'ימין' },
          { value: 'left', label: 'שמאל' }
        ],
        default: 'bottom'
      },
      {
        type: 'select',
        id: 'thumbnail_size',
        label: 'גודל תמונות ממוזערות',
        options: [
          { value: 'small', label: 'קטן' },
          { value: 'medium', label: 'בינוני' },
          { value: 'large', label: 'גדול' }
        ],
        default: 'small'
      },
      {
        type: 'header',
        content: 'תכונות'
      },
      {
        type: 'checkbox',
        id: 'show_zoom',
        label: 'הצג זום',
        default: true
      },
      {
        type: 'checkbox',
        id: 'show_navigation',
        label: 'הצג חצי ניווט',
        default: true
      },
      {
        type: 'select',
        id: 'border_radius',
        label: 'עיגול פינות',
        options: [
          { value: 'rounded-none', label: 'ללא' },
          { value: 'rounded-md', label: 'בינוני' },
          { value: 'rounded-lg', label: 'גדול' },
          { value: 'rounded-xl', label: 'גדול מאוד' }
        ],
        default: 'rounded-lg'
      }
    ]
  }
};

export default ProductImages; 
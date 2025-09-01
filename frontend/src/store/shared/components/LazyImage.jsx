import { useState, useRef, useEffect } from 'react'

/**
 * Lazy loading image component with progressive enhancement
 * Features:
 * - Intersection Observer for lazy loading
 * - Progressive image loading (blur to sharp)
 * - Error handling with fallback
 * - Loading skeleton
 * - WebP support with fallback
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallback = '/images/placeholder.jpg',
  blurDataURL,
  priority = false,
  quality = 75,
  sizes,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(blurDataURL || '')
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
      observerRef.current = observer
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority])

  // Load image when in view
  useEffect(() => {
    if (isInView && src && !hasError) {
      const img = new Image()
      
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
        onLoad?.()
      }
      
      img.onerror = () => {
        setHasError(true)
        setImageSrc(fallback)
        onError?.()
      }
      
      // Check if WebP is supported and use it if available
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      img.src = supportsWebP() ? webpSrc : src
    }
  }, [isInView, src, fallback, onLoad, onError, hasError])

  // Check WebP support
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false
    
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return ''
    
    const sizes = [400, 800, 1200, 1600]
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ')
  }

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      {...props}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 skeleton"></div>
        </div>
      )}

      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {(isInView || priority) && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded 
              ? 'opacity-100 filter-none' 
              : 'opacity-0 filter blur-sm'
          }`}
          srcSet={generateSrcSet(imageSrc)}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg 
              className="w-12 h-12 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm">תמונה לא זמינה</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

export default LazyImage

/**
 * Performance optimization utilities for the e-commerce store
 * Includes caching, debouncing, throttling, and lazy loading helpers
 */

// Cache implementation with TTL (Time To Live)
class Cache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key) {
    return this.get(key) !== null
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instances
export const apiCache = new Cache(5 * 60 * 1000) // 5 minutes for API calls
export const imageCache = new Cache(30 * 60 * 1000) // 30 minutes for images
export const productCache = new Cache(10 * 60 * 1000) // 10 minutes for products

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Memoization helper
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map()
  
  return (...args) => {
    const key = getKey(...args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    return result
  }
}

// Lazy loading helper for components
export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc)
  
  return (props) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  )
}

// Image preloader
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Batch image preloader
export const preloadImages = async (srcs, batchSize = 3) => {
  const results = []
  
  for (let i = 0; i < srcs.length; i += batchSize) {
    const batch = srcs.slice(i, i + batchSize)
    const batchPromises = batch.map(src => 
      preloadImage(src).catch(err => ({ error: err, src }))
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }
  
  return results
}

// API request with caching
export const cachedFetch = async (url, options = {}, ttl = 5 * 60 * 1000) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`
  
  // Check cache first
  const cached = apiCache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Cache successful response
    apiCache.set(cacheKey, data, ttl)
    
    return data
  } catch (error) {
    console.error('Cached fetch error:', error)
    throw error
  }
}

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }

  start(label) {
    this.metrics.set(label, performance.now())
  }

  end(label) {
    const startTime = this.metrics.get(label)
    if (startTime) {
      const duration = performance.now() - startTime
      this.metrics.delete(label)
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`)
      return duration
    }
    return null
  }

  measure(label, fn) {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }

  async measureAsync(label, asyncFn) {
    this.start(label)
    const result = await asyncFn()
    this.end(label)
    return result
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Virtual scrolling helper
export const calculateVisibleItems = (
  containerHeight,
  itemHeight,
  scrollTop,
  totalItems,
  overscan = 5
) => {
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    totalItems - 1
  )

  const start = Math.max(0, visibleStart - overscan)
  const end = Math.min(totalItems - 1, visibleEnd + overscan)

  return { start, end, visibleStart, visibleEnd }
}

// Bundle splitting helper
export const loadChunk = async (chunkName) => {
  try {
    const module = await import(
      /* webpackChunkName: "[request]" */
      `../chunks/${chunkName}`
    )
    return module.default || module
  } catch (error) {
    console.error(`Failed to load chunk: ${chunkName}`, error)
    throw error
  }
}

// Resource hints helper
export const addResourceHint = (href, as, type = 'preload') => {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = type
  link.href = href
  if (as) link.as = as
  
  document.head.appendChild(link)
}

// Preload critical resources
export const preloadCriticalResources = (resources) => {
  resources.forEach(({ href, as, type }) => {
    addResourceHint(href, as, type)
  })
}

// Web Workers helper
export const createWorker = (workerFunction) => {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript'
  })
  
  return new Worker(URL.createObjectURL(blob))
}

// Service Worker registration
export const registerServiceWorker = async (swPath = '/sw.js') => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath)
      console.log('SW registered:', registration)
      return registration
    } catch (error) {
      console.error('SW registration failed:', error)
      throw error
    }
  }
  throw new Error('Service Workers not supported')
}

// Critical CSS inlining helper
export const inlineCriticalCSS = (css) => {
  if (typeof document === 'undefined') return

  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

// Cleanup function for performance optimization
export const cleanup = () => {
  apiCache.cleanup()
  imageCache.cleanup()
  productCache.cleanup()
}

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanup, 10 * 60 * 1000)
}

export default {
  Cache,
  apiCache,
  imageCache,
  productCache,
  debounce,
  throttle,
  memoize,
  lazyLoad,
  preloadImage,
  preloadImages,
  cachedFetch,
  PerformanceMonitor,
  performanceMonitor,
  calculateVisibleItems,
  loadChunk,
  addResourceHint,
  preloadCriticalResources,
  createWorker,
  registerServiceWorker,
  inlineCriticalCSS,
  cleanup
}

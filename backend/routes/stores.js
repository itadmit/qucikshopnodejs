import express from 'express'
import prisma from '../lib/prisma.js'

const router = express.Router()

// Get store by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    const store = await prisma.store.findUnique({
      where: { 
        slug: slug,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    // Return store data without sensitive information
    const storeData = {
      id: store.id,
      name: store.name,
      slug: store.slug,
      domain: store.domain,
      logoUrl: store.logoUrl,
      faviconUrl: store.faviconUrl,
      description: store.description,
      templateName: store.templateName,
      settings: store.settings,
      createdAt: store.createdAt,
      owner: store.user
    }
    
    res.json(storeData)
  } catch (error) {
    console.error('Error fetching store:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get store categories
router.get('/:slug/categories', async (req, res) => {
  try {
    const { slug } = req.params
    
    // First get the store
    const store = await prisma.store.findUnique({
      where: { slug: slug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const categories = await prisma.category.findMany({
      where: {
        storeId: store.id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })
    
    // Transform the data
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount: category._count.products
    }))
    
    res.json(transformedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get category by slug
router.get('/:storeSlug/categories/:categorySlug', async (req, res) => {
  try {
    const { storeSlug, categorySlug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const category = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        storeId: store.id,
        isActive: true
      }
    })
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get products for a category
router.get('/:storeSlug/categories/:categorySlug/products', async (req, res) => {
  try {
    const { storeSlug, categorySlug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    // Get category
    const category = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        storeId: store.id,
        isActive: true
      }
    })
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        status: 'ACTIVE'
      },
      include: {
        media: {
          include: {
            media: true
          },
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            sortOrder: 'asc'
          },
          take: 1
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })
    
    // Transform products data
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.shortDescription || product.description,
      price: parseFloat(product.price),
      originalPrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      imageUrl: product.media[0]?.media?.s3Url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: category.name,
      inStock: product.trackInventory ? product.inventoryQuantity > 0 : true,
      rating: 4.5, // Mock rating for now
      reviewCount: 128 // Mock review count for now
    }))
    
    res.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching category products:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get featured products for store
router.get('/:slug/products/featured', async (req, res) => {
  try {
    const { slug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: slug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        media: {
          include: {
            media: true
          },
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            sortOrder: 'asc'
          },
          take: 1
        }
      },
      orderBy: {
        sortOrder: 'asc'
      },
      take: 8 // Limit to 8 featured products
    })
    
    // Transform products data
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.shortDescription || product.description,
      price: parseFloat(product.price),
      originalPrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      imageUrl: product.media[0]?.media?.s3Url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: product.category?.name || 'כללי',
      inStock: product.trackInventory ? product.inventoryQuantity > 0 : true,
      rating: 4.5, // Mock rating for now
      reviewCount: 128 // Mock review count for now
    }))
    
    res.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get product by slug
router.get('/:storeSlug/products/:productSlug', async (req, res) => {
  try {
    const { storeSlug, productSlug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const product = await prisma.product.findFirst({
      where: {
        slug: productSlug,
        storeId: store.id,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        media: {
          include: {
            media: true
          },
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        variants: true
      }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Transform product data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: parseFloat(product.price),
      originalPrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      sku: product.sku,
      category: product.category?.name || 'כללי',
      inStock: product.trackInventory ? product.inventoryQuantity > 0 : true,
      stockQuantity: product.inventoryQuantity,
      rating: 4.5, // Mock rating for now
      reviewCount: 128, // Mock review count for now
      images: product.media.map(media => media.media.s3Url),
      options: [], // Will be populated from variants if needed
      specifications: product.tags || {}
    }
    
    // If no images, add a default one
    if (transformedProduct.images.length === 0) {
      transformedProduct.images = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600']
    }
    
    res.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

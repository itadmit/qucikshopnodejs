import prisma from '../lib/prisma.js';

export class Store {
  static async create(storeData) {
    const { 
      userId, 
      name, 
      slug, 
      domain = null, 
      description = '', 
      templateName = 'jupiter' 
    } = storeData;
    
    const store = await prisma.store.create({
      data: {
        userId,
        name,
        slug,
        domain,
        description,
        templateName
      }
    });
    
    return store;
  }

  static async findById(storeId) {
    return await prisma.store.findUnique({
      where: { 
        id: storeId
      }
    });
  }

  static async findByUserId(userId) {
    return await prisma.store.findFirst({
      where: { 
        userId,
        isActive: true 
      }
    });
  }

  static async findBySlug(slug) {
    return await prisma.store.findFirst({
      where: { 
        slug,
        isActive: true 
      }
    });
  }

  static async findByDomain(domain) {
    return await prisma.store.findFirst({
      where: { 
        domain,
        isActive: true 
      }
    });
  }

  static async update(storeId, updateData) {
    const allowedFields = ['name', 'description', 'logoUrl', 'faviconUrl', 'settings', 'templateName'];
    const data = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        data[key] = updateData[key];
      }
    });
    
    if (Object.keys(data).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    return await prisma.store.update({
      where: { id: storeId },
      data
    });
  }

  static async getSettings(storeId) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true }
    });
    
    return store?.settings || {};
  }

  static async updateSettings(storeId, settings) {
    return await prisma.store.update({
      where: { id: storeId },
      data: { settings }
    });
  }

  static async isSlugAvailable(slug, excludeStoreId = null) {
    const where = { slug };
    if (excludeStoreId) {
      where.id = { not: excludeStoreId };
    }
    
    const count = await prisma.store.count({ where });
    return count === 0;
  }

  static async isDomainAvailable(domain, excludeStoreId = null) {
    const where = { domain };
    if (excludeStoreId) {
      where.id = { not: excludeStoreId };
    }
    
    const count = await prisma.store.count({ where });
    return count === 0;
  }

  static generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\u0590-\u05FFa-z0-9\s-]/g, '') // Keep Hebrew, English, numbers, spaces, hyphens
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  static async getStoreStats(storeId) {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue
    ] = await Promise.all([
      prisma.product.count({
        where: { storeId, isActive: true }
      }),
      prisma.order.count({
        where: { storeId }
      }),
      prisma.customer.count({
        where: { storeId, isActive: true }
      }),
      prisma.order.aggregate({
        where: { 
          storeId, 
          paymentStatus: 'PAID' 
        },
        _sum: { totalAmount: true }
      })
    ]);
    
    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.totalAmount || 0
    };
  }
}
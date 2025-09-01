import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireActiveSubscription } from '../middleware/unified-auth.js';

const router = express.Router();

/**
 * קבלת כל התבניות הזמינות
 */
router.get('/', async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        version: true,
        isPremium: true,
        thumbnail: true,
        tags: true,
        category: true,
        price: true,
        author: true,
        config: true,
        createdAt: true
      },
      orderBy: [
        { isPremium: 'asc' }, // חינמיות קודם
        { createdAt: 'desc' }
      ]
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * קבלת תבנית ספציפית לפי שם
 */
router.get('/:templateName', async (req, res) => {
  try {
    const { templateName } = req.params;
    
    const template = await prisma.template.findUnique({
      where: {
        name: templateName,
        isActive: true
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * עדכון תבנית לחנות
 */
router.put('/store/:storeId/template', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { templateName, templateId, customizations } = req.body;
    const userId = req.authenticatedUser.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // בדיקה שהתבנית קיימת
    if (templateId) {
      const template = await prisma.template.findUnique({
        where: { id: templateId, isActive: true }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // בדיקה אם התבנית פרימיום ואם המשתמש יכול להשתמש בה
      if (template.isPremium) {
        // TODO: בדיקת מנוי פרימיום
        console.log('Premium template selected, checking subscription...');
      }
    }

    // עדכון החנות
    const updatedStore = await prisma.store.update({
      where: { id: parseInt(storeId) },
      data: {
        templateName: templateName || store.templateName,
        templateId: templateId || store.templateId,
        templateCustomizations: customizations || store.templateCustomizations
      },
      include: {
        template: true
      }
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      store: {
        id: updatedStore.id,
        templateName: updatedStore.templateName,
        templateId: updatedStore.templateId,
        templateCustomizations: updatedStore.templateCustomizations,
        template: updatedStore.template
      }
    });

  } catch (error) {
    console.error('Error updating store template:', error);
    res.status(500).json({ 
      error: 'Failed to update template',
      message: error.message 
    });
  }
});

/**
 * יצירת תבנית חדשה (למפתחים/אדמינים)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      version = '1.0.0',
      isPremium = false,
      files,
      config,
      author,
      thumbnail,
      tags = [],
      category,
      price = 0
    } = req.body;

    // TODO: בדיקת הרשאות אדמין

    // וולידציה בסיסית
    if (!name || !displayName || !files || !config) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, displayName, files, config' 
      });
    }

    // בדיקה שהתבנית לא קיימת
    const existingTemplate = await prisma.template.findUnique({
      where: { name }
    });

    if (existingTemplate) {
      return res.status(400).json({ error: 'Template with this name already exists' });
    }

    // יצירת התבנית
    const template = await prisma.template.create({
      data: {
        name,
        displayName,
        description,
        version,
        isPremium,
        files,
        config,
        author: author || req.authenticatedUser.firstName + ' ' + req.authenticatedUser.lastName,
        thumbnail,
        tags,
        category,
        price: isPremium ? price : 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template
    });

  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ 
      error: 'Failed to create template',
      message: error.message 
    });
  }
});

/**
 * עדכון תבנית קיימת (למפתחים/אדמינים)
 */
router.put('/:templateId', requireAuth, async (req, res) => {
  try {
    const { templateId } = req.params;
    const updateData = req.body;

    // TODO: בדיקת הרשאות אדמין

    const template = await prisma.template.update({
      where: { id: templateId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      template
    });

  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ 
      error: 'Failed to update template',
      message: error.message 
    });
  }
});

/**
 * מחיקת תבנית (למפתחים/אדמינים)
 */
router.delete('/:templateId', requireAuth, async (req, res) => {
  try {
    const { templateId } = req.params;

    // TODO: בדיקת הרשאות אדמין

    // בדיקה שאין חנויות שמשתמשות בתבנית
    const storesUsingTemplate = await prisma.store.count({
      where: { templateId }
    });

    if (storesUsingTemplate > 0) {
      return res.status(400).json({ 
        error: `Cannot delete template. ${storesUsingTemplate} stores are using this template.` 
      });
    }

    await prisma.template.delete({
      where: { id: templateId }
    });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ 
      error: 'Failed to delete template',
      message: error.message 
    });
  }
});

/**
 * קבלת סטטיסטיקות תבנית
 */
router.get('/:templateId/stats', async (req, res) => {
  try {
    const { templateId } = req.params;

    const stats = await prisma.store.groupBy({
      by: ['templateId'],
      where: {
        templateId: templateId
      },
      _count: {
        id: true
      }
    });

    const activeStores = await prisma.store.count({
      where: {
        templateId: templateId,
        isActive: true
      }
    });

    res.json({
      templateId,
      totalStores: stats[0]?._count?.id || 0,
      activeStores,
      inactiveStores: (stats[0]?._count?.id || 0) - activeStores
    });

  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({ error: 'Failed to fetch template stats' });
  }
});

export default router;

import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireActiveSubscription } from '../middleware/auth.js';

const router = express.Router();

/**
 * קבלת עמוד מותאם אישית לפי חנות וסוג עמוד
 */
router.get('/:storeSlug/:pageType', async (req, res) => {
  try {
    const { storeSlug, pageType } = req.params;
    
    // בדיקת תקינות סוג העמוד לפי הסיווג במערכת
    const validPageTypes = {
      'home': 'HOME',        // דף בית
      'product': 'PRODUCT',  // דף מוצר  
      'category': 'CATEGORY', // דף קטגוריה
      'content': 'CONTENT'   // דף תוכן (אודות, צור קשר, שירותים וכו')
    };
    
    if (!validPageTypes[pageType]) {
      return res.status(400).json({ 
        error: 'Invalid page type',
        validTypes: Object.keys(validPageTypes)
      });
    }
    
    const dbPageType = validPageTypes[pageType];
    
    // חיפוש החנות
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // חיפוש העמוד המותאם
    const customPage = await prisma.customPage.findUnique({
      where: {
        storeId_pageType: {
          storeId: store.id,
          pageType: dbPageType
        }
      }
    });
    
    if (!customPage) {
      return res.status(404).json({ 
        error: 'Custom page not found',
        useDefault: true // אות לשימוש בברירת מחדל
      });
    }
    
    console.log('📖 Loading from database:', {
      id: customPage.id,
      pageType: customPage.pageType,
      sectionsCount: customPage.structure?.sections?.length || 0,
      structure: customPage.structure
    });
    
    res.json({
      id: customPage.id,
      pageType: customPage.pageType,
      structure: customPage.structure,
      settings: customPage.settings,
      isPublished: customPage.isPublished,
      lastModified: customPage.updatedAt
    });
    
  } catch (error) {
    console.error('Error fetching custom page:', error);
    res.status(500).json({ error: 'Failed to fetch custom page' });
  }
});

/**
 * שמירת עמוד מותאם אישית
 */
router.post('/:storeSlug/:pageType', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { storeSlug, pageType } = req.params;
    const { structure, settings, isPublished = false } = req.body;
    
    console.log('🔥 Received save request:', {
      storeSlug,
      pageType,
      sectionsCount: structure?.sections?.length || 0,
      structure: structure,
      settings: settings
    });
    
    // בדיקת תקינות סוג העמוד
    const validPageTypes = {
      'home': 'HOME',
      'product': 'PRODUCT', 
      'category': 'CATEGORY',
      'about': 'CONTENT',
      'contact': 'CONTENT',
      'services': 'CONTENT',
      'portfolio': 'CONTENT',
      'blog': 'CONTENT'
    };
    
    if (!validPageTypes[pageType]) {
      return res.status(400).json({ 
        error: 'Invalid page type',
        validTypes: Object.keys(validPageTypes)
      });
    }
    
    const dbPageType = validPageTypes[pageType];
    
    // בדיקת תקינות המבנה
    if (!structure || !structure.sections || !Array.isArray(structure.sections)) {
      return res.status(400).json({ error: 'Invalid page structure' });
    }
    
    // חיפוש החנות ובדיקת הרשאות
    const store = await prisma.store.findFirst({
      where: { 
        slug: storeSlug,
        userId: req.user.id
      }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }
    
    // שמירה או עדכון העמוד
    const customPage = await prisma.customPage.upsert({
      where: {
        storeId_pageType: {
          storeId: store.id,
          pageType: dbPageType
        }
      },
      update: {
        structure: structure,
        settings: settings || {},
        isPublished: isPublished
      },
      create: {
        storeId: store.id,
        pageType: dbPageType,
        structure: structure,
        settings: settings || {},
        isPublished: isPublished
      }
    });
    
    console.log('💾 Saved to database:', {
      id: customPage.id,
      sectionsCount: customPage.structure?.sections?.length || 0,
      structure: customPage.structure
    });
    
    res.json({
      id: customPage.id,
      pageType: customPage.pageType,
      structure: customPage.structure,
      settings: customPage.settings,
      isPublished: customPage.isPublished,
      message: 'Page saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving custom page:', error);
    res.status(500).json({ error: 'Failed to save custom page' });
  }
});

/**
 * מחיקת עמוד מותאם אישית (חזרה לברירת מחדל)
 */
router.delete('/:storeSlug/:pageType', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { storeSlug, pageType } = req.params;
    
    console.log('🗑️ Received delete request:', { storeSlug, pageType });
    
    // חיפוש החנות ובדיקת הרשאות
    const store = await prisma.store.findFirst({
      where: { 
        slug: storeSlug,
        userId: req.user.id
      }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }
    
    // בדיקת תקינות סוג העמוד
    const validPageTypes = {
      'home': 'HOME',
      'product': 'PRODUCT', 
      'category': 'CATEGORY',
      'about': 'CONTENT',
      'contact': 'CONTENT',
      'services': 'CONTENT',
      'portfolio': 'CONTENT',
      'blog': 'CONTENT'
    };
    
    const dbPageType = validPageTypes[pageType];
    if (!dbPageType) {
      return res.status(400).json({ error: 'Invalid page type' });
    }

    // מחיקת העמוד המותאם
    await prisma.customPage.delete({
      where: {
        storeId_pageType: {
          storeId: store.id,
          pageType: dbPageType
        }
      }
    });
    
    console.log('🗑️ Deleted from database successfully');
    
    res.json({ message: 'Custom page deleted successfully. Will use default template.' });
    
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Custom page not found' });
    }
    console.error('Error deleting custom page:', error);
    res.status(500).json({ error: 'Failed to delete custom page' });
  }
});

/**
 * קבלת רשימת כל העמודים המותאמים של חנות
 */
router.get('/:storeSlug', authenticateToken, async (req, res) => {
  try {
    const { storeSlug } = req.params;
    
    // חיפוש החנות ובדיקת הרשאות
    const store = await prisma.store.findFirst({
      where: { 
        slug: storeSlug,
        userId: req.user.id
      }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }
    
    // קבלת כל העמודים המותאמים
    const customPages = await prisma.customPage.findMany({
      where: { storeId: store.id },
      select: {
        id: true,
        pageType: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(customPages);
    
  } catch (error) {
    console.error('Error fetching custom pages:', error);
    res.status(500).json({ error: 'Failed to fetch custom pages' });
  }
});

/**
 * פרסום/ביטול פרסום עמוד מותאם
 */
router.patch('/:storeSlug/:pageType/publish', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { storeSlug, pageType } = req.params;
    const { isPublished } = req.body;
    
    // חיפוש החנות ובדיקת הרשאות
    const store = await prisma.store.findFirst({
      where: { 
        slug: storeSlug,
        userId: req.user.id
      }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }
    
    // בדיקת תקינות סוג העמוד
    const validPageTypes = {
      'home': 'HOME',
      'product': 'PRODUCT', 
      'category': 'CATEGORY',
      'about': 'CONTENT',
      'contact': 'CONTENT',
      'services': 'CONTENT',
      'portfolio': 'CONTENT',
      'blog': 'CONTENT'
    };
    
    const dbPageType = validPageTypes[pageType];
    if (!dbPageType) {
      return res.status(400).json({ error: 'Invalid page type' });
    }

    // עדכון סטטוס הפרסום
    const customPage = await prisma.customPage.update({
      where: {
        storeId_pageType: {
          storeId: store.id,
          pageType: dbPageType
        }
      },
      data: { isPublished: Boolean(isPublished) }
    });
    
    res.json({
      id: customPage.id,
      pageType: customPage.pageType,
      isPublished: customPage.isPublished,
      message: isPublished ? 'Page published successfully' : 'Page unpublished successfully'
    });
    
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Custom page not found' });
    }
    console.error('Error updating page publish status:', error);
    res.status(500).json({ error: 'Failed to update page publish status' });
  }
});

export default router;

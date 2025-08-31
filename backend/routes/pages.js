import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireActiveSubscription } from '../middleware/auth.js';

const router = express.Router();

/**
 * קבלת כל העמודים של חנות
 */
router.get('/store/:storeId', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // בדיקת הרשאות
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // קבלת כל העמודים
    const pages = await prisma.page.findMany({
      where: { storeId: parseInt(storeId) },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        isPublished: true,
        seoTitle: true,
        seoDescription: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // בדיקה אילו עמודים מקושרים בתפריטים
    const menus = await prisma.menu.findMany({
      where: { storeId: parseInt(storeId) },
      select: { items: true, name: true, handle: true }
    });

    // יצירת מפה של עמודים המקושרים בתפריטים
    const linkedPages = new Set();
    menus.forEach(menu => {
      const checkItems = (items) => {
        items.forEach(item => {
          if (item.url && item.url.startsWith('/')) {
            const slug = item.url.substring(1);
            linkedPages.add(slug);
          }
          if (item.children) {
            checkItems(item.children);
          }
        });
      };
      checkItems(menu.items || []);
    });

    // הוספת מידע על קישור בתפריטים
    const pagesWithMenuInfo = pages.map(page => ({
      ...page,
      linkedInMenus: linkedPages.has(page.slug),
      menuLinks: menus.filter(menu => {
        const hasLink = (items) => {
          return items.some(item => {
            if (item.url === `/${page.slug}`) return true;
            if (item.children) return hasLink(item.children);
            return false;
          });
        };
        return hasLink(menu.items || []);
      }).map(menu => ({ name: menu.name, handle: menu.handle }))
    }));

    res.json(pagesWithMenuInfo);

  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

/**
 * קבלת עמוד ספציפי
 */
router.get('/:pageId', authenticateToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const userId = req.user.id;

    const page = await prisma.page.findFirst({
      where: {
        id: parseInt(pageId),
        store: {
          userId: userId
        }
      },
      include: {
        store: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found or access denied' });
    }

    res.json(page);

  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

/**
 * יצירת עמוד חדש
 */
router.post('/store/:storeId', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { title, slug, content, type = 'CONTENT', seoTitle, seoDescription, isPublished = false } = req.body;
    const userId = req.user.id;

    // בדיקת הרשאות
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // בדיקת ייחודיות slug
    const existingPage = await prisma.page.findFirst({
      where: {
        storeId: parseInt(storeId),
        slug: slug
      }
    });

    if (existingPage) {
      return res.status(400).json({ error: 'Page with this slug already exists' });
    }

    // יצירת העמוד
    const page = await prisma.page.create({
      data: {
        storeId: parseInt(storeId),
        title,
        slug,
        content: content ? { html: content } : null,
        type,
        seoTitle,
        seoDescription,
        isPublished
      }
    });

    res.status(201).json(page);

  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

/**
 * עדכון עמוד
 */
router.put('/:pageId', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { title, slug, content, type, seoTitle, seoDescription, isPublished } = req.body;
    const userId = req.user.id;

    // בדיקת הרשאות
    const existingPage = await prisma.page.findFirst({
      where: {
        id: parseInt(pageId),
        store: {
          userId: userId
        }
      }
    });

    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found or access denied' });
    }

    // בדיקת ייחודיות slug (אם השתנה)
    if (slug && slug !== existingPage.slug) {
      const duplicatePage = await prisma.page.findFirst({
        where: {
          storeId: existingPage.storeId,
          slug: slug,
          id: { not: parseInt(pageId) }
        }
      });

      if (duplicatePage) {
        return res.status(400).json({ error: 'Page with this slug already exists' });
      }
    }

    // עדכון העמוד
    const updatedPage = await prisma.page.update({
      where: { id: parseInt(pageId) },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content !== undefined && { content: content ? { html: content } : null }),
        ...(type && { type }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(isPublished !== undefined && { isPublished })
      }
    });

    res.json(updatedPage);

  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

/**
 * שכפול עמוד
 */
router.post('/:pageId/duplicate', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { pageId } = req.params;
    const userId = req.user.id;

    // קבלת העמוד המקורי
    const originalPage = await prisma.page.findFirst({
      where: {
        id: parseInt(pageId),
        store: {
          userId: userId
        }
      }
    });

    if (!originalPage) {
      return res.status(404).json({ error: 'Page not found or access denied' });
    }

    // יצירת slug ייחודי
    let newSlug = `${originalPage.slug}-copy`;
    let counter = 1;
    
    while (await prisma.page.findFirst({
      where: { storeId: originalPage.storeId, slug: newSlug }
    })) {
      newSlug = `${originalPage.slug}-copy-${counter}`;
      counter++;
    }

    // יצירת העמוד החדש
    const duplicatedPage = await prisma.page.create({
      data: {
        storeId: originalPage.storeId,
        title: `${originalPage.title} (עותק)`,
        slug: newSlug,
        content: originalPage.content,
        type: originalPage.type,
        seoTitle: originalPage.seoTitle ? `${originalPage.seoTitle} (עותק)` : null,
        seoDescription: originalPage.seoDescription,
        isPublished: false // עמוד משוכפל לא מפורסם כברירת מחדל
      }
    });

    res.status(201).json(duplicatedPage);

  } catch (error) {
    console.error('Error duplicating page:', error);
    res.status(500).json({ error: 'Failed to duplicate page' });
  }
});

/**
 * מחיקת עמוד
 */
router.delete('/:pageId', authenticateToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const userId = req.user.id;

    // בדיקת הרשאות וקבלת מידע על העמוד
    const page = await prisma.page.findFirst({
      where: {
        id: parseInt(pageId),
        store: {
          userId: userId
        }
      },
      include: {
        store: true
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found or access denied' });
    }

    // בדיקה אם העמוד מקושר בתפריטים
    const menus = await prisma.menu.findMany({
      where: { storeId: page.storeId }
    });

    const linkedMenus = [];
    menus.forEach(menu => {
      const checkItems = (items, menuName) => {
        items.forEach(item => {
          if (item.url === `/${page.slug}`) {
            linkedMenus.push(menuName);
          }
          if (item.children) {
            checkItems(item.children, menuName);
          }
        });
      };
      checkItems(menu.items || [], menu.name);
    });

    // מחיקת העמוד
    await prisma.page.delete({
      where: { id: parseInt(pageId) }
    });

    res.json({
      message: 'Page deleted successfully',
      linkedMenus: linkedMenus.length > 0 ? linkedMenus : null,
      warning: linkedMenus.length > 0 ? 
        `העמוד היה מקושר בתפריטים הבאים: ${linkedMenus.join(', ')}. יש לעדכן את התפריטים ידנית.` : 
        null
    });

  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router; 
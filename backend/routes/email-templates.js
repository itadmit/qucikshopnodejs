import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { EmailService } from '../services/EmailService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all email templates for a store
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.query;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const templates = await prisma.emailTemplate.findMany({
      where: {
        storeId: parseInt(storeId)
      },
      orderBy: {
        type: 'asc'
      }
    });

    // Add default templates if they don't exist
    const templateTypes = ['order_confirmation', 'order_status_update', 'abandoned_cart', 'welcome'];
    const existingTypes = templates.map(t => t.type);
    const missingTypes = templateTypes.filter(type => !existingTypes.includes(type));

    const defaultTemplates = [];
    for (const type of missingTypes) {
      const defaultTemplate = await EmailService.getDefaultTemplate(type);
      defaultTemplates.push({
        type,
        name: getTemplateDisplayName(type),
        subject: defaultTemplate.subject,
        htmlContent: defaultTemplate.htmlContent,
        isDefault: true,
        isActive: true,
        variables: getTemplateVariables(type)
      });
    }

    res.json({
      success: true,
      data: {
        templates: [...templates, ...defaultTemplates],
        availableVariables: getAllAvailableVariables()
      }
    });

  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ error: 'Failed to get email templates' });
  }
});

// Get single email template
router.get('/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { storeId } = req.query;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let template = await prisma.emailTemplate.findFirst({
      where: {
        storeId: parseInt(storeId),
        type
      }
    });

    // If template doesn't exist, return default
    if (!template) {
      const defaultTemplate = await EmailService.getDefaultTemplate(type);
      template = {
        type,
        name: getTemplateDisplayName(type),
        subject: defaultTemplate.subject,
        htmlContent: defaultTemplate.htmlContent,
        isDefault: true,
        isActive: true,
        variables: getTemplateVariables(type)
      };
    }

    res.json({
      success: true,
      data: {
        template,
        availableVariables: getTemplateVariables(type)
      }
    });

  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ error: 'Failed to get email template' });
  }
});

// Create or update email template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      storeId,
      type,
      name,
      subject,
      htmlContent,
      textContent,
      isActive = true
    } = req.body;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate required fields
    if (!type || !name || !subject || !htmlContent) {
      return res.status(400).json({
        error: 'Type, name, subject, and HTML content are required'
      });
    }

    // Create or update template
    const template = await prisma.emailTemplate.upsert({
      where: {
        storeId_type: {
          storeId: parseInt(storeId),
          type
        }
      },
      update: {
        name,
        subject,
        htmlContent,
        textContent,
        isActive,
        variables: getTemplateVariables(type)
      },
      create: {
        storeId: parseInt(storeId),
        type,
        name,
        subject,
        htmlContent,
        textContent,
        isActive,
        isDefault: false,
        variables: getTemplateVariables(type)
      }
    });

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Save email template error:', error);
    res.status(500).json({ error: 'Failed to save email template' });
  }
});

// Preview email template
router.post('/preview', authenticateToken, async (req, res) => {
  try {
    const {
      storeId,
      type,
      htmlContent,
      subject,
      sampleData = {}
    } = req.body;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get sample data for preview
    const previewData = {
      ...getSampleDataForType(type),
      ...sampleData
    };

    // Create temporary template object
    const template = {
      subject,
      htmlContent
    };

    // Render template with sample data
    const renderedHtml = await EmailService.renderTemplate(template, previewData);
    const renderedSubject = subject.replace(/{{(\w+)}}/g, (match, key) => previewData[key] || match);

    res.json({
      success: true,
      data: {
        html: renderedHtml,
        subject: renderedSubject,
        sampleData: previewData
      }
    });

  } catch (error) {
    console.error('Preview email template error:', error);
    res.status(500).json({ error: 'Failed to preview email template' });
  }
});

// Send test email
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const {
      storeId,
      type,
      htmlContent,
      subject,
      testEmail,
      sampleData = {}
    } = req.body;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address is required' });
    }

    // Get sample data for test
    const testData = {
      ...getSampleDataForType(type),
      ...sampleData
    };

    // Create temporary template object
    const template = {
      subject: `[TEST] ${subject}`,
      htmlContent
    };

    // Render and send test email
    const renderedHtml = await EmailService.renderTemplate(template, testData);
    const renderedSubject = template.subject.replace(/{{(\w+)}}/g, (match, key) => testData[key] || match);

    await EmailService.sendEmail({
      to: testEmail,
      subject: renderedSubject,
      html: renderedHtml,
      type: 'test',
      storeId: parseInt(storeId),
      fromName: 'QuickShop Test'
    });

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Delete email template (reset to default)
router.delete('/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { storeId } = req.query;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.emailTemplate.deleteMany({
      where: {
        storeId: parseInt(storeId),
        type
      }
    });

    res.json({
      success: true,
      message: 'Template reset to default'
    });

  } catch (error) {
    console.error('Delete email template error:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

// Get email statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { storeId, days = 30 } = req.query;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await EmailService.getEmailStats(parseInt(storeId), parseInt(days));

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ error: 'Failed to get email statistics' });
  }
});

// Helper functions
function getTemplateDisplayName(type) {
  const names = {
    'order_confirmation': 'אישור הזמנה',
    'order_status_update': 'עדכון סטטוס הזמנה',
    'abandoned_cart': 'עגלה נטושה',
    'welcome': 'ברוכים הבאים',
    'low_stock': 'מלאי נמוך',
    'password_reset': 'איפוס סיסמה',
    'newsletter': 'ניוזלטר'
  };
  return names[type] || type;
}

function getTemplateVariables(type) {
  const baseVariables = {
    storeName: 'שם החנות',
    storeUrl: 'כתובת החנות',
    customerName: 'שם הלקוח',
    customerEmail: 'מייל הלקוח'
  };

  const typeSpecificVariables = {
    order_confirmation: {
      ...baseVariables,
      orderNumber: 'מספר הזמנה',
      orderDate: 'תאריך הזמנה',
      orderTotal: 'סכום ההזמנה',
      currency: 'מטבע',
      items: 'פריטי ההזמנה (לולאה)',
      shippingAddress: 'כתובת משלוח',
      billingAddress: 'כתובת חיוב'
    },
    order_status_update: {
      ...baseVariables,
      orderNumber: 'מספר הזמנה',
      statusMessage: 'הודעת סטטוס',
      newStatus: 'סטטוס חדש',
      previousStatus: 'סטטוס קודם',
      trackingNumber: 'מספר מעקב'
    },
    abandoned_cart: {
      ...baseVariables,
      items: 'פריטי העגלה (לולאה)',
      cartTotal: 'סכום העגלה',
      currency: 'מטבע',
      cartUrl: 'קישור לעגלה'
    },
    welcome: {
      ...baseVariables
    }
  };

  return typeSpecificVariables[type] || baseVariables;
}

function getSampleDataForType(type) {
  const baseSampleData = {
    storeName: 'החנות שלי',
    storeUrl: 'https://mystore.quickshop.co.il',
    customerName: 'יוסי כהן',
    customerEmail: 'yossi@example.com'
  };

  const typeSampleData = {
    order_confirmation: {
      ...baseSampleData,
      orderNumber: '123',
      orderDate: '28/08/2025',
      orderTotal: '299',
      currency: '₪',
      items: [
        { name: 'חולצה כחולה', quantity: 2, price: 99, total: 198 },
        { name: 'מכנסיים שחורים', quantity: 1, price: 149, total: 149 }
      ],
      shippingAddress: {
        firstName: 'יוסי',
        lastName: 'כהן',
        address: 'רחוב הרצל 123',
        city: 'תל אביב',
        postalCode: '12345'
      }
    },
    order_status_update: {
      ...baseSampleData,
      orderNumber: '123',
      statusMessage: 'ההזמנה שלך נשלחה',
      newStatus: 'SHIPPED',
      previousStatus: 'PROCESSING',
      trackingNumber: 'IL123456789'
    },
    abandoned_cart: {
      ...baseSampleData,
      items: [
        { name: 'חולצה כחולה', quantity: 1, price: 99, total: 99 },
        { name: 'מכנסיים שחורים', quantity: 1, price: 149, total: 149 }
      ],
      cartTotal: '248',
      currency: '₪',
      cartUrl: 'https://mystore.quickshop.co.il/cart'
    },
    welcome: baseSampleData
  };

  return typeSampleData[type] || baseSampleData;
}

function getAllAvailableVariables() {
  return {
    basic: {
      storeName: 'שם החנות',
      storeUrl: 'כתובת החנות',
      customerName: 'שם הלקוח',
      customerEmail: 'מייל הלקוח'
    },
    order: {
      orderNumber: 'מספר הזמנה',
      orderDate: 'תאריך הזמנה',
      orderTotal: 'סכום ההזמנה',
      currency: 'מטבע',
      statusMessage: 'הודעת סטטוס',
      trackingNumber: 'מספר מעקב'
    },
    loops: {
      'items ({{#each items}})': 'לולאת פריטים - name, quantity, price, total',
      'addresses': 'כתובות - firstName, lastName, address, city, postalCode'
    },
    conditions: {
      '{{#if variable}}': 'תנאי - מציג תוכן רק אם המשתנה קיים',
      '{{/if}}': 'סגירת תנאי'
    }
  };
}

export default router;

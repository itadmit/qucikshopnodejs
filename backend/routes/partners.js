import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Middleware לאימות שותפים
const authenticatePartner = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'partner') {
      throw new Error();
    }

    const partner = await prisma.partner.findUnique({
      where: { id: decoded.partnerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        tier: true,
        isActive: true,
        referralCode: true,
        totalStores: true,
        activeStores: true
      }
    });

    if (!partner || !partner.isActive) {
      throw new Error();
    }

    req.partner = partner;
    req.partnerId = partner.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate as partner' });
  }
};

// יצירת קוד הפניה ייחודי
const generateReferralCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = 'QSP-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await prisma.partner.findUnique({
      where: { referralCode: code }
    });
    
    exists = !!existing;
  }
  
  return code;
};

// רישום שותף חדש
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company, phone } = req.body;

    // בדיקה אם השותף קיים
    const existingPartner = await prisma.partner.findUnique({
      where: { email }
    });

    if (existingPartner) {
      return res.status(400).json({ error: 'Partner already exists' });
    }

    // הצפנת סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // יצירת קוד הפניה ייחודי
    const referralCode = await generateReferralCode();

    // יצירת השותף
    const partner = await prisma.partner.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company,
        phone,
        referralCode
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        referralCode: true
      }
    });

    // רישום פעילות
    await prisma.partnerActivity.create({
      data: {
        partnerId: partner.id,
        type: 'PROFILE_UPDATED',
        metadata: { action: 'registration' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // יצירת טוקן
    const token = jwt.sign(
      { partnerId: partner.id, type: 'partner' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      partner,
      token
    });
  } catch (error) {
    console.error('Partner registration error:', error);
    res.status(500).json({ error: 'Failed to register partner' });
  }
});

// התחברות שותף
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // מציאת השותף
    const partner = await prisma.partner.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            stores: true,
            commissions: true
          }
        }
      }
    });

    if (!partner || !partner.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // בדיקת סיסמה
    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // עדכון זמן התחברות אחרון
    await prisma.partner.update({
      where: { id: partner.id },
      data: { lastLoginAt: new Date() }
    });

    // רישום פעילות
    await prisma.partnerActivity.create({
      data: {
        partnerId: partner.id,
        type: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // יצירת טוקן
    const token = jwt.sign(
      { partnerId: partner.id, type: 'partner' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // הסרת סיסמה מהתגובה
    const { password: _, ...partnerData } = partner;

    res.json({
      partner: partnerData,
      token
    });
  } catch (error) {
    console.error('Partner login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// קבלת פרטי שותף נוכחי
router.get('/me', authenticatePartner, async (req, res) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: req.partnerId },
      include: {
        _count: {
          select: {
            stores: true,
            commissions: true,
            payoutRequests: true
          }
        }
      }
    });

    const { password: _, ...partnerData } = partner;
    res.json(partnerData);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ error: 'Failed to fetch partner details' });
  }
});

// עדכון פרטי שותף
router.put('/me', authenticatePartner, async (req, res) => {
  try {
    const { firstName, lastName, company, phone } = req.body;

    const updatedPartner = await prisma.partner.update({
      where: { id: req.partnerId },
      data: {
        firstName,
        lastName,
        company,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        phone: true,
        referralCode: true
      }
    });

    // רישום פעילות
    await prisma.partnerActivity.create({
      data: {
        partnerId: req.partnerId,
        type: 'PROFILE_UPDATED',
        metadata: { fields: Object.keys(req.body) }
      }
    });

    res.json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

// שינוי סיסמה
router.put('/change-password', authenticatePartner, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // בדיקת סיסמה נוכחית
    const partner = await prisma.partner.findUnique({
      where: { id: req.partnerId }
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, partner.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // הצפנת סיסמה חדשה
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // עדכון סיסמה
    await prisma.partner.update({
      where: { id: req.partnerId },
      data: { password: hashedPassword }
    });

    // רישום פעילות
    await prisma.partnerActivity.create({
      data: {
        partnerId: req.partnerId,
        type: 'PASSWORD_CHANGED'
      }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// קבלת דשבורד כללי
router.get('/dashboard', authenticatePartner, async (req, res) => {
  try {
    // סטטיסטיקות כלליות
    const [stores, commissions, totalEarnings] = await Promise.all([
      // חנויות
      prisma.partnerStore.findMany({
        where: { partnerId: req.partnerId },
        include: {
          store: {
            select: {
              name: true,
              slug: true,
              isActive: true,
              subscriptionStatus: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      // עמלות אחרונות
      prisma.partnerCommission.findMany({
        where: { partnerId: req.partnerId },
        include: {
          partnerStore: {
            include: {
              store: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { earnedAt: 'desc' },
        take: 10
      }),
      
      // סך הכל רווחים
      prisma.partnerCommission.aggregate({
        where: { 
          partnerId: req.partnerId,
          status: { in: ['APPROVED', 'PAID'] }
        },
        _sum: { amount: true }
      })
    ]);

    // חישוב סטטיסטיקות
    const stats = {
      totalStores: stores.length,
      activeStores: stores.filter(s => s.status === 'ACTIVE').length,
      developmentStores: stores.filter(s => s.status === 'DEVELOPMENT').length,
      totalEarnings: totalEarnings._sum.amount || 0,
      pendingEarnings: await prisma.partnerCommission.aggregate({
        where: { 
          partnerId: req.partnerId,
          status: 'PENDING'
        },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0)
    };

    // קביעת עמלה לפי דרגה
    const commissionRates = {
      BRONZE: 85,
      SILVER: 100,
      GOLD: 150
    };

    res.json({
      partner: req.partner,
      stats,
      stores: stores.slice(0, 5), // 5 חנויות אחרונות
      recentCommissions: commissions,
      commissionRate: commissionRates[req.partner.tier]
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// יצירת חנות פיתוח
router.post('/stores/create', authenticatePartner, async (req, res) => {
  try {
    console.log('Creating store with data:', req.body);
    console.log('Partner:', req.partner);
    const { storeName, storeSlug, templateName = 'jupiter' } = req.body;

    // בדיקת slug ייחודי
    const existingStore = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (existingStore) {
      return res.status(400).json({ error: 'Store slug already exists' });
    }

    // יצירת משתמש זמני לחנות
    const tempEmail = `${storeSlug}-temp@quickshop-partners.com`;
    const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);

    console.log('Creating temp user with:', {
      email: tempEmail,
      firstName: req.partner.firstName || 'Partner',
      lastName: req.partner.lastName || 'User'
    });

    const tempUser = await prisma.user.create({
      data: {
        email: tempEmail,
        passwordHash: tempPassword,
        firstName: req.partner.firstName || 'Partner',
        lastName: req.partner.lastName || 'User'
      }
    });

    console.log('Temp user created:', tempUser.id);

    // יצירת החנות
    console.log('Creating store with:', {
      userId: tempUser.id,
      name: storeName,
      slug: storeSlug,
      templateName
    });

    const store = await prisma.store.create({
      data: {
        userId: tempUser.id,
        name: storeName,
        slug: storeSlug,
        templateName,
        settings: {
          partner: {
            partnerId: req.partnerId,
            referralCode: req.partner.referralCode
          }
        },
        // חנות פיתוח - ללא תקופת ניסיון
        subscriptionStatus: 'TRIAL',
        trialEndsAt: null
      }
    });

    console.log('Store created:', store.id);

    // יצירת רשומת PartnerStore
    const partnerStore = await prisma.partnerStore.create({
      data: {
        partnerId: req.partnerId,
        storeId: store.id,
        status: 'DEVELOPMENT',
        referralCode: req.partner.referralCode
      }
    });

    // עדכון מספר החנויות
    await prisma.partner.update({
      where: { id: req.partnerId },
      data: {
        totalStores: { increment: 1 }
      }
    });

    // רישום פעילות
    await prisma.partnerActivity.create({
      data: {
        partnerId: req.partnerId,
        type: 'STORE_CREATED',
        metadata: {
          storeId: store.id,
          storeName,
          storeSlug
        }
      }
    });

    res.status(201).json({
      store,
      partnerStore,
      tempCredentials: {
        email: tempEmail,
        message: 'Temporary credentials for development'
      }
    });
  } catch (error) {
    console.error('Error creating store:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create store', details: error.message });
  }
});

// קבלת רשימת חנויות של השותף
router.get('/stores', authenticatePartner, async (req, res) => {
  try {
    const stores = await prisma.partnerStore.findMany({
      where: { partnerId: req.partnerId },
      include: {
        store: {
          include: {
            _count: {
              select: {
                products: true,
                orders: true
              }
            }
          }
        },
        commissions: {
          where: { status: { in: ['APPROVED', 'PAID'] } },
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// העברת בעלות חנות
router.post('/stores/:storeId/transfer', authenticatePartner, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { customerEmail, customerName } = req.body;

    // בדיקת בעלות על החנות
    const partnerStore = await prisma.partnerStore.findFirst({
      where: {
        partnerId: req.partnerId,
        storeId: parseInt(storeId),
        status: 'DEVELOPMENT'
      },
      include: {
        store: true
      }
    });

    if (!partnerStore) {
      return res.status(404).json({ error: 'Store not found or already transferred' });
    }

    // בדיקה אם הלקוח קיים
    let customer = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    // אם לא, יצירת משתמש חדש
    if (!customer) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      customer = await prisma.user.create({
        data: {
          email: customerEmail,
          password: hashedPassword,
          name: customerName,
          isActive: true
        }
      });

      // TODO: שליחת אימייל עם פרטי גישה
    }

    // העברת בעלות החנות
    await prisma.store.update({
      where: { id: parseInt(storeId) },
      data: {
        userId: customer.id,
        subscriptionStatus: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 ימי ניסיון
      }
    });

    // עדכון סטטוס PartnerStore
    await prisma.partnerStore.update({
      where: { id: partnerStore.id },
      data: {
        status: 'TRANSFERRED',
        transferredAt: new Date(),
        transferEmail: customerEmail
      }
    });

    // רישום פעילות
    await prisma.partnerActivity.create({
      data: {
        partnerId: req.partnerId,
        type: 'STORE_TRANSFERRED',
        metadata: {
          storeId: parseInt(storeId),
          customerEmail,
          customerName
        }
      }
    });

    res.json({
      message: 'Store transferred successfully',
      store: partnerStore.store,
      customer: {
        email: customer.email,
        name: customer.name
      }
    });
  } catch (error) {
    console.error('Error transferring store:', error);
    res.status(500).json({ error: 'Failed to transfer store' });
  }
});

// קבלת היסטוריית עמלות
router.get('/commissions', authenticatePartner, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { partnerId: req.partnerId };
    if (status) {
      where.status = status;
    }

    const [commissions, total] = await Promise.all([
      prisma.partnerCommission.findMany({
        where,
        include: {
          partnerStore: {
            include: {
              store: {
                select: { name: true, slug: true }
              }
            }
          }
        },
        orderBy: { earnedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.partnerCommission.count({ where })
    ]);

    res.json({
      commissions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

// בקשת משיכת כספים
router.post('/payouts/request', authenticatePartner, async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;

    // בדיקת יתרה זמינה
    const availableBalance = await prisma.partnerCommission.aggregate({
      where: {
        partnerId: req.partnerId,
        status: 'APPROVED',
        payoutRequestId: null
      },
      _sum: { amount: true }
    });

    const available = availableBalance._sum.amount || 0;
    if (available < amount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        available
      });
    }

    // יצירת בקשת משיכה
    const payoutRequest = await prisma.partnerPayoutRequest.create({
      data: {
        partnerId: req.partnerId,
        amount,
        bankDetails: bankDetails || {}
      }
    });

    // עדכון עמלות כשייכות לבקשת המשיכה
    await prisma.partnerCommission.updateMany({
      where: {
        partnerId: req.partnerId,
        status: 'APPROVED',
        payoutRequestId: null
      },
      data: {
        payoutRequestId: payoutRequest.id
      }
    });

    // רישום פעילות
    await prisma.partnerActivity.create({
      data: {
        partnerId: req.partnerId,
        type: 'PAYOUT_REQUESTED',
        metadata: {
          amount,
          payoutRequestId: payoutRequest.id
        }
      }
    });

    res.status(201).json({
      payoutRequest,
      message: 'Payout request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating payout request:', error);
    res.status(500).json({ error: 'Failed to create payout request' });
  }
});

// קבלת היסטוריית משיכות
router.get('/payouts', authenticatePartner, async (req, res) => {
  try {
    const payouts = await prisma.partnerPayoutRequest.findMany({
      where: { partnerId: req.partnerId },
      include: {
        _count: {
          select: { commissions: true }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json(payouts);
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// קבלת פעילות אחרונה
router.get('/activities', authenticatePartner, async (req, res) => {
  try {
    const activities = await prisma.partnerActivity.findMany({
      where: { partnerId: req.partnerId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;

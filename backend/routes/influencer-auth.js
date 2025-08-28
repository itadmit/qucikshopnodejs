import express from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/influencer-auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'אימייל וסיסמה נדרשים' });
    }

    // Find influencer by email
    const influencer = await prisma.influencer.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'ACTIVE'
      },
      include: {
        store: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    if (!influencer) {
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, influencer.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: influencer.id, 
        email: influencer.email,
        storeId: influencer.storeId,
        type: 'influencer'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...influencerData } = influencer;

    res.json({
      token,
      influencer: influencerData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'שגיאה בהתחברות' });
  }
});

// Middleware to authenticate influencer token
export const authenticateInfluencer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'נדרש אימות' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'influencer') {
      return res.status(403).json({ error: 'גישה נדחתה' });
    }

    const influencer = await prisma.influencer.findUnique({
      where: { id: decoded.id }
    });

    if (!influencer || influencer.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'חשבון לא פעיל' });
    }

    req.influencer = influencer;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'טוקן לא תקין' });
  }
};

export default router;

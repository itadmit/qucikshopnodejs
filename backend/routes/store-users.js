import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireActiveSubscription } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Helper function to check if user has permission for store
const checkStorePermission = async (userId, storeId, requiredRole = null) => {
  // Check if user is owner
  const ownedStore = await prisma.store.findFirst({
    where: { id: storeId, userId }
  });
  
  if (ownedStore) {
    return { hasPermission: true, role: 'OWNER', isOwner: true };
  }
  
  // Check if user has access through StoreUser
  const storeUser = await prisma.storeUser.findFirst({
    where: {
      storeId,
      userId,
      isActive: true,
      acceptedAt: { not: null }
    }
  });
  
  if (!storeUser) {
    return { hasPermission: false, role: null, isOwner: false };
  }
  
  // Check role hierarchy if required
  const roleHierarchy = ['VIEWER', 'STAFF', 'MANAGER', 'ADMIN', 'OWNER'];
  const userRoleIndex = roleHierarchy.indexOf(storeUser.role);
  const requiredRoleIndex = requiredRole ? roleHierarchy.indexOf(requiredRole) : 0;
  
  return {
    hasPermission: userRoleIndex >= requiredRoleIndex,
    role: storeUser.role,
    isOwner: false
  };
};

// Get store team members
router.get('/:storeId/team', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId);
    
    // Check if user has access to this store
    const permission = await checkStorePermission(userId, storeId, 'STAFF');
    if (!permission.hasPermission) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get store owner
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Get team members
    const teamMembers = await prisma.storeUser.findMany({
      where: { storeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const team = [
      {
        id: store.user.id,
        email: store.user.email,
        firstName: store.user.firstName,
        lastName: store.user.lastName,
        role: 'OWNER',
        isOwner: true,
        isActive: true,
        acceptedAt: store.createdAt,
        createdAt: store.createdAt
      },
      ...teamMembers.map(tm => ({
        id: tm.user.id,
        email: tm.user.email,
        firstName: tm.user.firstName,
        lastName: tm.user.lastName,
        role: tm.role,
        isOwner: false,
        isActive: tm.isActive,
        acceptedAt: tm.acceptedAt,
        invitedBy: tm.inviter,
        createdAt: tm.createdAt
      }))
    ];
    
    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team members',
      message: error.message 
    });
  }
});

// Invite user to store
router.post('/:storeId/invite', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId);
    const { email, role = 'STAFF' } = req.body;
    
    // Check if user is owner or admin
    const permission = await checkStorePermission(userId, storeId, 'ADMIN');
    if (!permission.hasPermission && !permission.isOwner) {
      return res.status(403).json({ error: 'Only owners and admins can invite users' });
    }
    
    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }
    
    // Check if user is already part of the store
    const existingMember = await prisma.storeUser.findUnique({
      where: {
        storeId_userId: {
          storeId,
          userId: invitedUser.id
        }
      }
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'User is already part of this store' });
    }
    
    // Create invitation
    const invitation = await prisma.storeUser.create({
      data: {
        storeId,
        userId: invitedUser.id,
        role,
        invitedBy: userId,
        acceptedAt: new Date() // Auto-accept for now, can be changed to require acceptance
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.status(201).json(invitation);
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ 
      error: 'Failed to invite user',
      message: error.message 
    });
  }
});

// Update user role
router.patch('/:storeId/team/:teamUserId/role', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId);
    const teamUserId = parseInt(req.params.teamUserId);
    const { role } = req.body;
    
    // Check if user is owner or admin
    const permission = await checkStorePermission(userId, storeId, 'ADMIN');
    if (!permission.hasPermission && !permission.isOwner) {
      return res.status(403).json({ error: 'Only owners and admins can update roles' });
    }
    
    // Update role
    const updatedMember = await prisma.storeUser.update({
      where: {
        storeId_userId: {
          storeId,
          userId: teamUserId
        }
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.json(updatedMember);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ 
      error: 'Failed to update role',
      message: error.message 
    });
  }
});

// Remove user from store
router.delete('/:storeId/team/:teamUserId', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId);
    const teamUserId = parseInt(req.params.teamUserId);
    
    // Check if user is owner or admin
    const permission = await checkStorePermission(userId, storeId, 'ADMIN');
    if (!permission.hasPermission && !permission.isOwner) {
      return res.status(403).json({ error: 'Only owners and admins can remove users' });
    }
    
    // Remove user
    await prisma.storeUser.delete({
      where: {
        storeId_userId: {
          storeId,
          userId: teamUserId
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({ 
      error: 'Failed to remove user',
      message: error.message 
    });
  }
});

export default router;

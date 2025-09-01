import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/unified-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all custom fields for a store
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
    // Get user's store
    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const customFields = await prisma.customField.findMany({
      where: {
        storeId: store.id,
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json({
      success: true,
      data: customFields
    });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new custom field
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const {
      name,
      label,
      type,
      isRequired,
      placeholder,
      helpText,
      defaultValue,
      options,
      validation
    } = req.body;

    // Get user's store
    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const customField = await prisma.customField.create({
      data: {
        storeId: store.id,
        name,
        label,
        type,
        isRequired: isRequired || false,
        placeholder,
        helpText,
        defaultValue,
        options,
        validation
      }
    });

    res.status(201).json(customField);
  } catch (error) {
    console.error('Error creating custom field:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Custom field with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update a custom field
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const customFieldId = parseInt(req.params.id);
    const {
      label,
      type,
      isRequired,
      placeholder,
      helpText,
      defaultValue,
      options,
      validation,
      isActive
    } = req.body;

    // Get user's store
    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if custom field belongs to user's store
    const existingField = await prisma.customField.findFirst({
      where: {
        id: customFieldId,
        storeId: store.id
      }
    });

    if (!existingField) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    const customField = await prisma.customField.update({
      where: { id: customFieldId },
      data: {
        label,
        type,
        isRequired,
        placeholder,
        helpText,
        defaultValue,
        options,
        validation,
        isActive
      }
    });

    res.json(customField);
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a custom field
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const customFieldId = parseInt(req.params.id);

    // Get user's store
    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if custom field belongs to user's store
    const existingField = await prisma.customField.findFirst({
      where: {
        id: customFieldId,
        storeId: store.id
      }
    });

    if (!existingField) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    await prisma.customField.delete({
      where: { id: customFieldId }
    });

    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 
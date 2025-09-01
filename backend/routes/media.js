import express from 'express';
import multer from 'multer';
import s3Service from '../services/aws/s3.js';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/unified-auth.js';

const router = express.Router();

// Get all media for a store
router.get('/store/:storeId', requireAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { folder, page = 1, limit = 20, search } = req.query;
    const userId = req.authenticatedUser.id;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build where clause
    const where = {
      storeId: parseInt(storeId)
    };

    if (folder && folder !== 'all') {
      where.folder = folder;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get media with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.media.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        folderStats: { all: total } // Simplified for now
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
});

// Configure multer for memory storage with Hebrew filename support
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Fix Hebrew filename encoding
    if (file.originalname) {
      try {
        // Decode the filename properly for Hebrew characters
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      } catch (error) {
        console.log('Filename encoding fix failed, using original:', error.message);
      }
    }
    
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Upload single file for store
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { storeId, folder = 'media' } = req.body;
    const userId = req.authenticatedUser.id;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    console.log(`📤 Uploading file for store: ${store.slug}`);
    const result = await s3Service.uploadFileForStore(req.file, store.slug, folder);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Save to database
    const mediaRecord = await prisma.media.create({
      data: {
        storeId: parseInt(storeId),
        filename: result.key.split('/').pop(), // Extract filename from S3 key
        originalFilename: req.file.originalname,
        mimeType: result.convertedToWebP ? 'image/webp' : req.file.mimetype,
        fileSize: req.file.size,
        s3Key: result.key,
        s3Url: result.url,
        altText: ''
      }
    });

    res.json({
      success: true,
      data: {
        ...result,
        id: mediaRecord.id,
        originalName: mediaRecord.originalFilename,
        size: mediaRecord.fileSize
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files for store
router.post('/upload-multiple', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { storeId, folder = 'media' } = req.body;
    const userId = req.authenticatedUser.id;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    console.log(`📤 Uploading ${req.files.length} files for store: ${store.slug}`);
    
    const results = [];
    const mediaRecords = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const result = await s3Service.uploadFileForStore(file, store.slug, folder);
      results.push(result);
      
      // Save successful uploads to database
      if (result.success) {
        try {
          const mediaRecord = await prisma.media.create({
            data: {
              storeId: parseInt(storeId),
              filename: result.key.split('/').pop(), // Extract filename from S3 key
              originalFilename: file.originalname,
              mimeType: result.convertedToWebP ? 'image/webp' : file.mimetype,
              fileSize: file.size,
              s3Key: result.key,
              s3Url: result.url,
              altText: ''
            }
          });
          
          // Add database info to result
          result.id = mediaRecord.id;
          result.originalName = mediaRecord.originalFilename;
          result.size = mediaRecord.fileSize;
          
          mediaRecords.push(mediaRecord);
        } catch (dbError) {
          console.error('Database save error:', dbError);
          result.success = false;
          result.error = 'Failed to save to database';
        }
      }
    }

    // Filter successful uploads
    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);

    if (failedUploads.length > 0) {
      console.warn(`⚠️ ${failedUploads.length} uploads failed`);
    }

    res.json({
      success: true,
      data: successfulUploads,
      failed: failedUploads,
      summary: {
        total: req.files.length,
        successful: successfulUploads.length,
        failed: failedUploads.length
      }
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Delete media by ID
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.authenticatedUser.id;

    // Get media record
    const mediaRecord = await prisma.media.findUnique({
      where: { id: parseInt(id) },
      include: { store: true }
    });

    console.log('🔍 Delete media debug:', {
      mediaId: id,
      userId: userId,
      mediaRecord: mediaRecord ? {
        id: mediaRecord.id,
        storeId: mediaRecord.storeId,
        store: mediaRecord.store ? {
          id: mediaRecord.store.id,
          userId: mediaRecord.store.userId
        } : null
      } : null
    });

    if (!mediaRecord) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Check if user owns the store
    if (mediaRecord.store.userId !== userId) {
      console.log('❌ Access denied:', {
        storeUserId: mediaRecord.store.userId,
        requestUserId: userId
      });
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from S3
    await s3Service.deleteFile(mediaRecord.s3Key);

    // Delete from database
    await prisma.media.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Delete file by key (legacy)
router.delete('/delete/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    await s3Service.deleteFile(key);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Delete multiple files
router.delete('/delete-multiple', requireAuth, async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({ error: 'Keys array is required' });
    }

    await s3Service.deleteMultipleFiles(keys);

    res.json({
      success: true,
      message: 'Files deleted successfully'
    });
  } catch (error) {
    console.error('Multiple delete error:', error);
    res.status(500).json({ error: 'Failed to delete files' });
  }
});

// Get presigned URL for direct upload
router.post('/presigned-url', requireAuth, async (req, res) => {
  try {
    const { fileName, folder = 'products' } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const key = `${folder}/${Date.now()}-${fileName}`;
    const presignedUrl = s3Service.generatePresignedUrl(key);

    res.json({
      success: true,
      data: {
        presignedUrl,
        key,
        bucket: s3Service.bucketName
      }
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

// Fix Hebrew filenames in database
router.post('/fix-hebrew-filenames', requireAuth, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
    // Get all media for user's stores
    const userStores = await prisma.store.findMany({
      where: { userId: userId }
    });
    
    const storeIds = userStores.map(store => store.id);
    
    const mediaItems = await prisma.media.findMany({
      where: {
        storeId: { in: storeIds }
      }
    });
    
    let fixedCount = 0;
    
    for (const item of mediaItems) {
      try {
        // Try to fix the filename encoding
        const fixedFilename = Buffer.from(item.originalFilename, 'latin1').toString('utf8');
        
        // Only update if the filename actually changed
        if (fixedFilename !== item.originalFilename) {
          await prisma.media.update({
            where: { id: item.id },
            data: { originalFilename: fixedFilename }
          });
          fixedCount++;
          console.log(`Fixed filename: ${item.originalFilename} -> ${fixedFilename}`);
        }
      } catch (error) {
        console.log(`Could not fix filename for media ${item.id}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} filenames`,
      fixedCount
    });
  } catch (error) {
    console.error('Fix filenames error:', error);
    res.status(500).json({ error: 'Failed to fix filenames' });
  }
});

// Get file info
router.get('/info/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const fileInfo = await s3Service.getFileInfo(key);

    res.json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

export default router; 
import express from 'express';
import multer from 'multer';
import s3Service from '../services/s3Service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Upload single file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = req.body.folder || 'products';
    const result = await s3Service.uploadFile(req.file, folder);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
router.post('/upload-multiple', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const folder = req.body.folder || 'products';
    const results = await s3Service.uploadMultipleFiles(req.files, folder);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Delete file
router.delete('/delete/:key', authenticateToken, async (req, res) => {
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
router.delete('/delete-multiple', authenticateToken, async (req, res) => {
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
router.post('/presigned-url', authenticateToken, async (req, res) => {
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

// Get file info
router.get('/info/:key', authenticateToken, async (req, res) => {
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
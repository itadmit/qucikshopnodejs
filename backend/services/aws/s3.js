import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

class S3Service {
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET;
  }

  /**
   * Upload file to S3 and convert to WebP if it's an image
   */
  async uploadFile(file, key, options = {}) {
    try {
      let buffer = file.buffer;
      let contentType = file.mimetype;

      // Convert images to WebP for optimization
      if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
        buffer = await sharp(file.buffer)
          .webp({ quality: 85 })
          .toBuffer();
        contentType = 'image/webp';
        // Update key to have .webp extension
        key = key.replace(/\.[^/.]+$/, '.webp');
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ...options,
      });

      const result = await this.client.send(command);
      
      return {
        success: true,
        key,
        url: `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        etag: result.ETag,
      };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return { success: true };
    } catch (error) {
      console.error('S3 Delete Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return { success: true, url };
    } catch (error) {
      console.error('S3 Signed URL Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate unique file key
   */
  generateKey(originalName, prefix = 'uploads') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `${prefix}/${timestamp}-${random}.${extension}`;
  }
}

export default new S3Service();

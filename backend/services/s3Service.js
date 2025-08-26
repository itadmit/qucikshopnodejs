import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET;
  }

  async uploadFile(file, folder = 'products') {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${uuidv4()}${fileExtension}`;
      
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      };

      const result = await this.s3.upload(params).promise();
      
      return {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async uploadMultipleFiles(files, folder = 'products') {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('S3 multiple upload error:', error);
      throw new Error('Failed to upload files to S3');
    }
  }

  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  async deleteMultipleFiles(keys) {
    try {
      const deletePromises = keys.map(key => this.deleteFile(key));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('S3 multiple delete error:', error);
      throw new Error('Failed to delete files from S3');
    }
  }

  generatePresignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      return this.s3.getSignedUrl('putObject', params);
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async getFileInfo(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await this.s3.headObject(params).promise();
      return {
        key,
        size: result.ContentLength,
        mimeType: result.ContentType,
        lastModified: result.LastModified,
        metadata: result.Metadata
      };
    } catch (error) {
      console.error('S3 get file info error:', error);
      throw new Error('Failed to get file info from S3');
    }
  }
}

export default new S3Service(); 
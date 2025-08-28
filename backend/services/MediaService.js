import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';
import s3Service from './s3Service.js';

const prisma = new PrismaClient();

/**
 * שירות מרכזי לניהול מדיה
 * מטפל בהעלאה, עיבוד ומחיקת קבצי מדיה
 */
export class MediaService {

  /**
   * העלאת קובץ יחיד
   */
  static async uploadSingleFile(file, folder = 'products', storeId, userId) {
    console.log('📤 Uploading single file:', file.originalname);

    try {
      // בדיקת הרשאות
      await this.verifyStoreAccess(storeId, userId);

      // העלאה ל-S3
      const uploadResult = await s3Service.uploadFile(file, folder);

      // שמירה במסד הנתונים
      const mediaRecord = await prisma.media.create({
        data: {
          storeId: parseInt(storeId),
          filename: uploadResult.key.split('/').pop(),
          originalFilename: uploadResult.originalName,
          mimeType: uploadResult.mimeType,
          fileSize: uploadResult.size,
          width: null, // TODO: חילוץ מידות תמונה
          height: null,
          s3Key: uploadResult.key,
          s3Url: uploadResult.url,
          altText: null
        }
      });

      // הפעלת אירוע
      systemEvents.emitEvent('media.uploaded', {
        media: mediaRecord,
        uploadedBy: userId
      });

      console.log('✅ File uploaded successfully:', mediaRecord.id);
      return mediaRecord;

    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  /**
   * העלאת קבצים מרובים
   */
  static async uploadMultipleFiles(files, folder = 'products', storeId, userId) {
    console.log('📤 Uploading multiple files:', files.length);

    try {
      // בדיקת הרשאות
      await this.verifyStoreAccess(storeId, userId);

      const results = [];

      for (const file of files) {
        try {
          const result = await this.uploadSingleFile(file, folder, storeId, userId);
          results.push(result);
        } catch (error) {
          console.error('❌ Failed to upload file:', file.originalname, error);
          // ממשיך לקובץ הבא במקום לעצור
        }
      }

      console.log('✅ Multiple files uploaded:', results.length);
      return results;

    } catch (error) {
      console.error('❌ Multiple upload failed:', error);
      throw error;
    }
  }

  /**
   * מחיקת קובץ מדיה
   */
  static async deleteMedia(mediaId, userId) {
    console.log('🗑️ Deleting media:', mediaId);

    try {
      // קבלת פרטי הקובץ
      const media = await prisma.media.findUnique({
        where: { id: mediaId },
        include: {
          productMedia: {
            include: {
              product: true
            }
          }
        }
      });

      if (!media) {
        throw new Error('Media not found');
      }

      // בדיקת הרשאות
      await this.verifyStoreAccess(media.storeId, userId);

      // בדיקה אם הקובץ בשימוש
      if (media.productMedia.length > 0) {
        throw new Error('Cannot delete media that is in use by products');
      }

      // מחיקה מ-S3
      try {
        await s3Service.deleteFile(media.s3Key);
      } catch (s3Error) {
        console.warn('⚠️ Failed to delete from S3:', s3Error);
        // ממשיך למחיקה מהמסד נתונים גם אם S3 נכשל
      }

      // מחיקה ממסד הנתונים
      await prisma.media.delete({
        where: { id: mediaId }
      });

      // הפעלת אירוע
      systemEvents.emitEvent('media.deleted', {
        media,
        deletedBy: userId
      });

      console.log('✅ Media deleted successfully:', mediaId);

    } catch (error) {
      console.error('❌ Delete media failed:', error);
      throw error;
    }
  }

  /**
   * מחיקת קבצים מרובים
   */
  static async deleteMultipleMedia(mediaIds, userId) {
    console.log('🗑️ Deleting multiple media files:', mediaIds.length);

    const results = [];

    for (const mediaId of mediaIds) {
      try {
        await this.deleteMedia(mediaId, userId);
        results.push({ mediaId, success: true });
      } catch (error) {
        console.error('❌ Failed to delete media:', mediaId, error);
        results.push({ mediaId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * קבלת מידע על קובץ מדיה
   */
  static async getMediaInfo(mediaId, userId) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        productMedia: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!media) {
      throw new Error('Media not found');
    }

    // בדיקת הרשאות
    await this.verifyStoreAccess(media.storeId, userId);

    return media;
  }

  /**
   * קבלת רשימת קבצי מדיה לחנות
   */
  static async getStoreMedia(storeId, userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      type = null, // 'IMAGE' או 'VIDEO'
      search = null
    } = options;

    // בדיקת הרשאות
    await this.verifyStoreAccess(storeId, userId);

    const where = { storeId: parseInt(storeId) };

    if (type) {
      where.mimeType = {
        startsWith: type.toLowerCase() + '/'
      };
    }

    if (search) {
      where.OR = [
        { originalFilename: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          productMedia: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.media.count({ where })
    ]);

    return {
      media,
      total,
      hasMore: offset + limit < total
    };
  }

  /**
   * עדכון פרטי קובץ מדיה
   */
  static async updateMediaInfo(mediaId, updateData, userId) {
    console.log('📝 Updating media info:', mediaId);

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      throw new Error('Media not found');
    }

    // בדיקת הרשאות
    await this.verifyStoreAccess(media.storeId, userId);

    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        altText: updateData.altText ?? media.altText,
        // ניתן להוסיף שדות נוספים כמו tags, description וכו'
      }
    });

    // הפעלת אירוע
    systemEvents.emitEvent('media.updated', {
      media: updatedMedia,
      previousData: media,
      updatedBy: userId
    });

    console.log('✅ Media info updated:', mediaId);
    return updatedMedia;
  }

  /**
   * יצירת URL חתום להעלאה ישירה
   */
  static async generatePresignedUrl(fileName, folder = 'products', storeId, userId) {
    // בדיקת הרשאות
    await this.verifyStoreAccess(storeId, userId);

    const key = `${folder}/${Date.now()}-${fileName}`;
    const presignedUrl = s3Service.generatePresignedUrl(key);

    return {
      presignedUrl,
      key,
      bucket: s3Service.bucketName
    };
  }

  /**
   * אופטימיזציה של תמונות
   */
  static async optimizeImage(mediaId, userId) {
    // TODO: יישום אופטימיזציה של תמונות
    // ניתן להשתמש בשירותים כמו Sharp או ImageMagick
    console.log('🔧 Image optimization not implemented yet for:', mediaId);
  }

  /**
   * יצירת thumbnails
   */
  static async generateThumbnails(mediaId, sizes = [150, 300, 600], userId) {
    // TODO: יישום יצירת thumbnails
    console.log('🖼️ Thumbnail generation not implemented yet for:', mediaId);
  }

  /**
   * ניתוח שימוש במדיה
   */
  static async getMediaUsageStats(storeId, userId) {
    // בדיקת הרשאות
    await this.verifyStoreAccess(storeId, userId);

    const [totalFiles, totalSize, typeBreakdown, unusedFiles] = await Promise.all([
      // סך כל הקבצים
      prisma.media.count({
        where: { storeId: parseInt(storeId) }
      }),

      // סך כל הגודל
      prisma.media.aggregate({
        where: { storeId: parseInt(storeId) },
        _sum: { fileSize: true }
      }),

      // פילוח לפי סוג
      prisma.media.groupBy({
        by: ['mimeType'],
        where: { storeId: parseInt(storeId) },
        _count: { id: true },
        _sum: { fileSize: true }
      }),

      // קבצים לא בשימוש
      prisma.media.count({
        where: {
          storeId: parseInt(storeId),
          productMedia: {
            none: {}
          }
        }
      })
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.fileSize || 0,
      typeBreakdown,
      unusedFiles,
      averageFileSize: totalFiles > 0 ? (totalSize._sum.fileSize || 0) / totalFiles : 0
    };
  }

  /**
   * ניקוי קבצים לא בשימוש
   */
  static async cleanupUnusedMedia(storeId, userId, dryRun = true) {
    console.log('🧹 Cleaning up unused media for store:', storeId);

    // בדיקת הרשאות
    await this.verifyStoreAccess(storeId, userId);

    const unusedMedia = await prisma.media.findMany({
      where: {
        storeId: parseInt(storeId),
        productMedia: {
          none: {}
        },
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // ישן מ-7 ימים
        }
      }
    });

    if (dryRun) {
      console.log(`🔍 Found ${unusedMedia.length} unused media files (dry run)`);
      return {
        count: unusedMedia.length,
        files: unusedMedia,
        deleted: false
      };
    }

    // מחיקה בפועל
    const deletedIds = [];
    for (const media of unusedMedia) {
      try {
        await this.deleteMedia(media.id, userId);
        deletedIds.push(media.id);
      } catch (error) {
        console.error('❌ Failed to delete unused media:', media.id, error);
      }
    }

    console.log(`✅ Deleted ${deletedIds.length} unused media files`);
    return {
      count: deletedIds.length,
      deletedIds,
      deleted: true
    };
  }

  /**
   * בדיקת הרשאות גישה לחנות
   */
  static async verifyStoreAccess(storeId, userId) {
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      throw new Error('Access denied to store');
    }

    return storeUser;
  }
}

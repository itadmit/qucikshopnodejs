import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * סקריפט לאתחול תבנית Jupiter במסד הנתונים
 */
async function seedJupiterTemplate() {
  try {
    console.log('🌱 Starting Jupiter template seeding...');

    // נתיב לתבנית Jupiter
    const jupiterPath = path.join(__dirname, '../../frontend/src/store/templates/jupiter');
    
    // קריאת קבצי התבנית
    const configPath = path.join(jupiterPath, 'config/jupiter-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // קריאת תרגומים
    const heTranslations = JSON.parse(fs.readFileSync(
      path.join(jupiterPath, 'locales/he.json'), 'utf8'
    ));
    const enTranslations = JSON.parse(fs.readFileSync(
      path.join(jupiterPath, 'locales/en.json'), 'utf8'
    ));

    // מבנה קבצי התבנית (לא נקרא את התוכן האמיתי כי הוא גדול מדי)
    const templateFiles = {
      components: {
        'JupiterHeader.jsx': 'Header component for Jupiter template',
        'JupiterFooter.jsx': 'Footer component for Jupiter template',
        'JupiterProductCard.jsx': 'Product card component for Jupiter template',
        'JupiterCategoryCard.jsx': 'Category card component for Jupiter template'
      },
      pages: {
        'JupiterHomePage.jsx': 'Home page component for Jupiter template',
        'JupiterCategoryPage.jsx': 'Category page component for Jupiter template',
        'JupiterProductPage.jsx': 'Product page component for Jupiter template'
      },
      styles: {
        'jupiter.css': 'Main stylesheet for Jupiter template'
      },
      locales: {
        'he.json': heTranslations,
        'en.json': enTranslations
      },
      config: {
        'jupiter-config.json': config
      }
    };

    // בדיקה אם התבנית כבר קיימת
    const existingTemplate = await prisma.template.findUnique({
      where: { name: 'jupiter' }
    });

    if (existingTemplate) {
      console.log('📝 Jupiter template already exists, updating...');
      
      const updatedTemplate = await prisma.template.update({
        where: { name: 'jupiter' },
        data: {
          displayName: config.displayName,
          description: config.description,
          version: config.version,
          isPremium: config.isPremium,
          files: templateFiles,
          config: config,
          author: config.author,
          thumbnail: config.thumbnail,
          tags: config.features, // משתמש ב-features כ-tags
          category: config.category,
          price: 0
        }
      });

      console.log('✅ Jupiter template updated successfully:', updatedTemplate.id);
    } else {
      console.log('🆕 Creating new Jupiter template...');
      
      const newTemplate = await prisma.template.create({
        data: {
          name: 'jupiter',
          displayName: config.displayName,
          description: config.description,
          version: config.version,
          isPremium: config.isPremium,
          files: templateFiles,
          config: config,
          author: config.author,
          thumbnail: config.thumbnail,
          tags: config.features, // משתמש ב-features כ-tags
          category: config.category,
          price: 0
        }
      });

      console.log('✅ Jupiter template created successfully:', newTemplate.id);
    }

    // עדכון חנויות קיימות שמשתמשות ב-Jupiter
    const jupiterStores = await prisma.store.findMany({
      where: { templateName: 'jupiter' }
    });

    if (jupiterStores.length > 0) {
      console.log(`🔄 Updating ${jupiterStores.length} stores to use the new template system...`);
      
      const template = await prisma.template.findUnique({
        where: { name: 'jupiter' }
      });

      await prisma.store.updateMany({
        where: { templateName: 'jupiter' },
        data: { templateId: template.id }
      });

      console.log('✅ Stores updated successfully');
    }

    console.log('🎉 Jupiter template seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding Jupiter template:', error);
    throw error;
  }
}

// הרצה אם הקובץ מופעל ישירות
if (import.meta.url === `file://${process.argv[1]}`) {
  seedJupiterTemplate()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedJupiterTemplate;

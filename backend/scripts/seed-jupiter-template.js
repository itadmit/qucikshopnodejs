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

    // קריאת תוכן הקבצים האמיתיים
    const readFileContent = (filePath) => {
      try {
        return fs.readFileSync(filePath, 'utf8');
      } catch (error) {
        console.warn(`Warning: Could not read file ${filePath}, using placeholder`);
        return `// Placeholder for ${path.basename(filePath)}`;
      }
    };

    // מבנה קבצי התבנית עם תוכן אמיתי
    const templateFiles = {
      components: {
        'JupiterHeader.jsx': readFileContent(path.join(jupiterPath, 'components/JupiterHeader.jsx')),
        'JupiterFooter.jsx': readFileContent(path.join(jupiterPath, 'components/JupiterFooter.jsx')),
        'JupiterProductCard.jsx': readFileContent(path.join(jupiterPath, 'components/JupiterProductCard.jsx')),
        'JupiterCategoryCard.jsx': readFileContent(path.join(jupiterPath, 'components/JupiterCategoryCard.jsx'))
      },
      pages: {
        'JupiterHomePage.jsx': readFileContent(path.join(jupiterPath, 'pages/JupiterHomePage.jsx')),
        'JupiterCategoryPage.jsx': readFileContent(path.join(jupiterPath, 'pages/JupiterCategoryPage.jsx')),
        'JupiterProductPage.jsx': readFileContent(path.join(jupiterPath, 'pages/JupiterProductPage.jsx'))
      },
      styles: {
        'jupiter.css': readFileContent(path.join(jupiterPath, 'styles/jupiter.css'))
      },
      locales: {
        'he.json': JSON.stringify(heTranslations, null, 2),
        'en.json': JSON.stringify(enTranslations, null, 2)
      },
      config: {
        'jupiter-config.json': JSON.stringify(config, null, 2)
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

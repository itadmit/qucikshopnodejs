import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './lib/prisma.js';
import { EventHandlers } from './services/EventHandlers.js';

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import storeRoutes from './routes/stores.js';
import notificationRoutes from './routes/notifications.js';
import storeUsersRoutes from './routes/store-users.js';
import mediaRoutes from './routes/media.js';
import productRoutes from './routes/products.js';
import customFieldsRoutes from './routes/custom-fields.js';
import orderRoutes from './routes/orders.js';
import analyticsRoutes from './routes/analytics.js';
import pixelsRoutes from './routes/pixels.js';
import couponsRoutes from './routes/coupons.js';
import influencersRoutes from './routes/influencers.js';
import automaticDiscountsRoutes from './routes/automatic-discounts.js';
import influencerAuthRoutes from './routes/influencer-auth.js';
import influencerDashboardRoutes from './routes/influencer-dashboard.js';
import partnersRoutes from './routes/partners.js';
import templatesRoutes from './routes/templates.js';
import emailTemplatesRoutes from './routes/email-templates.js';
import customPagesRoutes from './routes/custom-pages.js';
import globalSettingsRoutes from './routes/global-settings.js';
import menusRoutes from './routes/menus.js';
import pagesRoutes from './routes/pages.js';

// Load environment variables
dotenv.config();

// Initialize event handlers
EventHandlers.initialize();

// Initialize analytics cron jobs in production
if (process.env.NODE_ENV === 'production') {
  import('./scripts/analytics-cron.js');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false,
  contentSecurityPolicy: false,
  hsts: false
}));
// Build CORS origins from environment variables
const buildCorsOrigins = () => {
  const origins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ];

  // Add development domains if in development
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://api.localhost:3001',
      // Support for subdomain stores in development
      /^http:\/\/.*\.localhost:5173$/,
      // Legacy support
      'http://localhost:3000',
      'http://localhost:3001'
    );
  } else {
    // Production domains
    const mainDomain = 'my-quickshop.com';
    
    origins.push(
      `https://${mainDomain}`,
      `https://www.${mainDomain}`,
      // Support for subdomain stores in production
      new RegExp(`^https:\\/\\/.*\\.${mainDomain.replace('.', '\\.')}$`)
    );
  }

  return origins;
};

app.use(cors({
  origin: [
    ...buildCorsOrigins(),
    // Legacy localhost patterns (for backward compatibility)
    'http://yogevstore.localhost:5173',
    'http://yogevstore.localhost:5174',
    'http://yogevstore.localhost:5175',
    /^http:\/\/.*\.localhost:5173$/,
    /^http:\/\/.*\.localhost:5174$/,
    /^http:\/\/.*\.localhost:5175$/,
    // S3 static website hosting
    'https://quickshop3.s3.eu-central-1.amazonaws.com',
    'http://quickshop3.s3.eu-central-1.amazonaws.com',
    'https://quickshop3.s3-website-eu-central-1.amazonaws.com',
    'http://quickshop3.s3-website-eu-central-1.amazonaws.com'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to detect API subdomain
app.use((req, res, next) => {
  const host = req.get('host');
  const isApiSubdomain = host && host.startsWith('api.');
  req.isApiRequest = isApiSubdomain;
  next();
});

// Custom headers to prevent HTTPS redirects and mixed content issues
app.use((req, res, next) => {
  // Remove any headers that might cause HTTPS redirects
  res.removeHeader('Strict-Transport-Security');
  res.removeHeader('Upgrade-Insecure-Requests');
  
  // Set headers to allow HTTP content
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: http: https:;");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  next();
});

// Routes
app.get('/api/health', async (req, res) => {
  try {
    // בדיקת חיבור למסד נתונים
    const dbCheck = await prisma.$queryRaw`SELECT 1 as test`;
    
    // מידע על המערכת
    const systemInfo = {
      status: 'OK',
      message: 'QuickShop API is running - Deploy-All System Active! 🚀',
      timestamp: new Date().toISOString(),
      version: '2.1.1',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: {
        status: dbCheck ? 'connected' : 'disconnected',
        type: 'PostgreSQL'
      },
      features: {
        multiTenant: true,
        storeBuilder: true,
        analytics: true,
        deployment: 'production-ready',
        oneCommandDeploy: true
      },
      deployment: {
        lastUpdated: '2025-09-01T13:00:00Z',
        server: 'EC2',
        region: 'eu-central-1',
        deploymentMethod: 'deploy-all.sh'
      }
    };
    
    res.json(systemInfo);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'System health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/store-users', storeUsersRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pixels', pixelsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/influencers', influencersRoutes);
app.use('/api/automatic-discounts', automaticDiscountsRoutes);
app.use('/api/influencer-auth', influencerAuthRoutes);
app.use('/api/influencer-dashboard', influencerDashboardRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);
app.use('/api/custom-pages', customPagesRoutes);
app.use('/api/global-settings', globalSettingsRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/pages', pagesRoutes);

// Serve static files from frontend build
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDistPath));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
});

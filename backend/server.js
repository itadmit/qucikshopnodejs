import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from './lib/prisma.js';

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

// Load environment variables
dotenv.config();

// Initialize analytics cron jobs in production
if (process.env.NODE_ENV === 'production') {
  import('./scripts/analytics-cron.js');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://yogevstore.localhost:5173',
    'http://yogevstore.localhost:5174',
    'http://yogevstore.localhost:5175',
    /^http:\/\/.*\.localhost:5173$/,
    /^http:\/\/.*\.localhost:5174$/,
    /^http:\/\/.*\.localhost:5175$/
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'QuickShop API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

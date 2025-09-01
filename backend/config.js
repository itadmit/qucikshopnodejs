export const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Domain Configuration
  domains: {
    main: process.env.DOMAIN_MAIN || 'localhost',
    api: process.env.DOMAIN_API || 'api.localhost',
    storeExample: process.env.DOMAIN_STORE_EXAMPLE || 'store.localhost'
  },

  // Database Configuration (using DATABASE_URL for production compatibility)
  database: {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production environment');
      }
      return 'dev-jwt-secret-key-for-development-only';
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Security Configuration
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // Email Configuration
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY
  },

  // AWS Configuration (for file uploads)
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET
  },

  // Production-specific
  redis: {
    url: process.env.REDIS_URL
  },
  
  sentry: {
    dsn: process.env.SENTRY_DSN
  }
};

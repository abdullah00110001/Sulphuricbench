
// Environment-specific configuration
export const envConfig = {
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY || ''
  },

  // Third-party Services
  services: {
    analytics: {
      googleAnalyticsId: import.meta.env.VITE_GA_ID || '',
      facebookPixelId: import.meta.env.VITE_FB_PIXEL_ID || ''
    },
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN || ''
    },
    cloudinary: {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''
    }
  },

  // Debug and Logging
  debug: {
    enableConsoleLog: import.meta.env.DEV,
    enableNetworkLog: import.meta.env.DEV,
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info'
  }
} as const

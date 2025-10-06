
// Application-wide configuration
export const appConfig = {
  // App Information
  app: {
    name: 'EduPlatform',
    version: '1.0.0',
    description: 'Online Learning Platform',
    url: process.env.VITE_APP_URL || 'https://your-domain.com',
    supportEmail: 'support@your-domain.com',
    adminEmail: 'admin@your-domain.com'
  },

  // Contact Information
  contact: {
    phone: {
      primary: '+880-1309-878503',
      secondary: '+880-1700-000000',
      whatsapp: '+880-1309-878503',
      formatted: {
        primary: '01309-878503',
        secondary: '01700-000000'
      }
    },
    email: {
      support: 'support@your-domain.com',
      admin: 'admin@your-domain.com',
      sales: 'sales@your-domain.com',
      noreply: 'noreply@your-domain.com'
    },
    address: {
      street: '123 Education Street',
      city: 'Dhaka',
      state: 'Dhaka Division',
      zip: '1000',
      country: 'Bangladesh',
      full: '123 Education Street, Dhaka 1000, Bangladesh'
    }
  },

  // Social Media
  social: {
    facebook: 'https://facebook.com/yourpage',
    twitter: 'https://twitter.com/yourhandle',
    linkedin: 'https://linkedin.com/company/yourcompany',
    youtube: 'https://youtube.com/yourchannel',
    instagram: 'https://instagram.com/yourhandle'
  },

  // Payment Configuration
  payment: {
    bkash: {
      merchantNumber: '01309878503',
      minimumAmount: 100,
      maximumAmount: 100000,
      charges: {
        percentage: 1.85,
        fixed: 5
      }
    },
    sslcommerz: {
      minimumAmount: 50,
      maximumAmount: 500000,
      charges: {
        percentage: 2.5,
        fixed: 0
      }
    },
    currency: {
      code: 'BDT',
      symbol: '৳',
      name: 'Bangladeshi Taka'
    }
  },

  // Features Toggle
  features: {
    enableRegistration: true,
    enableCoupons: true,
    enableReviews: true,
    enableNewsletter: true,
    enableBkashPayment: true,
    enableSSLCommerzPayment: true,
    enableManualPayments: true,
    enableCertificates: true,
    enableDiscussionForum: false,
    enableLiveClasses: false
  },

  // Limits and Pagination
  limits: {
    coursesPerPage: 12,
    studentsPerPage: 20,
    reviewsPerPage: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxImageSize: 2 * 1024 * 1024, // 2MB
    maxVideoSize: 100 * 1024 * 1024, // 100MB
    passwordMinLength: 8,
    usernameMinLength: 3,
    descriptionMaxLength: 500,
    reviewMaxLength: 1000
  }
} as const

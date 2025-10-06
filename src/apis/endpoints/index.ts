
// API endpoints configuration
import { envConfig } from '../config/environment'

const { baseUrl } = envConfig.api

// Base API endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${baseUrl}/auth/login`,
    register: `${baseUrl}/auth/register`,
    logout: `${baseUrl}/auth/logout`,
    refresh: `${baseUrl}/auth/refresh`,
    forgotPassword: `${baseUrl}/auth/forgot-password`,
    resetPassword: `${baseUrl}/auth/reset-password`,
    verifyEmail: `${baseUrl}/auth/verify-email`,
    resendVerification: `${baseUrl}/auth/resend-verification`
  },

  // Users
  users: {
    profile: `${baseUrl}/users/profile`,
    updateProfile: `${baseUrl}/users/profile`,
    changePassword: `${baseUrl}/users/change-password`,
    uploadAvatar: `${baseUrl}/users/avatar`,
    deleteAccount: `${baseUrl}/users/delete-account`
  },

  // Courses
  courses: {
    list: `${baseUrl}/courses`,
    details: (id: string) => `${baseUrl}/courses/${id}`,
    create: `${baseUrl}/courses`,
    update: (id: string) => `${baseUrl}/courses/${id}`,
    delete: (id: string) => `${baseUrl}/courses/${id}`,
    enroll: (id: string) => `${baseUrl}/courses/${id}/enroll`,
    categories: `${baseUrl}/courses/categories`,
    search: `${baseUrl}/courses/search`,
    featured: `${baseUrl}/courses/featured`
  },

  // Payments
  payments: {
    create: `${baseUrl}/payments`,
    verify: `${baseUrl}/payments/verify`,
    history: `${baseUrl}/payments/history`,
    invoice: (id: string) => `${baseUrl}/payments/invoice/${id}`,
    bkash: {
      create: `${baseUrl}/payments/bkash/create`,
      execute: `${baseUrl}/payments/bkash/execute`,
      query: `${baseUrl}/payments/bkash/query`
    },
    sslcommerz: {
      create: `${baseUrl}/payments/sslcommerz/create`,
      success: `${baseUrl}/payments/sslcommerz/success`,
      fail: `${baseUrl}/payments/sslcommerz/fail`,
      cancel: `${baseUrl}/payments/sslcommerz/cancel`,
      ipn: `${baseUrl}/payments/sslcommerz/ipn`
    }
  },

  // Coupons
  coupons: {
    validate: `${baseUrl}/coupons/validate`,
    apply: `${baseUrl}/coupons/apply`,
    list: `${baseUrl}/coupons`,
    create: `${baseUrl}/coupons`,
    update: (id: string) => `${baseUrl}/coupons/${id}`,
    delete: (id: string) => `${baseUrl}/coupons/${id}`
  },

  // Reviews
  reviews: {
    list: `${baseUrl}/reviews`,
    create: `${baseUrl}/reviews`,
    update: (id: string) => `${baseUrl}/reviews/${id}`,
    delete: (id: string) => `${baseUrl}/reviews/${id}`,
    approve: (id: string) => `${baseUrl}/reviews/${id}/approve`,
    reject: (id: string) => `${baseUrl}/reviews/${id}/reject`,
    course: (courseId: string) => `${baseUrl}/reviews/course/${courseId}`
  },

  // File Upload
  upload: {
    image: `${baseUrl}/upload/image`,
    video: `${baseUrl}/upload/video`,
    document: `${baseUrl}/upload/document`,
    avatar: `${baseUrl}/upload/avatar`
  },

  // Admin
  admin: {
    dashboard: `${baseUrl}/admin/dashboard`,
    users: `${baseUrl}/admin/users`,
    courses: `${baseUrl}/admin/courses`,
    payments: `${baseUrl}/admin/payments`,
    analytics: `${baseUrl}/admin/analytics`,
    settings: `${baseUrl}/admin/settings`
  },

  // Newsletter
  newsletter: {
    subscribe: `${baseUrl}/newsletter/subscribe`,
    unsubscribe: `${baseUrl}/newsletter/unsubscribe`,
    send: `${baseUrl}/newsletter/send`,
    templates: `${baseUrl}/newsletter/templates`
  }
} as const

// Supabase Function endpoints
export const SUPABASE_FUNCTIONS = {
  authSignup: '/functions/v1/auth-signup',
  payments: '/functions/v1/payments',
  manageCourses: '/functions/v1/manage-courses',
  manageUsers: '/functions/v1/manage-users',
  manageCoupons: '/functions/v1/manage-coupons',
  sendEmail: '/functions/v1/send-email',
  sendNewsletter: '/functions/v1/send-newsletter',
  uploadFile: '/functions/v1/upload-file',
  generateCertificate: '/functions/v1/generate-certificate',
  verifyEmail: '/functions/v1/verify-email',
  superAdminAuth: '/functions/v1/super-admin-auth',
  superAdminLogin: '/functions/v1/super-admin-login',
  verifySuperAdmin: '/functions/v1/verify-super-admin',
  sslcommerzPayment: '/functions/v1/sslcommerz-payment',
  sslcommerzIpn: '/functions/v1/sslcommerz-ipn',
  newsletterSubscribe: '/functions/v1/newsletter-subscribe',
  fixAnnouncements: '/functions/v1/fix-announcements'
} as const

// External API endpoints
export const EXTERNAL_APIS = {
  // Payment Gateways
  bkash: {
    sandbox: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    production: 'https://tokenized.pay.bka.sh/v1.2.0-beta'
  },
  sslcommerz: {
    sandbox: 'https://sandbox.sslcommerz.com',
    production: 'https://securepay.sslcommerz.com'
  },
  
  // Social Media APIs
  facebook: 'https://graph.facebook.com/v18.0',
  twitter: 'https://api.twitter.com/2',
  linkedin: 'https://api.linkedin.com/v2',
  
  // Analytics
  googleAnalytics: 'https://www.google-analytics.com/mp/collect',
  
  // CDN and Storage
  cloudinary: 'https://api.cloudinary.com/v1_1',
  
  // Notification Services
  pusher: 'https://api.pusherapp.com',
  firebase: 'https://fcm.googleapis.com/fcm/send'
} as const

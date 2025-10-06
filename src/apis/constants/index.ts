
// Application constants
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  COMING_SOON: 'coming_soon'
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

export const PAYMENT_METHODS = {
  BKASH_MANUAL: 'bkash_manual',
  SSLCOMMERZ: 'sslcommerz',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
} as const

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const

export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
} as const

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const

export const COURSE_CATEGORIES = {
  WEB_DEVELOPMENT: 'web_development',
  MOBILE_DEVELOPMENT: 'mobile_development',
  DATA_SCIENCE: 'data_science',
  DESIGN: 'design',
  BUSINESS: 'business',
  MARKETING: 'marketing',
  PHOTOGRAPHY: 'photography',
  MUSIC: 'music',
  LANGUAGE: 'language',
  OTHER: 'other'
} as const

export const FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  VIDEOS: ['mp4', 'webm', 'ogg', 'avi', 'mov'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  ARCHIVES: ['zip', 'rar', '7z', 'tar', 'gz']
} as const

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_BD: /^(\+8801|01)[3-9]\d{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  BKASH_NUMBER: /^(01)[3-9]\d{8}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
} as const

export const DEFAULT_VALUES = {
  AVATAR_URL: '/placeholder.svg',
  COURSE_THUMBNAIL: '/placeholder.svg',
  PAGINATION_LIMIT: 10,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200
} as const

// Type exports for better TypeScript support
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type CourseStatus = typeof COURSE_STATUS[keyof typeof COURSE_STATUS]
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]
export type EnrollmentStatus = typeof ENROLLMENT_STATUS[keyof typeof ENROLLMENT_STATUS]
export type CouponType = typeof COUPON_TYPES[keyof typeof COUPON_TYPES]
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]
export type CourseCategory = typeof COURSE_CATEGORIES[keyof typeof COURSE_CATEGORIES]


// Utility functions that work with the configuration
import { appConfig } from '../config/app'
import { REGEX_PATTERNS, DEFAULT_VALUES } from '../constants'
import { MESSAGES } from '../messages'

// Validation utilities
export const validators = {
  email: (email: string): boolean => REGEX_PATTERNS.EMAIL.test(email),
  
  phone: (phone: string): boolean => REGEX_PATTERNS.PHONE_BD.test(phone),
  
  password: (password: string): boolean => REGEX_PATTERNS.PASSWORD.test(password),
  
  username: (username: string): boolean => REGEX_PATTERNS.USERNAME.test(username),
  
  url: (url: string): boolean => REGEX_PATTERNS.URL.test(url),
  
  bkashNumber: (number: string): boolean => REGEX_PATTERNS.BKASH_NUMBER.test(number),
  
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0
    return value != null && value !== undefined && value !== ''
  }
}

// Formatting utilities
export const formatters = {
  currency: (amount: number): string => {
    return `${appConfig.payment.currency.symbol}${amount.toLocaleString()}`
  },
  
  phone: (phone: string): string => {
    // Format phone number for display
    if (phone.startsWith('+880')) {
      return phone.replace('+880', '0')
    }
    return phone.startsWith('0') ? phone : `0${phone}`
  },
  
  date: (date: string | Date): string => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  },
  
  dateTime: (date: string | Date): string => {
    const d = new Date(date)
    return d.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },
  
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  },
  
  slug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }
}

// URL builders
export const urlBuilders = {
  course: (courseId: string): string => `/courses/${courseId}`,
  
  courseCategory: (category: string): string => `/courses?category=${category}`,
  
  userProfile: (userId: string): string => `/profile/${userId}`,
  
  invoice: (invoiceId: string): string => `/invoice/${invoiceId}`,
  
  writeReview: (courseId: string): string => `/write-review/${courseId}`,
  
  paymentSuccess: (paymentId?: string): string => 
    `/payment/success${paymentId ? `?payment=${paymentId}` : ''}`,
  
  paymentFailed: (error?: string): string => 
    `/payment/failed${error ? `?error=${encodeURIComponent(error)}` : ''}`,
  
  external: {
    whatsapp: (phone: string, message?: string): string => {
      const formattedPhone = phone.replace(/[^\d]/g, '')
      const msg = message ? `&text=${encodeURIComponent(message)}` : ''
      return `https://wa.me/${formattedPhone}${msg}`
    },
    
    email: (email: string, subject?: string, body?: string): string => {
      let url = `mailto:${email}`
      const params = []
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
      if (body) params.push(`body=${encodeURIComponent(body)}`)
      if (params.length > 0) url += `?${params.join('&')}`
      return url
    },
    
    tel: (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`
  }
}

// File utilities
export const fileUtils = {
  getExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  },
  
  isImage: (filename: string): boolean => {
    const ext = fileUtils.getExtension(filename)
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)
  },
  
  isVideo: (filename: string): boolean => {
    const ext = fileUtils.getExtension(filename)
    return ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)
  },
  
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Error handling utilities
export const errorHandlers = {
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.error) return error.error
    return MESSAGES.error.generic
  },
  
  isNetworkError: (error: any): boolean => {
    return !navigator.onLine || 
           error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('network')
  },
  
  isAuthError: (error: any): boolean => {
    return error?.status === 401 || 
           error?.code === 'UNAUTHORIZED' ||
           error?.message?.includes('unauthorized')
  }
}

// Storage utilities
export const storageUtils = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  },
  
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

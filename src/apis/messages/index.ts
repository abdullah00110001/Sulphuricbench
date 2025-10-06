
// User-facing messages and text content
export const MESSAGES = {
  // Success messages
  success: {
    login: 'Successfully logged in!',
    logout: 'Successfully logged out!',
    register: 'Account created successfully! Please check your email for verification.',
    profileUpdate: 'Profile updated successfully!',
    passwordChange: 'Password changed successfully!',
    courseCreated: 'Course created successfully!',
    courseUpdated: 'Course updated successfully!',
    courseDeleted: 'Course deleted successfully!',
    enrollmentSuccess: 'Successfully enrolled in the course!',
    reviewSubmitted: 'Review submitted successfully!',
    couponApplied: 'Coupon applied successfully!',
    paymentSuccess: 'Payment completed successfully!',
    emailSent: 'Email sent successfully!',
    fileUploaded: 'File uploaded successfully!',
    settingsSaved: 'Settings saved successfully!'
  },

  // Error messages
  error: {
    generic: 'Something went wrong. Please try again.',
    networkError: 'Network error. Please check your internet connection.',
    serverError: 'Server error. Please try again later.',
    unauthorized: 'You are not authorized to perform this action.',
    invalidCredentials: 'Invalid email or password.',
    accountNotFound: 'Account not found.',
    emailAlreadyExists: 'An account with this email already exists.',
    invalidEmail: 'Please enter a valid email address.',
    passwordTooShort: 'Password must be at least 8 characters long.',
    passwordMismatch: 'Passwords do not match.',
    invalidPhoneNumber: 'Please enter a valid phone number.',
    fileTooBig: 'File size is too large.',
    unsupportedFileType: 'Unsupported file type.',
    courseNotFound: 'Course not found.',
    alreadyEnrolled: 'You are already enrolled in this course.',
    paymentFailed: 'Payment failed. Please try again.',
    couponInvalid: 'Invalid or expired coupon code.',
    couponAlreadyUsed: 'You have already used this coupon.',
    sessionExpired: 'Your session has expired. Please log in again.',
    accessDenied: 'Access denied. Insufficient permissions.',
    rateLimitExceeded: 'Too many requests. Please wait and try again.',
    validationError: 'Please check your input and try again.',
    uploadFailed: 'File upload failed. Please try again.'
  },

  // Warning messages
  warning: {
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    deleteConfirmation: 'Are you sure you want to delete this? This action cannot be undone.',
    logoutConfirmation: 'Are you sure you want to log out?',
    accountDeletion: 'Are you sure you want to delete your account? This action is permanent.',
    courseUnpublish: 'Are you sure you want to unpublish this course?',
    clearData: 'This will clear all data. Are you sure?',
    expiredSession: 'Your session is about to expire. Do you want to extend it?'
  },

  // Info messages
  info: {
    loading: 'Loading...',
    processing: 'Processing your request...',
    uploading: 'Uploading file...',
    emailVerificationSent: 'Verification email sent. Please check your inbox.',
    passwordResetSent: 'Password reset link sent to your email.',
    coursePublished: 'Course is now published and visible to students.',
    courseDraft: 'Course saved as draft.',
    maintenanceMode: 'Site is under maintenance. Please try again later.',
    featureComingSoon: 'This feature is coming soon!',
    noDataFound: 'No data found.',
    emptySearch: 'No results found for your search.',
    offline: 'You are offline. Some features may not work.',
    online: 'Connection restored.'
  },

  // Form validation messages
  validation: {
    required: 'This field is required.',
    emailInvalid: 'Please enter a valid email address.',
    phoneInvalid: 'Please enter a valid phone number.',
    passwordWeak: 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers.',
    urlInvalid: 'Please enter a valid URL.',
    numberInvalid: 'Please enter a valid number.',
    dateInvalid: 'Please enter a valid date.',
    minLength: (min: number) => `Must be at least ${min} characters long.`,
    maxLength: (max: number) => `Must be no more than ${max} characters long.`,
    minValue: (min: number) => `Value must be at least ${min}.`,
    maxValue: (max: number) => `Value must be no more than ${max}.`,
    confirmPassword: 'Passwords do not match.'
  },

  // Button and action text
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    update: 'Update',
    create: 'Create',
    submit: 'Submit',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    confirm: 'Confirm',
    retry: 'Retry',
    refresh: 'Refresh',
    upload: 'Upload',
    download: 'Download',
    share: 'Share',
    copy: 'Copy',
    print: 'Print',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    preview: 'Preview',
    publish: 'Publish',
    unpublish: 'Unpublish',
    approve: 'Approve',
    reject: 'Reject',
    enable: 'Enable',
    disable: 'Disable',
    login: 'Log In',
    logout: 'Log Out',
    register: 'Register',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    changePassword: 'Change Password',
    viewProfile: 'View Profile',
    editProfile: 'Edit Profile',
    enrollNow: 'Enroll Now',
    learnMore: 'Learn More',
    readMore: 'Read More',
    showMore: 'Show More',
    showLess: 'Show Less',
    contactUs: 'Contact Us',
    getStarted: 'Get Started',
    tryAgain: 'Try Again'
  }
} as const

// Placeholder texts
export const PLACEHOLDERS = {
  search: 'Search courses...',
  email: 'Enter your email',
  password: 'Enter your password',
  confirmPassword: 'Confirm your password',
  fullName: 'Enter your full name',
  phone: 'Enter your phone number',
  message: 'Type your message here...',
  courseTitle: 'Enter course title',
  courseDescription: 'Describe your course...',
  price: 'Enter price',
  couponCode: 'Enter coupon code',
  reviewText: 'Write your review...',
  searchUsers: 'Search users...',
  searchCourses: 'Search courses...',
  selectCategory: 'Select a category',
  selectInstructor: 'Select an instructor',
  selectDate: 'Select a date',
  selectTime: 'Select a time',
  uploadImage: 'Upload an image',
  uploadVideo: 'Upload a video',
  uploadDocument: 'Upload a document'
} as const

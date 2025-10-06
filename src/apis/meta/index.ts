
// Meta information and SEO data
import { appConfig } from '../config/app'

export const META_INFO = {
  // Default meta tags
  default: {
    title: appConfig.app.name,
    description: appConfig.app.description,
    keywords: 'online learning, education, courses, tutorials, skills development',
    author: appConfig.app.name,
    viewport: 'width=device-width, initial-scale=1.0',
    charset: 'UTF-8',
    language: 'en',
    robots: 'index, follow',
    canonical: appConfig.app.url,
    
    // Open Graph
    ogType: 'website',
    ogTitle: appConfig.app.name,
    ogDescription: appConfig.app.description,
    ogImage: `${appConfig.app.url}/img/og-image.jpg`,
    ogUrl: appConfig.app.url,
    ogSiteName: appConfig.app.name,
    
    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterSite: '@yourhandle',
    twitterCreator: '@yourhandle',
    twitterTitle: appConfig.app.name,
    twitterDescription: appConfig.app.description,
    twitterImage: `${appConfig.app.url}/img/twitter-card.jpg`,
    
    // Additional
    themeColor: '#000000',
    msapplicationTileColor: '#000000',
    msapplicationTileImage: `${appConfig.app.url}/img/tile-144x144.png`
  },

  // Page-specific meta data
  pages: {
    home: {
      title: `${appConfig.app.name} - Online Learning Platform`,
      description: 'Learn new skills with our comprehensive online courses. Expert instructors, practical projects, and certificates.',
      keywords: 'online courses, learn programming, web development, mobile app development, data science'
    },
    
    courses: {
      title: `All Courses - ${appConfig.app.name}`,
      description: 'Browse our extensive collection of online courses across various categories. Find the perfect course for your learning goals.',
      keywords: 'online courses, programming courses, web development, mobile development, design courses'
    },
    
    about: {
      title: `About Us - ${appConfig.app.name}`,
      description: 'Learn about our mission to provide quality education and empower learners worldwide with practical skills.',
      keywords: 'about us, online education, learning platform, mission, vision'
    },
    
    contact: {
      title: `Contact Us - ${appConfig.app.name}`,
      description: `Get in touch with us. Contact ${appConfig.app.name} for support, partnerships, or general inquiries.`,
      keywords: 'contact us, support, help, customer service'
    },
    
    login: {
      title: `Login - ${appConfig.app.name}`,
      description: 'Sign in to your account to access your courses and continue learning.',
      keywords: 'login, sign in, account access'
    },
    
    register: {
      title: `Register - ${appConfig.app.name}`,
      description: 'Create your account and start learning with our comprehensive online courses.',
      keywords: 'register, sign up, create account, join'
    },
    
    dashboard: {
      title: `Dashboard - ${appConfig.app.name}`,
      description: 'Your learning dashboard. Access your courses, track progress, and manage your account.',
      keywords: 'dashboard, my courses, learning progress, account'
    },
    
    writeReview: {
      title: `Write Review - ${appConfig.app.name}`,
      description: 'Share your experience and help other students by writing a review.',
      keywords: 'write review, feedback, course review, rating'
    }
  },

  // Dynamic meta generators
  generators: {
    courseDetail: (courseTitle: string, courseDescription: string) => ({
      title: `${courseTitle} - ${appConfig.app.name}`,
      description: courseDescription.length > 155 
        ? `${courseDescription.substring(0, 155)}...` 
        : courseDescription,
      keywords: `${courseTitle}, online course, learn ${courseTitle.toLowerCase()}`,
      ogTitle: `${courseTitle} - ${appConfig.app.name}`,
      ogDescription: courseDescription,
      twitterTitle: `${courseTitle} - ${appConfig.app.name}`,
      twitterDescription: courseDescription
    }),
    
    categoryPage: (categoryName: string) => ({
      title: `${categoryName} Courses - ${appConfig.app.name}`,
      description: `Explore ${categoryName} courses and master new skills with expert-led training.`,
      keywords: `${categoryName.toLowerCase()} courses, ${categoryName.toLowerCase()} training, learn ${categoryName.toLowerCase()}`
    }),
    
    teacherProfile: (teacherName: string, bio: string) => ({
      title: `${teacherName} - Instructor at ${appConfig.app.name}`,
      description: bio.length > 155 ? `${bio.substring(0, 155)}...` : bio,
      keywords: `${teacherName}, instructor, teacher, online courses`
    })
  }
} as const

// Structured data schemas
export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appConfig.app.name,
    url: appConfig.app.url,
    logo: `${appConfig.app.url}/img/logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: appConfig.contact.phone.primary,
      contactType: 'customer service',
      email: appConfig.contact.email.support
    },
    sameAs: [
      appConfig.social.facebook,
      appConfig.social.twitter,
      appConfig.social.linkedin,
      appConfig.social.youtube
    ]
  },
  
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appConfig.app.name,
    url: appConfig.app.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${appConfig.app.url}/courses?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  },
  
  educationalOrganization: {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: appConfig.app.name,
    url: appConfig.app.url,
    description: appConfig.app.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: appConfig.contact.address.street,
      addressLocality: appConfig.contact.address.city,
      addressRegion: appConfig.contact.address.state,
      postalCode: appConfig.contact.address.zip,
      addressCountry: appConfig.contact.address.country
    }
  }
} as const

# Sulphuric Bench - Premium Digital Learning Platform

![Sulphuric Bench Hero Banner](public/screenshots/hero-banner.png)

<p align="center">
  <strong>Empowering Minds Through Quality Education</strong><br>
  A comprehensive, modern Learning Management System built with cutting-edge technologies
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 🚀 Overview

**Sulphuric Bench** is a full-featured Learning Management System (LMS) designed for educational institutions, online course creators, and corporate training programs. Built with React, TypeScript, and Supabase, it provides a seamless learning experience with powerful administrative tools, integrated payment processing, and comprehensive analytics.

### Why Choose Sulphuric Bench?

- 🎓 **Complete Learning Platform** - From course creation to certificate generation
- 💳 **Integrated Payments** - SSLCommerz, bKash, and manual payment support
- 📊 **Advanced Analytics** - Track student progress, revenue, and platform metrics
- 📱 **Mobile Ready** - Full mobile app support with Capacitor
- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark mode
- 🔒 **Enterprise Security** - JWT authentication, RLS policies, email verification

---

## ✨ Features

### 🎓 Learning Management
- ✅ **Course Builder** - Rich multimedia course creation with drag-and-drop
- ✅ **Video Lessons** - Streaming video support with progress tracking
- ✅ **Quizzes & Assignments** - Interactive assessments with auto-grading
- ✅ **Progress Tracking** - Real-time student progress monitoring
- ✅ **Certificates** - Automated PDF certificate generation
- ✅ **Course Categories** - Organized learning paths
- ✅ **Batch Management** - Organize students into cohorts
- ✅ **Reviews & Ratings** - Community feedback system

### 👥 User Management
- ✅ **Multi-Role System** - Students, Teachers, Admins, Super Admins
- ✅ **Secure Authentication** - Email/password with verification
- ✅ **Profile Management** - Complete user profiles with avatars
- ✅ **Teacher Applications** - Streamlined instructor onboarding
- ✅ **User Analytics** - Registration patterns and engagement metrics

### 💳 Payment & Commerce
- ✅ **SSLCommerz Integration** - Credit/debit card payments
- ✅ **bKash Support** - Mobile financial service integration
- ✅ **Manual Payments** - Admin-approved payment processing
- ✅ **Coupon System** - Flexible discount codes with rules
- ✅ **Invoice Generation** - Professional branded PDF invoices
- ✅ **Payment Tracking** - Complete transaction history
- ✅ **Revenue Analytics** - Detailed financial reporting

### 📊 Analytics & Reporting
- ✅ **Dashboard Analytics** - Real-time platform insights
- ✅ **Revenue Tracking** - Daily, monthly, yearly reports
- ✅ **User Metrics** - Signup trends and activity patterns
- ✅ **Course Performance** - Completion rates and popularity
- ✅ **Payment Analytics** - Gateway performance analysis

### 🎨 Modern UI/UX
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark/Light Mode** - Full theme support
- ✅ **Component Library** - Built with shadcn/ui
- ✅ **Accessibility** - WCAG compliant
- ✅ **Beautiful Animations** - Smooth transitions and effects

### 🔧 Administration
- ✅ **Super Admin Panel** - Complete platform control
- ✅ **User Management** - Comprehensive user oversight
- ✅ **Course Management** - Create, edit, publish courses
- ✅ **Content Management** - Announcements, newsletters, FAQs
- ✅ **Payment Settings** - Configure payment gateways
- ✅ **Legal Content** - Terms, privacy policy management
- ✅ **Analytics Dashboard** - Platform-wide insights

---

## 📸 Screenshots & Features

### Homepage
![Homepage](public/screenshots/homepage.png)
*Clean, modern landing page with featured courses and statistics*

### About Page
![About Page](public/screenshots/about-page.png)
*Comprehensive information about the platform and mission*

### Course Catalog
![Courses Page](public/screenshots/courses-page.png)
*Browse and filter available courses by category*

### Course Details
![Course Detail](public/screenshots/course-detail.png)
*Detailed course information with curriculum, instructor, and enrollment options*

### Student Dashboard
![Student Dashboard](public/screenshots/student-dashboard.png)
*Comprehensive student learning hub with progress tracking and analytics*

### Admin Dashboard
![Admin Dashboard](public/screenshots/admin-dashboard.png)
*Powerful administrative interface for platform management*

### Analytics & Reporting
![Analytics](public/screenshots/analytics.png)
*Advanced analytics with revenue tracking and user metrics*

### Payment System
![Payment System](public/screenshots/payment-system.png)
*Secure payment processing with multiple gateway support*

### Mobile Responsive
![Mobile Responsive](public/screenshots/mobile-responsive.png)
*Fully responsive design optimized for all devices*

### Contact Page
![Contact Page](public/screenshots/contact-page.png)
*Easy-to-use contact form and support information*

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | Modern UI library with hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | High-quality components |
| **React Router** | Client-side routing |
| **React Query** | Server state management |
| **Lucide React** | Beautiful SVG icons |

### Backend & Database
| Technology | Purpose |
|-----------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Relational database |
| **Edge Functions** | Serverless API endpoints |
| **Row Level Security** | Database-level security |
| **Real-time** | Live data updates |

### Additional Tools
| Tool | Purpose |
|------|---------|
| **jsPDF** | PDF generation |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |
| **date-fns** | Date utilities |
| **Recharts** | Data visualization |
| **html2canvas** | Screenshot generation |
| **Capacitor** | Native mobile apps |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager
- Supabase account (for backend)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/sulphuric-bench.git
cd sulphuric-bench
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
- Sign up at [Supabase](https://supabase.com)
- Create a new project
- Go to Settings → API
- Copy the Project URL and anon/public key

4. **Database Setup**

Run the migrations in your Supabase project:
```bash
# The migrations are in supabase/migrations/
# You can run them through the Supabase dashboard or CLI
```

5. **Start Development Server**
```bash
npm run dev
# or
bun dev
```

6. **Access the Application**
- Frontend: `http://localhost:5173`
- Super Admin: `http://localhost:5173/super-admin`

---

## 🏗 Project Structure

```
sulphuric-bench/
├── public/                      # Static assets
│   ├── assets/                 # Images and media
│   ├── img/                    # Logos and icons
│   └── screenshots/            # App screenshots
├── src/
│   ├── apis/                   # API client functions
│   │   ├── config/            # API configuration
│   │   ├── endpoints/         # API endpoints
│   │   └── utils/             # API utilities
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── auth/             # Authentication components
│   │   ├── home/             # Landing page sections
│   │   ├── student/          # Student dashboard
│   │   ├── super-admin/      # Admin panel components
│   │   ├── payment/          # Payment components
│   │   ├── reviews/          # Review system
│   │   └── shared/           # Shared components
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx       # Authentication hook
│   │   ├── useMobile.tsx     # Mobile detection
│   │   └── ...               # Other hooks
│   ├── pages/                # Route components
│   │   ├── super-admin/      # Admin pages
│   │   ├── student/          # Student pages
│   │   └── payment/          # Payment pages
│   ├── integrations/         # Third-party integrations
│   │   └── supabase/         # Supabase client
│   ├── utils/                # Utility functions
│   ├── lib/                  # Shared libraries
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── supabase/
│   ├── functions/            # Edge functions
│   └── migrations/           # Database migrations
├── capacitor.config.ts       # Mobile app config
├── tailwind.config.ts        # Tailwind configuration
├── vite.config.ts            # Vite configuration
└── package.json              # Dependencies
```

---

## 🎯 Usage

### For Students

1. **Sign Up**: Create a student account
2. **Browse Courses**: Explore the course catalog
3. **Enroll**: Purchase courses with SSLCommerz or bKash
4. **Learn**: Access video lessons, complete assignments
5. **Track Progress**: Monitor your learning journey
6. **Get Certified**: Download certificates upon completion

### For Instructors(just sulphuric-bench teachers)
1. **Apply**: Submit teacher application
2. **Wait for Approval**: Admin review and approval
3. **Create Courses**: Use the course builder
4. **Manage Students**: Track student progress
5. **View Analytics**: Monitor course performance

### For Administrators

1. **Login**: Access super admin panel at `/super-admin`
2. **Manage Users**: Approve teachers, manage students
3. **Create Content**: Add courses, announcements, FAQs
4. **Process Payments**: Approve manual payments
5. **View Analytics**: Monitor platform metrics
6. **Configure Settings**: Manage payment gateways, legal content

---

## 🔐 Authentication & Security

### User Roles
- **Students** - Course enrollment, progress tracking, certificates
- **Teachers** - Course creation, student management, analytics
- **Super Admins** - Full system access and configuration

### Security Features
- ✅ JWT-based authentication
- ✅ Row-level security (RLS) policies
- ✅ Email verification system
- ✅ Password strength requirements
- ✅ Secure session management
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📱 Mobile App Development

The platform includes full native mobile app support using **Capacitor**.

### Mobile Features
- ✅ **100% Feature Parity** with web version
- ✅ **Native Performance** on iOS and Android
- ✅ **Offline Support** for downloaded content
- ✅ **Push Notifications** (coming soon)
- ✅ **Native Keyboard** and gestures
- ✅ **Splash Screen** and status bar customization

### Building for Mobile

#### Prerequisites
- **Android**: Android Studio + JDK 11+
- **iOS**: Xcode (Mac only) + Apple Developer account

#### Build Steps

1. **Add platforms**
```bash
npx cap add android
npx cap add ios  # Mac only
```

2. **Build and sync**
```bash
npm run build
npx cap sync
```

3. **Open in IDE**
```bash
npx cap open android  # For Android
npx cap open ios      # For iOS
```

4. **Run on device**
```bash
npx cap run android
npx cap run ios
```

See [Mobile Development Guide](https://capacitorjs.com/docs) for details.

---

## 🌟 Key Highlights

### For Students
- 🎓 Affordable, high-quality courses
- ⏰ Flexible learning schedules
- 🏆 Industry-recognized certificates
- 👨‍🎓 Career guidance and mentorship
- 📱 Mobile-optimized experience

### For Educators
- 🛠 Easy course creation tools
- 💰 Revenue sharing opportunities
- 📊 Analytics and insights
- 📢 Marketing support
- 🌍 Global reach platform

### For Institutions
- 🏢 White-label solutions
- 🎨 Custom branding options
- 👥 Bulk user management
- 📈 Advanced reporting


### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📞 Support & Contact

### Get Help
- 📧 **Email**: support@sulphuricbench.com
- 📚 **Documentation**: [docs.sulphuricbench.com](https://docs.sulphuricbench.com)

### Business Inquiries
- 🏢 **Enterprise**: 
- 🤝 **Partnerships**: 
- 📱 **Phone**: 

### Office Location
** HQ**  

---



### Technologies
- [React](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Programming Language
- [Supabase](https://supabase.com/) - Backend Platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [shadcn/ui](https://ui.shadcn.com/) - Component Library
- [Capacitor](https://capacitorjs.com/) - Mobile Framework

---


<p align="center">
  Made with ❤️ by Muhammad Abdullah <br>
  <strong>Empowering Minds Through Quality Education</strong>
</p>

<p align="center">
  <a href="#top">Back to Top ↑</a>
</p>

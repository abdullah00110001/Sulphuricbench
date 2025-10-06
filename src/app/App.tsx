import { useEffect, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PreloaderWrapper } from '@/components/ui/preloader-wrapper'

// Import all your existing pages and components
import Index from '@/pages/Index'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Courses from '@/pages/Courses'
import CourseDetail from '@/pages/CourseDetail'
import Login from '@/pages/Login'
import StudentDashboard from '@/pages/StudentDashboard'
import SuperAdminDashboard from '@/pages/SuperAdminDashboard'
import SuperAdminLayout from '@/pages/SuperAdminLayout'
import AuthCallback from '@/pages/AuthCallback'
import VerifyEmail from '@/pages/VerifyEmail'
import WriteReview from '@/pages/WriteReview'
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'
import InvoicePage from '@/pages/InvoicePage'

// Payment pages
import PaymentSuccess from '@/pages/payment/PaymentSuccess'
import PaymentFailed from '@/pages/payment/PaymentFailed'
import PaymentCancelled from '@/pages/payment/PaymentCancelled'

// Super Admin pages
import AnalyticsPage from '@/pages/super-admin/AnalyticsPage'
import EnhancedAnalyticsPage from '@/pages/super-admin/EnhancedAnalyticsPage'
import AnnouncementsPage from '@/pages/super-admin/AnnouncementsPage'
import CouponsPage from '@/pages/super-admin/CouponsPage'
import CoursesPage from '@/pages/super-admin/CoursesPage'
import FutureCoursesPage from '@/pages/super-admin/FutureCoursesPage'
import InvoicesPage from '@/pages/super-admin/InvoicesPage'
import LegalPage from '@/pages/super-admin/LegalPage'
import ManualPaymentsPage from '@/pages/super-admin/ManualPaymentsPage'
import NewsletterPage from '@/pages/super-admin/NewsletterPage'
import EnhancedNewsletterPage from '@/pages/super-admin/EnhancedNewsletterPage'
import PaymentSettingsPage from '@/pages/super-admin/PaymentSettingsPage'
import PaymentsPage from '@/pages/super-admin/PaymentsPage'
import ProfilePage from '@/pages/super-admin/ProfilePage'
import ReviewsPage from '@/pages/super-admin/ReviewsPage'
import SettingsPage from '@/pages/super-admin/SettingsPage'
import StudentsPage from '@/pages/super-admin/StudentsPage'
import TeachersPage from '@/pages/super-admin/TeachersPage'
import TeachersOnlyPage from '@/pages/super-admin/TeachersOnlyPage'
import UsersPage from '@/pages/super-admin/UsersPage'

// Student dashboard routes
import { StudentLMSRoutes } from '@/pages/student/StudentDashboardRoutes'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const queryClient = new QueryClient()

export function MobileApp() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#0F0F23' })

          // Hide splash screen after initialization
          await SplashScreen.hide()

          // Handle app state changes
          CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive)
          })

          // Handle app URL open (for deep linking)
          CapacitorApp.addListener('appUrlOpen', (event) => {
            console.log('App opened with URL:', event.url)
            // Handle deep linking here if needed
          })

          // Handle back button
          CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapacitorApp.exitApp()
            } else {
              window.history.back()
            }
          })

        } catch (error) {
          console.error('Error initializing mobile app:', error)
        }
      }
      
      setIsInitialized(true)
    }

    initializeApp()
  }, [])

  if (!isInitialized) {
    return <PreloaderWrapper><div>Loading...</div></PreloaderWrapper>
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen mobile-app">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/write-review/:courseId" element={<WriteReview />} />
                <Route path="/invoice/:enrollmentId" element={<InvoicePage />} />

                {/* Payment routes */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failed" element={<PaymentFailed />} />
                <Route path="/payment/cancelled" element={<PaymentCancelled />} />

                {/* Student Dashboard routes */}
                <Route path="/student/*" element={
                  <ProtectedRoute>
                    <StudentLMSRoutes />
                  </ProtectedRoute>
                } />

                {/* Super Admin routes */}
                <Route path="/super-admin" element={<SuperAdminLayout />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="enhanced-analytics" element={<EnhancedAnalyticsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="coupons" element={<CouponsPage />} />
                  <Route path="courses" element={<CoursesPage />} />
                  <Route path="future-courses" element={<FutureCoursesPage />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="legal" element={<LegalPage />} />
                  <Route path="manual-payments" element={<ManualPaymentsPage />} />
                  <Route path="newsletter" element={<NewsletterPage />} />
                  <Route path="enhanced-newsletter" element={<EnhancedNewsletterPage />} />
                  <Route path="payment-setting" element={<Navigate to="/super-admin/payment-settings" replace />} />
                  <Route path="payment-settings" element={<PaymentSettingsPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="teachers" element={<TeachersPage />} />
                  <Route path="teachers-only" element={<TeachersOnlyPage />} />
                  <Route path="users" element={<UsersPage />} />
                </Route>

                {/* Error routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
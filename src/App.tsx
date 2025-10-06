
import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'

import Index from './pages/Index'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import AuthCallback from './pages/AuthCallback'
import VerifyEmail from './pages/VerifyEmail'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import SuperAdminLayout from './pages/SuperAdminLayout'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import EnhancedAnalyticsPage from './pages/super-admin/AnalyticsPage'
import UsersPage from './pages/super-admin/UsersPage'
import StudentsPage from './pages/super-admin/StudentsPage'
import TeachersOnlyPage from './pages/super-admin/TeachersPage'
import CoursesPage from './pages/super-admin/CoursesPage'
import FutureCoursesPage from './pages/super-admin/FutureCoursesPage'
import PaymentsPage from './pages/super-admin/PaymentsPage'
import InvoicesPage from './pages/super-admin/InvoicesPage'
import CouponsPage from './pages/super-admin/CouponsPage'
import ReviewsPage from './pages/super-admin/ReviewsPage'
import EnhancedNewsletterPage from './pages/super-admin/NewsletterPage'
import AnnouncementsPage from './pages/super-admin/AnnouncementsPage'
import FAQPage from './pages/super-admin/FAQPage'
import LegalPage from './pages/super-admin/LegalPage'
import PaymentSettingsPage from './pages/super-admin/PaymentSettingsPage'
import ManualPaymentsPage from './pages/super-admin/ManualPaymentsPage'
import ProfilePage from './pages/super-admin/ProfilePage'
import SettingsPage from './pages/super-admin/SettingsPage'
import WriteReview from './pages/WriteReview'
import InvoicePage from './pages/InvoicePage'
import PaymentSuccess from './pages/payment/PaymentSuccess'
import PaymentFailed from './pages/payment/PaymentFailed'
import PaymentCancelled from './pages/payment/PaymentCancelled'
import { ErrorBoundary } from './components/ErrorBoundary'
import StudentDashboard from './pages/StudentDashboard'
import { AuthPage } from './components/auth/AuthPage'
import { StudentLMSLayout } from './components/student/lms/StudentLMSLayout'
import { CourseContent } from './components/student/CourseContent'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster />
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/course/:courseId/content" element={<CourseContent />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/write-review/:courseId" element={<WriteReview />} />
              <Route path="/invoice/:invoiceId" element={<InvoicePage />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/payment/cancelled" element={<PaymentCancelled />} />

              {/* Legacy Student Dashboard - Old Dashboard */}
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Legacy Student Dashboard - Redirect to new LMS */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentLMSLayout />
                  </ProtectedRoute>
                }
              />
              
              {/* Modern Student LMS Routes */}
              <Route 
                path="/student/newdashboard/*" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentLMSLayout />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route 
                path="/super-admin" 
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SuperAdminDashboard />} />
                <Route path="analytics" element={<EnhancedAnalyticsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="teachers" element={<TeachersOnlyPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="future-courses" element={<FutureCoursesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="manual-payments" element={<ManualPaymentsPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="coupons" element={<CouponsPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="newsletter" element={<EnhancedNewsletterPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="legal" element={<LegalPage />} />
                <Route path="payment-setting" element={<Navigate to="/super-admin/payment-settings" replace />} />
                <Route path="payment-settings" element={<PaymentSettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App

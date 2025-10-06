import { Routes, Route, Navigate } from 'react-router-dom'
import { 
  StudentLMSDashboard, 
  StudentLMSCourses, 
  StudentLMSAssignments 
} from '@/components/student/lms'
import { PaymentHistory } from '@/components/student/PaymentHistory'

export function StudentLMSRoutes() {
  return (
    <Routes>
      <Route index element={<StudentLMSDashboard />} />
      <Route path="courses" element={<StudentLMSCourses />} />
      <Route path="assignments" element={<StudentLMSAssignments />} />
      <Route path="payments" element={<PaymentHistory />} />
      <Route path="exams" element={<div className="p-6">Exams page coming soon...</div>} />
      <Route path="certificates" element={<div className="p-6">Certificates page coming soon...</div>} />
      <Route path="progress" element={<div className="p-6">Progress Report page coming soon...</div>} />
      <Route path="messages" element={<div className="p-6">Messages page coming soon...</div>} />
      <Route path="calendar" element={<div className="p-6">Calendar page coming soon...</div>} />
      <Route path="resources" element={<div className="p-6">Resources page coming soon...</div>} />
      <Route path="profile" element={<div className="p-6">Profile page coming soon...</div>} />
      <Route path="settings" element={<div className="p-6">Settings page coming soon...</div>} />
      <Route path="*" element={<Navigate to="/student/newdashboard" replace />} />
    </Routes>
  )
}
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { StudentLMSRoutes } from '@/pages/student/StudentDashboardRoutes'
import { cn } from '@/lib/utils'
import { StudentLMSHeader } from './StudentLMSHeader'
import { StudentLMSSidebar } from './StudentLMSSidebar'

export function StudentLMSLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <StudentLMSHeader onMenuToggle={() => setMobileSidebarOpen(true)} />
      
      {/* Desktop Sidebar */}
      <StudentLMSSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Mobile Sidebar */}
      <StudentLMSSidebar 
        collapsed={false}
        onToggle={() => {}}
        mobile
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 pt-16",
        "lg:ml-16",
        !sidebarCollapsed && "lg:ml-64"
      )}>
        <div className="container mx-auto px-4 py-6">
          <StudentLMSRoutes />
        </div>
      </main>
    </div>
  )
}

import { useState } from "react"
import { Outlet } from "react-router-dom"
import { SuperAdminSidebar } from "@/components/super-admin/SuperAdminSidebar"
import { MobileSidebar } from "@/components/super-admin/MobileSidebar"
import { MobileHeader } from "@/components/super-admin/MobileHeader"
import { SuperAdminHeader } from "@/components/super-admin/SuperAdminHeader"
import { MobileBottomNav } from "@/components/super-admin/MobileBottomNav"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useEdgeFunctionDiagnostics } from "@/hooks/useEdgeFunctionDiagnostics"

export default function SuperAdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  useEdgeFunctionDiagnostics()

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="min-h-screen flex">
        {/* Desktop Sidebar - Only show on large screens */}
        <div className="hidden lg:block lg:w-64 xl:w-72">
          <SuperAdminSidebar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          {/* Mobile Header - Only show on mobile/tablet */}
          <div className="lg:hidden sticky top-0 z-30 bg-background border-b">
            <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
          </div>
          
          {/* Desktop Header - Only show on desktop */}
          <div className="hidden lg:block sticky top-0 z-30 bg-background border-b">
            <SuperAdminHeader />
          </div>
          
          {/* Main Content with proper spacing and responsive padding */}
          <main className="flex-1 p-2 sm:p-4 lg:p-6 xl:p-8 pb-20 lg:pb-8 overflow-x-auto">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation - Only show on mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </ProtectedRoute>
  )
}

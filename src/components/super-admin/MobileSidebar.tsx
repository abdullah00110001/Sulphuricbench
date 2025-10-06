
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Megaphone,
  FileText,
  BarChart3,
  Settings,
  UserCheck,
  Mail,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Receipt,
  CreditCard,
  Home,
  Search,
  Ticket,
  Smartphone,
  Star,
  User,
  ToggleLeft
} from "lucide-react"

const sidebarItems = [
  {
    title: "Home",
    icon: Home,
    path: "/"
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/super-admin"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/super-admin/analytics"
  },
  {
    title: "Users",
    icon: Users,
    path: "/super-admin/users"
  },
  {
    title: "Students",
    icon: UserCheck,
    path: "/super-admin/students"
  },
  {
    title: "Teachers",
    icon: GraduationCap,
    path: "/super-admin/teachers"
  },
  {
    title: "Courses",
    icon: BookOpen,
    path: "/super-admin/courses"
  },
  {
    title: "Payments",
    icon: CreditCard,
    path: "/super-admin/payments"
  },
  {
    title: "bKash Payments",
    icon: Smartphone,
    path: "/super-admin/manual-payments"
  },
  {
    title: "Invoices",
    icon: Receipt,
    path: "/super-admin/invoices"
  },
  {
    title: "Coupons",
    icon: Ticket,
    path: "/super-admin/coupons"
  },
  {
    title: "Reviews",
    icon: Star,
    path: "/super-admin/reviews"
  },
  {
    title: "Newsletter",
    icon: Mail,
    path: "/super-admin/newsletter"
  },
  {
    title: "Announcements",
    icon: Megaphone,
    path: "/super-admin/announcements"
  },
  {
    title: "Legal",
    icon: FileText,
    path: "/super-admin/legal"
  },
  {
    title: "Payment Settings",
    icon: ToggleLeft,
    path: "/super-admin/payment-settings"
  },
  {
    title: "Profile",
    icon: User,
    path: "/super-admin/profile"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/super-admin/settings"
  }
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Decreased width from w-80 to w-64 */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Navigation Items - Made scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-cyan-600 text-white" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Section - Fixed at bottom */}
        <div className="border-t border-slate-700 p-4 flex-shrink-0">
          {/* User Profile */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.user_metadata?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-sm truncate">
                {user?.user_metadata?.full_name || 'Abdullah Usimin'}
              </p>
              <p className="text-slate-400 text-xs">Super Admin</p>
            </div>
          </div>

          {/* Go to Dashboard Button */}
          <Button
            onClick={() => handleNavigation('/super-admin')}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white mb-3"
          >
            Go to Dashboard
          </Button>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  )
}

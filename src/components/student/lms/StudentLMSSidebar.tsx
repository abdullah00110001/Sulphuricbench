import { useState } from 'react'
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  Award, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NavLink } from 'react-router-dom'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/student/newdashboard', icon: LayoutDashboard },
  { title: 'My Courses', href: '/student/newdashboard/courses', icon: BookOpen, badge: 3 },
  { title: 'Assignments', href: '/student/newdashboard/assignments', icon: ClipboardList, badge: 5 },
  { title: 'Payment History', href: '/student/newdashboard/payments', icon: CreditCard },
  { title: 'Exams / Quizzes', href: '/student/newdashboard/exams', icon: GraduationCap, badge: 2 },
  { title: 'Certificates', href: '/student/newdashboard/certificates', icon: Award },
  { title: 'Progress Report', href: '/student/newdashboard/progress', icon: BarChart3 },
  { title: 'Messages', href: '/student/newdashboard/messages', icon: MessageSquare, badge: 3 },
  { title: 'Calendar', href: '/student/newdashboard/calendar', icon: Calendar },
  { title: 'Resources', href: '/student/newdashboard/resources', icon: FileText },
  { title: 'Profile', href: '/student/newdashboard/profile', icon: User },
  { title: 'Settings', href: '/student/newdashboard/settings', icon: Settings },
]

interface StudentLMSSidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobile?: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function StudentLMSSidebar({ 
  collapsed, 
  onToggle, 
  mobile = false, 
  mobileOpen = false, 
  onMobileClose 
}: StudentLMSSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobile && mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onMobileClose}
        />
      )}
      
      <aside className={cn(
        "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300",
        mobile 
          ? cn(
              "lg:hidden w-64",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )
          : cn(
              "hidden lg:block",
              collapsed ? "w-16" : "w-64"
            )
      )}>
        <div className="flex flex-col h-full">
          {/* Toggle button for desktop */}
          {!mobile && (
            <div className="flex justify-end p-2 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground",
                    collapsed && !mobile && "justify-center px-2"
                  )}
                  onClick={mobile ? onMobileClose : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(!collapsed || mobile) && (
                    <>
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}
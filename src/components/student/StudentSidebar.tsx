
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard,
  BookOpen, 
  FileText, 
  Award, 
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface SidebarItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
  { title: 'My Courses', icon: BookOpen, href: '/student/courses' },
  { title: 'Assignments', icon: FileText, href: '/student/assignments', badge: 3 },
  { title: 'Certificates', icon: Award, href: '/student/certificates' },
  { title: 'Messages', icon: MessageSquare, href: '/student/messages', badge: 2 },
  
  { title: 'Settings', icon: Settings, href: '/student/settings' },
]

export function StudentSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full bg-background border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Student Portal</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 justify-start text-muted-foreground hover:text-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  )
}

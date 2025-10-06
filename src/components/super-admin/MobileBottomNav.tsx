
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Palette
} from 'lucide-react'

export function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/super-admin"
    },
    {
      title: "Users",
      icon: Users,
      path: "/super-admin/students"
    },
    {
      title: "Courses",
      icon: BookOpen,
      path: "/super-admin/courses"
    }
  ]

  return (
    <div className="bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="grid grid-cols-4 gap-1 p-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col gap-1 h-auto py-2 transition-all duration-200 ${
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs truncate">{item.title}</span>
            </Button>
          )
        })}
        
        {/* Theme Toggle */}
        <div className="flex flex-col items-center gap-1 py-2">
          <ThemeToggle />
          <span className="text-xs text-muted-foreground">Theme</span>
        </div>
      </div>
    </div>
  )
}

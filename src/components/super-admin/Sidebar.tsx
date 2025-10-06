
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLocation, useNavigate } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  Calendar,
  Megaphone,
  FileText,
  BarChart3,
  Settings,
  UserCheck,
  Mail,
  CreditCard,
  Receipt,
  Ticket,
  Smartphone,
  Star,
  User,
  ToggleLeft
} from "lucide-react"

const sidebarItems = [
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

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path)
    navigate(path)
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform",
      isMobile ? "translate-x-0" : "translate-x-0"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Super Admin</h2>
        </div>
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

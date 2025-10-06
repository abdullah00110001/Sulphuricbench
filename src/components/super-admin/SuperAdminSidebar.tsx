import {
  BarChart,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  Mail,
  Megaphone,
  Scale,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
  Smartphone,
  Star,
  User,
  ToggleLeft,
  HelpCircle
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  name: string
  href: string
  icon: any
}

const navigation = [
  { name: 'Dashboard', href: '/super-admin', icon: BarChart },
  { name: 'Analytics', href: '/super-admin/analytics', icon: TrendingUp },
  { name: 'Students', href: '/super-admin/students', icon: GraduationCap },
  { name: 'Teachers', href: '/super-admin/teachers', icon: UserCheck },
  { name: 'Courses', href: '/super-admin/courses', icon: BookOpen },
  { name: 'Future Courses', href: '/super-admin/future-courses', icon: Calendar },
  { name: 'Payments', href: '/super-admin/payments', icon: CreditCard },
  { name: 'bKash Payments', href: '/super-admin/manual-payments', icon: Smartphone },
  { name: 'Invoices', href: '/super-admin/invoices', icon: FileText },
  { name: 'Coupons', href: '/super-admin/coupons', icon: Tag },
  { name: 'Reviews', href: '/super-admin/reviews', icon: Star },
  { name: 'Newsletter', href: '/super-admin/newsletter', icon: Mail },
  { name: 'Announcements', href: '/super-admin/announcements', icon: Megaphone },
  { name: 'FAQ', href: '/super-admin/faq', icon: HelpCircle },
  { name: 'Legal', href: '/super-admin/legal', icon: Scale },
  { name: 'Payment Settings', href: '/super-admin/payment-settings', icon: ToggleLeft },
  { name: 'Profile', href: '/super-admin/profile', icon: User },
  { name: 'Settings', href: '/super-admin/settings', icon: Settings },
]

export function SuperAdminSidebar() {
  return (
    <div className="flex flex-col h-full bg-card border-r py-4 dark:border-border">
      <div className="px-4">
        <NavLink to="/" className="flex items-center text-lg font-semibold">
          <ShoppingBag className="w-6 h-6 mr-2" />
          Sulphuric Bench
        </NavLink>
      </div>
      <nav className="flex-1 mt-6 space-y-1 px-2">
        {navigation.map((item: NavItem) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground
              ${isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

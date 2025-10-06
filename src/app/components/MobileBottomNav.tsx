import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, User, Settings, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function MobileBottomNav() {
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Search', href: '/courses', icon: Search },
    { name: 'Profile', href: '/login', icon: User },
    { name: 'Dashboard', href: '/student', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/courses' && location.pathname.startsWith('/course')) {
      return true
    }
    return location.pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
      <nav className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium truncate">{item.name}</span>
              {active && (
                <div className="absolute -top-1 right-1/2 transform translate-x-1/2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
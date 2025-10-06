
import { Bell, Moon, Sun, User, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/components/ThemeProvider'
import { useNavigate } from 'react-router-dom'

export function SuperAdminHeader() {
  const { user, profile, signOut, isSuperAdmin } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleDashboardNavigation = () => {
    if (isSuperAdmin) {
      navigate('/super-admin')
    } else if (profile?.role === 'student') {
      navigate('/student/dashboard')
    } else {
      navigate('/')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const displayName = isSuperAdmin 
    ? (user?.email === 'abdullahusimin1@gmail.com' ? 'Abdullah Usimin' : 'Super Admin')
    : profile?.full_name || 'User'

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">Sulphuric Bench</h1>
          <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Super Admin Dashboard</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDashboardNavigation}
            className="hidden sm:flex"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDashboardNavigation}
            className="sm:hidden"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 px-0"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs md:text-sm">
                    {isSuperAdmin ? 'SA' : displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{displayName}</p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { AuthModal } from "./auth/AuthModal"

import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/components/ThemeProvider"
import { 
  Book, 
  User, 
  Search, 
  Menu, 
  X, 
  Home,
  BookOpen,
  LogIn,
  LogOut,
  Settings,
  FileText,
  LayoutDashboard
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login")
  const location = useLocation()
  const { user, profile, signOut, loading } = useAuth()
  const { theme } = useTheme()

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "About", href: "/about", icon: Book },
    { name: "Contact", href: "/contact", icon: User },
  ]

  const isActive = (path: string) => location.pathname === path

  const openAuthModal = (tab: "login" | "signup") => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getDashboardLink = () => {
    if (!profile) return '/student/dashboard'
    
    switch (profile.role) {
      case 'super_admin':
        return '/super-admin'
      case 'teacher':
        return '/student/dashboard'
      case 'student':
      default:
        return '/student/dashboard'
    }
  }

  const getLogoSrc = () => {
    if (theme === 'dark') {
      return "/img/logodark.svg"
    } else if (theme === 'light') {
      return "/img/logo.svg"
    } else {
      // system theme - check if dark mode is preferred
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDarkMode ? "/img/logodark.svg" : "/img/logo.svg"
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Much larger size */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img 
                src={getLogoSrc()}
                alt="Sulphuric Bench" 
                className="h-24 w-24"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive(item.href) ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Desktop Actions - Enhanced Primary Button */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* ENHANCED PRIMARY BUTTON - Get Start / Dashboard */}
              {loading ? (
                <div className="w-36 h-11 rounded-lg bg-muted animate-pulse" />
              ) : user ? (
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-[#00CFFF] to-[#0066FF] hover:from-[#00B8E6] hover:to-[#0052CC] text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to={getDashboardLink()}>
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button 
                  onClick={() => openAuthModal("signup")}
                  size="lg"
                  className="bg-gradient-to-r from-[#00CFFF] to-[#0066FF] hover:from-[#00B8E6] hover:to-[#0052CC] text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  ✨ Get Start
                </Button>
              )}

              <ThemeToggle />
              
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback>{getInitials(profile?.full_name || 'U')}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profile?.full_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()}>
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === 'super_admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/super-admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Super Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => openAuthModal("login")}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>

            {/* Mobile Actions - Enhanced Primary Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* ENHANCED PRIMARY MOBILE BUTTON - Get Start / Dashboard */}
              {loading ? (
                <div className="w-28 h-10 rounded-lg bg-muted animate-pulse" />
              ) : user ? (
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-[#00CFFF] to-[#0066FF] hover:from-[#00B8E6] hover:to-[#0052CC] text-white font-bold px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Link to={getDashboardLink()}>
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dash</span>
                  </Link>
                </Button>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-[#00CFFF] to-[#0066FF] hover:from-[#00B8E6] hover:to-[#0052CC] text-white font-bold px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300" 
                  onClick={() => openAuthModal("signup")}
                >
                  <span className="hidden sm:inline">✨ Get Start</span>
                  <span className="sm:hidden">✨ Start</span>
                </Button>
              )}

              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive(item.href) ? "bg-accent text-accent-foreground" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile Search */}
                <div className="px-4 py-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="pl-10 pr-4 py-2 w-full rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                {/* Mobile Auth */}
                <div className="px-4 space-y-2">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-2 py-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                          <AvatarFallback>{getInitials(profile?.full_name || 'U')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{profile?.full_name}</span>
                      </div>
                      {/* Prominent Mobile Dashboard Button */}
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-[#00CFFF] to-[#0066FF] hover:from-[#00B8E6] hover:to-[#0052CC] text-white font-bold py-3 mb-2"
                      >
                        <Link to={getDashboardLink()}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Go to Dashboard
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Prominent Mobile Get Start Button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-[#00CFFF] to-[#0066FF] hover:from-[#00B8E6] hover:to-[#0052CC] text-white font-bold py-3 mb-2" 
                        onClick={() => openAuthModal("signup")}
                      >
                        ✨ Get Start Now
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openAuthModal("login")}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  )
}

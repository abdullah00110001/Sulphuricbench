import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Home, BookOpen, User, Settings, Phone, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'Dashboard', href: '/student', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="mobile-navigation">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            <span className="font-bold text-lg">Sulphuric Bench</span>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SB</span>
                    </div>
                    <span className="font-bold">Sulphuric Bench</span>
                  </div>
                </div>
                
                <nav className="flex-1 p-6">
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(item.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                  
                  <div className="mt-8 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Quick Access</h4>
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Login / Register
                        </Button>
                      </Link>
                      <Link
                        to="/student"
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <Button variant="default" size="sm" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </nav>
                
                <div className="p-6 border-t">
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary">Mobile App v1.0</Badge>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  )
}
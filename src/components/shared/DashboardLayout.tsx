
import { ReactNode } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function DashboardLayout({ children, sidebar, title, subtitle, actions }: DashboardLayoutProps) {
  const { user, profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex">
        {sidebar}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{title}</h1>
                  {subtitle && (
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {actions}
                
                
                <ThemeToggle />
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {profile?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

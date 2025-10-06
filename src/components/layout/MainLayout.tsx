
import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  excludeMargins?: boolean
}

export function MainLayout({ children, excludeMargins = false }: MainLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${!excludeMargins ? 'mx-4 lg:mx-8 xl:mx-16 2xl:mx-24' : ''}`}>
      {children}
    </div>
  )
}

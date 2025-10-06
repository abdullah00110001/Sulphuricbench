import { ReactNode } from 'react'
import { MobileNavigation } from '../components/MobileNavigation'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { useMobile } from '../hooks/useMobile'

interface MobileLayoutProps {
  children: ReactNode
  showBottomNav?: boolean
  showTopNav?: boolean
}

export function MobileLayout({ 
  children, 
  showBottomNav = true, 
  showTopNav = true 
}: MobileLayoutProps) {
  const { isMobile, keyboardOpen } = useMobile()

  return (
    <div className="mobile-layout min-h-screen">
      {showTopNav && <MobileNavigation />}
      
      <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''} ${keyboardOpen ? 'keyboard-open' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && !keyboardOpen && isMobile && <MobileBottomNav />}
    </div>
  )
}
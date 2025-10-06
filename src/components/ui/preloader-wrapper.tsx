import React, { useState } from 'react'
import { ModernPreloader } from './modern-preloader'

interface PreloaderWrapperProps {
  children: React.ReactNode
  enabled?: boolean
  duration?: number
  showProgress?: boolean
}

export function PreloaderWrapper({ 
  children, 
  enabled = true, 
  duration = 3000,
  showProgress = false 
}: PreloaderWrapperProps) {
  const [showPreloader, setShowPreloader] = useState(enabled)

  const handlePreloaderComplete = () => {
    setShowPreloader(false)
  }

  if (!enabled || !showPreloader) {
    return <>{children}</>
  }

  return (
    <>
      <ModernPreloader
        onComplete={handlePreloaderComplete}
        duration={duration}
        showProgress={showProgress}
      />
      <div style={{ visibility: showPreloader ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  )
}
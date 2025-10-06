import { useState, useEffect } from 'react'

interface UsePreloaderOptions {
  duration?: number
  enabled?: boolean
  onComplete?: () => void
}

export function usePreloader({ 
  duration = 3000, 
  enabled = true,
  onComplete 
}: UsePreloaderOptions = {}) {
  const [isLoading, setIsLoading] = useState(enabled)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      setHasCompleted(true)
      return
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
      setHasCompleted(true)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, enabled, onComplete])

  const reset = () => {
    setIsLoading(enabled)
    setHasCompleted(false)
  }

  return {
    isLoading,
    hasCompleted,
    reset
  }
}
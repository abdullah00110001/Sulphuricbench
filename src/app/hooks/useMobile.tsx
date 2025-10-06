import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'

export function useMobile() {
  const [isNative, setIsNative] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [statusBarHeight, setStatusBarHeight] = useState(0)

  useEffect(() => {
    const checkPlatform = async () => {
      const native = Capacitor.isNativePlatform()
      setIsNative(native)

      if (native) {
        try {
          // Get status bar info  
          const statusBarInfo = await StatusBar.getInfo()
          // Note: height property may not be available on all platforms
          if ('height' in statusBarInfo) {
            setStatusBarHeight((statusBarInfo as any).height)
          }

          // Listen for keyboard events
          Keyboard.addListener('keyboardWillShow', (info) => {
            setKeyboardOpen(true)
            document.documentElement.style.setProperty(
              '--keyboard-height',
              `${info.keyboardHeight}px`
            )
          })

          Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardOpen(false)
            document.documentElement.style.setProperty('--keyboard-height', '0px')
          })

        } catch (error) {
          console.error('Error setting up mobile features:', error)
        }
      }
    }

    checkPlatform()

    return () => {
      if (isNative) {
        Keyboard.removeAllListeners()
      }
    }
  }, [])

  const hideStatusBar = async () => {
    if (isNative) {
      try {
        await StatusBar.hide()
      } catch (error) {
        console.error('Error hiding status bar:', error)
      }
    }
  }

  const showStatusBar = async () => {
    if (isNative) {
      try {
        await StatusBar.show()
      } catch (error) {
        console.error('Error showing status bar:', error)
      }
    }
  }

  return {
    isNative,
    keyboardOpen,
    statusBarHeight,
    hideStatusBar,
    showStatusBar,
    isMobile: isNative || window.innerWidth < 768
  }
}
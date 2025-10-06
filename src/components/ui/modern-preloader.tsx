import React, { useEffect, useState } from 'react'

interface ModernPreloaderProps {
  onComplete?: () => void
  duration?: number
  className?: string
  showProgress?: boolean
}

export function ModernPreloader({ 
  onComplete, 
  duration = 3000, 
  className = '',
  showProgress = false 
}: ModernPreloaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let progressInterval: NodeJS.Timeout

    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 100 / (duration / 50)
          return next >= 100 ? 100 : next
        })
      }, 50)
    }

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete?.()
      }, 400)
    }, duration - 400)

    return () => {
      clearTimeout(timer)
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [duration, onComplete, showProgress])

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-all duration-400 ${
      !isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
    } ${className}`}>
      <div className="relative">
        {/* Main Container */}
        <div className="w-32 h-32 relative">
          {/* Backdrop Circle */}
          <div className="absolute inset-0 bg-[#072630] rounded-full animate-[backdrop-fade-in_120ms_ease-out]" />
          
          {/* Outer Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="#072630"
              strokeWidth="2"
              strokeDasharray="390"
              strokeDashoffset="390"
              className="animate-[ring-draw_600ms_cubic-bezier(0.22,0.9,0.32,1)_120ms_both]"
            />
          </svg>
          
          {/* Accent Arc Top */}
          <svg className="absolute inset-0 w-full h-full rotate-[30deg]">
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="#26F7FF"
              strokeWidth="3"
              strokeDasharray="91 273"
              strokeDashoffset="0"
              filter="drop-shadow(0 0 12px #26F7FF)"
              className="opacity-0 scale-90 animate-[arc-draw_550ms_ease-out_180ms_both]"
            />
          </svg>
          
          {/* Accent Arc Bottom */}
          <svg className="absolute inset-0 w-full h-full rotate-[210deg]">
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="#26F7FF"
              strokeWidth="3"
              strokeDasharray="91 273"
              strokeDashoffset="0"
              filter="drop-shadow(0 0 12px #26F7FF)"
              className="opacity-0 scale-90 animate-[arc-draw_550ms_ease-out_280ms_both]"
            />
          </svg>
          
          {/* Monogram Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 opacity-0 scale-94 animate-[monogram-reveal_450ms_ease-out_700ms_both,monogram-breathe_900ms_ease-in-out_1450ms_infinite_alternate]">
              <img 
                src="/assets/logo.png" 
                alt="Sulphuric Bench" 
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Text Layer */}
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2">
          <div className="font-semibold text-sm text-muted-foreground tracking-wider opacity-0 translate-y-2 animate-[text-reveal_350ms_ease-out_1050ms_both]">
            sulphuric bench
          </div>
        </div>
        
        {/* Progress Bar (optional) */}
        {showProgress && (
          <div className="absolute top-44 left-1/2 transform -translate-x-1/2 w-32">
            <div className="h-0.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes backdrop-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes ring-draw {
          from { stroke-dashoffset: 390; }
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes arc-draw {
          from {
            opacity: 0;
            transform: scale(0.9);
            filter: drop-shadow(0 0 0px #26F7FF);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 14px #26F7FF);
          }
        }
        
        @keyframes monogram-reveal {
          0% {
            opacity: 0;
            transform: scale(0.94);
          }
          70% {
            transform: scale(1.06);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes monogram-breathe {
          from { transform: scale(1); }
          to { transform: scale(1.02); }
        }
        
        @keyframes text-reveal {
          from {
            opacity: 0;
            transform: translateY(8px);
            letter-spacing: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.05em;
          }
        }
      `}</style>
    </div>
  )
}
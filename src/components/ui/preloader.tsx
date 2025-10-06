import React, { useEffect, useState } from 'react'

interface PreloaderProps {
  onComplete?: () => void
  duration?: number
  className?: string
}

export function Preloader({ onComplete, duration = 3000, className = '' }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete?.()
      }, 350) // Fade out duration
    }, duration - 350)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isVisible) {
    return (
      <div className={`preloader-container fade-out ${className}`}>
        <div className="preloader-content">
          <div className="logo-container">
            <div className="backdrop-circle" />
            <div className="outer-ring" />
            <div className="accent-arc-top" />
            <div className="accent-arc-bottom" />
            <div className="monogram">
              <img src="/assets/logo.png" alt="Sulphuric Bench" />
            </div>
            <div className="text-layer">sulphuric bench</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`preloader-container ${className}`}>
      <div className="preloader-content">
        <div className="logo-container">
          <div className="backdrop-circle" />
          <div className="outer-ring" />
          <div className="accent-arc-top" />
          <div className="accent-arc-bottom" />
          <div className="monogram">
            <img src="/assets/logo.png" alt="Sulphuric Bench" />
          </div>
          <div className="text-layer">sulphuric bench</div>
        </div>
      </div>

      <style>{`
        .preloader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: hsl(var(--background));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: scene-fade-in 0.12s ease-out;
        }

        .preloader-container.fade-out {
          animation: preloader-fade-out 0.35s ease-in-out forwards;
        }

        .preloader-content {
          position: relative;
        }

        .logo-container {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .backdrop-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #072630;
          border-radius: 50%;
          animation: backdrop-fade-in 0.12s ease-out;
        }

        .outer-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #072630;
          border-radius: 50%;
          animation: ring-draw 0.6s cubic-bezier(0.22, 0.9, 0.32, 1) 0.12s both;
        }

        .accent-arc-top {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top: 3px solid #26F7FF;
          border-radius: 50%;
          transform: rotate(30deg);
          filter: drop-shadow(0 0 12px #26F7FF);
          animation: arc-draw-top 0.55s ease-out 0.18s both;
        }

        .accent-arc-bottom {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-bottom: 3px solid #26F7FF;
          border-radius: 50%;
          transform: rotate(210deg);
          filter: drop-shadow(0 0 12px #26F7FF);
          animation: arc-draw-bottom 0.55s ease-out 0.28s both;
        }

        .monogram {
          position: relative;
          width: 80px;
          height: 80px;
          z-index: 2;
          animation: monogram-reveal 0.45s ease-out 0.7s both, monogram-breathe 0.9s ease-in-out 1.45s infinite alternate;
        }

        .monogram img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }

        .text-layer {
          position: absolute;
          top: 140px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: hsl(var(--muted-foreground));
          letter-spacing: 0.1em;
          text-align: center;
          white-space: nowrap;
          animation: text-reveal 0.35s ease-out 1.05s both;
        }

        @keyframes scene-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes backdrop-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes ring-draw {
          from {
            stroke-dasharray: 0 1000;
            opacity: 0;
          }
          to {
            stroke-dasharray: 1000 0;
            opacity: 1;
          }
        }

        @keyframes arc-draw-top {
          from {
            transform: rotate(30deg) scale(0.9);
            opacity: 0;
            filter: drop-shadow(0 0 0px #26F7FF);
          }
          to {
            transform: rotate(30deg) scale(1);
            opacity: 1;
            filter: drop-shadow(0 0 14px #26F7FF);
          }
        }

        @keyframes arc-draw-bottom {
          from {
            transform: rotate(210deg) scale(0.9);
            opacity: 0;
            filter: drop-shadow(0 0 0px #26F7FF);
          }
          to {
            transform: rotate(210deg) scale(1);
            opacity: 1;
            filter: drop-shadow(0 0 14px #26F7FF);
          }
        }

        @keyframes monogram-reveal {
          0% {
            transform: scale(0.94);
            opacity: 0;
          }
          70% {
            transform: scale(1.06);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes monogram-breathe {
          from { transform: scale(1); }
          to { transform: scale(1.02); }
        }

        @keyframes text-reveal {
          from {
            transform: translateX(-50%) translateY(10px);
            opacity: 0;
            letter-spacing: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
            letter-spacing: 0.1em;
          }
        }

        @keyframes preloader-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes preloader-fade-out .monogram {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(0.98);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
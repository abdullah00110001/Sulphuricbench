
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { SuperAdminAuthProvider } from '@/hooks/useSuperAdminAuth'

import './index.css'

console.log('main.tsx loading...')

// Check if root element exists
const rootElement = document.getElementById("root")
if (!rootElement) {
  console.error('❌ Root element not found! Creating fallback...')
  const fallbackRoot = document.createElement('div')
  fallbackRoot.id = 'root'
  fallbackRoot.innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      font-family: system-ui, sans-serif;
      background: #f3f4f6;
    ">
      <div style="
        background: white; 
        padding: 2rem; 
        border-radius: 8px; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">App Initialization Error</h1>
        <p style="color: #6b7280;">The root element was not found in the HTML.</p>
        <button onclick="window.location.reload()" style="
          background: #3b82f6; 
          color: white; 
          border: none; 
          padding: 0.5rem 1rem; 
          border-radius: 4px; 
          cursor: pointer;
          margin-top: 1rem;
        ">
          Reload Page
        </button>
      </div>
    </div>
  `
  document.body.appendChild(fallbackRoot)
  throw new Error('Root element not found')
}

console.log('✅ Root element found, initializing React...')

try {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <SuperAdminAuthProvider>
        <App />
      </SuperAdminAuthProvider>
    </StrictMode>
  )
  console.log('✅ React app rendered successfully')
} catch (error) {
  console.error('❌ Error rendering React app:', error)
  
  // Fallback UI for rendering errors
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      font-family: system-ui, sans-serif;
      background: #f3f4f6;
    ">
      <div style="
        background: white; 
        padding: 2rem; 
        border-radius: 8px; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 400px;
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">React Rendering Error</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">
          The application failed to render. Check the browser console for details.
        </p>
        <pre style="
          background: #f9fafb; 
          padding: 1rem; 
          border-radius: 4px; 
          text-align: left; 
          font-size: 0.75rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        ">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="
          background: #3b82f6; 
          color: white; 
          border: none; 
          padding: 0.5rem 1rem; 
          border-radius: 4px; 
          cursor: pointer;
        ">
          Reload Page
        </button>
      </div>
    </div>
  `
}

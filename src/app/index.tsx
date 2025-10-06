import React from 'react'
import ReactDOM from 'react-dom/client'
import { MobileApp } from './App'
import './styles/mobile.css'
import '../index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MobileApp />
  </React.StrictMode>,
)
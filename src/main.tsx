import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/responsive.css'
import App from './App.tsx'
// import MinimalApp from './MinimalApp.tsx'
// import DebugApp from './DebugApp.tsx'
// import SimpleApp from './SimpleApp.tsx'
// import TestApp from './TestApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

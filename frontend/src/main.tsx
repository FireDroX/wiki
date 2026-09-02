import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { AuthProvider } from '#components/AuthProvider'
import { PageTreeProvider } from '#components/PageTreeProvider'
import { Toaster } from '#components/ui/sonner'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PageTreeProvider>
          <App />
          <Toaster />
        </PageTreeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

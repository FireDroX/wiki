import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { App } from './App'
import { AuthProvider } from '#components/AuthProvider'
import { PageTreeProvider } from '#components/PageTreeProvider'
import { Toaster } from '#components/ui/sonner'
import i18n from '#lib/i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AuthProvider>
          <PageTreeProvider>
            <App />
            <Toaster />
          </PageTreeProvider>
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  </StrictMode>,
)

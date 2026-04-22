import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { TRPCProvider } from '@/providers/trpc'
import './index.css'
import App from './App.tsx'

function AppWithInit() {
  useEffect(() => {
    // Ensure localStorage password is synced for tRPC headers
    const stored = localStorage.getItem('site_password');
    if (stored) {
      // Password already stored, tRPC provider will pick it up
    }
  }, []);
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <AppWithInit />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)

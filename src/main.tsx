import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./polyfills.ts"
import { AppProviders } from './AppProviders.tsx';
import UploadPage from './pages/UploadPage.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BlobListPage } from './pages/BlobListPage.tsx';
import { Toaster } from './components/ui/sonner';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppProviders>
        <Navbar/>
        <UploadPage/>
        <BlobListPage/>
      </AppProviders>
      <Toaster />
    </App>
  </StrictMode>
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import App from './App.tsx'
import { AppProviders } from './AppProviders.tsx';
import UploadPage from './pages/UploadPage.tsx';
import { Navbar } from './components/Navbar.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppProviders>
        <Navbar/>
        <UploadPage/>
      </AppProviders>
    </App>
  </StrictMode>,
)

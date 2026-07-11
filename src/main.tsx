import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles3.css'
import './styles/screens2.css'
import './styles/dash.css'
import './styles/batch.css'
import './styles/amplia.css'
import './styles/chamados.css'
import './styles/auth.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@wyalink/supabase-client'
import App from './App'
import '@wyalink/ui/styles.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

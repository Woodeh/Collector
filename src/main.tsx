import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/manrope'
import '@fontsource-variable/roboto-condensed'
import '@fontsource-variable/roboto-condensed/wght-italic.css'
import './index.css' 
import './pwa'
import App from './App'
import React from 'react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

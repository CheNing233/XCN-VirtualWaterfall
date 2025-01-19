import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import Example1 from './example-1.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Example1 />
  </StrictMode>,
)

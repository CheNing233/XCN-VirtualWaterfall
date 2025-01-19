import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './main.css'

import ResponsiveCols from "./responsiveCols.tsx";
import StaticCols from "./staticCols.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h2>StaticCols</h2>
    <StaticCols/>
    <h2>ResponsiveCols</h2>
    <ResponsiveCols/>
  </StrictMode>,
)

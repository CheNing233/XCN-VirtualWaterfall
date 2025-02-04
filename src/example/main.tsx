import {StrictMode, useRef} from 'react'
import {createRoot} from 'react-dom/client'
import './main.css'

import ResponsiveCols from "./responsiveCols.tsx";
import StaticCols from "./staticCols.tsx";
import GivenScrollContainer from "./givenScrollContainer.tsx";

const App = () => {
  const mainRef = useRef<HTMLDivElement>(null)

  return (
    <div
      style={{
        left: 0,
        top: 0,
        position: 'absolute',
        width: '100dvw',
        height: '100dvh',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
      ref={mainRef}
    >
      <h2>StaticCols</h2>
      <StaticCols/>
      <h2>ResponsiveCols</h2>
      <ResponsiveCols/>
      <h2>GivenScrollContainer</h2>
      <GivenScrollContainer scrollRef={mainRef}/>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './main.css'

import ResponsiveCols from "./responsiveCols.tsx";
import StaticCols from "./staticCols.tsx";
import GivenScrollContainer from "./givenScrollContainer.tsx";

const App = () => {

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
      id={"main-scroll"}
    >
      <h2>StaticCols</h2>
      <StaticCols/>
      <h2>ResponsiveCols</h2>
      {/*<ResponsiveCols/>*/}
      <h2>GivenScrollContainer</h2>
      {/*<GivenScrollContainer/>*/}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)

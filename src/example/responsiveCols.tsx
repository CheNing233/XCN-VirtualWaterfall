import * as React from "react";
import {useRef, useState} from "react";
import XCNWaterfall from "../packages/xcn-waterfall";
import {generateRandomId, generateRandomObjects} from "./tools.ts";
import {WaterfallItems} from "../packages/xcn-waterfall/interface.ts";
import {Comp} from "./comp.tsx";


function ResponsiveCols() {
  const [data, setData] = useState(
    generateRandomObjects().map(item => {
      const id = generateRandomId()

      return {
        id: id,
        height: item.height,
        width: item.width,
        content: () => (
          <Comp
            name={id}
            style={{
              position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
              background: item.color
            }}
          >
          </Comp>
        )
      }
    })
  )
  const [cols, setCols] = useState(4)
  const count = useRef(0)

  const handleRequestMore = async () => {
    count.current++
    let newData: WaterfallItems[] = []

    if (count.current < 3) {
      newData = generateRandomObjects().map(item => {
        const id = generateRandomId()
        return {
          id: id,
          height: item.height,
          width: item.width,
          content: () => (
            <Comp
              name={id}
              style={{
                position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
                background: item.color
              }}
            />
          )
        }
      })
    } else {
      newData = [];
    }

    // 延时 1000 ms
    await new Promise(resolve => setTimeout(resolve, 1000))

    return newData as WaterfallItems[]
  }

  return (
    <>
      <XCNWaterfall
        data={data}
        columnsGroup={{
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
        }}
        onRequestBottomMore={handleRequestMore}
        bottomCompRenderFn={(reqCount: number, isLoading: boolean, isFinished: boolean) => (
          <h4 style={{
            color: 'yellow',
            textAlign: 'center'
          }}>waterfall bottom | reqCount {reqCount} | isLoading {`${isLoading}`} | isFinished {`${isFinished}`}</h4>
        )}
        style={{
          width: '80vw',
          height: '80vh'
        }}
      />
    </>
  )
}

export default ResponsiveCols

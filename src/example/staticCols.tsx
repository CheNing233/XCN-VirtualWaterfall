import * as React from "react";
import {useState} from "react";
import XCNWaterfall from "../packages/xcn-waterfall";
import useXCNWaterfallItem from "../packages/xcn-waterfall/hooks/use-item.tsx";
import {generateRandomId, generateRandomObjects} from "./tools.ts";
import {Comp} from "./comp.tsx";


function StaticCols() {
  const [data, setData] = useState(
    // generateRandomObjects().map(item => {
    //   const id = generateRandomId()
    //
    //   return {
    //     id: id,
    //     height: item.height,
    //     width: item.width,
    //     content: () => (
    //       <Comp
    //         name={id}
    //         style={{
    //           position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
    //           background: item.color
    //         }}
    //       >
    //       </Comp>
    //     )
    //   }
    // })
    []
  )

  const handleRequestMore = async (reqCount: number) => {
    console.log('request more', reqCount)

    const newData = generateRandomObjects().map(item => {
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

    await new Promise(resolve => setTimeout(resolve, 1000))

    return newData
  }

  return (
    <>
      <XCNWaterfall
        data={data}
        columns={3}
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

export default StaticCols

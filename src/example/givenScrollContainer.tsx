import * as React from "react";
import {useRef, useState} from "react";
import XCNWaterfall from "../packages/xcn-waterfall";
import {generateRandomId, generateRandomObjects} from "./tools.ts";
import {Comp} from "./comp.tsx";
import {WaterfallItems} from "../packages/xcn-waterfall/interface.ts";


function GivenScrollContainer(
  {
    scrollRef
  }: {
    scrollRef: React.RefObject<HTMLDivElement>
  }
) {
  const [data, setData] = useState([])

  const count = useRef(0)

  const handleRequestMore = async () => {
    count.current++
    let newData: WaterfallItems[] = []

    if (count.current < 10) {
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
        columns={3}
        onRequestBottomMore={handleRequestMore}
        scrollContainerRef={scrollRef}
        bottomCompRenderFn={(reqCount: number, isLoading: boolean, isFinished: boolean) => (
          <h4 style={{
            color: 'yellow',
            textAlign: 'center'
          }}>waterfall bottom | reqCount {reqCount} | isLoading {`${isLoading}`} | isFinished {`${isFinished}`}</h4>
        )}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </>
  )
}

export default GivenScrollContainer

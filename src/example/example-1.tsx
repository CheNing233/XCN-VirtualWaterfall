import * as React from "react";
import {useState} from "react";
import XCNWaterfall from "../packages/xcn-waterfall";
import useXCNWaterfallItem from "../packages/xcn-waterfall/hooks/use-item.tsx";
import {generateRandomId, generateRandomObjects} from "./tools.ts";

export function Comp(props: any) {
  const {item, updateItem} = useXCNWaterfallItem(props.name)
  const [count, setCount] = useState(0)

  return (
    <div {...props}>
      {props.name}
      <p>
        use state {count}
      </p>
      <button onClick={() => setCount(count + 1)}>
        +
      </button>
      <p>
        use item {item?.count || "none"}
      </p>
      <button onClick={() => {
        if (!item?.count) {
          updateItem({
            count: 1
          })
        } else {
          updateItem({
            count: item.count + 1
          })
        }
      }}>
        +
      </button>
    </div>
  )
}


function Example1() {
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

  const handleRequestMore = async () => {
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
        onRequestMore={handleRequestMore}
        bottomComponent={<h3>waterfall bottom</h3>}
      />
    </>
  )
}

export default Example1

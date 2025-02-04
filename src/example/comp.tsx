import useXCNWaterfallItem from "../packages/xcn-waterfall/hooks/use-item.tsx";
import * as React from "react";

// 自定义的卡片
export function Comp(props: any) {

  // 通过 useXCNWaterfallItem 获取到当前卡片的 item 数据，并修改并重新渲染该卡片
  const {
    item, updateItem,
    initState, computedPosition, computedItemsInView, setItemsToRender
  } = useXCNWaterfallItem(props.name)

  /**
   * update new width and height for box
   * */
  const updateNewBox = () => {
    updateItem({
      height: Math.floor(Math.random() * (1024 - 512 + 1)) + 512,
      width: Math.floor(Math.random() * (1024 - 512 + 1)) + 512,
    })
    initState()
    computedPosition()
    setItemsToRender(computedItemsInView())
  }

  return (
    <div {...props}>
      {props.name}
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
      <button onClick={updateNewBox}>
        set new box
      </button>
    </div>
  )
}

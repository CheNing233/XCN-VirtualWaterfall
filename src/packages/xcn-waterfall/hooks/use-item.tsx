import {useContext, useState} from "react";
import {XCNWaterfallColumnContext, XCNWaterfallDataContext} from "../context";
import {WaterfallItems} from "../interface.ts";

function useXCNWaterfallItem(itemId: string) {
  // 通过 context 获取数据
  const dataContext = useContext(XCNWaterfallDataContext);
  const columnContext = useContext(XCNWaterfallColumnContext);

  // 设置 tick，用于触发组件更新
  const [, setTick] = useState(0);

  // 查找指定 ID 的 item
  const item = dataContext.data.find((i: WaterfallItems) => i.id === itemId);

  if (!item) {
    console.warn(`Item with id ${itemId} not found!`);
  }

  // 修改 item 的方法
  const updateItem = (newItemData: Partial<WaterfallItems>) => {
    if (item) {
      Object.assign(item, newItemData); // 更新 item
      setTick(tick => (tick + 1) % 8);
    }
  };

  return {
    item,
    updateItem,
    initState: columnContext.initState,
    computedPosition: columnContext.computedPosition,
    computedItemsInView: columnContext.computedItemsInView,
    setItemsToRender: columnContext.setItemsToRender,
  };
}

export default useXCNWaterfallItem;

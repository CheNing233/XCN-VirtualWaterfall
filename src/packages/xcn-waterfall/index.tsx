import "./styles/index.css"
import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {
  initialColumnContext,
  initialDataContext,
  XCNWaterfallColumnContext,
  XCNWaterfallColumnContextProps,
  XCNWaterfallDataContext,
  XCNWaterfallDataContextProps
} from "./context";
import {WaterfallItems, WaterfallProps} from "./interface.ts";
import {debounce, findClosestIndex, rafThrottle} from "./utils.ts";


function RenderItems(
  {
    contentRef,
    listRef,
    onRequestBottomMore,
  }: {
    contentRef: React.RefObject<HTMLDivElement>;
    listRef: React.RefObject<HTMLDivElement>;
    onRequestBottomMore: () => Promise<WaterfallItems[]>;
  }
) {
  const columnContext = useContext(XCNWaterfallColumnContext)
  const dataContext = useContext(XCNWaterfallDataContext)

  const [itemsToRender, setItemsToRender] = useState<WaterfallItems[]>([])

  const initState = () => {
    console.log('initState', columnContext.renderNumber)

    columnContext.columnState.clear()
    for (let i = 0; i < columnContext.columns; i++) {
      columnContext?.columnState.set(i.toString(), {
        height: 0
      })
    }
    columnContext.columnWidth = contentRef.current!.clientWidth / columnContext.columns;
    columnContext.renderNumber = (columnContext.renderNumber + 1) % 8;
  }

  const computedPosition = () => {
    console.log('computedPosition', columnContext.renderNumber)

    if (dataContext.dataLoading) {
      console.warn('dataLoading')
    }

    let currentColumn = 0;

    // 遍历数据，计算每个 item 的位置和高度
    dataContext.data.forEach((item: WaterfallItems, index: number) => {
      const realHeight = item.height / (item.width / columnContext.columnWidth)

      item.renderKey = `${currentColumn}-${index}`
      item.renderHeight = realHeight
      item.renderColumn = currentColumn
      item.renderTop = columnContext.columnState.get(currentColumn.toString())!.height

      columnContext.columnState.get(currentColumn.toString())!.height += realHeight
      currentColumn = (currentColumn === columnContext.columns - 1) ? 0 : currentColumn + 1
    })

    // 方便二分查找
    dataContext.sortedData =
      dataContext.data.slice().sort((a, b) => a.renderTop - b.renderTop)

    // 计算最大最小高度
    columnContext.columnMaxHeight = Array.from(columnContext.columnState.values()).reduce((acc, cur) => {
      return Math.max(acc, cur.height)
    }, 0)
    columnContext.columnMinHeight = Array.from(columnContext.columnState.values()).reduce((acc, cur) => {
      return Math.min(acc, cur.height)
    }, columnContext.columnMaxHeight)

    // 设置列表高度，撑开容器滚动
    listRef.current!.style.height = columnContext.columnMaxHeight + 'px'
  }

  const computedItemsInView = () => {
    console.log('computedItemsInView', columnContext.renderNumber);

    const scrollTop = contentRef.current!.scrollTop;
    const data = dataContext.sortedData;

    // 使用排序后的数据进行二分查找
    const startIndex = findClosestIndex(
      data,
      scrollTop - columnContext.bufferHeight,
      (item) => item.renderTop! + item.renderHeight!
    );

    const endIndex = findClosestIndex(
      data,
      scrollTop + contentRef.current!.clientHeight + columnContext.bufferHeight,
      (item) => item.renderTop!
    ) + 1;

    return data.slice(
      startIndex || 0,
      endIndex > data.length ? data.length : endIndex
    );
  };

  // 处理添加数据
  const addBottomData = (
    fn: () => Promise<WaterfallItems[]>
  ) => {
    fn()
      .then((newData) => {
        dataContext.data.push(...newData)
        dataContext.bottomDataRequestCount++
        initState()
        computedPosition()
        setItemsToRender(computedItemsInView())
      })
  }

  useEffect(() => {
    if (dataContext.data.length === 0) {
      addBottomData(onRequestBottomMore)
    }

    if (listRef.current) {
      initState()
      computedPosition()
      setItemsToRender(computedItemsInView())
    }
  }, [listRef.current]);

  // 初始化监听
  useEffect(() => {
    const content = contentRef.current

    // 滚动事件
    const handleScroll = rafThrottle(() => {
      columnContext.scrollTop = content!.scrollTop
      setItemsToRender(computedItemsInView())

      if (columnContext.scrollTop + content!.clientHeight
        >= columnContext.columnMinHeight - columnContext.bufferHeight
      ) {
        if (!dataContext.dataLoading && !dataContext.dataFinished) {
          addBottomData(onRequestBottomMore)
        }
      }
    })

    // 窗口大小改变事件
    const handleResize = debounce(() => {
      initState()
      computedPosition()
      setItemsToRender(computedItemsInView())
    })

    const resizeObserver = new ResizeObserver(handleResize)

    if (content) {
      content.addEventListener('scroll', handleScroll)
      resizeObserver.observe(content)
    }
    return () => {
      if (content) {
        content.removeEventListener('scroll', handleScroll)
        resizeObserver.unobserve(content)
      }
    }
  }, [contentRef.current]);

  // 渲染视图内项目
  return itemsToRender.map((item: WaterfallItems) => {
    const offsetLeft = item.renderColumn! * columnContext.columnWidth
    const Content = item.content
    return (
      <div
        key={item.renderKey}
        className={"xcn-waterfall-item"}
        style={{
          width: columnContext.columnWidth,
          aspectRatio: `${item.width} / ${item.height}`,
          transform: `translate(${offsetLeft}px, ${item.renderTop}px)`,
        }}
      >
        <Content/>
      </div>
    )
  })
}

function XCNWaterfall(
  {
    data = [],
    onRequestMore,
    columns = 4,
    bottomComponent,
    ...props
  }: WaterfallProps
) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)


  const columnContext: XCNWaterfallColumnContextProps = {
    ...initialColumnContext,
    columns: columns,
    columnState: new Map()
  }

  const dataContext: XCNWaterfallDataContextProps = {
    ...initialDataContext,
    data: data
  }

  const _handleRequestBottomMore = async () => {
    if (!onRequestMore) return []

    dataContext.dataLoading = true
    const newData = await onRequestMore()
    dataContext.dataLoading = false

    if (newData && newData.length !== 0) {
      return newData
    } else {
      dataContext.dataFinished = true
      return []
    }
  }

  return (
    <div className={"xcn-waterfall-container"} {...props}>
      <XCNWaterfallColumnContext.Provider value={columnContext}>
        <XCNWaterfallDataContext.Provider value={dataContext}>
          <div className={"xcn-waterfall-content"} ref={contentRef}>
            <div className={"xcn-waterfall-list"} ref={listRef}>
              <RenderItems
                contentRef={contentRef}
                listRef={listRef}
                onRequestBottomMore={_handleRequestBottomMore}
              />
            </div>
            {bottomComponent && <div style={{width: "100%"}}>
              {bottomComponent}
            </div>}
          </div>
        </XCNWaterfallDataContext.Provider>
      </XCNWaterfallColumnContext.Provider>
    </div>
  )
}

export default XCNWaterfall
import "./styles/index.css"
import {forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react";
import {
  XCNWaterfallColumnContext,
  XCNWaterfallColumnContextProps,
  XCNWaterfallDataContext,
  XCNWaterfallDataContextProps
} from "./context";
import {
  WaterfallElement,
  WaterfallItems,
  WaterfallProps,
  WaterfallRenderElement,
  WaterfallRenderProps
} from "./interface.ts";
import {debounce, findClosestIndex, getResponsiveValue, rafThrottle} from "./utils.ts";


const RenderItems = forwardRef<WaterfallRenderElement, WaterfallRenderProps>(
  (
    {
      bottomComponentFn,
      onRequestBottomMore,
      scrollContainerRef
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const columnContext = useContext(XCNWaterfallColumnContext)
    const dataContext = useContext(XCNWaterfallDataContext)

    const [itemsToRender, setItemsToRender] = useState<WaterfallItems[]>([])

    const [, setTick] = useState(0)

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

      console.log('initState +', columnContext.columnWidth, contentRef.current!.clientWidth)
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
      fn: (bottomDataRequestCount: number) => Promise<WaterfallItems[]>
    ) => {
      fn(dataContext.bottomDataRequestCount)
        .then((newData) => {
          dataContext.data.push(...newData)
          dataContext.bottomDataRequestCount++
          initState()
          computedPosition()
          setItemsToRender(computedItemsInView())
        })
    }

    const refresh = () => {
      setTick((tick) => (tick + 1) % 8)
    }

    useImperativeHandle(ref, () => ({
      initState,
      computedPosition,
      setItemsToRender,
      computedItemsInView,
      addBottomData,
      refresh
    }))

    // 初始化数据, 首次渲染
    useEffect(() => {
      if (dataContext.data.length === 0) {
        addBottomData(onRequestBottomMore)
      }

      if (listRef.current) {
        initState()
        computedPosition()
        setItemsToRender(computedItemsInView())
        columnContext.initState = initState
        columnContext.computedPosition = computedPosition
        columnContext.computedItemsInView = computedItemsInView
        columnContext.setItemsToRender = setItemsToRender
      }
    }, [listRef.current]);

    // 初始化监听
    useEffect(() => {
      const content = scrollContainerRef?.current ?? contentRef.current

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
        // 计算响应式列数
        columnContext.columns = getResponsiveValue(
          contentRef.current!.clientWidth,
          columnContext.columns,
          columnContext.columnsGroup
        )

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
    }, [contentRef.current, scrollContainerRef?.current]);

    // 渲染视图内项目
    return (
      <div
        className={scrollContainerRef?.current ? "" : "xcn-waterfall-content"}
        ref={contentRef}
      >
        <div className={"xcn-waterfall-list"} ref={listRef}>
          {
            itemsToRender.map((item: WaterfallItems) => {
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
        </div>
        {bottomComponentFn && <div style={{width: '100%'}}>
          {bottomComponentFn(
            dataContext.bottomDataRequestCount,
            dataContext.dataLoading,
            dataContext.dataFinished
          )}
        </div>}
      </div>
    )
  }
)

const XCNWaterfall = forwardRef<WaterfallElement, WaterfallProps>(
  (
    {
      data = [],
      onRequestBottomMore,
      columns = 4,
      columnsGroup = {},
      scrollContainerRef = null,
      bottomCompRenderFn,
      ...props
    },
    ref
  ) => {
    const renderRef = useRef<WaterfallRenderElement>(null)

    const [columnContext] = useState<XCNWaterfallColumnContextProps>({
      columns: columns || 1,
      columnsGroup: columnsGroup,
      columnState: new Map(),
      columnWidth: 0,
      columnMaxHeight: 0,
      columnMinHeight: 0,
      bufferHeight: 1024,
      scrollTop: 0,
      renderNumber: 0,
      initState: () => {
      },
      computedPosition: () => {
      },
      computedItemsInView: () => [],
      setItemsToRender: () => {
      },
    })

    const [dataContext] = useState<XCNWaterfallDataContextProps>({
      data: data,
      sortedData: [],
      bottomDataRequestCount: 0,
      dataLoading: false,
      dataFinished: false,
    })


    const _handleRequestBottomMore = async () => {
      if (!onRequestBottomMore) return []

      dataContext.dataLoading = true
      renderRef.current!.refresh()
      const newData = await onRequestBottomMore()
      dataContext.dataLoading = false
      renderRef.current!.refresh()

      if (newData && newData.length !== 0) {
        return newData
      } else {
        dataContext.dataFinished = true
        renderRef.current!.refresh()
        return []
      }
    }

    return (
      <div className={"xcn-waterfall-container"} {...props}>
        <XCNWaterfallColumnContext.Provider value={columnContext}>
          <XCNWaterfallDataContext.Provider value={dataContext}>
            <RenderItems
              ref={renderRef}
              scrollContainerRef={scrollContainerRef}
              bottomComponentFn={bottomCompRenderFn}
              onRequestBottomMore={_handleRequestBottomMore}
            />
          </XCNWaterfallDataContext.Provider>
        </XCNWaterfallColumnContext.Provider>
      </div>
    )
  }
)

export default XCNWaterfall

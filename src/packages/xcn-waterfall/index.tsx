import "./styles/index.css"
import {forwardRef, memo, useContext, useEffect, useImperativeHandle, useRef, useState} from "react";
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
import useConsole from "./hooks/use-console.tsx";

const MemoItem = memo(
  (
    {
      item,
      colWidth
    }: {
      item: WaterfallItems,
      colWidth: number
    }
  ) => {
    const offsetLeft = item.renderColumn! * colWidth
    const Content = item.content
    return (
      <div
        className={"xcn-waterfall-item"}
        style={{
          width: colWidth,
          aspectRatio: `${item.width} / ${item.height}`,
          transform: `translate(${offsetLeft}px, ${item.renderTop}px)`,
        }}
      >
        <Content item={item}/>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.height === nextProps.item.height &&
      prevProps.item.width === nextProps.item.width &&
      prevProps.item.renderKey === nextProps.item.renderKey &&
      prevProps.item.renderColumn === nextProps.item.renderColumn &&
      prevProps.item.renderTop === nextProps.item.renderTop &&
      prevProps.item.renderHeight === nextProps.item.renderHeight &&
      prevProps.colWidth === nextProps.colWidth
    );
  }
)

const RenderItems = forwardRef<WaterfallRenderElement, WaterfallRenderProps>(
  (
    {
      bottomComponentFn,
      onRequestBottomMore,
      scrollContainer
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const columnContext = useContext(XCNWaterfallColumnContext)
    const dataContext = useContext(XCNWaterfallDataContext)

    const [itemsToRender, _setItemsToRender] = useState<WaterfallItems[]>([])

    const [, setTick] = useState(0)

    const log = useConsole()

    const cachedStartIdx = useRef<number>(0)
    const cachedEndIdx = useRef<number>(0)

    const getScrollContainer = (): [HTMLDivElement, number] => {
      let container: HTMLDivElement | null = null;
      let offsetTop: number;

      // 处理不同类型的 scrollContainer
      if (typeof scrollContainer === 'string') {
        // 字符串类型时使用选择器获取元素
        container = document.querySelector(scrollContainer) as HTMLDivElement;
      } else if (scrollContainer && 'current' in scrollContainer) {
        // RefObject 类型时获取 current
        container = scrollContainer.current;
      } else if (scrollContainer) {
        container = scrollContainer
      }

      if (container) {
        offsetTop = contentRef.current?.offsetTop || 0
      } else {
        container = contentRef.current;
        offsetTop = 0
      }

      return [container!, offsetTop]
    }

    const initState = () => {
      columnContext.columnState.clear()
      for (let i = 0; i < columnContext.columns; i++) {
        columnContext?.columnState.set(i.toString(), {
          height: 0
        })
      }
      columnContext.columnWidth = contentRef.current!.clientWidth / columnContext.columns;
      columnContext.renderNumber = (columnContext.renderNumber + 1) % 8;

      log.log(
        "initState",
        "renderNum", columnContext.renderNumber,
        "colW", columnContext.columnWidth,
        "clientW", contentRef.current!.clientWidth
      )
    }

    const computedPosition = () => {
      if (dataContext.dataLoading) {
        log.warn('dataLoading')
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

      log.log(
        "computedPosition",
        "maxColH", columnContext.columnMaxHeight,
        "minColH", columnContext.columnMinHeight,
      )
    }

    const computedItemsInView = (): [number, number] => {
      const [scrollBox, offsetHRelToScrollBox] = getScrollContainer()!

      const scrollTop = scrollBox.scrollTop - offsetHRelToScrollBox;

      const data = dataContext.sortedData;

      // 使用排序后的数据进行二分查找
      const startIndex = findClosestIndex(
        data,
        scrollTop - columnContext.bufferHeight,
        (item) => item.renderTop! + item.renderHeight!
      );

      const endIndex = findClosestIndex(
        data,
        scrollTop + scrollBox.clientHeight + columnContext.bufferHeight,
        (item) => item.renderTop!
      ) + 1;

      log.log(
        'computedItemsInView',
        "scrollTop", scrollTop,
        "offsetHRelToScrollBox", offsetHRelToScrollBox,
        "startIdx", startIndex || 0,
        "endIdx", endIndex > data.length ? data.length : endIndex,
      );

      return [
        startIndex || 0,
        endIndex > data.length ? data.length : endIndex
      ];
    };

    const setItemsToRender = (renderRange: [number, number], force?: boolean) => {
      const [startIndex, endIndex] = renderRange;

      if (
        startIndex === cachedStartIdx.current &&
        endIndex === cachedEndIdx.current &&
        !force
      ) {
        return
      }

      cachedStartIdx.current = startIndex
      cachedEndIdx.current = endIndex

      const data = dataContext.sortedData;

      const dataToRender = data.slice(
        startIndex,
        endIndex
      );

      _setItemsToRender(dataToRender)
    }

    const fullRerender = debounce(() => {
      log.log('fullRerender')

      initState()
      computedPosition()
      setItemsToRender(computedItemsInView())
    })

    // 处理添加数据
    const addBottomData = (
      fn: (bottomDataRequestCount: number) => Promise<WaterfallItems[]>
    ) => {
      fn(dataContext.bottomDataRequestCount)
        .then((newData) => {
          dataContext.data.push(...newData)
          dataContext.bottomDataRequestCount++
          if (newData.length !== 0) {
            initState()
            computedPosition()
            setItemsToRender(computedItemsInView())
          }
          log.log('addBottomData', newData)
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
      log.log('首次渲染, listRef')
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
      const [scrollBox, offsetHRelToScrollBox] = getScrollContainer() || null;

      // 滚动事件处理
      const handleScroll = rafThrottle(() => {
        if (!scrollBox) return;

        columnContext.scrollTop = scrollBox.scrollTop;
        setItemsToRender(computedItemsInView());

        if (columnContext.scrollTop + scrollBox.clientHeight
          >= columnContext.columnMinHeight - columnContext.bufferHeight
        ) {
          if (!dataContext.dataLoading && !dataContext.dataFinished) {
            log.log('触发加载更多, addBottomData')
            addBottomData(onRequestBottomMore);
          }
        }

        log.log(
          'scroll handler',
          "scrollTop", columnContext.scrollTop,
        )
      });

      // 响应式处理
      const handleResize = debounce(() => {
        if (!contentRef.current) return;

        columnContext.columns = getResponsiveValue(
          contentRef.current.clientWidth,
          columnContext.columns,
          columnContext.columnsGroup
        );

        initState();
        computedPosition();
        setItemsToRender(computedItemsInView(), true);

        log.log(
          'resize handler',
          "columns", columnContext.columns,
          "clientW", contentRef.current.clientWidth,
        )
      });

      const resizeObserver = new ResizeObserver(handleResize);

      // 绑定监听
      if (scrollBox) {
        scrollBox.addEventListener('scroll', handleScroll);
        resizeObserver.observe(scrollBox);
      }

      log.log(
        '初始化监听',
        "contentRef", contentRef,
        "scrollContainer", scrollContainer,
        "scrollBox", scrollBox,
      )

      // 清理函数
      return () => {
        if (scrollBox) {
          scrollBox.removeEventListener('scroll', handleScroll);
          resizeObserver.unobserve(scrollBox);
        }
      };
    }, [contentRef, scrollContainer]); // 依赖项调整为 ref 对象本身

    // 渲染视图内项目
    return (
      <div
        className={scrollContainer ? "xcn-waterfall-content-outer-scroll" : "xcn-waterfall-content"}
        ref={contentRef}
      >
        <div className={"xcn-waterfall-list"} ref={listRef}>
          {
            itemsToRender.map((item: WaterfallItems) => {
              return <MemoItem
                key={item.renderKey}
                item={item}
                colWidth={columnContext.columnWidth}
              />
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
      onRequestBottomMore = () => [],
      columns = 4,
      columnsGroup = {},
      scrollContainer = null,
      bottomCompRenderFn,
      debugMode = false,
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
      debugMode: debugMode,
      initState: () => {
      },
      computedPosition: () => {
      },
      computedItemsInView: () => [0, 0],
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
              scrollContainer={scrollContainer}
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

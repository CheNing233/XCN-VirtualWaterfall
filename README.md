# XCN Virtual Waterfall

![React](https://img.shields.io/badge/react-58C4DC?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

一个简单的定宽不定高虚拟列表瀑布流组件，使用`react + ts`编写，适用于`react`项目

## Feature

- [x] 支持虚拟列表
- [x] 自定义列数
- [x] 响应式
- [x] 支持自定义底部元素
- [x] 支持使用钩子动态更改单个项目渲染
- [ ] (待开发)根据宽度动态调整开关，适合停止滚动，宽度归0的场景

## Usage

### 1. Install

```shell
npm install xcn-waterfall
```

### 2. Import

```tsx
import {useXCNWaterfallItem, XCNWaterfall} from "xcn-waterfall";
```

### 3. Use

```tsx
<XCNWaterfall
  data={data}
  onRequestMore={handleRequestMore}
  bottomComponent={<h3>waterfall bottom</h3>}
  style={{
    height: '80vh',
    width: '80vw',
  }}
/>
```
### Full Example

可查看`src/example`目录

```tsx
// src/example/example-1.tsx

import {useState} from "react";

// some tools
import {generateRandomId, generateRandomObjects} from "./tools.ts";

import {useXCNWaterfallItem, XCNWaterfall} from "xcn-waterfall";

// build your item component
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
    // ** You can use initial data, or use empty **
    // 
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
      } // as WaterfallItem
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    return newData // as WaterfallItem[]
  }

  return (
    <>
      <XCNWaterfall
        data={data}
        onRequestMore={handleRequestMore}
        bottomComponent={<h3>waterfall bottom</h3>}
        style={{ // style and other props will inject to xcn-waterfall-container
          height: '80vh',
          width: '80vw',
        }}
      />
    </>
  )
}

export default Example1
```

## Props

```tsx
// XCNWaterfall props
export interface WaterfallProps {
  columns?: number;
  data?: WaterfallItems[];
  bottomComponent?: React.ReactNode;
  onRequestMore?: () => Promise<WaterfallItems[]>;
}

// WaterfallItems, onRequestMore need return WaterfallItems[]
export interface WaterfallItems {
  id: string;
  height: number;
  width: number;
  content: () => any;

  // don't use it, it is used by xcn-waterfall
  renderKey?: string;
  renderColumn?: number;
  renderTop?: number;
  renderHeight?: number;

  // custom props, you can use it to customize your item or save state
  [key: string]: any;
}

// useXCNWaterfallItem, get item or update item
function useXCNWaterfallItem(itemId: string) => {
  item: WaterfallItems;
  updateItem: (newItemData: Partial<WaterfallItems>) => void;
}
```

## License

[MIT](LICENSE.txt)
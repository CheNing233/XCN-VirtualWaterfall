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
  // 初始数据
  data={data}
  // 列数
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
```

### Tips

- 使用`useXCNWaterfallItem`钩子动态更改单个项目渲染，比如单个卡片内的计数器
- 优先使用`columnsGroup`属性设置列数，如果没有该属性，则使用`columns`属性，响应式是基于容器宽度而不是window宽度

### Full Example

可查看`src/example`目录

## Props

[接口参数](src/packages/xcn-waterfall/interface.ts)

## License

[MIT](LICENSE.txt)
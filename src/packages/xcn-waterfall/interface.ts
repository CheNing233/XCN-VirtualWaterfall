import * as React from "react";
import {RefObject} from "react";

/*
* 瀑布流列表项，用来渲染每个格子
* @id 唯一标识，可以用 useXCNWaterfallItem 钩子获取并修改
* @height 列表项高度
* @width 列表项宽度
* @content 列表项内容，一个返回 React 元素的函数
* @xxxxx 自定义属性，可以用来保存列表项 state
* @renderKey 列表项渲染时的 key，自动生成，不要改动
* @renderColumn 列表项渲染时的列索引，自动生成，不要改动
* @renderTop 列表项渲染时的顶部距离，自动生成，不要改动
* @renderHeight 列表项渲染时的高度，自动生成，不要改动
* */
export interface WaterfallItems {
  id: string;
  height: number;
  width: number;
  content: (props: { item: WaterfallItems, [key: string]: any }) => any;

  renderKey?: string;
  renderColumn?: number;
  renderTop?: number;
  renderHeight?: number;

  [key: string]: any;
}

// @xs 对应超小屏幕（如手机），通常为屏幕宽度 <= 576px
// @sm 对应小屏幕（如平板），通常为屏幕宽度 > 576px 且 <= 768px
// @md 对应中等屏幕（如大平板或小型桌面显示器），通常为屏幕宽度 > 768px 且 <= 992px
// @lg 对应大屏幕（如大显示器），通常为屏幕宽度 > 992px 且 <= 1200px
// @xl 对应超大屏幕，通常为屏幕宽度 > 1200px 且 <= 1600px
// @xxl 对应特大屏幕，通常为屏幕宽度 > 1600px
// @xxxl 对应超特大屏幕，通常为屏幕宽度 > 1920px
export interface WaterfallSize {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  xxxl?: number;
}

export type scrollElement = HTMLDivElement | string | RefObject<HTMLDivElement>;

export interface WaterfallProps {
  columns?: number;
  columnsGroup?: WaterfallSize;
  data?: WaterfallItems[];
  scrollContainer?: scrollElement;
  bottomCompRenderFn?: (reqCount: number, isLoading: boolean, isFinished: boolean) => React.ReactNode;
  onRequestBottomMore?: (reqCount: number) => Promise<WaterfallItems[]>;
  debugMode?: boolean;

  style?: React.CSSProperties;
  className?: string;

  [key: string]: any;
}

export interface WaterfallElement extends Partial<HTMLDivElement> {
  [key: string]: any;
}

export interface WaterfallRenderProps {
  onRequestBottomMore: (reqCount: number) => Promise<WaterfallItems[]>;
  scrollContainer?: scrollElement;
  bottomComponentFn?: (reqCount: number, isLoading: boolean, isFinished: boolean) => React.ReactNode;
}

export interface WaterfallRenderElement extends Partial<HTMLDivElement> {
  initState: () => void;
  computedPosition: () => void;
  setItemsToRender: (renderRange: [number, number], force?: boolean) => void
  computedItemsInView: () => [number, number];
  addBottomData: (fn: () => Promise<WaterfallItems[]>) => void;
  refresh: () => void;
  updateItemById: (id: string, newItemState: Partial<WaterfallItems>) => void;
  updateItem: (
    // 根据 findFn => true 找到对应的 item，并更新其状态
    findFn: (item: WaterfallItems) => boolean,
    newItemState: Partial<WaterfallItems>
  ) => void;
}

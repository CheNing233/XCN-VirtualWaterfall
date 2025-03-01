import {createContext} from "react";
import {WaterfallItems, WaterfallSize} from "../interface.ts";


export interface XCNWaterfallColumnContextProps {
  columns: number;
  columnsGroup: WaterfallSize;
  columnWidth: number;
  columnState: Map<string, any>;
  columnMaxHeight: number;
  columnMinHeight: number;
  bufferHeight: number;
  scrollTop: number;
  renderNumber: number;
  debugMode: boolean;
  initState: () => void;
  computedPosition: () => void;
  computedItemsInView: () => [number, number],
  setItemsToRender: (renderRange: [number, number], force?: boolean) => void,
  fullReRender: () => void,
}

export const initialColumnContext: XCNWaterfallColumnContextProps = {
  columns: 0,
  columnsGroup: {},
  columnWidth: 0,
  columnState: new Map(),
  columnMaxHeight: 0,
  columnMinHeight: 0,
  bufferHeight: 1024,
  scrollTop: 0,
  renderNumber: 0,
  debugMode: false,
  initState: () => {
  },
  computedPosition: () => {
  },
  computedItemsInView: () => [0, 0],
  setItemsToRender: () => {
  },
  fullReRender: () => {
  },
};

export const XCNWaterfallColumnContext =
  createContext<XCNWaterfallColumnContextProps>(initialColumnContext);

export interface XCNWaterfallDataContextProps {
  data: Array<any>;
  sortedData: Array<any>;
  bottomDataRequestCount: number;
  dataLoading: boolean;
  dataFinished: boolean;
  updateItemById: (id: string, newItemState: Partial<WaterfallItems>) => void;
  updateItem: (
    // 根据 findFn => true 找到对应的 item，并更新其状态
    findFn: (item: WaterfallItems) => boolean,
    newItemState: Partial<WaterfallItems>
  ) => void;
}

export const initialDataContext: XCNWaterfallDataContextProps = {
  data: [],
  sortedData: [],
  bottomDataRequestCount: 0,
  dataLoading: false,
  dataFinished: false,
  updateItemById: () => {
  },
  updateItem: () => {
  },
};

export const XCNWaterfallDataContext =
  createContext<XCNWaterfallDataContextProps>(initialDataContext);

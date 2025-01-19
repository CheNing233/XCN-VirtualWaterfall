import {createContext} from "react";


export interface XCNWaterfallColumnContextProps {
  columns: number;
  columnWidth: number;
  columnState: Map<string, any>;
  columnMaxHeight: number;
  columnMinHeight: number;
  bufferHeight: number;
  scrollTop: number;
  renderNumber: number;
}

export const initialColumnContext: XCNWaterfallColumnContextProps = {
  columns: 0,
  columnWidth: 0,
  columnState: new Map(),
  columnMaxHeight: 0,
  columnMinHeight: 0,
  bufferHeight: 1024,
  scrollTop: 0,
  renderNumber: 0,
};

export const XCNWaterfallColumnContext =
  createContext<XCNWaterfallColumnContextProps>(initialColumnContext);

export interface XCNWaterfallDataContextProps {
  data: Array<any>;
  sortedData: Array<any>;
  bottomDataRequestCount: number;
  dataLoading: boolean;
  dataFinished: boolean;
}

export const initialDataContext: XCNWaterfallDataContextProps = {
  data: [],
  sortedData: [],
  bottomDataRequestCount: 0,
  dataLoading: false,
  dataFinished: false,
};

export const XCNWaterfallDataContext =
  createContext<XCNWaterfallDataContextProps>(initialDataContext);
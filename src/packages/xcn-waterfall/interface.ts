import * as React from "react";

export interface WaterfallItems {
  id: string;
  height: number;
  width: number;
  content: () => any;

  renderKey?: string;
  renderColumn?: number;
  renderTop?: number;
  renderHeight?: number;

  [key: string]: any;
}

export interface WaterfallProps {
  columns?: number;
  data?: WaterfallItems[];
  bottomComponent?: React.ReactNode;
  onRequestMore?: () => Promise<WaterfallItems[]>;
}
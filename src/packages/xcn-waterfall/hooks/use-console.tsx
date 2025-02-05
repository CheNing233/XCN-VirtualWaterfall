import {useContext} from "react";
import {XCNWaterfallColumnContext} from "../context/index.tsx";


const useConsole = (...args: any[]) => {
  const columnContext = useContext(XCNWaterfallColumnContext)

  if (columnContext.debugMode) {
    return console
  } else {
    return {
      log: () => {
      },
      warn: () => {
      },
      error: () => {
      },
      info: () => {
      },
      debug: () => {
      },
    }
  }
};

export default useConsole

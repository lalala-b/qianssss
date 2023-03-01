/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { useState, createContext } from "react";

declare interface GlobalType {
  loadGlobalFinish: boolean;
  globalData: any;
  setLoadGlobalFinish?: React.Dispatch<boolean>;
  setGlobalData?: React.Dispatch<any>;
}

declare interface GlobalProviderType {
  value?: GlobalType;
}

export const GlobalContext = createContext<GlobalType>({
  globalData: {},
  loadGlobalFinish: false,
});

GlobalContext.displayName = "GlobalContext";

interface GlobalObserverListType {
  [key: string]: (React.Dispatch<any> | (() => void))[];
}

interface GlobalObserverType {
  list: GlobalObserverListType;
  on: (key: string, fn: React.Dispatch<any>) => void;
  emit: (key: string, data: any) => void;
}

export const GlobalObserver: GlobalObserverType = {
  list: {},
  on(key, fn) {
    if (!this.list[key]) {
      this.list[key] = [];
    }
    this.list[key].push(fn);
  },
  emit(key, data) {
    (this.list[key] || []).forEach((item: React.Dispatch<any>) => {
      item(data);
    });
  },
};


export const GlobalProvider: React.FC<GlobalProviderType> = ({
  value,
  children,
}) => {
  const [globalData, setGlobalData] = useState<any>({});
  const [loadGlobalFinish, setLoadGlobalFinish] = useState(false)

  GlobalObserver.on("setGlobalData", setGlobalData);
  GlobalObserver.on("setLoadGlobalFinish", setLoadGlobalFinish);
  
  return (
    <GlobalContext.Provider
      value={{
        ...value,
        loadGlobalFinish,
        setLoadGlobalFinish,
        globalData,
        setGlobalData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

import { GlobalObserver } from "src/contexts/global";

export const setGlobalData = (data: any): void => {
  GlobalObserver.emit("setGlobalData", data);
};

export const setLoadGlobalFinish = (data: any): void => {
  GlobalObserver.emit("setLoadGlobalFinish", data);
};

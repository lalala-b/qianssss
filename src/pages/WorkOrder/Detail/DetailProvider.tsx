/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { useState, createContext, useEffect } from "react";
import { message } from "antd";
import qs from "qs";
import { useLocation } from "react-router";
import {
  $getOrderDetailProgress,
  $getOrderDetail,
  GetOrderDetailNodeBOListResType,
  GetOrderDetailResType,
} from "src/api/workOrderDetail";
import { cloneDeep } from "lodash";

declare interface DetailType {
  loading: boolean;
  SPECIAL_MAP: string[];
  setLoading: React.Dispatch<boolean>;
  currentStep: number;
  setCurrentStep: React.Dispatch<number>;
  progressList: GetOrderDetailNodeBOListResType[];
  setProgressList: React.Dispatch<GetOrderDetailNodeBOListResType[]>;
  detail: GetOrderDetailResType;
  setDetail: React.Dispatch<GetOrderDetailResType>;
  onRefresh: () => void;
}

declare interface DetailProviderType {
  value?: DetailType;
}

export const DetailContext = createContext<DetailType>({} as DetailType);

DetailContext.displayName = "DetailContext";

interface DetailObserverListType {
  [key: string]: (React.Dispatch<any> | (() => void))[];
}

interface DetailObserverType {
  list: DetailObserverListType;
  on: (key: string, fn: React.Dispatch<any>) => void;
  emit: (key: string, data: any) => void;
}

export const DetailObserver: DetailObserverType = {
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

export const DetailProvider: React.FC<DetailProviderType> = ({
  value,
  children,
}) => {
  const location = useLocation();
  const [detail, setDetail] = useState<GetOrderDetailResType>(
    {} as GetOrderDetailResType
  );
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressList, setProgressList] = useState<
    GetOrderDetailNodeBOListResType[]
  >([]);

  DetailObserver.on("setDetail", setDetail);

  const getOrderDetailProgress = async () => {
    try {
      const { id } = qs.parse(location.search.split("?")[1]);
      if (!id) return;

      const res = await $getOrderDetailProgress({ orderNo: id as string });
      setProgressList(res.nodeBOList);
      const index = res.nodeBOList.findIndex(
        item => +item.nodeStatus === 1 || +item.nodeStatus === 3
      );
      setCurrentStep(index > -1 ? index : res.nodeBOList.length);
    } catch (e: any) {
      setLoading(false);
      message.error(String(e.message) || "获取进度错误，请重试");
    }
  };

  const getDetail = async () => {
    try {
      const { id } = qs.parse(location.search.split("?")[1]);
      if (!id) return;
      const res = await $getOrderDetail({ orderNo: id as string });
      const resList:any=cloneDeep(res)
      if (resList){
        for (const k in resList){
          resList[k]=resList[k]||{}
        }
      }
      setDetail(resList);
    } catch (e: any) {
      setLoading(false);
      message.error(String(e.message) || "获取详情错误，请重试");
    }
  };

  const initData = async () => {
    setLoading(true);
    await getOrderDetailProgress();
    await getDetail();
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <DetailContext.Provider
      value={{
        ...value,
        SPECIAL_MAP: ['', '图文', '代制作', '跨工作室合作', '采访', '线下活动', 'B站动态', '其他'],
        loading,
        setLoading,
        currentStep,
        setCurrentStep,
        progressList,
        setProgressList,
        detail,
        setDetail,
        onRefresh: initData,
      }}
    >
      {children}
    </DetailContext.Provider>
  );
};

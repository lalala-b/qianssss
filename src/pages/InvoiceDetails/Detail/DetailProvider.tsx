/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { useState, createContext, useEffect } from "react";
import { message } from "antd";
import qs from "qs";
import { useLocation } from "react-router";
import {
  $getBusinessDetailProgress,
  $getInvoiceDetailProgress,
  $getInvoiceDetail,
  GetOrderDetailNodeBOListResType,
  GetOrderDetailResType,
  GetInvoiceDetailProgress,
} from "src/api/invoiceDetail";

declare interface DetailType {
  loading: boolean;
  setLoading: React.Dispatch<boolean>;
  currentStep: number;
  setCurrentStep: React.Dispatch<number>;
  progressList: GetOrderDetailNodeBOListResType[];
  setProgressList: React.Dispatch<GetOrderDetailNodeBOListResType[]>;
  opUserName: string;
  detail: GetOrderDetailResType;
  setDetail: React.Dispatch<GetOrderDetailResType>;
  processStep: number;
  honorAgreementRate: string;
  rebateMoney: number;
  failMsg: string;
  paymentStatus: number;
  instanceId: string;
  businessKey: string;
  onRefresh: () => void;
  businessOrderId: any;
  rebateType: any;
  setRebateType: React.Dispatch<number>;
  from: any;
  PAY_LIST: any[];
  COL_LIST: any[];
  // baseInfo:any
  // 开票
  applyAuth?:boolean;// 能否申请OA付款单  1 可以  0不可以
  invoiceProcessStep?: number | undefined;
  invoiceFailMsg?: string;
  invoiceStatus?: number;
  contractUrl?: string;
  financeUserName?: string;
  customerBackOpUserName?: string;
  financeUserNameList?: string[];
  invoiceDate?: string;
  backMoneyPeriod?: string;
  backMoneyStopTime?: string;
  cusOfflineSupplement?: number;
  customerMoneyDate?: string;
  platOrderCharge?: number;
  officePrice?: number;
  customerBackProve?: string;
  customerMoneyStatus?: number;
  isFinanceOk?: number;
  isFinanceOkDesc?:string;
}

declare interface DetailProviderType {
  value?: DetailType;
}
declare interface ProgressListType {
  nodeName: string;
  nodeStep: number;
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
  const {
    tabTypeStr = "",
    from = "",
    businessOrderId = "",
  } = qs.parse(location.search.split("?")[1]);
  const [rebateType, setRebateType] = useState<number>(0);
  const PAY_LIST = [
    { nodeName: "工单履约", nodeStep: 0 },
    { nodeName: "发起OA付款申请", nodeStep: 1 },
    { nodeName: "付款申请审批", nodeStep: 2 },
  ];
  const COL_LIST = [
    { nodeName: "发起OA开票申请", nodeStep: 0 },
    { nodeName: "开票申请审批", nodeStep: 1 },
    { nodeName: "填写回款周期", nodeStep: 2 },
    { nodeName: "客户回款", nodeStep: 3 },
    { nodeName: "回款信息审核", nodeStep: 4 },
  ];
  const [progressList, setProgressList] =
    useState<ProgressListType[]>(PAY_LIST);
  const [detail, setDetail] = useState<GetOrderDetailResType>(
    {} as GetOrderDetailResType
  );
  const [baseInfo, setBaseInfo] = useState<GetInvoiceDetailProgress>(
    {} as GetInvoiceDetailProgress
  );
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  DetailObserver.on("setDetail", setDetail);
  // 获取商单线下应付（对公/对私）的数据
  const getBusinessDetailProgress = async () => {
    try {
      // rebateType: 1对公 2 对私
      if (!businessOrderId) return;
      const res = await $getBusinessDetailProgress({
        businessOrderId:Number(businessOrderId),
        rebateType:+rebateType===2?1:2,
      });
      setBaseInfo(res);
      setCurrentStep(res.processStep);
    } catch (e: any) {
      setLoading(false);
      message.error(String(e.message) || "获取进度错误，请重试");
    }
  };
  // 获取商单线下应收数据
  const getInvoiceDetailProgress = async () => {
    try {
      if (!businessOrderId) return;
      const res = await $getInvoiceDetailProgress({
        businessOrderId: Number(businessOrderId),
      });
      setBaseInfo(res);
      setCurrentStep(res.invoiceProcessStep || 0);
    } catch (e: any) {
      setLoading(false);
      message.error(String(e.message) || "获取进度错误，请重试");
    }
  };
  // 获取商单详情
  const getDetail = async () => {
    try {
      if (!businessOrderId) return;
      const res = await $getInvoiceDetail({
        businessOrderId: Number(businessOrderId),
      });
      setDetail(res);
    } catch (e: any) {
      setLoading(false);
      message.error(String(e.message) || "获取详情错误，请重试");
    }
  };
  const initData = async () => {
    setLoading(true);
    if (+rebateType === 1) {
      // 应收
      await getInvoiceDetailProgress();
    } else {
      // 应付
      await getBusinessDetailProgress();
    }
    await getDetail();
    setLoading(false);
  };
  useEffect(() => {
    const tabTypeList:any = tabTypeStr
    if (tabTypeList.includes(1)) {
      setProgressList([...COL_LIST]);
      setRebateType(1);
    } else if (tabTypeList.includes('2')||tabTypeList.includes('3')) {
      setProgressList([...PAY_LIST]);
      setRebateType(tabTypeList.includes('2') ? 2: 3);
      
    }
  }, [tabTypeStr]);
  useEffect(() => {
    if (rebateType){
      initData();
    } else {
      getDetail()
    }
    
  }, [rebateType]);
  return (
    <DetailContext.Provider
      value={{
        ...value,
        ...baseInfo,
        loading,
        setLoading,
        currentStep,
        setCurrentStep,
        progressList,
        setProgressList,
        detail,
        setDetail,
        onRefresh: initData,
        businessOrderId,
        rebateType,
        setRebateType,
        from,
        PAY_LIST,
        COL_LIST,
      }}
    >
      {children}
    </DetailContext.Provider>
  );
};

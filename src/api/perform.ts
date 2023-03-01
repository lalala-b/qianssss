import Request from "src/http/request";
import {
  OrderConditionResponse,
  OrderCrmGroupInfoResponse,
  OrderListResponse,
  OrderListRequest,
  OrderOrderCountResponse,
  OrderOrderCountRequest,
  OverListType,
  PlatInfoType,
  AccountInfoType,
} from "./types/performType";

export const $getCondition: () => Promise<OrderConditionResponse> = () =>
  Request.get(`/group/order/condition`);
// 商务小组和团队
export const $getCrmGroupInfo: () => Promise<OrderCrmGroupInfoResponse> = () =>
  Request.get(`/qp/perform/business/order/info/getOrgInfo`);
// 获取执行人小组和人员
export const $getPerformOrgInfo: () => Promise<OrderCrmGroupInfoResponse> =
  () => Request.get(`/qp/perform/order/info/findExecuteTeamTree`);
// 获取执行管理平台
export const $getPlatInfo: () => Promise<AccountInfoType[]> = () =>
  Request.get(`/qp/perform/order/info/findPlatInfo`);
// 获取执行管理平台
export const $getAccountInfo: (params?: {
  platIds?: string[];
}) => Promise<PlatInfoType[]> = params =>
  Request.get(`/qp/perform/order/info/findAccountInfos`, { params });
// 获取执行订单的数量
export const $orderCount: (
  params: OrderOrderCountRequest
) => Promise<OrderOrderCountResponse> = (params: OrderOrderCountRequest) =>
  Request.get(`/qp/perform/execute/manager/statisticsCount`, {
    params,
  });
// 超时概览获取
export const $getoverTimeList: (
  params: OrderOrderCountRequest
) => Promise<OverListType> = (params: OrderOrderCountRequest) =>
  Request.get(`/qp/perform/execute/manager/executeOrderStatistics`, {
    params,
  });

// 工单统计金额数据获取
export interface StatisticsAmountListType {
  orderActualIncomeSum: number;
  performanceMoneySum: number;
  performOrderCount: number;
  performOrderRate: number;
  performDelayCount: number;
  performDelayRate: number;
  cancelOrderCount: number;
  cancelOrderRate: number;
}
export const $getStatisticsAmount: (
  params: OrderOrderCountRequest
) => Promise<StatisticsAmountListType> = (params: OrderOrderCountRequest) =>
  Request.get(`/qp/perform/execute/manager/statisticsAmount`, {
    params,
  });

export const $getList: (
  params: OrderListRequest
) => Promise<OrderListResponse> = (params: any = {}) =>
  Request.get(`/qp/perform/execute/manager/executeOrderList`, {
    params,
  });

type GetByDictTypeRequestType = {
  dictTypes?: any;
};

export type GetByDictTypeResponseType = {
  dictLabel: string;
  dictValue: string;
  extValue: string;
}[];

export const $getByDictType: (
  params: GetByDictTypeRequestType
) => Promise<GetByDictTypeResponseType> = (
  params: GetByDictTypeRequestType = {}
) => Request.post(`/sys/dict/data/getByDictType`, params);

// 获取执行人列表数据
export const $getExecutorByOrgId: (
  params: {
    orgId: number
  }
) => Promise<GetByDictTypeResponseType> = (
  params: {
    orgId: number
  }
) => Request.get(`/qp/perform/executor/findExecutorByOrgId`, {params});

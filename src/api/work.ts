import Request from "src/http/request";
import {
  OrderCrmGroupInfoResponse,
  OrderListResponse,
  OrderListRequest,
  OrderOrderCountResponse,
  OrderOrderCountRequest,
  OverListType,
  PlatInfoType,
  AccountInfoType,
} from "./types/workType";
// 查询订单归属组织及人员
export const $getBelongOrgTree: () => Promise<OrderCrmGroupInfoResponse> = () =>
  Request.get(`/qp/perform/order/info/findBelongOrgTree?time=${Math.random()}`);
// 商务小组和团队
export const $getCrmGroupInfo: () => Promise<OrderCrmGroupInfoResponse> = () =>
  Request.get(`/qp/perform/business/order/info/getOrgInfo`);
  // 获取执行人小组和人员
export const $getPerformOrgInfo: () => Promise<OrderCrmGroupInfoResponse> =
  () => Request.get(`/qp/perform/order/info/findExecuteTeamTree`);
  // 获取执行管理平台
  export const $getPlatInfo: () => Promise<AccountInfoType[]> =
  () => Request.get(`/qp/perform/order/info/findPlatInfo`);
  // 获取执行管理平台
  export const $getAccountInfo: (params?:{platIds?:string[]}) => Promise<PlatInfoType[]> =
  params => Request.get(`/qp/perform/order/info/findAccountInfos`,{params});
export const $orderCount: (
  params: OrderOrderCountRequest
) => Promise<OrderOrderCountResponse> = (params: OrderOrderCountRequest) =>
  Request.get(`/qp/perform/order/info/statisticsCount`, {
    params,
  });

export const $getStatisticsAmount: (
  params: OrderListRequest
) => Promise<OverListType> = (params: OrderListRequest) =>
  Request.get(`/qp/perform/order/info/statisticsAmount`, {
    params,
  });
export const $getList: (
  params: OrderListRequest
) => Promise<OrderListResponse> = (params: any = {}) =>
  Request.get(`/qp/perform/order/info/performOrderList`, {
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

// 商机-获取商机合作品类
export interface GetCoCateListItemResType {
  id: number;
  name: string;
  isDeleted: number;
  child?: GetCoCateListItemResType[];
}

export const $getCoCateList: () => Promise<GetCoCateListItemResType[]> = () =>
  Request.get(`/qp/perform/order/info/coCateList`);
import Request from "src/http/request";
import {
  OrderConditionResponse,
  OrderCrmGroupInfoResponse,
  OrderListResponse,
  OrderListRequest,
  OrderSignPlatAccountLinkageResponse,
  OrderSignPlatAccountLinkageRequest,
  OrderOrderCountResponse,
  OrderOrderCountRequest,
} from "./types/studioType";

export const $getCondition: () => Promise<OrderConditionResponse> = () =>
  Request.get(`/group/order/condition`);

export const $getCrmGroupInfo: () => Promise<OrderCrmGroupInfoResponse> = () =>
  Request.get(`/sign/order/crmGroupInfo`);

export const $orderCount: (
  params: OrderOrderCountRequest
) => Promise<OrderOrderCountResponse> = (params: OrderOrderCountRequest) =>
  Request.get(`/group/order/orderCount`, {
    params,
  });

export const $getList: (
  params: OrderListRequest
) => Promise<OrderListResponse> = (params: any = {}) => Request.get(`/group/order/list`, {
    params,
  });

export const $signPlatAccountLinkage: (
  params: OrderSignPlatAccountLinkageRequest
) => Promise<OrderSignPlatAccountLinkageResponse> = (
  params: OrderSignPlatAccountLinkageRequest
) => Request.get(`/group/order/groupPlatAccountLinkage`, {params});

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

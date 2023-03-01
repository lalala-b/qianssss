/* eslint-disable import/export */
/* eslint-disable import/prefer-default-export */
import Request from "src/http/request";

export interface GetOrderDetailNodeBOListResType {
  nodeName: string;
  nodeStep: number;
}
export interface GetInvoiceDetailProgress {
  processStep: number;
  honorAgreementRate: string;
  rebateMoney: number;
  failMsg: string;
  paymentStatus: number;
  instanceId: string;
  businessKey: string;
  opUserName: string;
}

// 查看商单单详情整体进度
export const $getBusinessDetailProgress: (params: {
  businessOrderId: number;
  rebateType: number;
}) => Promise<GetInvoiceDetailProgress> = params =>
  Request.get(`/qp/perform/business/order/info/paymentProcess`, { params });

// 查看开发票整体进度
export const $getInvoiceDetailProgress: (params: {
  businessOrderId: number;
}) => Promise<any> = params =>
  Request.get(`/qp/perform/business/order/info/invoiceProcess`, { params });

export interface CustomerBackMoney {
  customerMoneyStatus: number;
  customerMoneyDate: string;
  customerBackProve: string[];
  businessOrderId: number;
}
export interface GetOrderDetailResType {
  rebateCorporate: number;
  rebatePrivate: number;
  offlineRecTypeStr: string;
  busOrderType: number;
  busOrderId: number;
}
export interface FinanceOkType {
  isFinanceOk: number;
  failMsg?: string;
  businessOrderId: number | string;
}
export interface BackMoneyPeriodType {
  backMoneyPeriod: number;
  businessOrderId: number;
}
// 获取商单详情
export const $getInvoiceDetail: (params: {
  businessOrderId: number;
}) => Promise<GetOrderDetailResType> = params =>
  Request.get(`/qp/perform/business/order/info/businessOrderInfo`, { params });

// 填写客户回款
export const $customerBackMoney: (params: CustomerBackMoney) => void = params =>
  Request.post(`/qp/perform/business/order/info/customerBackMoney`, params);

// 财务回款审批
export const $financeOk: (params: FinanceOkType) => Promise<any> = params =>
  Request.post(`/qp/perform/business/order/info/financeOk`, params);

// 财务填写回款天数
export const $addBackMoneyPeriod: (
  params: BackMoneyPeriodType
) => Promise<any> = params =>
  Request.post(`/qp/perform/business/order/info/addBackMoneyPeriod`, params);

// 跳过开票
export const $skipInvoice: (params: {
  busOrderId: number;
}) => Promise<boolean> = params =>
  Request.post(`/qp/perform/business/order/info/oaSkipInvoice`, params);

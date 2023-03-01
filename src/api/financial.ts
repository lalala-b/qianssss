/* eslint-disable max-len */
import Request from "src/http/request";
// eslint-disable-next-line import/prefer-default-export
export interface FinancialParamType {
    busOrderStatus?: string;
    coCateId?:string|number;
    belongGroupId?:string|number;
    belongTeamId?:string|number;
    executeGroupId?:string|number;
    busOrderTypes?:number[];
    brandId?:string|number;
    coProduct?:string|number;
    busOrderNo?:string|number;
    customerPaymentResultType?:string|number;
    ourCompanyPaymentResultType?:string|number;
    businessOrderTimeStart?:string|number;
    businessOrderTimeEnd?:string|number;
    customerTradeTimeStart?:string|number;
    customerTradeTimeEnd?:string|number;
    determined?:string|number;
    pageNum?:string|number;
    size?:string|number;
  }
  export interface BusinessResultType {
    list: BusinessResultListType[];
    data: BusinessResultDataType;
  }
  export interface BusinessResultDataType {
    coPriceSum?:number;
    performanceMoneySum?:number;
    businessOrderCount?:number;
    performanceInStatusCount?:number;
    performedStatusCount?:number;
    auditedAccountsOrderCount?:number;
  }
  export interface BusinessResultListType {
    busOrderNo?:number;
    busOrderStatus?:number;
    customerId?:number;
    customerName?:string;
    companyName?:string;
    brandName?:string;
    coProductName?:string;
    coCateName?:string;
    businessUserName?:string;
    belongGroupName?:string;
    createTime?:string;
    busOrderType?:number
    honorAgreementRate?:string;
    coPrice?:number;
    rebateCorporate?:number;
    rebatePrivate?:number;
    performanceMoney?:number;
    grossProfitRate?:number;
    cusOfflineSupplement?:number;
    companyOfflineSupplement?:number;
    otherCost?:number;
    paymentType?:number;
    paymentResult?:number;
    tradeTime?:number;
    tradeScreenshots?:number;
    executeGroupName?:number;
  }
export const $getList: (
    params: FinancialParamType
  ) => Promise<BusinessResultType[]> = (params: any = {}) =>{
    console.info(params)
    return Request.get(`/qp/perform/business/financial/list`, {
      params,
    });
  }
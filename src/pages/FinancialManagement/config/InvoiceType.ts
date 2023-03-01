export interface DetailDataType {
    orderTime: number;
    companyName: string;
    coPrice: string;
    customerName: string;
    rebateCorporate: string;
    brandName: string;
    coProductName: string;
    rebatePrivate: string;
    coCateName: string;
    performanceMoney: string;
    businessUserName: string;
    grossProfitRate: string;
    createTime: string;
    cusOfflineSupplement: number;
    busOrderType: string;
    companyOfflineSupplement: number;
    executeGroupName: string;
    otherCost: string;
    honorAgreementRate: string;
    oaContractNumber: string;
    checkAccountStatus: number;
    busOrderNo: string;
    busOrderStatus: number;
    tradeTime: string;
    tradeScreenshots: string;
    paymentType: number;
    paymentResult: number;
    otherIncome: number;
    costOfSales: number;
    salesIncome: number;
    businessIncome: number;
    officePrice: number;
    darenOtherCost: number;
  }
  export interface BusinessParamType {
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
  export interface BusinessResultDataType {
    coPriceSum?:number;
    performanceMoneySum?:number;
    businessOrderCount?:number;
    performanceInStatusCount?:number;
    performedStatusCount?:number;
    auditedAccountsOrderCount?:number;
  }
  export interface BusinessResultType {
    list: BusinessResultListType[];
    data: BusinessResultDataType;
  }
   
  export interface BusinessTypeListType {
    id:number;
    name: string;
  }
  export interface CompanyNameListType {
    companyId:number;
    companyName: string;
  }
  export interface BrandListType {
    id:number;
    newsContent: string;
    isDeleted:boolean
  }
  export interface CoCateListType {
    id:number;
    name: string;
    isDeleted:boolean
  }
  export interface QuotationListType {
    [x: string]: Key;
    platName:string;
    platId:number;
    accountName:string
    publishDate:string;
    officePrice:number;
    coPrice:number;
    platMoney:number
    rebateRate:number;
    rebateAmount:number;
    platOrderMoney:number;
    cusOfflineSupplement:number;
    companyOfflineSupplement:number;
  }
  export interface DetailDataParamsType {
    busOrderNo:string;
    oaContractNumber:string;
    checkAccountStatus:string;
    cusOfflineSupplement:string;
    companyOfflineSupplement:string;
    tradeTime:string;
    tradeScreenshots:string[];
    paymentType?:string;
    paymentResult?:string;
  }
  
  
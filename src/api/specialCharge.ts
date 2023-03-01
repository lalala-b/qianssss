import Request from "src/http/request";

export interface GetSpecialManageListParamsType {
  createId?: string;
  createGroupId?: string;
  relatedGroupId?: string;
  createUserId?: string;
  businessType?: string;
  finishStatus?: number;
  chargeType?: string;
  opNo?: string;
  busOrderNo?: string;
  chargeNo?: string;
  pactFinishBegin?: string;
  pactFinishEnd?: string;
  orderTimeBegin?: string;
  orderTimeEnd?: string;
  performanceMonthBegin?: string;
  performanceMonthEnd?: string;
  moneyArrivalTimeBegin?: string;
  moneyArrivalTimeEnd?: string;
  isExport?: 0;
}

export interface GetSpecialManageListResItemType {
  id: number;
  opId: number;
  opNo: string;
  busOrderNo: string;
  chargeNo: string;
  businessType: number;
  businessTypeDesc: string;
  chargeType: number;
  chargeTypeDesc: string;
  finishStatus: number;
  finishStatusDesc: string;
  brandProductName: string;
  createUserId: number;
  businessUserName: string;
  relateGroup3th: number;
  relateGroup3thName: string;
  businessRevenue: number;
  performanceMoney: number;
  pactFinishDate: string;
  orderTime: string;
  performanceMonth: string;
  moneyArrivalTime: string;
  canEdit: number;
  isFinance: number;
}

// 获取特殊收支列表=>在特殊收支管理中
export const $getSpecialManageList: (
  params: GetSpecialManageListParamsType
) => Promise<{
  total: number;
  data: GetSpecialManageListResItemType[];
}> = params =>
  Request.get(`/qp/business/opportunity/special/charge/list`, { params });

  export interface StatisticsAmountListType {
    total: number;
    saleIncomeSum: number;
    performanceMoneySum: number;
    businessRevenueSum: number;
  }
export const $getStatisticsAmount: (
  params: any
) => Promise<StatisticsAmountListType> = (params: any) =>
  Request.get(`/qp/business/opportunity/special/charge/listTotal`, {
    params,
  });

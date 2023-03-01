import ExportExcel from 'src/utils/exportExcel'
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
  OrderDownloadSignListRequest,
} from './types/projectId_3631'


export const $getCondition: () => Promise<OrderConditionResponse> = () => 
  Request.get(`/sign/order/condition`)

export const $getCrmGroupInfo: () => Promise<OrderCrmGroupInfoResponse> = () => 
  Request.get(`/sign/order/crmGroupInfo`)
  
export const $orderCount: (params: OrderOrderCountRequest) => Promise<OrderOrderCountResponse> = (params: OrderOrderCountRequest) => 
  Request.get(`/sign/order/orderCount`, {
    params,
  })
  
export const $getList: (params: OrderListRequest) => Promise<OrderListResponse> = (params: any = {}) => Request.get(`/sign/order/list`, {
    params,
  })

export const $signPlatAccountLinkage: (params: OrderSignPlatAccountLinkageRequest) => Promise<OrderSignPlatAccountLinkageResponse> = (params: OrderSignPlatAccountLinkageRequest) => Request.get(`/sign/order/signPlatAccountLinkage`,
    {params})

type GetByDictTypeRequestType = {
  dictTypes?: any
}

export type GetByDictTypeResponseType = {
  dictLabel: string
  dictValue: string
  extValue: string
}[]

export const $getByDictType: (params: GetByDictTypeRequestType) => Promise<GetByDictTypeResponseType> = (params: GetByDictTypeRequestType = {}) => 
  Request.post(`/sys/dict/data/getByDictType`, params)

export const $downloadSignList: (params: OrderDownloadSignListRequest) => void = (params: OrderDownloadSignListRequest = {}) => {
  ExportExcel({
    url: '/api/sign/order/downloadSignList',
    params,
  })
}
  // Request.get(`/sign/order/downloadSignList`, {
  //   params,
  // })
  


// 合作订单tab页的接口

export interface GetCooperateOrderListReqType {
  cooperOrderNo?: string;
  projectType?: number;
  signGroupId?: string;
  signTeamId?: string;
  signUserId?: string;
  platIds?: number[];
  accountId?: string;
  accountName?: string;
  brandId?: string;
  paymentType?: string;
  collectResult?: string;
  paymentResult?: string;
  businessGroupId?: string;
  businessTeamId?: string;
  businessUserId?: string;
  contentAssist?: string;
  finishTimeStart?: string;
  finishTimeEnd?: string;
  monthMoneyStart?: string;
  monthMoneyEnd?: string;
}

// 获取列表数据
export const $getCooperateOrderList: (params: GetCooperateOrderListReqType) => Promise<any> = params => 
  Request.get(`/qp/cooperation/order/findList`, {params})

// 导出合作订单
export const $exportCooperateOrderList: (params: GetCooperateOrderListReqType) => void = params => {
  ExportExcel({
    url: '/api/qp/cooperation/order/exportList',
    params,
  })
}

// 平台和账号的数据
export interface AccountConditionResType {
  plats: {
    platId: number;
    platName: string;
  }[];
  userAccountList: {
    accountId: number;
    accountName: string;
    belongName: string;
    platId: number;
  }[];
}

export const $getAccountCondition: () => Promise<AccountConditionResType> = () => 
  Request.get(`/qp/cooperation/order/accountCondition`)

// 列表的账号级联筛选
export interface FindAccountLinkageResType {
  data: {
    accountId: number;
    accountName: string;
    belongName: string;
    platId: number;
  }[];
}

export const $findAccountLinkage: (params: {platIds: string[]}) => Promise<FindAccountLinkageResType> = params => 
  Request.get(`/qp/cooperation/order/findAccountLinkage`, { params })


// 添加合作订单列表的账号级联筛选
export const $getSignContractAccounts: (params: {platId: string}) => Promise<FindAccountLinkageResType> = params => 
  Request.get(`/sign/contract/account/getSignContractAccounts`, { params })

export interface AddCooperationOrderReqType {
  cooperOrderId?: string,
  cooperOrderNo?: string;
  projectType?: number;
  businessGroupId?: number;
  businessGroupName?: string;
  businessTeamId?: number;
  businessTeamName?: string;
  businessUserId?: number;
  businessUserName?: string;
  signGroupId?: number;
  signGroupName?: string;
  signTeamId?: number;
  signTeamName?: string;
  signUserId?: number;
  signUserName?: string;
  brandId?: number;
  brandName?: string;
  platId?: number;
  platName?: string;
  accountId?: number;
  accountName?: string;
  finishTime?: string;
  outMoneyRatio?: number;
  outMoney?: number;
  accountUnitPrice?: number;
  refundRatio?: number;
  refundMoney?: number;
  orderMoney?: number;
  otherMoney?: number;
  orderActualIncome?: number;
  flowId?: number;
  title?: string;
  url?: string;
  videoCoverUrl?: string;
  addTime?: string;
  flowCount?: number;
  collectionScreenshots?: string;
  cpm?: number;
  platTaskId?: string;
  contentAssist?: number;
  dynamicLink?: string;
  paymentType?: number;
  paymentResult?: number;
  monthMoney?: string;
  oaProcessNo?: string;
  remark?: string;
  xingtuMcnTag?: string;
  douyinMcnTag?: string;
  companyOfflineSupplement?: number;
  cusOfflineSupplement?: number;
}

// 添加合作订单
export const $addCooperationOrder: (params: AddCooperationOrderReqType) => Promise<any> = params => 
  Request.post(`/qp/cooperation/order/addCooperationOrder`, params)

// 修改合作订单
export const $updateCooperationOrder: (params: AddCooperationOrderReqType) => Promise<any> = params => 
  Request.post(`/qp/cooperation/order/updateCooperationOrder`, params)

// 删除合作订单
export const $deleteCooperationOrder: (params: {cooperOrderId: string}) => Promise<any> = params => 
  Request.post(`/qp/cooperation/order/deleteCooperationOrder`, params)

// 合作订单详情
export const $findCooperateOrderDetail: (params: {cooperOrderId: string}) => Promise<AddCooperationOrderReqType> = params => 
  Request.get(`/qp/cooperation/order/findDetail`, { params })

// 获取合作订单tab页中的签约团队、小组、经纪人信息
export const $getSignCondition: () => Promise<any> = () => 
  Request.get(`/qp/cooperation/order/signCondition`)

// 获取合作订单tab页中的商务团队、小组、商务人员信息
export const $getOrgInfo: () => Promise<any> = () => 
  Request.get(`/qp/perform/business/order/info/getOrgInfo`)

// 校验视频动态链接
// eslint-disable-next-line camelcase
export const $checkDynamicLink: (params: {index_url: string | undefined}) => Promise<any> = params => 
  Request.get(`https://ldpspider.zhuanzhuan.com/plat/bilibili/article`, { params })

/* eslint-disable camelcase */
/* eslint-disable import/export */
/* eslint-disable import/prefer-default-export */
import Request from "src/http/request";

export interface GetOrderDetailNodeBOListResType {
  workflowId: number;
  nodeName: string;
  nodeCode: string;
  nodeStep: number;
  nodeStatus: number;
}
export interface GetOrderDetailProgressResType {
  orderNo: string;
  nodeBOList: GetOrderDetailNodeBOListResType[];
}

// 查看工单详情整体进度
export const $getOrderDetailProgress: (params: {
  orderNo: string;
}) => Promise<GetOrderDetailProgressResType> = params =>
  Request.get(`/qp/perform/order/info/orderProgress`, { params });

export interface OrderDetailBaseInfoType {
  orderNo: string;
  coopType: number;
  busOrderNo: string;
  opNo: string;
  brandId: number;
  brandName: string;
  coProduct: string;
  busOrderType: number;
  accountId: number;
  accountName: string;
  accountImg: string;
  accountLoginUrl: string;
  xingtuIndexUrl: string;
  platId: number;
  platName: string;
  orderBelong: string;
  orderBelongType: 0 | 1 | 2;
  orderUser: string;
  businessUserId: number;
  businessUserName: string;
  businessGroupId: number;
  businessGroupName: string;
  businessTeamId: number;
  businessTeamName: string;
  executeGroupId: number;
  executeGroupName: string;
  executorUserId: number;
  executorUserName: string;
  orderType: number;
  orderStatus: string;
}

export interface FieldInfoListItemType {
  fieldName: string;
  fieldCode: string;
  nodeId: number;
  fieldId: number;
  fieldRule: string;
  fieldSort: number;
}

export interface ConfirmOrderNodeType {
  coPrice: number;
  officePrice: number;
  otherIncome: number;
  salesIncome: number;
  costOfSales: number;
  orderActualIncome: number;
  grossProfitRate: number;
  darenOtherCost: number;
  platOrderMoney: number;
  platMoney: number;
  rebateRate: number;
  rebateAmount: number;
  editAuth: boolean;
  outMoney: number;
  outMoneyRatio: number;
  orderMoney: number;
  performanceMoney: number;
  darenUndertakeRefundRatio: number;
  darenUndertakeRefundMoney: number;
  otherCost: number;
  executeMoney: number;
  publishDate: string;
  contentAssist: number;
  paymentType: number;
  cancelOrderReason: string;
  cancelReasonTypeDesc:string;
  paymentResult: number;
  collectionMoney: number;
  tradeType: number;
  oaProcessNumber: string;
  outTradeNo: string;
  monthMoney: string;
  tradeScreenshots: string;
  orderStatus: number;
  mediumDeliveryUserId: number;
  mediumDeliveryUserName: string;
  orderNo: string;
  nodeId: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  updateTime: string;
}

export interface ConfirmOrderNodeAndFieldType {
  confirmOrderNodeBO: ConfirmOrderNodeType;
  fieldInfoList: FieldInfoListItemType[];
}

export interface ExecutePlanNodeType {
  orderFlag: number;
  outlineFlag: number;
  scriptDeadline: string;
  outlineDeadline: string;
  videoDraftDeadline: string;
  publishVideoDeadline: string;
  platTaskId?: string;
  editAuth: boolean;
  orderNo: string;
  nodeId: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  cancelOrderReason: string;
  cancelReasonTypeDesc:string;
  orderDuration: number;
  bfFlag: number;
  sendFlag: number;
  authDuration: number;
  specialCase: string;
  performDelayFlag:number;
  updateTime: string;
  performDelayFlagName:string;
}

export interface ExecutePlanNodeAndFieldType {
  executePlanNodeBO: ExecutePlanNodeType;
  fieldInfoList: FieldInfoListItemType[];
}

export interface ExecutorNodeType {
  executeGroupId: number;
  executeGroupName: string;
  executorUserId: number;
  executorUserName: string;
  editAuth: boolean;
  orderNo: string;
  nodeId: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  cancelOrderReason: string;
  cancelReasonTypeDesc:string;
  updateTime: string;
}

export interface ExecutorNodeAndFieldType {
  executorNodeBO: ExecutorNodeType;
  fieldInfoList: FieldInfoListItemType[];
}

export interface ConfirmOutlineNode {
  editAuth: boolean;
  overtimeStatus: number;
  timeInterval: number;
  timeIntervalDesc: string;
  orderNo: string;
  nodeId: number;
  nodeStep: number;
  orderFlag: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  cancelOrderReason: string;
  cancelReasonTypeDesc:string;
  platTaskId: string;
  isVideoConfirm: number;
  updateTime: string;
}

export interface ConfirmOutlineNodeAndFieldType {
  confirmOutlineNodeBO: ConfirmOutlineNode;
  fieldInfoList: FieldInfoListItemType[];
}

export interface ConfirmScriptNodeAndFieldType {
  confirmScriptNodeBO: ConfirmOutlineNode;
  fieldInfoList: FieldInfoListItemType[];
}

export interface ConfirmDraftNodeAndFieldType {
  confirmDraftNodeBO: ConfirmOutlineNode;
  fieldInfoList: FieldInfoListItemType[];
}

export interface PublishVideoNodeType {
  flowId: number;
  titleName: string;
  addTime: number;
  url: string;
  videoCoverUrl: string;
  platTaskId: string;
  overtimeStatus: number;
  timeInterval: number;
  timeIntervalDesc: string;
  orderNo: string;
  nodeId: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  cancelOrderReason: string;
  editAuth: boolean;
  reconciliationStatus: 0 | 1;
  editFlag: number;
  nodeStep: number;
  autoBindDesc: string;
  cancelReasonTypeDesc:string;
  updateTime: string;
}

export interface PublishVideoNodeAndFieldType {
  publishVideoNodeBO: PublishVideoNodeType;
  fieldInfoList: FieldInfoListItemType[];
}

export interface ConfirmPaymentNodeType {
  paymentType: number;
  darenOtherCost?: number;
  paymentResult: number;
  collectionMoney: number;
  tradeType: number;
  oaProcessNumber: string;
  outTradeNo: string;
  monthMoney: string;
  tradeScreenshots: string;
  orderNo: string;
  nodeId: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  cancelOrderReason: string;
  cancelReasonTypeDesc:string;
  editAuth: boolean;
  reconciliationStatus: number;
  nodeStep: number;
  updateTime: string;
  coopRemarks: string;
}

export interface ConfirmPaymentNodeAndFieldType {
  confirmPaymentNodeBO: ConfirmPaymentNodeType;
  fieldInfoList: FieldInfoListItemType[];
}

export interface CheckAccountsNodeType {
  coPrice: number;
  platOrderMoney: number;
  salesIncome: number;
  costOfSales: number;
  outMoney: number;
  performanceMoney: number;
  oaContractNumber: string;
  customerRebatePaid: number;
  receiptStatus: number;
  reconciliationStatus: number;
  orderNo: string;
  nodeId: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  cancelOrderReason: string;
  orderStatus: number;
  editAuth: boolean;
  nodeStep: number;
  orderActualIncome: number;
  taskIdStatus: number;
  taskIdTime: string;
  cancelReasonTypeDesc:string;
  updateTime: string;
}

export interface CheckAccountsNodeAndFieldType {
  checkAccountsNodeBO: CheckAccountsNodeType;
  fieldInfoList: FieldInfoListItemType[];
}

export interface SpecialPerformanceNodeType {
  specialPerformStatus: number;
  url: string;
  orderNo: string;
  nodeId: number;
  operatorUserId: number;
  operatorUserName: string;
  operatorDId: number;
  operatorDName: string;
  operatorFId: number;
  operatorFName: string;
  completeTime: string;
  nodeStatus: number;
  cancelOrderReason: string;
  orderStatus: number;
  editAuth: boolean;
  nodeStep: number;
  cancelReasonTypeDesc: string;
  updateTime: string;
}

export interface PerformanceNodeAndFieldType {
  specialPerformanceNodeBO: SpecialPerformanceNodeType;
  fieldInfoList: FieldInfoListItemType[];
}

export interface GetOrderDetailResType {
  orderBaseInfoBO: OrderDetailBaseInfoType;
  confirmOrderNodeAndFieldBO: ConfirmOrderNodeAndFieldType;
  executePlanNodeAndFieldBO: ExecutePlanNodeAndFieldType;
  executorNodeAndFieldBO: ExecutorNodeAndFieldType;
  confirmOutlineNodeAndFieldBO: ConfirmOutlineNodeAndFieldType;
  confirmScriptNodeAndFieldBO: ConfirmScriptNodeAndFieldType;
  confirmDraftNodeAndFieldBO: ConfirmDraftNodeAndFieldType;
  publishVideoNodeAndFieldBO: PublishVideoNodeAndFieldType;
  confirmPaymentNodeAndFieldBO: ConfirmPaymentNodeAndFieldType;
  checkAccountsNodeAndFieldBO: CheckAccountsNodeAndFieldType;
  performanceNodeAndFieldBO: PerformanceNodeAndFieldType;
}

export interface VideoListParamsType {
  accountId?: number;
  platId?: number;
  titleName?: string;
  addTime?: any[];
  startDate?: string;
  endDate?: string;
  pageNum?: number;
  size?: number;
}

export interface VideoListType {
  titleName?: string;
  addTime?: string;
  commentCount?: number;
  flowCount?: number;
  flowId?: number;
  forwardedCount?: number;
  isDeleted?: 0 | 1;
  lockStatus?: 0 | 1;
  platId?: number;
  recLink?: string;
  recTitle?: string;
  thirdId?: string;
  thumbUpCount?: number;
  url?: string;
  videoCoverUrl?: string;
  videoServiceTitle?: string;
  videoServiceType?: number;
  videoServiceUrl?: string;
}

export interface VideoListResType {
  total?: number;
  data?: VideoListType[];
}

export interface PublishVideoParamsType {
  flowId: number;
  platTaskId: string;
  editFlag: number;
  orderNo: string;
  orderStatus: number;
}

export interface ConfirmPaymentParamsType {
  paymentType: number;
  paymentResult: number;
  collectionMoney?: number;
  tradeType?: number;
  oaProcessNumber?: string;
  outTradeNo?: string;
  monthMoney?: string;
  tradeScreenshots?: string;
  editFlag: number;
  orderNo: string;
  orderStatus: number;
  darenOtherCost?: number;
  coopRemarks?: string;
}

export interface CheckAccountsParamsType {
  customerRebatePaid?: number;
  receiptStatus?: number;
  reconciliationStatus?: number;
  orderNo: string;
  orderStatus: number;
  editFlag: number;
}

// 获取工单详情
export const $getOrderDetail: (params: {
  orderNo: string;
}) => Promise<GetOrderDetailResType> = params =>
  Request.get(`/qp/perform/order/info/findOrderInfo`, { params });

// 编辑确认下单信息
export const $editConfirmOrderInfo: (params: {
  belongType: 0 | 1 | 2;
  editFlag: 0 | 1;
  otherCost: number;
  darenUndertakeRefundMoney: number;
  contentAssist: number;
  paymentType: number;
  orderNo: string;
  orderStatus: number;
}) => void = params =>
  Request.post(`/qp/perform/confirm/order/info/confirmOrderInfo`, params);

// 获取媒介投放人列表
export const $getMediumUserList: () => Promise<
  { userId: number; realname: string }[]
> = () => Request.get(`/qp/perform/confirm/order/info/findMediumDeliveryUser`);

// 确认脚本
export const $confirmScript: (params: {
  changeOrderFlag?: number | null;
  orderNo: string;
  orderStatus?: number | undefined;
}) => void = params =>
  Request.post(`/qp/perform/confirm/script/confirmScript`, params);

// 确认大纲
export const $confirmOutline: (params: {
  changeOrderFlag?: number | null;
  orderNo: string;
  orderStatus?: number | undefined;
}) => void = params =>
  Request.post(`/qp/perform/confirm/outline/confirmOutline`, params);

// 确认视频初稿
export const $confirmDraft: (params: {
  orderNo: string;
  platTaskId: string;
  orderStatus: number | undefined;
}) => void = params =>
  Request.post(`/qp/perform/confirm/draft/confirmDraft`, params);

// 撤单
export const $revokeOrder: (params: {
  cancelOrderStatus: number;
  cancelOrderReason: string;
  orderNo: string;
  orderStatus: number;
}) => void = params =>
  Request.post(`/qp/perform/confirm/order/info/cancelOrder`, params);

// 发布视频的视频列表
export const $getVideoList: (
  params: VideoListParamsType
) => Promise<VideoListResType> = params =>
  Request.post(`/med/flow/getAccountVideoList`, params);

// 确认发布视频的信息
export const $publishVideo: (params: PublishVideoParamsType) => void = params =>
  Request.post(`/qp/perform/publish/video/publishVideo`, params);

// 确认收付款的信息
export const $confirmPayment: (
  params: ConfirmPaymentParamsType
) => void = params =>
  Request.post(`/qp/perform/confirm/payment/confirmPayment`, params);

// 确认财务核账的信息
export const $checkAccounts: (
  params: CheckAccountsParamsType
) => void = params =>
  Request.post(`/qp/perform/check/accounts/checkAccounts`, params);

export interface ExecuteGroupInfoType {
  executeGroupId: number;
  executeGroupName: string;
}

export interface ExecutorInfoType {
  id: number;
  name: string;
  dId: number;
  orgId: number;
  fId: number;
}
export interface ExecuteTeamResType {
  executeGroupInfoBOList: ExecuteGroupInfoType[];
  executorInfoBOList: ExecutorInfoType[];
}
// 获取执行人小组和执行人
export const $getExecuteTeam: () => Promise<ExecuteTeamResType> = () =>
  Request.get(`/qp/perform/executor/findExecuteTeam`);

// 分配执行人
export const $allotExecutor: (params: {
  executeGroupId: number;
  executeGroupName: string;
  executorUserId: number;
  executorUserName: string;
  editFlag: number;
  orderNo: string;
  orderStatus?: number;
}) => void = params =>
  Request.post(`/qp/perform/executor/allotExecutor`, params);

// 录入执行计划
export const $executePlan: (params: {
  orderFlag: number;
  outlineFlag: string;
  outlineDeadline: string;
  scriptDeadline: string;
  videoDraftDeadline: string;
  publishVideoDeadline: string;
  editFlag: number;
  orderNo: string;
  orderStatus: number;
}) => void = params =>
  Request.post(`/qp/perform/execute/plan/executePlan`, params);

// 特殊工单-工单履约
export const $orderPerformance: (params: {
  url: string;
  specialPerformStatus: number;
  completeTime: string;
  editFlag: number;
  orderNo: string;
  orderStatus: number;
}) => void = params =>
  Request.post(`/qp/perform/special/performance/orderPerformance`, params);


// 获取下拉框数据
type GetByDictTypeRequestType = {
  dictTypes?: any;
};

export type DictType = {
  dictLabel: string;
  dictValue: string;
  extValue: string;
}

export interface GetByDictTypeResponseType {
  business_quotation_auth_duration: DictType[];
  business_quotation_order_duration: DictType[];
  perform_delay_flag:DictType[]
}

export const $getByDictType: (
  params: GetByDictTypeRequestType
) => Promise<GetByDictTypeResponseType> = (
  params: GetByDictTypeRequestType = {}
) => Request.post(`/sys/dict/data/getByDictType`, params);


// 预校验平台任务ID
export interface checkTaskIdResType {
  platTaskStatusType: number;	
  platTaskStatusTypeEnum: string;	
  taskIdTime: string;
}
export const $checkTaskId: (params: {
  platTaskId?: string;
  moneyAmount?: number;
  taskIdStatus?: number;
  taskIdTime?: string;
}) => Promise<checkTaskIdResType> = params =>
  Request.get(`/qp/juxing/order/money/info/checkTaskId`, { params });

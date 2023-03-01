/* eslint-disable camelcase */
import Request from "src/http/request";

export interface BrandListResType {
  newsContent: string;
  id: number;
  isDelete: 0 | 1;
}

// 获取品牌列表
export const $getBrandList: () => Promise<BrandListResType[]> = () =>
  Request.get(`/qp/business/opportunity/brandList`);

/**
 * 新增公司名称|新增品牌|新增客户来源
 */
export const $addBaseCustomerInfo: (params: {
  typeId: number;
  newsContent: string;
}) => Promise<BrandListResType> = params =>
  Request.post(`/business/customer/addBaseCustomerInfo`, params);

/**
 * 获取商机列表数据
 */
export interface accountMsgType {
  accountId: string;
  accountName: string;
  paltIconUrl: string;
  platName: string;
  accountTypeDesc: string;
  platId: number;
}

export interface BusinessOpportunityType {
  id: number;
  opNo: string;
  planNo: string;
  charger: number;
  chargerName: string;
  specialChargeTotal: string;
  opCoTypeDesc: string;
  createdTime: string;
  companyName: string;
  customerName: string;
  selfRatio: number;
  signRatio: number;
  brandName?: string;
  coProduct: string;
  coCateDesc: string;
  description: string;
  recommendList?: accountMsgType[];
  cooperationList?: accountMsgType[];
  oppoFromName: string;
  createName: string;
  opStatus: number;
  opType: number;
  opStatusDesc: string;
  canCooperation: number;
}

export interface SearchDataParamsType {
  opStatus?: number;
  opNo?: string;
  planNo?: string;
  charger?: number | number[];
  chargerArr?: number[];
  customerId?: number;
  customerIdArr?: number[];
  brandId?: number;
  oppoFromId?: number;
  oppoFromIdArr?: number[];
  opCoType?: any[];
  createTime?: any[];
  createTimeStart?: string;
  createTimeEnd?: string;
  pageNum?: number;
  size?: number;
  isExport?: number;
  coCate?: any[];
  accountId?: number;
  platIds?: number[];
}

export interface BusinessOpportunityListResType {
  total: number;
  list?: BusinessOpportunityType[];
}

export const $getBussinessOpportunityList: (
  params: SearchDataParamsType
) => Promise<BusinessOpportunityListResType> = params =>
  Request.get(`/qp/business/opportunity/list`, { params });

// 获取其他状态总数据
export interface StatusTotalResType {
  readyFind: number;
  finding: number;
  readyCustomerChoose: number;
  readySecondConfirm: number;
  readyCustomerCooperation: number;
  cooperation: number;
  noCooperation: number;
}

export const $getStatusTotal: (
  params: SearchDataParamsType
) => Promise<StatusTotalResType> = params =>
  Request.get(`/qp/business/opportunity/statusTotal`, { params });

export interface CustomerDetailResType {
  customerAdminInfo?: {
    customerTypeName: string;
    customerType: string;
    industryName: string;
    mainConnectName: string;
    selfMax: number;
    selfMin: number;
    signMax: number;
    signMin: number;
    customerAdminId: number;
    createTime: string;
    createName: string;
  };
  medCustomerInfo?: {
    createName: string;
    createTime: string;
  };
}

// 获取客户联系人详情
export const $getCustomerDetail: (params: {
  customerId: number;
}) => Promise<CustomerDetailResType> = params =>
  Request.get(`/business/customer`, { params });

interface CreateBusinessOpportunityParamsType {
  oppoFromId: number;
  brandId?: number;
  coProduct: string;
  coCate: number;
  publishStart: string;
  publishEnd: string;
  description: string;
  fileUrl: string;
  isSelfCharger: 1 | 2;
  charger: number;
  remark: string;
  customerId: number;
  opCoType: number;
  selfRatio: number;
  signRatio: number;
  businessType: number;
  opId?: number;
  treeInfo?: string;
}
// 创建商机
export const $createBusinessOpportunity = (
  params: CreateBusinessOpportunityParamsType
) => Request.post(`/qp/business/opportunity/create`, params);

// 编辑商机
export const $editBusinessOpportunity = (
  params: CreateBusinessOpportunityParamsType
) => Request.post(`/qp/business/opportunity/update`, params);

// 发布协同找号任务
export interface PublishAssistTaskParamsType {
  signTask?: {
    opId: number;
    deadLine: any;
    taskType: number;
  };

  medTask?: {
    opId: number;
    deadLine: any;
    taskType: number;
    taskFollower: number;
  };
}

export interface PublishAssistTaskResType {
  message: string;
}

export const $publishAssistTask: (
  params: PublishAssistTaskParamsType
) => Promise<PublishAssistTaskResType> = params =>
  Request.post(
    `/qp/business/opportunity/task/createTask/publishAssistTask`,
    params
  );

// 获取协同找号任务的情况
export interface CoopFindInfoParamsType {
  opId: number;
}

export interface CoopFindInfoResType {
  signTask: {
    findTotal: number;
    stopFindTime: number;
  };
  mediumTask: {
    findTotal: number;
    stopFindTime: number;
  };
}

export const $getCoopFindInfo: (
  params: CoopFindInfoParamsType
) => Promise<CoopFindInfoResType> = params =>
  Request.get(`/qp/business/opportunity/coopFindInfo`, { params });

// 获取推荐的账号中合作状态筛选项列表
export const $getCoStatusList: () => Promise<
  {
    id: number;
    name: string;
  }[]
> = () => Request.get(`/qp/business/opportunity/task/coStatusList`);

// 获取推荐的账号中推荐状态筛选项列表
export const $getRcStatusList: () => Promise<
  {
    id: number;
    name: string;
  }[]
> = () => Request.get(`/qp/business/opportunity/task/rcStatusList`);

// 获取推荐的账号中平台列表
export const $getPlatList: () => Promise<
  { platId: number; platName: string }[]
> = () => Request.get("/qp/business/opportunity/task/platList");

// 获取推荐的账号中账号列表
export const $getAccountList: (params: {
  platId?: number;
  opId: number | string | undefined;
}) => Promise<
  { platId: number; accountId: number; accountName: string }[]
> = params =>
  Request.get("/qp/business/opportunity/oppAccountSelective", { params });

interface GetOppAccountListParamsType {
  accountPlat?: number;
  rcStatusList?: number[];
  coStatusList?: number[];
  pageNum?: number;
  size?: number;
  opId: number;
}

export interface GetOppAccountListItemType {
  businessRevenue: any;
  id: number;
  quotationId: number;
  needJudgeGross: number;
  minGrossRate: number;
  grossRate: number;
  minGrossMoney: number;
  grossMoney: number;
  accountName: string;
  accountId: number;
  coDate: string;
  accountType: number;
  accountOfficialPriceVo: {
    platId: number;
    platName: string;
    priceInfoVoList: {
      priceType: string;
      priceVal: number;
    }[];
  };
  accountBaseInfoVo: any;
  officialPrice: number;
  otherIncome: number;
  coPrice: number;
  rebateRate: number;
  rebateAmount: number;
  reason: string;
  taskFollowerName: string;
  rcStatus: number;
  rcStatusDesc: string;
  coStatus: number;
  coStatusDesc: string;
  isFlyOver: number;
  isFlyOverDesc: string;
  isInQuotation: number;
  isInQuotationDesc: string;
  platOrderMoney: number;
  cusOfflineSupplement: number;
  companyOfflineSupplement: number;
  platMoney: number;
  platOrderCharge: number;
  editCoDate?: boolean;
  editCoPrice: boolean;
  editOfficialPrice: boolean;
  editOtherIncome: boolean;
  editPlatOrderMoney?: boolean;
  editPlatMoney?: boolean;
  editPlatOrderCharge?: boolean;
  editRebateRate?: boolean;
  editRebateAmount?: boolean;
  editReason?: boolean;
  editCusOfflineSupplement?: boolean;
  priceTime?: string;
}
export interface GetOppAccountListResType {
  total: number;
  list?: GetOppAccountListItemType[];
}

// 获取商机中推荐的账号列表
export const $getOppAccountList: (
  params: GetOppAccountListParamsType
) => Promise<GetOppAccountListResType> = params =>
  Request.get("/qp/business/opportunity/oppAccountList", { params });

// 继续找号
export interface ContinueFindResType {
  msg: boolean;
}

export interface ContinueFindParamsType {
  opId: number;
}

export const $continueFindNum: (
  params: ContinueFindParamsType
) => Promise<ContinueFindResType> = params =>
  Request.post(`/qp/business/opportunity/continueFind`, params);

// 暂不合作
export interface StopCooperationParamsType {
  noCoReason: string;
  opId: number;
}

export interface StopCooperationResType {
  msg: string;
}

export const $stopCooperation: (
  params: StopCooperationParamsType
) => Promise<StopCooperationResType> = params =>
  Request.post(`/qp/business/opportunity/stopCooperation`, params);

// 商机-获取商机合作品类
export interface GetCoCateListItemResType {
  id: number;
  name: string;
  isDeleted: number;
  child?: GetCoCateListItemResType[];
}

export const $getCoCateList: () => Promise<GetCoCateListItemResType[]> = () =>
  Request.get(`/qp/business/opportunity/coCateList`);

// 确认合作
export interface ConfirmCoopDTOSType {
  quotationId?: number;
  orderFlag?: number;
  orderDuration?: number;
  bfFlag?: number;
  sendFlag?: number;
  authDuration?: number;
  specialCase?: string;
  publishDate?: string;
}
export interface ConfirmCooperationParamsType {
  rebateType: number;
  executeGroupId: number;
  opId: number;
  privatePrice?: number;
  rebateCorporate?: number;
  rebatePrivate?: number;
  orderTime: string;
  quotationForConfirmCoopDTOS?: ConfirmCoopDTOSType[];
}

export interface ConfirmCooperationResType {
  msg: string;
}

export const $confirmCooperation: (
  params: ConfirmCooperationParamsType
) => Promise<ConfirmCooperationResType> = params =>
  Request.post(`/qp/business/opportunity/confirmCooperation`, params);

// 获取报价单列表
export interface QuotationListParamsType {
  opId: number;
}

export interface QuotationListResType {
  accountId: number;
  platName: string;
  accountName: string;
  publishDate: string;
  officePrice: number;
  coPrice: number;
  platMoney: number;
  platOrderCharge: number;
  rebateRate: number;
  rebateAmount: number;
  costOfSales: number;
  platOrderMoney: number;
  cusOfflineSupplement: number;
  companyOfflineSupplement: number;
  businessRevenue: number;
  otherIncome: number;
  orderFlag: number;
  orderDuration: number;
  bfFlag: number;
  sendFlag: number;
  authDuration: number;
  specialCase: string;
  quotationId: number;
}

export const $getQuotationList: (
  params: QuotationListParamsType
) => Promise<QuotationListResType[]> = params =>
  Request.get(`/qp/business/quotation/list`, { params });

// 查看商机详情
export interface OpportDetailParamsType {
  id: number;
}

export interface OpportDetailnResType {
  id: number;
  chargerName: string;
  opStatus: number;
  charger: number;
  brandName: string;
  brandId: number;
  coCateName: string;
  coCate: number;
  coProduct: string;
  publishStart: string;
  publishEnd: string;
  description: string;
  fileUrl: string;
  remark: string;
  opCoType: number;
  opCoTypeDesc: string;
  selfRatio: number;
  signRatio: number;
  businessTypeDesc: string;
  businessType: number;
  customerId: number;
  customerInfo: {
    companyName: string;
    customerName: string;
    customerTypeName: string;
    industryName: string;
    mainConnectName: string;
    createName: string;
    createTime: string;
    selfMin: number;
    selfMax: number;
    signMin: number;
    signMax: number;
  };
}

export const $getOpportDetail: (
  params: OpportDetailParamsType
) => Promise<OpportDetailnResType> = params =>
  Request.get(`/qp/business/opportunity/detail`, { params });

interface CustomerItemType {
  customerName: string;
  customerId: number;
  crmId: number;
  crmName: string;
}

export interface GetCustomerNameItemResType {
  companyName: string;
  companyId: number;
  customer: CustomerItemType[];
  otherCustomer: CustomerItemType[];
}

// 获取客户联系人列表
export const $getCustomerName: () => Promise<
  GetCustomerNameItemResType[]
> = () => Request.get("/qp/business/opportunity/getCustomerName");

// 获取主要合作类型
export const $getCustomerTypeList: () => Promise<
  { id: number; name: string }[]
> = () => Request.get(`/business/admin/customerTypeList`);

// 获取合作产品
export const $getCoProductList: () => Promise<
  { id: string; name: string }[]
> = () => Request.get(`/qp/perform/business/order/info/getCoProductName`);

// 获取配置项
export const $getByConfigCode: (params: {
  configCodes: string;
}) => void = params => Request.get(`/base/config/getByConfigCode`, { params });

// 获取商机负责人列表
export interface BusinessOppoFollowersResType {
  id: number;
  parentId: number;
  isParent: number;
  orgName: string;
  depthLayer: number;
  childOrgList?: BusinessOppoFollowersResType[];
  userFlag: number;
}
export const $getBusinessOppoFollowers: () => Promise<
  BusinessOppoFollowersResType[]
> = () => Request.get(`/qp/business/opportunity/businessOppoFollowers`);

// 获取媒介采买人列表
export interface OppoMediumBuyerResType {
  id: number;
  parentId: number;
  isParent: number;
  orgName: string;
  depthLayer: number;
  childOrgList?: OppoMediumBuyerResType[];
  userFlag: number;
}
export const $getOppoMediumBuyer: () => Promise<
  OppoMediumBuyerResType[]
> = () => Request.get(`/qp/business/opportunity/oppoMediumBuyer`);

// 获取媒介分配员列表
export const $getOppoMediumDistributes: () => Promise<
  OppoMediumBuyerResType[]
> = () => Request.get(`/qp/business/opportunity/oppoMediumDistributes`);

// 获取商机进度
export const $getBussinessOpportunityProgressList: (params?: {
  opType?: number;
}) => Promise<{ id: number; name: string }[]> = params =>
  Request.get(`/qp/business/opportunity/statusList`, { params });

export interface BussinessOpportunityDetailResType {
  opNo: string;
  id: number;
  oppoFromId: number;
  chargerName: string;
  businessGroupName: string;
  busOrderNo: string;
  opStatus: number;
  charger: number;
  isCharger: number;
  isSelfCharger: number;
  brandName: string;
  brandId: number;
  coCateName: string;
  coCate: number;
  coProduct: string;
  publishStart: string;
  publishEnd: string;
  description: string;
  fileUrl: string;
  remark: string;
  opCoType: number;
  opType: number;
  opCoTypeDesc: string;
  selfRatio: number;
  signRatio: number;
  customerId: number;
  businessType: number;
  businessTypeDesc: string;
  treeInfo: string;
  canEditPrice: boolean;
}

// 获取商机详情
export const $getBussinessOpportunityDetail: (params: {
  id: number;
}) => Promise<BussinessOpportunityDetailResType> = params =>
  Request.get(`/qp/business/opportunity/detail`, { params });

// 推荐的账号中 档期和合作价格编辑
export const $editSubTask: (params: {
  subTaskId: number;
  coDate?: string;
  coPrice?: number;
  officialPrice?: number;
  platOrderMoney?: number;
  platMoney?: number;
}) => void = params =>
  Request.post(`/qp/business/opportunity/task/editSubTask`, params);

// 推荐的账号中 停止选号
export const $stopFinding: (params: { opId: number }) => void = params =>
  Request.post(`/qp/business/opportunity/stopFinding`, params);

// 一轮定询审批
export const $firstRoundApproval: (params: {
  subTaskId: number;
  opt: string;
}) => void = params =>
  Request.post(`/qp/business/opportunity/task/firstRoundApproval`, params);

// 客户初筛审批
export const $customerPreApproval: (params: {
  subTaskId: number;
  opt: number;
}) => void = params =>
  Request.post(`/qp/business/opportunity/task/customerPreApproval`, params);

// 加入/移除报价单
export const $businessQuotationChange: (params: {
  status: 0 | 1;
  accountId: number;
  opId: number;
  taskDetailId: number;
}) => void = params => Request.get(`/qp/business/quotation/change`, { params });

// 再次发送飞书-仅限待账号负责人确认
export const $resendSecondConfirmFeiShu: (params: {
  subTaskId: number;
}) => void = params =>
  Request.post(
    `/qp/business/opportunity/task/resendSecondConfirmFeiShu`,
    params
  );

// 再次发送飞书-仅限待账号负责人确认且该账号是驳回状态
export const $reset2RoundApproval: (params: {
  subTaskId: number;
}) => void = params =>
  Request.post(`/qp/business/opportunity/task/reset2RoundApproval`, params);

// 客户确认选号
export const $confirmChoose: (params: {
  opId: number;
  isFinal: 1 | 2;
}) => Promise<{
  type: number;
  noConfirmAccounts: number;
  confirmAccounts: number;
}> = params => Request.post(`/qp/business/opportunity/confirmChoose`, params);

// 获取执行人小组的数据
export const $getExecutorGroupData: (params: {
  opId: number;
}) => Promise<
  { id: number; name: string }[]
> = params => Request.get(`/qp/business/opportunity/executeGroup`, { params });

// 获取商单类型列表
export const $getBusinessTypeList: () => Promise<
  { id: number; name: string }[]
> = () => Request.get(`/qp/business/opportunity/businessTypeList`);

// 报价单导出判断
export const $checkExportQuotation: (params: {
  opId: number;
}) => Promise<boolean> = params =>
  Request.get(`/qp/business/quotation/judgeExportAccount`, { params });

export interface chargerListType {
  id: number;
  parentId: number;
  isParent: number;
  orgName: string;
  depthLayer: number;
  childOrgList: chargerListType[];
  userFlag: number;
  disabled: number;
}

export interface BusinessOppoFollowersWithDefUserResType {
  orgList?: chargerListType[];
  defaultValues?: number[];
}

export const $getBusinessOppoFollowersWithDefUser: () => Promise<BusinessOppoFollowersWithDefUserResType> =
  () =>
    Request.get("/qp/business/opportunity/businessOppoFollowersWithDefUser");

// 获取商机来源下拉列表
export interface OppoFromListType {
  id: number;
  pId: number;
  fromName: string;
  fromDesc: string;
  fromOrder: number;
  isDeleted: number;
  child: OppoFromListType[];
}

export const $getOppoFromList: () => Promise<OppoFromListType[]> = () =>
  Request.get(`/qp/business/opportunity/oppoFrom`);

export const $getJumpUrl: (params: {
  userid: number;
}) => Promise<any> = params => Request.get(`/feishu/jump/url`, { params });

export const $getRevenueList: (params: {
  opId: number;
}) => Promise<any> = params =>
  Request.get(`/qp/business/opportunity/detail/list`, { params });

export interface SpecialPaymentListResType {
  incomeList: {
    id: number;
    charge: number;
    note: string;
    isDeleted: number;
  }[];
  payList: {
    id: number;
    charge: number;
    note: string;
    isDeleted: number;
  }[];
}

// 查询 特殊收支列表
export const $getSpecialPaymentList: (params: {
  opId: number;
}) => Promise<SpecialPaymentListResType> = params =>
  Request.get(`/qp/business/opportunity/charge/list`, { params });

// 查询 特殊收支列表
export const $upsertSpecialPaymentList: (params: {
  opId: number;
  incomeList: {
    id?: number;
    charge: number;
    note: string;
    isDeleted?: number;
  }[];
  payList: {
    id?: number;
    charge: number;
    note: string;
    isDeleted?: number;
  }[];
}) => Promise<SpecialPaymentListResType> = params =>
  Request.post(`/qp/business/opportunity/charge/upsert`, params);

// 批量驳回
export const $batchCustomerApproval: (params: {
  taskDetailIdList: number[];
}) => void = params =>
  Request.post(`/qp/business/opportunity/task/batchCustomerApproval`, params);

// 获取下拉框数据
type GetByDictTypeRequestType = {
  dictTypes?: any;
};

export type DictType = {
  dictLabel: string;
  dictValue: string;
  extValue: string;
};

export interface GetByDictTypeResponseType {
  business_quotation_auth_duration: DictType[];
  business_quotation_order_duration: DictType[];
}

export const $getByDictType: (
  params: GetByDictTypeRequestType
) => Promise<any> = (params: GetByDictTypeRequestType = {}) =>
  Request.post(`/sys/dict/data/getByDictType?time=${Math.random()}`, params);

// 获取商机弹窗的顶部栏的商机信息
export interface OppHeadColumnInfoResType {
  opId?: number;
  opNo?: string;
  charger?: string;
}

export const $getOppHeadColumnInfo: (params: {
  opId: number | string | undefined;
}) => Promise<OppHeadColumnInfoResType> = params =>
  Request.get(`/qp/business/opportunity/oppHeadColumnInfo`, { params });

// 商机改价前的校验
export const $checkOrderStatus: (params: {
  taskDetailId: number;
  type?: number;
}) => void = params =>
  Request.get(`/qp/perform/business/order/info/checkOrderStatus`, { params });

// 保存商机报价单编辑价格信息
export interface editPriceParamsType {
  taskDetailId?: number;
  officialPrice?: number;
  otherIncome?: number;
  rebateRate?: number;
  platOrderMoney?: number;
  platOrderCharge?: number;
  platMoney?: number;
  rebateType?: number;
  rebateCorporate?: number;
  rebatePrivate?: number;
}

export const $editPrice: (params: editPriceParamsType) => void = params =>
  Request.post(`/qp/business/opportunity/task/editPrice`, params);

// 获取子任务取消合作的返款信息
export const $cancelSubTask: (params: {
  subTaskId: number;
}) => Promise<{ totalRefund: number }> = params =>
  Request.get(`/qp/business/opportunity/task/cancelSubTaskInfo`, { params });

export interface CancelSubTaskCooperatedParamsType {
  cancelSubTaskId: number;
  cancelReason: string;
  rebateType?: number;
  rebatePrivate?: number;
  rebateCorporate?: number;
  cancelReasonType:number;
}

// 提交取消合作数据
export const $cancelSubTaskCooperated: (
  params: CancelSubTaskCooperatedParamsType
) => void = params =>
  Request.post(`/qp/business/opportunity/task/cancelSubTaskCooperated`, params);

/**
 * 对应账号的档期管理数据
 */
export function $getDqManagementData(params: { accountId: string }) {
  return Request.get(`/account/slot/date/slotDateList`, { params });
}

// 获取特殊收支中的平台列表
export const $getChargePlatList: () => Promise<
  { platId: number; platName: string }[]
> = () => Request.get(`/qp/business/opportunity/special/charge/platOptions`);

// 获取新增，编辑，删除后的总返款金额
export const $getTotalRebatePrice: (params: {
  opId?: number;
  rebatePrivate?: number;
  rebateCorporate?: number;
  curId?: number;
}) => Promise<number> = params =>
  Request.get(`/qp/business/opportunity/special/charge/getTotalRebatePrice`, {
    params,
  });

export interface SpecialChargeSaveParamsType {
  id?: number;
  opId: number;
  chargeType: string;
  relateGroup3th: number;
  createUserId?: number;
  platId: number;
  accountName: string;
  saleIncome: number;
  darenOutMoney: number;
  otherCost: number;
  rebateCorporate?: number;
  rebatePrivate?: number;
  finishStatus?: number;
  pactFinishDate?: string;
  performanceMonth?: string;
  moneyScreenshot?: string;
  moneyArrivalTime?: string;
  remark?: string;
  paidCustomerMoney?: string;
  financeStatus?: string;
  invoiceStatus?: string;
  rebateType?: string;
  totalRebatePrivate?: string;
  totalRebateCorporate?: string;
}
// 保存或者编辑特殊收支
export const $specialChargeSave: (
  params: SpecialChargeSaveParamsType
) => void = params =>
  Request.post(`/qp/business/opportunity/special/charge/save`, params);

export interface GetSpecialChargeListItemResType {
  id: number;
  chargeType: number;
  chargeTypeDesc: string;
  finishStatus: number;
  finishStatusDesc: string;
  relateGroup3th: number;
  relateGroup3thName: string;
  saleIncome: number;
  darenOutMoney: number;
  otherCost: number;
  rebateCorporate: number;
  rebatePrivate: number;
  businessRevenue: number;
  canEdit: number;
  canDelete: number;
  isFinance: number;
}
// 商机/确认合作 查询特殊收支列表
export const $getSpecialChargeList: (params: { opId: number }) => Promise<{
  totalBusinessRevenue: number;
  details: GetSpecialChargeListItemResType[];
}> = params =>
  Request.get(`/qp/business/opportunity/special/charge/details`, { params });

export interface GetSpecialChargeDetail extends SpecialChargeSaveParamsType {
  businessRevenue: number;
  saleCost: number;
  performanceMoney: number;
  chargeNo: string;
  orderNo: string;
  paymentType: number | undefined;
  paidCustomerMoney: string;
}
// 查询特殊收支详情
export const $getSpecialChargeDetail: (params: {
  chargeId: number;
}) => Promise<GetSpecialChargeDetail> = params =>
  Request.get(`/qp/business/opportunity/special/charge/detail`, { params });

// 判断是否可以操作新增，编辑，删除
export const $checkChargeCanEditAndAdd: (params: {
  opId: number;
  editType: number;
}) => Promise<GetSpecialChargeDetail> = params =>
  Request.get(`/qp/business/opportunity/special/charge/canEditAndAdd`, {
    params,
  });

// 删除特殊收支
export const $deleteSpecialCharge: (params: {
  id: number;
  rebateType?: number;
  totalRebatePrivate?: number;
  totalRebateCorporate?: number;
}) => void = params =>
  Request.post(`/qp/business/opportunity/special/charge/delete`, params);

// 删除特殊收支
export const $entryFinish: (params: { opId: number }) => void = params =>
  Request.post(`/qp/business/opportunity/special/charge/inputOver`, params);

// 校验商机毛利是否满足要求
export const $checkGross: (params: { opId: number }) => void = params =>
  Request.get(`/qp/business/opportunity/checkGross`, { params });

// 确认合作中校验该商机是否包含账号的属性变化
export interface AccountAttrResType {
  accountId?: number;
  accountName?: string;
  originAccountBelong?: string;
  newAccountBelong?: string;
}

export interface checkAccountResType {
  accountTypeChangeBOS: any[]
}

export const $checkAccountType: (params: { opId: number }) => Promise<checkAccountResType> = params =>
  Request.get(`/qp/business/opportunity/task/checkAccountType`, { params });

// 获取账号信息筛选数据
export interface SelectAccountConditionResType {
  accountId?: number;
  accountName?: string;
  platId?: number;
  platName?: string;		
  orgId?: number;
  belongName?: string;
} 

export const $getAccountCondition: (params?: { platIds?: number[] }) => Promise<SelectAccountConditionResType[]> = params =>
  Request.get(`/qp/business/opportunity/selectAccountCondition`, { params });
export interface ReasonOptionsType {
  id: number;
  name: string;
} 
  
// 获取子任务取消合作原因下拉项
export const $getReasonOptions: () => Promise<ReasonOptionsType[]> = () =>
  Request.get(`/qp/business/opportunity/task/cancelSubTaskReasonOptions`);
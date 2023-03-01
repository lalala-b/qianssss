import Request from "src/http/request";

export interface GetCostcenterInfoResItemType {
  costCenterCode: string;
  costCenterName: string;
  departmentName: string;
  employId: string;
  label: string;
  realName: string;
  userId: string;
  userName: string;
  value: string;
  wbUserId: string;
  wbUserName: string;
}
// 获取受益部门/成本中心列表
export const $getCostcenterInfoList: () => Promise<string> = () =>
  Request.post(`/qp/perform/business/oa/apiProxy?time=${Math.random()}`, {
    uri: "/oaapi/sys/getcostcenterinfobyname",
  });

export interface GetSupplierListParamsType {
  current: number;
  rowCount: number;
  searchItem?: string;
  searchType?: "supplier_name" | "contact_name";
  _: string;
}

export interface GetSupplierListItemType {
  supplierName: string;
  supplierId: number;
  address: string;
  bankAccount: string;
  bank: string;
  contactMobile: string;
  branchBank: string;
  province: string;
  city: string;
}

// 获取供应商列表
export const $getSupplierList: (
  params: GetSupplierListParamsType
) => Promise<string> = params =>
  Request.post(`/qp/perform/business/oa/apiProxy?time=${Math.random()}`, {
    uri: "/oaapi/supplier/list",
    params,
  });

export interface GetContractProcessListParamsType {
  current: number;
  rowCount: number;
  businessKey?: string;
  userId?: string;
  type: 0;
  _: string;
}

export interface GetContractProcessListItemType {
  businessKey: string;
  userName: string;
  deptName: string;
  reason: string;
  totalMoney: number;
  instanceId: string | number;
}

// 获取广告合同流程列表
export const $getContractProcessList: (
  params: GetContractProcessListParamsType
) => Promise<string> = params =>
  Request.post(`/qp/perform/business/oa/apiProxy?time=${Math.random()}`, {
    uri: "/oaapi/adcontractpayment/applylist",
    params,
  });

export interface GetCompanyListItemType {
  id: number;
  companyCode: string;
  companyOldCode: string;
  companyName: string;
}

// 获取所有公司列表
export const $getCompanyList: () => Promise<string> = () =>
  Request.post(`/qp/perform/business/oa/apiProxy?time=${Math.random()}`, {
    uri: "/oaapi/companyOrigCode/getAllList",
  });

export interface GetCostcenterByNameResType {
  userId: string;
  userName: string;
  realName: string;
  costCenterCode: string;
  costCenterName: string;
  employId: string;
  departmentName: string;
  wbUserId: string;
  wbUserName: string;
}
// 通过名字获取详细信息 / 获取成本中心通过名称
export const $getCostcenterByName: (params: {
  userName: string;
}) => Promise<string> = params =>
  Request.post(`/qp/perform/business/oa/apiProxy?time=${Math.random()}`, {
    uri: "/oaapi/sys/getcostcenterbyname",
    params,
  });

export interface PaymentApplyParamsType {
  toType: number;
  paymentReason: string;
  insideRemark?: string;
  paymentName: string;
  paymentScope: string;
  incomeDept: string;
  shareBase: string;
  shareRemark?: string;
  hadContract: string;
  contractAmount: number;
  contractPeriodBegin: string;
  contractPeriodEnd: string;
  supplierName: string;
  settlementClause: string;
  settlementRemark?: string;
  partnerContact?: string;
  partnerContactTel?: string;
  payeeProvince: string;
  payeeCity: string;
  payeeName: string;
  headOffice: string;
  subbranchBank: string;
  bankAccount: string;
  benefitPeriodBegin: string;
  benefitPeriodEnd: string;
  paymentAmount: number;
  company: string;
  companyId: string;
  receiptInvoiceDate: string;
  businessType: string;
  linkFlow?: string;
  supplierId: number;
  paymentDate?: string;
  fileUrl?: string;
  applyType?: string;
  businessOrderId: number;
  userName: string;
  userId: string;
}
// oa付款申请
export const $paymentApply: (params: PaymentApplyParamsType) => void = params => Request.post(`/qp/perform/business/oa/paymentApply`, params);

export interface InvoiceApplyParamsType {
  deptName: string;
  workNo: string;
  invoiceType: string;
  serviceName: string;
  company: string;
  companyId: string;
  taxAmount: number;
  requirementFlag: string;
  requirement: string;
  fileUrl: string;
  invoiceRemark?: string;
  contractNum: string;
  linkFlow: string;
  invoiceDetails: {
    invoiceName: string;
    identifier: string;
    address: string;
    bankAccount: string;
    prove: string;
    taxAmount: string;
  }[];
  applyType?: string;
  businessOrderId: number;
  userName: string;
  userId: string;
}
// oa开票申请
export const $invoiceApply: (params: InvoiceApplyParamsType) => void = params => Request.post(`/qp/perform/business/oa/invoiceApply`, params);

// 直接输入发票单流程编号同步
export const $submitInvoiceNo: (params?: any) => void = params =>
  Request.post(`/qp/perform/business/oa/invoiceInput`, params);

// 直接输入付款单流程编号同步
export const $submitPaymentInvoice: (params?: any) => void = params =>
  Request.post(`/qp/perform/business/oa/paymentInput`, params);

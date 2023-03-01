import Request from "src/http/request";
import type {
  DetailDataType,
  BusinessParamType,
  BusinessResultType,
  BusinessTypeListType,
  CompanyNameListType,
  BrandListType,
  CoCateListType,
  QuotationListType,
  DetailDataParamsType,
} from "@/pages/InvoiceManagement/config/InvoiceType";
import { OrderCrmGroupInfoResponse } from "./types/projectId_3631";
// eslint-disable-next-line import/prefer-default-export
// 查看商单详情
export const $getBusinessOrderDetailInfo: (params:{busOrderNo?: number, opNo?: string}) => Promise<DetailDataType> = (params:any) =>
  Request.get(`/qp/perform/business/order/info/getBusinessOrderDetailInfo`,{params});
// 编辑商单详情
export const $editBusinessOrder: (params:DetailDataParamsType) => Promise<DetailDataType> = (params:any) =>
  Request.post(`/qp/perform/business/order/info/editBusinessOrder`,params);

// 商单管理列表
export const $getList: (
  params: BusinessParamType
) => Promise<BusinessResultType[]> = (params: any = {}) =>{
  console.info(params)
  return Request.get(`/qp/perform/business/order/info/list`, {
    params,
  });
}
 
// 获取【合作产品名称】
export const $getCoProductName: () => Promise<BusinessResultType> = () =>
  Request.get(`/qp/perform/business/order/info/getCoProductName`);
// 商机-获取商单类型列表
export const $getBusinessTypeList: () => Promise<BusinessTypeListType> = () =>
  Request.get(`/sys/dict/data/getByDictType`);
// 获取客户
export const $getCompanyName: () => Promise<CompanyNameListType> = () =>
  Request.get(`/qp/perform/business/order/info/getCompanyName`);
// 品牌
export const $getBrandList: () => Promise<BrandListType> = () =>
  Request.get(`/qp/business/opportunity/brandList`);
// 产品品类
export const $getCoCateList: () => Promise<CoCateListType> = () =>
  Request.get(`/qp/business/opportunity/coCateList`);

// 获取商务团队/组织
export const $getOrgInfo: () => Promise<OrderCrmGroupInfoResponse> = () =>
  Request.get(`/qp/perform/business/order/info/getOrgInfo`);

// 报价单
export const $getQuotationList: (params: {
  opId: string | number;
}) => Promise<QuotationListType[]> = (params:any) =>
  Request.get(`/qp/business/quotation/list`,{params});

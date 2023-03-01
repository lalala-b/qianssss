import Request from "src/http/request";

// 获取客户下拉选项
export const $getCompanyOptionsList: () => Promise<
  {
    id: number;
    name: string;
  }[]
> = () => Request.get(`/qp/business/opportunity/plan/companyOptions`);

// 获取全部客户下拉选项
export const $getAllCompanyOptionsList: () => Promise<
  {
    id: number;
    name: string;
  }[]
> = () => Request.get(`/qp/business/opportunity/plan/allCompanyOptions`);

export interface GetPlanListParamsType {
  companyId: number;
  planNo: string;
  createTimeStart: string;
  createTimeEnd: string;
  isExport: 0 | 1;
  pageNum: number;
  size: number;
}

export interface GetPlanListItemType {
  id: number;
  planNo: string;
  createTime: string;
  companyName: string;
  coBudget: number;
  remainBudget: number;
  cooperatedBudget: number;
  coOpportunity: number;
  cooperatedOpportunity: number;
  businessOrderTotal: number;
}
// 获取方案管理列表
export const $getPlanList: (params: GetPlanListParamsType) => Promise<{
  total: number;
  list: GetPlanListItemType[];
}> = params => Request.get(`/qp/business/opportunity/plan/list`, { params });

// 保存或者编辑方案
export const $savePlan: (params: {
  id?: number;
  companyId: number;
  coBudget: number;
  planRemark?: string;
}) => void = params =>
  Request.post(`/qp/business/opportunity/plan/save`, params);

// 查看方案详情
export const $getPlanDetail: (params: {
  id?: number;
}) => Promise<{
  id: number;
  companyId: number;
  coBudget: number;
  planRemark: string;
}> = params => Request.get(`/qp/business/opportunity/plan/detail`, { params });

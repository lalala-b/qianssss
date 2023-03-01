import Request from "src/http/request";

export interface GetOaApplyRecordListParamsType {
  createTime?: any;
  createTimeBegin?: string;
  createTimeEnd?: string;
  applyType?: number;
  applyStatus?: number;
  applyContent?: string;
  applyNo?: string;
  applyUserId?: number;
  pageNum?: number;
  size?: number;
}

export interface GetOaApplyRecordListItemResType {
  createTime: string;
  applyNo: string;
  applyType: number;
  applyTypeDesc: string;
  applyContent: string;
  applyUser: string;
  overTime: string;
  applyStatus: number;
  applyStatusDesc: string;
  instanceId: string;
}

// 获取oa申请记录列表
export const $getOaApplyRecordList: (
  params: GetOaApplyRecordListParamsType
) => Promise<{
  total: number;
  list: GetOaApplyRecordListItemResType[];
}> = params => Request.get(`/qp/perform/business/oa/list`, { params });

// 获取申请人下拉数据
export const $getApplyUserList: () => Promise<
  { id: number; name: string }[]
> = () => Request.get(`/qp/perform/business/oa/applyUserOption`);

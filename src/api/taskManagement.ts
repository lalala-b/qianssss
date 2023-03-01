import Request from "src/http/request";
import type {
  DistributeMedParamsType,
  SubmitRecommendType,
  TaskStatusListType,
  TaskFollowersListType,
  SearchDataType,
  TaskResListType,
  PlatListType,
  AccountListType,
  detailDataType,
  RecommendDataType,
  OppoMediumBuyerType,
  BusinessOppoFollowersResType,
} from "src/pages/TaskManagement/TaskManagementCom/TaskManagementType";

export interface RecommendListType {
  pid: number | undefined;
  recommendType: number;
  taskFollower?: string;
}

/**
 * 任务管理-商机负责人列表
 */
export const $getOppoFollowers: () => Promise<
  BusinessOppoFollowersResType[]
> = () => Request.get(`/qp/business/opportunity/businessOppoFollowers`);
/**
 * 任务管理-媒介找号任务-分配媒介采买人
 */
export const $distributeMed: (
  params: DistributeMedParamsType
) => Promise<any> = params =>
  Request.post(
    `/qp/business/opportunity/task/createTask/distributeMed`,
    params
  );
/**
 * 媒介采买人列表
 */
export const $getOppoMediumBuyer: (params: {
  pid: number | undefined;
}) => Promise<OppoMediumBuyerType[]> = params =>
  Request.get(`/qp/business/opportunity/oppoMediumBuyer`, {
    params,
  });

/**
 * 任务管理-任务列表数据
 */
export const $getTaskList: (
  params: SearchDataType
) => Promise<TaskResListType> = params =>
  Request.get(`/qp/business/opportunity/task/taskList`, {
    params,
  });
/**
 * 任务管理-"我已推荐"和“其他人的推荐进度"列表数据
 */
export const $getRecommendList: (
  params: RecommendListType
) => Promise<RecommendDataType> = params =>
  Request.get(`/qp/business/opportunity/task/recommendList`, {
    params,
  });
/**
 * 任务管理-推荐账号-平台列表
 */
export const $getPlatList: () => Promise<PlatListType[]> = () =>
  Request.get(`/qp/business/opportunity/task/platList`);
/**
 * 任务管理-推荐账号-账号列表
 */
export const $getAccountList: (params: {
  platId: number | string;
}) => Promise<AccountListType[]> = params =>
  Request.get(`/qp/business/opportunity/task/recommendAccountList`, {
    params,
  });
/**
 * 任务管理-推荐账号-提交
 */
export const $submitRecommend: (params: SubmitRecommendType) => Promise<any> = params => Request.post(`/qp/business/opportunity/task/submitRecommend`, params);
/**
 * 任务管理-推荐账号-撤回推荐
 */
export const $cancelRecommend: (params: {
  subTaskId: number;
}) => Promise<any> = params =>
  Request.post(`/qp/business/opportunity/task/cancelRecommend`, params);
/**
 * 商机列表-查看商机详情
 */
export const $getRemmonedDetail: (params: {
  id: number | undefined;
}) => Promise<detailDataType> = params =>
  Request.get(`/qp/business/opportunity/detail`, {
    params,
  });
/**
 * 任务状态列表
 */
export const $getTaskStatusList: () => Promise<TaskStatusListType[]> = () =>
  Request.get(`/qp/business/opportunity/task/taskStatusList`);
/**
 * 商机-获取任务跟进人列表
 */
export const $getTaskFollowers: () => Promise<TaskFollowersListType> = () =>
  Request.get(`/qp/business/opportunity/taskFollowers`);

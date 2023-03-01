/* eslint-disable max-len */
import Request from "src/http/request";

interface WorkflowListParamsType {
  workflowId?: string | number;
  workflowName?: string;
  orderType?: number;
  busOrderType?: number;
  performType?: number;
  isUsable?: number;
  pageNum?: number;
  size?: number;
}

export interface WorkflowListResType {
  workflowId: string | number;
  workflowName: string;
  orderType: number;
  orderTypeName: string;
  busOrderType: number;
  busOrderTypeName: string;
  performType: number;
  performTypeName: string;
  isUsable: number;
  isUsableName: string;
  isDeleted: number;
  createTime: string;
}

// 查询工作流列表
export const $getWorkflowList: (params: WorkflowListParamsType) => Promise<{
  code: number;
  data: WorkflowListResType[];
  total: number;
  message: string;
}> = params => Request.get("/qp/perform/workflow/findList", { params });

type GetByDictParamsType =
  | "perform_node_table"
  | "perform_type"
  | "bus_order_type"
  | "perform_order_type";
// 获取筛选项
export const $getByDictType: (params: {
  dictTypes: GetByDictParamsType[];
}) => Promise<any> = params =>
  Request.post("/sys/dict/data/getByDictType", params);

interface AddWorkflowParamsType {
  workflowName: string;
  orderType: string;
  busOrderType: string;
  performType: string;
}
// 新增工作流程
export const $addWorkflow: (
  params: AddWorkflowParamsType
) => Promise<any> = params =>
  Request.post("/qp/perform/workflow/saveWorkflow", params);

// 变更工作流程状态
export const $updateWorkflow: (params: {
  workflowId: number;
  isUsable: number;
}) => Promise<any> = params =>
  Request.post("/qp/perform/workflow/updateWorkflow", params);

export interface FindNodeListResType {
  nodeId: string | number;
  nextNodeId: string;
  workflowId: number;
  workflowName: string;
  nodeName: string;
  nodeCode: string;
  nodeTable: string;
  nodeStep: number;
  createTime: string;
}

// 查询工作流列表
export const $findNodeList: (params: {
  workflowId?: string | number;
  pageNum?: number;
  size?: number;
}) => Promise<{
  code: number;
  data: FindNodeListResType[];
  total: number;
  message: string;
}> = params => Request.get("/qp/perform/node/findNodeList", { params });

interface AddProcessNodeParamsType {
  workflowId: string;
  nodeName: string;
  nodeTable: string;
  nodeStep: number;
}
// 新增流程节点
export const $addProcessNode: (
  params: AddProcessNodeParamsType
) => Promise<any> = params => Request.post("/qp/perform/node/saveNode", params);

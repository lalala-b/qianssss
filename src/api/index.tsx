/* eslint-disable max-len */
import Request from "src/http/request";
import type { DistributeMedParamsType } from "src/pages/TaskManagement/TaskManagementCom/TaskManagementType";
// eslint-disable-next-line import/prefer-default-export
export function $getUserInfo(params: DistributeMedParamsType) {
  return Request.get(`/user/info/getmenus`, { params });
}

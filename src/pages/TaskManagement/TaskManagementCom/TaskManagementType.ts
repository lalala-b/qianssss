/* eslint-disable no-use-before-define */
/* eslint-disable flowtype/no-types-missing-file-annotation */

export interface SearchDataType {
  taskType: number;
  pid?: string|number;
  opNo?: string;
  charger?: string | number ;
  taskFollower?: string | number ;
  taskStatus?: never[] | null | undefined;
  beginTime?: string;
  endTime?: string;
  periodTime?: string[] | null | undefined;
  pageNum?:number;
  size?:number;
}
export interface BusinessOppoFollowersResType {
  id: number;
  parentId: number;
  isParent: number;
  orgName: string;
  depthLayer: number;
  childOrgList?: BusinessOppoFollowersResType[];
  userFlag: number;
}
export interface TaskListType {
  taskType: string | number; // 1签约 2媒介
  pid?: number;
  opNo?: string;
  charger?: string;
  taskFollower?: string;
  taskStatus?: string;
  beginTime?: string;
  endTime?: string;
  pageNum?: number;
  size?: number;
  methodId?: string | number;
  determined?: string;
}
export interface TaskResListType {
  total: number;
  list: TaskListType[];
}
export interface PageType {
  total: number;
  pageNum: number;
  pageSize: number;
}
export interface AccountListType {
  accountId: string | number;
  accountName: string;
}
export interface recommendAccountsType {
  platId: string | number;
  accountName: string;
}
export interface TaskTableType {
  subTaskId?: string | number;
  pid: number | string;
  opNo?: string | number;
  opId?: number;
  charger?: string;
  recommendAccountNumbers?: string | number;
  recommendAccounts?: recommendAccountsType[];
  taskFollower?: string;
  taskFollowerId?: number;
  taskStatus: number;
  updateTime?: string | number;
  taskSeq?: string | number;
  myRecommendNum?: string | number;
  otherRecommendNum?: string | number;
  stopFindTime?: string;
  detailInfo?:any;
}
export interface operatorIdListType {
  id?: string;
  name?: string;
}
export interface TaskStatusListType {
  id: number;
  name: string;
}
export interface childOrgListType {
  id: number;
  isParent: number;
  orgName: string;
  parentId: number;
}
export interface OrgListType {
  id: number;
  isParent: number;
  orgName: string;
  childOrgList?: childOrgListType[];
}
export interface TaskFollowersListType {
  orgList: OrgListType[];
  defaultValues?: number[];
}

export interface TablePropsType {
  taskType: number;
  taskTableList: TaskListType[];
  total?: number;
  getList: (arg0?: any) => void;
  pagination?:any,
  defaultOpId?:number;
  defaultPid?:number;
  reCounts?:any;
  handlePageChange:any;
}
export interface MediumMOdalPropsType {
  isModalVisible: boolean;
  handleCloseModal: () => void;
  pid: number | undefined;
}

export interface CascaderOption {
  value: string | number;
  label: string;
  children?: CascaderOption[];
}
export interface DistributeMedParamsType {
  ptaskId: number | undefined;
  taskFollower: number | undefined;
}
export interface FormDataType {
  pTaskId: string | number;
  taskFollower: string | number;
}

export interface SignDrawerPropsType {
  isDrawerVisiable: boolean;
  pid: number | undefined;
  handleCloseDrawer: () => void;
  reTabType: string;
  opId: number | undefined;
  myRecommendNum: number | undefined;
  otherRecommendNum: number | undefined;
  getList: (arg0?: any) => void;
  showReAccount: boolean;
  charger: string;
}

export interface TaskentryType {
  platId: string;
  platName?: string;
  accountName: string[];
  accountNames?: string[];
  coDate?: string | null;
  reason?: string | null;
}
export interface BatchEntryType {
  platId: string;
  accountNames?: string[];
}
export interface ReAccountsPropsType {
  pid: number | undefined;
  getList: (arg0?: any) => void;
  charger?: string;
}
export interface PlatListType {
  platId: string | number;
  platName?: string | number;
}

export interface memuListType {
  key: string | number;
  label: string;
}

export interface ReTableListType {
  index?: number | string;
  platName?: string | undefined;
  accountId?: string | number | null;
  accountName?: string | null;
  accountImage?: string;
  accountLoginUrl?: string;
  platId: string;
  coDate?: string | null;
  reason?: string | null;
}
export interface SubmitRecommendType {
  pid: number | undefined;
  accountList: ReTableListType[];
}
export interface detailDataType {
  brandName?: string | number;
  chargerName?: string;
  coCateName?: string;
  coProduct?: string;
  publishStart?: string;
  publishEnd?: string;
  fileUrl?: string;
  description?: string;
}
export interface DetialModalPropsType {
  opId: number | undefined;
  isShowDetialModal: boolean;
  closeDetialModal: () => void;
}

export interface RecommnedListType {
  pId: number | undefined;
  recommendType: string;
  taskFollower?: string;
}
export interface OfficialPriceType {
  priceType: string | number;
  priceVal: number;
}
export interface IReTableListType {
  subTaskId: number;
  accountId: string | number;
  accountImg: string;
  accountName: string;
  accountLoginUrl?: string;
  accountType?: string | number;
  area?: string | number;
  indexUrl?: string | number;
  platIndexUrl?: string | number;
  platId: string | number;
  accountTag?: string | number;
  officialPrice?: OfficialPriceType[];
  coDate?: string | null;
  reason?: string;
  coPrice: number;
  coStatus: number;
  coStatusName: string;
  rcStatusName: string;
  rcStatus: number;
}
export interface RecommendDataType {
  total: number;
  list?: IReTableListType[];
  users:{name:string;userId:number}[]
}

export interface OppoMediumBuyerType {
  id: number;
  parentId: number;
  isParent: boolean;
  disabled: boolean;
  orgName: string;
  childOrgList: OppoMediumBuyerType[];
}
/* prettier-ignore-start */
/* tslint:disable */
/* eslint-disable */
export interface OrderListRequest {
    /**
     * 工商单号或商单号
     */
     orderNoOrBusOrderNo?: string;
    /**
     * 下单状态 0-未下单 1-已下单
     */
     orderFlag?:string;
    /**
     * 商务id
     */
     businessUserId?: string;
    /**
     * 商务团队id
     */
     businessGroupId?: string;
    /**
     * 商务小组id
     */
     businessTeamId?: string;
     /**
     * 执行人id
     */
      executorUserId?: string;
       /**
     * 执行人小组id
     */
        executeGroupIdId?: string;
    /**
     * 平台id
     */
    platId?: string;
    /**
     * 账号id
     */
    accountId?: string;
    /**
     * 账号名
     */
    accountName?: string;
    /**
     * 品牌id
     */
    brandId?: string;
    /**
     * 档期开始时间
     */
    slotDateBegin?: string;
    /**
     * 档期结束时间
     */
    slotDateEnd?: string;
    /**
     * 视频发布开始时间
     */
     addTimeBegin?: string;
    /**
     * 视频发布结束时间
     */
     addTimeEnd?: string;
    /**
     * 页码
     */
    pageNum?: string;
    /**
     * 大小
     */
    size?: string;
    /**
     * 个人/团队的标志
     */
    methodId?: string;
    determined?: string;
    "accountIdList[0]"?: string;
    /**
     * 账号标签
     */
    "accountTag[0]"?: string;
    "userIdList[0]"?: string;
    "platList[0]"?: string;
    "orgIdList[0]"?: string;
    /**
     * 平台id
     */
    "platInfos[0].platId"?: string;
    /**
     * 平台名称
     */
    "platInfos[0].platName"?: string;
    /**
     * 组织id
     */
    "orgInfos[0].orgId"?: string;
    /**
     * 组织名
     */
    "orgInfos[0].orgName"?: string;
    /**
     * 组织父id
     */
    "orgInfos[0].parentId"?: string;
    /**
     * 账号id
     */
    "accountInfos[0].accountId"?: string;
    /**
     * 账号名
     */
    "accountInfos[0].accountName"?: string;
    /**
     * 账号统一名称
     */
    "accountInfos[0].belongName"?: string;
    /**
     * 账号id
     */
    "userInfos[0].accountId"?: string;
    /**
     * 账号名
     */
    "userInfos[0].accountName"?: string;
    /**
     * 账号统一名称
     */
    "userInfos[0].belongName"?: string;
    /**
     * 操作方式:1-请求列表2-导出数据
     */
    queryMethodId?: string;
    /**
     * 数据域基础实体
     */
    userIdSQL?: string;
    orgIdSQL?: string;
    accountIdSQL?: string;
    userInfoSQL?: string;
    orgInfoSQL?: string;
    accountInfoSQL?: string;
    platInfoSQL?: string;
  }
  
  /**
   * 接口 [列表接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967490) 的 **返回类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/list`
   * @更新时间 `2022-08-22 17:15:26`
   */
  export interface OrderListResponse {
    /**
     * 合作总额
     */
    allCooperationAmount?: number;
    /**
     * 执行金额
     */
    allExecuteMoney?: number;
    /**
     * 签约订单列表
     */
    data: {
      /**
       * 工单号
       */
      orderNo?: string;
      /**
       * 品牌id
       */
      brandId?: number;
      /**
       * 品牌名称
       */
      newsContent?: string;
      /**
       * 商单类型 1 客户自行下单  2 达人私单  3 不走平台的私单
       */
      quotationType?: number;
      /**
       * 工单类型类型：1=视频工单、2=特殊工单
       */
      orderType?: number;
      /**
       * 工单状态：1-确认下单信息，2-分配执行人，3-录入执行计划，4-确认大纲，5-确认脚本，6-确认视频初稿，7-发布视频，8-确认收付款，9-财务核账
       */
      orderStatus?: number;
      /**
       * 创建人id
       */
      createUserId?: number;
      /**
       * 创建人
       */
      createUserName?: number;
      /**
       * 商务团队id
       */
      belongGroupId?: number;
      /**
       * 商务团队名
       */
      belongGroupName?: string;
      /**
       * 订单归属
       */
      belongTeam?: string;
      /**
       * 签约经纪人id
       */
      signUserId?: number;
      /**
       * 签约经纪人
       */
      signUserName?: string;
      /**
       * 签约小组id
       */
      signGroupId?: number;
      /**
       * 签约小组
       */
      signGroupName?: string;
      /**
       * 签约团队id
       */
      signTeamId?: number;
      /**
       * 签约团队
       */
      signTeamName?: string;
      /**
       * 账号名
       */
      accountName?: string;
      /**
       * 账号id
       */
      accountId?: number;
      /**
       * 后台登录链接
       */
      accountLoginUrl?: string;
      /**
       * 星图链接
       */
      xingtuIndexUrl?: string;
      /**
       * 标签
       */
      sysAccountTag?: string;
      /**
       * 平台id
       */
      platId?: number;
      /**
       * 平台名
       */
      platName?: string;
      /**
       * 档期
       */
      slotDate?: string;
      /**
       * 订单流水
       */
      orderMoney?: number;
      /**
       * 绩效营收
       */
      performanceMoney?: number;
      /**
       * 内容协助  0-否 1-是
       */
      contentAssist?: number;
      /**
       * 视频id
       */
      flowId?: number;
      /**
       * 视频链接
       */
      url?: string;
      /**
       * 视频标题
       */
      titleName?: string;
      /**
       * 视频封面链接
       */
      videoCoverUrl?: string;
      /**
       * 收付款状态 1-向达人应付 2-向达人应收
       */
      paymentType?: number;
      /**
       * 收款状态 1-已付款/已收款 2-未付款/未收款
       */
      paymentResult?: number;
      /**
       * 绩效月
       */
      monthMoney?: string;
    }[];
    /**
     * 总条数
     */
    total: string;
  }
  
  /**
   * 接口 [筛选条件接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967492) 的 **请求类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/condition`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export interface OrderConditionRequest {}
  
  /**
   * 接口 [筛选条件接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967492) 的 **返回类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/condition`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export interface OrderConditionResponse {
    /**
     * 签约筛选联动
     */
    signGroup?: {
      id?: number;
      parentId?: number;
      isParent?: number;
      orgName?: string;
      depthLayer?: number;
      childOrgList?: {
        id?: number;
        parentId?: number;
        isParent?: number;
        orgName?: string;
        depthLayer?: number;
        childOrgList?: {
          id?: number;
          parentId?: number;
          isParent?: number;
          orgName?: string;
          depthLayer?: number;
        }[];
        /**
         * 区分用户还是组织  0 否 1 是
         */
        userFlag?: number;
      }[];
      /**
       * 区分用户还是组织  0 否 1 是
       */
      userFlag?: number;
    }[];
    /**
     * 品牌信息
     */
    brandInfoBOS?: {
      /**
       * id
       */
      id?: number;
      /**
       * 品牌名
       */
      brandName?: string;
      /**
       * 公司名
       */
      companyName?: string;
    }[];
    /**
     * 账号名称
     */
    accountInfo?: {
      accountId?: number;
      accountName?: string;
      belongName?: string;
      platId?: number;
    }[];
    /**
     * 平台信息
     */
    platInfos?: {
      /**
       * 平台id
       */
      platId?: number;
      /**
       * 平台名称
       */
      platName?: string;
    }[];
  }
  
  /**
   * 接口 [平台账号联动接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967501) 的 **请求类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/signPlatAccountLinkage`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export interface OrderSignPlatAccountLinkageRequest {
    platId: string;
  }
  
  /**
   * 接口 [平台账号联动接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967501) 的 **返回类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/signPlatAccountLinkage`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export type OrderSignPlatAccountLinkageResponse = {
    accountId?: number;
    accountName?: string;
    belongName?: string;
    platId?: number;
  }[];
  
  /**
   * 接口 [获取各状态订单条数↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967503) 的 **请求类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/orderCount`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export interface OrderOrderCountRequest {
    orderNoOrBusOrderNo?:number;
    orderFlag?:number;
  }
  
  /**
   * 接口 [获取各状态订单条数↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967503) 的 **返回类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/orderCount`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export interface OrderOrderCountResponse {
    /**
     * 全部工单条数
     */
    allCount?: number;
    /**
     * 下单信息待确认工单条数
     */
    confirmInformationCount?: number;
    /**
     * 分配执行人状态工单条数
     */
    assignExecutorCount?: number;
    /**
     * 录入执行计划状态工单条数
     */
    enterExecutionPlanCount?: number;
    /**
     * 确认大纲状态工单条数
     */
    confirmOutlineCount?: number;
    /**
     * 确认脚本状态工单条数
     */
    confirmScriptCount?: number;
    /**
     * 确认视频初稿工单条数
     */
    confirmFirstVideoCount?: number;
    /**
     * 发布视频状态工单条数
     */
    postVideoCount?: number;
    /**
     * 确认收付款状态工单条数
     */
    confirmReceiptPaymentCount?: number;
    /**
     * 财务核账状态工单条数
     */
    financialAccountingCount?: number;
    /**
     * 已核帐工单条数
     */
    auditedWorkCount?: number;
    /**
     * 已撤单工单条数
     */
    cancelledWorkCount?: number;
  }
  
  /**
   * 接口 [商务筛选接口  签约、媒介、工作室订单公用接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967512) 的 **请求类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/crmGroupInfo`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export interface OrderCrmGroupInfoRequest {}
  
  /**
   * 接口 [商务筛选接口  签约、媒介、工作室订单公用接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1967512) 的 **返回类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/crmGroupInfo`
   * @更新时间 `2022-08-15 17:50:23`
   */
  export type OrderCrmGroupInfoResponse = {
    id?: number;
    parentId?: number;
    isParent?: number;
    orgName?: string;
    depthLayer?: number;
    childOrgList?: {
      id?: number;
      parentId?: number;
      isParent?: number;
      orgName?: string;
      depthLayer?: number;
      childOrgList?: {
        id?: number;
        parentId?: number;
        isParent?: number;
        orgName?: string;
        depthLayer?: number;
      }[];
      /**
       * 区分用户还是组织  0 否 1 是
       */
      userFlag?: number;
    }[];
    /**
     * 区分用户还是组织  0 否 1 是
     */
    userFlag?: number;
  }[];
  
  /**
   * 接口 [签约订单列表导出接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1969311) 的 **请求类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/downloadSignList`
   * @更新时间 `2022-08-16 10:03:01`
   */
  export interface OrderDownloadSignListRequest {
    /**
     * 列表 or  导出type  0 - 列表  1 - 导出
     */
    type?: string;
    /**
     * 工单状态：1-确认下单信息，2-分配执行人，3-录入执行计划，4-确认大纲，5-确认脚本，6-确认视频初稿，7-发布视频，8-确认收付款，9-财务核账
     */
    orderStatus?: string;
    /**
     * 工商单号
     */
    orderNum?: string;
    /**
     * 订单类型：0-视频工单，1-特殊工单
     */
    orderType?: string;
    /**
     * 签约团队id
     */
    signGroupId?: string;
    /**
     * 签约小组id
     */
    signTeamId?: string;
    /**
     * 签约经纪人id
     */
    signUserId?: string;
    /**
     * 平台id
     */
    platId?: string;
    /**
     * 账号id
     */
    accountId?: string;
    /**
     * 账号名
     */
    accountName?: string;
    /**
     * 品牌id
     */
    brandId?: string;
    /**
     * 收付款状态 1-向达人应付 2-向达人应收
     */
    paymentType?: string;
    /**
     * 收款状态 1-已付款/已收款 2-未付款/未收款
     */
    paymentResult?: string;
    /**
     * 内容协助  0-否 1-是
     */
    contentAssist?: string;
    /**
     * 商务团队id
     */
    crmGroupId?: string;
    /**
     * 商务小组id
     */
    crmTeamId?: string;
    /**
     * 商务id
     */
    crmId?: string;
    /**
     * 档期开始时间
     */
    slotDateBegin?: string;
    /**
     * 档期结束时间
     */
    slotDateEnd?: string;
    /**
     * 绩效月开始时间
     */
    monthMoneyBegin?: string;
    /**
     * 绩效月结束时间
     */
    monthMoneyEnd?: string;
    /**
     * 订单归属flag 1- 好莱坞工单 2- 五合镖局工单
     */
    orderAttributionFlag?: string;
    /**
     * 页码
     */
    pageNum?: string;
    /**
     * 大小
     */
    size?: string;
    /**
     * 个人/团队的标志
     */
    methodId?: string;
    determined?: string;
    "accountIdList[0]"?: string;
    /**
     * 账号标签
     */
    "accountTag[0]"?: string;
    "userIdList[0]"?: string;
    "platList[0]"?: string;
    "orgIdList[0]"?: string;
    /**
     * 平台id
     */
    "platInfos[0].platId"?: string;
    /**
     * 平台名称
     */
    "platInfos[0].platName"?: string;
    /**
     * 组织id
     */
    "orgInfos[0].orgId"?: string;
    /**
     * 组织名
     */
    "orgInfos[0].orgName"?: string;
    /**
     * 组织父id
     */
    "orgInfos[0].parentId"?: string;
    /**
     * 账号id
     */
    "accountInfos[0].accountId"?: string;
    /**
     * 账号名
     */
    "accountInfos[0].accountName"?: string;
    /**
     * 账号统一名称
     */
    "accountInfos[0].belongName"?: string;
    /**
     * 账号id
     */
    "userInfos[0].accountId"?: string;
    /**
     * 账号名
     */
    "userInfos[0].accountName"?: string;
    /**
     * 账号统一名称
     */
    "userInfos[0].belongName"?: string;
    /**
     * 操作方式:1-请求列表2-导出数据
     */
    queryMethodId?: string;
    /**
     * 数据域基础实体
     */
    userIdSQL?: string;
    orgIdSQL?: string;
    accountIdSQL?: string;
    userInfoSQL?: string;
    orgInfoSQL?: string;
    accountInfoSQL?: string;
    platInfoSQL?: string;
  }
  
  /**
   * 接口 [签约订单列表导出接口↗](http://zapi.zhuanspirit.com/project/3631/interface/api/1969311) 的 **返回类型**
   *
   * @分类 [履约流程 - 签约订单模块↗](http://zapi.zhuanspirit.com/project/3631/interface/api/cat_131582)
   * @请求头 `GET /api/sign/order/downloadSignList`
   * @更新时间 `2022-08-16 10:03:01`
   */
  export interface OrderDownloadSignListResponse {}
  // 工单合作金额
  export interface OverListType {
    coPrice:number;
    executeMoney:number;
    performanceMoney:number;
    salesIncomeSum: number;   // 销售收入
    orderActualIncomeSum: number;  //工单实际营收
  }
  export interface PlatInfoType {
    platId:number;
    platName:string;
  }
  export interface AccountInfoType {
    accountId:number;
    accountName:string;
    belongName?:string
  }
  
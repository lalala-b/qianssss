/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { useEffect, useState, useMemo, useContext } from "react";
import type { ColumnsType } from "antd/es/table";
// import { useNavigate } from "react-router";
import {
  Button,
  Card,
  Popover,
  ConfigProvider,
  // message,
  Spin,
  Tabs,
  Space,
  Tag,
  Dropdown,
  Menu,
  message,
  Modal,
} from "antd";
import qs from "qs";
import { cloneDeep, isNumber } from "lodash";
import moment from "moment";
import { GlobalContext } from "src/contexts/global";
import zhCN from "antd/es/locale/zh_CN";
import {
  $getBrandList,
  BrandListResType,
  BusinessOpportunityType,
  $getBussinessOpportunityList,
  SearchDataParamsType,
  $getStatusTotal,
  // $getBusinessOppoFollowers,
  BusinessOppoFollowersResType,
  $getCustomerTypeList,
  $getCoProductList,
  $getCoCateList,
  GetCustomerNameItemResType,
  $getCustomerName,
  $getBusinessOppoFollowersWithDefUser,
  $getOppoFromList,
  OppoFromListType,
  $checkGross,
  $checkAccountType,
  $getAccountCondition,
  SelectAccountConditionResType,
} from "src/api/business";
import { $getPlatInfo } from "src/api/work";
import IconTip from "src/components/IconTip";
import { getUrlQuery } from "src/utils/getUrlQuery";
import Search from "src/components/Search/Search";
import type {
  SearchGroupConfigItemType,
  SearchConfigItemPropsType,
} from "src/components/Search/Search";
import sendPerf from "src/utils/lego";
import { SEARCH_LIST } from "./config/search";
import AccountAttrChangeModal from "./AccountAttrChangeModal";
import BusinessOpportunityDrawer from "./BusinessOpportunityDrawer";
import NoSearchOpportunityDrawer from "./NoSearchOpportunityDrawer";
import CollaborativeNumFindModal from "./CollaborativeNumFindModal";
import ContinueFindNumModal from "./ContinueFindNumModal";
import ConfirmCooperateModal from "./ConfirmCooperateModal";
import NoCooperateModal from "./NoCooperateModal";
import BusinessOpportunityTable from "./BusinessOpportunityTable/BusinessOpportunityTable";
// import BusinessOppoSearch from "./BusinessOppoSearch";
import styles from "./NewBusinessOpportunity.scss";

const { TabPane } = Tabs;

// 标签页数据类型
declare interface TabsType {
  label: string;
  value: number;
  tip?: string;
  key: string;
  id: string;
}

// 协同找号传递给弹窗的参数类型
declare interface CollaborativeNumFindParamsType {
  opId: number;
}

// 继续找号传递给弹窗的参数类型
declare interface ContinueFindNumParamsType {
  opId: number;
}

// 确认合作传递给弹窗的参数类型
declare interface ConfirmCooperateParamsType {
  opId: number;
  opType?: number;
  specialChargeTotal?: string;
}

// 暂不合作传递给弹窗的参数类型
declare interface NoCooperateParamsType {
  opId: number;
  opType?: number;
}

// 分页类型
declare interface PageType {
  total: number;
  pageNum: number;
  pageSize: number;
  // pageSizeOptions: string[];
}

// 传递给详情组件的按钮数据类型
declare interface DetailBtnDataType {
  label: string;
  type: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
  handleMethod: () => void;
}

declare interface FilterListType {
  title?: string | string[];
  label?: string;
  value: any;
  key: string;
  type: string;
  conf?: any;
}

declare interface HandlerFilterResType {
  showValue: any;
  sendParams: any;
}

const NewBusinessOpportunity: React.FC = () => {
  const initTabsData = [
    {
      label: "全部",
      value: 0,
      id: "1",
      key: "allNum",
    },
    {
      label: "待找号",
      value: 0,
      tip: "可通过自行找号或协同找号功能进行找号",
      id: "2",
      key: "readyFind",
    },
    {
      label: "找号中",
      value: 0,
      id: "3",
      key: "finding",
    },
    {
      label: "待客户选号",
      value: 0,
      tip: "需要线下跟客户确认账号，并在乾数据勾选",
      id: "4",
      key: "readyCustomerChoose",
    },
    {
      label: "待账号负责人确认",
      value: 0,
      tip: "已发送飞书通知给账号的负责人，需要待他们确认档期、价格等信息",
      id: "5",
      key: "readySecondConfirm",
    },
    {
      label: "特殊收支录入中",
      value: 0,
      id: "9",
      key: "specialCharge",
    },
    {
      label: "待客户确认合作",
      value: 0,
      tip: "需要将最终确认合作的账号录入报价单，填入相关的合作信息",
      id: "6",
      key: "readyCustomerCooperation",
    },
    {
      label: "确认合作",
      value: 0,
      id: "7",
      key: "cooperation",
    },
    {
      label: "暂不合作",
      value: 0,
      id: "8",
      key: "noCooperation",
    },
  ];
  const { globalData = {} } = useContext(GlobalContext);
  // 品牌数据
  const [brand, setBrand] = useState<BrandListResType[]>([]);
  // 商机负责人数据
  const [businessOppoFollowers, setBusinessOppoFollowers] = useState<
    BusinessOppoFollowersResType[]
  >([]);
  // 商机来源数据
  const [oppoFromList, setOppoFromList] = useState<OppoFromListType[]>([]);
  // 控制是否打开找号商机类型的抽屉
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  // 控制是否打开不找号商机类型的抽屉
  const [showNoSearchDrawer, setShowNoSearchDrawer] = useState<boolean>(false);
  // 打开抽屉的类型
  const [drawerType, setDrawerType] = useState<DrawerType>("");
  // 传入抽屉的商机ID
  const [drawerId, setDrawerId] = useState<number | string | undefined>("");
  // 控制打开抽屉时是否显示在推荐账号的tab页
  const [activeKeyForCommand, setActiveKeyForCommand] =
    useState<boolean>(false);
  // 控制是否打开协同找号的弹窗
  const [showModal, setShowModal] = useState<boolean>(false);
  // 传递给协同找号弹窗的参数
  const [collaborativeFindNumParams, setCollaborativeFindNumParams] =
    useState<CollaborativeNumFindParamsType>({
      opId: 0,
    });
  // 控制是否打开继续找号的弹窗
  const [showContinueFindNumModal, setShowContinueFindNumModal] =
    useState<boolean>(false);
  // 传递给继续找号弹窗的参数
  const [continueFindNumParams, setContinueFindNumParams] =
    useState<ContinueFindNumParamsType>({
      opId: 0,
    });
  // 控制是否打开取消合作的弹窗
  const [showNoCooperateModal, setShowNoCooperateModal] =
    useState<boolean>(false);
  // 传递给取消合作弹窗的参数
  const [noCooperateParams, setNoCooperateParams] =
    useState<NoCooperateParamsType>({
      opId: 0,
    });
  // 控制确认合作弹窗的开关
  const [showConfirmCooperateModal, setShowConfirmCooperateModal] =
    useState<boolean>(false);
  // 控制账号发生变化弹窗的开关
  const [showAccountAttrChangeModal, setShowAccountAttrChangeModal] =
    useState<boolean>(false);
  // 传递给确认合作弹窗的参数
  const [confirmCooperateParams, setConfirmCooperateParams] =
    useState<ConfirmCooperateParamsType>({
      opId: 0,
    });
  // 账号属性变化的数据
  const [accountTypeChangeBOS, setAccountTypeChangeBOS] = useState<any[]>([]);
  // 搜索数据
  const [searchData, setSearchData] = useState<any>({
    pageNum: 1,
    size: 20,
  });
  // 搜索设置项
  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >(SEARCH_LIST);
  // 分页设置
  const [pagination, setPagination] = useState({
    pageSize: 20,
    total: 0,
    current: 1,
    onChange(page: number) {
      setPagination(
        Object.assign(pagination, {
          current: page,
        })
      );
      getBussinessOpportunityData({
        pageNum: page,
      });
    },
  });
  // 页数设置
  const [page, setPage] = useState<PageType>({
    total: 1, // 总条数
    pageNum: 1, // 当前页码
    pageSize: 20, // 每页数据条数
    // pageSizeOptions: ["20", "50"], // 每页可选择的条数
  });
  // 表格数据
  const [tableData, setTableData] = useState<BusinessOpportunityType[]>([]);
  // 分类页数据
  const [tabsData, setTabsData] = useState<TabsType[]>(initTabsData);
  // 商机合作类型数据
  const [customerTypeList, setCustomerTypeList] = useState<
    { id: number; name: string }[]
  >([]);
  // 客户联系人数据
  const [customerList, setCustomerList] = useState<
    GetCustomerNameItemResType[]
  >([]);
  // 表格的loading
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  // 商机顶部的分类页key
  const [businessOppoActiveKey, setBusinessOppoActiveKey] =
    useState<string>("1");

  // 账号下拉筛选数据
  const [accountList, setAccountList] = useState<
    SelectAccountConditionResType[]
  >([]);

  // 设置默认商机负责人
  const [defaultCharger, setDefaultCharger] = useState<number[]>([]);

  // 设置默认平台
  const [defaultPlat, setDefaultPlat] = useState<any>({});

  // 设置默认账号
  const [defaultAccount, setDefaultAccount] = useState<any>({});

  // 表格分类页的key
  const [activeTabKey, setActiveTabKey] = useState<string>("1");

  // 确认合作按钮loading
  const [confirmCoopLoading, setConfirmCoopLoading] = useState<boolean>(false);

  // 当前点击确认合作按钮的商机id
  const [curConfirmCoopOpId, setCurConfirmCoopOpId] = useState<number>(0);

  // 初始没有携带参数的标识
  const [initNoParamsFlag, setInitNoParamsFlag] = useState<boolean>(false)

  const { location, $permission } = window;

  // 路由的携带参数
  const {
    opNo,
    planNo,
    accountId,
    platId,
    time = "",
  } = getUrlQuery(location.href);

  // 传递给detail组件右上角展示的button
  const detailBtnData: DetailBtnDataType[] = [
    {
      label: "新建商机",
      type: "primary",
      handleMethod: () => {
        setShowDrawer(true);
        setDrawerType("add");
      },
    },
  ];

  // 检查毛利率是否合乎规定的阈值
  const checkGrossProfit = async (id: number) => {
    let res: any = "";

    try {
      const resData = await $checkGross({ opId: id });
      res = resData;
    } catch (e: any) {
      console.info("---e", e);
    }

    return new Promise(resolve => {
      // 不等于1 说明不满足
      if (+res !== 1) {
        const modal = Modal.confirm({
          title: "提示",
          content:
            "部分账号的毛利已低于公司规定的最低的毛利，有财务风险，建议返回检查账号金额是否有误",
          cancelText: "继续下一步",
          okText: "返回检查",
          onOk: async () => {
            resolve(false);
            modal.destroy();
          },
          onCancel: async () => {
            resolve(true);
          },
        });
        return;
      }

      resolve(true);
    });
  };

  // 抽屉
  const handleShowDrawer = (
    type: DrawerType,
    id?: number | string,
    isActiveKeyForCommand = false,
    opType?: number
  ) => {
    setDrawerType(type);
    setDrawerId(id);
    setActiveKeyForCommand(isActiveKeyForCommand);

    // 不找号商机
    if (Number(opType) === 2) {
      setShowNoSearchDrawer(true);
    } else {
      setShowDrawer(true);
    }
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setDrawerType("");
    setDrawerId("");
  };

  const handleCloseNoSearchDrawer = () => {
    setShowNoSearchDrawer(false);
    setDrawerType("");
    setDrawerId("");
  };

  // 协同找号的弹窗
  const handleShowCollaborateModal = (
    params: CollaborativeNumFindParamsType
  ) => {
    setCollaborativeFindNumParams(params);
    setShowModal(true);
  };

  const handleCloseCollaborateModal = () => {
    setShowModal(false);
  };

  // 继续找号的弹窗
  const handleShowContinueFindNumModal = (
    params: ContinueFindNumParamsType
  ) => {
    setContinueFindNumParams(params);
    setShowContinueFindNumModal(true);
  };

  const handleCloseContinueFindNumModal = () => {
    setShowContinueFindNumModal(false);
  };

  // 确认客户选号的弹窗
  const handleShowConfirmChooseModal = async (id: number) => {
    const res = await checkGrossProfit(id);
    if (!res) return;

    handleShowDrawer("edit", id, true);
  };

  // 确认合作的弹窗
  const handleShowConfirmCooperateModal = async (
    params: ConfirmCooperateParamsType
  ) => {
    const res = await checkGrossProfit(Number(params.opId));
    if (!res) return;

    try {
      setCurConfirmCoopOpId(params.opId);
      setConfirmCooperateParams(params);
      setConfirmCoopLoading(true);
      const res = await $checkAccountType({
        opId: params.opId,
      });
      if (res.accountTypeChangeBOS.length) {
        // 有账号属性发生变化，打开账号属性发生变化弹窗
        const accountTypeChangeBOS = res.accountTypeChangeBOS.map(item => {
          item.oppoAccount.accountBaseInfoVo.accountName =
            item.oppoAccount.accountName;
          item.oppoAccount.accountBaseInfoVo.accountId =
            item.oppoAccount.accountId;
          item.oppoAccount.accountBaseInfoVo.xingtuIndexUrl =
            item.oppoAccount.accountBaseInfoVo.xingtuUrl;
          return item;
        });
        setAccountTypeChangeBOS(accountTypeChangeBOS);
        handleShowAccountAttrChangeModal();
      } else {
        // 否则直接打开确认合作弹窗
        handleShowConfirmCoopDrawer(params);
      }
      setConfirmCoopLoading(false);
    } catch (e: any) {
      setConfirmCoopLoading(false);
      // message.error(e?.message);
      console.info(e);
    }
  };

  const handleCloseConfirmCooperateModal = () => {
    setShowConfirmCooperateModal(false);
  };

  // 直接打开确认合作弹窗
  const handleShowConfirmCoopDrawer = (params: ConfirmCooperateParamsType) => {
    if (Number(params.opType) === 2) {
      if (Number(params.specialChargeTotal) <= 0) {
        message.error("请先添加特殊收支");
        return;
      }
    }
    setConfirmCooperateParams(params);
    setShowConfirmCooperateModal(true);
  };

  // 账号属性发生变化的弹窗
  const handleShowAccountAttrChangeModal = () => {
    setShowAccountAttrChangeModal(true);
  };

  const handleCloseAccountAttrChangeModal = () => {
    setShowAccountAttrChangeModal(false);
  };

  // 暂不合作的弹窗
  const handleShowNoCooperateModal = (params: NoCooperateParamsType) => {
    setNoCooperateParams(params);
    setShowNoCooperateModal(true);
  };

  const handleCloseNoCooperateModal = () => {
    setShowNoCooperateModal(false);
  };

  // 获取其他状态的数据及状态栏
  const getStatusTotal = (params: SearchDataParamsType = {}) => {
    // consoel.info(formatSearchData(searchData))
    const searchCloneData = formatSearchData(params);
    $getStatusTotal(searchCloneData)
      .then(res => {
        const allNum = Object.values(res).reduce(
          (init: number, prev: number) => {
            // eslint-disable-next-line no-param-reassign
            prev += init;
            return prev;
          },
          0
        );
        const statusObj: any = {
          ...res,
          allNum,
        };
        const tabsDataTemp: any[] = tabsData.map(item => {
          item.value = statusObj[item.key];
          return item;
        });
        setTabsData(tabsDataTemp);
        sendPerf()
      })
      .catch(e => {
        console.info(e);
        // message.error(e?.message);
      });
  };

  // 根据平台Id获取平台名称
  const getPlatName = (platId: number) => {
    let str = "其他平台";
    switch (platId) {
      case 25:
        str = "抖音";
        break;
      case 26:
        str = "快手";
        break;
      case 2:
        str = "B站";
        break;
      case 45:
        str = "小红书";
        break;
      default:
        break;
    }

    return str;
  };

  // 对其他平台id进行处理
  const handlePlatId = (platId: number) =>
    [2, 25, 26, 45].includes(+platId) ? +platId : 0;

  // 获取今日日期
  const getTodayDate = () => {
    const date = new Date();

    return {
      createTimeStart: `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()} 00:00:00`,
      createTimeEnd: `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()} 23:59:59`,
    };
  };

  // 处理搜索参数数据
  const formatSearchData = (
    searchDataTemp: any = {}
  ) => {
    Object.assign(searchData, searchDataTemp);
    const cloneData = cloneDeep(searchData);
    const {
      coCate,
      charger,
      oppoFromId,
      customerId,
      coProduct,
      brandId,
      opCoType,
      accountId,
      platIds,
      createTime,
    } = cloneData;

    // 处理商机负责人信息的方法
    const getChargerInfo = (data: any[] = []) => {
      const result = {
        chargerOrg: "",
        charger: "",
      };

      data.forEach(item => {
        const { id, userFlag } = item;
        if (!userFlag) {
          result.chargerOrg = id;
        } else {
          result.charger = id;
        }
      });

      return result;
    };

    if (coCate && coCate.length) {
      cloneData.coCate = coCate[coCate.length - 1];
    }

    // 对商机负责人参数的处理
    if (charger && charger.length) {
      const { sendParams: chargerSendParams } = handlerCascaderData(
        charger,
        configMap?.charger.data
      );
      const { chargerOrg, charger: chargerId } =
        getChargerInfo(chargerSendParams);

      if (chargerOrg && !chargerId) {
        cloneData.chargerOrg = chargerOrg;
        cloneData.charger = null;
      }

      if (chargerId) {
        cloneData.charger = chargerId;
      }
    }
    // 对商机来源参数的处理
    if (oppoFromId && oppoFromId.length) {
      cloneData.oppoFromId = oppoFromId[oppoFromId.length - 1];
    }
    // 对客户联系人ID的处理
    if (customerId && customerId.length) {
      if (customerId.length === 1) {
        cloneData.companyId = customerId[0];
        cloneData.customerId = null;
      } else {
        cloneData.customerId = customerId[customerId.length - 1];
      }
    }
    // 对平台id的处理
    if (platIds && platIds.length) {
      const platIdArr: any[] = [];
      platIds.forEach((item: any) => {
        platIdArr.push(item.value);
      });
      cloneData.platIds = platIdArr;
    }
    // 对账号id的处理
    if (Object.keys(accountId || {}).length) {
      // 账号id为数字时，字段为accountId
      if (!isNaN(+accountId.value)) {
        cloneData.accountId = accountId.value;
      } else {
        // 账号id为中文时，字段为accountName
        cloneData.accountName = accountId.value;
        delete cloneData.accountId;
        delete cloneData?.optionNamekey;
      }
    }
    if (Object.keys(coProduct || {}).length) {
      cloneData.coProduct = coProduct.value;
    }
    if (Object.keys(brandId || {}).length) {
      cloneData.brandId = brandId.value;
    }
    if (Object.keys(opCoType || {}).length) {
      cloneData.opCoType = opCoType.value;
    }

    if (createTime && createTime?.length) {
      cloneData.createTimeStart = `${moment(
        // eslint-disable-next-line no-underscore-dangle
        new Date(createTime[0]?._d)
      ).format("YYYY-MM-DD")} 00:00:00`;
      cloneData.createTimeEnd = `${moment(
        // eslint-disable-next-line no-underscore-dangle
        new Date(createTime[1]?._d)
      ).format("YYYY-MM-DD")} 23:59:59`;
      delete cloneData.createTime;
    } else {
      cloneData.createTimeStart = "";
      cloneData.createTimeEnd = "";
    }

    return cloneData;
  };

  // 获取商机列表数据
  const getBussinessOpportunityData = async (
    params: SearchDataParamsType = {}
  ) => {
    const searchCloneData = formatSearchData(params);

    setTableLoading(true);
    $getBussinessOpportunityList(searchCloneData)
      .then(res => {
        const { total = 0, list = [] } = res;
        getStatusTotal(params);
        setTableData(list);
        setPage(data => Object.assign({}, data, { total }));
        setTableLoading(false);
      })
      .catch(e => {
        setTableLoading(false);
        console.info(e);
        // message.error(e?.message);
      });
  };

  //  表格标签栏切换
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    const opStatus = Number(key) - 2 === -1 ? null : Number(key) - 2;
    setPage(Object.assign(page, { pageNum: 1 }));
    setSearchData(Object.assign(searchData, { opStatus, pageNum: 1 }));
    getBussinessOpportunityData(Object.assign(searchData, { opStatus, pageNum: 1 }));
  };

  // 切换商机tab页
  const handleChangeBusinessOppoTab = (val: string) => {
    setBusinessOppoActiveKey(val);
  };

  // 商机表格数据
  const tableColumns: ColumnsType<BusinessOpportunityType> = [
    {
      title: "商机负责人",
      dataIndex: "chargerName",
      key: "chargerName",
      width: 120,
      align: "center",
      render: (chargerName: string) => <span>{chargerName || "--"}</span>,
    },
    {
      title: "商机合作类型",
      dataIndex: "opCoTypeDesc",
      key: "opCoTypeDesc",
      width: 120,
      align: "center",
      render: (opCoTypeDesc: string) => <span>{opCoTypeDesc || "--"}</span>,
    },
    {
      title: "客户",
      dataIndex: "companyName",
      key: "companyName",
      width: 120,
      align: "center",
      render: (companyName: string) => <span>{companyName || "--"}</span>,
    },
    {
      title: "客户联系人",
      dataIndex: "customerName",
      key: "customerName",
      width: 120,
      align: "center",
      render: (customerName: string) => <span>{customerName || "--"}</span>,
    },
    {
      title: "返点比例",
      dataIndex: "rebateRatio",
      key: "rebateRatio",
      width: 180,
      align: "center",
      render: (_: any, record: BusinessOpportunityType) => (
        <div>
          <p>
            自营返点比例:{" "}
            {`${record.selfRatio ? `${record.selfRatio}%` : "--"}`}
          </p>
          <p>
            签约返点比例:{" "}
            {`${record.signRatio ? `${record.signRatio}%` : "--"}`}
          </p>
        </div>
      ),
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      key: "brandName",
      width: 100,
      align: "center",
      render: (brandName: string) => <span>{brandName || "--"}</span>,
    },
    {
      title: "合作产品",
      dataIndex: "coProduct",
      key: "coProduct",
      width: 100,
      align: "center",
      render: (coProduct: string) => <span>{coProduct || "--"}</span>,
    },
    {
      title: "产品品类",
      dataIndex: "coCateDesc",
      key: "coCateDesc",
      width: 100,
      align: "center",
      render: (coCateDesc: string) => <span>{coCateDesc || "--"}</span>,
    },
    {
      title: "需求描述",
      dataIndex: "description",
      key: "description",
      width: 120,
      align: "center",
      render: (description: string) => (
        <Popover content={() => <pre>{description}</pre>}>
          <Button type="link">查看详情</Button>
        </Popover>
      ),
    },
    {
      title: "推荐/合作账号",
      dataIndex: "recommendList",
      key: "recommendList",
      width: 140,
      align: "center",
      render: (_: any, record: BusinessOpportunityType) => {
        const generateAccountContent = () => (
          <div>
            <h3>推荐账号：</h3>
            {(record.recommendList || [])?.length > 0
              ? record.recommendList?.map(item => (
                  <div key={item.accountId} className={styles.accountItem}>
                    <img
                      src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${item.platId}.png`}
                      alt=""
                    />
                    <span>【{item.accountTypeDesc}】</span>
                    {item.accountName}
                  </div>
                ))
              : "--"}
            <h3>合作账号：</h3>
            {(record.cooperationList || [])?.length > 0
              ? record.cooperationList?.map(item => (
                  <div key={item.accountId} className={styles.accountItem}>
                    <img
                      src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${item.platId}.png`}
                      alt=""
                    />
                    <span>【{item.accountTypeDesc}】</span>
                    {item.accountName}
                  </div>
                ))
              : "--"}
          </div>
        );

        return (record.recommendList || [])?.length > 0 ||
          (record.cooperationList || [])?.length > 0 ? (
          <Popover content={generateAccountContent}>
            <div className={styles.accountItemMsgWrap}>
              推荐：
              {(record.recommendList || [])?.length > 1 ? (
                <span>{record?.recommendList?.length}个</span>
              ) : (
                <span>{record?.recommendList?.[0]?.accountName || "--"}</span>
              )}
            </div>
            <div className={styles.accountItemMsgWrap}>
              合作：
              {(record.cooperationList || [])?.length > 1 ? (
                <span>{record?.cooperationList?.length}个</span>
              ) : (
                <span>{record?.cooperationList?.[0]?.accountName || "--"}</span>
              )}
            </div>
          </Popover>
        ) : (
          <>
            <div className={styles.accountItemMsgWrap}>
              推荐：
              {(record.recommendList || [])?.length > 1 ? (
                <Button type="link">{record?.recommendList?.length}个</Button>
              ) : (
                <span>{record?.recommendList?.[0] || "--"}</span>
              )}
            </div>
            <div className={styles.accountItemMsgWrap}>
              合作：
              {(record.cooperationList || [])?.length > 1 ? (
                <Button type="link">{record?.cooperationList?.length}个</Button>
              ) : (
                <span>{record?.cooperationList?.[0] || "--"}</span>
              )}
            </div>
          </>
        );
      },
    },
    {
      title: "创建人",
      dataIndex: "createName",
      key: "createName",
      width: 100,
      align: "center",
      render: (createName: string) => <span>{createName || "--"}</span>,
    },
    {
      title: "商机来源",
      dataIndex: "oppoFromName",
      key: "oppoFromName",
      width: 100,
      align: "center",
      render: (oppoFromName: string) => <span>{oppoFromName || "--"}</span>,
    },
    {
      title: "商机阶段",
      dataIndex: "opStatusDesc",
      key: "opStatusDesc",
      width: 100,
      align: "center",
    },
    {
      title: "商机号",
      dataIndex: "opNo",
      key: "opNo",
      width: 150,
      align: "center",
      render: (opNo: string) => <span>{opNo || "--"}</span>,
    },
    {
      title: "方案号",
      dataIndex: "planNo",
      key: "planNo",
      width: 150,
      align: "center",
      render: (planNo: string) => <span>{planNo || "--"}</span>,
    },
    {
      title: "创建时间",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 120,
      align: "center",
      render: (createdTime: string) => <span>{createdTime || "--"}</span>,
    },
    {
      title: "操作",
      dataIndex: "opStatus",
      key: "opStatus",
      fixed: "right",
      width: 220,
      align: "center",
      render: (opStatus: number, record: BusinessOpportunityType) => {
        let btnArr: any[] = [];
        const normalColor = "#1890ff";
        const prominentColor = "#67C23A";
        // const seldomColor = "#F56C6C";
        switch (opStatus) {
          case 0:
            btnArr = [
              { text: "协同找号", color: prominentColor },
              { text: "自行找号", color: prominentColor },
              { text: "暂不合作", color: normalColor },
              { text: "编辑", color: normalColor },
              { text: "查看", color: normalColor },
            ];
            break;
          case 1:
            btnArr = [
              { text: "自行找号", color: prominentColor },
              { text: "协同找号", color: prominentColor },
              { text: "找号进度", color: prominentColor },
              { text: "暂不合作", color: normalColor },
              { text: "编辑", color: normalColor },
              { text: "查看", color: normalColor },
            ];
            break;
          case 2:
            btnArr = [
              { text: "继续找号", color: prominentColor },
              { text: "暂不合作", color: normalColor },
              { text: "确认客户选号", color: prominentColor },
              { text: "编辑", color: normalColor },
              { text: "查看", color: normalColor },
            ];
            break;
          case 3:
            btnArr = [
              { text: "定询进度", color: prominentColor },
              { text: "继续找号", color: prominentColor },
              { text: "暂不合作", color: normalColor },
              { text: "编辑", color: normalColor },
              { text: "查看", color: normalColor },
            ];
            break;
          case 4:
            // 不找号商机
            if (record.opType === 2) {
              btnArr = [
                {
                  text: "确认合作",
                  color: prominentColor,
                  loading: confirmCoopLoading,
                },
                { text: "暂不合作", color: normalColor },
                { text: "编辑", color: normalColor },
                { text: "查看", color: normalColor },
              ];
            } else {
              btnArr = [
                {
                  text: "确认合作",
                  color: prominentColor,
                  loading: confirmCoopLoading,
                  content: record.canCooperation ? "" : "请先生成报价单",
                },
                { text: "继续找号", color: prominentColor },
                { text: "暂不合作", color: normalColor },
                { text: "生成报价单", color: prominentColor },
                { text: "编辑", color: normalColor },
                { text: "查看", color: normalColor },
              ];
            }

            break;
          case 5:
            btnArr = [
              { text: "查看", color: normalColor },
              { text: "查看商单", color: normalColor },
            ];
            break;
          case 6:
            btnArr = [{ text: "查看", color: normalColor }];
            break;
          // 特殊收支录入中
          case 7:
            btnArr = [
              { text: "暂不合作", color: normalColor },
              { text: "去录入", color: prominentColor },
              { text: "编辑", color: normalColor },
              { text: "查看", color: normalColor },
            ];
            break;
          default:
            btnArr = [{ text: "查看", color: normalColor }];
            break;
        }

        const { id } = globalData?.user?.userInfo || {};
        if (id !== record.charger) {
          btnArr = [{ text: "查看", color: normalColor }];

          if (opStatus === 5) {
            btnArr = [
              { text: "查看", color: normalColor },
              { text: "查看商单", color: normalColor },
            ];
          }
        }

        const handleShowOperation = (type = "") => {
          const { origin, pathname } = window.location;
          switch (type) {
            case "查看":
              handleShowDrawer("detail", record.id, false, record.opType);
              break;
            case "编辑":
              handleShowDrawer("edit", record.id, false, record.opType);
              break;
            case "自行找号":
              window.open(
                `${origin}${pathname}/#/bussiness-manage/bill-adv-manage?opId=${record.id}`,
                "_blank"
              );
              break;
            case "协同找号":
              handleShowCollaborateModal({
                opId: record.id,
              });
              break;
            case "找号进度":
              handleShowDrawer("edit", record.id, true);
              break;
            case "继续找号":
              handleShowContinueFindNumModal({
                opId: record.id,
              });
              break;
            case "确认客户选号":
              handleShowConfirmChooseModal(Number(record.id));
              break;
            case "生成报价单":
              handleShowDrawer("edit", record.id, true);
              break;
            case "确认合作":
              handleShowConfirmCooperateModal({
                opId: record.id,
                opType: record.opType,
                specialChargeTotal: record.specialChargeTotal,
              });
              break;
            case "暂不合作":
              handleShowNoCooperateModal({
                opId: record.id,
                opType: record.opType,
              });
              break;
            case "查看商单":
              window.open(
                `#/qp/invoice-management?opNo=${record.opNo}`,
                "_blank"
              );
              break;
            case "定询进度":
              handleShowDrawer("edit", record.id);
              break;
            case "去录入":
              handleShowDrawer("edit", record.id, false, record.opType);
              break;
            default:
              break;
          }
        };

        const generateBtnContent = () => {
          let arr: any[] = [];
          arr = btnArr.filter(
            // ({ text }) => text === "继续找号" || text === "暂不合作"
            ({ text }) => text === "暂不合作"
          );
          return arr.map(({ text, color }) => (
            <Button
              type="link"
              key={text}
              style={{ color, display: "block" }}
              onClick={() => handleShowOperation(text)}
            >
              {text}
            </Button>
          ));
        };

        return (
          <>
            <div className={styles.btnWrap}>
              <div>
                {btnArr
                  .slice(0, -2)
                  .filter(
                    // item => item.text !== "继续找号" && item.text !== "暂不合作"
                    item => item.text !== "暂不合作"
                  )
                  .map(({ text, color, content = "", loading = false }) => {
                    if (content) {
                      return (
                        <Popover placement="top" content={content} key={text}>
                          <Button
                            type="link"
                            key={text}
                            style={{ color: "#ccc", cursor: "not-allowed" }}
                            onClick={() => handleShowOperation}
                          >
                            {text}
                          </Button>
                        </Popover>
                      );
                    }
                    return (
                      <Button
                        type="link"
                        key={text}
                        style={{ color }}
                        loading={
                          record.id === curConfirmCoopOpId &&
                          text === "确认合作"
                            ? loading
                            : false
                        }
                        onClick={() => handleShowOperation(text)}
                      >
                        {text}
                      </Button>
                    );
                  })}
              </div>
              {/* 渲染编辑，查看，更多的按钮 */}
              <div>
                {btnArr.slice(-2).map(({ text, color }) => (
                  <Button
                    type="link"
                    key={text}
                    style={{ color }}
                    onClick={() => handleShowOperation(text)}
                  >
                    {text}
                  </Button>
                ))}
                {btnArr.slice(0, -2).find(
                  // item => item.text === "继续找号" || item.text === "暂不合作"
                  item => item.text === "暂不合作"
                ) ? (
                  <Popover placement="bottom" content={generateBtnContent}>
                    <Button type="link">更多</Button>
                  </Popover>
                ) : (
                  ""
                )}
              </div>
            </div>
          </>
        );
      },
    },
  ];

  // 是否单纯刷新数据
  const handleRefresh = (flag = false) => {
    if (!flag) {
      handleCloseDrawer();
      handleCloseNoSearchDrawer();
    }
    getBussinessOpportunityData({ ...searchData });
  };

  /**
   * 获取单条配置信息
   * @param list 配置列表
   * @param key 需要找的key
   * @returns
   */
  const getSearchConfigItemInfoByKey = (
    list: SearchGroupConfigItemType[],
    key: string
  ): SearchConfigItemPropsType | null => {
    for (let groupIndex = 0; groupIndex < list.length; groupIndex += 1) {
      const { config } = list[groupIndex];
      const result = config.find(configItem => configItem.key === key);
      if (result) {
        return result;
      }
    }

    return null;
  };

  /**
   * 需要设置的配置信息
   * @param list 配置列表
   * @param key 需要设置的key
   * @param value 需要设置的value
   */
  const setSearchConfigItemInfoByKey = (
    list: SearchGroupConfigItemType[],
    key: string,
    value: any
  ) => {
    const data = getSearchConfigItemInfoByKey(list, key);
    if (data) {
      data.data = value;
    }
  };
  /**
   * 处理级联数据
   * @param data 后端返回的原始数据
   * @returns 级联组件需要的数据
   */
  const handlerOrgInfoCascaderData = (
    data: any,
    fieldName: string,
    fieldVal: string,
    fieldChild: string
  ) => {
    const result: any[] = [];

    data.forEach((dataItem: any) => {
      // const { orgName, id, childOrgList } = dataItem;
      const resultItem: any = {
        ...dataItem,
        label: dataItem[fieldName],
        value: dataItem[fieldVal],
      };

      delete resultItem.childOrgList;

      if (dataItem[fieldChild]) {
        resultItem.children = handlerOrgInfoCascaderData(
          dataItem[fieldChild],
          fieldName,
          fieldVal,
          fieldChild
        );
      }

      result.push(resultItem);
    });

    return result;
  };
  /**
   * 处理级联数据
   * @param data 后端返回的原始数据
   * @returns 级联组件需要的数据
   */
  const formatCascaderData = (data: any) => {
    const result: any[] = [];

    data.forEach((dataItem: any) => {
      const { name, id, child } = dataItem;
      const resultItem: any = {
        ...dataItem,
        label: name,
        value: id,
      };

      delete resultItem.child;

      if (child) {
        resultItem.children = formatCascaderData(child);
      }

      result.push(resultItem);
    });

    return result;
  };

  function handlerSelectData(value: any): HandlerFilterResType {
    const showValue: string[] = [];
    const sendParams: string | number[] = [];

    if (typeof value === "object") {
      let result: any[] = [];

      if (Array.isArray(value)) {
        result = value;
      } else {
        result = [value];
      }

      result.forEach(item => {
        const { label, value } = item || {};

        showValue.push(label || "");
        sendParams.push(value);
      });
    }

    return {
      showValue: showValue.join(","),
      sendParams: sendParams.length <= 1 ? sendParams.join("") : sendParams,
    };
  }

  function handlerCascaderData(
    value: string[] | number[] = [],
    configInfo: SearchConfigItemPropsType["data"] = []
  ): HandlerFilterResType {
    let showValue = "";
    const sendParams: any[] = [];
    if (!configInfo) {
      showValue = "";
    } else {
      let templateConfig = configInfo;
      const result: string | number[] = [];

      value.forEach(valueItem => {
        const current = templateConfig.find(templateConfigItem => {
          const { value } = templateConfigItem;

          return value === valueItem;
        });

        sendParams.push(current);

        if (current) {
          const { children, label } = current;

          result.push(label);
          templateConfig = children;
        }
      });

      showValue = result.join("/");
    }

    return {
      showValue,
      sendParams,
    };
  }

  // 处理日期时间筛选条件展示信息
  function handlerDatePicker(value: any): HandlerFilterResType {
    let showValue = "";
    let sendParams: string | string[] = "";
    const formatTime = (item: any) => item.format("YYYY-MM-DD");

    if (value) {
      let result = [];

      try {
        if (Array.isArray(value)) {
          result = value;
          sendParams = result.map(item => formatTime(item));
          showValue = sendParams.join("-");
        } else {
          showValue = formatTime(value);
          sendParams = showValue;
        }
      } catch (err) {
        console.info(err);
      }
    }

    return {
      sendParams,
      showValue,
    };
  }

  // 计算筛选条件值
  const configMap: {
    [prop: string]: SearchConfigItemPropsType;
  } = useMemo(() => {
    const result: {
      [prop: string]: SearchConfigItemPropsType;
    } = {};

    searchConfig.forEach(item => {
      const { config } = item as SearchGroupConfigItemType;
      const singleItem = item as SearchConfigItemPropsType;

      const handlerConfigList = (info: SearchConfigItemPropsType) => {
        const { key } = info;

        result[key] = info;
      };

      if (config) {
        config.forEach(configItem => {
          handlerConfigList(configItem);
        });
      } else {
        handlerConfigList(singleItem);
      }
    });

    return result;
  }, [searchConfig]);

  // 筛选条件列表，已经处理了显示内容
  const filterList: FilterListType[] = useMemo(() => {
    const result: FilterListType[] = [];
    const handlerFilterListValue: any = (
      value: any,
      configInfo: SearchConfigItemPropsType
    ) => {
      const { type } = configInfo || {};

      if (type === "select" || type === "longSelect") {
        return handlerSelectData(value);
      }

      if (type === "input") {
        return {
          showValue: value,
          sendValue: value,
        };
      }

      if (type === "cascader" || type === "longCascader") {
        return handlerCascaderData(value, configInfo.data);
      }

      if (type === "rangeDatePicker" || type === "datePicker") {
        return handlerDatePicker(value);
      }

      return "";
    };

    Object.keys(searchData || {}).forEach((key: any) => {
      const currentValue = searchData[key];
      const currentConfig = configMap[key];

      if (currentConfig && currentValue) {
        if (Array.isArray(currentValue) && currentValue.length === 0) {
          return;
        }

        const { label, conf, type } = currentConfig;
        const { placeholder } = conf || {};

        result.push({
          title: label || placeholder || "",
          type,
          key,
          conf,
          value: handlerFilterListValue(currentValue, currentConfig)?.showValue,
        });
      }
    });

    return result;
  }, [searchData, configMap]);

  // 处理单个选项清除
  const closeFilterTagItem = (key: string) => {
    // if (key === "charger") {
    //   setCreateFlag(true);
    // }
    if (!key) {
      return;
    }

    const cloneSearchData: any = {
      ...searchData,
    };

    if (key === "platIds") {
      getAccountInfo();
      delete cloneSearchData.accountId;
      delete cloneSearchData.accountName;
    }

    delete cloneSearchData[key];

    setSearchData(cloneSearchData);
  };

  const onSearch = () => {
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );

    setPage(Object.assign(page, { pageNum: 1 }));


    getBussinessOpportunityData({
      pageNum: 1,
      size: 20,
    });
  };

  // 处理search条件改变
  const onSearchData = (data: any) => {
    // setCreateFlag(true);
    const cloneData: Record<string, any> = {};

    Object.keys(data).forEach(key => {
      if (data[key]) {
        cloneData[key] = data[key];
      }
    });

    if (cloneData?.platIds !== searchData?.platIds) {
      if (cloneData?.platIds) {
        const platIds: number | number[] = [];
        cloneData?.platIds.forEach((item: any) => {
          platIds.push(item.value);
        });
        getAccountInfo(platIds);
      } else {
        resetAccountInfo();
      }

      delete cloneData.accountName;
      delete cloneData.accountId;
    }

    setSearchData(cloneData);
  };

  // 清空搜索
  const clearFilter = () => {
    // setCreateFlag(true);
    setSearchData({
      opStatus:
        Number(activeTabKey) - 2 === -1 ? null : Number(activeTabKey) - 2,
    });
  };

  // 新增不找号商机
  const handleAddSpecial = () => {
    setShowNoSearchDrawer(true);
    setDrawerType("add");
  };

  // const formatDefaultVal = (params: any) => {
  //   if (defaultLabel) {
  //     params[defaultLabel] =
  //       params[defaultLabel] || createFlag
  //         ? params[defaultLabel] || ""
  //         : '';
  //   }
  // };

  // 导出
  const onExport = () => {
    window.open(
      `/api/qp/business/opportunity/list?${qs.stringify({
        ...formatSearchData(searchData),
        isExport: 1,
      })}`
    );
  };

  // 设置每一个筛选项的值
  const setSeachConfigValue = (key: string, data: any) => {
    searchConfig.forEach((item: any) => {
      item.config.forEach((innerItem: any) => {
        if (innerItem.key === key) {
          innerItem.data = data;
        }
      });
    });
    setSearchConfig([...(searchConfig as any)]);
  };

  // 获取商机负责人数据
  const getBusinessOppoFollowersWithDefUser = async () => {
    try {
      const res = await $getBusinessOppoFollowersWithDefUser();
      if (res.orgList && res.orgList.length) {
        const newBusinessOppoFollowersList = handlerOrgInfoCascaderData(
          res.orgList,
          "orgName",
          "id",
          "childOrgList"
        );
        setBusinessOppoFollowers(newBusinessOppoFollowersList);
        setSeachConfigValue("charger", newBusinessOppoFollowersList || []);
        if (!opNo && !planNo && !accountId && !platId) {
          if (res.defaultValues) {
            searchData.charger = res.defaultValues;
            setDefaultCharger(res.defaultValues);
            setSearchData(searchData);
          } else {
            setInitNoParamsFlag(true)
          }
        }
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取商机来源数据
  const getOppoFromList = async () => {
    try {
      const res = await $getOppoFromList();
      if (res && res.length) {
        const newOppoFromList = handlerOrgInfoCascaderData(
          res,
          "fromName",
          "id",
          "child"
        );
        setOppoFromList(newOppoFromList);
        setSeachConfigValue("oppoFromId", newOppoFromList || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取合作产品数据
  const getCoProductList = async () => {
    try {
      const res = await $getCoProductList();
      if (res && res.length) {
        const newCoProductList: { id: any; label: any }[] = [];
        res.forEach((item: any) => {
          newCoProductList.push({
            id: item,
            label: item,
          });
        });
        setSeachConfigValue("coProduct", newCoProductList || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取产品品类数据
  const getCoCateList = async () => {
    try {
      const res = await $getCoCateList();
      if (res && res.length) {
        const formatCoCateData = formatCascaderData(res);
        setSeachConfigValue("coCate", formatCoCateData || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取品牌数据
  const getBrandList = async () => {
    try {
      const res = await $getBrandList();
      if (res && res.length) {
        setBrand(res);
        setSeachConfigValue("brandId", res || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取客户联系人数据
  const getCustomerName = async () => {
    try {
      const res = await $getCustomerName();
      if (res && res.length) {
        const newCustomerNameList = res.map((item: any) => {
          const newItem: any = { ...item };

          newItem.label = newItem.companyName;
          newItem.value = newItem.companyId;

          const children = item.customer.map((it: any) => {
            const newIt: any = { ...it };
            newIt.companyId = newIt.customerId;
            newIt.label = newIt.customerName;
            newIt.value = newIt.customerId;
            newIt.companyName = (
              <div className={styles.cascaderSelect}>
                <span>{newIt.customerName}</span>
                <span />
              </div>
            );
            return newIt;
          });

          const otherChildren = item.otherCustomer.map((it: any) => {
            const newIt: any = { ...it };
            newIt.companyId = newIt.customerId;
            newIt.label = newIt.customerName;
            newIt.value = newIt.customerId;
            newIt.companyName = (
              <div className={styles.cascaderSpanBox}>
                <span>{newIt.customerName}</span>
                <span>{newIt.crmName}</span>
              </div>
            );
            // newIt.disabled = true;
            return newIt;
          });

          newItem.children = [...children, ...otherChildren];
          return newItem;
        });
        // const newCustomerNameList = handlerOrgInfoCascaderData(
        //   customerNameListTemp,
        //   'companyName', 'companyId', 'children'
        // );
        setCustomerList(newCustomerNameList);
        setSeachConfigValue("customerId", newCustomerNameList || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取商机合作类型数据
  const getCustomerTypeList = async () => {
    try {
      const res = await $getCustomerTypeList();
      if (res && res.length) {
        setCustomerTypeList(res);
        setSeachConfigValue("opCoType", res || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取平台数据
  const getPlatInfo = async () => {
    try {
      const res: any = await $getPlatInfo();
      if (res && res.length) {
        setSeachConfigValue("platIds", res || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 获取账号名称数据
  const getAccountInfo = async (platIds: number[] = [], isFirst = false) => {
    try {
      const res = await $getAccountCondition({
        platIds,
      });
      if (res && res.length) {
        setAccountList(res);
        setSeachConfigValue("accountId", res || []);
        // url有带账号id和平台id
        if (isFirst && accountId && platId) {
          searchData.platIds = [
            {
              label: getPlatName(+platId),
              value: handlePlatId(+platId),
            },
          ] as any;
          searchData.accountId = {
            label:
              res &&
              res.filter((item: any) => item.accountId === +accountId)[0]
                ?.accountName,
            value: accountId,
          } as any;
          // params.platIds = [+platId];
          // params.accountId = +accountId;
          searchData.createTime = time
            ? [
                moment(time?.toString().split(",")[0]),
                moment(time?.toString().split(",")[1]),
              ]
            : [];
          setSearchData({ ...searchData });
          setDefaultPlat(searchData.platIds);
          setDefaultAccount(searchData.accountId);
        }
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // 重置账号下拉筛选数据
  const resetAccountInfo = () => {
    setSeachConfigValue("accountId", accountList || []);
  };

  useEffect(() => {
    getBusinessOppoFollowersWithDefUser();
    getOppoFromList();
    getCoProductList();
    getCoCateList();
    getAccountInfo([], true);
    getBrandList();
    getCustomerName();
    getCustomerTypeList();
    getPlatInfo();
  }, []);

  // 对url携带商机号/方案号， 默认商机负责人，默认平台和账号id的处理
  useEffect(() => {
    // url没有带商机号，方案号，平台号和账号，才给创建时间默认赋值为今日
    if (!opNo && !planNo && !platId && !accountId) {
      const { createTimeStart, createTimeEnd } = getTodayDate();
      searchData.createTime = [moment(createTimeStart), moment(createTimeEnd)];
    }

    // url有携带商机号或方案号
    if (opNo || planNo) {
      delete searchData.createTime;
      if (opNo) {
        searchData.opNo = String(opNo || "");
      } else if (planNo) {
        searchData.planNo = String(planNo || "");
      }
      setSearchData({ ...searchData });
      getBussinessOpportunityData({ ...searchData });
      return;
    }

    // 当商机负责人有数据且有默认商机负责人的值
    if (businessOppoFollowers.length && defaultCharger.length) {
      searchData.charger = defaultCharger;
      setSearchData({ ...searchData });
      getBussinessOpportunityData({
        ...searchData,
      });
      return;
    }

    // 当有默认的平台ID和账号ID
    if (Object.keys(defaultAccount).length && Object.keys(defaultPlat).length) {
      searchData.platIds = defaultPlat;
      searchData.accountId = defaultAccount;
      setSearchData({ ...searchData });
      getBussinessOpportunityData({
        ...searchData,
      });
    }
  }, [defaultCharger, defaultPlat, defaultAccount]);

  useEffect(() => {
    if (initNoParamsFlag) {
      getBussinessOpportunityData();
    }
  }, [initNoParamsFlag])

  useEffect(() => {
    // 处理飞书跳转的链接
    const {
      showDrawer,
      opId,
      tab = "1",
      from,
      drawerType = "edit",
      opType,
    } = getUrlQuery(location.href);
    if (from && from === "billAdvManage") {
      setDrawerType("add");
      setShowDrawer(true);
    }

    if (showDrawer === "true" && opId && tab) {
      const toCommand = tab !== "1";
      handleShowDrawer(drawerType as "", Number(opId), toCommand);
      // window.history.pushState({}, "0", origin);
    }

    // 处理从账号报价库跳转过来的链接
    // const { showDrawer, opId } = getQuery(location.href);
    const isFromBillAdv = window.localStorage.getItem("isFromBillAdv");
    if (showDrawer === "true" && opId && isFromBillAdv === "true") {
      handleShowDrawer("edit", Number(opId), true);
      window.localStorage.setItem("isFromBillAdv", "false");
      // window.history.pushState({}, "0", origin);
    }
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <Card>
        <Tabs
          activeKey={businessOppoActiveKey}
          onChange={handleChangeBusinessOppoTab}
        >
          <TabPane tab="商机" key="1">
            <div>
              {searchConfig.length && (
                <Search
                  searchData={searchData}
                  config={searchConfig}
                  onChange={onSearchData}
                  onExport={
                    $permission("new_business_opportunity_manage_export")
                      ? onExport
                      : undefined
                  }
                  onSearch={onSearch}
                >
                  {filterList.length ? (
                    <Space style={{ marginBottom: 12 }}>
                      <div className={styles.groupBoxLabel}>筛选条件</div>
                      <div>
                        {filterList.map(item => {
                          const { key, title, value } = item;

                          return (
                            <Tag
                              closable
                              key={key}
                              onClose={e => {
                                e.preventDefault();
                                closeFilterTagItem(item?.key);
                              }}
                            >
                              {title}: {value}
                            </Tag>
                          );
                        })}
                        <Button type="link" onClick={clearFilter}>
                          清空
                        </Button>
                      </div>
                    </Space>
                  ) : (
                    ""
                  )}
                </Search>
              )}

              <Spin spinning={tableLoading}>
                <Card size="small" bordered={false}>
                  <Tabs
                    activeKey={activeTabKey}
                    onChange={handleTabChange}
                    tabBarGutter={26}
                    tabBarExtraContent={
                      <>
                        <Button
                          type="primary"
                          onClick={() => {
                            setShowDrawer(true);
                            setDrawerType("add");
                          }}
                        >
                          新建商机
                        </Button>
                      </>
                    }
                  >
                    {tabsData.map(item => {
                      const { label, value, tip, id } = item || {};
                      return (
                        <TabPane
                          tab={
                            <div>
                              {label}{" "}
                              <span style={{ color: "red" }}>
                                ({value || 0})
                              </span>
                              {tip ? <IconTip content={tip} /> : ""}
                            </div>
                          }
                          key={id}
                        />
                      );
                    })}
                  </Tabs>
                </Card>
                <BusinessOpportunityTable
                  page={page}
                  searchData={searchData}
                  tableData={tableData}
                  columnsData={tableColumns}
                  detailBtnData={detailBtnData}
                  setPage={setPage}
                  setSearchData={setSearchData}
                  getList={getBussinessOpportunityData}
                />
              </Spin>
              {showDrawer && (
                <BusinessOpportunityDrawer
                  show={showDrawer}
                  type={drawerType}
                  id={drawerId}
                  activeKeyForCommand={activeKeyForCommand}
                  brand={brand}
                  oppoFromListData={oppoFromList}
                  customerListData={customerList}
                  customerTypeListData={customerTypeList}
                  businessOppoFollowersData={businessOppoFollowers}
                  onClose={handleCloseDrawer}
                  onRefesh={handleRefresh}
                />
              )}

              {showNoSearchDrawer && (
                <NoSearchOpportunityDrawer
                  show={showNoSearchDrawer}
                  type={drawerType}
                  id={drawerId}
                  activeKeyForCommand={activeKeyForCommand}
                  brand={brand}
                  oppoFromListData={oppoFromList}
                  customerListData={customerList}
                  customerTypeListData={customerTypeList}
                  businessOppoFollowersData={businessOppoFollowers}
                  onClose={handleCloseNoSearchDrawer}
                  onRefesh={handleRefresh}
                />
              )}

              {showModal && (
                <CollaborativeNumFindModal
                  {...collaborativeFindNumParams}
                  onShowDrawer={handleShowDrawer}
                  show={showModal}
                  onGetList={getBussinessOpportunityData}
                  onClose={handleCloseCollaborateModal}
                />
              )}
              {showContinueFindNumModal && (
                <ContinueFindNumModal
                  {...continueFindNumParams}
                  show={showContinueFindNumModal}
                  onGetList={getBussinessOpportunityData}
                  onClose={handleCloseContinueFindNumModal}
                />
              )}
              {/* 确认合作的弹窗 */}
              {showConfirmCooperateModal && (
                <ConfirmCooperateModal
                  {...confirmCooperateParams}
                  onShowDrawer={handleShowDrawer}
                  show={showConfirmCooperateModal}
                  onGetList={getBussinessOpportunityData}
                  onClose={handleCloseConfirmCooperateModal}
                />
              )}
              {/* 账号属性变化的弹窗 */}
              {showAccountAttrChangeModal && (
                <AccountAttrChangeModal
                  {...confirmCooperateParams}
                  accountTypeChangeBOS={accountTypeChangeBOS}
                  onShowConfirmCoopDrawer={handleShowConfirmCoopDrawer}
                  onShowDrawer={handleShowDrawer}
                  show={showAccountAttrChangeModal}
                  onClose={handleCloseAccountAttrChangeModal}
                />
              )}
              {/* 取消合作的弹窗 */}
              {showNoCooperateModal && (
                <NoCooperateModal
                  {...noCooperateParams}
                  show={showNoCooperateModal}
                  onGetList={getBussinessOpportunityData}
                  onClose={handleCloseNoCooperateModal}
                />
              )}
            </div>
          </TabPane>

          <TabPane tab="商机榜单" key="2">
            <div className={styles.iframeWrap}>
              <iframe
                title="businessOppoRank"
                width="100%"
                height="100%"
                frameBorder="no"
                marginWidth={0}
                marginHeight={0}
                scrolling="no"
                src="https://ldpqbi.zhuanspirit.com/token3rd/dashboard/view/pc.htm?pageId=28134927-b59c-4714-8199-b65ccc3d6fbc&accessToken=74dce54ba3059868ca2e9654847bca9f&dd_orientation=auto"
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </ConfigProvider>
  );
};

export default NewBusinessOpportunity;

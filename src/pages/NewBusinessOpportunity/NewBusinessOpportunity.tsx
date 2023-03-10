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

// ?????????????????????
declare interface TabsType {
  label: string;
  value: number;
  tip?: string;
  key: string;
  id: string;
}

// ??????????????????????????????????????????
declare interface CollaborativeNumFindParamsType {
  opId: number;
}

// ??????????????????????????????????????????
declare interface ContinueFindNumParamsType {
  opId: number;
}

// ??????????????????????????????????????????
declare interface ConfirmCooperateParamsType {
  opId: number;
  opType?: number;
  specialChargeTotal?: string;
}

// ??????????????????????????????????????????
declare interface NoCooperateParamsType {
  opId: number;
  opType?: number;
}

// ????????????
declare interface PageType {
  total: number;
  pageNum: number;
  pageSize: number;
  // pageSizeOptions: string[];
}

// ??????????????????????????????????????????
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
      label: "??????",
      value: 0,
      id: "1",
      key: "allNum",
    },
    {
      label: "?????????",
      value: 0,
      tip: "??????????????????????????????????????????????????????",
      id: "2",
      key: "readyFind",
    },
    {
      label: "?????????",
      value: 0,
      id: "3",
      key: "finding",
    },
    {
      label: "???????????????",
      value: 0,
      tip: "?????????????????????????????????????????????????????????",
      id: "4",
      key: "readyCustomerChoose",
    },
    {
      label: "????????????????????????",
      value: 0,
      tip: "??????????????????????????????????????????????????????????????????????????????????????????",
      id: "5",
      key: "readySecondConfirm",
    },
    {
      label: "?????????????????????",
      value: 0,
      id: "9",
      key: "specialCharge",
    },
    {
      label: "?????????????????????",
      value: 0,
      tip: "?????????????????????????????????????????????????????????????????????????????????",
      id: "6",
      key: "readyCustomerCooperation",
    },
    {
      label: "????????????",
      value: 0,
      id: "7",
      key: "cooperation",
    },
    {
      label: "????????????",
      value: 0,
      id: "8",
      key: "noCooperation",
    },
  ];
  const { globalData = {} } = useContext(GlobalContext);
  // ????????????
  const [brand, setBrand] = useState<BrandListResType[]>([]);
  // ?????????????????????
  const [businessOppoFollowers, setBusinessOppoFollowers] = useState<
    BusinessOppoFollowersResType[]
  >([]);
  // ??????????????????
  const [oppoFromList, setOppoFromList] = useState<OppoFromListType[]>([]);
  // ?????????????????????????????????????????????
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  // ????????????????????????????????????????????????
  const [showNoSearchDrawer, setShowNoSearchDrawer] = useState<boolean>(false);
  // ?????????????????????
  const [drawerType, setDrawerType] = useState<DrawerType>("");
  // ?????????????????????ID
  const [drawerId, setDrawerId] = useState<number | string | undefined>("");
  // ???????????????????????????????????????????????????tab???
  const [activeKeyForCommand, setActiveKeyForCommand] =
    useState<boolean>(false);
  // ???????????????????????????????????????
  const [showModal, setShowModal] = useState<boolean>(false);
  // ????????????????????????????????????
  const [collaborativeFindNumParams, setCollaborativeFindNumParams] =
    useState<CollaborativeNumFindParamsType>({
      opId: 0,
    });
  // ???????????????????????????????????????
  const [showContinueFindNumModal, setShowContinueFindNumModal] =
    useState<boolean>(false);
  // ????????????????????????????????????
  const [continueFindNumParams, setContinueFindNumParams] =
    useState<ContinueFindNumParamsType>({
      opId: 0,
    });
  // ???????????????????????????????????????
  const [showNoCooperateModal, setShowNoCooperateModal] =
    useState<boolean>(false);
  // ????????????????????????????????????
  const [noCooperateParams, setNoCooperateParams] =
    useState<NoCooperateParamsType>({
      opId: 0,
    });
  // ?????????????????????????????????
  const [showConfirmCooperateModal, setShowConfirmCooperateModal] =
    useState<boolean>(false);
  // ???????????????????????????????????????
  const [showAccountAttrChangeModal, setShowAccountAttrChangeModal] =
    useState<boolean>(false);
  // ????????????????????????????????????
  const [confirmCooperateParams, setConfirmCooperateParams] =
    useState<ConfirmCooperateParamsType>({
      opId: 0,
    });
  // ???????????????????????????
  const [accountTypeChangeBOS, setAccountTypeChangeBOS] = useState<any[]>([]);
  // ????????????
  const [searchData, setSearchData] = useState<any>({
    pageNum: 1,
    size: 20,
  });
  // ???????????????
  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >(SEARCH_LIST);
  // ????????????
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
  // ????????????
  const [page, setPage] = useState<PageType>({
    total: 1, // ?????????
    pageNum: 1, // ????????????
    pageSize: 20, // ??????????????????
    // pageSizeOptions: ["20", "50"], // ????????????????????????
  });
  // ????????????
  const [tableData, setTableData] = useState<BusinessOpportunityType[]>([]);
  // ???????????????
  const [tabsData, setTabsData] = useState<TabsType[]>(initTabsData);
  // ????????????????????????
  const [customerTypeList, setCustomerTypeList] = useState<
    { id: number; name: string }[]
  >([]);
  // ?????????????????????
  const [customerList, setCustomerList] = useState<
    GetCustomerNameItemResType[]
  >([]);
  // ?????????loading
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  // ????????????????????????key
  const [businessOppoActiveKey, setBusinessOppoActiveKey] =
    useState<string>("1");

  // ????????????????????????
  const [accountList, setAccountList] = useState<
    SelectAccountConditionResType[]
  >([]);

  // ???????????????????????????
  const [defaultCharger, setDefaultCharger] = useState<number[]>([]);

  // ??????????????????
  const [defaultPlat, setDefaultPlat] = useState<any>({});

  // ??????????????????
  const [defaultAccount, setDefaultAccount] = useState<any>({});

  // ??????????????????key
  const [activeTabKey, setActiveTabKey] = useState<string>("1");

  // ??????????????????loading
  const [confirmCoopLoading, setConfirmCoopLoading] = useState<boolean>(false);

  // ???????????????????????????????????????id
  const [curConfirmCoopOpId, setCurConfirmCoopOpId] = useState<number>(0);

  // ?????????????????????????????????
  const [initNoParamsFlag, setInitNoParamsFlag] = useState<boolean>(false)

  const { location, $permission } = window;

  // ?????????????????????
  const {
    opNo,
    planNo,
    accountId,
    platId,
    time = "",
  } = getUrlQuery(location.href);

  // ?????????detail????????????????????????button
  const detailBtnData: DetailBtnDataType[] = [
    {
      label: "????????????",
      type: "primary",
      handleMethod: () => {
        setShowDrawer(true);
        setDrawerType("add");
      },
    },
  ];

  // ??????????????????????????????????????????
  const checkGrossProfit = async (id: number) => {
    let res: any = "";

    try {
      const resData = await $checkGross({ opId: id });
      res = resData;
    } catch (e: any) {
      console.info("---e", e);
    }

    return new Promise(resolve => {
      // ?????????1 ???????????????
      if (+res !== 1) {
        const modal = Modal.confirm({
          title: "??????",
          content:
            "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????",
          cancelText: "???????????????",
          okText: "????????????",
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

  // ??????
  const handleShowDrawer = (
    type: DrawerType,
    id?: number | string,
    isActiveKeyForCommand = false,
    opType?: number
  ) => {
    setDrawerType(type);
    setDrawerId(id);
    setActiveKeyForCommand(isActiveKeyForCommand);

    // ???????????????
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

  // ?????????????????????
  const handleShowCollaborateModal = (
    params: CollaborativeNumFindParamsType
  ) => {
    setCollaborativeFindNumParams(params);
    setShowModal(true);
  };

  const handleCloseCollaborateModal = () => {
    setShowModal(false);
  };

  // ?????????????????????
  const handleShowContinueFindNumModal = (
    params: ContinueFindNumParamsType
  ) => {
    setContinueFindNumParams(params);
    setShowContinueFindNumModal(true);
  };

  const handleCloseContinueFindNumModal = () => {
    setShowContinueFindNumModal(false);
  };

  // ???????????????????????????
  const handleShowConfirmChooseModal = async (id: number) => {
    const res = await checkGrossProfit(id);
    if (!res) return;

    handleShowDrawer("edit", id, true);
  };

  // ?????????????????????
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
        // ??????????????????????????????????????????????????????????????????
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
        // ????????????????????????????????????
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

  // ??????????????????????????????
  const handleShowConfirmCoopDrawer = (params: ConfirmCooperateParamsType) => {
    if (Number(params.opType) === 2) {
      if (Number(params.specialChargeTotal) <= 0) {
        message.error("????????????????????????");
        return;
      }
    }
    setConfirmCooperateParams(params);
    setShowConfirmCooperateModal(true);
  };

  // ?????????????????????????????????
  const handleShowAccountAttrChangeModal = () => {
    setShowAccountAttrChangeModal(true);
  };

  const handleCloseAccountAttrChangeModal = () => {
    setShowAccountAttrChangeModal(false);
  };

  // ?????????????????????
  const handleShowNoCooperateModal = (params: NoCooperateParamsType) => {
    setNoCooperateParams(params);
    setShowNoCooperateModal(true);
  };

  const handleCloseNoCooperateModal = () => {
    setShowNoCooperateModal(false);
  };

  // ???????????????????????????????????????
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

  // ????????????Id??????????????????
  const getPlatName = (platId: number) => {
    let str = "????????????";
    switch (platId) {
      case 25:
        str = "??????";
        break;
      case 26:
        str = "??????";
        break;
      case 2:
        str = "B???";
        break;
      case 45:
        str = "?????????";
        break;
      default:
        break;
    }

    return str;
  };

  // ???????????????id????????????
  const handlePlatId = (platId: number) =>
    [2, 25, 26, 45].includes(+platId) ? +platId : 0;

  // ??????????????????
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

  // ????????????????????????
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

    // ????????????????????????????????????
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

    // ?????????????????????????????????
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
    // ??????????????????????????????
    if (oppoFromId && oppoFromId.length) {
      cloneData.oppoFromId = oppoFromId[oppoFromId.length - 1];
    }
    // ??????????????????ID?????????
    if (customerId && customerId.length) {
      if (customerId.length === 1) {
        cloneData.companyId = customerId[0];
        cloneData.customerId = null;
      } else {
        cloneData.customerId = customerId[customerId.length - 1];
      }
    }
    // ?????????id?????????
    if (platIds && platIds.length) {
      const platIdArr: any[] = [];
      platIds.forEach((item: any) => {
        platIdArr.push(item.value);
      });
      cloneData.platIds = platIdArr;
    }
    // ?????????id?????????
    if (Object.keys(accountId || {}).length) {
      // ??????id????????????????????????accountId
      if (!isNaN(+accountId.value)) {
        cloneData.accountId = accountId.value;
      } else {
        // ??????id????????????????????????accountName
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

  // ????????????????????????
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

  //  ?????????????????????
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    const opStatus = Number(key) - 2 === -1 ? null : Number(key) - 2;
    setPage(Object.assign(page, { pageNum: 1 }));
    setSearchData(Object.assign(searchData, { opStatus, pageNum: 1 }));
    getBussinessOpportunityData(Object.assign(searchData, { opStatus, pageNum: 1 }));
  };

  // ????????????tab???
  const handleChangeBusinessOppoTab = (val: string) => {
    setBusinessOppoActiveKey(val);
  };

  // ??????????????????
  const tableColumns: ColumnsType<BusinessOpportunityType> = [
    {
      title: "???????????????",
      dataIndex: "chargerName",
      key: "chargerName",
      width: 120,
      align: "center",
      render: (chargerName: string) => <span>{chargerName || "--"}</span>,
    },
    {
      title: "??????????????????",
      dataIndex: "opCoTypeDesc",
      key: "opCoTypeDesc",
      width: 120,
      align: "center",
      render: (opCoTypeDesc: string) => <span>{opCoTypeDesc || "--"}</span>,
    },
    {
      title: "??????",
      dataIndex: "companyName",
      key: "companyName",
      width: 120,
      align: "center",
      render: (companyName: string) => <span>{companyName || "--"}</span>,
    },
    {
      title: "???????????????",
      dataIndex: "customerName",
      key: "customerName",
      width: 120,
      align: "center",
      render: (customerName: string) => <span>{customerName || "--"}</span>,
    },
    {
      title: "????????????",
      dataIndex: "rebateRatio",
      key: "rebateRatio",
      width: 180,
      align: "center",
      render: (_: any, record: BusinessOpportunityType) => (
        <div>
          <p>
            ??????????????????:{" "}
            {`${record.selfRatio ? `${record.selfRatio}%` : "--"}`}
          </p>
          <p>
            ??????????????????:{" "}
            {`${record.signRatio ? `${record.signRatio}%` : "--"}`}
          </p>
        </div>
      ),
    },
    {
      title: "??????",
      dataIndex: "brandName",
      key: "brandName",
      width: 100,
      align: "center",
      render: (brandName: string) => <span>{brandName || "--"}</span>,
    },
    {
      title: "????????????",
      dataIndex: "coProduct",
      key: "coProduct",
      width: 100,
      align: "center",
      render: (coProduct: string) => <span>{coProduct || "--"}</span>,
    },
    {
      title: "????????????",
      dataIndex: "coCateDesc",
      key: "coCateDesc",
      width: 100,
      align: "center",
      render: (coCateDesc: string) => <span>{coCateDesc || "--"}</span>,
    },
    {
      title: "????????????",
      dataIndex: "description",
      key: "description",
      width: 120,
      align: "center",
      render: (description: string) => (
        <Popover content={() => <pre>{description}</pre>}>
          <Button type="link">????????????</Button>
        </Popover>
      ),
    },
    {
      title: "??????/????????????",
      dataIndex: "recommendList",
      key: "recommendList",
      width: 140,
      align: "center",
      render: (_: any, record: BusinessOpportunityType) => {
        const generateAccountContent = () => (
          <div>
            <h3>???????????????</h3>
            {(record.recommendList || [])?.length > 0
              ? record.recommendList?.map(item => (
                  <div key={item.accountId} className={styles.accountItem}>
                    <img
                      src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${item.platId}.png`}
                      alt=""
                    />
                    <span>???{item.accountTypeDesc}???</span>
                    {item.accountName}
                  </div>
                ))
              : "--"}
            <h3>???????????????</h3>
            {(record.cooperationList || [])?.length > 0
              ? record.cooperationList?.map(item => (
                  <div key={item.accountId} className={styles.accountItem}>
                    <img
                      src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${item.platId}.png`}
                      alt=""
                    />
                    <span>???{item.accountTypeDesc}???</span>
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
              ?????????
              {(record.recommendList || [])?.length > 1 ? (
                <span>{record?.recommendList?.length}???</span>
              ) : (
                <span>{record?.recommendList?.[0]?.accountName || "--"}</span>
              )}
            </div>
            <div className={styles.accountItemMsgWrap}>
              ?????????
              {(record.cooperationList || [])?.length > 1 ? (
                <span>{record?.cooperationList?.length}???</span>
              ) : (
                <span>{record?.cooperationList?.[0]?.accountName || "--"}</span>
              )}
            </div>
          </Popover>
        ) : (
          <>
            <div className={styles.accountItemMsgWrap}>
              ?????????
              {(record.recommendList || [])?.length > 1 ? (
                <Button type="link">{record?.recommendList?.length}???</Button>
              ) : (
                <span>{record?.recommendList?.[0] || "--"}</span>
              )}
            </div>
            <div className={styles.accountItemMsgWrap}>
              ?????????
              {(record.cooperationList || [])?.length > 1 ? (
                <Button type="link">{record?.cooperationList?.length}???</Button>
              ) : (
                <span>{record?.cooperationList?.[0] || "--"}</span>
              )}
            </div>
          </>
        );
      },
    },
    {
      title: "?????????",
      dataIndex: "createName",
      key: "createName",
      width: 100,
      align: "center",
      render: (createName: string) => <span>{createName || "--"}</span>,
    },
    {
      title: "????????????",
      dataIndex: "oppoFromName",
      key: "oppoFromName",
      width: 100,
      align: "center",
      render: (oppoFromName: string) => <span>{oppoFromName || "--"}</span>,
    },
    {
      title: "????????????",
      dataIndex: "opStatusDesc",
      key: "opStatusDesc",
      width: 100,
      align: "center",
    },
    {
      title: "?????????",
      dataIndex: "opNo",
      key: "opNo",
      width: 150,
      align: "center",
      render: (opNo: string) => <span>{opNo || "--"}</span>,
    },
    {
      title: "?????????",
      dataIndex: "planNo",
      key: "planNo",
      width: 150,
      align: "center",
      render: (planNo: string) => <span>{planNo || "--"}</span>,
    },
    {
      title: "????????????",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 120,
      align: "center",
      render: (createdTime: string) => <span>{createdTime || "--"}</span>,
    },
    {
      title: "??????",
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
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: normalColor },
              { text: "??????", color: normalColor },
              { text: "??????", color: normalColor },
            ];
            break;
          case 1:
            btnArr = [
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: normalColor },
              { text: "??????", color: normalColor },
              { text: "??????", color: normalColor },
            ];
            break;
          case 2:
            btnArr = [
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: normalColor },
              { text: "??????????????????", color: prominentColor },
              { text: "??????", color: normalColor },
              { text: "??????", color: normalColor },
            ];
            break;
          case 3:
            btnArr = [
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: prominentColor },
              { text: "????????????", color: normalColor },
              { text: "??????", color: normalColor },
              { text: "??????", color: normalColor },
            ];
            break;
          case 4:
            // ???????????????
            if (record.opType === 2) {
              btnArr = [
                {
                  text: "????????????",
                  color: prominentColor,
                  loading: confirmCoopLoading,
                },
                { text: "????????????", color: normalColor },
                { text: "??????", color: normalColor },
                { text: "??????", color: normalColor },
              ];
            } else {
              btnArr = [
                {
                  text: "????????????",
                  color: prominentColor,
                  loading: confirmCoopLoading,
                  content: record.canCooperation ? "" : "?????????????????????",
                },
                { text: "????????????", color: prominentColor },
                { text: "????????????", color: normalColor },
                { text: "???????????????", color: prominentColor },
                { text: "??????", color: normalColor },
                { text: "??????", color: normalColor },
              ];
            }

            break;
          case 5:
            btnArr = [
              { text: "??????", color: normalColor },
              { text: "????????????", color: normalColor },
            ];
            break;
          case 6:
            btnArr = [{ text: "??????", color: normalColor }];
            break;
          // ?????????????????????
          case 7:
            btnArr = [
              { text: "????????????", color: normalColor },
              { text: "?????????", color: prominentColor },
              { text: "??????", color: normalColor },
              { text: "??????", color: normalColor },
            ];
            break;
          default:
            btnArr = [{ text: "??????", color: normalColor }];
            break;
        }

        const { id } = globalData?.user?.userInfo || {};
        if (id !== record.charger) {
          btnArr = [{ text: "??????", color: normalColor }];

          if (opStatus === 5) {
            btnArr = [
              { text: "??????", color: normalColor },
              { text: "????????????", color: normalColor },
            ];
          }
        }

        const handleShowOperation = (type = "") => {
          const { origin, pathname } = window.location;
          switch (type) {
            case "??????":
              handleShowDrawer("detail", record.id, false, record.opType);
              break;
            case "??????":
              handleShowDrawer("edit", record.id, false, record.opType);
              break;
            case "????????????":
              window.open(
                `${origin}${pathname}/#/bussiness-manage/bill-adv-manage?opId=${record.id}`,
                "_blank"
              );
              break;
            case "????????????":
              handleShowCollaborateModal({
                opId: record.id,
              });
              break;
            case "????????????":
              handleShowDrawer("edit", record.id, true);
              break;
            case "????????????":
              handleShowContinueFindNumModal({
                opId: record.id,
              });
              break;
            case "??????????????????":
              handleShowConfirmChooseModal(Number(record.id));
              break;
            case "???????????????":
              handleShowDrawer("edit", record.id, true);
              break;
            case "????????????":
              handleShowConfirmCooperateModal({
                opId: record.id,
                opType: record.opType,
                specialChargeTotal: record.specialChargeTotal,
              });
              break;
            case "????????????":
              handleShowNoCooperateModal({
                opId: record.id,
                opType: record.opType,
              });
              break;
            case "????????????":
              window.open(
                `#/qp/invoice-management?opNo=${record.opNo}`,
                "_blank"
              );
              break;
            case "????????????":
              handleShowDrawer("edit", record.id);
              break;
            case "?????????":
              handleShowDrawer("edit", record.id, false, record.opType);
              break;
            default:
              break;
          }
        };

        const generateBtnContent = () => {
          let arr: any[] = [];
          arr = btnArr.filter(
            // ({ text }) => text === "????????????" || text === "????????????"
            ({ text }) => text === "????????????"
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
                    // item => item.text !== "????????????" && item.text !== "????????????"
                    item => item.text !== "????????????"
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
                          text === "????????????"
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
              {/* ??????????????????????????????????????? */}
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
                  // item => item.text === "????????????" || item.text === "????????????"
                  item => item.text === "????????????"
                ) ? (
                  <Popover placement="bottom" content={generateBtnContent}>
                    <Button type="link">??????</Button>
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

  // ????????????????????????
  const handleRefresh = (flag = false) => {
    if (!flag) {
      handleCloseDrawer();
      handleCloseNoSearchDrawer();
    }
    getBussinessOpportunityData({ ...searchData });
  };

  /**
   * ????????????????????????
   * @param list ????????????
   * @param key ????????????key
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
   * ???????????????????????????
   * @param list ????????????
   * @param key ???????????????key
   * @param value ???????????????value
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
   * ??????????????????
   * @param data ???????????????????????????
   * @returns ???????????????????????????
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
   * ??????????????????
   * @param data ???????????????????????????
   * @returns ???????????????????????????
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

  // ??????????????????????????????????????????
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

  // ?????????????????????
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

  // ????????????????????????????????????????????????
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

  // ????????????????????????
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

  // ??????search????????????
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

  // ????????????
  const clearFilter = () => {
    // setCreateFlag(true);
    setSearchData({
      opStatus:
        Number(activeTabKey) - 2 === -1 ? null : Number(activeTabKey) - 2,
    });
  };

  // ?????????????????????
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

  // ??????
  const onExport = () => {
    window.open(
      `/api/qp/business/opportunity/list?${qs.stringify({
        ...formatSearchData(searchData),
        isExport: 1,
      })}`
    );
  };

  // ??????????????????????????????
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

  // ???????????????????????????
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

  // ????????????????????????
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

  // ????????????????????????
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

  // ????????????????????????
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

  // ??????????????????
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

  // ???????????????????????????
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

  // ??????????????????????????????
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

  // ??????????????????
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

  // ????????????????????????
  const getAccountInfo = async (platIds: number[] = [], isFirst = false) => {
    try {
      const res = await $getAccountCondition({
        platIds,
      });
      if (res && res.length) {
        setAccountList(res);
        setSeachConfigValue("accountId", res || []);
        // url????????????id?????????id
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

  // ??????????????????????????????
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

  // ???url???????????????/???????????? ?????????????????????????????????????????????id?????????
  useEffect(() => {
    // url?????????????????????????????????????????????????????????????????????????????????????????????
    if (!opNo && !planNo && !platId && !accountId) {
      const { createTimeStart, createTimeEnd } = getTodayDate();
      searchData.createTime = [moment(createTimeStart), moment(createTimeEnd)];
    }

    // url??????????????????????????????
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

    // ????????????????????????????????????????????????????????????
    if (businessOppoFollowers.length && defaultCharger.length) {
      searchData.charger = defaultCharger;
      setSearchData({ ...searchData });
      getBussinessOpportunityData({
        ...searchData,
      });
      return;
    }

    // ?????????????????????ID?????????ID
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
    // ???????????????????????????
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

    // ?????????????????????????????????????????????
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
          <TabPane tab="??????" key="1">
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
                      <div className={styles.groupBoxLabel}>????????????</div>
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
                          ??????
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
                          ????????????
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
              {/* ????????????????????? */}
              {showConfirmCooperateModal && (
                <ConfirmCooperateModal
                  {...confirmCooperateParams}
                  onShowDrawer={handleShowDrawer}
                  show={showConfirmCooperateModal}
                  onGetList={getBussinessOpportunityData}
                  onClose={handleCloseConfirmCooperateModal}
                />
              )}
              {/* ??????????????????????????? */}
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
              {/* ????????????????????? */}
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

          <TabPane tab="????????????" key="2">
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

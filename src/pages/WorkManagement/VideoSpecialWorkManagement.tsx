/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import { useState, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { cloneDeep } from "lodash";
import moment from "moment";
import { Space, Tag, Button, Card, Tabs, Spin, Checkbox } from "antd";
import qs from "qs";
import {
  $getBelongOrgTree,
  $getCrmGroupInfo,
  $getByDictType,
  $getPerformOrgInfo,
  $getList,
  $orderCount,
  $getPlatInfo,
  $getAccountInfo,
  $getStatisticsAmount,
  $getCoCateList,
} from "src/api/work";
import { $getReasonOptions } from "src/api/business";
import { $getBrandList } from "src/api/invoice";
import { getMonthStartEnd } from "src/utils/getMonthStartEnd";
import {
  OrderListRequest,
  OrderListResponse,
  OrderConditionResponse,
} from "src/api/types/mediaType";
import Search from "src/components/Search/Search";
import type {
  SearchGroupConfigItemType,
  SearchConfigItemPropsType,
} from "src/components/Search/Search";

// import type { GetByDictTypeResponseType } from "src/api/media";

import PriceBox from "src/components/PriceBox";
import type { PriceBoxListType } from "src/components/PriceBox";

import { GlobalContext } from "src/contexts/global";
import { OrderOrderCountRequest } from "src/api/types/workType";
import sendPerf from "src/utils/lego";
import TableComponent from "./components/TableComponent";

import type { StatusListType } from "./config/status";
import { SEARCH_LIST } from "./config/search";
import STATUS_LIST_CONFIG from "./config/status";
import styles from "./VideoSpecialWorkManagement.scss";

const videoSpecialWorkManagement = () => {
  const { $permission } = window;
  const location = useLocation();

  const query = qs.parse(location.search.substring(1));

  const { globalData = {} } = useContext(GlobalContext);

  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >(SEARCH_LIST);
  const [statusList, setStatusList] =
    useState<StatusListType[]>(STATUS_LIST_CONFIG);
  const [mediumOrderList, setmediumOrderList] = useState<
    OrderListResponse["mediumOrderList"]
  >([]);
  // const [performPaymentType, setPerformPaymentType] =
  //   useState<GetByDictTypeResponseType>([]);
  const [allAccountList, setAllAccountList] = useState<
    OrderConditionResponse["accountInfo"]
  >([]);
  const [priceBoxList, setPriceBoxList] = useState<PriceBoxListType>([]);
  const [listLoading, setListLoading] = useState(false);
  const [tabKey, setTabKey] = useState("");
  const [createFlag, setCreateFlag] = useState(false);
  const [performFlag, setPerformFlag] = useState<number>(0);
  const [weedCancelOrderFlag, setCancelFlag] = useState<number>(0);
  // const [ totleCountList, setTotleCountList ] = useState(0)
  const [pagination, setPagination] = useState({
    pageSize: 20,
    total: 0,
    current: 1,
  });

  const handlePageChange = (page: number) => {
    setPagination(
      Object.assign(pagination, {
        current: page,
      })
    );
    getTableList({
      pageNum: String(page),
    });
    getOrderCount();
  };

  const [searchData, setSearchData] = useState<any>({
    size: pagination.pageSize,
  });
  // ???????????????????????????
  const [defaultPerformId, setDefaultPerformId] = useState<number>();
  const [defaultFlag, setDefaultFlag] = useState(false);
  const { roleInfo = [], fid, did, id } = globalData?.user?.userInfo || {};
  const defaultRole = [
    "business_d_leader",
    "business_f_leader",
    "business_ordinary_member",
  ];
  const [defaultLabel, setDefaultLabel] = useState<string[]>([""]);
  const { firstDay, lastDay } = getMonthStartEnd();

  const handleChangeSort = (params: { determined?: string }) => {
    setSearchData({ ...searchData, ...params });
    getTableList(params);
  };

  const setDefaultId = () => {
    try {
      // const initDefaultLabel = ["publishDateBegin", "publishDateEnd"];
      // setDefaultLabel(initDefaultLabel);
      if (did === 0) return false;
      roleInfo.forEach((item: any) => {
        if (defaultRole.includes(item.code)) {
          if (item.code === defaultRole[0]) {
            setDefaultPerformId(did);
            setDefaultLabel(["businessGroupId"]);
            throw item.code;
          }
          if (item.code === defaultRole[1]) {
            setDefaultPerformId(fid);
            setDefaultLabel(["businessTeamId"]);
            throw item.code;
          }
          if (item.code === defaultRole[2]) {
            setDefaultPerformId(id);
            setDefaultLabel(["businessUserId"]);
            throw item.code;
          }
          return false;
        }
      });
    } catch (error) {
      console.info(error);
    }
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
  const handlerperformIdToCascaderData = (data: any) => {
    const result: any[] = [];
    if (!Array.isArray(data)) return;
    data.forEach((dataItem: any) => {
      const { orgName, id, childOrgList } = dataItem;
      const resultItem: any = {
        ...dataItem,
        label: orgName,
        value: id,
      };

      delete resultItem.childOrgList;

      if (childOrgList) {
        resultItem.children = handlerperformIdToCascaderData(childOrgList);
      }

      result.push(resultItem);
    });

    return result;
  };

  // const packPromise = (promiseObj: Promise<any>, defaultValue?: any) =>
  //   new Promise(resolve => {
  //     promiseObj
  //       .then(res => {
  //         resolve(res);
  //       })
  //       .catch(() => {
  //         resolve(defaultValue || "");
  //       });
  //   });

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

  type FilterListType = {
    title?: string | string[];
    label?: string;
    value: any;
    key: string;
    type: string;
    conf?: any;
  };

  type HandlerFilterResType = {
    showValue: any;
    sendParams: any;
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

  function handlercascaderData(
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

      if (type === "cascader") {
        return handlercascaderData(value, configInfo.data);
      }

      if (type === "rangeDatePicker" || type === "datePicker") {
        return handlerDatePicker(value);
      }

      return "";
    };

    Object.keys(searchData || {}).forEach(key => {
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
    if (!key) {
      return;
    }
    if (key === "crmGroup") {
      setCreateFlag(true);
    }
    const cloneSearchData = {
      ...searchData,
    };

    delete cloneSearchData[key];

    setSearchData(cloneSearchData);
  };

  const getAccountInfo = (platIds: string[]) => {
    $getAccountInfo({
      platIds,
    }).then(res => {
      const list: SearchGroupConfigItemType[] = cloneDeep(
        searchConfig as SearchGroupConfigItemType[]
      );
      setSearchConfigItemInfoByKey(list, "accountName", res || []);
      setSearchConfig(list);
    });
  };

  const resetAccountInfo = () => {
    const list: SearchGroupConfigItemType[] = cloneDeep(
      searchConfig as SearchGroupConfigItemType[]
    );

    setSearchConfigItemInfoByKey(list, "accountName", allAccountList || []);
    setSearchConfig(list);
  };

  // ??????search????????????
  const onSearchData = (data: any) => {
    const cloneData: Record<string, any> = {};
    setCreateFlag(true);
    Object.keys(data).forEach(key => {
      if (data[key]) {
        cloneData[key] = data[key];
      }
    });
    if (cloneData?.platIds !== searchData?.platIds) {
      if (cloneData?.platIds) {
        const platIds: string | string[] = [];
        cloneData?.platIds.forEach((item: any) => {
          platIds.push(item.value);
        });
        getAccountInfo(platIds);
      } else {
        resetAccountInfo();
      }

      delete cloneData.accountName;
    }

    setSearchData(cloneData);
  };

  // ????????????
  const clearFilter = () => {
    setCreateFlag(true);
    setSearchData({
      performFlag,
      weedCancelOrderFlag,
      determined: searchData.determined,
    });
  };

  const getSearchParmas = () => {
    // console.info(searchData, "-----searchData--------");
    // ???????????????
    const getGroupInfo = (data: any[] = []) => {
      const result = {
        groupId: "",
        teamId: "",
        userId: "",
      };
      data.forEach((item, index) => {
        const { id, userFlag, children } = item;
        if (index === 0) {
          result.groupId = id;
        } else if (userFlag && !(children === [] || children === null)) {
          result.userId = id;
        } else if (!(children === [] || children === null)) {
          result.teamId = id;
        }
      });

      return result;
    };
    const getBelongInfo = (data: any[] = []) => {
      const result = {
        groupId: "",
        teamId: "",
        userId: "",
      };
      data.forEach((item, index) => {
        const { id, userFlag, children } = item;
        if (index === 1) {
          result.groupId = id;
        } else if (userFlag && !(children === [] || children === null)) {
          result.userId = id;
        } else if (!(children === [] || children === null) && index === 2) {
          result.teamId = id;
        }
      });

      return result;
    };
    const { performId, crmGroup, belongId, coCate } = searchData;
    const result: {
      [prop: string]: any;
    } = {};

    result.orderStatus = tabKey;

    result.pageNum = pagination.current;

    Object.keys(searchData).forEach(searchDataKey => {
      const currentConfig = configMap[searchDataKey];
      const { type } = currentConfig || {};

      if (!currentConfig) {
        result[searchDataKey] = searchData[searchDataKey];
        return;
      }

      if (type === "select" || type === "longSelect") {
        result[searchDataKey] = handlerSelectData(
          searchData[searchDataKey]
        ).sendParams;
      }

      if (type === "input") {
        result[searchDataKey] = searchData[searchDataKey];
      }

      if (type === "rangeDatePicker" || type === "datePicker") {
        const [start, end] = handlerDatePicker(
          searchData[searchDataKey]
        ).sendParams;

        result[`${searchDataKey}Begin`] = `${start}${
          ["addTime", "orderTime", "publishDate", "createTime","specialCompleteTime"].indexOf(
            searchDataKey
          ) > -1
            ? " 00:00:00"
            : ""
        }`;
        result[`${searchDataKey}End`] = `${end}${
          ["addTime", "orderTime", "publishDate", "createTime","specialCompleteTime"].indexOf(
            searchDataKey
          ) > -1
            ? " 23:59:59"
            : ""
        }`;
      }
      if (searchDataKey === "belongId") {
        // ??????????????????/???????????????
        if (belongId && belongId.length) {
          const { sendParams: performIdSendParams } = handlercascaderData(
            belongId,
            configMap?.belongId?.data
          );
          const { groupId, teamId, userId } =
            getBelongInfo(performIdSendParams);
          if (groupId) {
            result.belongDId = groupId;
          }
          if (teamId) {
            result.belongFId = teamId;
          }
          if (userId) {
            result.orderUserId = userId;
          }
        }
      }

      if (searchDataKey === "performId") {
        // ??????????????????/???????????????
        if (performId && performId.length) {
          const { sendParams: performIdSendParams } = handlercascaderData(
            performId,
            configMap?.performId?.data
          );
          const { groupId, userId } = getGroupInfo(performIdSendParams);
          if (groupId) {
            result.executeGroupIdId = groupId;
          }
          if (userId) {
            result.executorUserId = userId;
          }
        }
      }

      // ????????????????????????
      if (searchDataKey === "crmGroup") {
        if (crmGroup && crmGroup.length) {
          const { sendParams: crmGroupSendParams } = handlercascaderData(
            crmGroup,
            configMap?.crmGroup?.data
          );
          const { groupId, teamId, userId } = getGroupInfo(crmGroupSendParams);
          if (groupId) {
            result.businessGroupId = groupId;
          }
          if (teamId) {
            result.businessTeamId = teamId;
          }
          if (userId) {
            result.businessUserId = userId;
          }
        }
      }

      if (searchDataKey === 'coCate') {
        // ????????????????????????
        if ((coCate || []).length) {
          result.coCate = coCate[coCate.length - 1]
        }
      }
    });

    if (result.accountName) {
      // ???????????????????????????accountId;???????????????????????????accpuntName
      if (result.platIds && typeof result.platIds === "string") {
        if (!result.optionNamekey) {
          result.accountId = result.accountName;
          delete result.accountName;
        }
      } else {
        result.accountName = searchData.accountName?.label;
      }
    }
    delete result.optionNamekey;
    return result;
  };

  const formatDefaultVal = (params: any) => {
    if (defaultLabel.length) {
      defaultLabel.forEach(item => {
        // if (item === "publishDateBegin") {
        //   params[item] = params[item] || createFlag ? params[item] : firstDay;
        // } else if (item === "publishDateEnd") {
        //   params[item] = params[item] || createFlag ? params[item] : lastDay;
        // }
        params[item] =
          params[item] || createFlag ? params[item] : defaultPerformId;
      });
    }
  };

  function getTableList(extraParams: OrderListRequest = {}) {
    const params = Object.assign(getSearchParmas(), extraParams);
    if (!defaultFlag) {
      formatDefaultVal(params);
    }
    setListLoading(true);
    $getList(params)
      .then(res => {
        const { data = [], total } = res || {};
        setmediumOrderList([...(data || [])]);
        setPagination(
          Object.assign(pagination, {
            total: Number(total || 0),
          })
        );
        setListLoading(false);
      })
      .catch((e: any) => {
        console.info(e);
        setListLoading(false);
      });
  }
  // ??????????????????
  function getStatisticsAmount(extraParams: OrderListRequest = {}) {
    const params = Object.assign(getSearchParmas(), extraParams);
    if (!defaultFlag) {
      formatDefaultVal(params);
    }
    $getStatisticsAmount(params)
      .then(res => {
        const {
          // coPrice = 0,
          // executeMoney = 0,
          orderActualIncomeSum = 0,
          performanceMoney = 0,
          salesIncomeSum = 0,
        } = res || {};
        setPriceBoxList([
          // {
          //   title: "????????????",
          //   value: coPrice,
          // },
          // {
          //   title: "????????????",
          //   value: executeMoney,
          // },
          {
            title: "??????????????????",
            value: orderActualIncomeSum,
            tip: "??????????????????????????????????????????????????????",
          },
          {
            title: "????????????",
            value: salesIncomeSum,
            tip: "????????????????????????????????????????????????",
          },
          {
            title: "????????????",
            value: performanceMoney,
            tip: "????????????????????????????????????????????????",
          },
        ]);
        sendPerf();
      })
      .catch((e: any) => {
        console.info(e);
      });
  }
  function getOrderCount(extraParams: OrderListRequest = {}) {
    const params = Object.assign(getSearchParmas(), extraParams);
    // const params = getSearchParmas();
    if (!defaultFlag) {
      formatDefaultVal(params);
    }
    $orderCount(params as OrderOrderCountRequest).then(
      (res: { [prop: string]: any }) => {
        const cloneStatusList = [...statusList];
        setStatusList(
          cloneStatusList.map(item => {
            const cloneItem = {
              ...item,
            };
            const { key } = item;
            cloneItem.number = res ? res[key] : 0;
            return {
              ...cloneItem,
            };
          })
        );
      }
    );
  }

  const onSearch = () => {
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    getOrderCount();
    getTableList({
      pageNum: "1",
      size: "20",
    });
    getStatisticsAmount();
  };
  const onExport = () => {
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    getTableList({
      pageNum: "1",
      size: "20",
    });
    const params = getSearchParmas();
    window.open(
      `/api/qp/perform/order/info/exportPerformOrderList?${qs.stringify({
        ...params,
      })}`
    );
  };
  const onTabChange = (activeKey: string) => {
    if (activeKey === "11") {
      searchData.weedCancelOrderFlag = 0;
      setCancelFlag(0);
      setSearchData({ ...searchData });
      getOrderCount({
        orderStatus: activeKey,
      });
    }
    setTabKey(activeKey);
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    getTableList({
      pageNum: "1",
      size: "20",
      orderStatus: activeKey,
    });
    getStatisticsAmount({ orderStatus: activeKey });
  };

  // ?????????????????????????????????????????????????????????
  const handleShowPerformedOrder = (e: any, type: any) => {
    const value = Number(e.target.checked);
    if (type === "performFlag") {
      setPerformFlag(value);
      searchData.performFlag = value;
    } else {
      setCancelFlag(value);
      searchData.weedCancelOrderFlag = value;
      // ?????????????????????????????????????????????Tab?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
      if (tabKey === "11") {
        setTabKey("");
        searchData.orderStatus = "";
      }
    }
    setSearchData(searchData);
    const params: any = {};
    params[type] = value;
    getTableList({
      ...params,
    });
    getOrderCount({
      ...params,
    });
    getStatisticsAmount({
      ...params,
    });
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

  // ??????????????????
  // const setDefaultPublishDate = () => {
  //   searchData.publishDate = [moment(firstDay), moment(lastDay)];
  // };

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

  // ??????????????????
  const getPlatInfo = async () => {
    const res = await $getPlatInfo();
    if (res) {
      setSeachConfigValue("platIds", res);
    }
  };

  // ????????????????????????
  const getCrmGroupInfo = async () => {
    const res: any = await $getCrmGroupInfo();
    if (res && res.orgInfoConditionVOList) {
      if (!query.busOrderNo) {
        if (res.defaultValues) {
          searchData.crmGroup = res.defaultValues;
          setSearchData(searchData);
        } else {
          setDefaultFlag(true);
        }
      }
      // searchData.publishDate = [moment(firstDay), moment(lastDay)];
      // setSearchData(searchData);

      const formatperformIdData = handlerperformIdToCascaderData(
        res.orgInfoConditionVOList
      );
      setSeachConfigValue("crmGroup", formatperformIdData);
    }
  };

  // ???????????????????????????
  const getBelongOrgTree = async () => {
    const res = await $getBelongOrgTree();
    if (res) {
      const formatperformIdData = handlerperformIdToCascaderData(res);
      setSeachConfigValue("belongId", formatperformIdData);
    }
  };

  // ???????????????????????????
  const getPerformOrgInfo = async () => {
    const res: any = await $getPerformOrgInfo();
    if (res && res.orgInfoConditionVOS) {
      const formatperformIdData = handlerperformIdToCascaderData(
        res.orgInfoConditionVOS
      );
      setSeachConfigValue("performId", formatperformIdData);
    }
  };

  // ????????????????????????
  const getByDictType = async () => {
    const res: any = await $getByDictType({
      dictTypes: ["bus_order_type","qp_perform_task_id_status"],
    });
    if (res){
      setSeachConfigValue("busOrderType", res.bus_order_type || []);
      setSeachConfigValue("taskIdStatus", res.qp_perform_task_id_status|| []);
    }
  };

  // ????????????????????????
  const getAccountInfos = async () => {
    const res = await $getAccountInfo();
    if (res) {
      setSeachConfigValue("accountName", res);
      setAllAccountList(res);
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

  // ????????????????????????
  const getBrandList = async () => {
    const res = await $getBrandList();
    if (res) {
      setSeachConfigValue("brandId", res);
    }
  };
    // ??????????????????????????????
    const getCancelReasonType = async () => {
      const res = await $getReasonOptions();
      if (res) {
        setSeachConfigValue("cancelReasonType", res);
      }
    };
  useEffect(() => {
    console.info("?????????config", searchConfig);
    getPlatInfo();
    getCoCateList();
    getCrmGroupInfo();
    getBelongOrgTree();
    getPerformOrgInfo();
    getByDictType();
    getAccountInfos();
    getBrandList();
    getCancelReasonType();
    // getOrderCount();
  }, []);

  useEffect(() => {
    searchData.publishDate = [moment(firstDay), moment(lastDay)];

    // ???url???????????????
    if (query.busOrderNo) {
      delete searchData.publishDate;
      searchData.orderNoOrBusOrderNo = query.busOrderNo;
      setSearchData({ ...searchData });
      getTableList({
        ...searchData,
      });
      getOrderCount({
        ...searchData,
      });
      getStatisticsAmount({
        ...searchData,
      });

      return;
    }

    if (roleInfo && roleInfo.length) {
      setDefaultId();
    }

    if (defaultPerformId === 0 || defaultPerformId) {
      getTableList();
      getOrderCount();
      getStatisticsAmount();
    }
  }, [roleInfo, defaultPerformId]);

  // useEffect(() => {
  //   if (defaultPerformId === 0 || defaultPerformId) {
  //     getTableList();
  //     getOrderCount();
  //     getStatisticsAmount();
  //   }
  // }, [defaultPerformId]);

  // ???????????????????????????????????????????????????????????????
  useEffect(() => {
    // if (query.busOrderNo) return;
    if (defaultFlag && defaultLabel.length) {
      onSearch();
    }
  }, [defaultFlag]);

  return (
    <div>
      <div>
        {searchConfig.length && (
          <Search
            searchData={searchData}
            config={searchConfig}
            onChange={onSearchData}
            onExport={
              $permission("work_management_export") ? onExport : undefined
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

        <div className={styles.checkboxWrap}>
          <Checkbox onChange={e => handleShowPerformedOrder(e, "performFlag")}>
            ?????????????????????
          </Checkbox>
          <Checkbox
            checked={Boolean(weedCancelOrderFlag)}
            onChange={e => handleShowPerformedOrder(e, "weedCancelOrderFlag")}
          >
            ???????????????????????????
          </Checkbox>
        </div>
      </div>

      <Spin spinning={listLoading}>
        <Card size="small" bordered={false}>
          <Tabs onChange={onTabChange} activeKey={tabKey}>
            {statusList.map(item => {
              const { label, value, number } = item || {};
              return (
                <Tabs.TabPane
                  tab={
                    <div>
                      {label}{" "}
                      <span style={{ color: "red" }}>({number || 0})</span>
                    </div>
                  }
                  key={value}
                />
              );
            })}
          </Tabs>
        </Card>

        <Card bordered={false} size="small">
          <PriceBox list={priceBoxList} />
        </Card>

        <Card bordered={false} size="small" style={{ width: "100%" }}>
          <TableComponent
            data={mediumOrderList}
            pagination={pagination}
            // performPaymentType={performPaymentType}
            handlePageChange={handlePageChange}
            onChangeSort={handleChangeSort}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default videoSpecialWorkManagement;

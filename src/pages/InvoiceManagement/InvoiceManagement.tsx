/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-children-prop */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import { useState, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import qs from "qs";
import moment from "moment";
import { $getByDictType } from "src/api/signedOrder";
import {
  $getList,
  $getCoProductName,
  $getCompanyName,
  $getBrandList,
  $getCoCateList,
  $getOrgInfo,
} from "src/api/invoice";
import {
  $getCustomerTypeList,
  $getOppoFromList,
} from 'src/api/business'
import { Space, Tag, Button, Card, Tabs, Spin, message } from "antd";
import Search from "src/components/Search";
import type {
  SearchGroupConfigItemType,
  SearchConfigItemPropsType,
} from "src/components/Search";
import { GlobalContext } from "src/contexts/global";
import { getMonthStartEnd } from "src/utils/getMonthStartEnd";
import sendPerf from "src/utils/lego";
import type {
  BusinessResultListType,
  BusinessParamType,
} from "./config/InvoiceType";
import PriceBox from "./InvoiceMComponent/PriceBox/PriceBox";
import type { PriceBoxListType } from "./InvoiceMComponent/PriceBox/PriceBox";

import TableComponent from "./InvoiceMComponent/InvoiceTable/InvoiceTable";

import type { TypeListType } from "./config/status";
import { SEARCH_LIST } from "./config/search";
import {
  TYPE_LIST_CONFIG,
  STATUS_LIST_CONFIG,
  RE_STATUS_LIST_CONFIG,
} from "./config/status";
import styles from "./InvoiceManagement.scss";

const InvoiceManagement = () => {
  const location = useLocation();
  const { globalData = {}, loadGlobalFinish } = useContext(GlobalContext);
  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >(SEARCH_LIST);
  const [typeList, setTypeList] = useState<TypeListType[]>(TYPE_LIST_CONFIG);
  const [statusList, setStatusList] = useState<any[]>(STATUS_LIST_CONFIG);
  const [reStatusList, setReStatusList] = useState<any[]>(
    RE_STATUS_LIST_CONFIG
  );
  const [invoiceList, setinvoiceList] = useState<BusinessResultListType[]>([]);
  const [priceBoxList, setPriceBoxList] = useState<PriceBoxListType>([]);
  const [listLoading, setListLoading] = useState(false);
  const [busOrderNo, setBusOrderNo] = useState<any>();
  const [detailMsgByOpId, setDetailMsgByOpId] = useState<any>({});
  const [tabTypeKey, setTabTypeKey] = useState("");
  const [tabStatusKey, setTabStatusKey] = useState("1");
  const [defaultFlag, setDefaultFlag] = useState(false);

  // ?????????????????????
  const [createFlag, setCreateFlag] = useState(false);
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
      getTableList({
        pageNum: String(page),
      });
    },
  });
  const [searchData, setSearchData] = useState<any>({
    size: pagination.pageSize,
  });
  // ???????????????????????????
  const [mediaBuyerId, setMediaBuyerId] = useState<number>();
  // const [defaultLabel, setDefaultLabel] = useState<string>("");
  const [defaultLabel, setDefaultLabel] = useState<string[]>([""]);
  const { firstDay, lastDay } = getMonthStartEnd();
  const { roleInfo = [], did, fid, id } = globalData?.user?.userInfo || {};
  const defaultRole = [
    "business_d_leader",
    "business_f_leader",
    "business_ordinary_member",
  ];
  const { $permission } = window;
  // ???????????????????????????
  const setDefaultMediaBuyerId = () => {
    const query = qs.parse(location.search.substring(1));
    if (query.busOrderNo) return false;
    // const initDefaultLabel = ["orderTimeStart", "orderTimeEnd"];
    // setDefaultLabel(initDefaultLabel);
    if (did === 0) return false;
    try {
      roleInfo.forEach((item: any) => {
        if (defaultRole.includes(item.code)) {
          if (item.code === defaultRole[0]) {
            setMediaBuyerId(did);
            // setDefaultLabel("belongGroupId");
            setDefaultLabel(["belongGroupId"]);
            throw item.code;
          }
          if (item.code === defaultRole[1]) {
            setMediaBuyerId(fid);
            // setDefaultLabel("belongTeamId");
            setDefaultLabel(["belongTeamId"]);
            throw item.code;
          }
          if (item.code === defaultRole[2]) {
            setMediaBuyerId(id);
            // setDefaultLabel("businessUserId");
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
   * ??????????????????
   * @param data ???????????????????????????
   * @returns ???????????????????????????
   */
  const handlerOrgInfoCascaderData = (data: any) => {
    const result: any[] = [];

    data.forEach((dataItem: any) => {
      const { orgName, id, childOrgList } = dataItem;
      const resultItem: any = {
        ...dataItem,
        label: orgName,
        value: id,
      };

      delete resultItem.childOrgList;

      if (childOrgList) {
        resultItem.children = handlerOrgInfoCascaderData(childOrgList);
      }

      result.push(resultItem);
    });

    return result;
  };

  /**
   * ????????????????????????
   * @param data ???????????????????????????
   * @returns ???????????????????????????
   */
  const handlerOppoCascaderData = (
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
        resultItem.children = handlerOppoCascaderData(
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
    if (key === "createId") {
      setCreateFlag(true);
    }
    if (!key) {
      return;
    }

    const cloneSearchData = {
      ...searchData,
    };

    delete cloneSearchData[key];

    setSearchData(cloneSearchData);
  };

  // ??????search????????????
  const onSearchData = (data: any) => {
    setCreateFlag(true);
    const cloneData: Record<string, any> = {};

    Object.keys(data).forEach(key => {
      if (data[key]) {
        cloneData[key] = data[key];
      }
    });
    setSearchData(cloneData);
  };

  // ????????????
  const clearFilter = () => {
    setCreateFlag(true);
    setSearchData({
      determined: searchData.determined,
    });
  };

  const getSearchParmas = () => {
    // ????????????????????????
    const getGroupInfo = (data: any[] = []) => {
      const result = {
        groupId: "",
        teamId: "",
        userId: "",
      };

      data.forEach((item, index) => {
        const { id, userFlag, children } = item || {};
        if (index === 0) {
          result.groupId = id;
        } else if (
          userFlag &&
          ((children && children.length === 0) ||
            children === null ||
            !children)
        ) {
          result.userId = id;
        } else if (
          !(
            (children && children.length === 0) ||
            children === null ||
            !children
          )
        ) {
          result.teamId = id;
        }
      });

      return result;
    };
    // ????????????/?????????
    const { createId, coCateId, oppoFromId } = searchData;
    const result: {
      [prop: string]: any;
    } = {};

    result[tabTypeKey] = tabStatusKey;
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
        const [Start, End] = handlerDatePicker(
          searchData[searchDataKey]
        ).sendParams;

        result[`${searchDataKey}Start`] = `${Start}${
          ["orderTime", "customerTradeTime", "customerMoneyDate"].indexOf(searchDataKey) > -1
            ? " 00:00:00"
            : ""
        }`;
        result[`${searchDataKey}End`] = `${End}${
          ["orderTime", "customerTradeTime", "customerMoneyDate"].indexOf(searchDataKey) > -1
            ? " 23:59:59"
            : ""
        }`;
      }

      if (searchDataKey === "createId") {
        // ??????????????????/?????????
        if (createId && createId.length) {
          const { sendParams: createIdSendParams } = handlercascaderData(
            createId,
            configMap?.createId?.data
          );
          const { groupId, teamId, userId } = getGroupInfo(createIdSendParams);

          if (groupId) {
            result.belongGroupId = groupId;
          }
          if (teamId) {
            result.belongTeamId = teamId;
          }
          if (userId) {
            result.businessUserId = userId;
          }
        }
      }
      if (searchDataKey === "coCateId") {
        if (coCateId && coCateId.length) {
          result.coCateId = coCateId[coCateId.length - 1];
        }
      }

      // ??????????????????
      if (searchDataKey === "oppoFromId") {
        if (oppoFromId && oppoFromId.length) {
          result.oppoFromId = oppoFromId[oppoFromId.length - 1];
        }
      }
    });

    return result;
  };
  const formatDefaultVal = (params: any) => {
    // if (defaultLabel) {
    //   params[defaultLabel] =
    //     params[defaultLabel] || createFlag
    //       ? params[defaultLabel] || ""
    //       : mediaBuyerId;
    // }
    if (defaultLabel.length) {
      defaultLabel.forEach(item => {
        // if (item === "orderTimeStart") {
        //   params[item] = params[item] || createFlag ? params[item] : firstDay;
        // } else if (item === "orderTimeEnd") {
        //   params[item] = params[item] || createFlag ? params[item] : lastDay;
        // }
        params[item] = params[item] || createFlag ? params[item] : mediaBuyerId;
      });
    }
  };
  const getTabsList = (tabList: any[], dataList: any[]) => {
    const list = tabList.map((item: TypeListType, index: number) => {
      const cloneItem = {
        ...item,
      };
      cloneItem.number = dataList[index] || 0;
      return {
        ...cloneItem,
      };
    });
    return list;
  };
  let confParams: any = {};
  const getTableList = (
    extraParams?: BusinessParamType,
    paramsKey?: string,
    paramsValue?: number
  ) => {
    const params = Object.assign(getSearchParmas(), extraParams);
    if (!defaultFlag) {
      formatDefaultVal(params);
    }
    if (
      ["offlinePayCorType", "offlinePayPriType", "offlineRecType"].includes(
        paramsKey || ""
      )
    ) {
      params[paramsKey || ""] = paramsValue;
      if (paramsKey === "offlinePayCorType") {
        delete params.offlinePayPriType;
        delete params.offlineRecType;
      }
      if (paramsKey === "offlinePayPriType") {
        delete params.offlinePayCorType;
        delete params.offlineRecType;
      }
      if (paramsKey === "offlineRecType") {
        delete params.offlinePayPriType;
        delete params.offlinePayCorType;
      }
    } else {
      delete params.offlinePayCorType;
      delete params.offlinePayPriType;
      delete params.offlineRecType;
    }
    const obj: any = {};
    if (paramsKey && paramsValue) {
      obj[paramsKey] = paramsValue;
      confParams = { ...obj };
    }
    console.info("card?????????params-------", params);
    setListLoading(true);
    $getList(params)
      .then((res: any) => {
        const { list = [], data, total = 0 } = res || {};
        const {
          salesIncomeSum = 0,
          costOfSalesSum = 0,
          businessIncomeSum = 0,
          performanceMoneySum = 0,
          firstLineCount = [],
          secondLineCount = [],
          thirdLineCount = [],
          fourthLineCount = [],
        } = data || {};
        setinvoiceList([...(list || [])]);
        setPriceBoxList([
          {
            title: "????????????",
            value: salesIncomeSum,
            tip: "??????????????????????????????????????????????????????????????????????????????????????????????????????",
          },
          {
            title: "????????????",
            value: costOfSalesSum,
            tip: "??????????????????????????????????????????????????????????????????????????????????????????????????????",
          },
          {
            title: "??????????????????",
            value: businessIncomeSum,
            tip: "????????????????????????????????????????????????????????????????????????????????????????????????????????????",
          },
          {
            title: "????????????",
            value: performanceMoneySum,
            tip: "??????????????????????????????????????????????????????????????????????????????????????????????????????",
          },
        ]);
        const cloneTypeList = [...typeList];
        setTypeList(getTabsList(cloneTypeList, firstLineCount));
        let statusTabList = [];
        if (paramsKey === "offlineRecType") {
          statusTabList = [...RE_STATUS_LIST_CONFIG];
        } else {
          statusTabList = [...STATUS_LIST_CONFIG];
        }
        switch (paramsKey) {
          case "offlinePayCorType":
            setStatusList(getTabsList(statusTabList, secondLineCount));
            break;
          case "offlinePayPriType":
            setStatusList(getTabsList(statusTabList, thirdLineCount));
            break;
          case "offlineRecType":
            setStatusList(getTabsList(statusTabList, fourthLineCount));
            break;
          default:
            break;
        }
        setPagination(
          Object.assign(pagination, {
            total: Number(total),
          })
        );
        setListLoading(false);
        sendPerf()
      })
      .catch(e => {
        console.info("e", e);
        if (e) {
          setListLoading(false);
        }
      });
  };
  // ????????????tab???????????????????????????confParams??????????????????tab???????????????????????????table??????
  // ?????????????????????????????????getChangeTableList
  const getChangeTableList = (extraParams?: BusinessParamType) => {
    const params = Object.assign(getSearchParmas(), extraParams);
    if (!defaultFlag) {
      formatDefaultVal(params);
    }
    console.info("table?????????params-----------------", params);
    setListLoading(true);
    $getList(params)
      .then((res: any) => {
        const { list = [], data, total = 0 } = res || {};
        const {
          salesIncomeSum = 0,
          costOfSalesSum = 0,
          businessIncomeSum = 0,
          firstLineCount = [],
          secondLineCount = [],
          thirdLineCount = [],
          fourthLineCount = [],
        } = data || {};
        // ?????????????????????????????????????????????????????????
        setinvoiceList([...(list || [])]);
        setListLoading(false);
      })
      .catch(e => {
        console.info("e", e);
        if (e) {
          setListLoading(false);
        }
      });
  };

  const onSearch = () => {
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );

    getTableList(
      {
        pageNum: 1,
        size: 20,
      },
      tabTypeKey,
      +tabStatusKey
    );
  };

  const onTabTypeChange = (activeKey: string) => {
    setTabTypeKey(activeKey);
    setTabStatusKey("1");
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    const params: any = {
      pageNum: 1,
      size: 20,
    };
    if (activeKey) {
      getTableList(params, activeKey, 1);
    } else {
      getTableList(params);
    }
  };
  const onTabStatusChange = (activeKey: string) => {
    setTabStatusKey(activeKey);
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    const params: any = {
      pageNum: 1,
      size: 20,
    };
    if (activeKey && tabTypeKey) {
      getTableList(params, tabTypeKey, +activeKey);
    } else {
      getTableList(params);
    }
  };
  const onExport = () => {
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    getTableList({
      pageNum: 1,
      size: 20,
    });
    const params = getSearchParmas();
    window.open(
      `/api/qp/perform/business/order/info/export?${qs.stringify({
        ...params,
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

  // ????????????????????????
  const getOppoFromList = async () => {
    try {
      const res = await $getOppoFromList();
      if (res && res.length) {
        const newOppoFromList = handlerOppoCascaderData(
          res,
          "fromName",
          "id",
          "child"
        );
        // setOppoFromList(newOppoFromList);
        setSeachConfigValue("oppoFromId", newOppoFromList || []);
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
        // setCustomerTypeList(res);
        setSeachConfigValue("opCoType", res || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e);
    }
  };

  // ??????????????????
  const getOrgInfo = async () => {
    try {
      const res: any = await $getOrgInfo();
      if (res && res.orgInfoConditionVOList) {
        const query = qs.parse(location.search.substring(1));
        if (!query.busOrderNo && !query.opNo && !query.planNo) {
          if (res.defaultValues) {
            searchData.createId = res.defaultValues;
            setSearchData({...searchData});
          } else {
            setDefaultFlag(true);
          }
          // searchData.orderTime = [moment(firstDay), moment(lastDay)];
        }
        const formatSignGroupData = handlerOrgInfoCascaderData(
          res.orgInfoConditionVOList
        );
        setSeachConfigValue("createId", formatSignGroupData);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // ????????????????????????????????????
  const getByDictType = async () => {
    try {
      const res: any = await $getByDictType({
        dictTypes: ["bus_order_type", "qp_perform_executor_group"],
      });
      if (res && res.qp_perform_executor_group) {
        setSeachConfigValue("executeGroupId", res.qp_perform_executor_group);
      }
      if (res && res.bus_order_type) {
        setSeachConfigValue("busOrderTypes", res.bus_order_type);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // ??????????????????
  const getCompanyName = async () => {
    try {
      const res: any = await $getCompanyName();
      if (res && res.length) {
        setSeachConfigValue("companyId", res);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // ??????????????????
  const getCoProductName = async () => {
    try {
      const res: any = await $getCoProductName();
      if (res && res.length) {
        const coList: { id: any; label: any }[] = [];
        res.forEach((item: any) => {
          coList.push({
            id: item,
            label: item,
          });
        });
        setSeachConfigValue("coProduct", coList);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // ??????????????????
  const getBrandList = async () => {
    try {
      const res: any = await $getBrandList();
      if (res) {
        setSeachConfigValue("brandId", res || []);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // ????????????????????????
  const getCoCateList = async () => {
    try {
      const res: any = await $getCoCateList();
      if (res && res.length) {
        const formatSignGroupData = formatCascaderData(res);
        setSeachConfigValue("coCateId", formatSignGroupData || []);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  useEffect(() => {
    console.info("?????????config", searchConfig, location);
    getOrgInfo();
    getOppoFromList();
    getCustomerTypeList();
    getByDictType();
    getCompanyName();
    getCoProductName();
    getBrandList();
    getCoCateList();
  }, []);

  // useEffect(() => {
  //  setDefaultMediaBuyerId();
  // }, [roleInfo]);

  useEffect(() => {
    // if (!loadGlobalFinish) return;
    const {busOrderNo, planNo, opNo} = qs.parse(location.search.substring(1));
    // const queryParams = { ...query };
    // url??????????????????????????????????????????????????????????????????????????????
    if (!busOrderNo && !planNo && !opNo) {
      searchData.orderTime = [moment(firstDay), moment(lastDay)];
    }

    if (busOrderNo || opNo || planNo) {
      delete searchData.orderTime
      if (busOrderNo) {
        setBusOrderNo(busOrderNo);
        searchData.busOrderNo = busOrderNo
      } else if (opNo) {
        searchData.opNo = opNo
      } else if (planNo) {
        searchData.planNo = planNo
      }
      setSearchData({...searchData})
      getTableList({
        pageNum: 1,
        size: 20,
        ...searchData,
      })
      return
    }

    if (roleInfo && roleInfo.length) {
      setDefaultMediaBuyerId();
    }

    if (mediaBuyerId === 0 || mediaBuyerId) {
      getTableList({
        pageNum: 1,
        size: 20,
        // ...queryParams,
      });
    }
    
    // else {
    //   setPagination(
    //     Object.assign(pagination, {
    //       current: 1,
    //     })
    //   );
    //   getTableList({
    //     pageNum: "1",
    //     ...queryParams,
    //   });
    // }
  }, [mediaBuyerId, roleInfo]);

  useEffect(() => {
    if (defaultFlag && defaultLabel.length) {
      onSearch();
    }
  }, [defaultFlag]);

  return (
    <div className={styles.root}>
      <Card bordered={false} size="small">
        {searchConfig.length && (
          <Search
            searchData={searchData}
            config={searchConfig}
            onChange={onSearchData}
            onExport={
              $permission("invoice_management_export") ? onExport : undefined
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
      </Card>

      <Spin spinning={listLoading}>
        <Card size="small" bordered={false}>
          <Tabs
            onChange={onTabTypeChange}
            activeKey={tabTypeKey}
            className={styles.firstLevelTabs}
          >
            {typeList.map(item => {
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
                  children={
                    <>
                      {label !== "????????????" && (
                        <Tabs
                          onChange={onTabStatusChange}
                          activeKey={tabStatusKey}
                        >
                          {statusList.map(item => {
                            const { label, value, number } = item || {};
                            return (
                              <Tabs.TabPane
                                tab={
                                  <div>
                                    {label}{" "}
                                    <span style={{ color: "red" }}>
                                      ({number || 0})
                                    </span>
                                  </div>
                                }
                                key={value}
                              />
                            );
                          })}
                        </Tabs>
                      )}
                    </>
                  }
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
            data={invoiceList || []}
            getTableList={getChangeTableList}
            pagination={pagination}
            busOrderNo={busOrderNo}
            confParams={confParams}
            detailMsgByOpId={detailMsgByOpId}
            searchData={searchData}
            setSearchData={setSearchData}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default InvoiceManagement;

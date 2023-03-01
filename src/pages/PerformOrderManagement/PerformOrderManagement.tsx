/* eslint-disable prefer-template */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import { useState, useEffect, useContext, useMemo } from "react";
import {
  $getCrmGroupInfo,
  $getList,
  $orderCount,
  $getoverTimeList,
  $getStatisticsAmount,
  $getPerformOrgInfo,
  $getAccountInfo,
  $getPlatInfo,
} from "src/api/perform";
import { $getReasonOptions, $getByDictType } from "src/api/business";
import { $getBelongOrgTree } from "src/api/work";
import { $getBrandList } from "src/api/invoice";
import { cloneDeep } from "lodash";
import { getMonthStartEnd } from "src/utils/getMonthStartEnd";
import moment from "moment";
import { Space, Tag, Button, Card, Tabs, Spin, Checkbox } from "antd";
import Search from "src/components/Search/Search";
import type {
  SearchGroupConfigItemType,
  SearchConfigItemPropsType,
} from "src/components/Search/Search";
import { GlobalContext } from "src/contexts/global";
import sendPerf from "src/utils/lego";
import NormalPriceBox from "./components/NormalPriceBox";
import PriceBox from "./components/PriceBox/PriceBox";
import {
  OrderListRequest,
  OrderListResponse,
  OrderConditionResponse,
} from "@/api/types/performType";

import TableComponent from "./components/TableComponent";
import type { StatusListType } from "./config/status";
import { SEARCH_LIST, overTimeTypeList } from "./config/search";
import STATUS_LIST_CONFIG from "./config/status";
import styles from "./PerformOrderManagement.scss";
import { PriceBoxListType } from "@/components/PriceBox/PriceBox";

const PerformOrderManagement = () => {
  const { globalData = {} } = useContext(GlobalContext);
  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >(SEARCH_LIST);
  const [statusList, setStatusList] =
    useState<StatusListType[]>(STATUS_LIST_CONFIG);
  const [performOrderList, setperformOrderList] = useState<
    OrderListResponse["data"]
  >([]);
  const [allAccountList, setAllAccountList] = useState<
    OrderConditionResponse["accountInfo"]
  >([]);
  const [priceBoxList, setPriceBoxList] = useState<PriceBoxListType>([]);
  const [workOrderpriceBoxList, setWorkOrderPriceBoxList] =
    useState<PriceBoxListType>([]);
  const [listLoading, setListLoading] = useState(false);
  const [tabKey, setTabKey] = useState("");
  const [createFlag, setCreateFlag] = useState(false);
  const [defaultFlag, setDefaultFlag] = useState(false);
  const [performFlag, setPerformFlag] = useState<number>(0);
  const [weedCancelOrderFlag, setCancelFlag] = useState<number>(0);
  // const [ totleCountList, setTotleCountList ] = useState(0)
  const [performDelayList, setPerformDelayReasonList] = useState<any>([]);
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
  // 设置默认媒介采买人
  const [defaultPerformId, setDefaultPerformId] = useState<number>();
  const { roleInfo = [], did, fid, id } = globalData?.user?.userInfo || {};
  const defaultRole = ["execute_f_leader", "execute_ordinary_member"];
  const [defaultLabel, setDefaultLabel] = useState<string[]>([""]);
  const { firstDay, lastDay } = getMonthStartEnd();
  const setDefaultId = () => {
    try {
      // const initDefaultLabel = ["slotDateBegin", "slotDateEnd"];
      // setDefaultLabel(initDefaultLabel);
      if (did === 0) return false;
      roleInfo.forEach((item: any) => {
        if (defaultRole.includes(item.code)) {
          if (item.code === defaultRole[0]) {
            setDefaultPerformId(fid);
            // setDefaultLabel("executeGroupIdId");
            setDefaultLabel(["executeGroupIdId"]);
            throw item.code;
          }
          if (item.code === defaultRole[1]) {
            // setDefaultLabel("executorUserId");
            setDefaultPerformId(id);
            setDefaultLabel(["executorUserId"]);
            throw item.code;
          }
        }
      });
    } catch (error) {
      console.info(error);
    }
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
  const handlerperformIdToCascaderData = (data: any) => {
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
        resultItem.children = handlerperformIdToCascaderData(childOrgList);
      }

      result.push(resultItem);
    });

    return result;
  };

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

  // 处理单个选项清楚
  const closeFilterTagItem = (key: string) => {
    if (!key) {
      return;
    }
    if (key === "performId") {
      setCreateFlag(true);
    }
    const cloneSearchData = {
      ...searchData,
    };

    if (key==="performDelayFlag"){
      delete cloneSearchData.performDelayFlagList;
      // 履约延期为否，则不显示履约延期原因及删除之前的选项
      const searchList: any = cloneDeep(SEARCH_LIST);
      setSearchConfig([...searchList]);
    }
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

  // 处理search条件改变
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
    // 履约延期为是，则显示履约延期原因的选项
    if (data.performDelayFlag && data.performDelayFlag.label === "是") {
      const searchList: any = cloneDeep(SEARCH_LIST);
      searchList[0].config.splice(7, 0, {
        type: "select",
        key: "performDelayFlagList",
        data: performDelayList.length ? performDelayList.slice(1) : [],
        conf: {
          placeholder: "履约延期原因",
          labelInValue: true,
          multiple: true,
        },
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
      });
      setSearchConfig([...searchList]);
    } else {
      // 履约延期为否，则不显示履约延期原因及删除之前的选项
      const searchList: any = cloneDeep(SEARCH_LIST);
      setSearchConfig([...searchList]);
      delete cloneData.performDelayFlagList;
      closeFilterTagItem("performDelayFlagList");
    }
    setSearchData(cloneData);
  };

  // 清空搜索
  const clearFilter = () => {
    setCreateFlag(true);
    setSearchData({
      performFlag,
      weedCancelOrderFlag,
    });
  };

  const getSearchParmas = () => {
    // 处理组信息
    const getGroupInfo = (data: any[] = []) => {
      const result = {
        groupId: "",
        teamId: "",
        userId: "",
      };
      data.forEach((item, index) => {
        const { id, userFlag } = item;
        if (index === 0) {
          result.groupId = id;
        } else if (userFlag) {
          result.userId = id;
        } else if (!userFlag) {
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
        const { id, userFlag } = item;
        if (index === 1) {
          result.groupId = id;
        } else if (userFlag) {
          result.userId = id;
        } else if (!userFlag && index === 2) {
          result.teamId = id;
        }
      });
      return result;
    };

    const { performId, crmGroup, belongId } = searchData;
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
          ["addTime", "orderTime", "slotDate", "specialCompleteTime"].indexOf(
            searchDataKey
          ) > -1
            ? " 00:00:00"
            : ""
        }`;
        result[`${searchDataKey}End`] = `${end}${
          ["addTime", "orderTime", "slotDate", "specialCompleteTime"].indexOf(
            searchDataKey
          ) > -1
            ? " 23:59:59"
            : ""
        }`;
      }

      if (searchDataKey === "performId") {
        // 处理执行小组/执行人数据
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

      // 处理商务团队信息
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

      // 处理内容团队筛选信息
      if (searchDataKey === "belongId") {
        // 处理执行小组/执行人数据
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
    });

    if (result.accountName) {
      // 平台单选，账号传递accountId;平台多选，账号传递accpuntName
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
    // if (defaultLabel) {
    //   params[defaultLabel] =
    //     params[defaultLabel] || createFlag
    //       ? params[defaultLabel]
    //       : defaultPerformId;
    // }
    if (defaultLabel.length) {
      defaultLabel.forEach(item => {
        // if (item === "slotDateBegin") {
        //   params[item] = params[item] || createFlag ? params[item] : firstDay;
        // } else if (item === "slotDateEnd") {
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
        setperformOrderList([...(data || [])]);
        setPagination(
          Object.assign(pagination, {
            total: Number(total || 0),
          })
        );
        setListLoading(false);
      })
      .catch(e => {
        console.info(e);
        setListLoading(false);
      });
  }
  // 获取超时统计
  function getOverTimeList(extraParams: OrderListRequest = {}) {
    const params = Object.assign(getSearchParmas(), extraParams);
    formatDefaultVal(params);
    $getoverTimeList(params)
      .then(res => {
        setPriceBoxList([
          {
            title: "大纲即将超时",
            value: res.outlineOvertimeSoonCount || 0,
            tip: "距离截止时间不足24小时，即视为即将超时",
          },
          {
            title: "大纲已超时",
            value: res.outlineOvertimeCount || 0,
          },
          {
            title: "脚本即将超时",
            value: res.scriptOvertimeSoonCount || 0,
            tip: "距离截止时间不足24小时，即视为即将超时",
          },
          {
            title: "脚本已超时",
            value: res.scriptOvertimeCount || 0,
          },
          {
            title: "视频初稿即将超时",
            value: res.draftOvertimeSoonCount || 0,
            tip: "距离截止时间不足24小时，即视为即将超时",
          },
          {
            title: "视频初稿已超时",
            value: res.draftOvertimeCount || 0,
          },
          {
            title: "发布视频即将超时",
            value: res.publishOvertimeSoonCount || 0,
            tip: "距离截止时间不足24小时，即视为即将超时",
          },
          {
            title: "发布视频已超时",
            value: res.publishOvertimeCount || 0,
          },
        ]);
      })
      .catch((e: any) => {
        console.info(e);
      });
  }

  // 获取工单数据汇总统计
  function getWorkOrderPriceList(extraParams: OrderListRequest = {}) {
    const params = Object.assign(getSearchParmas(), extraParams);
    formatDefaultVal(params);
    $getStatisticsAmount(params)
      .then((res: any) => {
        setWorkOrderPriceBoxList([
          {
            title: "工单实际营收",
            value: res.orderActualIncomeSum || 0,
            tip: "当前列表中全部订单的工单实际营收之和",
          },
          {
            title: "绩效营收",
            value: res.performanceMoneySum || 0,
            tip: "当前列表中全部订单的绩效营收之和",
          },
          {
            title: "已履约工单数",
            value: res.performOrderCount || 0,
            tip: "视频工单绑定了视频，数量+1，特殊工单已履约，数量+1",
          },
          {
            title: "工单履约率",
            value: res.performOrderRate ? `${res.performOrderRate}%` : 0,
            tip: "工单履约率=已履约工单数/当前列表中的全部工单",
          },
          {
            title: "履约延期工单数",
            value: res.performDelayCount || 0,
            tip: "工单【录入执行计划】里，被标记为履约延期的工单数量",
          },
          {
            title: "履约延期率",
            value: res.performDelayRate ? `${res.performDelayRate}%` : 0,
            tip: "履约延期率=履约延期工单数/当前列表中的全部工单",
          },
          {
            title: "取消合作工单数",
            value: res.cancelOrderCount || 0,
          },
          {
            title: "撤单率",
            value: res.cancelOrderRate ? `${res.cancelOrderRate}%` : 0,
            tip: "取消合作的工单数/总工单数",
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
    formatDefaultVal(params);
    $orderCount(params).then((res: { [prop: string]: any }) => {
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
    });
  }

  const onSearch = () => {
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    getTableList({
      pageNum: "1",
      size: "20",
    });
    getOrderCount();
    getOverTimeList();
    getWorkOrderPriceList();
  };
  const onTabChange = (activeKey: string) => {
    if (activeKey === "11") {
      searchData.weedCancelOrderFlag = 0;
      setCancelFlag(0);
      setSearchData({ ...searchData });
      getOrderCount({ orderStatus: activeKey });
    }
    setTabKey(activeKey);
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    const params: any = {
      pageNum: "1",
      size: "20",
      orderStatus: activeKey,
    };
    getTableList(params);
    getOverTimeList({ orderStatus: activeKey });
    getWorkOrderPriceList({ orderStatus: activeKey });
    getOrderCount(params);
  };
  const changeTab = (tabType: string, status?: string) => {
    setTabKey(tabType);
    const item = overTimeTypeList.find(item => item.value === status);
    if (item && item.value) {
      searchData.overtimeStatus = {
        key: status + "",
        label: item.label,
        value: status + "",
      };
    }
    setSearchData({ ...searchData });
    onTabChange(tabType);
  };

  // 处理是否显示已履约或者剔除取消合作订单
  const handleShowPerformedOrder = (e: any, type: any) => {
    const value = Number(e.target.checked);
    if (type === "performFlag") {
      setPerformFlag(value);
      searchData.performFlag = value;
    } else {
      setCancelFlag(value);
      searchData.weedCancelOrderFlag = value;
      // 当用户点击选择【已取消合作】的Tab时，若已勾选了“剔除取消合作的订单”，则需要自动取消勾选，防止显示空数据的情况
      if (tabKey === "11") {
        setTabKey("");
        searchData.orderStatus = "";
      }
    }
    setSearchData(searchData);
    const params: any = {};
    params[type] = value;
    getTableList(params);
    getOrderCount(params);
    getOverTimeList(params);
    getWorkOrderPriceList(params);
  };

  // 数据概览第一行：已履约工单数、履约延期工单数 、取消合作工单数过滤
  const handleClickNormalBox = (title: string, params: any) => {
    // 点击履约延期工单数，选中履约延期为是，并展示履约延期原因选项
    if (title === "履约延期工单数") {
      if (params.performDelayFlag === 0 || params.performDelayFlag === 1) {
        searchData.performDelayFlag = {
          key: params.performDelayFlag + "",
          label: params.performDelayFlag ? "是" : "否",
          value: params.performDelayFlag + "",
        };
      }

      if (params.performDelayFlag === 1) {
        const searchList: any = cloneDeep(SEARCH_LIST);
        searchList[0].config.splice(7, 0, {
          type: "select",
          key: "performDelayFlagList",
          data: performDelayList.length ? performDelayList.slice(1) : [],
          conf: {
            placeholder: "履约延期原因",
            labelInValue: true,
            multiple: true,
          },
          optionLabelKey: "dictLabel",
          optionValKey: "dictValue",
        });
        setSearchConfig([...searchList]);
      }
    } else {
      delete searchData.performDelayFlag;
    }
    if (title === "已履约工单数") {
      const value = Number(params.target.checked);
      setPerformFlag(value);
      searchData.performFlag = value;
      setTabKey("");
      searchData.orderStatus = "";
    }
    if (title === "取消合作工单数") {
      onTabChange(params.orderStatus);
    }
    setSearchData({ ...searchData });
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    getOrderCount({ ...params });
    getTableList({
      pageNum: "1",
      ...params,
    });
    getOverTimeList({ ...params });
    getWorkOrderPriceList({ ...params });
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

  // 获取商务团队的数据
  const getCrmGroupInfo = async () => {
    const res: any = await $getCrmGroupInfo();
    if (res && res.orgInfoConditionVOList) {
      const formatperformIdData = handlerperformIdToCascaderData(
        res.orgInfoConditionVOList
      );
      setSeachConfigValue("crmGroup", formatperformIdData);
    }
  };

  // 获取执行人小组数据
  const getPerformOrgInfo = async () => {
    const { orgInfoConditionVOS = [], defaultValues }: any =
      await $getPerformOrgInfo();
    if (orgInfoConditionVOS && orgInfoConditionVOS.length) {
      if (defaultValues) {
        searchData.performId = defaultValues;
        setSearchData(searchData);
      } else {
        setDefaultFlag(true);
      }
      // searchData.slotDate = [moment(firstDay), moment(lastDay)];
      // setSearchData(searchData);
      const formatperformIdData =
        handlerperformIdToCascaderData(orgInfoConditionVOS);
      setSeachConfigValue("performId", formatperformIdData);
    }
  };

  // 获取平台数据
  const getPlatInfo = async () => {
    const res = await $getPlatInfo();
    if (res) {
      setSeachConfigValue("platIds", res);
    }
  };

  // 获取账号名称数据
  const getAccountInfos = async () => {
    const res = await $getAccountInfo();
    if (res) {
      setSeachConfigValue("accountName", res);

      setAllAccountList(res);
    }
  };

  // 获取账号名称数据
  const getBrandList = async () => {
    const res = await $getBrandList();
    if (res) {
      setSeachConfigValue("brandId", res);
    }
  };

  // 获取内容团队数据
  const getBelongOrgTree = async () => {
    const res = await $getBelongOrgTree();
    if (res) {
      const formatperformIdData = handlerperformIdToCascaderData(res);
      setSeachConfigValue("belongId", formatperformIdData);
    }
  };
  // 获取取消合作原因类型
  const getCancelReasonType = async () => {
    const res = await $getReasonOptions();
    if (res) {
      setSeachConfigValue("cancelReasonType", res);
    }
  };
  // 获取收付款类型数据
  const getByDictType = async () => {
    const {
      qp_perform_task_id_status: performTaskIdStatus,
      perform_delay_flag: performDelayReasonList,
    }: any = await $getByDictType({
      dictTypes: ["qp_perform_task_id_status", "perform_delay_flag"],
    });
    if (performTaskIdStatus) {
      setSeachConfigValue("taskIdStatus", performTaskIdStatus || []);
    }
    if (performDelayReasonList) {
      setPerformDelayReasonList(performDelayReasonList || []);
    }
  };

  useEffect(() => {
    getCrmGroupInfo();
    getPerformOrgInfo();
    getPlatInfo();
    getAccountInfos();
    getBrandList();
    getBelongOrgTree();
    getCancelReasonType();
    getByDictType();
    console.info("默认的config", searchConfig);
  }, []);

  useEffect(() => {
    // if (!loadGlobalFinish) return;

    searchData.slotDate = [moment(firstDay), moment(lastDay)];

    // if (loadGlobalFinish) {
    if (roleInfo && roleInfo.length) {
      setDefaultId();
    }

    if (defaultPerformId === 0 || defaultPerformId) {
      getTableList();
      getOrderCount();
      getOverTimeList();
      getWorkOrderPriceList();
    }
    //  else {
    //   onSearch();
    // }
    // }
  }, [roleInfo, defaultPerformId]);

  // 不在对应组织的用户拥有角色。不传默认值处理
  useEffect(() => {
    if (defaultFlag && defaultLabel) {
      onSearch();
    }
  }, [defaultFlag]);

  return (
    <div>
      <Card bordered={false} size="small">
        {searchConfig.length && (
          <Search
            searchData={searchData}
            config={searchConfig}
            onChange={onSearchData}
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

        <div className={styles.checkboxWrap}>
          <Checkbox
            checked={Boolean(performFlag)}
            onChange={e => handleShowPerformedOrder(e, "performFlag")}
          >
            显示已履约订单
          </Checkbox>
          <Checkbox
            checked={Boolean(weedCancelOrderFlag)}
            onChange={e => handleShowPerformedOrder(e, "weedCancelOrderFlag")}
          >
            剔除取消合作的订单
          </Checkbox>
        </div>
      </Card>
      <Spin spinning={listLoading}>
        <Card size="small" bordered={false}>
          <Tabs onChange={onTabChange} activeKey={tabKey}>
            {statusList.map(item => {
              const { label, value, number } = item || {};
              return (
                <Tabs.TabPane
                  tab={
                    <div>
                      {label}
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
          <NormalPriceBox
            list={workOrderpriceBoxList}
            handleClickNormalBox={handleClickNormalBox}
          />
        </Card>

        <div className={styles.line} />

        <Card bordered={false} size="small">
          <PriceBox list={priceBoxList} changeTab={changeTab} />
        </Card>
        <Card bordered={false} size="small" style={{ width: "100%" }}>
          <TableComponent
            data={performOrderList}
            pagination={pagination}
            handlePageChange={handlePageChange}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default PerformOrderManagement;

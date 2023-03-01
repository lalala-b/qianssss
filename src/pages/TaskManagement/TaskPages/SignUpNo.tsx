/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable import/order */
/* eslint-disable no-use-before-define */
/* eslint-disable css-modules/no-undef-class */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable css-modules/no-unused-class */
import { useEffect, useState, useContext, useMemo } from "react";
import { Card, Spin, Space, Tag, Button, message } from "antd";
import type {
  SearchGroupConfigItemType,
  SearchConfigItemPropsType,
} from "src/components/Search/Search";
import Search from "src/components/Search/Search";
import {
  $getOppoFollowers,
  $getTaskFollowers,
  $getTaskStatusList,
  $getTaskList,
} from "src/api/taskManagement";
import type { TaskListType } from "../TaskManagementCom/TaskManagementType";
import { useLocation } from "react-router";
import { cloneDeep } from "lodash";
import { GlobalContext } from "src/contexts/global";
import moment from "moment";
import TaskManageTable from "../TaskManagementCom/TaskManageTable";
// 以下4行引入解决日期控件英文的问题
import "moment/locale/zh-cn";
import qs from "qs";
import sendPerf from "src/utils/lego";
import { SEARCH_LIST } from "./search";
import { BusinessParamType } from "@/pages/InvoiceManagement/config/InvoiceType";
import styles from "../TaskManagement.scss";

moment.locale("zh-cn");
const SignUpNo: React.FC<{
  taskType: number;
  defaultOpId?: number;
  defaultPid?: number;
}> = ({ taskType, defaultOpId, defaultPid }) => {
  const location = useLocation();
  const { globalData = {} } = useContext(GlobalContext);
  const [reCounts, setReCounts] = useState<any>();
  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >(SEARCH_LIST);
  const [listLoading, setListLoading] = useState(false);
  const [taskTableList, setTaskTableList] = useState<TaskListType[]>([]);
  const [pagination, setPagination] = useState({
    pageSize: 20,
    total: 0,
    current: 1,
  });
  const [createFlag, setCreateFlag] = useState(false);
  const handlePageChange = (page: number) => {
    setPagination(
      Object.assign(pagination, {
        current: page,
      })
    );
    getTableList({
      pageNum: String(page),
    });
  };
  const [searchData, setSearchData] = useState<any>({
    size: pagination.pageSize,
  });
  // 设置默认媒介采买人
  const { roleInfo = [], id } = globalData?.user?.userInfo || {};
  const defaultRole = [
    "oppo_medium_distribute",
    "oppo_medium_buyer",
    "oppo_order_signer",
  ];
  const [taskFollowerId, setTaskFollowerId] = useState<number>();
  const setDefaultFollower = () => {
    try {
      roleInfo.forEach((item: any) => {
        if (defaultRole.includes(item.code)) {
          setTaskFollowerId(id);
          throw item.code;
        }
      });
    } catch (error) {
      console.info(error);
    }
  };
  const getReCounts = (list: any) => {
    const obi = { otherRecommendNum: "", myRecommendNum: "" };
    list.forEach(
      (element: {
        myRecommendNum: string;
        otherRecommendNum: string;
        pid: number;
      }) => {
        if (element.pid === defaultPid) {
          obi.myRecommendNum = element.myRecommendNum;
          obi.otherRecommendNum = element.otherRecommendNum;
        }
      }
    );
    setReCounts(obi);
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
    value: any,
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

  // 处理单个选项清除
  const closeFilterTagItem = (key: string) => {
    if (!key) {
      return;
    }
    if (key === "taskFollower") {
      setCreateFlag(true);
    }
    const cloneSearchData = {
      ...searchData,
    };

    delete cloneSearchData[key];

    setSearchData(cloneSearchData);
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
    setSearchData(cloneData);
  };

  // 清空搜索
  const clearFilter = () => {
    setCreateFlag(true);
    setSearchData({});
  };

  const getSearchParmas = () => {
    // 处理商务团队信息
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
    // 商务团队/创建人
    const { charger, taskFollower } = searchData;
    const result: {
      [prop: string]: any;
    } = {};

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

        result[`begin${searchDataKey}`] = `${Start} 00:00:00`;
        result[`end${searchDataKey}`] = `${End} 23:59:59`;
      }

      if (searchDataKey === "charger") {
        // 处理商务团队/创建人
        if (charger && charger.length) {
          // result.charger = charger[charger.length - 1];
          const { sendParams: signGroupSendParams } = handlercascaderData(
            charger,
            configMap?.charger?.data
          );
          const { chargerOrg, charger: chargerId } =
            getChargerInfo(signGroupSendParams);
          if (chargerOrg && !chargerId) {
            result.chargerOrg = chargerOrg;
            result.charger = null;
          }

          if (chargerId) {
            result.charger = chargerId;
          }
        }
      }
      if (searchDataKey === "taskFollower") {
        // 处理任务跟进人级联
        if (taskFollower && taskFollower.length) {
          const { sendParams: signGroupSendParams } = handlercascaderData(
            taskFollower,
            configMap?.taskFollower?.data
          );
          const { chargerOrg:taskFollowerOrg, charger:taskFollowerId } =
            getChargerInfo(signGroupSendParams);
          if (taskFollowerOrg && !taskFollowerId) {
            result.taskFollowerOrg = taskFollowerOrg;
            result.taskFollower = null;
          }

          if (taskFollowerId) {
            result.taskFollower = taskFollowerId;
          }
        }
      }
    });

    return result;
  };

  const getTableList = (extraParams?: BusinessParamType) => {
    const params: any = Object.assign(getSearchParmas(), extraParams);
    const taskFollower =
      params?.taskFollower || createFlag ? params.taskFollower : taskFollowerId;
    const pid = params?.pid || params?.pid === null ? params.pid : defaultPid;
    setListLoading(true);
    params.taskType = taskType;
    $getTaskList({ ...params, taskFollower, taskType, pid })
      .then((res: any) => {
        const { list = [], total = 0 } = res || {};
        setListLoading(false);
        setTaskTableList([...list]);
        pagination.total = total || 0;
        setPagination({ ...pagination });
        if (defaultPid === 0 || defaultPid) {
          getReCounts(res.list);
        }
        sendPerf();
      })
      .catch(e => {
        console.info("e", e);
        setListLoading(false);
      });
  };

  const onSearch = () => {
    setPagination(
      Object.assign(pagination, {
        current: 1,
      })
    );
    getTableList({
      pageNum: "1",
    });
  };

  const onExport = () => {
    const params = getSearchParmas();
    window.open(
      `/api/qp/business/opportunity/task/taskListExport?${qs.stringify({
        ...params,
        taskType,
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

  // 获取商机负责人的数据
  const getOppoFollowers = async () => {
    try {
      const res = await $getOppoFollowers();
      if (res && res.length) {
        const formatSignGroupData = handlerOrgInfoCascaderData(res);
        setSeachConfigValue("charger", formatSignGroupData || []);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e?.message);
    }
  };

  // 获取任务跟进人的数据
  const getTaskFollowers = async () => {
    try {
      const res = await $getTaskFollowers();
      if (res.orgList && res.orgList.length) {
        const formatSignGroupData = handlerOrgInfoCascaderData(res.orgList);
        setSeachConfigValue("taskFollower", formatSignGroupData || []);
        if (res.defaultValues) {
          searchData.taskFollower = res.defaultValues;
          setSearchData(searchData);
        }
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e?.message);
    }
  };

  // 获取任务状态的数据
  const getTaskStatusList = async () => {
    try {
      const res = await $getTaskStatusList();
      if (res && res.length) {
        setSeachConfigValue("taskStatus", res);
      }
    } catch (e: any) {
      // message.error(e?.message)
      console.info(e?.message);
    }
  };

  useEffect(() => {
    if (id) {
      setDefaultFollower();
    }
  }, [id]);

  useEffect(() => {
    if (taskFollowerId) {
      getTableList();
    }
  }, [taskFollowerId]);

  useEffect(() => {
    console.info("默认的config", searchConfig, location);
    getOppoFollowers();
    getTaskFollowers();
    getTaskStatusList();
    getTableList();
  }, []);

  useEffect(() => {
    searchData.pid = defaultPid;
    setSearchData(searchData);
  }, [defaultPid]);

  return (
    <div>
      <Card bordered={false} size="small">
        {searchConfig.length && (
          <Search
            searchData={searchData}
            config={searchConfig}
            onChange={onSearchData}
            onExport={onExport}
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
      </Card>

      <Spin spinning={listLoading}>
        <TaskManageTable
          pagination={pagination}
          handlePageChange={handlePageChange}
          getList={getTableList}
          taskType={taskType}
          reCounts={reCounts}
          defaultOpId={defaultOpId}
          defaultPid={defaultPid}
          taskTableList={taskTableList}
        />
      </Spin>
    </div>
  );
};

export default SignUpNo;

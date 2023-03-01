/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import { useState, useContext, useEffect, useMemo } from "react";
import {
  $getOrgInfo,
  $getByDictType,
  $getCooperateOrderList,
  $findAccountLinkage,
  $getSignCondition,
  $exportCooperateOrderList,
  $getAccountCondition,
} from "src/api/signedOrder";
import { cloneDeep } from "lodash";
import { getMonthStartEnd } from "src/utils/getMonthStartEnd";
import moment from "moment";
import { Card, Button, Spin, Checkbox, message } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import { $getBrandList } from "src/api/invoice";
import {
  OrderListRequest,
  OrderListResponse,
  OrderConditionResponse,
} from "src/api/types/projectId_3631";

import Search from "src/components/Search/Search";
import type {
  SearchGroupConfigItemType,
  SearchConfigItemPropsType,
} from "src/components/Search/Search";

import type { GetByDictTypeResponseType } from "src/api/signedOrder";

import { GlobalContext } from "src/contexts/global";
import PriceBox from "src/components/PriceBox";
import type { PriceBoxListType } from "src/components/PriceBox";

import TableComponent from "./components/CooperateTableComponent";

import { SEARCH_LIST } from "./config/cooperateSearch";
import AddCoopOrderModal from "./AddCoopOrderModal"

import styles from './CooperateOrderManagementList.scss'

const CooperateOrderManagementList = () => {
  const { $permission } = window;
  const { globalData = {} } = useContext(GlobalContext);
  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >(SEARCH_LIST);
  const [cooperateOrderList, setCooperateOrderList] = useState<
    OrderListResponse["signOrderList"]
  >([]);
  const [performPaymentType, setPerformPaymentType] =
    useState<GetByDictTypeResponseType>([]);
  const [cooperOrderProjectType, setCooperOrderProjectType] =
    useState<GetByDictTypeResponseType>([]);
  const [allAccountList, setAllAccountList] = useState<
    OrderConditionResponse["accountInfo"]
  >([]);
  const [priceBoxList, setPriceBoxList] = useState<PriceBoxListType>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [createFlag, setCreateFlag] = useState<boolean>(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState<boolean>(false);
  const [addCoopOrderType, setAddCoopOrderType] = useState<string>('add');
  // 当前要查看的合作订单详情的id
  const [curCooperOrderId, setCurCooperOrderId] = useState<string>('')
  const [platData, setPlatData] = useState<any>([])
  // 商务团队的级联数据
  const [crmGroupData, setCrmGroupData] = useState<any>([])
  // 是否需要内容协助的标识
  const [contentAssist, setContentAssist] = useState<number>(0)
  // const [ totleCountList, setTotleCountList ] = useState(0)
  const [pagination, setPagination] = useState({
    pageSize: 20,
    total: 0,
    current: 1,
  });
  const handlePageChange = (page: number, extraParams: any) => {
    setPagination(
      Object.assign(pagination, {
        current: page,
      })
    );
    getTableList({
      ...extraParams,
      pageNum: String(page),
    });
  };
  const [searchData, setSearchData] = useState<any>({
    size: pagination.pageSize,
  });
  // 设置默认媒介采买人
  const [mediaBuyerId, setMediaBuyerId] = useState<number>();
  const [defaultLabel, setDefaultLabel] = useState<string[]>([""]);
  const { firstDay, lastDay } = getMonthStartEnd();
  const [defaultFlag, setDefaultFlag] = useState(false);
  const { roleInfo = [], did, fid, id } = globalData?.user?.userInfo || {};
  const defaultRole = [
    "sign_d_leader",
    "sign_f_leader",
    "sign_ordinary_member",
  ];
  const setDefaultMediaBuyerId = () => {
    try {
      // const initDefaultLabel = ["finishTimeStart", "finishTimeEnd"];
      // setDefaultLabel(initDefaultLabel);
      if (did === 0) return false;
      roleInfo.forEach((item: any) => {
        if (defaultRole.includes(item.code)) {
          if (item.code === defaultRole[0]) {
            setMediaBuyerId(did);
            // setDefaultLabel("signGroupId");
            setDefaultLabel(["signGroupId"]);
            throw item.code;
          }
          if (item.code === defaultRole[1]) {
            setMediaBuyerId(fid);
            // setDefaultLabel("signTeamId");
            setDefaultLabel(["signTeamId"]);
            throw item.code;
          }
          if (item.code === defaultRole[2]) {
            setMediaBuyerId(id);
            // setDefaultLabel("signUserId");
            setDefaultLabel(["signUserId"]);
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
  const handlerSignGroupToCascaderData = (data: any) => {
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
        resultItem.children = handlerSignGroupToCascaderData(childOrgList);
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
  function handlerDatePicker(
    value: any,
    format = "YYYY-MM-DD"
  ): HandlerFilterResType {
    let showValue = "";
    let sendParams: string | string[] = "";
    const formatTime = (item: any) => item.format(format);

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

  // 处理单个选项清除
  const closeFilterTagItem = (key: string) => {
    if (!key) {
      return;
    }
    if (key === "signGroup" || key === "finishTime") {
      setCreateFlag(true);
    }
    const cloneSearchData = {
      ...searchData,
    };

    delete cloneSearchData[key];

    setSearchData(cloneSearchData);
  };

  // 获取账号列表
  const getAccountInfo = (platIds: string[]) => {
    $findAccountLinkage({
      platIds,
    }).then(res => {
      const list: SearchGroupConfigItemType[] = cloneDeep(
        searchConfig as SearchGroupConfigItemType[]
      );

      setSearchConfigItemInfoByKey(list, "accountName", res || []);
      setSearchConfig(list);
    });
  };

  // 重置搜索 账号列表
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
        try {
          resetAccountInfo();
        } catch (err) {
          console.info(err, "错误信息");
        }
      }

      delete cloneData.accountName;
    }
    setSearchData(cloneData);
  };

  // 清空搜索
  const clearFilter = () => {
    setCreateFlag(true);
    setSearchData({
      contentAssist,
      determined: searchData.determined,
    });
  };

  // 获取搜索参数
  const getSearchParmas = () => {
    // 处理组信息
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

    // 表单筛选数据
    const { signGroup, crmGroup } = searchData;

    // 参数结果
    const result: {
      [prop: string]: any;
    } = {};

    // 设置页码
    result.pageNum = pagination.current;

    Object.keys(searchData).forEach(searchDataKey => {
      const currentConfig = configMap[searchDataKey];
      const { type, key } = currentConfig || {};

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
          searchData[searchDataKey],
          key === "monthMoney" ? "YYYY-MM" : "YYYY-MM-DD"
        ).sendParams;
        result[
          `${searchDataKey}Start`
        ] = `${start}${
          ["finishTime"].indexOf(searchDataKey) > -1
            ? " 00:00:00"
            : ""
        }`;
        result[`${searchDataKey}End`] = `${end}${
          ["finishTime"].indexOf(searchDataKey) > -1
            ? " 23:59:59"
            : ""
        }`;
      }
      if (searchDataKey === "signGroup") {
        // 处理签约团队信息
        if (signGroup && signGroup.length) {
          const { sendParams: signGroupSendParams } = handlercascaderData(
            signGroup,
            configMap?.signGroup?.data
          );
          const { groupId, teamId, userId } = getGroupInfo(signGroupSendParams);

          if (groupId) {
            result.signGroupId = groupId;
          }
          if (teamId) {
            result.signTeamId = teamId;
          }
          if (userId) {
            result.signUserId = userId;
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
    });

    if (result.accountName) {
      // 平台单选，账号传递accountId;平台多选，账号传递accountName
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
    //       : mediaBuyerId;
    // }
    if (defaultLabel.length) {
      defaultLabel.forEach(item => {
        // if (item === "finishTimeStart") {
        //   params[item] = params[item] || createFlag ? params[item] : firstDay;
        // } else if (item === "finishTimeEnd") {
        //   params[item] = params[item] || createFlag ? params[item] : lastDay;
        // }
        params[item] = params[item] || createFlag ? params[item] : mediaBuyerId;
      });
    }
  };

  // 获取订单列表
  const getTableList = (extraParams: OrderListRequest = {}) => {
    const params = Object.assign(getSearchParmas(), extraParams);
    if (!defaultFlag) {
      formatDefaultVal(params);
    }
    setListLoading(true);
    $getCooperateOrderList({
      ...params,
    })
      .then(res => {
        const {
          cooperOrderList,
          orderActualIncomeSum = 0,
          total,
        } = res || {};
        setCooperateOrderList([...(cooperOrderList || [])]);
        setPriceBoxList([
          {
            title: "工单实际营收",
            value: orderActualIncomeSum,
            // tip: "当前列表中全部订单的工单实际营收之和",
          },
        ]);
        setPagination(
          Object.assign(pagination, {
            total: Number(total || 0),
          })
        );
        setListLoading(false);
      })
      .catch(() => {
        setListLoading(false);
      });
  }

  // 点击搜索按钮
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
    $exportCooperateOrderList({
      ...params,
    });
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

  // 获取品牌名称数据
  const getBrandList = async () => {
    try {
      const res = await $getBrandList();
      if (res) {
        setSeachConfigValue("brandId", res);
      }
    } catch (e: any) {
      message.error(e?.message)
    }
  };

  // 获取商务团队数据
  const getOrgInfo = async () => {
    try {
      const { orgInfoConditionVOList } = await $getOrgInfo();
      if (orgInfoConditionVOList) {
        const formatSignGroupData = handlerSignGroupToCascaderData(orgInfoConditionVOList);
        setSeachConfigValue("crmGroup", formatSignGroupData);
        setCrmGroupData(formatSignGroupData)
      }
    } catch (e: any) {
      message.error(e?.message)
    }
  };

  // 获取收付款类型数据和订单类型数据
  const getByDictType = async () => {
    try {
      const { perform_payment_type: performPaymentType, cooper_order_project_type: cooperOrderProjectType }: any =
        await $getByDictType({
          dictTypes: ["perform_payment_type", "cooper_order_project_type"],
        });
      if (performPaymentType) {
        setSeachConfigValue("paymentType", performPaymentType || []);
        setPerformPaymentType(performPaymentType || []);
      }
  
      if (cooperOrderProjectType) {
        setSeachConfigValue("projectType", cooperOrderProjectType || []);
        setCooperOrderProjectType(cooperOrderProjectType || []);
      }
    } catch (e: any) {
      message.error(e?.message)
    }
  };

  // 获取平台和账号数据
  const getplatOrAccountData = async() => {
    try {
      const { plats, userAccountList } = await $getAccountCondition()
      if (plats) {
        setSeachConfigValue("platIds", plats || []);
        setPlatData(plats || [])
      }
  
      if (userAccountList) {
        setSeachConfigValue("accountName", userAccountList || []);
        setAllAccountList(userAccountList || []);
      }
    } catch (e: any) {
      message.error(e?.message)
    }
  }

  // 获取签约团队的数据
  const getSignCondition = async() => {
    try {
      const { orgInfoConditionVOList, defaultValues } = await $getSignCondition()
      if (defaultValues && defaultValues.length) {
        searchData.signGroup = defaultValues;
        // setSearchData(searchData);
      } else {
        setDefaultFlag(true);
      }
  
      if (orgInfoConditionVOList) {
        const formatSignGroupData = handlerSignGroupToCascaderData(orgInfoConditionVOList);
        setSeachConfigValue("signGroup", formatSignGroupData);
      }
    } catch (e: any) {
      message.error(e?.message)
    }
  }

  // 处理是否显示需要内容协助
  const handleShowContentAssist = (e: any) => {
    const value = Number(e.target.checked);
    setContentAssist(value);
    searchData.contentAssist = value;
    setSearchData(searchData);
    const params: any = {};
    params.contentAssist = value;
    getTableList({
      ...params,
    });
  };

  // 添加合作订单
  const handleAddCoopOrder = () => {
    setAddCoopOrderType('add')
    setShowAddOrderModal(true)
  }

  useEffect(() => {
    getBrandList();
    getOrgInfo();
    getByDictType();
    getplatOrAccountData()
    getSignCondition();
    console.info("默认的config", searchConfig);
  }, []);

  useEffect(() => {
    searchData.finishTime = [moment(firstDay), moment(lastDay)];

    if (mediaBuyerId === 0 || mediaBuyerId) {
      getTableList();
    }

    if (roleInfo && roleInfo.length) {
      setDefaultMediaBuyerId();
    }
  }, [mediaBuyerId, roleInfo]);

  // useEffect(() => {
  //   if (roleInfo && roleInfo.length) {
  //     setDefaultMediaBuyerId();
  //   }
  // }, [roleInfo]);

  // 不在对应组织的用户拥有角色。不传默认值处理
  useEffect(() => {
    if (defaultFlag && defaultLabel.length) {
      onSearch();
    }
  }, [defaultFlag]);

  return (
    <div>
      {searchConfig.length && (
        <Search
          searchData={searchData}
          config={searchConfig}
          onChange={onSearchData}
          showCondition
          onClearFilter={clearFilter}
          onCloseFilterTagItem={closeFilterTagItem}
          onExport={
            $permission("signed_order_manage_export") ? onExport : undefined
          }
          onSearch={onSearch}
        />
      )}

      <div className={styles.checkboxWrap}>
        <Checkbox
          onChange={handleShowContentAssist}
        >
          需要内容协助
        </Checkbox>
      </div>


      <Spin spinning={listLoading}>
        {
          $permission('add_coop_order') ? (
            <div className={styles.btnWraps}>
              <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAddCoopOrder}>添加合作订单</Button>
            </div>
          ) : (
            ""
          )
        }

        <Card bordered={false} size="small">
          <PriceBox list={priceBoxList} />
        </Card>

        <Card bordered={false} size="small">
          <TableComponent
            data={cooperateOrderList}
            pagination={pagination}
            performPaymentType={performPaymentType}
            handlePageChange={handlePageChange}
            searchData={searchData}
            setSearchData={setSearchData}
            onGetList={getTableList}
            setAddCoopOrderType={setAddCoopOrderType}
            setCurCooperOrderId={setCurCooperOrderId}
            setShowAddOrderModal={setShowAddOrderModal}
            // getTableList={getTableList}
            // getSearchParmas={getSearchParmas}
          />
        </Card>
      </Spin>
          
      {/* 添加合作订单弹窗 */}
      {
        showAddOrderModal && (
          <AddCoopOrderModal 
            type={addCoopOrderType}
            show={showAddOrderModal}
            platData={platData}
            performPaymentType={performPaymentType}
            cooperOrderProjectType={cooperOrderProjectType}
            crmGroupData={crmGroupData}
            cooperOrderId={curCooperOrderId}
            onGetList={getTableList}
            onClose={() => setShowAddOrderModal(false)}
          />
        )
      }
    </div>
  );
};

export default CooperateOrderManagementList;

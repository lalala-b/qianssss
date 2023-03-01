/* eslint-disable camelcase */
import { useState, useEffect } from "react";
import qs from "qs";
import moment from "moment";
import { Spin, Table, Button, message, ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import type { ColumnsType } from "antd/lib/table";
import Search, { SearchGroupConfigItemType } from "src/components/Search";
import IconTip from "src/components/IconTip";
import { $getBelongOrgTree } from "src/api/work";
import {
  $getBusinessOppoFollowersWithDefUser,
  $getByDictType,
  chargerListType,
  BussinessOpportunityDetailResType,
  $getBussinessOpportunityDetail,
  $checkChargeCanEditAndAdd,
} from "src/api/business";
import {
  $getSpecialManageList,
  GetSpecialManageListResItemType,
} from "src/api/specialCharge";
import { getUrlQuery } from "src/utils/getUrlQuery";
import SpecialPaymentDialog from "../NewBusinessOpportunity/SpecialPaymentDialog";

const SpecialPaymentManagement = () => {
  const [searchData, setSearchData] = useState<any>({
    pageNum: 1,
    size: 20,
  });
  const [searchConfig, setSearchConfig] = useState<SearchGroupConfigItemType[]>(
    [
      {
        label: "团队筛选",
        config: [
          {
            type: "cascader",
            key: "create",
            data: [],
            conf: {
              expandTrigger: "hover",
              changeOnSelect: true,
              placeholder: "商务团队/小组/创建人",
            },
          },
          {
            type: "cascader",
            key: "relatedGroupId",
            data: [],
            conf: {
              expandTrigger: "hover",
              placeholder: "选择和此收支相关的团队",
            },
          },
          {
            type: "select",
            key: "createUserId",
            data: [],
            conf: {
              placeholder: "创作者",
              labelInValue: true,
            },
            optionLabelKey: "orgName",
            optionValKey: "id",
          },
        ],
      },
      {
        label: "订单筛选",
        config: [
          {
            type: "select",
            key: "businessType",
            data: [],
            conf: {
              placeholder: "商单类型",
              // labelInValue: true,
            },
            optionLabelKey: "dictLabel",
            optionValKey: "dictValue",
          },
          {
            type: "select",
            key: "finishStatus",
            data: [
              { id: 10, name: "已完成" },
              { id: 20, name: "未完成" },
            ],
            conf: {
              placeholder: "完成状态",
              labelInValue: true,
            },
            optionLabelKey: "name",
            optionValKey: "id",
          },
          {
            type: "select",
            key: "chargeType",
            data: [],
            conf: {
              placeholder: "收支类型",
              labelInValue: true,
            },
            optionLabelKey: "dictLabel",
            optionValKey: "dictValue",
          },
          {
            type: "input",
            key: "opNo",
            data: [],
            conf: { placeholder: "商机号" },
          },
          {
            type: "input",
            key: "busOrderNo",
            data: [],
            conf: { placeholder: "商单号" },
          },
          {
            type: "input",
            key: "chargeNo",
            data: [],
            conf: { placeholder: "特殊收支ID" },
          },
        ],
      },
      {
        label: "时间筛选",
        config: [
          {
            type: "rangeDatePicker",
            key: "pactFinish",
            label: "履约完成时间",
            data: [],
            conf: {
              // hasRanges: true,
              placeholder: ["开始时间", "结束时间"],
            },
          },
          {
            type: "rangeDatePicker",
            key: "orderTime",
            label: "商单成单时间",
            data: [],
            conf: {
              // hasRanges: true,
              placeholder: ["开始时间", "结束时间"],
            },
          },
          {
            type: "rangeDatePicker",
            key: "performanceMonth",
            label: "绩效月",
            data: [],
            conf: {
              // hasRanges: true,
              picker: "month",
              placeholder: ["开始时间", "结束时间"],
            },
          },
          {
            type: "rangeDatePicker",
            key: "moneyArrivalTime",
            label: "到款时间",
            data: [],
            conf: {
              // hasRanges: true,
              placeholder: ["开始时间", "结束时间"],
            },
          },
        ],
      },
    ]
  );
  const [orgList, setOrgList] = useState<chargerListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [tableList, setTableList] = useState<GetSpecialManageListResItemType[]>(
    []
  );
  const [currentOpId, setCurrentOpId] = useState(0);
  const [specialType, setSpecialType] = useState("view");
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [isFinance, setIsFinance] = useState(false);
  const [chargeId, setChargeId] = useState(0);
  const [opDetail, setOpDetail] = useState<BussinessOpportunityDetailResType>();

  const formatParams = (params: any) => {
    const newParams = { ...params };
    if (params.pactFinish) {
      newParams.pactFinishBegin = `${moment(params.pactFinish[0]).format(
        "YYYY-MM-DD"
      )} 00:00:00`;
      newParams.pactFinishEnd = `${moment(params.pactFinish[1]).format(
        "YYYY-MM-DD"
      )} 23:59:59`;
    }

    if (params.orderTime) {
      newParams.orderTimeBegin = `${moment(params.orderTime[0]).format(
        "YYYY-MM-DD"
      )} 00:00:00`;
      newParams.orderTimeEnd = `${moment(params.orderTime[1]).format(
        "YYYY-MM-DD"
      )} 23:59:59`;
    }

    if (params.performanceMonth) {
      newParams.performanceMonthBegin = `${moment(
        params.performanceMonth[0]
      ).format("YYYY-MM")}`;
      newParams.performanceMonthEnd = `${moment(
        params.performanceMonth[1]
      ).format("YYYY-MM")}`;
    }

    if (params.moneyArrivalTime) {
      newParams.moneyArrivalTimeBegin = `${moment(
        params.moneyArrivalTime[0]
      ).format("YYYY-MM-DD")} 00:00:00`;
      newParams.moneyArrivalTimeEnd = `${moment(
        params.moneyArrivalTime[1]
      ).format("YYYY-MM-DD")} 23:59:59`;
    }

    delete newParams.pactFinish;
    delete newParams.orderTime;
    delete newParams.performanceMonth;
    delete newParams.moneyArrivalTime;

    const getFlatList = (arr: any) => {
      const newArr: any[] = [];
      arr.forEach((item: any) => {
        newArr.push(item);
        if ((item.childOrgList || []).length) {
          newArr.push(getFlatList(item.childOrgList));
        }
      });

      return newArr;
    };

    if (newParams.create) {
      const flatOrgList = getFlatList(orgList).flat(Infinity);

      const item = flatOrgList.find(
        item => +item.id === newParams.create[newParams.create.length - 1]
      );

      if (item.userFlag) {
        newParams.createId = item.id;
      } else {
        newParams.createGroupId = item.id;
      }
    }

    if (newParams.relatedGroupId) {
      newParams.relatedGroupId =
        newParams.relatedGroupId[newParams.relatedGroupId.length - 1];
    }

    Object.keys(newParams).forEach(item => {
      if (
        Object.prototype.toString.call(newParams[item]) === "[object Object]"
      ) {
        newParams[item] = newParams[item].value;
      }
    });

    return newParams;
  };

  const getList = async (data?: any) => {
    try {
      const params = {
        ...searchData,
        ...data,
        isExport: 0,
      };

      setLoading(true);
      const { total, data: list } = await $getSpecialManageList(
        formatParams(params)
      );
      setLoading(false);
      setTotal(total || 0);
      setTableList(list || []);
    } catch (e) {
      setLoading(false);
      setTotal(0);
      setTableList([]);
    }
  };

  const handleExport = async () => {
    const params = {
      ...searchData,
      isExport: 1,
    };

    window.open(
      `/api/qp/business/opportunity/special/charge/list?${qs.stringify(
        formatParams(params)
      )}`,
      "_blank"
    );
  };

  const getBussinessOpportunityDetail = async (id: number) => {
    try {
      setLoading(true);
      const res = await $getBussinessOpportunityDetail({ id });
      setOpDetail(res);
      setLoading(false);
      setShowSpecialModal(true);
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const handleEdit = async (item: GetSpecialManageListResItemType) => {
    const { opId, isFinance, id } = item;

    try {
      setLoading(true);
      await $checkChargeCanEditAndAdd({ opId: Number(opId), editType: 2 });
      setChargeId(id);
      setCurrentOpId(opId);
      setIsFinance(!!isFinance);
      setLoading(false);
      setSpecialType("edit");
      getBussinessOpportunityDetail(opId);
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const handleView = (item: GetSpecialManageListResItemType) => {
    const { opId, isFinance, id } = item;
    setChargeId(id);
    setCurrentOpId(opId);
    setIsFinance(!!isFinance);
    getBussinessOpportunityDetail(opId);
    setSpecialType("view");
  };

  const COLUMNS = [
    {
      title: "商单类型",
      dataIndex: "businessTypeDesc",
      width: 110,
      key: "businessTypeDesc",
      render: (_: string) => _ || "--",
    },
    {
      title: "收支类型",
      dataIndex: "chargeTypeDesc",
      width: 110,
      key: "chargeTypeDesc",
      render: (_: string) => _ || "--",
    },
    {
      title: "完成状态",
      dataIndex: "finishStatusDesc",
      width: 110,
      key: "finishStatusDesc",
      render: (_: string) => _ || "--",
    },
    {
      title: "品牌-产品",
      dataIndex: "brandProductName",
      width: 120,
      key: "brandProductName",
      render: (_: string) => _ || "--",
    },
    {
      title: "商务信息",
      dataIndex: "businessUserName",
      width: 140,
      key: "businessUserName",
      render: (_: string) => _ || "--",
    },
    {
      title: "相关团队",
      dataIndex: "relateGroup3thName",
      width: 120,
      key: "relateGroup3thName",
      render: (_: string) => _ || "--",
    },
    {
      title: (
        <>
          <span>商务实际营收</span>
          <IconTip content="商务实际营收=销售收入-对公返点-对私返点" />
        </>
      ),
      dataIndex: "businessRevenue",
      width: 140,
      key: "businessRevenue",
      render: (_: number) => `¥${_ || 0}`,
    },
    {
      title: (
        <>
          <span>绩效营收</span>
          <IconTip content="绩效营收=销售收入-达人分成成本-其他成本-对公返款-对私返款" />
        </>
      ),
      dataIndex: "performanceMoney",
      width: 140,
      key: "performanceMoney",
      render: (_: number) => `¥${_ || 0}`,
    },
    {
      title: "履约完成时间",
      dataIndex: "pactFinishDate",
      width: 120,
      key: "pactFinishDate",
      render: (_: string) => _ || "--",
    },
    {
      title: "商单成单时间",
      dataIndex: "orderTime",
      width: 120,
      key: "orderTime",
      render: (_: string) => _ || "--",
    },
    {
      title: "绩效月",
      dataIndex: "performanceMonth",
      width: 120,
      key: "performanceMonth",
      render: (_: string) => _ || "--",
    },
    {
      title: "到款时间",
      dataIndex: "moneyArrivalTime",
      width: 120,
      key: "moneyArrivalTime",
      render: (_: string) => _ || "--",
    },
    {
      title: "商机号",
      dataIndex: "opNo",
      width: 150,
      key: "opNo",
      render: (_: string) => _ || "--",
    },
    {
      title: "商单号",
      dataIndex: "busOrderNo",
      width: 150,
      key: "busOrderNo",
      render: (_: string) => _ || "--",
    },
    {
      title: "特殊收支号",
      dataIndex: "chargeNo",
      width: 150,
      key: "chargeNo",
      render: (_: string) => _ || "--",
    },
    {
      title: "操作",
      dataIndex: "id",
      width: 120,
      fixed: "right",
      key: "id",
      render: (_: number, record: GetSpecialManageListResItemType) => (
        <>
          {!!record.canEdit && (
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          <Button type="link" onClick={() => handleView(record)}>
            查看
          </Button>
        </>
      ),
    },
  ];

  const handleChangeSearchData = (data: any) => {
    setSearchData(data);
  };

  const handleSearch = () => {
    const newSearchData = { ...searchData };
    newSearchData.pageNum = 1;
    setSearchData(newSearchData);
    getList({ ...newSearchData });
  };

  const handleChangePage = (pageNum: number, size: number) => {
    const newSearchData = { ...searchData };
    newSearchData.pageNum = pageNum;
    newSearchData.size = size;
    setSearchData(newSearchData);
    getList({ ...newSearchData });
  };

  const setConfig = (index: number, key: string, value: any) => {
    const newSearchConfig: SearchGroupConfigItemType[] = [...searchConfig];
    const configIndex = newSearchConfig[index].config.findIndex(
      item => item.key === key
    );
    newSearchConfig[index].config[configIndex].data = value;
    setSearchConfig(newSearchConfig);
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

  const getBusinessOppoFollowersWithDefUser = async () => {
    const { orgList } = await $getBusinessOppoFollowersWithDefUser();
    setOrgList(orgList || []);

    const businessOppoFollowersListTemp = handlerOrgInfoCascaderData(
      orgList,
      "orgName",
      "id",
      "childOrgList"
    );

    setConfig(0, "create", businessOppoFollowersListTemp);
  };

  const filterCreateUser = (children: any[]) => {
    const arr: any = [];
    children.forEach(item => {
      if (+item.userFlag === 1) {
        arr.push(item);
      }

      if (item.childOrgList) {
        arr.push(filterCreateUser(item.childOrgList));
      }
    });
    return arr;
  };

  const getBelongOrgTree = async () => {
    const res = await $getBelongOrgTree();
    setConfig(
      0,
      "relatedGroupId",
      res.map(item => {
        const newItem: any = { ...item };
        newItem.value = item.id;
        newItem.label = item.orgName;
        newItem.children = newItem.childOrgList
          .map((it: any) => {
            if (+it.depthLayer === 3 && +it.userFlag === 0) {
              const newIt = { ...it };
              newIt.value = it.id;
              newIt.label = it.orgName;
              return newIt;
            }
            return "";
          })
          .filter((item: any) => item);
        return newItem;
      })
    );

    const arr = filterCreateUser(res);
    setConfig(0, "createUserId", arr.flat(Infinity));
  };

  const getByDictType = async () => {
    const { bus_order_type, oppotunity_special_charge_type } =
      await $getByDictType({
        dictTypes: ["bus_order_type", "oppotunity_special_charge_type"],
      });
    setConfig(1, "businessType", bus_order_type);
    setConfig(1, "chargeType", oppotunity_special_charge_type);
  };

  useEffect(() => {
    getBusinessOppoFollowersWithDefUser();
    getBelongOrgTree();
    getByDictType();

    const urlQuery = getUrlQuery();

    if (urlQuery.busOrderNo) {
      setSearchData({ ...searchData, busOrderNo: urlQuery.busOrderNo });
      getList({ busOrderNo: urlQuery.busOrderNo });
      return;
    }

    getList();
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <div className="qp-wrapper">
        <Search
          searchData={searchData}
          config={searchConfig}
          showCondition
          onChange={handleChangeSearchData}
          onSearch={handleSearch}
          onExport={handleExport}
        />
      </div>
      <div className="qp-wrapper">
        <Spin spinning={loading}>
          <Table
            dataSource={tableList}
            columns={COLUMNS as ColumnsType<GetSpecialManageListResItemType>}
            rowKey="id"
            scroll={{ x: "max-content" }}
            sticky={{
              offsetHeader: -24,
            }}
            pagination={{
              pageSize: searchData.size,
              current: searchData.pageNum,
              total,
              showQuickJumper: true,
              showSizeChanger: false,
              showTotal: total => `总共${total}条`,
              // onShowSizeChange: (cur, size) => handlePageSizeChange(size),
              onChange: (pageNum, size) => handleChangePage(pageNum, size),
            }}
          />
        </Spin>
      </div>

      <SpecialPaymentDialog
        specialType={specialType}
        show={showSpecialModal}
        chargeId={chargeId}
        opId={currentOpId}
        opDetail={opDetail}
        isFinance={isFinance}
        onClose={() => setShowSpecialModal(false)}
        onChangeSpecialType={(val: string) => setSpecialType(val)}
        onGetList={getList}
      />
    </ConfigProvider>
  );
};

export default SpecialPaymentManagement;

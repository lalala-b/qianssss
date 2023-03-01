/* eslint-disable css-modules/no-unused-class */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
// import cs from "classnames";
import moment from "moment";
import { ConfigProvider, Table, Button, Tag, message } from "antd";
import type { ColumnsType } from "antd/lib/table";
import zhCN from "antd/es/locale/zh_CN";
import Search, { SearchConfigItemPropsType } from "src/components/Search";
import {
  $getOaApplyRecordList,
  GetOaApplyRecordListParamsType,
  GetOaApplyRecordListItemResType,
  $getApplyUserList,
} from "src/api/oaApplyRecord";
import sendPerf from 'src/utils/lego';
// import styles from "./OaApplyRecord.scss";

const APPLY_STATUS = [
  {
    value: 0,
    label: "审批中",
  },
  {
    value: 1,
    label: "已通过",
  },
  {
    value: 2,
    label: "被驳回",
  },
];

const APPLY_TYPE = [
  {
    value: 0,
    label: "广告费及新媒体付款审批",
  },
  {
    value: 1,
    label: "发票申请",
  },
];

const APPLY_COLOR = ["", "#87d068", "#f50"];

const OaApplyRecord = () => {
  const history = useNavigate();

  const [searchData, setSearchData] = useState<GetOaApplyRecordListParamsType>({
    pageNum: 1,
    size: 20,
  });
  const [searchConfig, setSearchConfig] = useState<SearchConfigItemPropsType[]>(
    [
      {
        type: "select",
        key: "applyType",
        data: APPLY_TYPE,
        conf: { placeholder: "流程类型" },
        optionLabelKey: "label",
        optionValKey: "value",
      },
      {
        type: "select",
        key: "applyStatus",
        data: APPLY_STATUS,
        conf: { placeholder: "审批状态", showSearch: false },
        optionLabelKey: "label",
        optionValKey: "value",
      },
      {
        type: "input",
        key: "applyContent",
        data: [],
        conf: { placeholder: "关键字" },
      },
      {
        type: "input",
        key: "applyNo",
        data: [],
        conf: { placeholder: "流程编号" },
      },
      {
        type: "select",
        key: "applyUserId",
        data: [],
        conf: { placeholder: "申请人" },
        optionLabelKey: "name",
        optionValKey: "id",
      },
      {
        type: "rangeDatePicker",
        key: "createTime",
        label: "发起时间",
        data: [],
        conf: {
          placeholder: ["开始时间", "结束时间"],
        },
      },
    ]
  );
  const [tableList, setTableList] = useState<GetOaApplyRecordListItemResType[]>(
    []
  );
  const [totalNum, setTotalNum] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const getOaApplyRecordList = async (
    params?: GetOaApplyRecordListParamsType
  ) => {
    try {
      setTableLoading(true);
      const par = {
        ...searchData,
        ...(params || {}),
      };

      if (searchData.createTime) {
        par.createTimeBegin = `${moment(searchData.createTime[0]).format(
          "YYYY-MM-DD"
        )} 00:00:00`;
        par.createTimeEnd = `${moment(searchData.createTime[1]).format(
          "YYYY-MM-DD"
        )} 23:59:59`;
      } else {
        par.createTimeBegin = "";
        par.createTimeEnd = "";
      }

      delete par.createTime;

      const { total, list } = await $getOaApplyRecordList(par);
      setTableLoading(false);
      setTotalNum(total || 0);
      setTableList(list || []);
      sendPerf()
    } catch (e: any) {
      setTableLoading(false);
      setTotalNum(0);
      setTableList([]);
      message.error(e.message);
    }
  };

  const getApplyUserList = async () => {
    const res = await $getApplyUserList();
    const newSearchConfig = [...searchConfig];
    const index = newSearchConfig.findIndex(item => item.key === "applyUserId");
    newSearchConfig[index].data = res;
    setSearchConfig(newSearchConfig);
  };

  const handleSearch = () => {
    setSearchData({
      ...searchData,
      pageNum: 1,
    });
    getOaApplyRecordList({ pageNum: 1 });
  };

  const handleGoDetail = (row: GetOaApplyRecordListItemResType) => {
    const { applyType, applyNo, instanceId } = row;
    let url = "";
    // 去广告详情
    if (+applyType === 0) {
      url = "/qp/media-payment-approval";
    } else {
      url = "/qp/invoice-application-approval";
    }
    history(`${url}?businessKey=${applyNo}&instanceId=${instanceId}`);

    // window.open(
    //   `${
    //     window.location.origin + window.location.pathname
    //   }#/qp/media-payment-approval?businessKey=${businessKey}&instanceId=${instanceId}`,
    //   "_blank"
    // );
  };

  const COLUMNS = [
    {
      title: "序号",
      dataIndex: "index",
      width: 70,
      key: "index",
      render: (_: any, __: any, index: number) => <div>{index + 1}</div>,
    },
    {
      title: "发起时间",
      dataIndex: "createTime",
      width: 140,
      key: "createTime",
      render: (time: string) => <div>{time || "--"}</div>,
    },
    {
      title: "流程编号",
      dataIndex: "applyNo",
      width: 220,
      key: "applyNo",
      render: (applyNo: string) => <div>{applyNo || "--"}</div>,
    },
    {
      title: "流程类型",
      dataIndex: "applyTypeDesc",
      width: 180,
      key: "applyTypeDesc",
      render: (applyTypeDesc: string) => <span>{applyTypeDesc || "--"}</span>,
    },
    {
      title: "流程内容",
      dataIndex: "applyContent",
      width: 180,
      key: "applyContent",
      render: (applyContent: string) => <span>{applyContent || "--"}</span>,
    },
    {
      title: "申请人",
      dataIndex: "applyUser",
      width: 140,
      key: "applyUser",
      render: (applyUser: string) => <span>{applyUser || "--"}</span>,
    },
    {
      title: "办结时间",
      dataIndex: "overTime",
      width: 140,
      key: "overTime",
      render: (overTime: string) => <span>{overTime || "--"}</span>,
    },
    {
      title: "审批状态",
      dataIndex: "applyStatusDesc",
      width: 140,
      key: "applyStatusDesc",
      render: (applyStatusDesc: string, record: any) => (
        <Tag color={APPLY_COLOR[record.applyStatus]}>
          {applyStatusDesc || "--"}
        </Tag>
      ),
    },
    {
      title: "操作",
      dataIndex: "operation",
      width: 130,
      key: "operation",
      fixed: "right",
      render: (_: any, record: GetOaApplyRecordListItemResType) => (
        <Button type="link" onClick={() => handleGoDetail(record)}>
          查看
        </Button>
      ),
    },
  ];

  useEffect(() => {
    getApplyUserList();
    getOaApplyRecordList();
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <div className="q-wrap">
        <Search
          searchData={searchData}
          onChange={setSearchData}
          config={searchConfig}
          onSearch={handleSearch}
        />
      </div>
      <div className="q-wrap m-t-24">
        <Table
          rowKey="id"
          dataSource={tableList}
          columns={
            COLUMNS.filter(item => Object.keys(item).length) as ColumnsType<any>
          }
          loading={tableLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            total: totalNum,
            current: searchData.pageNum,
            pageSize: searchData.size,
            showQuickJumper: true,
            showTotal: total => `总共${total}条`,
            onChange: (page: number) => {
              setSearchData({
                ...searchData,
                pageNum: page,
              });
              getOaApplyRecordList({ pageNum: page });
            },
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default OaApplyRecord;

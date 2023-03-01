/* eslint-disable css-modules/no-unused-class */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { message, Select, Table,Tooltip} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { $getRecommendList } from "src/api/taskManagement";
import { emptyFill } from "src/utils/number";
import AccountCard from "src/components/AccountCard/AccountCard";
import type {
  IReTableListType,
  OfficialPriceType,
} from "../TaskManagementType";

const OtherReAccounts: React.FC<{ pid: number | undefined }> = ({ pid }) => {
  const [iReTableList, setIReTableList] = useState<IReTableListType[]>();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: 20,
    total: 0,
    current: 1,
  });
  const [refereesList, setRefereesList] = useState<any>();
  const getRecommendList = (pagination?: any, taskFollower?: string) => {
    const params = {
      pid,
      recommendType: 0,
      taskFollower,
      size: 10,
      pageNum: 1,
    };
    if (pagination) {
      params.size = pagination.pageSize;
      params.pageNum = pagination.current;
    }
    setLoading(true);
    $getRecommendList(params)
      .then(res => {
        setLoading(false);
        const { list = [], users = [], total } = res;
        setIReTableList([...(list || [])]);
        setRefereesList(users || []);
        setPagination({ ...pagination, total: total || 0 });
      })
      .catch((e: any) => {
        setLoading(false);
        message.error(e.message);
      });
  };

  const columns = [
    {
      title: "账号名称",
      dataIndex: "accountName",
      key: "accountName",
      render: (text: any, row: IReTableListType) => (
        <>
          <AccountCard info={row} options={{ accountUrl: "indexUrl" }} />
        </>
      ),
    },
    {
      title: "官方报价",
      dataIndex: "officialPrice",
      key: "officialPrice",
      width: 160,
      render: (text: any, row: IReTableListType) => (
        <>
          {row.officialPrice &&
            row.officialPrice.map((item: OfficialPriceType) => (
              <div key={item.priceType}>
                <span>{item.priceType}:</span>
                <span>{item.priceVal ? `¥${item.priceVal}` : "--"}</span>
              </div>
            ))}
        </>
      ),
    },
    {
      title: "合作价格（售价）",
      dataIndex: "coPrice",
      key: "coPrice",
      width: 110,
      render: (text: any, row: IReTableListType) => (
        <>{row.coPrice ? `¥${row.coPrice}` : "--"}</>
      ),
    },
    {
      title: "档期",
      dataIndex: "coDate",
      key: "coDate",
      render: (text: any, row: IReTableListType) => (
        <div>{emptyFill(row.coDate)}</div>
      ),
    },
    {
      title: "推荐原因",
      dataIndex: "4+IR",
      key: "reason",
      width: 120,
      render: (text: any, row: IReTableListType) => (
        <div>{emptyFill(row.reason)}</div>
      ),
    },
    {
      title: "账号推荐人",
      dataIndex: "taskFollower",
      key: "taskFollower",
    },
    {
      title: (
        <>
          推荐状态
          <Tooltip title="只跟我们是否要推荐账号相关">
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: "rcStatusName",
      key: "rcStatusName",
    },
    {
      title: (
        <>
          合作状态
          <Tooltip title="只跟客户的合作意愿相关">
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: "coStatusName",
      key: "coStatusName",
    },
  ];
  const handlePageChange = (current: number, pageSize: number) => {
    const newPagination = { ...pagination, current, pageSize };
    setPagination(newPagination);
    getRecommendList(newPagination);
  };
  const handleRemPeople = (val: string) => {
    getRecommendList(pagination, val);
  };
  useEffect(() => {
    getRecommendList();
  }, []);
  return (
    <>
      <Select
        style={{ width: 120, marginBottom: 12 }}
        onChange={handleRemPeople}
        allowClear
        showSearch
      >
        {refereesList &&
          refereesList.map((item: any) => (
            <Select.Option key={item.userId} value={item?.userId}>
              {item?.name}
            </Select.Option>
          ))}
      </Select>
      <Table
        columns={columns}
        loading={loading}
        rowKey={record => record.accountId || Math.random()}
        dataSource={iReTableList}
        pagination={{
          ...pagination,
          defaultCurrent: 1,
          showTotal: total => `总共${total}条`,
          onChange: (currentPage, pageSize) =>
            handlePageChange(currentPage, pageSize),
        }}
      />
    </>
  );
};

export default OtherReAccounts;

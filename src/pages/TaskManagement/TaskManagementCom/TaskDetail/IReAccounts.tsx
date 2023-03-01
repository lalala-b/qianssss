/* eslint-disable no-use-before-define */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Table, Button, Popconfirm, message,Tooltip} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { $getRecommendList, $cancelRecommend } from "src/api/taskManagement";
import { emptyFill } from "src/utils/number";
import AccountCard from "src/components/AccountCard/AccountCard";
import type {
  IReTableListType,
  OfficialPriceType,
  ReAccountsPropsType,
} from "../TaskManagementType";

const IReAccounts: React.FC<ReAccountsPropsType> = ({
  pid,
  getList,
  charger = "",
}) => {
  const [iReTableList, setIReTableList] = useState<IReTableListType[]>();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: 20,
    total: 0,
    current: 1,
  });
  const handleWithdraw = (row: IReTableListType) => {
    setLoading(true);
    $cancelRecommend({ subTaskId: row.subTaskId })
      .then(() => {
        setLoading(false);
        getRecommendList();
        getList();
      })
      .catch(e => {
        setLoading(false);
        message.error(e.message);
      });
  };

  const getRecommendList = (pagination?: any) => {
    const params = {
      pid,
      recommendType: 1,
      size:10,
      pageNum:1,
    };
    if (pagination){
      params.size = pagination.pageSize
      params.pageNum = pagination.current
    }
    setLoading(true);
    $getRecommendList(params)
      .then(res => {
        setLoading(false);
        const { list = [],total } = res;
        setIReTableList(list||[]);
        setPagination({...pagination,total:total || 0});
      })
      .catch((e: any) => {
        setLoading(false);
        message.error(e.message);
      });
  };
  const handlePageChange = (current: number, pageSize: number) => {
    const newPagination = { ...pagination, current, pageSize }
    setPagination(newPagination);
    getRecommendList(newPagination);
  };
  useEffect(() => {
    getRecommendList();
  }, []);
  useEffect(() => {
    console.info("我已推荐iReTableList", iReTableList);
  }, [iReTableList]);

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
      width: 120,
      render: (text: any, row: IReTableListType) => (
        <div>{emptyFill(row.coDate)}</div>
      ),
    },
    {
      title: "备注",
      dataIndex: "reason",
      key: "reason",
      render: (text: any, row: IReTableListType) => (
        <div>{emptyFill(row.reason)}</div>
      ),
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
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (text: any, row: IReTableListType) => (
        // 当合作状态处于确认合作、暂不合作或者推荐状态处于撤回推荐时按钮不可见
        <>
          {[3, 4].includes(+row.coStatus) || +row.rcStatus === 8 ? (
            ""
          ) : (
            <Popconfirm
              title={
                <>
                  撤回已推荐的账号将有可能影响客户的印象，请先跟商机负责人（
                  {charger}）沟通确认后，再进行撤回
                  <div style={{ color: "red" }}>
                    如后续需恢复合作，需要重新推荐账号
                  </div>
                </>
              }
              onConfirm={() => handleWithdraw(row)}
              okText="继续"
              cancelText="取消"
            >
              <Button
                type="link"
                loading={loading}
                disabled={row.rcStatus === 8}
              >
                撤回推荐
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];
  return (
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
  );
};

export default IReAccounts;

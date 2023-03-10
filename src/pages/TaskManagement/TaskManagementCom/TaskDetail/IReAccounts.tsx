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
    console.info("????????????iReTableList", iReTableList);
  }, [iReTableList]);

  const columns = [
    {
      title: "????????????",
      dataIndex: "accountName",
      key: "accountName",
      render: (text: any, row: IReTableListType) => (
        <>
          <AccountCard info={row} options={{ accountUrl: "indexUrl" }} />
        </>
      ),
    },
    {
      title: "????????????",
      dataIndex: "officialPrice",
      key: "officialPrice",
      width: 160,
      render: (text: any, row: IReTableListType) => (
        <>
          {row.officialPrice &&
            row.officialPrice.map((item: OfficialPriceType) => (
              <div key={item.priceType}>
                <span>{item.priceType}:</span>
                <span>{item.priceVal ? `??${item.priceVal}` : "--"}</span>
              </div>
            ))}
        </>
      ),
    },
    {
      title: "????????????????????????",
      dataIndex: "coPrice",
      key: "coPrice",
      width: 110,
      render: (text: any, row: IReTableListType) => (
        <>{row.coPrice ? `??${row.coPrice}` : "--"}</>
      ),
    },
    {
      title: "??????",
      dataIndex: "coDate",
      key: "coDate",
      width: 120,
      render: (text: any, row: IReTableListType) => (
        <div>{emptyFill(row.coDate)}</div>
      ),
    },
    {
      title: "??????",
      dataIndex: "reason",
      key: "reason",
      render: (text: any, row: IReTableListType) => (
        <div>{emptyFill(row.reason)}</div>
      ),
    },
    {
      title: (
        <>
          ????????????
          <Tooltip title="???????????????????????????????????????">
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
          ????????????
          <Tooltip title="?????????????????????????????????">
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: "coStatusName",
      key: "coStatusName",
    },
    {
      title: "??????",
      key: "action",
      width: 100,
      render: (text: any, row: IReTableListType) => (
        // ??????????????????????????????????????????????????????????????????????????????????????????????????????
        <>
          {[3, 4].includes(+row.coStatus) || +row.rcStatus === 8 ? (
            ""
          ) : (
            <Popconfirm
              title={
                <>
                  ???????????????????????????????????????????????????????????????????????????????????????
                  {charger}????????????????????????????????????
                  <div style={{ color: "red" }}>
                    ???????????????????????????????????????????????????
                  </div>
                </>
              }
              onConfirm={() => handleWithdraw(row)}
              okText="??????"
              cancelText="??????"
            >
              <Button
                type="link"
                loading={loading}
                disabled={row.rcStatus === 8}
              >
                ????????????
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
        showTotal: total => `??????${total}???`,
        onChange: (currentPage, pageSize) =>
          handlePageChange(currentPage, pageSize),
      }}
    />
  );
};

export default IReAccounts;

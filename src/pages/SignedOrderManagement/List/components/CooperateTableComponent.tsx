/* eslint-disable jsx-a11y/anchor-has-content */
import { useState, useContext } from "react";
import { Table, Button, ConfigProvider, Empty, Modal, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AccountCard from "src/components/AccountCard/AccountCard";
import { $deleteCooperationOrder } from "src/api/signedOrder";
import type { GetByDictTypeResponseType } from "src/api/signedOrder";
import VideoInfo from "src/components/VideoInfo";
import zhCN from "antd/es/locale/zh_CN";
import { GlobalContext } from "src/contexts/global";
import OverPopover from "src/components/OverPopover/OverPopover";
import { OrderListResponse } from "@/api/types/projectId_3631";
import {
  projectType,
  contentAssistList,
} from "../config/cooperateSearch";

type SignOrderListType = OrderListResponse["signOrderList"];

type TableComponentPropType = {
  data?: SignOrderListType;
  performPaymentType: GetByDictTypeResponseType;
  pagination?: TablePaginationConfig;
  // getSearchParmas:any;
  // getTableList:any;
  handlePageChange: any;
  searchData: any;
  setSearchData: (params: any) => void;
  onGetList: () => void;
  setAddCoopOrderType: (params: string) => void;
  setCurCooperOrderId: (params: string) => void;
  setShowAddOrderModal: (params: boolean) => void;
};

const customizeRenderEmpty = () => <Empty description={<>暂无数据</>} />;

const TableComponent = ({
  data = [],
  performPaymentType = [],
  pagination = {},
  handlePageChange,
  searchData = {},
  setSearchData,
  onGetList,
  setAddCoopOrderType,
  setCurCooperOrderId,
  setShowAddOrderModal,
}:
TableComponentPropType) => {
  const { $permission } = window;

  const { globalData = {} } = useContext(GlobalContext);

  const { id } = globalData?.user?.userInfo || {};

  const [deleteOrderLoading, setDeleteOrderLoading] = useState<boolean>(false)

  const getConfigInfoById = (list: any[], id: string, prop = "value") =>
    list.find(item => item[prop] === id) || {};

  // 编辑订单信息
  const handleEditCoopOrder = (cooperOrderId: any) => {
    setAddCoopOrderType('edit')
    setShowAddOrderModal(true)
    setCurCooperOrderId(cooperOrderId)
  }

  // 查看订单信息
  const handleWatchCoopOrder = (cooperOrderId: any) => {
    setAddCoopOrderType('detail')
    setShowAddOrderModal(true)
    setCurCooperOrderId(cooperOrderId)
  }

  // 删除订单信息
  const handleDeleteCoopOrder = (cooperOrderId: any) => {
    Modal.confirm({
      content: '是否确认删除该合作订单信息',
      cancelText: '取消',
      okText: '确认',
      okButtonProps: {
        loading: deleteOrderLoading,
      },
      onOk: async() => {
        try {
          setDeleteOrderLoading(true)
          await $deleteCooperationOrder({
            cooperOrderId,
          })
          setDeleteOrderLoading(false)
          message.success('操作成功')
          onGetList()
        } catch (e: any) {
          message.error(e?.message)
          setDeleteOrderLoading(false)
        }
      },
    })
  }

  const columns: ColumnsType<any> = [
    {
      title: "工单号",
      dataIndex: "cooperOrderNo",
      width: 100,
      render(value: string) {
        return <span>{value || "--"}</span>;
      },
    },
    {
      title: "品牌名称",
      dataIndex: "brandName",
      width: 100,
      render(value: string) {
        return <span>{value || "--"}</span>;
      },
    },
    {
      title: "订单类型",
      dataIndex: "projectType",
      width: 100,
      render(value: number) {
        return (
          <span>
            {getConfigInfoById(projectType, String(value), "id")?.label || ""}
          </span>
        );
      },
    },
    {
      title: "订单归属",
      dataIndex: "signGroupName",
      width: 100,
      render(value: string, record: any) {
        return <span>
          {
            record.signGroupName || record.signTeamName ? 
            `${record.signGroupName}${record.signTeamName ? `-${record.signTeamName}` : ''}`
            : "--"
          }
        </span>;
      },
    },
    {
      title: "签约经纪人",
      dataIndex: "signUserName",
      width: 110,
      render(value: string) {
        return <span>{value || "--"}</span>;
      },
    },
    {
      title: "账号信息",
      dataIndex: "accountName",
      width: 200,
      render(value: unknown, record) {
        return <AccountCard info={record} />;
      },
    },
    {
      title: "档期",
      dataIndex: "finishTime",
      width: 120,
      render(value: string) {
        return <span>{value || "--"}</span>;
      },
    },
    {
      title: "订单流水",
      dataIndex: "orderMoney",
      width: 100,
      render(value: string) {
        return <span>{value || "--"}</span>;
      },
    },
    {
      title: "内容协助",
      dataIndex: "contentAssist",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(contentAssistList, String(value), "id")?.label ||
              ""}
          </span>
        );
      },
    },
    {
      title: "视频",
      dataIndex: "flowId",
      width: 180,
      render(value: any, record) {
        return (
          <>
            {value ? (
              <VideoInfo info={record} />
            ) : record.url ? (
              <OverPopover content={record.url} type="link"/>
            ) : (
              "暂无视频"
            )}
          </>
        );
      },
    },
    {
      title: "收付款类型",
      dataIndex: "paymentType",
      width: 110,
      render(value: number, record: any) {
        return (
          <div>
            <span>
              {getConfigInfoById(
                performPaymentType,
                String(record?.paymentType),
                "dictValue"
              )?.dictLabel || "--"}
            </span>
          </div>
        );
      },
    },
    {
      title: "收款状态",
      dataIndex: "collectionResult4View",
      width: 100,
      render(value: number) {
        return (
          <>
            {value ? +value === 1
                ? "已收款"
                : "未收款"
              : "--"}
          </>
        );
      },
    },
    {
      title: "付款状态",
      dataIndex: "paymentResult4View",
      width: 100,
      render(value: number) {
        return (
          <>
            {value ? +value === 1
                ? "已付款"
                : "未付款"
              : "--"}
          </>
        );
      },
    },
    {
      title: "绩效月",
      dataIndex: "monthMoney",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "视频发布时间",
      dataIndex: "addTime",
      width: 140,
      render(value: string) {
        return <>{!value || value === '0000-00-00 00:00:00' ? "--" : value}</>;
      },
    },
    {
      title: "操作",
      dataIndex: "",
      width: 100,
      key: "operation",
      fixed: "right",
      render(value: unknown, record: any) {
        return (
          <>
            {
              // 1. 支持订单的创建人编辑
              // 2. 支持签约团队团长和军长编辑
              $permission('delete_edit_coop_order') || record.signUserId === id ? (
                <Button
                  type="link"
                  onClick={() => handleEditCoopOrder(record.cooperOrderId)}
                >
                  编辑
                </Button>
              ) : (
                ""
              )
            }
            <Button
              type="link"
              onClick={() => handleWatchCoopOrder(record.cooperOrderId)}
            >
              查看
            </Button>
            {
              // 1. 支持订单的创建人删除
              // 2. 支持签约团队团长和军长删除
              $permission('delete_edit_coop_order') || record.signUserId === id ? (
                <Button
                  type="link"
                  danger
                  onClick={() => handleDeleteCoopOrder(record.cooperOrderId)}
                >
                  删除
                </Button>
              ) : (
                ""
              )
            }
          </>
        );
      },
    },
  ];

  const handleChangeSort = (
    pagination: TablePaginationConfig,
    __: any,
    sorter: any
  ) => {
    let params: { determined?: string } = {
      determined: `${sorter.order === "descend" ? `-` : ""}${sorter.field}`,
    };

    if (!sorter.order) {
      params = {
        determined: "",
      };
    }

    setSearchData(Object.assign(searchData, params))


    handlePageChange(pagination.current, {
      ...params,
    });
  };

  return (
    <div>
      <ConfigProvider locale={zhCN} renderEmpty={customizeRenderEmpty}>
        <Table
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -24,
          }}
          columns={columns}
          onChange={(pagation, _, sorter) =>
            handleChangeSort(pagation, _, sorter)
          }
          dataSource={data}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: false,
            showTotal: total => `总共${total}条`,
            ...pagination,
            // onChange: (pageNum, size) => handlePageChange(pageNum, size),
          }}
          locale={{
            filterEmptyText: "暂无数据",
          }}
          rowKey="cooperOrderNo"
        />
      </ConfigProvider>
    </div>
  );
};

export default TableComponent;

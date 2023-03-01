/* eslint-disable jsx-a11y/anchor-has-content */
import { Table, Button, ConfigProvider } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AccountCard from "src/components/AccountCard/AccountCard";
// import type { GetByDictTypeResponseType } from 'src/api/work'
import VideoInfo from "src/components/VideoInfo";
import zhCN from "antd/es/locale/zh_CN";
import OverPopover from "src/components/OverPopover/OverPopover";
import { OrderListResponse } from "@/api/types/projectId_3631";
import { orderTypeList, quotationTypeList } from "../config/search";
import STATUS_LIST_CONFIG from "../config/status";

type SignOrderListType = OrderListResponse["signOrderList"];
type TableComponentPropType = {
  data?: SignOrderListType;
  pagination?: TablePaginationConfig;
  // performPaymentType: GetByDictTypeResponseType
  handlePageChange: any;
  onChangeSort?: (params: { determined?: string }) => void;
};

const TableComponent = ({
  data = [],
  pagination = {},
  // performPaymentType=[],
  handlePageChange,
  onChangeSort,
}: TableComponentPropType) => {
  const getConfigInfoById = (list: any[], id: string, prop = "value") =>
    list.find(item => item[prop] === id) || {};
  const columns: ColumnsType<any> = [
    {
      title: "工单号",
      dataIndex: "orderNo",
      width: 100,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "品牌名称",
      dataIndex: "brandName",
      width: 100,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商单类型",
      dataIndex: "busOrderType",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(quotationTypeList, String(value), "value")
              ?.label || ""}
          </span>
        );
      },
    },
    {
      title: "订单类型",
      dataIndex: "orderType",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(orderTypeList, String(value), "id")?.label || ""}
          </span>
        );
      },
    },
    {
      title: "工单状态",
      dataIndex: "orderStatus",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(STATUS_LIST_CONFIG, String(value))?.label ||
              "--"}
          </span>
        );
      },
    },
    {
      title: "创建人",
      dataIndex: "businessUserName",
      width: 100,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商务团队",
      dataIndex: "businessGroupName",
      width: 100,
      render(value: unknown, record) {
        return (
          <>
            {record.businessGroupName && record.businessTeamName
              ? `${record.businessGroupName}-${record.businessTeamName}`
              : record.businessGroupName || record.businessTeamName || "--"}
          </>
        );
      },
    },
    {
      title: "执行人",
      dataIndex: "executorUserName",
      width: 100,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "订单归属",
      dataIndex: "orderBelong",
      width: 100,
      render(value) {
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
    // {
    //   title: "档期",
    //   dataIndex: "publishDate",
    //   width: 110,
    //   render(value) {
    //     return <>{value || "--"}</>;
    //   },
    // },
    {
      title: "工单创建时间",
      dataIndex: "createTime",
      width: 120,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    // {
    //   title: "合作价格（售价）",
    //   dataIndex: "coPrice",
    //   width: 100,
    // },
    // {
    //   title: "执行金额",
    //   dataIndex: "executeMoney",
    //   width: 100,
    // },
    {
      title: "工单实际营收",
      dataIndex: "orderActualIncome",
      width: 120,
      render(value) {
        return <>{value || 0}</>;
      },
    },
    {
      title: "销售收入",
      dataIndex: "salesIncome",
      width: 100,
      render(value) {
        return <>{value || 0}</>;
      },
    },
    {
      title: "销售成本",
      dataIndex: "costOfSales",
      width: 100,
      render(value) {
        return <>{value || 0}</>;
      },
    },
    {
      title: "绩效营收",
      dataIndex: "performanceMoney",
      width: 100,
      render(value) {
        return <>{value || 0}</>;
      },
    },
    {
      title: "毛利率",
      dataIndex: "grossProfitRate",
      width: 100,
      sorter: true,
      render(value) {
        return <span>{value === 0 || value ? `${value}%` : "--"}</span>;
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
      title: "下单价校验",
      dataIndex: "taskIdStatusDesc",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "成单日期",
      dataIndex: "orderTime",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "档期",
      dataIndex: "publishDate",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    // {
    //   title: "收付款状态",
    //   dataIndex: "paymentType",
    //   width: 100,
    //   render(value: number) {
    //     return (
    //       <div>
    //         {getConfigInfoById(performPaymentType, String(value), "dictValue")
    //           ?.dictLabel || "--"}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "收款状态",
    //   dataIndex: "paymentResult",
    //   width: 100,
    //   render(value) {
    //     return <>{value ? (+value === 1 ? "已收款" : "未收款") : "--"}</>;
    //   },
    // },
    // {
    //   title: "付款状态",
    //   dataIndex: "collectionResult",
    //   width: 100,
    //   render(value) {
    //     return <>{value ? (+value === 1 ? "已付款" : "未付款") : "--"}</>;
    //   },
    // },
    {
      title: "取消合作原因",
      dataIndex: "cancelReasonTypeDesc",
      width: 140,
      render(value: string) {
        return (
          <div>
            <OverPopover content={value} />
          </div>
        );
      },
    },
    {
      title: "特殊工单履约时间",
      dataIndex: "specialCompleteTime",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: '合作产品品类',
      dataIndex: "coCateDesc",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
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
          <div>
            <Button
              type="link"
              href={`#/qp/work-order-detail?id=${record?.orderNo}`}
              target="_blank"
            >
              查看
            </Button>
          </div>
        );
      },
    },
  ];

  const handleChangeSort = (
    _: any,
    __: any,
    sorter: any,
    { action }: { action: string }
  ) => {
    if (action !== "sort") return;
    let params: { determined?: string } = {
      determined: `${sorter.order === "descend" ? `-` : ""}${sorter.field}`,
    };

    if (!sorter.order) {
      params = {
        determined: "",
      };
    }

    onChangeSort?.(params);
  };

  return (
    <div>
      <ConfigProvider locale={zhCN}>
        <Table
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -24,
          }}
          columns={columns}
          dataSource={data}
          onChange={handleChangeSort}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: false,
            showTotal: total => `总共${total}条`,
            ...pagination,
            onChange: (pageNum, size) => handlePageChange(pageNum, size),
          }}
          locale={{
            filterEmptyText: "暂无数据",
          }}
          rowKey="orderNo"
        />
      </ConfigProvider>
    </div>
  );
};

export default TableComponent;

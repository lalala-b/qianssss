/* eslint-disable @typescript-eslint/no-unused-vars */
import { Table, Button, Tooltip, ConfigProvider, Popover } from "antd";
import type {
  ColumnsType,
  TableProps,
  TablePaginationConfig,
} from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "src/contexts/global";
import cn from "antd/es/locale/zh_CN";
import IconTip from "src/components/IconTip";
import { formateDate } from "src/utils/formateDate";
import styles from "./FinancialTable.scss";
import { quotationTypeList } from "../../config/search";
import { invoiceStatus } from "../../config/status";
import type { BusinessResultListType } from "../../config/InvoiceType";
import QuotationModal from "../QuotationModal/QuotationModal";
import ViewPhoto from "../ViewPhoto/ViewPhoto";
import EditInvoice from "../EditInvoice/EditInvoice";

type TableComponentPropType = {
  data: BusinessResultListType[];
  getTableList: (args: any) => void;
  pagination?: TablePaginationConfig;
  busOrderNo: any;
  detailMsgByOpId: any;
  confParams: any;
  searchData: any;
  setSearchData: (params: any) => void;
};
const TableComponent = ({
  data = [],
  pagination,
  getTableList,
  busOrderNo,
  detailMsgByOpId,
  confParams,
  searchData = {},
  setSearchData,
}: TableComponentPropType) => {
  const { $permission } = window;
  const { globalData = {} } = useContext(GlobalContext);
  const { id } = globalData?.user?.userInfo || {};
  const [opId, setOpId] = useState<string>("");
  const [determine, setDetermined] = useState<string>("");
  const [rowItem, setRowItem] = useState<any>();
  const [busOrderType, setBusOrderType] = useState<string>("");
  const formatBusinessType = (id: string) =>
    (quotationTypeList.find(item => item.value === id) || { label: "" }).label;
  const [isPhotoVisible, setPhotoVisible] = useState(false);
  const [isEditVisible, setEditVisible] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isQuotationVisible, setQuotationVisible] = useState(false);
  const [viewList, setViewList] = useState<string[]>();
  // 查看图片
  const showPhotoModal = (row: any) => {
    setViewList([...row.tradeScreenshots.split(",")]);
    setPhotoVisible(true);
  };
  const cancelPhotoModal = () => {
    setPhotoVisible(false);
  };
  // 查看商单详情
  const viewInfo = (record: any) => {
    // setEditVisible(true);
    let tabTypeStr = "";
    if (record.cusOfflineSupplement) {
      tabTypeStr += 1;
    }
    if (record.rebateCorporate) {
      tabTypeStr += 2;
    }
    if (record.rebatePrivate) {
      tabTypeStr += 3;
    }
    window.open(
      `${
        window.location.origin + window.location.pathname
      }#/qp/invoice-details?from=financial&businessOrderId=${
        record.busOrderId
      }&tabTypeStr=${tabTypeStr}`
    );
    // setIsEdit(true);
  };

  // 编辑商单详情
  // const editInfo = (record: any) => {
  //   setEditVisible(true);
  //   setRowItem(record);
  //   setIsEdit(false);
  // };
  const cancelEditModal = () => {
    setEditVisible(false);
  };
  // 查看报价单
  const handleShowQuotation = (record: any) => {
    setQuotationVisible(true);
    setBusOrderType(String(record.busOrderType));
    setOpId(record.opId);
  };
  const closeQuotationModal = () => {
    setQuotationVisible(false);
  };
  const formInvoiceStatus = (value: number) => {
    const item = invoiceStatus.find(item => item.val === value) || { text: "" };
    return item.text;
  };
  const handleChangeTable = (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: SorterResult<any>
  ) => {
    let der: any = "";
    if (sorter && sorter.field) {
      if (sorter.order === "descend") {
        der = `-${String(sorter.field)}`;
      } else if (sorter.order === "ascend") {
        der = sorter.field;
      }
      setDetermined(der);
    }

    setSearchData(Object.assign(searchData, {determined: der}))

    getTableList({
      determined: der,
      pageNum: pagination.current,
      size: pagination.pageSize,
      ...confParams,
    });
  };

  // useEffect(() => {
  //   if (busOrderNo) {
  //     setIsEdit(true);
  //     setEditVisible(true);
  //   }
  // }, [busOrderNo]);

  useEffect(() => {
    if (Object.keys(detailMsgByOpId || {}).length) {
      viewInfo(detailMsgByOpId);
    }
  }, [detailMsgByOpId]);

  const columns: ColumnsType<any> = [
    {
      title: "商单号",
      dataIndex: "busOrderNo",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商单状态",
      dataIndex: "busOrderStatus",
      width: 260,
      render(value, record) {
        return (
          <>
            {!!record.offlinePayCorTypeStr && (
              <p>
                线下应付（对公）：
                {record.offlinePayCorTypeStr}
              </p>
            )}

            {!!record.offlinePayPriTypeStr && (
              <p>
                线下应付（对私）：
                {record.offlinePayPriTypeStr}
              </p>
            )}

            {!!record.offlineRecTypeStr && (
              <p>
                线下应收：
                {record.offlineRecTypeStr}
              </p>
            )}

            {!!(
              !record.offlinePayCorTypeStr &&
              !record.offlinePayPriTypeStr &&
              !record.offlineRecTypeStr
            ) && "--"}
          </>
        );
      },
    },
    {
      title: "商单成单时间",
      dataIndex: "orderTime",
      width: 130,
      render(value) {
        return <>{formateDate(value)}</>;
      },
    },
    {
      title: "客户",
      dataIndex: "companyName",
      width: 100,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "品牌-合作产品",
      dataIndex: "newsContent",
      width: 130,
      render: (_: any, row: any) => (
        <>
          {row.brandName ? row.brandName : ""}
          {row.brandName && row.coProductName ? "-" : ""}
          {row.coProductName ? row.coProductName : ""}
        </>
      ),
    },
    {
      title: "产品品类",
      dataIndex: "coCateName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "创建人",
      dataIndex: "businessUserName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商务团队",
      dataIndex: "belongGroupName",
      width: 100,
      render(value: unknown, record) {
        return (
          <>
            {record.belongGroupName && record.belongTeamName
              ? `${record.belongGroupName}-${record.belongTeamName}`
              : record.belongGroupName || record.belongTeamName || "--"}
          </>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: 140,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商单类型",
      dataIndex: "busOrderType",
      width: 100,
      render(value) {
        return <span>{formatBusinessType(String(value))}</span>;
      },
    },
    {
      title: "合作账号",
      dataIndex: "businessOrderAccountInfoBOList",
      width: 140,
      render: (value: any, record) => {
        const { businessOrderAccountInfoBOList = [] } = record;
        const generateAccountContent = () => (
          <div>
            {businessOrderAccountInfoBOList.map((item: any) => (
              <div key={item.accountId} className={styles.accountItem}>
                <img
                  src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${item.platId}.png`}
                  alt=""
                />
                <span>{item.accountBelong}</span>
                {item.accountName}
              </div>
            ))}
          </div>
        );

        return (businessOrderAccountInfoBOList || []).length > 0 ? (
          <Popover content={generateAccountContent}>
            <div className={styles.accountItemMsgWrap}>
              {businessOrderAccountInfoBOList.map(
                (item: any, index: number, arr: any) =>
                  index === arr.length - 1 ? (
                    <span key={item.accountId}>{item.accountName}</span>
                  ) : (
                    <span key={item.accountId}>{item.accountName}、</span>
                  )
              )}
            </div>
          </Popover>
        ) : (
          <span>--</span>
        );
      },
    },
    {
      title: (
        <>
          <span>工单履约进度</span>
          <IconTip content="工单履约进度=（已履约的视频工单数+已履约的特殊工单数+已完成的特殊收支）÷（总视频工单数+总特殊工单数+总特殊收支数）" />
          {/* <Tooltip title="工单履约进度=（已履约视频工单数+已完成特殊工单数）÷（总视频工单数+总特殊工单数）">
            <QuestionCircleOutlined />
          </Tooltip> */}
        </>
      ),
      dataIndex: "honorAgreementRate",
      width: 160,
      showSorterTooltip: false,
      sorter: (a, b) => a.honorAgreementRate - b.honorAgreementRate,
      render(value) {
        return <span>{value ? `${value}%` : value}</span>;
      },
    },
    // {
    //   title: "合作价格（售价）",
    //   dataIndex: "coPrice",
    //   width: 110,
    //   showSorterTooltip: false,
    //   sorter: (a, b) => a.coPrice - b.coPrice,
    // },
    // {
    //   title: "对公补款",
    //   dataIndex: "rebateCorporate",
    //   width: 100,
    // },
    // {
    //   title: "对私补款",
    //   dataIndex: "rebatePrivate",
    //   width: 100,
    // },
    {
      title: (
        <>
          销售收入
          <IconTip content="各工单和特殊收支的“销售收入”之和，不含取消合作的工单" />
        </>
      ),
      dataIndex: "salesIncome",
      width: 130,
      showSorterTooltip: false,
      sorter: (a, b) => a.salesIncome - b.salesIncome,
      render(value) {
        return <span>{value || 0}</span>;
      },
    },
    {
      title: (
        <>
          销售成本
          <IconTip content="各工单和特殊收支的“销售成本”之和，不含取消合作的工单" />
        </>
      ),
      dataIndex: "costOfSales",
      width: 130,
      showSorterTooltip: false,
      sorter: (a, b) => a.costOfSales - b.costOfSales,
      render(value) {
        return <span>{value || 0}</span>;
      },
    },
    {
      title: (
        <>
          商务实际营收
          <IconTip content="各工单和特殊收支的“商务实际营收”之和，不含取消合作的工单" />
        </>
      ),
      dataIndex: "businessIncome",
      width: 160,
      showSorterTooltip: false,
      sorter: (a, b) => a.businessIncome - b.businessIncome,
      render(value) {
        return <span>{value || 0}</span>;
      },
    },
    {
      title: (
        <>
          绩效营收
          <IconTip content="商单中全部工单和特殊收支的“绩效营收”之和，不含取消合作的工单" />
        </>
      ),
      dataIndex: "performanceMoney",
      width: 160,
      showSorterTooltip: false,
      sorter: true,
      render(value) {
        return <span>{value === null ? '--' : value}</span>;
      },
    },
    // {
    //   title: (
    //     <>
    //       执行金额
    //       <IconTip content="商单中全部工单的执行金额之和（含特殊工单，但不含已取消合作的工单）" />
    //     </>
    //   ),
    //   dataIndex: "executeMoney",
    //   width: 120,
    //   render(value) {
    //     return <span>{value || 0}</span>;
    //   },
    // },
    // {
    //   title: (
    //     <>
    //       <span>绩效营收</span>
    //       <IconTip content="商单中全部工单的商务实际营收金额之和（含特殊工单，但不含已取消合作的工单）" />
    //       {/* <Tooltip title="商单绩效营收=各工单绩效营收之和（不含撤单的工单）">
    //         <QuestionCircleOutlined />
    //       </Tooltip> */}
    //     </>
    //   ),
    //   dataIndex: "performanceMoney",
    //   width: 130,
    //   showSorterTooltip: false,
    //   sorter: (a, b) => a.performanceMoney - b.performanceMoney,
    //   render(value) {
    //     return <span>{value || 0}</span>;
    //   },
    // },
    {
      title: (
        <>
          <span>毛利率</span>
          <IconTip content="（视频工单+特殊工单+特殊收支的绩效营收之和）/（视频工单+特殊工单+特殊收支的销售收入之和）" />
          {/* <Tooltip title="商单毛利率=全部工单的“绩效营收”之和/全部工单的“合作金额”，不含撤单状态的工单">
            <QuestionCircleOutlined />
          </Tooltip> */}
        </>
      ),
      dataIndex: "grossProfitRate",
      width: 120,
      showSorterTooltip: false,
      sorter: (a, b) => a.grossProfitRate - b.grossProfitRate,
      render(value) {
        return <span>{value === 0 || value ? `${value}%` : "--"}</span>;
      },
    },
    // {
    //   title: "客户线下补款金额",
    //   dataIndex: "cusOfflineSupplement",
    //   sorter: (a, b) => a.cusOfflineSupplement - b.cusOfflineSupplement,
    //   showSorterTooltip: false,
    //   width: 160,
    // },
    // {
    //   title: "我们线下返款金额",
    //   dataIndex: "companyOfflineSupplement",
    //   showSorterTooltip: false,
    //   sorter: (a, b) => a.companyOfflineSupplement - b.companyOfflineSupplement,
    //   width: 160,
    // },
    // {
    //   title: "其他成本",
    //   dataIndex: "otherCost",
    //   width: 100,
    // },
    // {
    //   title: "补款情况",
    //   dataIndex: "paymentResult",
    //   width: 100,
    //   render(value) {
    //     return value ? (value === 1 ? "已补款" : "未补款") : "--";
    //   },
    // },
    // {
    //   title: "补款时间",
    //   dataIndex: "tradeTime",
    //   width: 100,
    //   render(value) {
    //     return value || "--";
    //   },
    // },
    // {
    //   title: "补款截图凭证",
    //   dataIndex: "tradeScreenshots",
    //   width: 100,
    //   render: (_: any, row: any) => (
    //     <>
    //       {row.tradeScreenshots ? (
    //         <Button type="link" onClick={() => showPhotoModal(row)}>
    //           查看图片
    //         </Button>
    //       ) : (
    //         "暂无截图"
    //       )}
    //     </>
    //   ),
    // },
    {
      title: (
        <>
          <span>线下应收</span>
          <IconTip content="线下应收=商单中各工单线下应收之和，不含已取消合作的工单" />
        </>
      ),
      dataIndex: "cusOfflineSupplement",
      width: 100,
      render(value) {
        return <span>{value || 0}</span>;
      },
    },
    {
      title: "客户回款状态",
      dataIndex: "paymentResult",
      width: 100,
      render(value, record) {
        return value
          ? value === 1
            ? record.cusOfflineSupplement
              ? "客户已回款"
              : "--"
            : "客户未回款"
          : "--";
      },
    },
    {
      title: "回款截止日期",
      dataIndex: "tradeTime",
      width: 100,
      render(value, record) {
        return value || "--";
      },
    },
    {
      title: "执行小组",
      dataIndex: "executeGroupName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商机来源",
      dataIndex: "oppoFromName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商机合作类型",
      dataIndex: "opCoTypeDesc",
      width: 130,
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
          <div className={styles.btnWrapper}>
            <div>
              {/* <Button
                type="link"
                href={`#/qp/business-opportunity-manage?opId=${record?.opId}&showDrawer=true&drawerType=detail`}
                target="_blank"
              >
                所属商机
              </Button> */}
              {!!record?.performOrderExistFlag && (
                <Button
                  type="link"
                  href={`#/qp/work-management?busOrderNo=${record?.busOrderNo}`}
                  target="_blank"
                >
                  工单明细
                </Button>
              )}

              {!!record?.specialChargeExistFlag && (
                <Button
                  type="link"
                  className={styles.detailBtn}
                  // href={`#/qp/special-payment-management?busOrderNo=${record?.busOrderNo}`}
                  href={`#/qp/work-management?busOrderNo=${record?.busOrderNo}&tabKey=2`}
                  target="_blank"
                >
                  特殊收支
                </Button>
              )}

              <Button type="link" onClick={() => viewInfo(record)}>
                查看
              </Button>

              <Popover
                placement="bottom"
                content={
                  <>
                    <Button
                      type="link"
                      style={{ display: "block" }}
                      href={`#/qp/business-opportunity-manage?opNo=${record?.opNo}`}
                      target="_blank"
                    >
                      所属商机
                    </Button>

                    <Button
                      type="link"
                      className={styles.priceBtn}
                      style={{ display: "block" }}
                      onClick={() => handleShowQuotation(record)}
                    >
                      报价单
                    </Button>
                  </>
                }
              >
                <Button type="link" style={{ color: "#52c41a" }}>
                  更多
                </Button>
              </Popover>
            </div>
            {/* <div>
              <Button type="link" onClick={() => viewInfo(record)}>
                查看
              </Button>
              <Button
                type="link"
                disabled={!record.editAuth}
                onClick={() => editInfo(record)}
              >
                编辑
              </Button>
            </div> */}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <ConfigProvider locale={cn}>
        <Table
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={data}
          onChange={handleChangeTable as any}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: false,
            showTotal: total => `总共${total}条`,
            ...pagination,
          }}
          locale={{
            filterEmptyText: "暂无数据",
          }}
          rowKey={record => record.busOrderNo}
        />
      </ConfigProvider>
      {isQuotationVisible && (
        <QuotationModal
          busOrderType={busOrderType}
          isQuotationVisible={isQuotationVisible}
          closeQuotationModal={closeQuotationModal}
          opId={opId}
        />
      )}
      {isEditVisible && (
        <EditInvoice
          isEditVisible={isEditVisible}
          cancelEditModal={cancelEditModal}
          busOrderNo={busOrderNo || rowItem.busOrderNo}
          detailMsgByOpId={detailMsgByOpId}
          isEdit={isEdit}
          getTableList={getTableList}
        />
      )}
      {isPhotoVisible && (
        <ViewPhoto
          isPhotoVisible={isPhotoVisible}
          cancelPhotoModal={cancelPhotoModal}
          viewList={viewList || []}
        />
      )}
    </div>
  );
};

export default TableComponent;

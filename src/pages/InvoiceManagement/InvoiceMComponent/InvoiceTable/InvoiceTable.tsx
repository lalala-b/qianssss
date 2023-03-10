/* eslint-disable @typescript-eslint/no-unused-vars */
import { Table, Button, Tooltip, ConfigProvider, Popover } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "src/contexts/global";
import cn from "antd/es/locale/zh_CN";
import IconTip from "src/components/IconTip";
import { formateDate } from "src/utils/formateDate";
import styles from "./InvoiceTable.scss";
import { quotationTypeList } from "../../config/search";
import { invoiceStatus } from "../../config/status";
import type { BusinessResultListType } from "../../config/InvoiceType";
import QuotationModal from "../QuotationModal/QuotationModal";
import ViewPhoto from "../ViewPhoto";
import EditInvoice from "../EditInvoice";

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
  // ????????????
  const showPhotoModal = (row: any) => {
    setViewList([...row.tradeScreenshots.split(",")]);
    setPhotoVisible(true);
  };
  const cancelPhotoModal = () => {
    setPhotoVisible(false);
  };
  // ??????????????????
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
      }#/qp/invoice-details?from=invoice&businessOrderId=${
        record.busOrderId
      }&tabTypeStr=${tabTypeStr}`
    );
    // setIsEdit(true);
  };

  // ??????????????????
  // const editInfo = (record: any) => {
  //   setEditVisible(true);
  //   setRowItem(record);
  //   setIsEdit(false);
  // };
  const cancelEditModal = () => {
    setEditVisible(false);
  };
  // ???????????????
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
    setSearchData(Object.assign(searchData, { determined: der }))
    getTableList({
      determined: der,
      pageNum: pagination.current,
      size: pagination.pageSize,
      ...confParams,
    });
  };
  useEffect(() => {
    if (Object.keys(detailMsgByOpId || {}).length) {
      viewInfo(detailMsgByOpId);
    }
  }, [detailMsgByOpId]);

  const columns: ColumnsType<any> = [
    {
      title: "????????????",
      dataIndex: "busOrderStatus",
      width: 260,
      render(value, record) {
        return (
          <>
            {!!record.offlinePayCorTypeStr && (
              <p>
                ???????????????????????????
                {record.offlinePayCorTypeStr}
              </p>
            )}

            {!!record.offlinePayPriTypeStr && (
              <p>
                ???????????????????????????
                {record.offlinePayPriTypeStr}
              </p>
            )}

            {!!record.offlineRecTypeStr && (
              <p>
                ???????????????
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
      title: "??????",
      dataIndex: "companyName",
      width: 100,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "??????-????????????",
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
      title: "????????????",
      dataIndex: "coCateName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "?????????",
      dataIndex: "businessUserName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "????????????",
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
      title: "????????????",
      dataIndex: "createTime",
      width: 140,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "????????????",
      dataIndex: "busOrderType",
      width: 100,
      render(value) {
        return <span>{formatBusinessType(String(value))}</span>;
      },
    },
    {
      title: "????????????",
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
                    <span key={item.accountId}>{item.accountName}???</span>
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
          <span>??????????????????</span>
          <IconTip content="??????????????????=??????????????????????????????+???????????????????????????+??????????????????????????????????????????????????+??????????????????+?????????????????????" />
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
    //   title: "????????????????????????",
    //   dataIndex: "coPrice",
    //   width: 110,
    //   showSorterTooltip: false,
    //   sorter: (a, b) => a.coPrice - b.coPrice,
    // },
    // {
    //   title: "????????????",
    //   dataIndex: "rebateCorporate",
    //   width: 100,
    // },
    // {
    //   title: "????????????",
    //   dataIndex: "rebatePrivate",
    //   width: 100,
    // },
    {
      title: (
        <>
          ????????????
          <IconTip content="?????????????????????????????????????????????????????????????????????????????????" />
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
          ????????????
          <IconTip content="????????????????????????????????????????????????????????????????????????????????????" />
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
          ??????????????????
          <IconTip content="???????????????????????????????????????????????????????????????????????????????????????" />
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
          ????????????
          <IconTip content="?????????????????????????????????????????????????????????????????????????????????????????????" />
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
    //       ????????????
    //       <IconTip content="???????????????????????????????????????????????????????????????????????????????????????????????????" />
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
    //       <span>????????????</span>
    //       <IconTip content="???????????????????????????????????????????????????????????????????????????????????????????????????????????????" />
    //       {/* <Tooltip title="??????????????????=??????????????????????????????????????????????????????">
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
          <span>?????????</span>
          <IconTip content="???????????????+????????????+????????????????????????????????????/???????????????+????????????+????????????????????????????????????" />
          {/* <Tooltip title="???????????????=???????????????????????????????????????/???????????????????????????????????????????????????????????????">
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
    //   title: "????????????????????????",
    //   dataIndex: "cusOfflineSupplement",
    //   sorter: (a, b) => a.cusOfflineSupplement - b.cusOfflineSupplement,
    //   showSorterTooltip: false,
    //   width: 160,
    // },
    // {
    //   title: "????????????????????????",
    //   dataIndex: "companyOfflineSupplement",
    //   showSorterTooltip: false,
    //   sorter: (a, b) => a.companyOfflineSupplement - b.companyOfflineSupplement,
    //   width: 160,
    // },
    // {
    //   title: "????????????",
    //   dataIndex: "otherCost",
    //   width: 100,
    // },
    // {
    //   title: "????????????",
    //   dataIndex: "paymentResult",
    //   width: 100,
    //   render(value) {
    //     return value ? (value === 1 ? "?????????" : "?????????") : "--";
    //   },
    // },
    // {
    //   title: "????????????",
    //   dataIndex: "tradeTime",
    //   width: 100,
    //   render(value) {
    //     return value || "--";
    //   },
    // },
    // {
    //   title: "??????????????????",
    //   dataIndex: "tradeScreenshots",
    //   width: 100,
    //   render: (_: any, row: any) => (
    //     <>
    //       {row.tradeScreenshots ? (
    //         <Button type="link" onClick={() => showPhotoModal(row)}>
    //           ????????????
    //         </Button>
    //       ) : (
    //         "????????????"
    //       )}
    //     </>
    //   ),
    // },
    {
      title: (
        <>
          <span>????????????</span>
          <IconTip content="????????????=?????????????????????????????????????????????????????????????????????" />
        </>
      ),
      dataIndex: "cusOfflineSupplement",
      width: 100,
      render(value) {
        return <span>{value || 0}</span>;
      },
    },
    {
      title: "??????????????????",
      dataIndex: "paymentResult",
      width: 100,
      render(value, record) {
        return value
          ? value === 1
            ? record.cusOfflineSupplement
              ? "???????????????"
              : "--"
            : "???????????????"
          : "--";
      },
    },
    {
      title: "??????????????????",
      dataIndex: "tradeTime",
      width: 180,
      render(value, record) {
        return value || "--";
      },
    },
    {
      title: "????????????",
      dataIndex: "executeGroupName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "????????????",
      dataIndex: "oppoFromName",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "??????????????????",
      dataIndex: "opCoTypeDesc",
      width: 130,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "?????????",
      dataIndex: "busOrderNo",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "?????????",
      dataIndex: "planNo",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "????????????",
      dataIndex: "orderTime",
      width: 130,
      render(value) {
        return <>{formateDate(value)}</>;
      },
    },
    {
      title: "??????",
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
                ????????????
              </Button> */}
              {!!record?.performOrderExistFlag && (
                <Button
                  type="link"
                  href={`#/qp/work-management?busOrderNo=${record?.busOrderNo}`}
                  target="_blank"
                >
                  ????????????
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
                  ????????????
                </Button>
              )}

              <Button type="link" onClick={() => viewInfo(record)}>
                ??????
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
                      ????????????
                    </Button>

                    <Button
                      type="link"
                      className={styles.priceBtn}
                      style={{ display: "block" }}
                      onClick={() => handleShowQuotation(record)}
                    >
                      ?????????
                    </Button>
                  </>
                }
              >
                <Button type="link" style={{ color: "#52c41a" }}>
                  ??????
                </Button>
              </Popover>
            </div>
            {/* <div>
              <Button type="link" onClick={() => viewInfo(record)}>
                ??????
              </Button>
              <Button
                type="link"
                disabled={!record.editAuth}
                onClick={() => editInfo(record)}
              >
                ??????
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
          sticky={{
            offsetHeader: -24,
          }}
          columns={columns}
          dataSource={data}
          onChange={handleChangeTable as any}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: false,
            showTotal: total => `??????${total}???`,
            ...pagination,
          }}
          locale={{
            filterEmptyText: "????????????",
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

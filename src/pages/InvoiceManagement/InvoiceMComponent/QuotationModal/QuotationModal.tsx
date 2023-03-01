/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable css-modules/no-unused-class */
import { useEffect, useState } from "react";
import { Modal, Button, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { $getQuotationList } from "src/api/invoice";
// import styles from "./EditInvoice.scss";
import IconTip from "src/components/IconTip";
import AccountCard from "src/components/AccountCard";
import type { QuotationListType } from "../../config/InvoiceType";
import { quotationTypeList } from "../../config/search";

const formatBusinessType = (id: string) =>
  (quotationTypeList.find(item => item.value === id) || { label: "" }).label;
interface EditInvoicePropsType {
  closeQuotationModal: () => void;
  isQuotationVisible: boolean;
  opId: number | string;
  busOrderType: string;
}
const QuotationModal: React.FC<EditInvoicePropsType> = ({
  closeQuotationModal,
  isQuotationVisible,
  opId,
  busOrderType,
}) => {
  const [loading, setLoading] = useState(false);
  const [quotationList, setQuotationList] = useState<QuotationListType[]>([]);
  const handleCancel = () => {
    closeQuotationModal();
  };

  const getQuotationList = async () => {
    setLoading(true);
    $getQuotationList({ opId })
      .then(res => {
        setLoading(false);
        setQuotationList(res);
      })
      .catch((e: any) => {
        setLoading(false);
        message.error(e.message);
      });
  };

  // const getSalesRevenueTip = (businessLabel: string) => {
  //   let tip = ''
  //   switch (businessLabel) {
  //     case '客户自行下单':
  //       tip = '销售收入=平台报价（原价）'
  //       break;
  //     case '代客下单':
  //       tip = '销售收入=平台报价（原价）+【报给客户】官方平台手续费'
  //       break;
  //     case '不走平台的私单':
  //       tip = '销售收入=平台报价（原价）'
  //       break;
  //     default:
  //       break;
  //   }

  //   return tip
  // }

  // const getPerformanceRevenueTip = (businessLabel: string) => {
  //   let tip = ''
  //   switch (businessLabel) {
  //     case '客户自行下单':
  //       tip = '绩效营收=执行金额-达人分成成本-其他成本'
  //       break;
  //     case '代客下单':
  //       tip = '绩效营收=执行金额-达人分成成本-其他成本-【实际】官方平台手续费'
  //       break;
  //     case '不走平台的私单':
  //       tip = '绩效营收=执行金额-达人分成成本-其他成本'
  //       break;
  //     default:
  //       break;
  //   }

  //   return tip
  // }

  const handleGoDetail = (record: any) => {
    if ([25, 26].includes(record.platId)) {
      if (!record.accountId) return;

      window.open(
        `#/details/account/${record.platId}/${record.accountId}`,
        "_blank"
      );
    } else {
      window.open(record.accountLoginUrl);
    }
  };

  useEffect(() => {
    if (opId) {
      getQuotationList();
    }
  }, [opId]);

  const [columns, setColumns] = useState<any>([
    // {
    //   title: "平台",
    //   dataIndex: "platName",
    //   width: 100,
    //   render(value: string) {
    //     return <>{value || "--"}</>;
    //   },
    // },
    {
      title: "账号信息",
      dataIndex: "accountName",
      width: 180,
      render(value: string, record: any) {
        return (
          <>
            <AccountCard info={record} defaultWH={32} />
            {/* <Button type="link" onClick={() => handleGoDetail(record)}>
              {value || "--"}
            </Button> */}
          </>
        );
      },
    },
    {
      title: "发布档期",
      dataIndex: "publishDate",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "平台报价",
      dataIndex: "officePrice",
      width: 100,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: (
        <>
          商务实际营收
          <IconTip
            content={
              <>
                <p>
                  商务实际营收 = 平台报价 -
                  【平台报价*返点比例】+其他收入+手续费收入
                </p>
                <p>
                  手续费收入 = 【报给客户】官方平台手续费-【实际】官方平台手续费
                </p>
              </>
            }
          />
        </>
      ),
      dataIndex: "businessRevenue",
      width: 140,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: "返点比例",
      dataIndex: "rebateRate",
      width: 100,
      render(value: number) {
        return <>{value === 0 || value ? `${value}%` : "--"}</>;
      },
    },
    {
      title: "其他收入",
      dataIndex: "otherIncome",
      width: 100,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: "【实际】官方平台下单价",
      dataIndex: "platOrderMoney",
      width: 120,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: (
        <>
          线下应收
          <IconTip
            content={
              <>
                <p>客户需要额外给我们补款的金额</p>
                <p>支持手动修改</p>
              </>
            }
          />
        </>
      ),
      dataIndex: "cusOfflineSupplement",
      width: 120,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: (
        <>
          线下应付
          <IconTip
            content={
              <>
                <p>我们需要额外补款给客户的金额：</p>
                <p>
                  线下应付 = 【实际】官方平台下单价 - 商务实际营收 + 线下应收
                </p>
              </>
            }
          />
        </>
      ),
      dataIndex: "companyOfflineSupplement",
      width: 120,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: (
        <>
          销售收入
          {/* <IconTip content={getSalesRevenueTip(formatBusinessType(busOrderType))} /> */}
          <IconTip content="销售收入=平台报价+其他收入" />
        </>
      ),
      dataIndex: "salesIncome",
      width: 120,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: (
        <>
          销售成本
          <IconTip content="销售成本=平台报价*返点比例" />
        </>
      ),
      dataIndex: "costOfSales",
      width: 120,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: (
        <>
          绩效营收
          {/* <IconTip content={getPerformanceRevenueTip(formatBusinessType(busOrderType))} /> */}
          <IconTip content="绩效营收=工单实际营收-达人分成成本（采购达人成本）-达人其他成本" />
        </>
      ),
      dataIndex: "performanceMoney",
      width: 120,
      render(value: number) {
        return <>{value || 0}</>;
      },
    },
    {
      title: "工单号",
      dataIndex: "workOrderNo",
      width: 100,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      width: 100,
      fixed: "right",
      render(value: unknown, record: any) {
        return (
          <Button
            type="link"
            href={`#/qp/work-order-detail?id=${record?.workOrderNo}`}
            target="_blank"
          >
            查看工单
          </Button>
        );
      },
    },
  ]);
  const formatTable = () => {
    const tableItemForPlatOrderMoney = {
      title: "【实际】官方平台手续费",
      dataIndex: "platMoney",
      width: 140,
    };
    const tableItemForPlatOrderCharge = {
      title: "【报给客户】官方平台手续费",
      dataIndex: "platOrderCharge",
      width: 140,
    };
    // 代客下单
    if (busOrderType === "2") {
      columns.splice(5, 1);
      columns.splice(6, 2);
      columns.splice(4, 0, tableItemForPlatOrderCharge);
      columns.splice(5, 0, tableItemForPlatOrderMoney);
      setColumns([...columns]);
    }
    // 不走平台的私单
    if (busOrderType === "4") {
      columns.splice(5, 4);
      setColumns([...columns]);
    }
  };
  useEffect(() => {
    if (busOrderType) {
      formatTable();
    }
  }, [busOrderType]);
  return (
    <>
      <Modal
        title="报价单"
        visible={isQuotationVisible}
        width="70%"
        onCancel={handleCancel}
        footer={
          <Button type="default" onClick={handleCancel}>
            取消
          </Button>
        }
      >
        {busOrderType ? (
          <p style={{ marginBottom: "12px" }}>
            商单类型:{formatBusinessType(busOrderType)}
          </p>
        ) : (
          ""
        )}
        <Table
          scroll={{ x: "max-content" }}
          columns={columns}
          loading={loading}
          dataSource={quotationList}
          rowKey={record => record.workOrderNo}
        />
      </Modal>
    </>
  );
};

export default QuotationModal;

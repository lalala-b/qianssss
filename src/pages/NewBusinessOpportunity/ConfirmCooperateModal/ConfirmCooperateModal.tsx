/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable keyword-spacing */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import { memo, useState, useEffect } from "react";
import {
  Modal,
  Button,
  Table,
  Form,
  Select,
  InputNumber,
  message,
  Spin,
  DatePicker,
  Input,
  Steps,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ConfirmCooperationParamsType,
  $confirmCooperation,
  $getQuotationList,
  QuotationListResType,
  $getOpportDetail,
  $getExecutorGroupData,
  $getRevenueList,
  ConfirmCoopDTOSType,
  $getByDictType,
  $getSpecialChargeList,
  GetSpecialChargeListItemResType,
  $getDqManagementData,
} from "src/api/business";
import IconTip from "src/components/IconTip";
import moment from "moment";
import type { Moment } from "moment";
import { ExclamationCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import styles from "./ConfirmCooperateModal.scss";

const DatePickers: any = DatePicker;
const { TextArea } = Input;

const { Step } = Steps

interface ConfirmCustomerSelectNumModalPropType {
  opId: number;
  opType?: number;
  show: boolean;
  onShowDrawer: (
    val: DrawerType,
    id: string | number,
    isActiveKeyForCommand: boolean
  ) => void;
  onGetList: () => void;
  onClose: () => void;
}
interface RevenueDataType {
  businessRevenueSummary?: number;
  incomeTotal?: number;
  payTotal?: number;
  businessRevenueTotal?: number;
}
interface SpecialPaymentsDataType {
  id: number;
  payType?: string;
  payCharge?: number;
  incomeType?: string;
  incomeCharge?: number;
}
interface PaymentType {
  value: number;
  label: string;
}

interface ExecutorType {
  id: number;
  name: string;
}

const { Option } = Select;

const ConfirmCooperateModal: React.FC<
  ConfirmCustomerSelectNumModalPropType
> = ({ opId, opType, show, onShowDrawer, onGetList, onClose }) => {
  const [form] = Form.useForm();

  const [paymentType, setPaymentType] = useState<number>(0);

  // 报价单表格数据
  const [quotationData, setQuotationData] = useState<QuotationListResType[]>(
    []
  );

  const [commercialOrderType, setCommercialOrderType] = useState<string>("");

  const [sumOfCompanyOfflineSupp, setSumOfCompanyOfflineSupp] =
    useState<number>(0);

  const [rebatePrivate, setRebatePrivate] = useState<number>(0);

  const [maxPublicePrice, setMaxPublicePrice] = useState(0);

  const [publicePriceOfComputed, setPublicePriceOfComputed] =
    useState<number>(0);

  const [firstChangeFlag, setFirstChangeFlag] = useState<boolean>(true);

  const [executorGroup, setExecutorGroup] = useState<ExecutorType[]>([]);

  const [quotationDataLoading, setQuotationDataLoading] =
    useState<boolean>(false);

  const [orderTime, setOrderTime] = useState<string>("");

  // const [loading, setLoading] = useState<boolean>(false);
  // 控制确认合作生成商单时的加载弹窗显示
  const [showConfirmCoopLoadingModal, setShowConfirmCoopLoadingModal] = useState<boolean>(false)
  
  // 控制自动填充弹窗的关闭
  const [showAutoFillModal, setShowAutoFillModal] = useState<boolean>(false);

  // 控制提示关闭弹窗的关闭
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  const [curChangeProps, setCurChangeProps] = useState<string>("");

  const [curChangeVal, setCurChangeVal] = useState<number>(0);

  const [orderDurationSelectData, setOrderDurationSelectData] = useState<any[]>(
    []
  );
  const [authorizationSelectData, setAuthorizationSelectData] = useState<any[]>(
    []
  );
  const [showPublishDateModal, setPublishDateModal] = useState<boolean>(false);

  // 涉及被占档期的账号
  const [involveAccounts, setInvolveAccounts] = useState<string[]>([]);

  const [secondEdit, setSecondEdit] = useState<boolean>(false);

  // 已经成单的日期
  const [outDay, setOutDay] = useState<any>([]);

  // 确认合作生成商单时的当前加载步骤
  const [confirmCoopCurStep, setConfirmCoopCurStep] = useState<number>(-1)

  // 确认合作生成商单时的当前步骤加载进度
  const [confirmCoopCurPercent, setConfirmCoopCurPercent] = useState<number>(0)

  // 定时器
  const [timeInterval, setTimeInterval] = useState<any>(0)

  const quotationProps = {
    orderFlag: 0,
    orderDuration: 0,
    bfFlag: false,
    sendFlag: false,
    authDuration: 0,
  };

  // 确认合作生成商单时的步骤条加载数据
  const confirmCoopLoadingStepArr: any = [
    {
      title: "数据核对中",
      id: '1',
    },
    {
      title: "报价单核对中",
      id: '2',
    },
    {
      title: "商机数据核对中",
      id: '3',
    },
    {
      title: "商单生成中",
      id: '4',
    },
  ]

  const sharedOnCell = (_: QuotationListResType, index: number | undefined) => {
    if (Number(index) === quotationData.length - 1) {
      return { colSpan: 0 };
    }
    return {};
  };

  const sharedOnCellForOne = (
    _: QuotationListResType,
    index: number | undefined
  ) => ({
    colSpan: Number(index) === quotationData.length - 1 ? 2 : 1,
  });

  // 修改当前的编辑字段和对应数据的值
  const modifyCurPropsVal = (props: string, value: number, id: number) => {
    if (
      props !== "publishDate" &&
      quotationData.filter(item => item.platName !== "总计").length !== 1
    ) {
      setShowAutoFillModal(true);
    }
    setCurChangeProps(props);
    setCurChangeVal(value);
    quotationData.filter(item => item.accountId === id)[0][
      props as keyof typeof quotationProps
    ] = value;
  };
  // const disableDate = (date: any) => {
  //   // 将date转化为YYYYMMDD的格式
  //   const days = moment(date).format("YYYY-MM-DD");
  //   return outDay.includes(days);
  // };
  const handleChangeEditItem = (e: any, id: any) => {
    modifyCurPropsVal("publishDate", e.format("YYYY-MM-DD"), id);
  };
  const getDqManagementData = async (accountId: any) => {
    try {
      const data: any = await $getDqManagementData({ accountId });
      if (data && data.length) {
        const slotDates: any = [];
        data.forEach((item: any) => {
          slotDates.push(item.slotDate);
        });
        setOutDay([...slotDates]);
      }
    } catch (error) {
      console.info(error);
    }
  };
  const handleFocus = (row: any) => {
    getDqManagementData(row.accountId);
  };
  // 编辑属性的列
  const editPropsColArr = [
    {
      title: (
        <>
          <span style={{ color: "red" }}>*</span>
          下单状态
        </>
      ),
      dataIndex: "orderFlag",
      key: "orderFlag",
      width: "120px",
      render: (orderFlag: number, record: QuotationListResType) => {
        const getOrderFlagText = (num: number) => {
          let text = null;
          switch (num) {
            case 0:
              text = "未下单";
              break;
            case 1:
              text = "已下单";
              break;
            case 2:
              text = "无须下单";
              break;
            default:
              text = undefined;
              break;
          }
          return text;
        };
        const handleChangeOrderStatus = (text: string, id: number) => {
          const val = text === "未下单" ? 0 : text === "已下单" ? 1 : 2;
          modifyCurPropsVal("orderFlag", val, id);
        };
        return (
          <>
            {record.platName === "总计" ? (
              "--"
            ) : (
              <Select
                style={{ width: "100%" }}
                placeholder="请选择"
                value={getOrderFlagText(orderFlag)}
                onChange={val => handleChangeOrderStatus(val, record.accountId)}
              >
                <Option value="未下单">未下单</Option>
                <Option value="已下单">已下单</Option>
                <Option value="无须下单">无须下单</Option>
              </Select>
            )}
          </>
        );
      },
    },
    {
      title: (
        <>
          <span style={{ color: "red" }}>*</span>
          下单时长
        </>
      ),
      dataIndex: "orderDuration",
      key: "orderDuration",
      width: "120px",
      render: (orderDuration: number, record: QuotationListResType) => {
        const getOrderDurationText = (num: number) => {
          let text = null;
          switch (num) {
            case 0:
              text = "20s";
              break;
            case 1:
              text = "60s";
              break;
            case 2:
              text = "60s+";
              break;
            default:
              text = undefined;
              break;
          }

          return text;
        };
        const handleChangeOrderTime = (text: string, id: number) => {
          const val = text === "20s" ? 0 : text === "60s" ? 1 : 2;
          modifyCurPropsVal("orderDuration", val, id);
        };
        return (
          <>
            {record.platName === "总计" ? (
              "--"
            ) : (
              <Select
                defaultValue={undefined}
                placeholder="请选择"
                value={getOrderDurationText(orderDuration)}
                onChange={val => handleChangeOrderTime(val, record.accountId)}
              >
                {orderDurationSelectData.map(item => (
                  <Option value={item.dictLabel} key={item.dictValue}>
                    {item.dictLabel}
                  </Option>
                ))}
                {/* <Option value="20s">20s</Option>
                  <Option value="60s">60s</Option>
                  <Option value="60s+">60s+</Option> */}
              </Select>
            )}
          </>
        );
      },
    },
    {
      title: (
        <>
          <span style={{ color: "red" }}>*</span>
          是否出bf
        </>
      ),
      dataIndex: "bfFlag",
      key: "bfFlag",
      // width: "120px",
      render: (bfFlag: number, record: QuotationListResType) => {
        const getBfText = (num: number) => {
          let text = null;
          switch (num) {
            case 0:
              text = "否";
              break;
            case 1:
              text = "是";
              break;
            default:
              text = undefined;
              break;
          }
          return text;
        };
        const handleChangeBf = (text: string, id: number) => {
          const val = text === "否" ? 0 : 1;
          modifyCurPropsVal("bfFlag", val, id);
        };
        return (
          <>
            {record.platName === "总计" ? (
              "--"
            ) : (
              <Select
                defaultValue={undefined}
                placeholder="请选择"
                value={getBfText(bfFlag)}
                onChange={val => handleChangeBf(val, record.accountId)}
              >
                <Option value="否">否</Option>
                <Option value="是">是</Option>
              </Select>
            )}
          </>
        );
      },
    },
    {
      title: (
        <>
          <span style={{ color: "red" }}>*</span>
          是否寄品
        </>
      ),
      dataIndex: "sendFlag",
      key: "sendFlag",
      // width: "120px",
      render: (sendFlag: number, record: QuotationListResType) => {
        const getMailingsText = (num: number) => {
          let text = null;
          switch (num) {
            case 0:
              text = "否";
              break;
            case 1:
              text = "是";
              break;
            default:
              text = undefined;
              break;
          }
          return text;
        };

        const handleChangeMailings = (text: string, id: number) => {
          const val = text === "否" ? 0 : 1;
          modifyCurPropsVal("sendFlag", val, id);
        };
        return (
          <>
            {record.platName === "总计" ? (
              "--"
            ) : (
              <Select
                defaultValue={undefined}
                placeholder="请选择"
                value={getMailingsText(sendFlag)}
                onChange={val => handleChangeMailings(val, record.accountId)}
              >
                <Option value="否">否</Option>
                <Option value="是">是</Option>
              </Select>
            )}
          </>
        );
      },
    },
    {
      title: (
        <>
          <span style={{ color: "red" }}>*</span>
          授权情况
        </>
      ),
      dataIndex: "authDuration",
      key: "authDuration",
      width: "130px",
      render: (authDuration: number, record: QuotationListResType) => {
        const getAuthorizationText = (num: number) => {
          let text = null;
          switch (num) {
            case 0:
              text = "不授权";
              break;
            case 1:
              text = "授权1个月";
              break;
            case 2:
              text = "授权3个月";
              break;
            case 3:
              text = "授权6个月";
              break;
            default:
              text = undefined;
              break;
          }
          return text;
        };
        const getAuthorizationVal = (text: string) => {
          let val = -1;
          switch (text) {
            case "不授权":
              val = 0;
              break;
            case "授权1个月":
              val = 1;
              break;
            case "授权3个月":
              val = 2;
              break;
            case "授权6个月":
              val = 3;
              break;
            default:
              break;
          }
          return val;
        };
        const handleChangeAuthorization = (text: string, id: number) => {
          const val = getAuthorizationVal(text);
          modifyCurPropsVal("authDuration", val, id);
        };
        return (
          <>
            {record.platName === "总计" ? (
              "--"
            ) : (
              <Select
                style={{ width: "100%" }}
                defaultValue={undefined}
                placeholder="请选择"
                value={getAuthorizationText(authDuration)}
                onChange={val =>
                  handleChangeAuthorization(val, record.accountId)
                }
              >
                {authorizationSelectData.map(item => (
                  <Option value={item.dictLabel} key={item.dictValue}>
                    {item.dictLabel}
                  </Option>
                ))}
                {/* <Option value="授权1个月">授权1个月</Option>
                  <Option value="授权3个月">授权3个月</Option>
                  <Option value="授权6个月">授权6个月</Option>
                  <Option value="不授权">不授权</Option> */}
              </Select>
            )}
          </>
        );
      },
    },
    {
      title: <>特殊情况</>,
      dataIndex: "specialCase",
      key: "specialCase",
      width: "140px",
      render: (specialCase: string, record: QuotationListResType) => {
        const handleChangeSpecialCase = (e: any, id: number) => {
          const val = e.target.value;
          quotationData.filter(item => item.accountId === id)[0].specialCase =
            val;
        };
        return (
          <>
            {record.platName === "总计" ? (
              "--"
            ) : (
              <TextArea
                placeholder="请输入"
                rows={1}
                maxLength={100}
                onBlur={val => handleChangeSpecialCase(val, record.accountId)}
              />
            )}
          </>
        );
      },
    },
    {
      title: (
        <>
          <span style={{ color: "red" }}>*</span>
          发布档期
        </>
      ),
      dataIndex: "publishDate",
      width: 230,
      key: "publishDate",
      render: (_: string, record: any, index: number) => (
        <>
          {record.platName === "总计" ? (
            <span>{_ || "--"}</span>
          ) : (
            <>
              <DatePickers
                placeholder="选择发布档期"
                autoFocus
                allowClear={false}
                // getPopupContainer={() =>
                //   document.getElementById("confirmPublishDate")
                // }
                value={_ ? moment(_) : ""}
                // disabledDate={disableDate}
                // renderExtraFooter={() =>
                //   outDay.length ? "红色日期表示已成单" : ""
                // }
                onChange={(e: moment.Moment) =>
                  handleChangeEditItem(e, record.accountId)
                }
                onFocus={() => {
                  handleFocus(record);
                }}
              />
            </>
          )}
        </>
      ),
    },
  ];

  // 公共列（前6列）
  const publicColArr = [
    {
      title: "平台",
      dataIndex: "platName",
      key: "platName",
      width: "80px",
      render: (platName: string) => (platName ? <span>{platName}</span> : "--"),
      onCell: sharedOnCellForOne,
    },
    {
      title: "账号名称",
      dataIndex: "accountName",
      key: "accountName",
      width: "140px",
      render: (accountName: string) =>
        accountName ? <span>{accountName}</span> : "--",
      onCell: sharedOnCell,
    },
    ...editPropsColArr,
    {
      title: "合作类型",
      dataIndex: "orderType",
      key: "orderType",
      width: "120px",
      render: (orderType: number) =>
        orderType ? (
          <span>{orderType === 1 ? "视频工单" : "特殊工单"}</span>
        ) : (
          "--"
        ),
      // onCell: sharedOnCell,
    },
    {
      title: (
        <>
          商务实际营收
          <IconTip
            content={
              <>
                <p>即我们跟客户合作该账号，我们最终收取客户的费用。</p>
                <p>
                  商务实际营收 = 平台报价 -
                  【平台报价*返点比例】+其他收入+手续费收入
                </p>
                <p>
                  手续费收入 = 【报给客户】官方平台手续费-【实际】官方平台手续费
                </p>
                <p>
                  注：仅代客下单有手续费收入，且需要在待确认客户确认合作的时候再完善
                </p>
              </>
            }
          />
        </>
      ),
      dataIndex: "businessRevenue",
      key: "businessRevenue",
      width: "120px",
      render: (businessRevenue: number) =>
        businessRevenue ? <span>¥{businessRevenue}</span> : "--",
    },
    {
      title: (
        <>
          平台报价（原价）
          <IconTip content="根据客户选择的订单类型，如21~60s，对应的刊例价" />
        </>
      ),
      dataIndex: "officePrice",
      key: "officePrice",
      width: "120px",
      render: (officePrice: number) =>
        officePrice ? <span>¥{officePrice}</span> : "--",
    },
  ];

  // 客户自行下单
  const columnsForCustomer: ColumnsType<QuotationListResType> = [
    ...publicColArr,
    {
      title: (
        <>
          返点比例
          <IconTip
            content={
              <>
                <p>自营和签约的返点比例默认以商机填写的为准，可手动修改</p>
              </>
            }
          />
        </>
      ),
      dataIndex: " rebateRate",
      key: "rebateRate",
      width: "100px",
      render: (rebateRate: number, record: QuotationListResType) =>
        record.rebateRate ? <span>{record.rebateRate}%</span> : "--",
    },
    {
      title: <>返点金额</>,
      dataIndex: "rebateAmount",
      key: "rebateAmount",
      width: "100px",
      render: (rebateAmount: number) =>
        rebateAmount ? <span>{rebateAmount}</span> : "--",
    },
    {
      title: (
        <>
          销售成本
          <IconTip content="销售成本=折扣金额+线下返点（返点分为对公返点和对私返点）" />
        </>
      ),
      dataIndex: "costOfSales",
      key: "costOfSales",
      width: "120px",
      render: (costOfSales: number, record: QuotationListResType) =>
        record.costOfSales ? <span>¥{record.costOfSales}</span> : "--",
    },
    {
      title: (
        <>
          其他收入
          <IconTip
            content={
              <>
                <p>
                  时长加收费、手续费收入以外的一切其他收入项（如：差旅费、授权费、挂车费、挂组件费用等）
                </p>
                <p>（时长加收费直接在平台报价中更改，手续费由系统自动计算）</p>
              </>
            }
          />
        </>
      ),
      dataIndex: "otherIncome",
      key: "otherIncome",
      width: "120px",
      render: (otherIncome: number) =>
        otherIncome ? <span>¥{otherIncome}</span> : "--",
    },
    {
      title: (
        <>
          【实际】官方平台下单价
          <IconTip content="客户（自行下单）或我们（代客下单）在官方平台实际的下单价格。且不含平台手续费" />
        </>
      ),
      dataIndex: "platOrderMoney",
      key: "platOrderMoney",
      width: "120px",
      render: (platOrderMoney: number) =>
        platOrderMoney ? <span>¥{platOrderMoney}</span> : "--",
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
      key: "cusOfflineSupplement",
      width: "120px",
      render: (cusOfflineSupplement: number) =>
        cusOfflineSupplement ? <span>¥{cusOfflineSupplement}</span> : "--",
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
      key: "companyOfflineSupplement",
      width: "120px",
      render: (companyOfflineSupplement: number) =>
        companyOfflineSupplement ? (
          <span>¥{companyOfflineSupplement}</span>
        ) : (
          "--"
        ),
    },
  ];

  // 平台代客下单
  const columnsForPlacing: ColumnsType<QuotationListResType> = [
    ...publicColArr,
    {
      title: (
        <>
          【实际】官方平台下单价
          <IconTip content="客户（自行下单）或我们（代客下单）在官方平台实际的下单价格。且不含平台手续费" />
        </>
      ),
      dataIndex: "platOrderMoney",
      key: "platOrderMoney",
      width: "120px",
      render: (platOrderMoney: number) =>
        platOrderMoney ? <span>¥{platOrderMoney}</span> : "--",
    },
    {
      title: (
        <>
          【报给客户】官方平台手续费
          <IconTip
            content={
              <>
                <p>
                  【报给客户】官方平台手续费 =
                  平台报价（原价）*各平台手续费比例（抖音快手默认5%）
                </p>
                <p>
                  注意：【报给客户】官方平台手续费和【实际】官方平台手续费不是同一个值，他们之差为我们的利润
                </p>
              </>
            }
          />
        </>
      ),
      dataIndex: "platOrderCharge",
      key: "platOrderCharge",
      width: "120px",
      render: (platOrderCharge: number) =>
        platOrderCharge ? <span>¥{platOrderCharge}</span> : "--",
    },
    {
      title: (
        <>
          【实际】官方平台手续费
          <IconTip
            content={
              <>
                <p>
                  【实际】官方平台手续费 =
                  【实际】官方平台下单价*各平台手续费比例（抖音快手默认5%）
                </p>
                <p>这是平台实际收取我们的手续费费用</p>
              </>
            }
          />
        </>
      ),
      dataIndex: "platMoney",
      key: "platMoney",
      width: "120px",
      render: (platMoney: number) =>
        platMoney ? <span>¥{platMoney}</span> : "--",
    },
    {
      title: (
        <>
          返点比例
          <IconTip
            content={
              <>
                <p>自营和签约的返点比例默认以商机填写的为准，可手动修改</p>
              </>
            }
          />
        </>
      ),
      dataIndex: " rebateRate",
      key: "rebateRate",
      width: "100px",
      render: (rebateRate: number, record: QuotationListResType) =>
        record.rebateRate ? <span>{record.rebateRate}%</span> : "--",
    },
    {
      title: <>返点金额</>,
      dataIndex: "rebateAmount",
      key: "rebateAmount",
      width: "100px",
      render: (rebateAmount: number) =>
        rebateAmount ? <span>{rebateAmount}</span> : "--",
    },
    {
      title: (
        <>
          其他收入
          <IconTip
            content={
              <>
                <p>
                  除时长加收费、手续费收入以外的一切其他收入项（如：差旅费、授权费、挂车费、挂组件费用等）
                </p>
                <p>（时长加收费直接在平台报价中更改，手续费由系统自动计算）</p>
              </>
            }
          />
        </>
      ),
      dataIndex: "otherIncome",
      key: "otherIncome",
      width: "120px",
      render: (otherIncome: number) =>
        otherIncome ? <span>¥{otherIncome}</span> : "--",
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
      key: "cusOfflineSupplement",
      width: "120px",
      render: (cusOfflineSupplement: number) =>
        cusOfflineSupplement ? <span>¥{cusOfflineSupplement}</span> : "--",
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
      key: "companyOfflineSupplement",
      width: "120px",
      render: (companyOfflineSupplement: number) =>
        companyOfflineSupplement ? (
          <span>¥{companyOfflineSupplement}</span>
        ) : (
          "--"
        ),
    },
    {
      title: (
        <>
          销售成本
          <IconTip content="销售成本=折扣金额+线下返点（返点分为对公返点和对私返点）" />
        </>
      ),
      dataIndex: "costOfSales",
      key: "costOfSales",
      width: "120px",
      render: (costOfSales: number, record: QuotationListResType) =>
        record.costOfSales ? <span>¥{record.costOfSales}</span> : "--",
    },
  ];

  // 不走平台私单
  const columnsForPrivate: ColumnsType<QuotationListResType> = [
    ...publicColArr,
    {
      title: (
        <>
          【实际】官方平台下单价
          <IconTip content="客户（自行下单）或我们（代客下单）在官方平台实际的下单价格。且不含平台手续费" />
        </>
      ),
      dataIndex: "platOrderMoney",
      key: "platOrderMoney",
      width: "120px",
      render: (platOrderMoney: number) =>
        platOrderMoney ? <span>¥{platOrderMoney}</span> : "--",
    },
    {
      title: (
        <>
          返点比例
          <IconTip
            content={
              <>
                <p>自营和签约的返点比例默认以商机填写的为准，可手动修改</p>
              </>
            }
          />
        </>
      ),
      dataIndex: " rebateRate",
      key: "rebateRate",
      width: "100px",
      render: (rebateRate: number, record: QuotationListResType) =>
        record.rebateRate ? <span>{record.rebateRate}%</span> : "--",
    },
    {
      title: <>返点金额</>,
      dataIndex: " rebateAmount",
      key: "rebateAmount",
      width: "100px",
      render: (rebateAmount: number) =>
        rebateAmount ? <span>{rebateAmount}</span> : "--",
    },
    {
      title: (
        <>
          其他收入
          <IconTip
            content={
              <>
                <p>
                  除时长加收费、手续费收入以外的一切其他收入项（如：差旅费、授权费、挂车费、挂组件费用等）
                </p>
                <p>（时长加收费直接在平台报价中更改，手续费由系统自动计算）</p>
              </>
            }
          />
        </>
      ),
      dataIndex: "officePrice",
      key: "officePrice",
      width: "120px",
      render: (officePrice: number) =>
        officePrice ? <span>¥{officePrice}</span> : "--",
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
      key: "cusOfflineSupplement",
      width: "120px",
      render: (cusOfflineSupplement: number) =>
        cusOfflineSupplement ? <span>¥{cusOfflineSupplement}</span> : "--",
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
      key: "companyOfflineSupplement",
      width: "120px",
      render: (companyOfflineSupplement: number) =>
        companyOfflineSupplement ? (
          <span>¥{companyOfflineSupplement}</span>
        ) : (
          "--"
        ),
    },
    {
      title: (
        <>
          销售成本
          <IconTip content="销售成本=折扣金额+线下返点（返点分为对公返点和对私返点）" />
        </>
      ),
      dataIndex: "costOfSales",
      key: "costOfSales",
      width: "120px",
      render: (costOfSales: number, record: QuotationListResType) =>
        record.costOfSales ? <span>¥{record.costOfSales}</span> : "--",
    },
  ];

  // 线下返款类型
  const paymentTypesArr: PaymentType[] = [
    {
      value: 1,
      label: "对公",
    },
    {
      value: 2,
      label: "对私",
    },
    {
      value: 3,
      label: "对公和对私",
    },
  ];

  // 特殊收支
  const [specialPaymentsData, setSpecialPaymentsData] = useState<
    GetSpecialChargeListItemResType[]
  >([]);

  const specialPayments: ColumnsType<any> = [
    {
      title: "收支类型",
      key: "chargeTypeDesc",
      dataIndex: "chargeTypeDesc",
    },
    {
      title: "相关团队",
      key: "relateGroup3thName",
      dataIndex: "relateGroup3thName",
    },
    {
      title: "销售收入",
      key: "saleIncome",
      dataIndex: "saleIncome",
      render: (saleIncome: number) => `¥${saleIncome || 0}`,
    },
    {
      title: "达人分成成本",
      key: "darenOutMoney",
      dataIndex: "darenOutMoney",
      render: (darenOutMoney: number) => `¥${darenOutMoney || 0}`,
    },
    {
      title: "其他成本",
      key: "otherCost",
      dataIndex: "otherCost",
      render: (otherCost: number) => `¥${otherCost || 0}`,
    },
    {
      title: "对公返款",
      key: "rebateCorporate",
      dataIndex: "rebateCorporate",
      render: (rebateCorporate: number) => `¥${rebateCorporate || 0}`,
    },
    {
      title: "对私返款",
      key: "rebatePrivate",
      dataIndex: "rebatePrivate",
      render: (rebatePrivate: number) => `¥${rebatePrivate || 0}`,
    },
    {
      title: "商务实际营收",
      key: "businessRevenue",
      dataIndex: "businessRevenue",
      render: (businessRevenue: number) => `¥${businessRevenue || 0}`,
    },
  ];
  
  const [revenueData, setRevenueData] = useState<RevenueDataType[]>([]);
  const revenueColumns: ColumnsType<any> = [
    {
      key: "businessRevenueSummary",
      title: "商务实际营收",
      dataIndex: "businessRevenueSummary",
    },
  ];
  const [totalSpecialRebate, setTotalSpecialRebate] = useState(0);
  const [totalSpecialRebatePrivate, setTotalSpecialRebatePrivate] = useState(0);

  // 获取特殊收支及营收数据的列表
  const getRevenueList = async () => {
    try {
      const { details, totalBusinessRevenue } = await $getSpecialChargeList({
        opId,
      });
      const datas = details || [];
      setSpecialPaymentsData(datas);

      setTotalSpecialRebate(
        (datas.reduce(
          (total, current) => (total += +current.rebateCorporate),
          0
        ) || 0) +
          (datas.reduce(
            (total, current) => (total += +current.rebatePrivate),
            0
          ) || 0)
      );

      setTotalSpecialRebatePrivate(
        datas.reduce(
          (total, current) => (total += +current.rebatePrivate),
          0
        ) || 0
      );

      setRevenueData([
        {
          businessRevenueSummary: totalBusinessRevenue,
        },
      ]);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  // 获取执行人小组数据
  const getExecutorGroupData = () => {
    $getExecutorGroupData({
      opId,
    })
      .then(res => {
        // console.info(res, "executor");
        setExecutorGroup(res);
      })
      .catch(e => {
        message.error(String(e.message));
      });
  };

  // 获取报价单列表数据
  const getQuotationList = () => {
    setQuotationDataLoading(true);
    $getQuotationList({
      opId,
    })
      .then(res => {
        setQuotationDataLoading(false);
        let quotationData = res;
        const sumObj = {
          platName: "总计",
          accountName: "",
          publishDate: "",
          officePrice: 0,
          coPrice: 0,
          platMoney: 0,
          platOrderCharge: 0,
          rebateRate: 0,
          rebateAmount: 0,
          platOrderMoney: 0,
          costOfSales: 0,
          cusOfflineSupplement: 0,
          companyOfflineSupplement: 0,
          businessRevenue: 0,
          otherIncome: 0,
        } as any;
        if (Object.keys(quotationData || []).length) {
          let rebateRateDen = 0;
          let rebateRateMol = 0;
          quotationData.reduce(
            (prev: QuotationListResType, cur: QuotationListResType) => {
              prev.officePrice += cur.officePrice;
              prev.coPrice += cur.coPrice;
              prev.platMoney += cur.platMoney;
              prev.platOrderMoney += cur.platOrderMoney;
              prev.costOfSales += cur.costOfSales;
              prev.platOrderCharge += cur.platOrderCharge;
              prev.rebateAmount += cur.rebateAmount;
              prev.cusOfflineSupplement += cur.cusOfflineSupplement;
              prev.companyOfflineSupplement += cur.companyOfflineSupplement;
              prev.businessRevenue += cur.businessRevenue;
              prev.otherIncome += cur.otherIncome;
              return prev;
            },
            sumObj
          );
          quotationData.forEach((item: QuotationListResType) => {
            // item.orderFlag = 0
            rebateRateDen += item.officePrice;
            rebateRateMol += item.officePrice * (1 - item.rebateRate / 100);
          });
          if (quotationData.length === 1) {
            quotationData = [...quotationData, sumObj];
          }
          sumObj.rebateRate =
            Number((1 - rebateRateMol / rebateRateDen).toFixed(4)) * 100;

          Object.keys(sumObj).forEach(item => {
            if (
              item !== "platName" &&
              item !== "accountName" &&
              item !== "publishDate" &&
              item !== "orderType"
            ) {
              sumObj[item] = Number(sumObj[item].toFixed(2));
            }
          });

          setMaxPublicePrice(sumObj.companyOfflineSupplement);

          console.info(
            "----sub",
            sumObj.companyOfflineSupplement,
            specialPaymentsData
          );
          // 需要总计的线下应付 + 总计的特殊收支
          setSumOfCompanyOfflineSupp(sumObj.companyOfflineSupplement);
          const hasSumObj = quotationData.find(
            item => item.platName === "总计"
          );
          if (hasSumObj) {
            quotationData = [...quotationData];
          } else {
            quotationData = [...quotationData, sumObj];
          }
        } else {
          quotationData = [];
        }
        console.info("----quotationData", quotationData);
        setQuotationData(quotationData);
      })
      .catch(e => {
        setQuotationDataLoading(false);
        message.error(String(e.message));
      });
  };

  // 获取商机详情
  const getOpportDetail = () => {
    $getOpportDetail({
      id: opId,
    })
      .then(res => {
        const { businessTypeDesc } = res;
        setCommercialOrderType(businessTypeDesc);
        // getDynamicTableColumns(businessTypeDesc);
        getQuotationList();
      })
      .catch(e => {
        message.error(String(e.message));
      });
  };

  const handleModifyQuotation = () => {
    onClose();
    onShowDrawer("edit", opId, true);
  };

  const handleChangeRebatePrivate = (val: number) => {
    setRebatePrivate(val);
    const publicePriceOfComputed =
      sumOfCompanyOfflineSupp + totalSpecialRebate - val < 0
        ? 0
        : sumOfCompanyOfflineSupp + totalSpecialRebate - val;
    setPublicePriceOfComputed(publicePriceOfComputed);
    setFirstChangeFlag(false);
  };

  const handleChangePaymentType = (val: number) => {
    setPaymentType(val);
  };

  // 确认合作的确认按钮
  const handleConfirmCooperateModal = async() => {
    const arr = quotationData
      .filter(
        item =>
          item.orderFlag === null ||
          item.orderDuration === null ||
          item.bfFlag === null ||
          item.sendFlag === null ||
          item.authDuration === null ||
          item.publishDate === "" ||
          item.publishDate === null
      )
      .filter(item => item.platName !== "总计");
    if (!arr.length) {
      form.submit()
    } else {
      let txt = "其他信息";
      arr.forEach((item: any) => {
        if (item.orderFlag === null) {
          txt = "下单状态";
        }
      });
      message.warning(`${txt}未填完，无法提交`);
    }
  };

  const disabledCurrentDate = (currentDate: Moment) =>
    currentDate && currentDate >= moment();

  // 动态加载更新确认合作生成商单的步骤条
  const handleDynamicLoadingConfirmCoop = () => {
    // 每个步骤进度的加载
    function dynamicLoadingPercent(isLast: boolean) {
      let newPercent = 0
      setConfirmCoopCurPercent(0)
      function loadingPercent () {
        const randomPercent = isLast ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 5)
        newPercent += randomPercent
        setConfirmCoopCurPercent(newPercent)
        console.info(newPercent, 'newPercent-----')
        console.info(isLast, '----last')
        if ((isLast && newPercent < 90) || (!isLast && newPercent < 100)) {
          requestAnimationFrame(loadingPercent)
        }
      }
      loadingPercent()
    }

    // 每个步骤的加载
    const timeInterval = setInterval(() => {
      let newCurStep = -1
      setConfirmCoopCurStep(step => {
        let isLast = false
        newCurStep = step + 1
        if (newCurStep >= confirmCoopLoadingStepArr.length - 1) {
          clearInterval(timeInterval)
          isLast = true
        } 
        dynamicLoadingPercent(isLast)
        
        return newCurStep
      })
    }, 1500)

    setTimeInterval(timeInterval)
  }

  // 确认合作的表单确认
  const handleFinishConfirmCooperateForm = (
    params: ConfirmCooperationParamsType
  ) => {
    let rebateCorporate = 0;
    let rebatePrivate = 0;

    if (params.rebateType === 1) {
      rebateCorporate = maxPublicePrice + totalSpecialRebate;
    } else if (params.rebateType === 2) {
      rebatePrivate = maxPublicePrice + totalSpecialRebate;
    } else if (params.rebateType === 3) {
      if (!Number(params.rebatePrivate)) {
        message.error("对私返点需大于0");
        return;
      }
      rebatePrivate = Number(params.rebatePrivate);
      rebateCorporate = publicePriceOfComputed;
    }

    if (orderTime) {
      params.orderTime = orderTime;
    }
    const quotationForConfirmCoopDTOS: ConfirmCoopDTOSType[] = [];
    quotationData
      .filter(item => item.platName !== "总计")
      .forEach(item => {
        const {
          quotationId,
          orderFlag,
          orderDuration,
          bfFlag,
          sendFlag,
          authDuration,
          specialCase = "",
          publishDate,
        } = item;
        const obj: ConfirmCoopDTOSType = {
          quotationId,
          orderFlag,
          orderDuration,
          bfFlag,
          sendFlag,
          authDuration,
          specialCase,
          publishDate,
        };
        quotationForConfirmCoopDTOS.push(obj);
      });

    setShowConfirmCoopLoadingModal(true)

    // 动态加载更新确认合作生成商单的步骤条
    handleDynamicLoadingConfirmCoop()

    $confirmCooperation({
      ...params,
      rebateCorporate,
      rebatePrivate,
      opId,
      quotationForConfirmCoopDTOS,
    })
      .then((res: any) => {
        if (res) {
          if (res && res.length) {
            setInvolveAccounts(res);
            setPublishDateModal(true);
          } else {
            message.success("操作成功");
            setConfirmCoopCurStep(3);
            setConfirmCoopCurPercent(100);
            clearInterval(timeInterval)
            setTimeout(() => {
              setShowConfirmCoopLoadingModal(false);
              onGetList();
              onClose();
            }, 300)
          }
        }
      })
      .catch(e => {
        setConfirmCoopCurStep(-1);
        setConfirmCoopCurPercent(0);
        setShowConfirmCoopLoadingModal(false);
        message.error(String(e.message));
      });
  };

  const onChangeOrderTime = (e: any) => {
    const time = moment(new Date(e?._d)).format("YYYY-MM-DD");
    setOrderTime(time);
  };

  const getCurPropsText = (str: string) => {
    let text = "";
    switch (str) {
      case "orderFlag":
        text = "下单状态";
        break;
      case "orderDuration":
        text = "下单时长";
        break;
      case "bfFlag":
        text = "是否出bf";
        break;
      case "sendFlag":
        text = "是否寄品";
        break;
      case "authDuration":
        text = "授权情况";
        break;
      case "publishDate":
        text = "发布档期";
        break;
      default:
        break;
    }

    return text;
  };
  const getCurValText = (str: string, val: any) => {
    const getAuthorizationText = (num: number) => {
      let authorizationText = "";
      switch (num) {
        case 0:
          authorizationText = "不授权";
          break;
        case 1:
          authorizationText = "授权1个月";
          break;
        case 2:
          authorizationText = "授权3个月";
          break;
        case 3:
          authorizationText = "授权6个月";
          break;
        default:
          break;
      }
      return authorizationText;
    };
    let text = "";
    switch (str) {
      case "orderFlag":
        text = val ? (val === 1 ? "已下单" : "无须下单") : "未下单";
        break;
      case "orderDuration":
        text = val === 0 ? "20s" : val === 1 ? "60s" : "60s+";
        break;
      case "bfFlag":
      case "sendFlag":
        text = val ? "是" : "否";
        break;
      case "authDuration":
        text = getAuthorizationText(val);
        break;
      case "publishDate":
        text = val;
        break;
      default:
        break;
    }

    return text;
  };

  // 确认自动填充其他信息
  const handleConfirmAutoFillMsg = () => {
    // 第一次编辑且该字段是下单状态时，自动填充空的项
    if (!secondEdit && curChangeProps === "orderFlag") {
      quotationData
        .filter(
          item => item[curChangeProps as keyof typeof quotationProps] === null
        )
        .forEach(item => {
          item[curChangeProps as keyof typeof quotationProps] = curChangeVal;
        });
      setSecondEdit(true);
    } else {
      quotationData.forEach(item => {
        item[curChangeProps as keyof typeof quotationProps] = curChangeVal;
      });
    }

    setShowAutoFillModal(false);
  };

  // 获取下单时长和授权情况下拉数据
  const getSelectDataList = async () => {
    const {
      business_quotation_order_duration,
      business_quotation_auth_duration,
    } = await $getByDictType({
      dictTypes: [
        "business_quotation_order_duration",
        "business_quotation_auth_duration",
      ],
    });
    setOrderDurationSelectData(business_quotation_order_duration);
    setAuthorizationSelectData(business_quotation_auth_duration);
  };

  // 根据特殊收支的值选择线下返款的支付方式的范围
  const choosePaymentType = () => {
    // 对私和对公都有值
    if (
      totalSpecialRebatePrivate &&
      totalSpecialRebate - totalSpecialRebatePrivate
    ) {
      return [paymentTypesArr[2]];
    }

    // 仅对私有值 可选对私 对公+对私
    if (totalSpecialRebatePrivate) {
      return [paymentTypesArr[1], paymentTypesArr[2]];
    }

    // 仅对公有值 可选对公 对公+对私
    if (totalSpecialRebate - totalSpecialRebatePrivate) {
      return [paymentTypesArr[0], paymentTypesArr[2]];
    }

    return paymentTypesArr;
  };

  useEffect(() => {
    getRevenueList();
  }, []);

  useEffect(() => {
    if (!show) return;
    getOpportDetail();
    getExecutorGroupData();
    getSelectDataList();
  }, [show]);
  return (
    <>
      <Modal
        title="确认合作"
        visible={show}
        width="100%"
        maskClosable={false}
        onCancel={() => setShowCloseModal(true)}
        footer={[
          <Button key={1} onClick={() => setShowCloseModal(true)}>
            取消
          </Button>,
          <Button
            key={2}
            type="primary"
            // loading={loading}
            onClick={handleConfirmCooperateModal}
          >
            确认合作，生成商单
          </Button>,
        ]}
      >
        {
          // 不找号商机不显示报价单
          Number(opType) !== 2 && (
            <div className={styles.quotationWrap}>
              <div className={styles.quotationHeader}>
                <h3>报价单</h3>
                <Button type="link" onClick={handleModifyQuotation}>
                  修改报价单
                </Button>
              </div>
              <div className={styles.quotationBody}>
                <div className={styles.quotationBodyHeader}>
                  商单类型：<span>{commercialOrderType}</span>
                </div>
                <Spin spinning={quotationDataLoading}>
                  <Table
                    rowKey={row => row.accountName}
                    bordered
                    scroll={{ x: "max-content" }}
                    columns={
                      (commercialOrderType === "客户自行下单" || commercialOrderType === "平台营收")
                        ? columnsForCustomer
                        : commercialOrderType === "代客下单"
                        ? columnsForPlacing
                        : columnsForPrivate
                    }
                    dataSource={quotationData}
                    pagination={false}
                  />
                </Spin>
              </div>
            </div>
          )
        }
        <div className="m-t-24">
          <h3>特殊收支</h3>
          <Table
            rowKey={row => row.id}
            columns={specialPayments}
            dataSource={specialPaymentsData}
            pagination={false}
            bordered
            summary={() =>
              !!specialPaymentsData.length && (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <p style={{ textAlign: "center", fontWeight: "500" }}>
                        总计
                      </p>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <p style={{ textAlign: "center", fontWeight: "500" }}>
                        {`¥${
                          specialPaymentsData.reduce(
                            (total, current) => (total += +current.saleIncome),
                            0
                          ) || 0
                        }`}
                      </p>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <p style={{ textAlign: "center", fontWeight: "500" }}>
                        {`¥${
                          specialPaymentsData.reduce(
                            (total, current) =>
                              (total += +current.darenOutMoney),
                            0
                          ) || 0
                        }`}
                      </p>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      <p style={{ textAlign: "center", fontWeight: "500" }}>
                        {`¥${
                          specialPaymentsData.reduce(
                            (total, current) => (total += +current.otherCost),
                            0
                          ) || 0
                        }`}
                      </p>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>
                      <p style={{ textAlign: "center", fontWeight: "500" }}>
                        {`¥${
                          specialPaymentsData.reduce(
                            (total, current) =>
                              (total += +current.rebateCorporate),
                            0
                          ) || 0
                        }`}
                      </p>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      <p style={{ textAlign: "center", fontWeight: "500" }}>
                        {`¥${
                          specialPaymentsData.reduce(
                            (total, current) =>
                              (total += +current.rebatePrivate),
                            0
                          ) || 0
                        }`}
                      </p>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7}>
                      <p style={{ textAlign: "center", fontWeight: "500" }}>
                        {`¥${
                          specialPaymentsData.reduce(
                            (total, current) =>
                              (total += +current.businessRevenue),
                            0
                          ) || 0
                        }`}
                      </p>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )
            }
          />
        </div>

        <div className="m-t-24" style={{ width: "20%" }}>
          <h3>营收汇总</h3>
          <Table
            rowKey="businessRevenueSummary"
            columns={revenueColumns}
            dataSource={revenueData}
            pagination={false}
            bordered
          />
        </div>
        <div className={styles.otherMsgWrap}>
          <h3>其他信息</h3>
          <Form form={form} onFinish={handleFinishConfirmCooperateForm}>
            {
              // 线下应付 + 特殊总返款 有值，才显示线下返款的下拉框
              !!(
                (quotationData?.[quotationData.length - 1]
                  ?.companyOfflineSupplement || 0) + totalSpecialRebate
              ) && (
                <div className={styles.paymentTypeWrap}>
                  <Form.Item
                    label="我们线下返款的支付方式"
                    name="rebateType"
                    rules={[
                      { required: true, message: "请选择线下返款的支付方式" },
                    ]}
                    style={{ width: "24%", marginRight: "26px" }}
                  >
                    <Select
                      allowClear
                      placeholder="请选择"
                      options={choosePaymentType()}
                      className={styles.paymentSelectItem}
                      onChange={handleChangePaymentType}
                    />
                  </Form.Item>
                  {paymentType ? (
                    <div className={styles.paymentTipWrap}>
                      {paymentType === 1 ? (
                        <div className={styles.rebateItem}>
                          对公返点合计：
                          {sumOfCompanyOfflineSupp + totalSpecialRebate}
                        </div>
                      ) : (
                        ""
                      )}
                      {paymentType === 2 ? (
                        <div className={styles.rebateItem}>
                          对私返点合计：
                          {sumOfCompanyOfflineSupp + totalSpecialRebate}
                        </div>
                      ) : (
                        ""
                      )}
                      {paymentType === 3 ? (
                        <div className={styles.paymentTip}>
                          <span>
                            对私返点合计：
                            <Form.Item
                              name="rebatePrivate"
                              className={styles.inputItem}
                            >
                              <InputNumber
                                placeholder="请输入"
                                min={0}
                                max={maxPublicePrice + totalSpecialRebate}
                                controls={false}
                                value={rebatePrivate}
                                onChange={handleChangeRebatePrivate}
                              />
                            </Form.Item>
                          </span>
                          <span>
                            对公返点合计：
                            {firstChangeFlag
                              ? maxPublicePrice + totalSpecialRebate
                              : publicePriceOfComputed}
                          </span>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              )
            }
            <Form.Item
              label="执行人小组"
              name="executorGroupId"
              rules={[{ required: true, message: "请选择执行人小组" }]}
            >
              <Select
                placeholder="请选择执行人小组"
                className={styles.executorSelectItem}
              >
                {executorGroup.map(item => (
                  <Option value={item.id} key={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* <Form.Item
              label="成单日期"
              name="orderTime"
              rules={[{ required: true, message: "请选择成单日期" }]}
            >
              <DatePickers
                style={{ width: 180 }}
                format="YYYY-MM-DD"
                showNow={false}
                onChange={onChangeOrderTime}
                disabledDate={disabledCurrentDate}
                placeholder="请选择成单日期"
              />
            </Form.Item> */}
          </Form>
        </div>
      </Modal>
      {/* 是否自动填充的弹窗 */}
      <Modal
        visible={showAutoFillModal}
        closable={false}
        cancelText="不需要"
        okText="需要"
        onOk={handleConfirmAutoFillMsg}
        onCancel={() => setShowAutoFillModal(false)}
      >
        <p>
          其他账号的【{getCurPropsText(curChangeProps)}
          】选项是否需要帮您自动填充为【
          {getCurValText(curChangeProps, curChangeVal)}】
        </p>
      </Modal>

      {/* 关闭时的弹窗提示 */}
      <Modal
        visible={showCloseModal}
        closable={false}
        onOk={onClose}
        onCancel={() => setShowCloseModal(false)}
      >
        <p>本页面信息尚未保存，确认关闭？</p>
      </Modal>

      {/* 当前账号所选的发布档期在档期管理被占用 */}
      <Modal
        title="提示"
        visible={showPublishDateModal}
        closable={false}
        onOk={() => {
          setPublishDateModal(false);
        }}
        onCancel={() => setPublishDateModal(false)}
      >
        <p>
          <ExclamationCircleOutlined
            style={{ color: "#fea20d", marginRight: "6px" }}
          />
          报价单中部分账号所填写的发布档期和账号的实际档期冲突，请修改后重试。
        </p>
        <p>涉及账号：{involveAccounts.join()}</p>
      </Modal>

      {/* 确认合作生成订单的加载弹窗 */}
      <Modal
        visible={showConfirmCoopLoadingModal}
        closable={false}
        footer={null}
        centered
        destroyOnClose
        bodyStyle={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '50px 24px',
        }}
      >
        <Steps
          current={confirmCoopCurStep}
          percent={confirmCoopCurPercent}
          labelPlacement="vertical"
        >
          {confirmCoopLoadingStepArr.map((item: any) => (
            <Step key={item.id} title={item.title} />
          ))}
        </Steps>

        <div className={styles.loadingOutlinedWrap}>
          <LoadingOutlined className={styles.loadingOutlinedStyle} spin />
          <p>处理中...</p>
        </div>
      </Modal>
    </>
  );
};

export default memo(ConfirmCooperateModal);

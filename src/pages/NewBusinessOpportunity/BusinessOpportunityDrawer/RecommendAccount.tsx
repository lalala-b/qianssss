/* eslint-disable arrow-parens */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable consistent-return */
/* eslint-disable css-modules/no-unused-class */
import { useState, useEffect } from "react";
import {
  Button,
  Popover,
  Table,
  message,
  DatePicker,
  InputNumber,
  Tooltip,
  Input,
  Modal,
  Select,
  Tag,
} from "antd";
import {
  QuestionCircleOutlined,
  FormOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/lib/table";
import moment from "moment";
import qs from "qs";
import cs from "classnames";
import {
  $getPlatList,
  $getAccountList,
  $getCoStatusList,
  $getRcStatusList,
  GetOppAccountListItemType,
  $getOppAccountList,
  $editSubTask,
  $firstRoundApproval,
  $customerPreApproval,
  $resendSecondConfirmFeiShu,
  $businessQuotationChange,
  $checkExportQuotation,
  BussinessOpportunityDetailResType,
  $getJumpUrl,
  $batchCustomerApproval,
  $checkOrderStatus,
  $cancelSubTaskCooperated,
  CancelSubTaskCooperatedParamsType,
  $cancelSubTask,
  $reset2RoundApproval,
  $getDqManagementData,
  $getReasonOptions,
  ReasonOptionsType,
} from "src/api/business";
import IconTip from "src/components/IconTip";
import AccountCard from "src/components/AccountCard";
import Search, { SearchConfigItemPropsType } from "src/components/Search";
import { toThousands, toThousandsW } from "src/utils/number";
// import { GlobalContext } from "src/contexts/global";
import { AnyARecord } from "dns";
import EditPriceModal from "./NEditPriceModal";
import styles from "./BusinessOpportunityDrawer.scss";
import rStyles from "./RecommendAccount.scss";

const { TextArea } = Input;
const { Option } = Select;

const REFUND_TYPE_ARR = [
  { id: 1, label: "对公" },
  { id: 2, label: "对私" },
  { id: 3, label: "对公+对私" },
];

type CanEditType =
  | "editCoDate"
  | "editCoPrice"
  | "editOfficialPrice"
  | "editOtherIncome"
  | "editPlatOrderMoney"
  | "editPlatMoney"
  | "editPlatOrderCharge"
  | "editReason"
  | "editRebateRate"
  | "editRebateAmount"
  | "editCusOfflineSupplement";
type EditType =
  | "coDate"
  | "coPrice"
  | "officialPrice"
  | "otherIncome"
  | "platOrderMoney"
  | "platMoney"
  | "platOrderCharge"
  | "reason"
  | "rebateRate"
  | "rebateAmount"
  | "cusOfflineSupplement";

const DatePickers: any = DatePicker;

interface RecommendAccountPropsType {
  id?: number | string;
  type: DrawerType;
  detail: BussinessOpportunityDetailResType | Record<string, never>;
  onChangeTab: (key: string) => void;
  onRefesh: (flag?: boolean) => void;
  onLoadDetail: () => void;
}

const RecommendAccount: React.FC<RecommendAccountPropsType> = ({
  id,
  type,
  detail,
  onRefesh,
  onChangeTab,
  onLoadDetail,
}) => {
  const [searchData, setSearchData] = useState<any>({
    pageNum: 1,
    size: 20,
  });
  // 已经成单的日期
  const [outDay, setOutDay] = useState<any>([]);
  const [searchConfig, setSearchConfig] = useState<SearchConfigItemPropsType[]>(
    [
      {
        type: "select",
        key: "taskDetailAccountType",
        data: [
          {
            val: 1,
            label: "乾派自营",
          },
          {
            val: 2,
            label: "签约",
          },
          {
            val: 3,
            label: "媒介",
          },
          {
            val: 4,
            label: "海盗自营",
          },
          {
            val: 5,
            label: "海盗投放",
          },
        ],
        conf: { placeholder: "请选择账号类型" },
        optionLabelKey: "label",
        optionValKey: "val",
        className: styles.recommendSelect,
      },
      {
        type: "select",
        key: "accountPlat",
        data: [],
        conf: { placeholder: "请选择平台" },
        optionLabelKey: "platName",
        optionValKey: "platId",
        className: styles.recommendSelect,
      },
      {
        type: "select",
        key: "accountId",
        data: [],
        conf: { placeholder: "请选择账号" },
        optionLabelKey: "accountName",
        optionValKey: "accountId",
        className: styles.recommendSelect,
      },
      {
        type: "select",
        key: "rcStatusList",
        data: [],
        conf: {
          placeholder: "推荐状态",
          multiple: true,
          maxTagCount: 1,
        },
        optionLabelKey: "name",
        optionValKey: "id",
        className: styles.recommendSelect,
      },
      {
        type: "select",
        key: "coStatusList",
        data: [],
        conf: {
          placeholder: "合作状态",
          multiple: true,
          maxTagCount: 1,
        },
        optionLabelKey: "name",
        optionValKey: "id",
        className: styles.recommendSelect,
      },
    ]
  );
  // const [screenPlat, setScreenPlat] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [exportQuotationLoading, setExportQuotationLoading] = useState(false);
  const [totalNum, setTotalNum] = useState(0);
  const [tableList, setTableList] = useState<GetOppAccountListItemType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [sortParams, setSortParams] = useState<{ determined?: string }>({});
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showEditTip, setShowEditTip] = useState<boolean>(false);
  // const { globalData = {} } = useContext(GlobalContext);
  const [curEditMsg, setCurEditMsg] = useState<GetOppAccountListItemType>();
  const [showPlatSlect, setShowPlatSlect] = useState<boolean>(false);
  const [platList, setPlatList] = useState<any>([]);
  const [slectPlatId, setSelectPlats] = useState<any>();
  const [cancelId, setCancelId] = useState<number>(0);
  const [cancelTotalRefund, setCancelTotalRefund] = useState(0);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>();
  const [refundType, setRefundType] = useState<string | number>();
  const [refundInput, setRefundInput] = useState<any>("");
  const [reasonOptions, setReasonOptions] = useState<ReasonOptionsType[]>([]);
  const [cancelReasonType,setCancelReasonType] = useState<any>("")
  const [showReasonDesc,setShowReasonDesc]=useState<boolean>(false)
  const { $permission } = window;

  // const curLoginUsername = globalData?.user?.userInfo.realname || {};
  // console.info(curLoginUsername, 'curLogin')

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: React.Key[]
  ) => {
    const seletKey: any[] = [];
    selectedRows.forEach((item: any) => {
      seletKey.push(item.id);
    });
    setSelectedRowKeys(seletKey);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: any) => ({
      disabled: record.coStatus !== 0, // Column configuration not to be checked
      coStatus: record.coStatus,
    }),
  };
  const handleEdit = (index: number, key: CanEditType) => {
    const newTableList: any = [...tableList];
    newTableList[index][key] = !newTableList[index][key];
    setTableList(newTableList);
  };

  const getOppAccountList = async (params?: any) => {
    try {
      setTableLoading(true);
      const { total, list } = await $getOppAccountList({
        ...searchData,
        ...(sortParams || {}),
        ...(params || {}),
        opId: id,
      });

      setTableLoading(false);

      setTotalNum(total);

      setTableList(
        (list || []).map((item: any) => {
          const newItem = { ...item };
          newItem.editCoDate = false;
          newItem.editCoPrice = false;
          newItem.editOfficialPrice = false;
          newItem.editPlatOrderMoney = false;
          newItem.editPlatMoney = false;
          newItem.editPlatOrderCharge = false;
          return newItem;
        })
      );
      // if (params?.accountPlat) {
      //   setScreenPlat(true);
      // } else {
      //   setScreenPlat(false);
      // }
    } catch (e: any) {
      setTableLoading(false);
      message.error(String(e.message));
    }
  };
  const handleChangeEditItem = (index: number, key: EditType, e: any) => {
    const newTableList: any = [...tableList];
    if (key === "reason") {
      newTableList[index][key] = e ? e.target.value : "";
    } else if (
      [
        "platOrderMoney",
        "platMoney",
        "platOrderCharge",
        "otherIncome",
        "officialPrice",
        "rebateRate",
      ].includes(key)
    ) {
      newTableList[index][key] = e;
    } else {
      newTableList[index][key] = e
        ? key === "coDate"
          ? e.format("YYYY-MM-DD")
          : e
        : "";
    }
    setTableList(newTableList);
  };

  const handleBlur = async (index: number, key: EditType, e: any) => {
    if ((key === "coPrice" || key === "coDate") && !tableList[index][key]) {
      if (key === "coPrice") {
        message.error("合作价格（售价）需大于0");
      }
      if (key === "coDate") {
        message.error("档期不能为空");
      }
      // if (key === "officialPrice") {
      //   message.error("平台报价（原价）需大于0");
      // }
      return;
    }
    try {
      setTableLoading(true);
      await $editSubTask({
        subTaskId: tableList[index].id,
        [key]: tableList[index][key],
      });
      message.success("编辑成功");
      getOppAccountList();
    } catch (e: any) {
      setTableLoading(false);
      const newTableList: any = [...tableList];
      newTableList[index].editCoDate = false;
      newTableList[index].editCoPrice = false;
      newTableList[index].editOfficialPrice = false;
      newTableList[index].editPlatOrderMoney = false;
      newTableList[index].editPlatMoney = false;
      newTableList[index].editPlatOrderCharge = false;
      setTableList(newTableList);
      message.error(e.message);
    }
  };
  const handleGetJumpUrl = (row: any) => {
    try {
      $getJumpUrl({ userid: row.taskFollower })
        .then(res => {
          if (res && res.jumpUrl) {
            window.open(res.jumpUrl, "_blank");
          }
        })
        .catch((e: any) => {
          message.error(e.message);
        });
    } catch (error) {
      console.info(error);
    }
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
  const getReasonOptions = async () => {
    try {
      const data: ReasonOptionsType[] = await $getReasonOptions();
      if (data && data.length) {
        setReasonOptions([...data]);
      }
    } catch (error) {
      console.info(error);
    }
  };
  const handleFocus = (row: any) => {
    getDqManagementData(row.accountId);
  };
  // const handleCancelEdit = (e: React.MouseEvent<HTMLElement>) => {
  //   e.stopPropagation();
  // }

  // const handleStopFinding = async () => {
  //   try {
  //     setStopLoading(true);
  //     await $stopFinding({ opId: Number(id) });
  //     message.success("已停止找号");
  //     setStopLoading(false);
  //     onLoadDetail();
  //   } catch (e: any) {
  //     setStopLoading(false);
  //     message.error(e.message || "停止选号失败，请重试");
  //   }
  // };

  // const handleConfirmChoose = async () => {
  //   try {
  //     setConfirmLoading(true);
  //     const { type, noConfirmAccounts, confirmAccounts } = await $confirmChoose(
  //       { opId: Number(id), isFinal: 1 }
  //     );

  //     console.info("---", noConfirmAccounts, confirmAccounts);

  //     // 无需完善信息
  //     if (type === 1) {
  //       setConfirmLoading(false);
  //       Modal.confirm({
  //         title: (
  //           <div>
  //             目前客户
  //             <span style={{ color: "#ff0000" }}>
  //               已确认{confirmAccounts || 0}个账号
  //             </span>
  //             ，仍有{noConfirmAccounts || 0}个账号未确认。
  //           </div>
  //         ),
  //         content: (
  //           <div>
  //             <p style={{ fontWeight: "bold" }}>点击确定后：</p>
  //             <p>未确认的账号状态将被自动更新为“客户已驳回”状态。</p>
  //             <br />
  //             <p>
  //               同时，已确认的账号将发送飞书通知给相关账号运营人，进行账号二次定询。所有账号定询后，才可创建报价单。
  //             </p>
  //           </div>
  //         ),
  //         okText: "确定",
  //         cancelText: "取消",
  //         onOk: async () => {
  //           setConfirmLoading(true);
  //           try {
  //             await $confirmChoose({ opId: Number(id), isFinal: 2 });
  //             onRefesh();
  //             message.success({
  //               content: (
  //                 <span style={{ textAlign: "left", display: "inline-block" }}>
  //                   <b>状态更新成功</b>
  //                   <br />
  //                   <span>已发送消息通知相关账号负责人进行二次定询。</span>
  //                 </span>
  //               ),
  //               className: styles.successMessage,
  //             });
  //             setConfirmLoading(false);
  //           } catch (e: any) {
  //             setConfirmLoading(false);
  //             message.error(String(e.message) || "请重试");
  //           }
  //         },
  //       });
  //     }

  //     // 需要完善信息
  //     if (type === 2) {
  //       setConfirmLoading(false);
  //       Modal.confirm({
  //         title: "操作失败",
  //         content: (
  //           <div>
  //             <p>该商机未完善品牌与预计发布时间信息，无法二次定询账号。</p>
  //           </div>
  //         ),
  //         okText: "完善信息",
  //         cancelText: "取消",
  //         onOk: () => {
  //           onChangeTab("1");
  //         },
  //       });
  //       return;
  //     }

  //     // 需完善价格档期
  //     if (type === 3) {
  //       setConfirmLoading(false);
  //       Modal.warning({
  //         title: "操作失败",
  //         content: (
  //           <div>
  //             <p>
  //               部分已初筛通过的账号没有确认原价、售价或档期。请完善上述信息。
  //             </p>
  //           </div>
  //         ),
  //       });
  //       return;
  //     }

  //     // 没有客户初筛通过的账号
  //     if (type === 4) {
  //       setConfirmLoading(false);
  //       Modal.warning({
  //         title: "操作失败",
  //         content: (
  //           <div>
  //             <p>没有客户初筛通过的账号，请先在下方选择客户选中的账号。</p>
  //           </div>
  //         ),
  //       });
  //       return;
  //     }

  //     // 直接请求，无任何异常
  //     if (type === 5) {
  //       try {
  //         await $confirmChoose({ opId: Number(id), isFinal: 2 });
  //         message.success("客户确认选号成功");
  //         setConfirmLoading(false);
  //         onLoadDetail();
  //       } catch (e: any) {
  //         setConfirmLoading(false);
  //         message.error(String(e.message) || "请重试");
  //       }
  //     }
  //   } catch (e: any) {
  //     setConfirmLoading(false);
  //     message.error(e.message || "客户确认选号失败，请重试");
  //   }
  // };

  // 所有操作的事件
  const handleOperation = async (api: any, text: string, params: any) => {
    try {
      setTableLoading(true);
      await api(params);
      message.success(`${text}成功`);
      getOppAccountList();
    } catch (e: any) {
      setTableLoading(false);
      message.error(e.message || `${text}失败，请重试`);
    }
  };

  // 打开编辑修改报价的弹窗
  const openModifyPrice = async (record: GetOppAccountListItemType) => {
    try {
      // message.error('改价功能存在需优化点，待周一重新开放，敬请见谅!')
      // const { cusOfflineSupplement, companyOfflineSupplement } = record;
      // if (
      //   cusOfflineSupplement - companyOfflineSupplement === 0 &&
      //   cusOfflineSupplement &&
      //   companyOfflineSupplement
      // ) {
      //   message.error("该账号暂无法修改此金额，请联系产品林良杰");
      //   return;
      // }
      await $checkOrderStatus({ taskDetailId: record.id });
      setShowEditTip(true);
      setCurEditMsg(record);
    } catch (e: any) {
      message.warning(e?.message);
    }
  };

  // 批量通过
  const handleBatchPass = async () => {
    try {
      setTableLoading(true);
      await $batchCustomerApproval({ taskDetailIdList: selectedRowKeys });
      message.success(`账号批量通过成功`);
      getOppAccountList();
      setSelectedRowKeys([]);
    } catch (e: any) {
      setTableLoading(false);
      message.error(e.message || `账号批量通过失败，请重试`);
    }
  };

  const handleCancelCooperation = async (record: GetOppAccountListItemType) => {
    try {
      await $checkOrderStatus({ taskDetailId: record.id, type: 1 });
    } catch (e: any) {
      message.warning(e?.message);
      return;
    }

    Modal.confirm({
      content:
        "确认取消该账号的合作？取消后已生成的工单也将被一并取消合作，请务必先和相关人员沟通拉齐",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        const { totalRefund } = await $cancelSubTask({ subTaskId: record.id });
        setCancelId(record.id);
        setCancelTotalRefund(totalRefund);
        setShowRefundDialog(true);
      },
    });
  };

  const COLUMNS = [
    {
      title: "账号名称",
      dataIndex: "accountId",
      width: 220,
      key: "accountId",
      render: (_: string, record: GetOppAccountListItemType) => {
        const { accountBelong, birthday, sex, areaName } =
          record.accountBaseInfoVo || {};
        return (
          <AccountCard
            info={{
              ...(record.accountBaseInfoVo || {}),
              accountId: record.accountId,
              accountName: record.accountName,
            }}
            options={{ xingtuUrl: "xingtuUrl" }}
            middle={
              <>
                {accountBelong && (
                  <div className={styles.accountInfo}>
                    <span
                      className={
                        accountBelong.indexOf("已下架") !== -1
                          ? rStyles.terminateTip
                          : ""
                      }
                    >
                      {accountBelong}
                    </span>
                  </div>
                )}
                {[birthday, sex, areaName].filter(item => item).join("/") && (
                  <div className={styles.accountInfo}>
                    {[birthday, sex, areaName].filter(item => item).join("/")}
                  </div>
                )}
              </>
            }
          />
        );
      },
    },
    {
      title: (
        <>
          <span className={rStyles.coDateTitle}>*</span>
          档期
        </>
      ),
      dataIndex: "coDate",
      width: 230,
      key: "coDate",
      render: (_: string, record: GetOppAccountListItemType, index: number) => (
        <>
          {record.editCoDate && type !== "detail" ? (
            <>
              <DatePickers
                value={_ ? moment(_) : ""}
                allowClear={false}
                placeholder="选择档期"
                autoFocus
                // getPopupContainer={() =>
                //   document.getElementById("myPublishDate")
                // }
                // disabledDate={disableDate}
                // renderExtraFooter={() =>
                //   outDay.length ? "红色日期表示已成单" : ""
                // }
                onChange={(e: moment.Moment) =>
                  handleChangeEditItem(index, "coDate", e)
                }
                onFocus={() => handleFocus(record)}
                onBlur={(e: any) => handleBlur(index, "coDate", e)}
              />
            </>
          ) : (
            <span>{_ || "--"}</span>
          )}

          {!record.editCoDate && type !== "detail" && (
            <Button
              className="m-l-6"
              size="small"
              icon={record.editCoDate ? <CheckOutlined /> : <FormOutlined />}
              onClick={() => handleEdit(index, "editCoDate")}
            />
          )}
          {/* <Button onClick={handleCancelEdit}>取消</Button> */}
        </>
      ),
    },
    {
      title: "合作类型",
      dataIndex: "orderType",
      width: 120,
      key: "orderType",
      render: (orderType: number) => {
        const getOrderType = (orderType: number) => {
          let str = "";
          switch (orderType) {
            case 1:
              str = "视频工单";
              break;
            case 2:
              str = "特殊工单";
              break;
            default:
              break;
          }

          return str;
        };
        return <span>{getOrderType(orderType) || "--"}</span>;
      },
    },
    {
      title: (
        <>
          商务实际营收
          <IconTip
            content={
              <>
                <p>即我们跟客户合作该账号，我们最终收取客户的费用。</p>
                <p>商务实际营收 = 平台报价-返点金额 + 其他收入 + 手续费收入</p>
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
      width: "160px",
      render: (_: any) => (
        <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
      ),
      sorter: true,
    },
    {
      title: (
        <>
          平台报价（全部）
          <IconTip content="刊例价，又称平台官方零售价（未扣除返点的）" />
        </>
      ),
      dataIndex: "accountOfficialPriceVo",
      key: "accountOfficialPriceVo",
      width: 240,
      render: (_: any, record: GetOppAccountListItemType) => (
        <>
          {record?.accountOfficialPriceVo?.priceInfoVoList.map(item => (
            <div className={styles.accountOfficialPrice} key={item.priceType}>
              <span className={styles.priceType}>{item.priceType}：</span>
              <span>¥{toThousandsW(item.priceVal)}</span>
            </div>
          ))}
          {record.priceTime ? (
            <div className={rStyles.updateTime}>
              <Tag>更新时间：{record.priceTime.slice(0, -3) || "--"}</Tag>
            </div>
          ) : (
            ""
          )}
        </>
      ),
    },
    {
      title: "预估毛利率",
      dataIndex: "grossRate",
      key: "grossRate",
      width: 180,
      sorter: true,
      render: (_: string, record: GetOppAccountListItemType) =>
        +record.needJudgeGross === 1 ? (
          // 先判断毛利率是否未到标准  accountType=3 媒介账号 媒介账号不需要判断毛利率 只判断毛利
          record.grossRate < record.minGrossRate &&
          +record.accountType !== 3 ? (
            <>
              <div className={cs("m-b-6", rStyles.errorGrossProfit)}>{_}%</div>
              <div className={rStyles.errorGrossProfit}>
                （毛利率需 ≥ {record.minGrossRate}
                %，建议适当提高报价或降低返点金额）
              </div>
            </>
          ) : // 毛利率如果达到 在判断毛利值 是否达到
          record.grossMoney < record.minGrossMoney ? (
            <>
              <div className={cs("m-b-6", rStyles.errorGrossProfit)}>{_}%</div>
              <div className={rStyles.errorGrossProfit}>
                （毛利需 ≥ ¥{record.minGrossMoney}
                ，建议适当提高报价或降低返点金额）
              </div>
            </>
          ) : (
            `${_ === null ? "--" : `${_ || 0}%`}`
          )
        ) : (
          `${_ === null ? "--" : `${_ || 0}%`}`
        ),
    },
    {
      title: (
        <>
          平台报价
          <IconTip content="根据客户选择的订单类型，如21~60s，对应的刊例价" />
        </>
      ),
      dataIndex: "officialPrice",
      key: "officialPrice",
      width: 160,
      sorter: true,
      render: (_: number, record: GetOppAccountListItemType, index: number) => (
        <>
          {record.editOfficialPrice && type !== "detail" ? (
            <>
              <InputNumber
                value={_}
                min={0}
                autoFocus
                className="editOfficialPrice"
                onChange={(e: number) =>
                  handleChangeEditItem(index, "officialPrice", e)
                }
                onBlur={(e: any) => handleBlur(index, "officialPrice", e)}
              />
            </>
          ) : (
            <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
          )}

          {!record.editOfficialPrice && type !== "detail" && (
            <Button
              className="m-l-6"
              size="small"
              icon={
                record.editOfficialPrice ? <CheckOutlined /> : <FormOutlined />
              }
              onClick={() => handleEdit(index, "editOfficialPrice")}
            />
          )}
        </>
      ),
    },
    // {
    //   title:  (
    //     <>
    //       合作价格（售价）
    //       <IconTip content={
    //         (
    //           <>
    //             <p>即我们跟客户合作该账号，我们最终收取客户的费用</p>
    //             <p>修改【平台报价（原价）】会自动根据当前的【返点比例】，更新【合作价格（售价）】</p>
    //           </>
    //         )
    //       } />
    //     </>
    //   ),
    //   dataIndex: "coPrice",
    //   key: "coPrice",
    //   width: 160,
    //   render: (_: number, record: GetOppAccountListItemType, index: number) => (
    //     <>
    //       {record.editCoPrice && type !== "detail" ? (
    //         <>
    //           <InputNumber
    //             value={_}
    //             min={0}
    //             autoFocus
    //             className="editCoPrice"
    //             onChange={(e: number) =>
    //               handleChangeEditItem(index, "coPrice", e)
    //             }
    //             onBlur={(e: any) => handleBlur(index, "coPrice", e)}
    //           />
    //         </>
    //       ) : (
    //         <span>{_ ? `¥${toThousands(+_)}` : "--"}</span>
    //       )}

    //       {!record.editCoPrice && type !== "detail" && (
    //         <Button
    //           className="m-l-6"
    //           size="small"
    //           icon={record.editCoPrice ? <CheckOutlined /> : <FormOutlined />}
    //           onClick={() => {
    //             if (!record.officialPrice) {
    //               message.error(
    //                 "平台报价（原价）为空，合作价格（售价）不可编辑"
    //               );
    //               return;
    //             }
    //             handleEdit(index, "editCoPrice");
    //           }}
    //         />
    //       )}
    //     </>
    //   ),
    // },
    // 状态为待客户确认合作 且 代客下单
    (+detail.opStatus === 4 || +detail.opStatus === 5) &&
    +detail.businessType === 2
      ? {
          title: (
            <>
              【报给客户】官方平台手续费
              <IconTip
                content={
                  <>
                    <p>
                      【报给客户】官方平台手续费 = 平台报价（原价）*
                      各平台手续费比例（抖音快手默认5%）
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
          width: 160,
          render: (
            _: number,
            record: GetOppAccountListItemType,
            index: number
          ) => (
            // 已加入报价单才能编辑
            <>
              {record.editPlatOrderCharge &&
              record.isInQuotation &&
              type !== "detail" ? (
                <>
                  <InputNumber
                    value={_}
                    min={0}
                    autoFocus
                    className="editPlatOrderCharge"
                    onChange={(e: number) =>
                      handleChangeEditItem(index, "platOrderCharge", e)
                    }
                    onBlur={(e: any) => handleBlur(index, "platOrderCharge", e)}
                  />
                </>
              ) : (
                <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
              )}

              {!!(
                !record.editPlatOrderCharge &&
                record.isInQuotation &&
                type !== "detail"
              ) && (
                <Button
                  className="m-l-6"
                  size="small"
                  icon={
                    record.editPlatOrderCharge ? (
                      <CheckOutlined />
                    ) : (
                      <FormOutlined />
                    )
                  }
                  onClick={() => {
                    handleEdit(index, "editPlatOrderCharge");
                  }}
                />
              )}
            </>
          ),
        }
      : {},
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
      dataIndex: "rebateRate",
      key: "rebateRate",
      width: 140,
      sorter: true,
      render: (_: number, record: GetOppAccountListItemType, index: number) => (
        <>
          {record.editRebateRate && type !== "detail" ? (
            <>
              <InputNumber
                value={_}
                min={0}
                max={100}
                autoFocus
                className="editRebateRate"
                onChange={(e: number) =>
                  handleChangeEditItem(index, "rebateRate", e)
                }
                onBlur={(e: any) => handleBlur(index, "rebateRate", e)}
              />
            </>
          ) : (
            <span>{_ === null ? "--" : `${_}%`}</span>
          )}

          {!record.editRebateRate && type !== "detail" && (
            <Button
              className="m-l-6"
              size="small"
              icon={
                record.editRebateRate ? <CheckOutlined /> : <FormOutlined />
              }
              onClick={() => handleEdit(index, "editRebateRate")}
            />
          )}
        </>
      ),
    },
    {
      title: "返点金额",
      dataIndex: "rebateAmount",
      key: "rebateAmount",
      width: 140,
      sorter: true,
      render: (_: number, record: GetOppAccountListItemType, index: number) => (
        <>
          {record.editRebateAmount && type !== "detail" ? (
            <>
              <InputNumber
                value={_}
                min={0}
                precision={2}
                autoFocus
                className="editRebateAmount"
                onChange={(e: number) =>
                  handleChangeEditItem(index, "rebateAmount", e)
                }
                onBlur={(e: any) => handleBlur(index, "rebateAmount", e)}
              />
            </>
          ) : (
            <span>{_ === null ? "--" : `${_}`}</span>
          )}

          {!record.editRebateAmount && type !== "detail" && (
            <Button
              className="m-l-6"
              size="small"
              icon={
                record.editRebateAmount ? <CheckOutlined /> : <FormOutlined />
              }
              onClick={() => handleEdit(index, "editRebateAmount")}
            />
          )}
        </>
      ),
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
      width: 160,
      render: (_: number, record: GetOppAccountListItemType, index: number) => (
        <>
          {record.editOtherIncome && type !== "detail" ? (
            <>
              <InputNumber
                value={_}
                min={0}
                autoFocus
                className="editOtherIncome"
                onChange={(e: number) =>
                  handleChangeEditItem(index, "otherIncome", e)
                }
                onBlur={(e: any) => handleBlur(index, "otherIncome", e)}
              />
            </>
          ) : (
            <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
          )}

          {!record.editOtherIncome && type !== "detail" && (
            <Button
              className="m-l-6"
              size="small"
              icon={
                record.editOtherIncome ? <CheckOutlined /> : <FormOutlined />
              }
              onClick={() => handleEdit(index, "editOtherIncome")}
            />
          )}
        </>
      ),
    },
    // 状态为待客户确认合作 且 不走平台私单
    // +detail.opStatus === 4 && +detail.businessType === 4
    //   ? {
    //       title: (
    //         <>
    //           销售成本
    //           <IconTip content="销售成本=折扣金额+线下返点（返点分为对公返点和对私返点）" />
    //         </>
    //       ),
    //       dataIndex: "rebateAmount",
    //       key: "rebateAmount",
    //       width: 100,
    //       render: (_: any) => <span>{_ ? `¥${toThousands(+_)}` : "--"}</span>,
    //     }
    //   : {},
    // 状态为待客户确认合作 且 客户自行下单
    // +detail.opStatus === 4 && +detail.businessType === 1
    //   ? {
    //       title:  (
    //         <>
    //           销售成本
    //           <IconTip content="销售成本=折扣金额+线下返点（返点分为对公返点和对私返点）" />
    //         </>
    //       ),
    //       dataIndex: "rebateAmount",
    //       key: "rebateAmount",
    //       width: 100,
    //       render: (_: any) => <span>{_ ? `¥${toThousands(+_)}` : "--"}</span>,
    //     }
    //   : {},
    // 状态为待客户确认合作 且 客户自行下单 或 不走平台的私单 或 平台营收
    (+detail.opStatus === 4 || +detail.opStatus === 5) &&
    (+detail.businessType === 1 || +detail.businessType === 4 || +detail.businessType === 3)
      ? {
          title: (
            <>
              【实际】官方平台下单价
              <IconTip content="客户（自行下单）或我们（代客下单）在官方平台实际的下单价格。且不含平台手续费" />
            </>
          ),
          dataIndex: "platOrderMoney",
          key: "platOrderMoney",
          width: 160,
          render: (
            _: number,
            record: GetOppAccountListItemType,
            index: number
          ) => (
            <>
              {record.editPlatOrderMoney &&
              record.isInQuotation &&
              type !== "detail" ? (
                <>
                  <InputNumber
                    value={_}
                    min={0}
                    autoFocus
                    className="editPlatOrderMoney"
                    onChange={(e: number) =>
                      handleChangeEditItem(index, "platOrderMoney", e)
                    }
                    onBlur={(e: any) => handleBlur(index, "platOrderMoney", e)}
                  />
                </>
              ) : (
                <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
              )}

              {!!(
                !record.editPlatOrderMoney &&
                record.isInQuotation &&
                type !== "detail"
              ) && (
                <Button
                  className="m-l-6"
                  size="small"
                  icon={
                    record.editPlatOrderMoney ? (
                      <CheckOutlined />
                    ) : (
                      <FormOutlined />
                    )
                  }
                  onClick={() => {
                    handleEdit(index, "editPlatOrderMoney");
                  }}
                />
              )}
            </>
          ),
        }
      : {},
    // 状态为待客户确认合作 且 代客下单
    // +detail.opStatus === 4 && +detail.businessType === 2
    //   ? {
    //       title:  (
    //         <>
    //           销售成本
    //           <IconTip content="销售成本=折扣金额+线下返点（返点分为对公返点和对私返点）" />
    //         </>
    //       ),
    //       dataIndex: "rebateAmount",
    //       key: "rebateAmount",
    //       width: 100,
    //       render: (_: any) => <span>{_ ? `¥${toThousands(+_)}` : "--"}</span>,
    //     }
    //   : {},
    // 状态为待客户确认合作 且 代客下单
    (+detail.opStatus === 4 || +detail.opStatus === 5) &&
    +detail.businessType === 2
      ? {
          title: (
            <>
              【实际】官方平台下单价
              <IconTip content="客户（自行下单）或我们（代客下单）在官方平台实际的下单价格。且不含平台手续费" />
            </>
          ),
          dataIndex: "platOrderMoney",
          key: "platOrderMoney",
          width: 160,
          render: (
            _: number,
            record: GetOppAccountListItemType,
            index: number
          ) => (
            <>
              {record.editPlatOrderMoney &&
              record.isInQuotation &&
              type !== "detail" ? (
                <>
                  <InputNumber
                    value={_}
                    min={0}
                    autoFocus
                    className="editPlatOrderMoney"
                    onChange={(e: number) =>
                      handleChangeEditItem(index, "platOrderMoney", e)
                    }
                    onBlur={(e: any) => handleBlur(index, "platOrderMoney", e)}
                  />
                </>
              ) : (
                <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
              )}

              {!!(
                !record.editPlatOrderMoney &&
                record.isInQuotation &&
                type !== "detail"
              ) && (
                <Button
                  className="m-l-6"
                  size="small"
                  icon={
                    record.editPlatOrderMoney ? (
                      <CheckOutlined />
                    ) : (
                      <FormOutlined />
                    )
                  }
                  onClick={() => {
                    handleEdit(index, "editPlatOrderMoney");
                  }}
                />
              )}
            </>
          ),
        }
      : {},
    // 状态为待客户确认合作 且 代客下单
    (+detail.opStatus === 4 || +detail.opStatus === 5) &&
    +detail.businessType === 2
      ? {
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
          width: 160,
          render: (
            _: number,
            record: GetOppAccountListItemType,
            index: number
          ) => (
            <>
              {record.editPlatMoney &&
              record.isInQuotation &&
              type !== "detail" ? (
                <>
                  <InputNumber
                    value={_}
                    min={0}
                    autoFocus
                    className="editPlatMoney"
                    onChange={(e: number) =>
                      handleChangeEditItem(index, "platMoney", e)
                    }
                    onBlur={(e: any) => handleBlur(index, "platMoney", e)}
                  />
                </>
              ) : (
                <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
              )}

              {!!(
                !record.editPlatMoney &&
                record.isInQuotation &&
                type !== "detail"
              ) && (
                <Button
                  className="m-l-6"
                  size="small"
                  icon={
                    record.editPlatMoney ? <CheckOutlined /> : <FormOutlined />
                  }
                  onClick={() => {
                    handleEdit(index, "editPlatMoney");
                  }}
                />
              )}
            </>
          ),
        }
      : {},
    // 状态为待客户确认合作、确认合作 且 客户自行下单或不走平台私单或代客下单或平台营收
    (+detail.opStatus === 4 || +detail.opStatus === 5) &&
    (+detail.businessType === 1 ||
      +detail.businessType === 4 ||
      +detail.businessType === 2 ||
      +detail.businessType === 3
    )
      ? {
          title: (
            <>
              线下应收
              <IconTip
                content={
                  <>
                    {/* 不走平台的私单和代客下单 */}
                    {!!(
                      +detail.businessType === 4 || +detail.businessType === 2
                    ) && (
                      <p>
                        平台报价-返点金额+【报给客户】官方平台手续费+其他收入
                      </p>
                    )}
                    {/* 客户自行下单 和 平台营收 */}
                    {!!(+detail.businessType === 1 || +detail.businessType === 3) && (
                      <>
                        <p>客户需要额外给我们补款的金额</p>
                        <p>支持手动修改</p>
                      </>
                    )}
                  </>
                }
              />
            </>
          ),
          dataIndex: "cusOfflineSupplement",
          key: "cusOfflineSupplement",
          width: 140,
          // render: (_: any) => <span>{_ ? `¥${toThousands(+_)}` : "--"}</span>,
          render: (
            _: number,
            record: GetOppAccountListItemType,
            index: number
          ) => (
            <>
              {record.editCusOfflineSupplement &&
              record.isInQuotation &&
              type !== "detail" ? (
                <>
                  <InputNumber
                    value={_}
                    min={0}
                    autoFocus
                    className="editCusOfflineSupplement"
                    onChange={(e: number) =>
                      handleChangeEditItem(index, "cusOfflineSupplement", e)
                    }
                    onBlur={(e: any) =>
                      handleBlur(index, "cusOfflineSupplement", e)
                    }
                  />
                </>
              ) : (
                <span>{_ === null ? "--" : `¥${toThousands(+_)}`}</span>
              )}

              {!record.editCusOfflineSupplement &&
              record.isInQuotation &&
              type !== "detail" ? (
                <Button
                  className="m-l-6"
                  size="small"
                  icon={
                    record.editCusOfflineSupplement ? (
                      <CheckOutlined />
                    ) : (
                      <FormOutlined />
                    )
                  }
                  onClick={() => handleEdit(index, "editCusOfflineSupplement")}
                />
              ) : (
                ""
              )}
            </>
          ),
        }
      : {},
    // 状态为待客户确认合作、确认合作 且 客户自行下单或不走平台私单或代客下单或平台营收
    (+detail.opStatus === 4 || +detail.opStatus === 5) &&
    (+detail.businessType === 1 ||
      +detail.businessType === 4 ||
      +detail.businessType === 2 ||
      +detail.businessType === 3  
    )
      ? {
          title: (
            <>
              线下应付
              {/* 仅客户自行下单，平台营收展示问号文案 */}
              {!!(+detail.businessType === 1 || +detail.businessType === 3) && (
                <IconTip
                  content={
                    <>
                      <p>我们需要额外补款给客户的金额：</p>
                      <p>
                        线下应付 = 【实际】官方平台下单价 - 商务实际营收 +
                        线下应收
                      </p>
                    </>
                  }
                />
              )}
            </>
          ),
          dataIndex: "companyOfflineSupplement",
          key: "companyOfflineSupplement",
          width: 140,
          render: (_: any) => (
            <span>{_ === null ? 0 : `¥${toThousands(+_)}`}</span>
          ),
        }
      : {},
    {
      title: "备注",
      dataIndex: "reason",
      key: "reason",
      width: 140,
      render: (_: any, record: GetOppAccountListItemType, index: number) => (
        <>
          {record.editReason && type !== "detail" ? (
            <>
              <Input
                value={_}
                autoFocus
                className="editReason"
                onChange={(e: any) => handleChangeEditItem(index, "reason", e)}
                onBlur={(e: any) => handleBlur(index, "reason", e)}
              />
            </>
          ) : (
            <span>{_ || "--"}</span>
          )}

          {!record.editReason && type !== "detail" && (
            <Button
              className="m-l-6"
              size="small"
              icon={record.editReason ? <CheckOutlined /> : <FormOutlined />}
              onClick={() => handleEdit(index, "editReason")}
            />
          )}
        </>
      ),
    },
    {
      title: "账号对接人",
      dataIndex: "taskFollowerName",
      key: "taskFollowerName",
      width: 120,
      render: (_: string, row: any) => (
        <>
          <div onClick={() => handleGetJumpUrl(row)} className={styles.jumpUrl}>
            <img
              style={{ width: "20px", height: "20px", margin: "0 2px" }}
              src="https://sf3-cn.feishucdn.com/obj/goofy/byteview/live_audience/static/images/logo_light-5df5a286a1d51288c0728eb82231ef03.svg"
              alt=""
            />
            {row.taskFollowerName}
          </div>
        </>
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
      dataIndex: "rcStatusDesc",
      key: "rcStatusDesc",
      width: 100,
      render: (_: string) => _ || "--",
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
      dataIndex: "coStatusDesc",
      width: 100,
      key: "coStatusDesc",
      render: (_: string) => _ || "--",
    },
    type !== "detail"
      ? {
          title: "操作",
          dataIndex: "operation",
          width: 130,
          key: "operation",
          fixed: "right",
          render: (_: any, record: GetOppAccountListItemType) => {
            // _: any, record: GetOppAccountListItemType
            const { opStatus } = detail || {};
            const { rcStatus, coStatus, isFlyOver, isInQuotation, id } = record;

            // 撤回推荐 无任何操作
            if (+rcStatus === 8) return null;

            // 找号中
            if (+opStatus === 1) {
              return (
                <>
                  {/* 推荐状态 待商机负责人初筛 */}
                  {+rcStatus === 0 && (
                    <>
                      <Button
                        type="link"
                        onClick={() =>
                          handleOperation($firstRoundApproval, "商务初筛通过", {
                            subTaskId: id,
                            opt: "OK",
                          })
                        }
                      >
                        通过
                      </Button>
                      <Button
                        type="link"
                        onClick={() =>
                          handleOperation($firstRoundApproval, "驳回", {
                            subTaskId: id,
                            opt: "cancel",
                          })
                        }
                      >
                        驳回
                      </Button>
                    </>
                  )}
                </>
              );
            }

            // 待客户选号
            if (+opStatus === 2) {
              return (
                <>
                  {/* 合作状态 待客户确认  */}
                  {+coStatus === 0 && (
                    <>
                      <Button
                        type="link"
                        onClick={() =>
                          handleOperation(
                            $customerPreApproval,
                            "客户初筛通过",
                            {
                              subTaskId: id,
                              opt: 1,
                            }
                          )
                        }
                      >
                        通过
                      </Button>
                      <Button
                        type="link"
                        onClick={() =>
                          handleOperation($customerPreApproval, "客户驳回", {
                            subTaskId: id,
                            opt: -1,
                          })
                        }
                      >
                        驳回
                      </Button>
                    </>
                  )}

                  {/* 合作状态 已驳回状态、客户初筛通过  */}
                  {(+coStatus === 1 || +coStatus === 2) &&
                    ![5, 6, 7].includes(+rcStatus) && (
                      <Button
                        type="link"
                        onClick={() =>
                          handleOperation($customerPreApproval, "重置", {
                            subTaskId: id,
                            opt: 0,
                          })
                        }
                      >
                        重置
                      </Button>
                    )}
                </>
              );
            }

            // 待账号二次订询且推荐状态是驳回
            if (+opStatus === 3 && rcStatus === 7) {
              return (
                <Button
                  type="link"
                  onClick={() =>
                    handleOperation($reset2RoundApproval, "发送", {
                      subTaskId: id,
                    })
                  }
                >
                  再次发送确认
                </Button>
              );
            }

            // 待账号二次订询
            if (+opStatus === 3) {
              return (
                <>
                  {+isFlyOver === 0 ? (
                    <Button
                      type="link"
                      onClick={() =>
                        handleOperation($resendSecondConfirmFeiShu, "发送", {
                          subTaskId: id,
                        })
                      }
                    >
                      再次发送确认
                    </Button>
                  ) : (
                    <Button type="link" disabled>
                      已发送飞书消息
                    </Button>
                  )}
                </>
              );
            }

            // 待客户确认合作 且 推荐状态非是一、二轮定询驳回 、 合作状态非是客户驳回、暂不合作
            if (
              +opStatus === 4 &&
              rcStatus !== 4 &&
              rcStatus !== 7 &&
              coStatus !== 2 &&
              coStatus !== 4
            ) {
              return (
                <>
                  {+isInQuotation === 1 ? (
                    <>
                      <Button type="link" disabled>
                        已加入报价单
                      </Button>
                      <Button
                        type="link"
                        onClick={() =>
                          handleOperation(
                            $businessQuotationChange,
                            "移出报价单",
                            {
                              status: 0,
                              taskDetailId: id,
                            }
                          )
                        }
                      >
                        移出报价单
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="link"
                      onClick={() =>
                        handleOperation(
                          $businessQuotationChange,
                          "加入报价单",
                          {
                            status: 1,
                            taskDetailId: id,
                          }
                        )
                      }
                    >
                      加入报价单
                    </Button>
                  )}
                </>
              );
            }

            return null;
          },
        }
      : {},
    type === "detail" &&
    +detail.opStatus === 5 &&
    $permission("modify_price") &&
    detail.canEditPrice
      ? {
          title: "操作",
          dataIndex: "operation",
          width: 120,
          key: "operation",
          fixed: "right",
          render: (_: any, record: GetOppAccountListItemType) => (
            <>
              <Button type="link" onClick={() => openModifyPrice(record)}>
                编辑
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleCancelCooperation(record)}
              >
                取消合作
              </Button>
            </>
          ),
        }
      : {},
  ];

  const handleSearch = (params: any) => {
    const paramsTemp = params;
    const { accountPlat } = paramsTemp;
    if (accountPlat) {
      getAccountList(accountPlat);
    }
    const searchParams = Object.assign({}, searchData, params);
    setSearchData({
      ...searchParams,
      pageNum: 1,
    });
    getOppAccountList({ ...searchParams, pageNum: 1 });
  };
  const handleSelectPlats = (val: any) => {
    setSelectPlats(val);
  };
  const handleExportAccountInfo = () => {
    if (!(tableList || []).length) {
      message.error(
        searchData.accountPlat
          ? "当前平台下没有账号，请更换平台重试"
          : "当前没有账号，请进行先去找号"
      );
    } else {
      // 判断如果当前列表属于同一个平台则直接跳转，否则选择平台
      const list: any = JSON.parse(JSON.stringify(tableList));
      const tmp = list.splice(0, 1)[0];
      const diffList: any = [];
      list.forEach((item: any) => {
        if (item.platName !== tmp.platName) {
          diffList.push(item);
        }
      });
      if (diffList.length) {
        setShowPlatSlect(true);
      } else {
        handleGoAccountLibrary(tmp.platId);
      }
    }
  };
  const handleCancleSelet = () => {
    setSelectPlats(null);
    setShowPlatSlect(false);
  };
  const handleGoAccountLibrary = (platId?: any) => {
    if (!slectPlatId && showPlatSlect) {
      message.error("请选择平台");
      return;
    }

    let accountPlat = null;
    if (showPlatSlect) {
      accountPlat = slectPlatId;
      handleCancleSelet();
    } else {
      accountPlat = searchData.accountPlat || platId;
    }

    let activeName = "";

    if (accountPlat === 25) {
      // 抖音
      activeName = "douyin";
    } else if (accountPlat === 26) {
      // 快手
      activeName = "kuaishou";
    } else if (accountPlat === 2) {
      // 快手
      activeName = "bilibili";
    } else if (accountPlat === 45) {
      // 小红书
      activeName = "xiaohongshu";
    } else {
      activeName = "other";
    }
    window.open(
      `/#/bussiness-manage/bill-adv-manage?activeName=${activeName}&platId=${accountPlat}&opId=${id}`
    );
  };

  const getPlatList = async () => {
    const res = await $getPlatList();
    const newSearchConfig = [...searchConfig];
    const index = newSearchConfig.findIndex(item => item.key === "accountPlat");
    newSearchConfig[index].data = res;
    setPlatList([...res]);
    setSearchConfig(newSearchConfig);
  };

  const getAccountList = async (platId?: number) => {
    const res = await $getAccountList({
      opId: id,
      platId,
    });
    const newSearchConfig = [...searchConfig];
    const index = newSearchConfig.findIndex(item => item.key === "accountId");
    newSearchConfig[index].data = res;
    setSearchConfig(newSearchConfig);
  };

  const getRcStatusList = async () => {
    const res = await $getRcStatusList();
    const newSearchConfig = [...searchConfig];
    const index = newSearchConfig.findIndex(
      item => item.key === "rcStatusList"
    );
    newSearchConfig[index].data = res;
    setSearchConfig(newSearchConfig);
  };

  const getCoStatusList = async () => {
    const res = await $getCoStatusList();
    const newSearchConfig = [...searchConfig];
    const index = newSearchConfig.findIndex(
      item => item.key === "coStatusList"
    );
    newSearchConfig[index].data = res;
    setSearchConfig(newSearchConfig);
  };

  const handleExport = () => {
    window.open(
      `/api/qp/business/opportunity/oppAccountList?${qs.stringify({
        ...searchData,
        isExport: 1,
        opId: id,
      })}`
    );
  };

  const handleExportQuotation = async () => {
    setExportQuotationLoading(true);
    try {
      const res = await $checkExportQuotation({ opId: Number(id) });
      setExportQuotationLoading(false);
      if (!res) {
        message.error("仅当有账号加入报价单后，方可下载");
        return;
      }

      window.open(
        `/api/qp/business/quotation/export?${qs.stringify({
          opId: id,
        })}`
      );
    } catch (e: any) {
      setExportQuotationLoading(false);
      message.error(String(e.message) || "仅当有账号加入报价单后，方可下载");
    }
  };

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

    setSortParams(params);
    getOppAccountList(params);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReasonType) {
      message.warning("请选择取消合作原因");
      return;
    }
    if (+cancelReasonType===4&&!cancelReason) {
      message.warning("请填写具体原因描述");
      return;
    }

    if (+cancelTotalRefund > 0 && !refundType) {
      message.warning("请选择线下返款支付方式");
      return;
    }

    // 如果是对公+对私 需要判断对私的输入
    if (refundType === 3 && !refundInput) {
      message.warning("请填写对私返款合计");
      return;
    }

    const params: CancelSubTaskCooperatedParamsType = {
      cancelSubTaskId: cancelId,
      cancelReason:cancelReason||'',
      cancelReasonType,
      rebateType: Number(refundType),
      rebatePrivate: +Number(refundInput || cancelTotalRefund).toFixed(2),
      rebateCorporate: +Number(
        (cancelTotalRefund || 0) - (refundInput || 0)
      ).toFixed(2),
    };

    // 没有返款金额 只需要原因
    if (!cancelTotalRefund) {
      delete params.rebateType;
      delete params.rebatePrivate;
      delete params.rebateCorporate;
    }

    try {
      setTableLoading(true);
      handleCancleModal()
      await $cancelSubTaskCooperated(params);
      message.success("取消合作成功");
      getOppAccountList();
      onLoadDetail();
      onRefesh(true);
    } catch (e: any) {
      message.error(e.message);
      handleCancleModal()
    }
  };
  const handleCancleModal =()=>{
    setShowRefundDialog(false)
    setCancelReasonType("")
    setCancelReason("")
  }
  const handleSelectReasonType = (val: any) => {
    setCancelReasonType(val)
    setShowReasonDesc(+val===4)
  };
  // const disableDate = (date: any) => {
  //   // 将date转化为YYYYMMDD的格式
  //   const days = moment(date).format("YYYY-MM-DD");
  //   return outDay.includes(days);
  // };
  useEffect(() => {
    if (!detail?.opStatus) return;

    const { opStatus } = detail || {};

    if (+opStatus === 1) {
      // 找号中 推荐状态默认 待商务初筛、商务自行找号、商务初筛通过、账号对接人初筛、账号对接人初筛通过
      setSearchData({
        ...searchData,
        rcStatusList: [0, 1, 2, 3, 9],
      });
      getOppAccountList({ rcStatusList: [0, 1, 2, 3, 9] });
      return;
    }

    if (+opStatus === 2) {
      // 待客户选号 合作状态默认 待客户确认、客户初筛通过
      setSearchData({
        ...searchData,
        coStatusList: [0, 1],
      });
      getOppAccountList({ coStatusList: [0, 1] });
      return;
    }

    if (+opStatus === 3) {
      // 待账号二次订询 推荐状态默认 待账号负责人确认
      setSearchData({
        ...searchData,
        rcStatusList: [5, 6, 7],
      });
      getOppAccountList({ rcStatusList: [5, 6, 7] });
      return;
    }

    if (+opStatus === 4) {
      // 待客户确认合作 推荐状态默认 账号负责人通过
      setSearchData({
        ...searchData,
        rcStatusList: [6],
      });
      getOppAccountList({ rcStatusList: [6] });
      return;
    }

    if (+opStatus === 5) {
      // 待客户确认合作 合作状态默认 待客户确认、客户初筛通过
      setSearchData({
        ...searchData,
        coStatusList: [0, 1, 3],
      });
      getOppAccountList({ coStatusList: [0, 1, 3] });
      return;
    }

    getOppAccountList();
  }, [detail?.opStatus]);

  useEffect(() => {
    if (!showRefundDialog) {
      setRefundInput("");
      setRefundType(undefined);
      setCancelReason(undefined);
      setCancelTotalRefund(0);
    }
  }, [showRefundDialog]);

  useEffect(() => {
    getPlatList();
    getAccountList();
    getRcStatusList();
    getCoStatusList();
    getReasonOptions();
    return () => {
      //
    };
  }, []);
  return (
    <div>
      <Search
        searchData={searchData}
        onChange={handleSearch}
        config={searchConfig}
        // onSearch={handleSearch}
        afterSearch={
          <>
            <Button
              className={cs("m-r-6", styles.verticalButton, styles.ghostButton)}
              type="default"
              onClick={handleExport}
            >
              导出报价明细
            </Button>
            <Button
              type="primary"
              className={cs("m-r-6", styles.verticalButton)}
              onClick={handleExportAccountInfo}
            >
              查看/导出账号详细数据
            </Button>
            {/* {screenPlat ? (
              <Button
              type="primary"
              className={cs("m-r-6", styles.verticalButton)}
              onClick={handleGoAccountLibrary}
            >
              前往报价库查看数据情况
            </Button>
            ) : (
              <Popover
                placement="topLeft"
                content="仅当筛选了平台后，前往报价库查看数据情况按钮才可以点击"
              >
                <Button className={cs("m-r-6", styles.verticalButton)} disabled>
                  前往报价库查看数据情况
                </Button>
              </Popover>
            )} */}
            {+detail.opStatus === 2 ? (
              selectedRowKeys.length ? (
                <Button
                  type="primary"
                  className="m-r-6"
                  onClick={handleBatchPass}
                >
                  批量通过账号
                </Button>
              ) : (
                <Popover placement="topLeft" content="请勾选要通过的账号">
                  <Button className="m-r-6" disabled>
                    批量通过账号
                  </Button>
                </Popover>
              )
            ) : (
              ""
            )}
            {/* 找号中显示停止找号按钮 */}
            {/* {+detail?.opStatus === 1 && (
              <Button
                type="primary"
                className={cs("m-l-6", styles.verticalButton)}
                loading={stopLoading}
                disabled={type === "detail"}
                onClick={handleStopFinding}
              >
                停止找号，进入客户选号阶段
              </Button>
            )} */}

            {/* 待客户选号显示停止找号按钮 */}
            {/* {+detail?.opStatus === 2 && (
              <Button
                type="primary"
                className={cs("m-l-6", styles.verticalButton)}
                loading={confirmLoading}
                disabled={type === "detail"}
                onClick={handleConfirmChoose}
              >
                确认客户选号
              </Button>
            )} */}

            {/* 在待客户确认合作、已经合作时显示报价单 */}
            {(+detail.opStatus === 4 || +detail.opStatus === 5) && (
              <Button
                type="primary"
                className={cs("m-r-6", styles.verticalButton)}
                loading={exportQuotationLoading}
                onClick={handleExportQuotation}
              >
                下载报价单
              </Button>
            )}
          </>
        }
      />
      {/* 在待客户确认合作、已经合作时显示商单类型 */}
      {(+detail.opStatus === 4 || +detail.opStatus === 5) && (
        <div className="m-t-24">
          <span>商单类型：</span>
          {detail.businessTypeDesc}
          {type !== "detail" && (
            <Button type="link" onClick={() => onChangeTab("1")}>
              修改商单类型
            </Button>
          )}
        </div>
      )}
      <div className="recommend-table m-t-24">
        <Table
          rowSelection={(+detail.opStatus === 2 ? rowSelection : null) as any}
          rowKey="id"
          dataSource={tableList}
          columns={
            COLUMNS.filter(
              item => Object.keys(item).length
            ) as ColumnsType<GetOppAccountListItemType>
          }
          loading={tableLoading}
          onChange={handleChangeSort}
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
              getOppAccountList({ pageNum: page });
            },
          }}
        />
      </div>
      {/* {showFeishuIframe?<div style={{position:"absolute",zIndex:0,bottom:-200}}><iframe src="about:blank" name="frame" /></div>:''} */}

      <Modal
        visible={showEditTip}
        closable={false}
        okText="确定编辑"
        cancelText="取消"
        onOk={() => {
          setShowEditModal(true);
          setShowEditTip(false);
        }}
        onCancel={() => setShowEditTip(false)}
        bodyStyle={{ padding: "40px" }}
      >
        <p>
          确定要编辑账号的金额等信息？一旦修改后，关联的商单、工单金额等信息也将全部受到影响，请和相关人员充分沟通后再操作
        </p>
      </Modal>
      <Modal
        visible={showPlatSlect}
        closable={false}
        title="查看/导出账号详细数据"
        okText="确定"
        cancelText="取消"
        onOk={handleGoAccountLibrary}
        onCancel={handleCancleSelet}
      >
        <div>
          选择平台：{" "}
          <Select
            style={{ width: 240, marginBottom: 12 }}
            onChange={handleSelectPlats}
            value={slectPlatId}
            allowClear
            showSearch
          >
            {platList &&
              platList.map((item: any) => (
                <Select.Option key={item.platId} value={item?.platId}>
                  {item?.platName}
                </Select.Option>
              ))}
          </Select>
        </div>
      </Modal>
      {showEditModal ? (
        <EditPriceModal
          show={showEditModal}
          curEditMsg={curEditMsg || {}}
          commercialMsg={detail || {}}
          onLoadDetail={onLoadDetail}
          onGetList={getOppAccountList}
          onClose={() => setShowEditModal(false)}
        />
      ) : (
        ""
      )}
      <Modal
        title="填写取消合作原因"
        visible={showRefundDialog}
        okText="确定"
        cancelText="取消"
        maskClosable={false}
        keyboard={false}
        onOk={handleConfirmCancel}
        onCancel={handleCancleModal}
      >
        <>
          <div className="m-b-24">
            <p className="m-b-6">
              <span className={styles.required} />
              取消合作原因：
            </p>
            <div className={rStyles.reasonType}>
            <Select value={cancelReasonType} onChange={handleSelectReasonType}>
              {(reasonOptions || []).map(item => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
            </div>
          </div>
          {showReasonDesc&&<div className="m-b-24">
            <p className="m-b-6">
              <span className={styles.required} />
              具体原因描述：
            </p>
            <TextArea
              placeholder="请输入取消合作原因"
              value={cancelReason}
              showCount
              maxLength={100}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setCancelReason(e.target.value);
              }}
            />
          </div>}
          
          {!!(+cancelTotalRefund > 0) && (
            <>
              <div className="m-b-24">
                <p className="m-b-6">
                  <span className={styles.required} />
                  线下返款支付方式：
                </p>
                <Select
                  className={styles.refundSelect}
                  placeholder="请选择线下返款支付方式"
                  value={refundType}
                  onChange={e => {
                    if (e !== 3) {
                      setRefundInput("");
                    }
                    setRefundType(e);
                  }}
                >
                  {REFUND_TYPE_ARR.map(({ id, label }) => (
                    <Option key={id} value={id}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </div>

              {!!refundType && (
                <div className="m-b-24">
                  {refundType === 3 && (
                    <>
                      <div className="m-b-6">
                        <span>取消合作后，商机对私返款合计：</span>
                        <InputNumber
                          min={0.01}
                          max={cancelTotalRefund - 0.01}
                          precision={2}
                          value={refundInput}
                          onChange={e => {
                            setRefundInput(e);
                          }}
                        />
                      </div>
                      <div>
                        取消合作后，商机对公返款合计：
                        {Number(cancelTotalRefund - (refundInput || 0)).toFixed(
                          2
                        )}
                      </div>
                    </>
                  )}

                  {refundType === 1 && (
                    <div>
                      取消合作后，商机对公返款合计：
                      {Number(cancelTotalRefund - (refundInput || 0)).toFixed(
                        2
                      )}
                    </div>
                  )}

                  {refundType === 2 && (
                    <div>
                      取消合作后，商机对私返款合计：
                      {Number(cancelTotalRefund - (refundInput || 0)).toFixed(
                        2
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      </Modal>
    </div>
  );
};

export default RecommendAccount;

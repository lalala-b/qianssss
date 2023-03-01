import {
  Row,
  Col,
  Form,
  Button,
  Modal,
  InputNumber,
  Radio,
  message,
  Tooltip,
} from "antd";
// import { QuestionCircleOutlined } from "@ant-design/icons";
import { useState, useContext, useEffect } from "react";
// import IconTip from "src/components/IconTip";
import cs from "classnames";
import { $checkAccounts } from "src/api/workOrderDetail";
import { DetailContext } from "../../DetailProvider";
import WorkTtemBox from "../WorkItemBox/WorkItemBox";
import styles from "./FinancialAudit.scss";

interface FinancialAuditFormDataType {
  recePayType: number;
}

const FinancialAudit: React.FC = () => {
  const {
    detail: {
      orderBaseInfoBO: {
        // busOrderType = -1,
        orderBelongType = "",
      } = {},
      // confirmDraftNodeAndFieldBO: {
      //   confirmDraftNodeBO: { platTaskId: platTaskIdForDraft = "" } = {},
      // } = {},
      // publishVideoNodeAndFieldBO: {
      //   publishVideoNodeBO: { platTaskId: platTaskIdForPublish = "" } = {},
      // } = {},
      checkAccountsNodeAndFieldBO: {
        checkAccountsNodeBO: {
          orderNo = "",
          salesIncome = 0,
          platOrderMoney = 0,
          costOfSales = 0,
          orderActualIncome = 0,
          outMoney = 0,
          performanceMoney = 0,
          oaContractNumber = "",
          customerRebatePaid = 0,
          receiptStatus = 0,
          reconciliationStatus = 0,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          nodeStatus = 0,
          editAuth = false,
          nodeStep = 0,
          cancelReasonTypeDesc = "",
          taskIdStatus = 0,
          taskIdTime = "",
          updateTime = "",
        } = {},
      } = {},
      orderBaseInfoBO: { platId = 0 } = {},
    },
    loading,
    setLoading,
    onRefresh,
  } = useContext(DetailContext);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [customerRebatePaidInputVal, setCustomerRebatePaidInputVal] =
    useState<number>(0);

  // 实际官方平台下单价和平台任务id的校验标识
  // const [platOrderMoneyCheckFlag, setPlatOrderMoneyCheckFlag] =
  //   useState<number>(0);

  // 实际官方平台下单价的核实时间
  // const [verificationTime, setVerificationTime] = useState<string>("");

  const [form] = Form.useForm();
  const { confirm } = Modal;

  const handleCustomerRebatePaid = (val: number) => {
    setCustomerRebatePaidInputVal(val);
  };

  const handleFinishForm = async (val: FinancialAuditFormDataType) => {
    try {
      setLoading(true);
      await $checkAccounts({
        ...val,
        orderNo,
        orderStatus: nodeStep,
        customerRebatePaid: customerRebatePaidInputVal,
        editFlag: nodeStatus === 1 && editAuth ? 0 : 1,
      });
      setIsEdit(false);
      message.success("操作成功");
      onRefresh();
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  // 取消时，再点击编辑的回显
  const cancelForEcho = () => {
    form.setFieldValue("receiptStatus", receiptStatus);
    form.setFieldValue("reconciliationStatus", reconciliationStatus);
    form.setFieldValue("customerRebatePaid", customerRebatePaid);
    setCustomerRebatePaidInputVal(customerRebatePaid);
  };

  const handleEdit = () => {
    setIsEdit(true);
    cancelForEcho();
  };

  const handleSubmitFinancialAuditMsg = () => {
    confirm({
      content: "确认相关信息均已填写正确",
      icon: "",
      cancelText: "取消",
      okText: "确认",
      onOk() {
        form.submit();
      },
    });
  };

  const handleCancelSubmit = () => {
    setIsEdit(false);
  };

  // 根据不同情况返回实际官方平台下单价的对应提示颜色
  const handleGetPlatOrderMoneyTipColor = (flag: number) => {
    let colorObj = {
      background: "#d3e1d3",
      color: "#57ae55",
    };
    switch (flag) {
      case 1:
        colorObj = {
          background: "#d3e1d3",
          color: "#57ae55",
        };
        break;
      case 2:
        colorObj = {
          background: "#edd6b6",
          color: "#f2ac4b",
        };
        break;
      case 3:
        colorObj = {
          background: "#eac7c3",
          color: "#ea4f45",
        };
        break;
      default:
        break;
    }

    return colorObj;
  };

  // 1为平台任务ID和平台下单价全部匹配
  // 2为录入的任务ID和爬取的星图ID不匹配
  // 3为录入的任务ID匹配，但工单的【实际】官方平台下单价和星图的【订单金额】不匹配
  // 根据不同情况返回实际官方平台下单价的对应提示文案
  const handleGetPlatOrderMoneyTipContent = (flag: number) => {
    let content = "";
    switch (flag) {
      case 1:
        content = "经系统和星图数据校验，平台下单价金额无误";
        break;
      case 2:
        content = "平台下单价自动校验失败，请核实平台任务ID是否填错";
        break;
      case 3:
        content = "经系统和星图数据校验，平台下单价金额不匹配";
        break;
      default:
        break;
    }
    return content;
  };

  // const getPerformanceRevenueTip = (businessType: number) => {
  //   let tip = "";
  //   switch (businessType) {
  //     // 自行下单
  //     case 1:
  //       tip = "绩效营收=执行金额-达人分成成本-其他成本";
  //       break;
  //     // 代客下单
  //     case 2:
  //       tip = "绩效营收=执行金额-达人分成成本-其他成本-【实际】官方平台手续费";
  //       break;
  //     // 不走平台私单
  //     case 4:
  //       tip = "绩效营收=执行金额-达人分成成本-其他成本";
  //       break;
  //     default:
  //       break;
  //   }

  //   return tip;
  // };

  // // 根据平台任务id预校验平台下单价金额是否有误
  // const checkPlatOrderMoney = async () => {
  //   await $checkTaskId({
  //     platTaskId: platTaskIdForDraft || platTaskIdForPublish,
  //     moneyAmount: platOrderMoney,
  //     taskIdStatus,
  //     taskIdTime,
  //   });

  //   // setPlatOrderMoneyCheckFlag(platTaskStatusType);
  //   // setVerificationTime(time);
  // };

  useEffect(() => {
    form.setFieldValue("receiptStatus", receiptStatus);

    return () => {
      //
    };
  }, [receiptStatus]);

  useEffect(() => {
    form.setFieldValue("reconciliationStatus", reconciliationStatus);

    return () => {
      //
    };
  }, [reconciliationStatus]);

  useEffect(() => {
    form.setFieldValue("customerRebatePaid", customerRebatePaid);
    setCustomerRebatePaidInputVal(customerRebatePaid);

    return () => {
      //
    };
  }, [customerRebatePaid]);

  // 确认视频初稿修改了平台任务id后，也需要调用一次平台任务id和官方平台下单价的校验
  // useEffect(() => {
  //   checkPlatOrderMoney();
  // }, [loading]);

  return (
    <>
      <WorkTtemBox
        title="财务核账"
        nodeStatus={nodeStatus}
        operatorUserName={`${
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") || "待定"
        }`}
        cancelOrderReason={cancelReasonTypeDesc}
        updateTime={updateTime}
        allBtn={
          <>
            {nodeStatus === 1 && editAuth && !isEdit ? (
              <Button type="primary" onClick={handleEdit}>
                去确认
              </Button>
            ) : editAuth && !isEdit ? (
              <Button type="primary" onClick={handleEdit}>
                编辑
              </Button>
            ) : isEdit ? (
              <div className={styles.btnWrap}>
                <Button
                  type="primary"
                  danger
                  onClick={handleSubmitFinancialAuditMsg}
                  loading={loading}
                >
                  确认无误
                </Button>
                <Button onClick={handleCancelSubmit}>取消</Button>
              </div>
            ) : (
              ""
            )}
          </>
        }
      >
        <div className={cs(styles.contentWrap, "m-t-24")}>
          <Form form={form} onFinish={handleFinishForm}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="销售收入"
                  name="salesIncome"
                  tooltip="销售收入=平台报价+其他收入"
                >
                  {salesIncome || "--"}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="销售成本"
                  name="costOfSales"
                  tooltip="销售成本=返点金额"
                >
                  <span>{costOfSales || "--"}</span>
                </Form.Item>
              </Col>
              {
                // 不是自营、海盗才展示，1为签约 2为媒介
                +orderBelongType !== 0 && +orderBelongType !== 3 && (
                  <Col span={8}>
                    <Form.Item
                      label={
                        +orderBelongType === 1 ? "达人分成成本" : "采购达人成本"
                      }
                      name="outMoney"
                    >
                      <span>{outMoney || "--"}</span>
                    </Form.Item>
                  </Col>
                )
              }

              <Col span={8}>
                <Form.Item
                  label="工单实际营收"
                  name="orderActualIncome"
                  tooltip="工单实际营收=平台报价-返点金额+其他收入"
                >
                  <span>{orderActualIncome || "--"}</span>
                </Form.Item>
              </Col>
              {/* </Row> */}

              {/* <Row gutter={24}> */}
              <Col span={8} className={styles.contentTipWrap}>
                <Form.Item label="【实际】官方平台下单价" name="platOrderMoney">
                  <span>{platOrderMoney || "--"}</span>
                </Form.Item>
                {handleGetPlatOrderMoneyTipContent(taskIdStatus) &&
                platId === 25 ? (
                  <p
                    className={styles.contentTip}
                    style={handleGetPlatOrderMoneyTipColor(
                      taskIdStatus
                    )}
                  >
                    <Tooltip
                      title={`${handleGetPlatOrderMoneyTipContent(
                        taskIdStatus
                        )}，核实时间：${taskIdTime || "--"}`}
                    >
                      {`${handleGetPlatOrderMoneyTipContent(
                        taskIdStatus
                      )}，核实时间：${taskIdTime || "--"}`}
                    </Tooltip>
                  </p>
                ) : (
                  ""
                )}
              </Col>

              <Col span={8}>
                <Form.Item
                  label="绩效营收"
                  name="performanceMoney"
                  tooltip={`绩效营收=工单实际营收${
                    +orderBelongType !== 0 && +orderBelongType !== 3
                      ? `${
                          +orderBelongType === 1
                            ? `-达人分成成本`
                            : `-采购达人成本`
                        }`
                      : ""
                  }-达人其他成本`}
                >
                  <span>{performanceMoney || "--"}</span>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="商务合同OA编号" name="oaContractNumber">
                  <span>{oaContractNumber || "--"}</span>
                </Form.Item>
              </Col>
              {/* </Row> */}

              {/* <Row gutter={24}> */}
              <Col span={8}>
                <Form.Item
                  label="已付客户返点"
                  name="customerRebatePaid"
                  tooltip="已付客户返点：该工单公司已实际支付给客户的返点金额，由财务人员录入。"
                >
                  {isEdit ? (
                    <>
                      <InputNumber
                        controls
                        step="0.01"
                        min={0}
                        value={customerRebatePaidInputVal || 0}
                        onChange={handleCustomerRebatePaid}
                      />
                    </>
                  ) : (
                    <span>{customerRebatePaid || "--"}</span>
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="是否已开发票" name="receiptStatus">
                  {isEdit ? (
                    <Radio.Group value={receiptStatus}>
                      <Radio value={0}>否</Radio>
                      <Radio value={1}>是</Radio>
                    </Radio.Group>
                  ) : (
                    <span>{receiptStatus ? "是" : "否"}</span>
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="是否已核账" name="reconciliationStatus">
                  {isEdit ? (
                    <Radio.Group value={reconciliationStatus}>
                      <Radio value={0}>否</Radio>
                      <Radio value={1}>是</Radio>
                    </Radio.Group>
                  ) : (
                    <span>{reconciliationStatus ? "是" : "否"}</span>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </WorkTtemBox>
    </>
  );
};

export default FinancialAudit;

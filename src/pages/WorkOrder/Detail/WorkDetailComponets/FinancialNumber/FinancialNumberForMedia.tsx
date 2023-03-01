import { useState, useContext } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Modal,
  message,
  Tooltip,
} from "antd";
import cs from "classnames";
import { $checkAccounts } from "src/api/workOrderDetail";
import { DetailContext } from "../../DetailProvider";
import WorkTtemBox from "../WorkItemBox/WorkItemBox";
import styles from "./FinancialNumber.scss";

// 根据不同情况返回实际官方平台下单价的对应提示颜色
// 1为平台任务ID和平台下单价全部匹配
// 2为录入的任务ID和爬取的星图ID不匹配
// 3为录入的任务ID匹配，但工单的【实际】官方平台下单价和星图的【订单金额】不匹配
const PLAT_ORDER_MONEY_TIP_COLOR_MAP: any = {
  // 默认颜色
  0: {
    background: "#d3e1d3",
    color: "#57ae55",
  },
  1: {
    background: "#d3e1d3",
    color: "#57ae55",
  },
  2: {
    background: "#edd6b6",
    color: "#f2ac4b",
  },
  3: {
    background: "#eac7c3",
    color: "#ea4f45",
  },
}

// 根据不同情况返回实际官方平台下单价的对应提示文案
// 1为平台任务ID和平台下单价全部匹配
// 2为录入的任务ID和爬取的星图ID不匹配
// 3为录入的任务ID匹配，但工单的【实际】官方平台下单价和星图的【订单金额】不匹配
const PLAT_ORDER_MONEY_TIP_CONTENT_MAP: any = {
  // 默认文案
  0: "",
  1: "经系统和星图数据校验，平台下单价金额无误",
  2: "平台下单价自动校验失败，请核实平台任务ID是否填错",
  3: "经系统和星图数据校验，平台下单价金额不匹配",
}

const FinancialNumberForMedia: React.FC = () => {
  const {
    detail: {
      checkAccountsNodeAndFieldBO: {
        checkAccountsNodeBO: {
          orderNo = "",
          salesIncome = 0,
          platOrderMoney = 0,
          costOfSales = 0,
          orderActualIncome = 0,
          outMoney = 0,
          performanceMoney = 0,
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
  
  const [isConfirm, setIsConfirm] = useState<boolean>(false);

  const [form] = Form.useForm();
  const { confirm } = Modal;
  
  // 去确认
  const handleConfirm = () => {
    setIsConfirm(true);
  };

  // 确认无误
  const handleSubmitFinancialNumberMsg = () => {
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

  // 取消操作
  const handleCancelSubmit = () => {
    setIsConfirm(false);
  };

  // 表单提交
  const handleFinishForm = async () => {
    try {
      setLoading(true);
      await $checkAccounts({
        orderNo,
        orderStatus: nodeStep,
        editFlag: nodeStatus === 1 && editAuth ? 0 : 1,
      });
      setIsConfirm(false);
      message.success("操作成功");
      onRefresh();
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  return (
    <WorkTtemBox
      title="财务核数"
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
          {nodeStatus === 1 && editAuth && !isConfirm ? (
            <Button type="primary" onClick={handleConfirm}>
              去确认
            </Button>
          ) : isConfirm ? (
            <div className={styles.btnWrap}>
              <Button
                type="primary"
                danger
                onClick={handleSubmitFinancialNumberMsg}
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

            <Col span={8}>
              <Form.Item
                label="采购达人成本"
                name="outMoney"
              >
                <span>{outMoney || "--"}</span>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="工单实际营收"
                name="orderActualIncome"
                tooltip="工单实际营收=平台报价-返点金额+其他收入"
              >
                <span>{orderActualIncome || "--"}</span>
              </Form.Item>
            </Col>

            <Col span={8} className={styles.contentTipWrap}>
              <Form.Item label="【实际】官方平台下单价" name="platOrderMoney">
                <span>{platOrderMoney || "--"}</span>
              </Form.Item>
              {PLAT_ORDER_MONEY_TIP_CONTENT_MAP[+taskIdStatus] &&
                platId === 25 ? (
                <p
                  className={styles.contentTip}
                  style={PLAT_ORDER_MONEY_TIP_COLOR_MAP[+taskIdStatus]}
                >
                  <Tooltip
                    title={`${PLAT_ORDER_MONEY_TIP_CONTENT_MAP[+taskIdStatus]}，核实时间：${taskIdTime || "--"}`}
                  >
                    {`${PLAT_ORDER_MONEY_TIP_CONTENT_MAP[+taskIdStatus]}，核实时间：${taskIdTime || "--"}`}
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
                tooltip="绩效营收=工单实际营收-采购达人成本-达人其他成本"
              >
                <span>{performanceMoney || "--"}</span>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </WorkTtemBox>
  );
};

export default FinancialNumberForMedia;

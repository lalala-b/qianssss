/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  ConfigProvider,
  Button,
  InputNumber,
  message,
} from "antd";
import zhCN from "antd/es/locale/zh_CN";
import cs from "classnames";
import { $addBackMoneyPeriod } from "src/api/invoiceDetail";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox";
import styles from "./PaybackPeriods.scss";

const PaybackPeriods = () => {
  const [orderPerformanceForm] = Form.useForm();

  const {
    invoiceProcessStep = "",
    financeUserNameList=[],
    customerBackOpUserName,
    invoiceDate,
    backMoneyPeriod,
    backMoneyStopTime,
    businessOrderId,
    onRefresh,
    setLoading,
    from = "", // 1.invoice 有权限也不可以编辑  2.financial 有权限可编辑
  } = useContext(DetailContext);
  const [isEdit, setEdit] = useState(false);
  const [backMoneyPeriod1,setBackMoneyPeriod1]=useState<number>()
  const { $permission } = window;
  const [nodeStatus, setNodeStatus] = useState<number>(0);
  const [btnLoading,setBtnLoading] = useState(false);
  const handleEdit = () => {
    setEdit(true);
  };
  const handleSubmit = async () => {
    await orderPerformanceForm.submit();
    await orderPerformanceForm.validateFields();
    const { backMoneyPeriod = 0 } = orderPerformanceForm.getFieldsValue();
    setBtnLoading(true)
    setLoading(true)
    try {
      await $addBackMoneyPeriod({
        businessOrderId,
        backMoneyPeriod,
      });
      setBtnLoading(false)
      message.success("操作成功");
      handleCancel();
      onRefresh();
    } catch (e: any) {
      setBtnLoading(false)
      setLoading(false);
      handleCancel();
      message.error(String(e.message));
    }
  };
  const handleCancel = () => {
    setEdit(false);
  };
  useEffect(() => {
    if ([0, 1].includes(+invoiceProcessStep)) {
      setNodeStatus(0);
    } else if (+invoiceProcessStep === 2) {
      setNodeStatus(1);
    } else {
      setNodeStatus(2);
    }
  }, [invoiceProcessStep]);
  useEffect(()=>{
    if (backMoneyPeriod){
      orderPerformanceForm.setFieldValue("backMoneyPeriod", backMoneyPeriod);
      setBackMoneyPeriod1(Number(backMoneyPeriod))
    }
  },[backMoneyPeriod])
  return (
    <ConfigProvider locale={zhCN}>
      <WorkItemBox
        title="填写回款周期"
        nodeStatus={nodeStatus}
        operatorUserNameList={financeUserNameList}
        operatorUserName={`${customerBackOpUserName || "待定"}`}
        allBtn={
          <>
            {/* 从财务进入才可以编辑 */}
            {from === "financial" && $permission("collection-cycle-edit") && (
              <>
                {!isEdit && nodeStatus === 1 && (
                  <Button type="primary" onClick={handleEdit}>
                    去填写
                  </Button>
                )}
                {!isEdit && nodeStatus === 2 &&+invoiceProcessStep === 3 &&(
                  <Button type="default" className={styles.ghostButton} onClick={handleEdit}>
                    编辑
                  </Button>
                )}
              </>
            )}
            {isEdit && (
              <div>
                <Button
                  type="primary"
                  loading={btnLoading}
                  className={cs(styles.successButton, "m-r-12")}
                  onClick={handleSubmit}
                >
                  保存
                </Button>
                <Button
                  type="default"
                  className="m-r-12"
                  onClick={handleCancel}
                >
                  取消
                </Button>
              </div>
            )}
          </>
        }
      >
        <div className={cs(styles.paybackPeriodsWrapper, "m-t-24")}>
          <Form form={orderPerformanceForm}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="开票日期">{invoiceDate || "--"}</Form.Item>
              </Col>

              <Col span={8}>
                {isEdit ? (
                  <Form.Item
                    label="回款周期"
                    rules={[{ required: true, message: "请选择回款周期" }]}
                    name="backMoneyPeriod"
                  >
                    <InputNumber value={backMoneyPeriod1} min={1} precision={0} />
                  </Form.Item>
                ) : (
                  <Form.Item label="回款周期">
                    <div className={backMoneyPeriod ? "" : styles.error}>
                      {backMoneyPeriod || <span style={{ color: "red" }}>待填写</span>}
                    </div>
                  </Form.Item>
                )}
              </Col>

              <Col span={8}>
                <Form.Item label="回款截止日期">
                  {backMoneyStopTime || "--"}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </WorkItemBox>
    </ConfigProvider>
  );
};

export default PaybackPeriods;

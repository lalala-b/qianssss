import { useContext, useState } from "react";
import {
  Button,
  message,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  DatePicker,
  ConfigProvider,
} from "antd";
import zhCN from "antd/es/locale/zh_CN";
import cs from "classnames";
import moment from "moment";
import { $orderPerformance } from "src/api/workOrderDetail";
import { DetailContext } from "../../DetailProvider";
import WorkItemBox from "../../WorkDetailComponets/WorkItemBox";
import styles from "./SpecialOrderPerformance.scss";

const { Option } = Select;
const { confirm } = Modal;

const PERFORMANCE_STATUS_ARR = [
  { val: 0, label: "待履约" },
  { val: 1, label: "已履约" },
];

const SpecialOrderPerformance = () => {
  const [orderPerformanceForm] = Form.useForm();

  const {
    detail: {
      performanceNodeAndFieldBO: {
        specialPerformanceNodeBO: {
          nodeStatus = undefined,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          url = "",
          specialPerformStatus = 0,
          completeTime = "",
          cancelReasonTypeDesc = "",
          updateTime = "",
        } = {},
      } = {},
      orderBaseInfoBO: { orderNo = "", orderStatus = "", coopType = 7 } = {},
    },
    setLoading,
    onRefresh,
  } = useContext(DetailContext);
  const [edit, setEdit] = useState(false);
  const [disabledSave, setDisabledSave] = useState(false);

  const handleEdit = () => {
    // 已核账
    if (+orderStatus === 10) {
      message.error("已核账的工单不再支持修改信息");
      return;
    }

    orderPerformanceForm.setFieldsValue({
      url,
      specialPerformStatus: specialPerformStatus || 0,
      completeTime: completeTime ? moment(completeTime || "") : "",
    });

    if (specialPerformStatus) {
      setDisabledSave(false);
    } else {
      setDisabledSave(true);
    }

    setEdit(true);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  const submit = async (editFlag: 0 | 1) => {
    try {
      setLoading(true);
      await $orderPerformance({
        ...orderPerformanceForm.getFieldsValue(true),
        completeTime: moment(
          orderPerformanceForm.getFieldValue("completeTime")
        ).format("YYYY-MM-DD"),
        editFlag,
        orderNo,
        orderStatus,
      });

      message.success("操作成功");
      handleCancel();
      onRefresh();
    } catch (e: any) {
      setLoading(false);
      message.error(String(e.message));
    }
  };

  const handleChangeSubmitStatus = async (editFlag: 0 | 1) => {
    await orderPerformanceForm.validateFields();

    if (editFlag === 0) {
      // 代表进行中
      confirm({
        icon: "",
        content: "确定相关信息均已填写正确",
        async onOk() {
          submit(editFlag);
        },
      });
      return;
    }
    submit(editFlag);
  };

  const handleChangeStatus = (value: number) => {
    if (value) {
      setDisabledSave(false);
    } else {
      setDisabledSave(true);
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <WorkItemBox
        title="工单履约"
        nodeStatus={nodeStatus}
        operatorUserName={`${
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") || "待定"
        }`}
        cancelOrderReason={cancelReasonTypeDesc}
        updateTime={updateTime}
        allBtn={
          <div>
            {/* // 状态不是撤单 且有编辑权限 */}
            {Number(orderStatus) !== 11 && editAuth && (
              <>
                {/* 进行中 */}
                {Number(nodeStatus) === 1 &&
                  (edit ? (
                    <>
                      <Button
                        type="primary"
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={() => handleChangeSubmitStatus(0)}
                        disabled={disabledSave}
                      >
                        保存并提交
                      </Button>
                      <Button onClick={handleCancel}>取消</Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={handleEdit}>
                      去填写
                    </Button>
                  ))}
                {/* 已完成 */}
                {Number(nodeStatus) === 2 &&
                  (edit ? (
                    <>
                      <Button
                        type="primary"
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={() => handleChangeSubmitStatus(1)}
                        disabled={disabledSave}
                      >
                        确认
                      </Button>
                      <Button onClick={handleCancel}>取消</Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={handleEdit}>
                      编辑
                    </Button>
                  ))}
              </>
            )}
          </div>
        }
      >
        <div className={cs(styles.wrapper, "m-t-24")}>
          <Form form={orderPerformanceForm}>
            <Row gutter={24}>
              <Col span={8}>
                {edit ? (
                  <Form.Item
                    label="链接"
                    name="url"
                    // 1 2 3 6分别是图文、代制作，跨工作室合作、B站动态 这4类形式的特殊工单，链接为必填
                    rules={[
                      {
                        required: [1, 2, 3, 6].indexOf(+coopType) > -1,
                        message: "请输入链接",
                      },
                    ]}
                    getValueFromEvent={e => e.target.value.replace(/\s+/g, "")}
                  >
                    <Input />
                  </Form.Item>
                ) : (
                  <Form.Item label="链接">
                    <div className={styles.url}>{url || "--"}</div>
                  </Form.Item>
                )}
              </Col>

              <Col span={8}>
                {edit ? (
                  <Form.Item label="履约状态" name="specialPerformStatus">
                    <Select
                      placeholder="请选择履约状态"
                      className={styles.select}
                      onChange={handleChangeStatus}
                    >
                      {PERFORMANCE_STATUS_ARR.map(item => (
                        <Option key={item.val} value={item.val}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <Form.Item label="履约状态">
                    <div>
                      {PERFORMANCE_STATUS_ARR[specialPerformStatus || 0]?.label}
                    </div>
                  </Form.Item>
                )}
              </Col>

              <Col span={8}>
                {edit ? (
                  <Form.Item
                    label="履约时间"
                    name="completeTime"
                    rules={[
                      {
                        required: true,
                        message: "请选择履约时间",
                      },
                    ]}
                  >
                    <DatePicker />
                  </Form.Item>
                ) : (
                  <Form.Item label="履约时间">
                    <div className={completeTime ? "" : styles.error}>
                      {completeTime
                        ? moment(completeTime).format("YYYY-MM-DD")
                        : "待填写"}
                    </div>
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Form>
        </div>
      </WorkItemBox>
    </ConfigProvider>
  );
};

export default SpecialOrderPerformance;

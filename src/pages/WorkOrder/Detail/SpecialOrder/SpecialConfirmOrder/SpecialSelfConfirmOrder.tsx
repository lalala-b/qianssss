/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import { Form, Row, Col, InputNumber } from "antd";
import moment from "moment";
import { DetailContext } from "../../DetailProvider";
import styles from "./SpecialConfirmOrder.scss";

interface SpecialSelfConfirmOrderPropsType {
  editInfo: boolean;
  submit: boolean;
  busOrderType: number;
  onSubmit: (params: any) => void;
}

const SpecialSelfConfirmOrder: React.FC<SpecialSelfConfirmOrderPropsType> = ({
  editInfo,
  submit,
  onSubmit,
}) => {
  const [confirmOrderForm] = Form.useForm();

  const {
    detail: {
      confirmOrderNodeAndFieldBO: {
        confirmOrderNodeBO: {
          officePrice = "",
          otherIncome = "",
          salesIncome = "",
          costOfSales = "",
          orderActualIncome = "",
          grossProfitRate = "",
          platMoney = "",
          platOrderMoney = "",
          rebateRate = "",
          performanceMoney = "",
          publishDate = "",
          rebateAmount = "",
          darenOtherCost = 0,
        } = {},
      } = {},
    },
    setLoading,
  } = useContext(DetailContext);
  const [edit, setEdit] = useState(false);
  const [computedPerformanceMoney, setComputedPerformanceMoney] = useState<
    number | null
  >(null);

  const handleEdit = () => {
    confirmOrderForm.setFieldsValue({
      publishDate: publishDate ? moment(publishDate || "") : "",
    });
    confirmOrderForm.setFieldValue("darenOtherCost", darenOtherCost || 0);
    setEdit(true);
  };

  const handleCancel = () => {
    setComputedPerformanceMoney(null);
    setEdit(false);
  };

  const handleChangeOtherCost = (val: number) => {
    setComputedPerformanceMoney(+Number(+orderActualIncome - val).toFixed(2));
  };

  const handleSubmit = async () => {
    try {
      await confirmOrderForm.validateFields();
    } catch (e) {
      setLoading(false);
      return;
    }

    const params = {
      belongType: 0,
      publishDate: confirmOrderForm.getFieldValue("publishDate")
        ? moment(confirmOrderForm.getFieldValue("publishDate")).format(
            "YYYY-MM-DD"
          )
        : "",
      darenOtherCost: confirmOrderForm.getFieldValue("darenOtherCost") || 0,
    };
    onSubmit(params);
  };

  useEffect(() => {
    if (editInfo) {
      handleEdit();
    } else {
      handleCancel();
    }
  }, [editInfo]);

  useEffect(() => {
    if (submit) {
      handleSubmit();
    }
  }, [submit]);

  return (
    <Form label-width="180" form={confirmOrderForm}>
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item label="平台报价">
            <div>{officePrice || "--"}</div>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="返点比例" tooltip="指给客户的返点比例">
            <div>{rebateRate || 0}%</div>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="返点金额" tooltip="返点金额=平台报价*返点比例">
            <div>{rebateAmount || 0}</div>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="【实际】官方平台下单价">
            <div>{platOrderMoney || 0}</div>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="【实际】官方平台手续费"
            tooltip="【实际】官方平台手续费=【实际】官方平台下单价 * 手续费比例"
          >
            <div>{platMoney || 0}</div>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="其他收入"
            tooltip="指差旅/授权费/撤单赔偿/组件收入等"
          >
            <div>{otherIncome || 0}</div>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="销售收入" tooltip="销售收入=平台报价+其他收入">
            <div>{salesIncome || 0}</div>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="销售成本" tooltip="销售成本=返点金额">
            <div>{costOfSales || 0}</div>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="工单实际营收"
            tooltip="工单实际营收=平台报价-返点金额+其他收入"
          >
            <div>{orderActualIncome || 0}</div>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="绩效营收"
            tooltip="绩效营收=工单实际营收-达人其他成本"
          >
            <div>
              {computedPerformanceMoney === null
                ? performanceMoney
                : computedPerformanceMoney}
            </div>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="毛利率" tooltip="毛利率=绩效营收/销售收入">
            <div>{grossProfitRate || 0}%</div>
          </Form.Item>
        </Col>

        <Col span={8}>
          {/* {edit ? (
            <Form.Item
              label="档期"
              name="publishDate"
              rules={[{ required: true, message: "请选择档期" }]}
            >
              <DatePicker />
            </Form.Item>
          ) : ( */}
          <Form.Item
            label="档期"
            tooltip="若已定档期和实际不符，请联系执行人修改视频发布截止时间"
          >
            <div className={publishDate ? "" : styles.error}>
              {publishDate || "待确认"}
            </div>
          </Form.Item>
          {/* )} */}
        </Col>

        <Col span={8}>
          {edit ? (
            <Form.Item label="达人其他成本" name="darenOtherCost">
              <InputNumber
                min={0}
                precision={2}
                onChange={handleChangeOtherCost}
              />
            </Form.Item>
          ) : (
            <Form.Item label="达人其他成本">
              <div>{darenOtherCost}</div>
            </Form.Item>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default SpecialSelfConfirmOrder;

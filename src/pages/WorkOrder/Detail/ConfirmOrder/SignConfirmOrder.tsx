/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import { Form, Row, Col, InputNumber, Switch, Select, DatePicker } from "antd";
import moment from "moment";
import { DetailContext } from "../DetailProvider";
import styles from "./ConfirmOrder.scss";

const { Option } = Select;

interface SignConfirmOrderPropsType {
  editInfo: boolean;
  submit: boolean;
  busOrderType?: number;
  onSubmit: (params: any) => void;
}

const SignConfirmOrder: React.FC<SignConfirmOrderPropsType> = ({
  editInfo,
  submit,
  onSubmit,
}) => {
  const [confirmOrderForm] = Form.useForm();

  const {
    detail: {
      orderBaseInfoBO: { orderBelongType = "" } = {},
      confirmOrderNodeAndFieldBO: {
        confirmOrderNodeBO: {
          officePrice = "",
          otherIncome = "",
          salesIncome = "",
          costOfSales = "",
          orderActualIncome = "",
          grossProfitRate = "",
          darenOtherCost = "",
          platMoney = "",
          platOrderMoney = "",
          rebateRate = "",
          performanceMoney = "",
          outMoneyRatio = "",
          outMoney = "",
          darenUndertakeRefundMoney = "",
          darenUndertakeRefundRatio = "",
          publishDate = "",
          contentAssist = "",
          paymentType = "",
          collectionMoney = "",
          rebateAmount = "",
        } = {},
      } = {},
    },
    setLoading,
  } = useContext(DetailContext);
  const [edit, setEdit] = useState(false);
  const [computedGrossProfitRate, setComputedGrossProfitRate] = useState<
    number | null
  >(null);
  const [computedOutMoney, setComputedOutMoney] = useState<number | null>(null);
  const [computedOutMoneyRatio, setComputedOutMoneyRatio] = useState<
    number | null
  >(null);
  const [computedCollectionMoney, setComputedCollectionMoney] = useState<
    number | null
  >(null);
  const [computedPerformanceMoney, setComputedPerformanceMoney] = useState<
    number | null
  >(null);
  const [computedPaymentType, setComputedPaymentType] = useState<number | null>(
    null
  );

  const handleEdit = () => {
    confirmOrderForm.setFieldsValue({
      // 达人分担返点金额默认是返点金额
      darenUndertakeRefundMoney: !darenUndertakeRefundMoney && darenUndertakeRefundMoney !== 0 ? costOfSales : darenUndertakeRefundMoney, 
      publishDate: publishDate ? moment(publishDate || "") : "",
      darenUndertakeRefundRatio,
      contentAssist,
      paymentType,
      outMoneyRatio,
      outMoney,
      darenOtherCost,
    });
    setEdit(true);
  };

  // 根据达人成本的改变，计算其余相关字段
  const computedField = (newOutMoney: number) => {
    // 达人其他成本的表单值
    const darenOtherCostVal = confirmOrderForm.getFieldValue('darenOtherCost') || 0

    // 应付
    if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 1
    ) {
      // 应付金额 = 达人分成成本+达人其他成本
      setComputedCollectionMoney(+Number(newOutMoney + +darenOtherCostVal).toFixed(2));
    } else if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 2
    ) {
      // 应收金额=【实际】官方平台下单价-达人分成成本-达人其他成本
      setComputedCollectionMoney(+Number(Math.abs(+platOrderMoney - newOutMoney - +darenOtherCostVal)).toFixed(2));
    }

    // 绩效营收=工单实际营收-达人分成成本-达人其他成本
    const newPerformanceMoney = +Number(
      +(orderActualIncome || 0) - +newOutMoney - +darenOtherCostVal
    ).toFixed(2);

    setComputedPerformanceMoney(newPerformanceMoney);

    // 毛利率=绩效营收/销售收入
    const newGrossProfitRate = salesIncome
      ? +Number((newPerformanceMoney / salesIncome) * 100).toFixed(2)
      : 0;
    setComputedGrossProfitRate(newGrossProfitRate);

    // 达人分成比例 = 达人分成成本 /（平台报价-达人分担返点金额）
    const darenUndertakeRefundMoney = confirmOrderForm.getFieldValue(
      "darenUndertakeRefundMoney"
    );
    const computedOutMoneyRatio = +Number(
      (newOutMoney / (+officePrice - +darenUndertakeRefundMoney)) * 100
    ).toFixed(2);
    confirmOrderForm.setFieldValue("outMoneyRatio", computedOutMoneyRatio);
    setComputedOutMoneyRatio(computedOutMoneyRatio);
  };

  const handleChangeDarenUndertakeRefundMoney = (val: number) => {
    // 达人分担返点比例=达人分担返点金额/平台报价
    const newDarenRefundRadio = officePrice
      ? +Number((+val / officePrice) * 100).toFixed(2)
      : 0;

    confirmOrderForm.setFieldsValue({
      ...confirmOrderForm.getFieldsValue(),
      darenUndertakeRefundRatio: newDarenRefundRadio,
    });

    // 达人分成成本=（平台报价-达人分担返点金额）*达人分成比例
    const newOutMoney = +Number(
      (+officePrice - +val) *
        ((confirmOrderForm.getFieldValue("outMoneyRatio") || 0) / 100)
    ).toFixed(2);
    confirmOrderForm.setFieldValue("outMoney", newOutMoney);
    setComputedOutMoney(newOutMoney);
    computedField(newOutMoney);
  };

  // 修改达人分成比例
  const handleChangeOutMoneyRatio = (val: number) => {
    const darenUndertakeRefundMoney = confirmOrderForm.getFieldValue(
      "darenUndertakeRefundMoney"
    );
    // 达人分成成本=（平台报价-达人分担返点金额）*达人分成比例
    const newOutMoney = +Number(
      (+officePrice - +darenUndertakeRefundMoney) * ((val || 0) / 100)
    ).toFixed(2);
    setComputedOutMoney(newOutMoney);
    confirmOrderForm.setFieldValue("outMoney", newOutMoney);
    computedField(newOutMoney);
  };

  // 修改达人分成成本
  const handleChangeOutMoney = (val: number) => {
    computedField(val);
  };

  const handleChangeDarenUndertakeRefundRatio = (val: number) => {
    // 达人分担返点金额 = 平台报价 * 达人分担返点比例
    const newDarenRefundMoney = (+officePrice * (val || 0)) / 100;

    confirmOrderForm.setFieldsValue({
      ...confirmOrderForm.getFieldsValue(),
      darenUndertakeRefundMoney: newDarenRefundMoney,
    });

    // 达人分成成本=（平台报价-达人分担返点金额）*达人分成比例
    const newOutMoney = +Number(
      (+officePrice - +newDarenRefundMoney) *
        ((confirmOrderForm.getFieldValue("outMoneyRatio") || 0) / 100)
    ).toFixed(2);
    setComputedOutMoney(newOutMoney);
    confirmOrderForm.setFieldValue("outMoney", newOutMoney);
    computedField(newOutMoney);
  };

  const handleChangePaymentType = (val: number) => {
    // 达人其他成本的表单值
    const darenOtherCostVal = confirmOrderForm.getFieldValue('darenOtherCost') || 0

    setComputedPaymentType(val);

    const daren = computedOutMoney === null ? outMoney || 0 : computedOutMoney;

    // 应付
    if (+(val === null ? paymentType : val) === 1) {
      // 应付金额 = 达人分成成本 + 达人其他成本
      setComputedCollectionMoney(+Number(+daren + +darenOtherCostVal).toFixed(2));
    } else if (+(val === null ? paymentType : val) === 2) {
      // 应收金额=【实际】官方平台下单价 - 达人分成成本 - 达人其他成本
      setComputedCollectionMoney(+Number(Math.abs(+platOrderMoney - +daren - +darenOtherCostVal)).toFixed(2));
    }
  };

  // 修改达人其他成本(重新计算绩效营收，应收应付的值)
  const handleChangeDarenOtherCost = (val: number) => {
    const outMoneyVal = confirmOrderForm.getFieldValue("outMoney");  // 达人分成成本目前的表单值
     // 绩效营收=工单实际营收-达人分成成本-达人其他成本
     const newPerformanceMoney = +Number(
      +(orderActualIncome || 0) - +(outMoneyVal || 0) - +val
    ).toFixed(2);
    setComputedPerformanceMoney(newPerformanceMoney);

     // 应付
     if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 1
    ) {
      // 应付金额 = 达人分成成本+达人其他成本
      setComputedCollectionMoney(+Number(outMoneyVal + +val).toFixed(2));
    } else if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 2
    ) {
      // 应收金额=【实际】官方平台下单价-达人分成成本-达人其他成本
      setComputedCollectionMoney(+Number(Math.abs(+platOrderMoney - outMoneyVal - +val)).toFixed(2));
    }
  }

  const handleCancel = () => {
    // 达人分成成本、达人分成比例、绩效营收、毛利率、收付款、收付金额 计算值置空
    setComputedOutMoney(null);
    setComputedOutMoneyRatio(null);
    setComputedPerformanceMoney(null);
    setComputedGrossProfitRate(null);
    setComputedPaymentType(null);
    setComputedCollectionMoney(null);
    setEdit(false);
  };

  const handleSubmit = async () => {
    try {
      await confirmOrderForm.validateFields();
    } catch (e) {
      setLoading(false);
      return;
    }

    const params = {
      belongType: 1,
      ...confirmOrderForm.getFieldsValue(),
      publishDate: confirmOrderForm.getFieldValue("publishDate")
        ? moment(confirmOrderForm.getFieldValue("publishDate")).format(
            "YYYY-MM-DD"
          )
        : "",
      contentAssist: +confirmOrderForm.getFieldValue("contentAssist"),
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
          {edit ? (
            <Form.Item
              label="达人分担返点比例"
              name="darenUndertakeRefundRatio"
              tooltip="达人分担返点比例=达人分担返点金额/平台报价"
              rules={[{ required: true, message: "请输入达人分担返点比例" }]}
            >
              <InputNumber
                min={1}
                onChange={handleChangeDarenUndertakeRefundRatio}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="达人分担返点比例"
              tooltip="达人分担返点比例=达人分担返点金额/平台报价"
            >
              <div>{darenUndertakeRefundRatio || 0}%</div>
            </Form.Item>
          )}
        </Col>
        <Col span={8}>
          {edit ? (
            <Form.Item
              label="达人分担返点金额"
              name="darenUndertakeRefundMoney"
              tooltip="达人分担返点金额=平台报价*达人分担返点比例"
              rules={[{ required: true, message: "请输入达人分担返点金额" }]}
            >
              <InputNumber
                min={0}
                onChange={handleChangeDarenUndertakeRefundMoney}
                precision={2}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="达人分担返点金额"
              tooltip="达人分担返点金额=平台报价*达人分担返点比例"
            >
              <div>{darenUndertakeRefundMoney}</div>
            </Form.Item>
          )}
        </Col>
        <Col span={8}>
          {edit ? (
            <Form.Item
              label="达人分成比例"
              name="outMoneyRatio"
              rules={[{ required: true, message: "请输入达人分成比例" }]}
            >
              <InputNumber
                min={0}
                max={100}
                onChange={handleChangeOutMoneyRatio}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          ) : (
            <Form.Item label="达人分成比例">
              <div>
                {computedOutMoneyRatio === null
                  ? outMoneyRatio || 0
                  : computedOutMoneyRatio}
                %
              </div>
            </Form.Item>
          )}
        </Col>
        <Col span={8}>
          {edit ? (
            <Form.Item
              label="达人分成成本"
              name="outMoney"
              tooltip="达人分成成本 =（平台报价-达人分担返点金额）* 达人分成比例"
              rules={[{ required: true, message: "请输入达人分成成本" }]}
            >
              <InputNumber
                min={0}
                onChange={handleChangeOutMoney}
                precision={2}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="达人分成成本"
              tooltip="达人分成成本 =（平台报价-达人分担返点金额）* 达人分成比例"
            >
              <div>
                {computedOutMoney === null ? outMoney || 0 : computedOutMoney}
              </div>
            </Form.Item>
          )}
        </Col>
        <Col span={8}>
          <Form.Item label="【实际】官方平台下单价">
            <div>{platOrderMoney || 0}</div>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="【实际】官方平台手续费"
            tooltip="【实际】官方平台手续费=【实际】官方平台下单价*手续费比例"
          >
            <div>{platMoney}</div>
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
            tooltip="绩效营收=工单实际营收-达人分成成本-达人其他成本"
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
            <div>
              {computedGrossProfitRate === null
                ? grossProfitRate
                : computedGrossProfitRate || 0}
              %
            </div>
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
            <Form.Item label="档期" tooltip="若已定档期和实际不符，请联系执行人修改视频发布截止时间">
              <div className={publishDate ? "" : styles.error}>
                {publishDate || "待确认"}
              </div>
            </Form.Item>
          {/* )} */}
        </Col>
        <Col span={8}>
          {edit ? (
            <>
              <Form.Item label="内容协助" name="contentAssist">
                <Switch />
              </Form.Item>
            </>
          ) : (
            <Form.Item label="内容协助">
              <div>{contentAssist ? "是" : "否"}</div>
            </Form.Item>
          )}
        </Col>
        <Col span={8}>
          {edit ? (
            <>
              <Form.Item
                label="收付款类型"
                tooltip="根据达人实际情况，如果达人已经加入乾派MCN，则需要向达人付款，若达人未加入乾派MCN，则需要向达人收款"
                name="paymentType"
                rules={[{ required: true, message: "请选择收付款类型" }]}
              >
                <Select
                  placeholder="请选择"
                  className={styles.select}
                  onChange={handleChangePaymentType}
                >
                  <Option value={2}>向达人收款</Option>
                  <Option value={1}>向达人付款</Option>
                </Select>
              </Form.Item>
            </>
          ) : (
            <Form.Item
              label="收付款类型"
              tooltip="根据达人实际情况，如果达人已经加入乾派MCN，则需要向达人付款，若达人未加入乾派MCN，则需要向达人收款"
            >
              <div
                className={
                  +(computedPaymentType === null
                    ? paymentType
                    : computedPaymentType) === 1
                    ? ""
                    : +(computedPaymentType === null
                        ? paymentType
                        : computedPaymentType) === 2
                    ? ""
                    : styles.error
                }
              >
                {+(computedPaymentType === null
                  ? paymentType
                  : computedPaymentType) === 1
                  ? "向达人付款"
                  : +(computedPaymentType === null
                      ? paymentType
                      : computedPaymentType) === 2
                  ? "向达人收款"
                  : "待确认"}
              </div>
            </Form.Item>
          )}
        </Col>
        {+(computedPaymentType === null ? paymentType : computedPaymentType) ===
          2 && (
          <Col span={8}>
            <Form.Item
              label="应收金额"
              tooltip="应收金额=【实际】官方平台下单价-达人分成成本-达人其他成本"
            >
              {computedCollectionMoney === null
                ? collectionMoney
                : computedCollectionMoney}
            </Form.Item>
          </Col>
        )}

        {+(computedPaymentType === null ? paymentType : computedPaymentType) ===
          1 && (
          <Col span={8}>
            <Form.Item label="应付金额" tooltip="应付金额=达人分成成本+达人其他成本">
              {computedCollectionMoney === null
                ? collectionMoney
                : computedCollectionMoney}
            </Form.Item>
          </Col>
        )}

        <Col span={8}>
          {edit ? (
            <>
              <Form.Item
                label="达人其他成本"
                name="darenOtherCost"
                tooltip="指除达人分成金额外，其他需要额外支付给达人的费用，例如达人的差旅费"
              >
                <InputNumber precision={2} onChange={handleChangeDarenOtherCost}/>
              </Form.Item>
              <p
                style={{
                  color: "red",
                  marginTop: "-12px",
                  marginBottom: "12px",
                }}
              >
                若是达人垫付资金，请输入正数；若是我们公司或者客户垫付的资金，则输入负数
              </p>
            </>
          ) : (
            <Form.Item
              label="达人其他成本"
              tooltip="指除达人分成金额外，其他需要额外支付给达人的费用，例如达人的差旅费​"
            >
              <div>{darenOtherCost || 0}</div>
            </Form.Item>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default SignConfirmOrder;

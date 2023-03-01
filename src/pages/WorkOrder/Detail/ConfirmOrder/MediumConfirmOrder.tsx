/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import { Form, Row, Col, InputNumber, Select, DatePicker } from "antd";
import moment from "moment";
import { $getMediumUserList } from "src/api/workOrderDetail";
import { DetailContext } from "../DetailProvider";
import styles from "./ConfirmOrder.scss";

const { Option } = Select;

interface MediumConfirmOrderPropsType {
  editInfo: boolean;
  submit: boolean;
  busOrderType: number;
  onSubmit: (params: any) => void;
}

const MediumConfirmOrder: React.FC<MediumConfirmOrderPropsType> = ({
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
          rebateRate = "",
          platMoney = "",
          platOrderMoney = "",
          outMoneyRatio = "",
          otherCost = 0,
          performanceMoney = "",
          outMoney = "",
          publishDate = "",
          paymentType = "",
          collectionMoney = "",
          mediumDeliveryUserName = "",
          mediumDeliveryUserId = "",
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
  const [computedCollectionMoney, setComputedCollectionMoney] = useState<
    number | null
  >(null);
  const [computedPerformanceMoney, setComputedPerformanceMoney] = useState<
    number | null
  >(null);
  const [computedPaymentType, setComputedPaymentType] = useState<number | null>(
    null
  );
  const [mediumUserList, setMediumUserList] = useState<
    { userId: number; realname: string }[]
  >([]);

  const handleEdit = () => {
    confirmOrderForm.setFieldsValue({
      otherCost,
      paymentType,
      outMoney,
      outMoneyRatio,
      publishDate: publishDate ? moment(publishDate || "") : "",
      mediumDeliveryUserId,
      darenOtherCost,
    });
    setEdit(true);
  };

  const handleChangeOutMoney = (val: number) => {
    // 媒介达人返点比例 = 100 - (采购达人成本/平台报价) * 100
    const newOutMoneyRatio = officePrice
      ? Number(100 - (+(val || 0) / officePrice) * 100).toFixed(2)
      : 0;

    confirmOrderForm.setFieldsValue({
      ...confirmOrderForm.getFieldsValue(),
      outMoneyRatio: newOutMoneyRatio,
    });

    // 达人其他成本的表单值
    const darenOtherCostVal = confirmOrderForm.getFieldValue('darenOtherCost') || 0

    // 绩效营收=工单实际营收-采购达人分成成本-达人其他成本
    const newPerformanceMoney = +Number(
      +orderActualIncome - +val - +darenOtherCostVal
    ).toFixed(2);

    setComputedPerformanceMoney(newPerformanceMoney);

    // 毛利率=绩效营收/销售收入
    const newGrossProfitRate = salesIncome
      ? +Number((newPerformanceMoney / salesIncome) * 100).toFixed(2)
      : 0;
    setComputedGrossProfitRate(newGrossProfitRate);

    // 应付
    if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 1
    ) {
      // 应付金额 = 采购达人分成 + 达人其他成本
      setComputedCollectionMoney(+Number(+val + +darenOtherCostVal).toFixed(2));
    } else if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 2
    ) {
      // 应收金额=【实际】官方平台下单价-采购达人分成-达人其他成本
      setComputedCollectionMoney(+Number(Math.abs(+platOrderMoney - val - +darenOtherCostVal)).toFixed(2));
    }
  };

  const handleChangeOutMoneyRatio = (val: number) => {
    // 采购达人成本=平台报价-（平台报价*媒介达人返点比例）
    const newOutMoney = officePrice
      ? Number(officePrice - (+(val || 0) * officePrice) / 100).toFixed(2)
      : 0;

    confirmOrderForm.setFieldsValue({
      ...confirmOrderForm.getFieldsValue(),
      outMoney: newOutMoney,
    });

    // 达人其他成本的表单值
    const darenOtherCostVal = confirmOrderForm.getFieldValue('darenOtherCost') || 0

    // 绩效营收=工单实际营收-采购达人分成成本-达人其他成本
    const newPerformanceMoney = +Number(
      +orderActualIncome - +newOutMoney - +darenOtherCostVal
    ).toFixed(2);

    setComputedPerformanceMoney(newPerformanceMoney);

    // 毛利率=绩效营收/销售收入
    const newGrossProfitRate = salesIncome
      ? +Number((newPerformanceMoney / salesIncome) * 100).toFixed(2)
      : 0;
    setComputedGrossProfitRate(newGrossProfitRate);

    // 应付
    if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 1
    ) {
      // 应付金额 = 采购达人分成+达人其他成本
      setComputedCollectionMoney(+Number(+newOutMoney + +darenOtherCostVal).toFixed(2));
    } else if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 2
    ) {
      // 应收金额=【实际】官方平台下单价-采购达人分成-达人其他成本
      setComputedCollectionMoney(+Number(Math.abs(+platOrderMoney - +newOutMoney - +darenOtherCostVal)).toFixed(2));
    }
  };

  const handleChangePaymentType = (val: number) => {
    setComputedPaymentType(val);

    // 采购达人分成
    const daren = confirmOrderForm.getFieldValue("outMoney") || 0;

    // 达人其他成本的表单值
    const darenOtherCostVal = confirmOrderForm.getFieldValue('darenOtherCost') || 0

    // 应付
    if (+(val === null ? paymentType : val) === 1) {
      // 应付金额 = 采购达人分成 + 达人其他成本
      setComputedCollectionMoney(+Number(+daren + +darenOtherCostVal).toFixed(2));
    } else if (+(val === null ? paymentType : val) === 2) {
      // 应收金额=【实际】官方平台下单价-采购达人分成-达人其他成本
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
      // 应付金额 = 采购达人分成 + 达人其他成本
      setComputedCollectionMoney(+Number(+outMoneyVal + +val).toFixed(2));
    } else if (
      +(computedPaymentType === null ? paymentType : computedPaymentType) === 2
    ) {
      // 应收金额=【实际】官方平台下单价-采购达人分成 - 达人其他成本
      setComputedCollectionMoney(+Number(Math.abs(+platOrderMoney - +outMoneyVal - +val)).toFixed(2));
    }
  }

  const handleCancel = () => {
    // 绩效营收、毛利率、收付款、收付金额 计算值置空
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
      belongType: 2,
      ...confirmOrderForm.getFieldsValue(),
      otherCost: +confirmOrderForm.getFieldValue("otherCost"),
      outMoneyRatio: Number(+confirmOrderForm.getFieldValue("outMoneyRatio") || 0).toFixed(2),
      outMoney: Number(+confirmOrderForm.getFieldValue("outMoney") || 0).toFixed(2),
      mediumDeliveryUserName: mediumUserList.find(
        item =>
          +item.userId ===
          +confirmOrderForm.getFieldValue("mediumDeliveryUserId")
      )?.realname,
      publishDate: confirmOrderForm.getFieldValue("publishDate")
        ? moment(confirmOrderForm.getFieldValue("publishDate")).format(
            "YYYY-MM-DD"
          )
        : "",
    };

    onSubmit(params);
  };

  const getMediumUserList = async () => {
    const res = await $getMediumUserList();
    setMediumUserList(res);
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

  useEffect(() => {
    getMediumUserList();
  }, []);

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
              label="媒介达人返点比例"
              name="outMoneyRatio"
              rules={[{ required: true, message: "请输入媒介达人返点比例" }]}
            >
              <InputNumber
                min={0}
                max={100}
                precision={2}
                onChange={handleChangeOutMoneyRatio}
                addonAfter="%"
              />
            </Form.Item>
          ) : (
            <Form.Item label="媒介达人返点比例">
              <div>{outMoneyRatio || 0}%</div>
            </Form.Item>
          )}
        </Col>

        <Col span={8}>
          {edit ? (
            <Form.Item
              label="采购达人成本"
              tooltip="采购达人成本=平台报价-（平台报价*媒介达人返点比例）"
              name="outMoney"
              rules={[{ required: true, message: "请输入采购达人成本" }]}
            >
              <InputNumber
                min={0}
                precision={2}
                onChange={handleChangeOutMoney}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="采购达人成本"
              tooltip="采购达人成本=平台报价-（平台报价*媒介达人返点比例）"
            >
              <div>{outMoney || 0}</div>
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
            tooltip="【实际】官方平台手续费=【实际】官方平台下单价 * 手续费比例"
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
          <Form.Item label="销售收入" tooltip="销售收入=返点金额">
            <div>{salesIncome || 0}</div>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="销售成本" tooltip="销售成本=平台报价*返点比例">
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
            tooltip="绩效营收=工单实际营收-采购达人成本-达人其他成本"
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
            <Form.Item
              label="媒介投放人"
              name="mediumDeliveryUserId"
              rules={[{ required: true, message: "请选择媒介投放人" }]}
            >
              <Select
                className={styles.select}
                placeholder="请选择"
                optionFilterProp="children"
                showSearch
                allowClear
              >
                {mediumUserList.map(({ userId, realname }) => (
                  <Option key={userId} value={userId}>
                    {realname}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item label="媒介投放人">
              <div className={!mediumDeliveryUserName ? styles.error : ""}>
                {mediumDeliveryUserName || "待确认"}
              </div>
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
              tooltip="应收金额=【实际】官方平台下单价-采购达人分成-达人其他成本"
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
            <Form.Item label="应付金额" tooltip="应付金额=采购达人分成+达人其他成本">
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

export default MediumConfirmOrder;

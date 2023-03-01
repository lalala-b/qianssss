/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable keyword-spacing */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, InputNumber, Select, message } from "antd";
import { $editPrice } from "src/api/business";
import AccountCard from "src/components/AccountCard";
import cs from "classnames";
import styles from "./EditPriceModal.scss";

interface EditPriceModalPropType {
  show: boolean;
  curEditMsg: any;
  commercialMsg: any;
  onGetList: () => void;
  onClose: () => void;
}

interface PaymentType {
  value: number;
  label: string;
}

const EditPriceModal: React.FC<EditPriceModalPropType> = ({
  show,
  curEditMsg,
  commercialMsg,
  onGetList,
  onClose,
}) => {
  const [form] = Form.useForm();
  const {
    id,
    orderType = 0,
    accountId = 0,
    accountName = "--",
    businessRevenue,
    cusOfflineSupplement,
    companyOfflineSupplement,
    officialPrice,
    otherIncome,
    rebateRate,
    platOrderMoney,
    platOrderCharge,
    platMoney,
    rebateType = undefined,
    rebateCorporate,
    rebatePrivate,
    accountBaseInfoVo: {
      accountBelong = "",
      birthday = "",
      sex = "",
      areaName = "",
    } = {},
    accountOfficialPriceVo: { platId = 25 } = {},
  } = curEditMsg;
  const { businessTypeDesc, id: opId } = commercialMsg;

  const [paymentType, setPaymentType] = useState<number | undefined>(
    rebateType
  );

  // const [firstChangeFlag, setFirstChangeFlag] = useState<boolean>(true);

  const [businessRevenueForComputed, setBusinessRevenueForComputed] =
    useState<number>(businessRevenue);

  const [cusOfflineSupplementForComputed, setCusOfflineSupplementForComputed] =
    useState<number>(cusOfflineSupplement);

  const [
    companyOfflineSupplementForComputed,
    setCompanyOfflineSupplementForComputed,
  ] = useState<number>(rebateCorporate || companyOfflineSupplement);

  const [rebateRateVal, setRebateRateVal] = useState<number>(rebateRate);

  const [officialPriceVal, setOfficialPriceVal] =
    useState<number>(officialPrice);

  const [otherIncomeVal, setOtherIncomeVal] = useState<number>(otherIncome);

  const [platOrderMoneyVal, setPlatOrderMoneyVal] =
    useState<number>(platOrderMoney);

  const [platOrderChargeVal, setPlatOrderChargeVal] =
    useState<number>(platOrderCharge);

  const [platMoneyVal, setPlatMoneyVal] = useState<number>(platMoney);

  // 手续费收入
  const serviceCharge =
    businessTypeDesc === "代客下单"
      ? Number((platOrderChargeVal - platMoneyVal).toFixed(2))
      : 0;
  const [serviceChargeVal, setServiceChargeVal] =
    useState<number>(serviceCharge);

  // 计算后的对公返款
  const [publicePriceOfComputed, setPublicePriceOfComputed] = useState<number>(
    companyOfflineSupplementForComputed
    // rebateCorporate || companyOfflineSupplement
  );

  const [rebatePrivateOfComputed, setRebatePrivateOfComputed] =
    useState<number>(rebatePrivate);

  const [saveLoading, setSaveLoading] = useState<boolean>(false);

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

  const getOrderType = (orderType: number) => {
    let str = "--";
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

  //   回显编辑数据
  const echoEditData = () => {
    const arr = [
      {
        name: "officialPrice",
        value: officialPrice,
      },
      {
        name: "rebateRate",
        value: rebateRate,
      },
      {
        name: "otherIncome",
        value: otherIncome,
      },
      {
        name: "platOrderMoney",
        value: platOrderMoney,
      },
      {
        name: "platOrderCharge",
        value: platOrderCharge,
      },
      {
        name: "platMoney",
        value: platMoney,
      },
      {
        name: "rebateType",
        value: rebateType,
      },
      {
        name: "rebatePrivateOfComputed",
        value: rebatePrivate,
      },
    ];
    arr.forEach(item => {
      if (item.name === "rebateType") {
        item.value = item.value || undefined;
        setPaymentType(item.value);
        form.setFieldValue(item.name, item.value);
        return;
      }
      form.setFieldValue(item.name, item.value || 0);
    });
  };

  //  自动计算线下应收的值
  const setCusOfflineSupplementForComputedVal = (
    businessRevenue: number,
    platOrderMoney: number
  ) => {
    // 若：商务实际营收 - 官方平台实际下单价 > 0，线下应收 = 商务实际营收 - 官方平台实际下单价
    // 若：商务实际营收 - 官方平台实际下单价 < 0，线下应收 = 0
    const cusOfflineSupplementForComputed =
      businessRevenue - platOrderMoney > 0
        ? Number((businessRevenue - platOrderMoney)?.toFixed(2))
        : 0;
    setCusOfflineSupplementForComputed(cusOfflineSupplementForComputed);
  };

  //  自动计算线下应付的值
  const setCompanyOfflineSupplementForComputedVal = (
    businessRevenue: number,
    platOrderMoney: number
  ) => {
    // 若：商务实际营收 - 官方平台实际下单价 < 0，线下应付 = 官方平台实际下单价 - 商务实际营收
    // 若：商务实际营收 - 官方平台实际下单价 > 0，线下应付 = 0
    const cusOfflineSupplementForComputed =
      businessRevenue - platOrderMoney < 0
        ? Number((platOrderMoney - businessRevenue)?.toFixed(2))
        : 0;
    setCompanyOfflineSupplementForComputed(cusOfflineSupplementForComputed);
    let newRebatePrivateOfComputed = rebatePrivateOfComputed;
    if (rebatePrivateOfComputed > cusOfflineSupplementForComputed) {
      setRebatePrivateOfComputed(cusOfflineSupplementForComputed);
      form.setFieldValue(
        "rebatePrivateOfComputed",
        cusOfflineSupplementForComputed
      );
      newRebatePrivateOfComputed = cusOfflineSupplementForComputed;
    }
    setPublicePriceOfComputed(
      Number(
        (cusOfflineSupplementForComputed - newRebatePrivateOfComputed).toFixed(
          2
        )
      )
    );
  };

  // 自动计算商务实际营收的值
  const setBusinessRevenueForComputedVal = (
    officialPrice: number,
    rebateRate: number,
    otherIncome: number,
    serviceCharge: number,
    platOrderMoney: number
  ) => {
    // 商务实际营收 = 平台报价 - 【平台报价*返点比例】+其他收入+手续费收入
    const newBusinessRevenue = Number(
      (
        officialPrice -
        officialPrice * (rebateRate / 100) +
        otherIncome +
        serviceCharge
      )?.toFixed(2)
    );
    setBusinessRevenueForComputed(newBusinessRevenue);
    // 重新自动计算线下应收和线下应付的值
    setCusOfflineSupplementForComputedVal(newBusinessRevenue, platOrderMoney);
    setCompanyOfflineSupplementForComputedVal(
      newBusinessRevenue,
      platOrderMoney
    );
  };

  // 修改返点比例的数据
  const handleChangeRebateRate = (val: number) => {
    const newRebateRate = Number(val?.toFixed(2));
    const newPlatOrderMoney = Number(
      (officialPriceVal - officialPriceVal * (newRebateRate / 100))?.toFixed(2)
    );
    setPlatOrderMoneyVal(newPlatOrderMoney);
    form.setFieldValue("platOrderMoney", newPlatOrderMoney);
    handleUpdatePlatMoney(newPlatOrderMoney);
    setBusinessRevenueForComputedVal(
      officialPriceVal,
      newRebateRate,
      otherIncomeVal,
      serviceChargeVal,
      newPlatOrderMoney
    );
    setRebateRateVal(newRebateRate);
  };

  // 修改平台报价的数据
  const handleChangeOfficialPrice = (val: number) => {
    const newOfficialPrice = Number(val?.toFixed(2));
    const newPlatOrderMoney = Number(
      (newOfficialPrice - newOfficialPrice * (rebateRateVal / 100))?.toFixed(2)
    );
    setPlatOrderMoneyVal(newPlatOrderMoney);
    form.setFieldValue("platOrderMoney", newPlatOrderMoney);
    handleUpdatePlatMoney(newPlatOrderMoney);
    if (platId === 25 || platId === 26) {
      const newPlatOrderCharge = newOfficialPrice * 0.05;
      setPlatOrderChargeVal(newPlatOrderCharge);
      form.setFieldValue("platOrderCharge", newPlatOrderCharge);
    }
    setBusinessRevenueForComputedVal(
      newOfficialPrice,
      rebateRateVal,
      otherIncomeVal,
      serviceChargeVal,
      newPlatOrderMoney
    );
    setOfficialPriceVal(newOfficialPrice);
  };

  // 修改其他收入的数据
  const handleChangeOtherIncome = (val: number) => {
    const newOtherIncome = Number(val?.toFixed(2));
    setBusinessRevenueForComputedVal(
      officialPriceVal,
      rebateRateVal,
      newOtherIncome,
      serviceChargeVal,
      platOrderMoneyVal
    );
    setOtherIncomeVal(newOtherIncome);
  };

  // 修改实际官方平台下单价的数据
  const handleChangePlatOrderMoney = (val: number) => {
    const newPlatOrderMoney = Number(val?.toFixed(2));
    setPlatOrderMoneyVal(newPlatOrderMoney);
    handleUpdatePlatMoney(newPlatOrderMoney);
    setCusOfflineSupplementForComputedVal(
      businessRevenueForComputed,
      newPlatOrderMoney
    );
    setCompanyOfflineSupplementForComputedVal(
      businessRevenueForComputed,
      newPlatOrderMoney
    );
  };

  // 非抖快平台更新实际官方平台手续费
  const handleUpdatePlatMoney = (platMoney: number) => {
    if (platId === 25 || platId === 26) {
      const newPlatMoney = platMoney * 0.05;
      setPlatMoneyVal(newPlatMoney);
      form.setFieldValue("platMoney", newPlatMoney);
    }
  };

  // 修改报给客户官方平台手续费的数据
  const handleChangePlatOrderCharge = (val: number) => {
    const newPlatOrderCharge = Number(val?.toFixed(2));
    setPlatOrderChargeVal(newPlatOrderCharge);
  };

  // 修改实际官方平台手续费的数据
  const handleChangePlatMoney = (val: number) => {
    const newPlatMoney = Number(val?.toFixed(2));
    setPlatMoneyVal(newPlatMoney);
  };

  // 修改返款类型
  const handleChangePaymentType = (val: number) => {
    setPaymentType(val);

    // form.setFieldValue("rebatePrivateOfComputed", 0);
    // setRebatePrivateOfComputed(0);
  };

  // 修改对私返款合计，并自动计算对公返款金额
  const handleChangeRebatePrivateForComputed = (val: number) => {
    setRebatePrivateOfComputed(val);
    const publicePriceOfComputed =
      companyOfflineSupplementForComputed - val < 0
        ? 0
        : Number((companyOfflineSupplementForComputed - val)?.toFixed(2));
    setPublicePriceOfComputed(publicePriceOfComputed);
    // setFirstChangeFlag(false);
  };

  // 保存修改报价的信息
  const handleSaveEditMsg = async () => {
    form.submit();
  };

  // 校验是否修改过选项
  const checkIsModify = () => {
    const baseCheck = () =>
      officialPrice === officialPriceVal &&
      otherIncome === otherIncomeVal &&
      rebateRate === rebateRateVal &&
      // eslint-disable-next-line eqeqeq
      rebateType == paymentType &&
      rebatePrivateOfComputed === rebatePrivate;
  
    if (
      (baseCheck() &&
        platOrderMoney === platOrderMoneyVal &&
        (businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收")) ||
      (baseCheck() &&
        platOrderMoney === platOrderMoneyVal &&
        platOrderCharge === platOrderChargeVal &&
        platMoney === platMoneyVal &&
        businessTypeDesc === "代客下单") ||
      (baseCheck() && businessTypeDesc === "不走平台的私单")
    ) {
      return false;
    }

    return true;
  };

  const handleFinishEditPrice = async (params: any) => {
    try {
      if (!checkIsModify()) {
        message.error("没有修改过对应编辑项，无法提交");
        return;
      }
      const paramsObj = {
        ...params,
        rebateRate: rebateRateVal,
        taskDetailId: id,
        opId,
      };
      if (paramsObj.rebateType === 1) {
        paramsObj.rebateCorporate = companyOfflineSupplementForComputed;
        paramsObj.rebatePrivate = 0;
      } else if (paramsObj.rebateType === 2) {
        paramsObj.rebatePrivate = companyOfflineSupplementForComputed;
        paramsObj.rebateCorporate = 0;
      } else if (paramsObj.rebateType === 3) {
        paramsObj.rebatePrivate = rebatePrivateOfComputed;
        paramsObj.rebateCorporate = publicePriceOfComputed;
        delete paramsObj.rebatePrivateOfComputed;
      }
      setSaveLoading(true);
      await $editPrice(paramsObj);
      setSaveLoading(false);
      message.success("操作成功");
      onClose();
      onGetList();
    } catch (e: any) {
      setSaveLoading(false);
      message.error(e?.message);
    }
  };

  useEffect(() => {
    const serviceCharge =
      businessTypeDesc === "代客下单"
        ? Number((platOrderChargeVal - platMoneyVal)?.toFixed(2))
        : 0;
    setServiceChargeVal(serviceCharge);
    setBusinessRevenueForComputedVal(
      officialPriceVal,
      rebateRateVal,
      otherIncomeVal,
      serviceCharge,
      platOrderMoneyVal
    );
  }, [platOrderChargeVal, platMoneyVal]);

  useEffect(() => {
    echoEditData();
  }, []);

  return (
    <>
      <Modal
        title="编辑账号信息"
        visible={show}
        okText="保存"
        okButtonProps={{
          loading: saveLoading,
        }}
        width="70%"
        maskClosable={false}
        onOk={handleSaveEditMsg}
        onCancel={onClose}
      >
        <Form form={form} onFinish={handleFinishEditPrice}>
          <div>
            <h3>账号信息</h3>
            <AccountCard
              info={{
                ...(curEditMsg.accountBaseInfoVo || {}),
                accountId,
                accountName,
              }}
              options={{ xingtuUrl: "xingtuUrl" }}
              middle={
                <>
                  {accountBelong && (
                    <div className={styles.accountInfo}>{accountBelong}</div>
                  )}
                  {[birthday, sex, areaName].filter(item => item).join("/") && (
                    <div className={styles.accountInfo}>
                      {[birthday, sex, areaName].filter(item => item).join("/")}
                    </div>
                  )}
                </>
              }
            />

            <div className={cs(styles.contentWrap, "m-t-24")}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="商单类型：">
                    <span>{businessTypeDesc || "--"}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="合作类型：">
                    <span>{getOrderType(orderType)}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="商务实际营收：">
                    <span>{businessRevenueForComputed || 0}</span>
                  </Form.Item>
                </Col>

                {businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收" ? (
                  <>
                    <Col span={12}>
                      <Form.Item label="线下应收：">
                        <span>{cusOfflineSupplementForComputed || 0}</span>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="线下应付：">
                        <span>{companyOfflineSupplementForComputed || 0}</span>
                      </Form.Item>
                    </Col>
                  </>
                ) : (
                  ""
                )}

                <Col span={12}>
                  <Form.Item
                    label="平台报价："
                    name="officialPrice"
                    rules={[{ required: true, message: "请输入平台报价" }]}
                  >
                    <InputNumber
                      style={{ width: "150px" }}
                      min={0}
                      value={officialPriceVal || 0}
                      step="0.01"
                      onChange={handleChangeOfficialPrice}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="返点比例："
                    name="rebateRate"
                    rules={[{ required: true, message: "请输入返点比例" }]}
                  >
                    <InputNumber
                      style={{ width: "150px" }}
                      min={0}
                      max={100}
                      value={rebateRateVal || 0}
                      step="0.01"
                      onChange={handleChangeRebateRate}
                    />{" "}
                    %
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="其他收入："
                    name="otherIncome"
                    rules={[{ required: true, message: "请输入其他收入" }]}
                  >
                    <InputNumber
                      style={{ width: "150px" }}
                      min={0}
                      value={otherIncomeVal || 0}
                      step="0.01"
                      onChange={handleChangeOtherIncome}
                    />
                  </Form.Item>
                </Col>

                {
                  businessTypeDesc === "客户自行下单" ||
                  businessTypeDesc === "代客下单" ||
                  businessTypeDesc === "平台营收"
                  ? (
                  <Col span={12}>
                    <Form.Item
                      label="【实际】官方平台下单价"
                      name="platOrderMoney"
                      rules={[
                        {
                          required: true,
                          message: "请输入【实际】官方平台下单价",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "150px" }}
                        min={0}
                        value={platOrderMoneyVal || 0}
                        step="0.01"
                        onChange={handleChangePlatOrderMoney}
                      />
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )}

                {businessTypeDesc === "代客下单" ? (
                  <>
                    <Col span={12}>
                      <Form.Item
                        label="【报给客户】官方平台手续费"
                        name="platOrderCharge"
                        rules={[
                          {
                            required: true,
                            message: "请输入【报给客户】官方平台手续费",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "150px" }}
                          min={0}
                          value={platOrderChargeVal || 0}
                          step="0.01"
                          onChange={handleChangePlatOrderCharge}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="【实际】官方平台手续费"
                        name="platMoney"
                        rules={[
                          {
                            required: true,
                            message: "请输入【实际】官方平台手续费",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "150px" }}
                          min={0}
                          value={platMoneyVal || 0}
                          step="0.01"
                          onChange={handleChangePlatMoney}
                        />
                      </Form.Item>
                    </Col>
                  </>
                ) : (
                  ""
                )}
              </Row>
            </div>
          </div>

          {/* 线下应付有值时才显示商机信息 */}
          {companyOfflineSupplementForComputed &&
          (businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收") ? (
            <div className="m-t-24">
              <h3>商机信息</h3>
              <div className={styles.contentWrap}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="线下应付的支付方式："
                      name="rebateType"
                      rules={[
                        { required: true, message: "请选择线下应付的支付方式" },
                      ]}
                    >
                      <Select
                        style={{ width: "60%" }}
                        allowClear
                        placeholder="请选择"
                        options={paymentTypesArr}
                        // value={paymentType || undefined}
                        onChange={handleChangePaymentType}
                      />
                    </Form.Item>
                  </Col>

                  {paymentType ? (
                    <>
                      {paymentType === 1 ? (
                        <Col span={12}>
                          <Form.Item label="对公返款合计：" name="rebatePublic">
                            <span>{companyOfflineSupplementForComputed}</span>
                          </Form.Item>
                        </Col>
                      ) : (
                        ""
                      )}
                      {paymentType === 2 ? (
                        <Col span={12}>
                          <Form.Item
                            label="对私返款合计："
                            name="rebatePrivate"
                          >
                            <span>{companyOfflineSupplementForComputed}</span>
                          </Form.Item>
                        </Col>
                      ) : (
                        ""
                      )}
                      {paymentType === 3 ? (
                        <>
                          <Col span={12}>
                            <Form.Item
                              label="对私返款合计："
                              name="rebatePrivateOfComputed"
                              rules={[
                                {
                                  required: true,
                                  message: "请输入对私返款合计",
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "150px" }}
                                placeholder="请输入"
                                min={0}
                                max={companyOfflineSupplementForComputed}
                                step="0.01"
                                value={rebatePrivateOfComputed || 0}
                                onChange={handleChangeRebatePrivateForComputed}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <span>
                              对公返款合计：
                              {publicePriceOfComputed}
                            </span>
                          </Col>
                        </>
                      ) : (
                        ""
                      )}
                    </>
                  ) : (
                    ""
                  )}
                </Row>
              </div>
            </div>
          ) : (
            ""
          )}
        </Form>
      </Modal>
    </>
  );
};

export default EditPriceModal;

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

  // ???????????????
  const serviceCharge =
    businessTypeDesc === "????????????"
      ? Number((platOrderChargeVal - platMoneyVal).toFixed(2))
      : 0;
  const [serviceChargeVal, setServiceChargeVal] =
    useState<number>(serviceCharge);

  // ????????????????????????
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
      label: "??????",
    },
    {
      value: 2,
      label: "??????",
    },
    {
      value: 3,
      label: "???????????????",
    },
  ];

  const getOrderType = (orderType: number) => {
    let str = "--";
    switch (orderType) {
      case 1:
        str = "????????????";
        break;
      case 2:
        str = "????????????";
        break;
      default:
        break;
    }

    return str;
  };

  //   ??????????????????
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

  //  ??????????????????????????????
  const setCusOfflineSupplementForComputedVal = (
    businessRevenue: number,
    platOrderMoney: number
  ) => {
    // ???????????????????????? - ??????????????????????????? > 0??????????????? = ?????????????????? - ???????????????????????????
    // ???????????????????????? - ??????????????????????????? < 0??????????????? = 0
    const cusOfflineSupplementForComputed =
      businessRevenue - platOrderMoney > 0
        ? Number((businessRevenue - platOrderMoney)?.toFixed(2))
        : 0;
    setCusOfflineSupplementForComputed(cusOfflineSupplementForComputed);
  };

  //  ??????????????????????????????
  const setCompanyOfflineSupplementForComputedVal = (
    businessRevenue: number,
    platOrderMoney: number
  ) => {
    // ???????????????????????? - ??????????????????????????? < 0??????????????? = ??????????????????????????? - ??????????????????
    // ???????????????????????? - ??????????????????????????? > 0??????????????? = 0
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

  // ????????????????????????????????????
  const setBusinessRevenueForComputedVal = (
    officialPrice: number,
    rebateRate: number,
    otherIncome: number,
    serviceCharge: number,
    platOrderMoney: number
  ) => {
    // ?????????????????? = ???????????? - ???????????????*???????????????+????????????+???????????????
    const newBusinessRevenue = Number(
      (
        officialPrice -
        officialPrice * (rebateRate / 100) +
        otherIncome +
        serviceCharge
      )?.toFixed(2)
    );
    setBusinessRevenueForComputed(newBusinessRevenue);
    // ???????????????????????????????????????????????????
    setCusOfflineSupplementForComputedVal(newBusinessRevenue, platOrderMoney);
    setCompanyOfflineSupplementForComputedVal(
      newBusinessRevenue,
      platOrderMoney
    );
  };

  // ???????????????????????????
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

  // ???????????????????????????
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

  // ???????????????????????????
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

  // ??????????????????????????????????????????
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

  // ????????????????????????????????????????????????
  const handleUpdatePlatMoney = (platMoney: number) => {
    if (platId === 25 || platId === 26) {
      const newPlatMoney = platMoney * 0.05;
      setPlatMoneyVal(newPlatMoney);
      form.setFieldValue("platMoney", newPlatMoney);
    }
  };

  // ????????????????????????????????????????????????
  const handleChangePlatOrderCharge = (val: number) => {
    const newPlatOrderCharge = Number(val?.toFixed(2));
    setPlatOrderChargeVal(newPlatOrderCharge);
  };

  // ??????????????????????????????????????????
  const handleChangePlatMoney = (val: number) => {
    const newPlatMoney = Number(val?.toFixed(2));
    setPlatMoneyVal(newPlatMoney);
  };

  // ??????????????????
  const handleChangePaymentType = (val: number) => {
    setPaymentType(val);

    // form.setFieldValue("rebatePrivateOfComputed", 0);
    // setRebatePrivateOfComputed(0);
  };

  // ????????????????????????????????????????????????????????????
  const handleChangeRebatePrivateForComputed = (val: number) => {
    setRebatePrivateOfComputed(val);
    const publicePriceOfComputed =
      companyOfflineSupplementForComputed - val < 0
        ? 0
        : Number((companyOfflineSupplementForComputed - val)?.toFixed(2));
    setPublicePriceOfComputed(publicePriceOfComputed);
    // setFirstChangeFlag(false);
  };

  // ???????????????????????????
  const handleSaveEditMsg = async () => {
    form.submit();
  };

  // ???????????????????????????
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
        (businessTypeDesc === "??????????????????" || businessTypeDesc === "????????????")) ||
      (baseCheck() &&
        platOrderMoney === platOrderMoneyVal &&
        platOrderCharge === platOrderChargeVal &&
        platMoney === platMoneyVal &&
        businessTypeDesc === "????????????") ||
      (baseCheck() && businessTypeDesc === "?????????????????????")
    ) {
      return false;
    }

    return true;
  };

  const handleFinishEditPrice = async (params: any) => {
    try {
      if (!checkIsModify()) {
        message.error("?????????????????????????????????????????????");
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
      message.success("????????????");
      onClose();
      onGetList();
    } catch (e: any) {
      setSaveLoading(false);
      message.error(e?.message);
    }
  };

  useEffect(() => {
    const serviceCharge =
      businessTypeDesc === "????????????"
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
        title="??????????????????"
        visible={show}
        okText="??????"
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
            <h3>????????????</h3>
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
                  <Form.Item label="???????????????">
                    <span>{businessTypeDesc || "--"}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="???????????????">
                    <span>{getOrderType(orderType)}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="?????????????????????">
                    <span>{businessRevenueForComputed || 0}</span>
                  </Form.Item>
                </Col>

                {businessTypeDesc === "??????????????????" || businessTypeDesc === "????????????" ? (
                  <>
                    <Col span={12}>
                      <Form.Item label="???????????????">
                        <span>{cusOfflineSupplementForComputed || 0}</span>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="???????????????">
                        <span>{companyOfflineSupplementForComputed || 0}</span>
                      </Form.Item>
                    </Col>
                  </>
                ) : (
                  ""
                )}

                <Col span={12}>
                  <Form.Item
                    label="???????????????"
                    name="officialPrice"
                    rules={[{ required: true, message: "?????????????????????" }]}
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
                    label="???????????????"
                    name="rebateRate"
                    rules={[{ required: true, message: "?????????????????????" }]}
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
                    label="???????????????"
                    name="otherIncome"
                    rules={[{ required: true, message: "?????????????????????" }]}
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
                  businessTypeDesc === "??????????????????" ||
                  businessTypeDesc === "????????????" ||
                  businessTypeDesc === "????????????"
                  ? (
                  <Col span={12}>
                    <Form.Item
                      label="?????????????????????????????????"
                      name="platOrderMoney"
                      rules={[
                        {
                          required: true,
                          message: "??????????????????????????????????????????",
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

                {businessTypeDesc === "????????????" ? (
                  <>
                    <Col span={12}>
                      <Form.Item
                        label="???????????????????????????????????????"
                        name="platOrderCharge"
                        rules={[
                          {
                            required: true,
                            message: "????????????????????????????????????????????????",
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
                        label="?????????????????????????????????"
                        name="platMoney"
                        rules={[
                          {
                            required: true,
                            message: "??????????????????????????????????????????",
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

          {/* ?????????????????????????????????????????? */}
          {companyOfflineSupplementForComputed &&
          (businessTypeDesc === "??????????????????" || businessTypeDesc === "????????????") ? (
            <div className="m-t-24">
              <h3>????????????</h3>
              <div className={styles.contentWrap}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="??????????????????????????????"
                      name="rebateType"
                      rules={[
                        { required: true, message: "????????????????????????????????????" },
                      ]}
                    >
                      <Select
                        style={{ width: "60%" }}
                        allowClear
                        placeholder="?????????"
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
                          <Form.Item label="?????????????????????" name="rebatePublic">
                            <span>{companyOfflineSupplementForComputed}</span>
                          </Form.Item>
                        </Col>
                      ) : (
                        ""
                      )}
                      {paymentType === 2 ? (
                        <Col span={12}>
                          <Form.Item
                            label="?????????????????????"
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
                              label="?????????????????????"
                              name="rebatePrivateOfComputed"
                              rules={[
                                {
                                  required: true,
                                  message: "???????????????????????????",
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "150px" }}
                                placeholder="?????????"
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
                              ?????????????????????
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

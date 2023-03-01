/* eslint-disable no-constant-condition */
import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Input,InputNumber, Select, message } from "antd";
import cs from "classnames";
import { $editPrice } from "src/api/business";
import AccountCard from "src/components/AccountCard";
import styles from "./EditPriceModal.scss";

const { TextArea } = Input;

interface EditPriceModalPropType {
  show: boolean;
  curEditMsg: any;
  commercialMsg: any;
  onGetList: () => void;
  onClose: () => void;
  onLoadDetail: () => void;
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
  onLoadDetail,
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
    otherIncome = 0,
    rebateRate,
    rebateAmount,
    platOrderMoney,
    platOrderCharge,
    platMoney,
    // rebateCorporate,
    rebatePrivate,
    grossRate,
    grossMoney,
    minGrossRate,
    minGrossMoney,
    needJudgeGross,
    accountType,
    maxBearRatio,
    outMoneyRatio,
    rebate,
    reason,
    accountBaseInfoVo: {
      accountBelong = "",
      birthday = "",
      sex = "",
      areaName = "",
    } = {},
    accountOfficialPriceVo: { platId = 25 } = {},
  } = curEditMsg;

  const {
    businessTypeDesc,
    id: opId,
    companyOfflineSupplement: totalCompanyOfflineSupplement,
    rebateCorporate: totalRebateCorporate,
    rebatePrivate: totalRebatePrivate,
    rebateType = undefined,
  } = commercialMsg;

  const [paymentType, setPaymentType] = useState<number | undefined>(
    rebateType || undefined
  );
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  // 商务实际营收
  const [actualRevenue, setActualRevenue] = useState<number>(
    +Number(businessRevenue).toFixed(2)
  );
  // 线下应付
  const [companyOffline, setCompanyOffline] = useState<number>(
    +Number(companyOfflineSupplement).toFixed(2)
  );
  // 最小值 线下应收 需要根据商务营收和实际平台下单价动态计算
  const [minCusOffline, setMinCusOffline] = useState<number>(0);
  // 预估毛利率
  const [forGrossProfit, setForGrossProfit] = useState<number>(grossRate);
  // 预估毛利
  const [forGrossMoney, setForGrossMoney] = useState<number>(grossMoney);

  // 对公返款合计
  const [publicePrice, setPublicePrice] = useState<number>(
    companyOfflineSupplement - rebatePrivate
  );
  // const [state, setstate] = useState(initialState)

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

  // 计算商务实际营收 根据平台报价、返点金额、其他收入、手续费收入计算
  const computedActualRevenue = (
    officialPrice: number,
    rebateRateAmount: number,
    otherIncome: number,
    serviceCharge: number
  ) => {
    // 只是代客下单才+手续费
    // 平台报价 - 返点金额+其他收入+手续费收入
    let actualRevenue =
      officialPrice -
      +Number(rebateRateAmount).toFixed(2) +
      otherIncome +
      serviceCharge;

    if (businessTypeDesc !== "代客下单") {
      actualRevenue =
        officialPrice - +Number(rebateRateAmount).toFixed(2) + otherIncome + 0;
    }

    setActualRevenue(+Number(actualRevenue).toFixed(2));

    let companyOffline = 0;

    // 客户自行下单或平台营收时 线下应收 = 商务实际营收 - 官方平台实际下单价 线下应付 = 【实际】官方平台下单价 - 商务实际营收
    // 所有类型应付 都要+上应收的变化值
    if (businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收") {
      // 根据实际营收变化 计算线下应收
      let cusOfflineSupplement =
        actualRevenue - form.getFieldValue("platOrderMoney");
      cusOfflineSupplement =
        cusOfflineSupplement > 0 ? cusOfflineSupplement : 0;
      form.setFieldValue(
        "cusOfflineSupplement",
        +Number(cusOfflineSupplement).toFixed(2)
      );
      setMinCusOffline(+Number(cusOfflineSupplement).toFixed(2));

      // 根据实际营收变化 计算线下应付
      companyOffline = form.getFieldValue("platOrderMoney") - actualRevenue;
      companyOffline = companyOffline > 0 ? companyOffline : 0;
      setCompanyOffline(+Number(companyOffline).toFixed(2));
    } else {
      // 代客下单、不走平台私单时 线下应收=平台报价-返点金额+【报给客户】官方平台手续费+其他收入 应付=0
      // 计算应收
      let cusOfflineSupplement =
        officialPrice -
        +Number(rebateRateAmount).toFixed(2) +
        // 不走平台私单没有手续费
        (businessTypeDesc === "不走平台的私单"
          ? 0
          : form.getFieldValue("platOrderCharge") || 0) +
        otherIncome;

      cusOfflineSupplement =
        cusOfflineSupplement > 0 ? cusOfflineSupplement : 0;
      form.setFieldValue(
        "cusOfflineSupplement",
        +Number(cusOfflineSupplement).toFixed(2)
      );
      setMinCusOffline(+Number(cusOfflineSupplement).toFixed(2));

      // 应付=0
      setCompanyOffline(+Number(companyOffline).toFixed(2));
    }

    setPublicePrice(
      +Number(
        totalCompanyOfflineSupplement -
          companyOfflineSupplement +
          companyOffline -
          form.getFieldValue("rebatePrivate")
      ).toFixed(2)
    );

    return actualRevenue;
  };

  // 计算【实际】官方平台手续费 根据【实际】官方平台下单价计算
  const computedPlatMoney = (platOrderMoney: number) => {
    // 【实际】官方平台下单价*手续费比例(5%) 若非抖快平台，则为空
    if ((+platId === 25 || +platId === 26) && businessTypeDesc === "代客下单") {
      form.setFieldValue(
        "platMoney",
        +Number(platOrderMoney * 0.05).toFixed(2)
      );
      return +Number(platOrderMoney * 0.05).toFixed(2);
    }

    form.setFieldValue("platMoney", 0);
    return 0;
  };

  // 计算预估毛利率和预估毛利 根据平台报价、返点金额、其他收入计算
  const computedForGrossProfit = (
    officialPrice: number,
    rebateRateAmount: number,
    otherIncome: number
  ) => {
    let forGrossProfit = 0;
    let forGrossMoney = 0;

    // 工单实际营收
    const workActualRevence = +Number(
      officialPrice - rebateRateAmount + otherIncome
    ).toFixed(2);
    // 销售收入
    const saleMoney = +Number(officialPrice + otherIncome).toFixed(2);

    // accoutType  1乾派自营账号，2签约，3媒介，4海盗自营账号，5海盗投放账号 145无需验证毛利问题, 改价窗中不存在5的情况
    if (+accountType === 2) {
      // 签约账号预估毛利率=绩效营收/销售收入
      // 绩效营收=工单实际营收-达人分成成本   销售收入=平台报价+其他收入
      // 工单实际营收=平台报价-返点金额+其他收入   达人分成成本=[平台报价 - 达人分担返点金额]*达人分成比例
      // 达人分担返点金额=平台报价*达人分担返点比例

      // 达人分担返点金额
      const darenRefundMoney = +Number(
        officialPrice * (maxBearRatio / 100)
      ).toFixed(2);
      // 达人分成成本
      const darenDividedMoney = +Number(
        (officialPrice - darenRefundMoney) * (outMoneyRatio / 100)
      ).toFixed(2);
      // 绩效营收
      const revenuePerformance = +Number(
        workActualRevence - darenDividedMoney
      ).toFixed(2);

      console.info("------", revenuePerformance, saleMoney);
      forGrossProfit = +Number((revenuePerformance / saleMoney) * 100).toFixed(
        2
      );
      forGrossMoney = revenuePerformance;
    } else if (+accountType === 3) {
      // 媒介账号预估毛利率=绩效营收/销售收入
      // 绩效营收=工单实际营收-采购达人成本   销售收入=平台报价+其他收入
      // 工单实际营收=平台报价-返点金额+其他收入   采购达人成本=平台报价-（平台报价*媒介达人返点比例）

      // 采购达人成本
      const darenBuyMoney = +Number(
        officialPrice - (officialPrice * rebate) / 100
      ).toFixed(2);
      // 绩效营收
      const revenuePerformance = +Number(
        workActualRevence - darenBuyMoney
      ).toFixed(2);

      forGrossProfit = +Number((revenuePerformance / saleMoney) * 100).toFixed(
        2
      );
      forGrossMoney = revenuePerformance;
    } else {
      // 工作室账号预估毛利率=绩效营收/销售收入
      // 绩效营收=工单实际营收   销售收入=平台报价+其他收入
      // 工单实际营收=平台报价-返点金额+其他收入

      // 绩效营收
      const revenuePerformance = workActualRevence;

      forGrossProfit = +Number((revenuePerformance / saleMoney) * 100).toFixed(
        2
      );
      forGrossMoney = revenuePerformance;
    }

    setForGrossProfit(forGrossProfit);
    setForGrossMoney(forGrossMoney);
  };

  // 修改平台报价
  const handleChangeOfficialPrice = (val: number) => {
    // 计算返点金额
    const rebateRate = form.getFieldValue("rebateRate");
    const rebateAmount = +Number((val * rebateRate) / 100).toFixed(2);
    form.setFieldValue("rebateAmount", rebateAmount);

    // 计算实际平台下单价 	平台报价 - 返点金额
    const calcPlatOrderMoney = +Number(val - rebateAmount).toFixed(2);
    form.setFieldValue("platOrderMoney", calcPlatOrderMoney);

    // 计算【报给客户】官方平台手续费  平台报价（全部）*手续费比例(5%)，若非抖快平台，则为空
    let platOrderCharge = 0;
    if ((+platId === 25 || +platId === 26) && businessTypeDesc === "代客下单") {
      platOrderCharge = +Number(val * 0.05).toFixed(2);
      form.setFieldValue("platOrderCharge", platOrderCharge);
    }

    const platMoney = computedPlatMoney(calcPlatOrderMoney);
    // 计算实际营收
    computedActualRevenue(
      val,
      rebateAmount,
      form.getFieldValue("otherIncome"),
      platOrderCharge - platMoney
    );

    // 计算预估毛利率
    computedForGrossProfit(
      val,
      rebateAmount,
      form.getFieldValue("otherIncome")
    );
  };

  // 修改返点比例
  const handleChangeRebateRate = (val: number) => {
    // 计算返点金额
    const officialPrice = form.getFieldValue("officialPrice");
    const rebateAmount = +Number((officialPrice * val) / 100).toFixed(2);
    form.setFieldValue("rebateAmount", rebateAmount);

    // 计算实际平台下单价 	平台报价 - 返点金额
    const calcPlatOrderMoney = +Number(officialPrice - rebateAmount).toFixed(2);
    form.setFieldValue("platOrderMoney", calcPlatOrderMoney);

    const platMoney = computedPlatMoney(calcPlatOrderMoney);

    // 计算实际营收
    computedActualRevenue(
      officialPrice,
      rebateAmount,
      form.getFieldValue("otherIncome"),
      form.getFieldValue("platOrderCharge") - platMoney
    );

    // 计算预估毛利率
    computedForGrossProfit(
      officialPrice,
      rebateAmount,
      form.getFieldValue("otherIncome")
    );
  };

  // 修改返点金额
  const handleChangeRebateAmount = (val: number) => {
    // 计算返点比例
    const officialPrice = form.getFieldValue("officialPrice");
    // 返点金额不能大于平台报价
    if (val > officialPrice) {
      form.setFieldValue("rebateRate", 100);
      form.setFieldValue("rebateAmount", officialPrice);

      // 计算实际平台下单价 	平台报价 - 【平台报价*返点比例】
      form.setFieldValue("platOrderMoney", 0);

      computedPlatMoney(0);

      // 计算实际营收
      computedActualRevenue(
        officialPrice,
        officialPrice,
        form.getFieldValue("otherIncome"),
        form.getFieldValue("platOrderCharge") - 0
      );

      // 计算预估毛利率
      computedForGrossProfit(
        officialPrice,
        officialPrice,
        form.getFieldValue("otherIncome")
      );
    } else {
      const rebateRate = +Number((val / officialPrice) * 100).toFixed(2);
      form.setFieldValue("rebateRate", rebateRate);

      // 计算实际平台下单价 	平台报价 - 【平台报价*返点比例】
      const calcPlatOrderMoney = +Number(
        officialPrice - (officialPrice * rebateRate) / 100
      ).toFixed(2);
      form.setFieldValue("platOrderMoney", calcPlatOrderMoney);

      const platMoney = computedPlatMoney(calcPlatOrderMoney);

      // 计算实际营收
      computedActualRevenue(
        officialPrice,
        val,
        form.getFieldValue("otherIncome"),
        form.getFieldValue("platOrderCharge") - platMoney
      );

      // 计算预估毛利率
      computedForGrossProfit(
        officialPrice,
        val,
        form.getFieldValue("otherIncome")
      );
    }
  };

  // 修改其他收入
  const handleChangeOtherIncome = (val: number) => {
    computedActualRevenue(
      form.getFieldValue("officialPrice"),
      form.getFieldValue("rebateAmount"),
      val,
      form.getFieldValue("platOrderCharge") - form.getFieldValue("platMoney")
    );

    // 计算预估毛利率
    computedForGrossProfit(
      form.getFieldValue("officialPrice"),
      form.getFieldValue("rebateAmount"),
      val
    );
  };

  // 修改【实际】官方平台下单价
  const handleChangePlatOrderMoney = (val: number) => {
    const platMoney = computedPlatMoney(val);

    if (businessTypeDesc === "代客下单") {
      // 计算实际营收
      computedActualRevenue(
        form.getFieldValue("officialPrice"),
        form.getFieldValue("rebateAmount"),
        form.getFieldValue("otherIncome"),
        (form.getFieldValue("platOrderCharge") || 0) - (platMoney || 0)
      );
    } else {
      // 计算实际营收
      computedActualRevenue(
        form.getFieldValue("officialPrice"),
        form.getFieldValue("rebateAmount"),
        form.getFieldValue("otherIncome"),
        0
      );
    }
  };

  // 修改【报给客户】官方平台手续费
  const handleChangePlatOrderCharge = (val: number) => {
    // 计算实际营收
    computedActualRevenue(
      form.getFieldValue("officialPrice"),
      form.getFieldValue("rebateAmount"),
      form.getFieldValue("otherIncome"),
      val - form.getFieldValue("platMoney")
    );
  };

  // 修改【实际】官方平台手续费
  const handleChangePlatMoney = (val: number) => {
    // 计算实际营收
    computedActualRevenue(
      form.getFieldValue("officialPrice"),
      form.getFieldValue("rebateAmount"),
      form.getFieldValue("otherIncome"),
      form.getFieldValue("platOrderCharge") - val
    );
  };

  // 修改线下应收
  const handleChangeCus = (val: number) => {
    const platOrderMoney = form.getFieldValue("platOrderMoney");

    let newCompanyOffline = 0
    if (businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收") {
      // 改变应收时，应付值需要+上差值
      newCompanyOffline =
      platOrderMoney - actualRevenue > 0
        ? Number((platOrderMoney - actualRevenue)?.toFixed(2))
        : 0;
    }
    // 其余情况，代客下单，不走平台私单 应付=0

    setCompanyOffline(
      +Number(
        newCompanyOffline + val - minCusOffline > 0
          ? newCompanyOffline + val - minCusOffline
          : 0
      ).toFixed(2)
    );

    setPublicePrice(
      +Number(
        totalCompanyOfflineSupplement -
          companyOfflineSupplement +
          +Number(
            newCompanyOffline + val - minCusOffline > 0
              ? newCompanyOffline + val - minCusOffline
              : 0
          ).toFixed(2) -
          form.getFieldValue("rebatePrivate")
      ).toFixed(2)
    );
  };

  // 修改返款类型
  const handleChangePaymentType = (val: number) => {
    setPaymentType(val);
    form.setFieldValue("rebatePrivate", totalRebatePrivate || 0.01);

    setPublicePrice(
      +Number(
        totalCompanyOfflineSupplement -
          companyOfflineSupplement +
          companyOffline -
          (totalRebatePrivate || 0.01)
      ).toFixed(2)
    );
  };

  const handleChangeRebatePrivate = (val: number) => {
    setPublicePrice(
      +Number(
        totalCompanyOfflineSupplement -
          companyOfflineSupplement +
          companyOffline -
          val
      ).toFixed(2)
    );
  };

  // 保存修改报价的信息
  const handleSaveEditMsg = async () => {
    await form.validateFields();
    form.submit();
  };

  const handleFinishEditPrice = async (params: any) => {
    const checkGrossProfit =
      !!(forGrossProfit < minGrossRate || forGrossMoney < minGrossMoney) &&
      +needJudgeGross === 1;

    const submit = async () => {
      try {
        // if (!checkIsModify()) {
        //   message.error("没有修改过对应编辑项，无法提交");
        //   return;
        // }

        const paramsObj = {
          ...params,
          taskDetailId: id,
          opId,
          companyOfflineSupplement: companyOffline,
        };
        if (paramsObj.rebateType === 1) {
          paramsObj.rebateCorporate =
            +totalCompanyOfflineSupplement -
            +companyOfflineSupplement +
            +companyOffline;
          paramsObj.rebatePrivate = 0;
        } else if (paramsObj.rebateType === 2) {
          paramsObj.rebatePrivate =
            +totalCompanyOfflineSupplement -
            +companyOfflineSupplement +
            +companyOffline;
          paramsObj.rebateCorporate = 0;
        } else if (paramsObj.rebateType === 3) {
          paramsObj.rebatePrivate = form.getFieldValue("rebatePrivate");
          paramsObj.rebateCorporate = publicePrice;
        }
        setSaveLoading(true);
        await $editPrice(paramsObj);
        setSaveLoading(false);
        message.success("操作成功");
        onLoadDetail();
        onClose();
        onGetList();
      } catch (e: any) {
        setSaveLoading(false);
        message.error(e?.message);
      }
    };

    if (checkGrossProfit) {
      const modal = Modal.confirm({
        title: "提示",
        content:
          "账号的毛利已低于公司规定的最低的毛利，有财务风险，建议返回检查账号金额是否有误",
        okText: "返回检查",
        cancelText: "继续保存",
        onOk: () => {
          modal.destroy();
        },
        onCancel: () => {
          submit();
        },
      });
      return;
    }

    submit();
  };

  useEffect(() => {
    // 客户自行下单或平台营收时 线下应收 = 商务实际营收 - 官方平台实际下单价 线下应付 = 【实际】官方平台下单价 - 商务实际营收
    // 所有类型应付 都要+上应收的变化值
    if (businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收") {
      // 初始化线下应收  即线上应收按照计算应该是多少钱
      const initCusOfflineSupplement =
        businessRevenue - platOrderMoney > 0
          ? +Number(businessRevenue - platOrderMoney).toFixed(2)
          : 0;
      setMinCusOffline(initCusOfflineSupplement);
    } else {
      // 代客下单、不走平台私单时 线下应收=平台报价-返点金额+【报给客户】官方平台手续费+其他收入 应付=0
      let initCusOfflineSupplement =
        (officialPrice || 0) -
        +Number(rebateAmount || 0).toFixed(2) +
        // 不走平台私单没有手续费
        (businessTypeDesc === "不走平台的私单" ? 0 : platOrderCharge || 0) +
        (otherIncome || 0);
      initCusOfflineSupplement =
        initCusOfflineSupplement > 0 ? initCusOfflineSupplement : 0;
      setMinCusOffline(initCusOfflineSupplement);
    }

    form.setFieldValue("officialPrice", officialPrice);
    form.setFieldValue("rebateRate", rebateRate);
    form.setFieldValue("rebateAmount", rebateAmount);
    form.setFieldValue("otherIncome", otherIncome || 0);
    form.setFieldValue("platOrderMoney", platOrderMoney);
    form.setFieldValue("platOrderCharge", platOrderCharge);
    form.setFieldValue("platMoney", platMoney);
    form.setFieldValue("cusOfflineSupplement", cusOfflineSupplement);

    form.setFieldValue("rebateType", rebateType || undefined);
    form.setFieldValue("rebatePrivate", totalRebatePrivate || 0.01);
    form.setFieldValue("reason", reason || undefined);
    setPublicePrice(totalRebateCorporate);
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
                  <Form.Item
                    label="商务实际营收："
                    tooltip={
                      <>
                        *商务实际营收 = 平台报价 - 返点金额 + 其他收入 +
                        手续费收入
                        <br />
                        *手续费收入 =
                        【报给客户】官方平台手续费-【实际】官方平台手续费
                      </>
                    }
                  >
                    <span>{actualRevenue || 0}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="平台报价："
                    name="officialPrice"
                    rules={[{ required: true, message: "请输入平台报价" }]}
                  >
                    <InputNumber
                      style={{ width: "150px" }}
                      min={0}
                      precision={2}
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
                      addonAfter="%"
                      step="0.01"
                      onChange={handleChangeRebateRate}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="返点金额："
                    name="rebateAmount"
                    rules={[{ required: true, message: "请输入返点金额" }]}
                  >
                    <InputNumber
                      style={{ width: "150px" }}
                      min={0}
                      precision={2}
                      step="1"
                      onChange={handleChangeRebateAmount}
                    />
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
                      precision={2}
                      step="0.01"
                      onChange={handleChangeOtherIncome}
                    />
                  </Form.Item>
                </Col>

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
                      precision={2}
                      step="0.01"
                      onChange={handleChangePlatOrderMoney}
                    />
                  </Form.Item>
                </Col>

                {!!(businessTypeDesc === "代客下单") && (
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
                          precision={2}
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
                          precision={2}
                          step="0.01"
                          onChange={handleChangePlatMoney}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}

                <Col span={12}>
                  <Form.Item
                    label="线下应收："
                    name="cusOfflineSupplement"
                    // 不走平台私单和代客下单 与 客户自行下单和平台营收文案及计算方式做区分
                    tooltip={
                      businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收"
                        ? "线下应收 = 商务实际营收 - 官方平台实际下单价"
                        : "线下应收=平台报价-返点金额+【报给客户】官方平台手续费+其他收入"
                    }
                    rules={[{ required: true, message: "请输入线下应收" }]}
                  >
                    <InputNumber
                      style={{ width: "120px" }}
                      min={minCusOffline || 0}
                      max={10000000}
                      precision={2}
                      // value={cusOfflineSupplementForComputed}
                      onChange={handleChangeCus}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="线下应付："
                    // 仅客户自行下单或平台营收时显示问号
                    tooltip={
                      businessTypeDesc === "客户自行下单" || businessTypeDesc === "平台营收"
                        ? "线下应付 = 【实际】官方平台下单价 - 商务实际营收 + 线下应收"
                        : ""
                    }
                  >
                    <span>{companyOffline || 0}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="预估毛利率">
                    {+needJudgeGross === 1 ? (
                      // 先判断毛利率是否未到标准  accountType=3 媒介账号 媒介账号不需要判断毛利率 只判断毛利
                      forGrossProfit < minGrossRate && +accountType !== 3 ? (
                        <>
                          <div className={styles.error}>
                            {forGrossProfit}%（毛利率需 ≥ {minGrossRate}
                            %，建议适当提高报价或降低返点金额）
                          </div>
                        </>
                      ) : // 毛利率如果达到 在判断毛利值 是否达到
                      forGrossMoney < minGrossMoney ? (
                        <>
                          <div className={styles.error}>
                            {forGrossProfit}%（毛利需 ≥ ¥{minGrossMoney}
                            ，建议适当提高报价或降低返点金额）
                          </div>
                        </>
                      ) : (
                        `${
                          forGrossProfit === null
                            ? "--"
                            : `${forGrossProfit || 0}%`
                        }`
                      )
                    ) : (
                      `${
                        forGrossProfit === null
                          ? "--"
                          : `${forGrossProfit || 0}%`
                      }`
                    )}
                  </Form.Item>
                </Col>            
              </Row>

              <Row>
                <Col span={12}>
                  <Form.Item label="备注" name="reason">
                    <TextArea maxLength={100} showCount placeholder="请输入备注"  />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* 线下应付有值时才显示商机信息 */}
          {totalCompanyOfflineSupplement -
          companyOfflineSupplement +
          companyOffline ? (
            <div className="m-t-24">
              <h3>整体项目（商机）信息</h3>
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
                        onChange={handleChangePaymentType}
                      />
                    </Form.Item>
                  </Col>

                  {paymentType ? (
                    <>
                      {paymentType === 1 ? (
                        <Col span={12}>
                          <Form.Item
                            label="整体项目对公返款合计："
                            name="rebatePublic"
                          >
                            <span>
                              {totalCompanyOfflineSupplement -
                                companyOfflineSupplement +
                                companyOffline}
                            </span>
                          </Form.Item>
                        </Col>
                      ) : (
                        ""
                      )}
                      {paymentType === 2 ? (
                        <Col span={12}>
                          <Form.Item
                            label="整体项目对私返款合计："
                            name="rebatePrivate"
                          >
                            <span>
                              {totalCompanyOfflineSupplement -
                                companyOfflineSupplement +
                                companyOffline}
                            </span>
                          </Form.Item>
                        </Col>
                      ) : (
                        ""
                      )}
                      {paymentType === 3 ? (
                        <>
                          <Col span={12}>
                            <Form.Item
                              label="整体项目对私返款合计："
                              name="rebatePrivate"
                              rules={[
                                {
                                  required: true,
                                  message: "请输入整体项目对私返款合计",
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "150px" }}
                                placeholder="请输入"
                                min={0.01}
                                max={
                                  totalCompanyOfflineSupplement -
                                  companyOfflineSupplement +
                                  companyOffline
                                }
                                step="0.01"
                                onChange={handleChangeRebatePrivate}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <span>整体项目对公返款合计：</span>
                            {publicePrice}
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

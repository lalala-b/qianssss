/* eslint-disable no-irregular-whitespace */
import {
  Row,
  Col,
  Form,
  Button,
  Modal,
  Select,
  Input,
  DatePicker,
  Upload,
  message,
  // InputNumber,
} from "antd";
import { useState, useContext, useEffect } from "react";
import type { UploadProps } from "antd/es/upload";
import { QuestionCircleOutlined, UploadOutlined } from "@ant-design/icons";
import cs from "classnames";
import { $confirmPayment } from "src/api/workOrderDetail";
import IconTip from "src/components/IconTip";
import moment from "moment";
import { DetailContext } from "../../../DetailProvider";
import WorkTtemBox from "../../../WorkDetailComponets/WorkItemBox/WorkItemBox";
import styles from "../SpecialConfirmReceiptPay.scss";

interface RecePayFormDataType {
  paymentResult: number;
  tradeType: number;
  oaProcessNumber: string;
  outTradeNo: string;
  monthMoney: string;
  tradeScreenshots: string;
  darenOtherCost: number;
  coopRemarks: string;
}

const { TextArea } = Input

const SpecialConfirmReceiptPayWrapForMedium: React.FC = () => {
  const {
    detail: {
      confirmPaymentNodeAndFieldBO: {
        confirmPaymentNodeBO: {
          paymentType = 1,
          paymentResult = 1,
          collectionMoney = 0,
          tradeType = 1,
          oaProcessNumber = "",
          outTradeNo = "",
          monthMoney = "",
          tradeScreenshots = "",
          nodeStatus = 0,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          reconciliationStatus = 0,
          orderNo = "",
          nodeStep = 0,
          darenOtherCost = 0,
          cancelReasonTypeDesc = "",
          updateTime = "",
          coopRemarks = "",
        } = {},
      } = {},
    },
    loading,
    setLoading,
    onRefresh,
  } = useContext(DetailContext);

  const [paymentChannel, setPaymentChannel] = useState<number>(1);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isShowUploadTip, setIsShowUploadTip] = useState<boolean>(true);
  const [fileList, setFileList] = useState<any[]>([]);
  const [outTradeNoInputVal, setOutTradeNoInputVal] = useState<string>("");
  const [oaNumberInputVal, setOANumberInputVal] = useState<string>("");
  const [monthMoneyInputVal, setMonthMoneyInputVal] = useState<string>("");
  const [disableBtn, setDisableBtn] = useState<boolean>(true);
  const [isShowTrade, setIsShowTrade] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { confirm, info } = Modal;

  const getPaymentStatusData = (paymentType: number) => {
    let arr: {
      label: string;
      value: number;
    }[] = [];
    if (paymentType === 1) {
      arr = [
        {
          label: "已付款",
          value: 1,
        },
        {
          label: "未付款",
          value: 2,
        },
      ];
    } else if (paymentType === 2) {
      arr = [
        {
          label: "已收款",
          value: 1,
        },
        {
          label: "未收款",
          value: 2,
        },
      ];
    }
    return arr;
  };

  const paymentChannelData = [
    {
      label: "支付宝",
      value: 1,
    },
    {
      label: "微信",
      value: 2,
    },
    {
      label: "银行转帐",
      value: 3,
    },
    {
      label: "线上折扣",
      value: 4,
    },
  ];

  const uploadProps: UploadProps = {
    name: "file",
    action: "/api/admin/uploadImage",
    multiple: true,
    maxCount: 3,
    accept: ".png, .jpg",
    // listType: "picture-card",
    showUploadList: false,
    // onRemove(file) {
    //   const fileListArr = fileList.filter(item => {
    //     if (Object.keys(item.response || {}).length) {
    //       return item.response.data === file.response.data;
    //     }
    //     return item.url !== file.response.data;
    //   });
    //   setFileList(fileListArr);
    // },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.info(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name}上传成功`);
        setFileList([...fileList, info.file]);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name}上传失败`);
      }
      setIsShowUploadTip(false);
    },
  };

  const handleRemoveScreenshotOfPayment = (file: any) => {
    if (!isEdit) return;
    const fileListArr = fileList.filter(
      item => item.response.data !== file.response.data
    );
    setFileList(fileListArr);
  };

  const handleChangePaymentStatus = (val: number) => {
    if (paymentType === 2 && val === 1) {
      setIsShowTrade(true);
    } else if (paymentType === 2 && val === 2) {
      setIsShowTrade(false);
    }
    if (val === 2) {
      setDisableBtn(true);
    } else if (val === 1) {
      setDisableBtn(false);
    }
  };

  const handleChangePaymentChannel = (val: number) => {
    setPaymentChannel(val);
  };

  const handleChangeMonthMoney = (val: any) => {
    // eslint-disable-next-line no-underscore-dangle
    const monthMoneyVal = moment(new Date(val?._d)).format(
      "YYYY-MM-DD HH:mm:ss"
    );

    setMonthMoneyInputVal(monthMoneyVal.slice(0, 7));
  };

  const handleFinishForm = async (val: RecePayFormDataType) => {
    try {
      const { paymentResult, tradeType, darenOtherCost, coopRemarks } = val;
      if (paymentChannel === 3 && !fileList.length) {
        message.error("请上传款项截图");
        return;
      }
      let tradeScreenshotsUrlArr = [];
      tradeScreenshotsUrlArr = fileList.map(item => {
        let str = "";
        if (!Object.keys(item?.response || {}).length) {
          str = item.url;
        } else {
          str = item.response.data;
        }
        return str;
      });
      setLoading(true);
      await $confirmPayment({
        paymentType,
        paymentResult,
        collectionMoney,
        darenOtherCost: Math.abs(darenOtherCost) ? darenOtherCost : 0,
        tradeType,
        oaProcessNumber: oaNumberInputVal || oaProcessNumber,
        outTradeNo: outTradeNoInputVal || outTradeNo,
        monthMoney:
          paymentType === 1 ? monthMoney : monthMoneyInputVal || monthMoney,
        tradeScreenshots: JSON.stringify(tradeScreenshotsUrlArr),
        editFlag: nodeStatus === 1 && editAuth ? 0 : 1,
        orderNo,
        orderStatus: nodeStep,
        coopRemarks,
      });
      setIsEdit(false);
      message.success("操作成功");
      onRefresh();
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const handleSubmitRecePayMsg = () => {
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
    setPaymentChannel(tradeType);
    handleChangePaymentStatus(paymentResult);
  };

  const getPaymentResultWord = (paymentType: number, paymentResult: number) => {
    let str = "--";
    if (paymentType === 1 && paymentResult === 1) {
      str = "已付款";
    } else if (paymentType === 1 && paymentResult === 2) {
      str = "未付款";
    } else if (paymentType === 2 && paymentResult === 1) {
      str = "已收款";
    } else if (paymentType === 2 && paymentResult === 2) {
      str = "未收款";
    }
    return str;
  };

  const getTradeTypeWord = (tradeType: number) => {
    switch (tradeType) {
      case 1:
        return "支付宝";
      case 2:
        return "微信";
      case 3:
        return "银行转帐";
      case 4:
        return "线上折扣";
      default:
        return "--";
    }
  };

  const handleChangeOutTradeNo = (e: any) => {
    let text = e.target.value.trim();
    text = text.split(" ").join("");
    const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(text)) {
      message.error("交易流水号不能包含文字");
      return;
    }
    setOutTradeNoInputVal(text);
  };

  const handleChangeOANumber = (e: any) => {
    let text = e.target.value.trim();
    text = text.split(" ").join("");
    const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(text)) {
      message.error("OA流程编号不能包含文字");
      return;
    }
    setOANumberInputVal(text);
  };

  // 取消时，再点击编辑的回显
  const cancelForEcho = () => {
    form.setFieldValue("paymentResult", paymentResult || 2);
    if (paymentResult === 1) {
      setDisableBtn(false);
    }
    if (paymentType === 2 && paymentResult === 1) {
      setIsShowTrade(true);
    } else if (paymentType === 2 && paymentResult === 2) {
      setIsShowTrade(false);
    }
    setPaymentChannel(tradeType);
    form.setFieldValue("darenOtherCost", darenOtherCost);
    form.setFieldValue("tradeType", tradeType);
    form.setFieldValue("outTradeNo", outTradeNo);
    form.setFieldValue("oaProcessNumber", oaProcessNumber);
    form.setFieldValue("coopRemarks", coopRemarks);
    if (!monthMoney) return;
    form.setFieldValue("monthMoney", moment(monthMoney, "YYYY-MM"));
  };

  const handleEdit = () => {
    if (reconciliationStatus) {
      info({
        content: "已核账的工单不再支持修改信息",
        icon: "",
        okText: "确认",
        onOk() {
          console.info("ok");
        },
      });
      return;
    }
    cancelForEcho();
    setIsEdit(true);
  };

  useEffect(() => {
    form.setFieldValue("paymentResult", paymentResult || 2);
    if (paymentResult === 1) {
      setDisableBtn(false);
    }
    if (paymentType === 2 && paymentResult === 1) {
      setIsShowTrade(true);
    } else if (paymentType === 2 && paymentResult === 2) {
      setIsShowTrade(false);
    }

    return () => {
      //
    };
  }, [paymentResult, paymentType]);

  useEffect(() => {
    form.setFieldValue("tradeType", tradeType);
    setPaymentChannel(tradeType);

    return () => {
      //
    };
  }, [tradeType]);

  useEffect(() => {
    form.setFieldValue("outTradeNo", outTradeNo);

    return () => {
      //
    };
  }, [outTradeNo]);

  useEffect(() => {
    form.setFieldValue("oaProcessNumber", oaProcessNumber);

    return () => {
      //
    };
  }, [oaProcessNumber]);

  useEffect(() => {
    form.setFieldValue("coopRemarks", coopRemarks);

    return () => {
      //
    };
  }, [coopRemarks]);

  useEffect(() => {
    if (!monthMoney) return;
    try {
      form.setFieldValue("monthMoney", moment(monthMoney, "YYYY-MM"));
    } catch (e: any) {
      message.error(e.message);
    }
  }, [monthMoney]);

  useEffect(() => {
    if (!fileList.length) {
      setIsShowUploadTip(true);
    } else {
      setIsShowUploadTip(false);
    }

    return () => {
      //
    };
  }, [fileList.length]);

  useEffect(() => {
    if (!tradeScreenshots) return;
    try {
      const fileMsgArr = JSON.parse(tradeScreenshots).map(
        (item: string, index: number) => {
          const obj: any = {
            uid: null,
            response: {
              data: null,
            },
          };
          obj.uid = String(index);
          obj.response.data = item;
          obj.url = item;
          return obj;
        }
      );
      setFileList(fileMsgArr);
    } catch (e: any) {
      message.error(e.message);
    }
  }, [tradeScreenshots]);

  return (
    <>
      <WorkTtemBox
        title="确认收付款"
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
            ) : nodeStatus === 2 && editAuth && !isEdit ? (
              <Button type="primary" onClick={handleEdit}>
                编辑
              </Button>
            ) : isEdit ? (
              <div className={styles.btnWrap}>
                <Button
                  type="primary"
                  danger
                  onClick={handleSubmitRecePayMsg}
                  disabled={disableBtn}
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
              {/* <Col span={8}>
                {isEdit ? (
                  <>
                    <Form.Item
                      label="达人其他成本"
                      name="darenOtherCost"
                      tooltip="指除达人分成金额外，其他需要额外支付给达人的费用，例如达人的差旅费​"
                    >
                      <InputNumber precision={2} />
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
              </Col> */}

              <Col span={8}>
                <Form.Item
                  label={
                    paymentType === 1
                      ? "应付金额"
                      : paymentType === 2
                      ? "应收金额"
                      : "--"
                  }
                >
                  <span>{collectionMoney || "--"}</span>
                  <IconTip
                    icon={<QuestionCircleOutlined />}
                    content={
                      paymentType === 1
                        ? "应付金额=达人分成+达人其他成本"
                        : paymentType === 2
                        ? "应收金额=【实际】官方平台下单价-达人分成-达人其他成本"
                        : "--"
                    }
                    getPopupContainer={triggleNode => triggleNode}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    paymentType === 1
                      ? "付款状态："
                      : paymentType === 2
                      ? "收款状态："
                      : "--"
                  }
                  name="paymentResult"
                  rules={[
                    {
                      required: true,
                      message: `请选择${paymentType === 1 ? "付" : "收"}款状态`,
                    },
                  ]}
                >
                  {isEdit ? (
                    <Select
                      options={getPaymentStatusData(paymentType)}
                      value={paymentResult}
                      defaultValue={2}
                      className={styles.formItem}
                      onChange={handleChangePaymentStatus}
                    />
                  ) : (
                    getPaymentResultWord(paymentType, paymentResult) || "--"
                  )}
                </Form.Item>
              </Col>
              {paymentType === 1 ? (
                <Col span={8}>
                  <Form.Item
                    label="OA流程编号："
                    name="oaProcessNumber"
                    rules={[{ required: true, message: "请输入OA流程编号" }]}
                  >
                    {isEdit ? (
                      <Input
                        placeholder="请输入"
                        className={styles.formItem}
                        maxLength={25}
                        onBlur={handleChangeOANumber}
                      />
                    ) : (
                      oaProcessNumber || "--"
                    )}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {isShowTrade ? (
                <Col span={8}>
                  <Form.Item
                    label="支付渠道："
                    name="tradeType"
                    rules={[{ required: true, message: "请选择支付渠道" }]}
                  >
                    {isEdit ? (
                      <Select
                        options={paymentChannelData}
                        className={styles.formItem}
                        onChange={handleChangePaymentChannel}
                      />
                    ) : (
                      getTradeTypeWord(tradeType) || "--"
                    )}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
            </Row>
            <Row gutter={24}>
              {paymentType === 1 ? (
                  <Col span={8}>
                    <Form.Item label="绩效月：" name="monthMoney">
                      <span>{monthMoney || "--"}</span>
                    </Form.Item>
                  </Col>
              ) : isShowTrade ? (
                <>
                  {paymentChannel === 1 || paymentChannel === 2 ? (
                    <Col span={8}>
                      <Form.Item
                        label="交易流水号："
                        name="outTradeNo"
                        rules={[{ required: true, message: "请输入交易流水号" }]}
                      >
                        {isEdit ? (
                          <Input
                            placeholder="请输入交易流水号"
                            maxLength={45}
                            className={styles.formItem}
                            onBlur={handleChangeOutTradeNo}
                          />
                        ) : (
                          outTradeNo || "--"
                        )}
                      </Form.Item>
                    </Col>
                  ) : paymentChannel === 3 ? (
                    <Col span={8}>
                      <Form.Item label="款项截图：" name="tradeScreenshots">
                        {isEdit && fileList.length < 3 ? (
                          <div className={styles.uploadWrap}>
                            <Upload {...uploadProps}>
                              <Button icon={<UploadOutlined />} type="primary">
                                上传
                              </Button>
                            </Upload>
                            {isShowUploadTip ? (
                              <span
                                style={{
                                  color: "rgba(0,0,0,.5)",
                                  marginLeft: "4px",
                                }}
                              >
                                仅支持jpg/png格式
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        ) : (
                          ""
                        )}
                        {fileList.length ? (
                          <>
                            <Upload
                              listType="picture-card"
                              fileList={fileList}
                              onRemove={handleRemoveScreenshotOfPayment}
                              // onChange={handleChange}
                            />
                          </>
                        ) : (
                          ""
                        )}
                      </Form.Item>
                    </Col>
                  ) : (
                    ""
                  )}

                  <Col span={8}>
                    <Form.Item
                      label="绩效月："
                      name="monthMoney"
                      rules={[{ required: true, message: "请选择绩效月" }]}
                    >
                      {isEdit ? (
                        <DatePicker
                          picker="month"
                          onChange={handleChangeMonthMoney}
                        />
                      ) : (
                        monthMoney || "--"
                      )}
                    </Form.Item>
                  </Col>
                </>
              ) : (
                ""
              )}

              <Col span={8}>
                <Form.Item
                  label="合作情况备注："
                  name="coopRemarks"
                >
                  {isEdit ? (
                    <TextArea
                      placeholder="请输入合作情况备注"
                      maxLength={100}
                      showCount
                      autoSize
                      className={styles.formItem}
                    />
                  ) : (
                    <p className={styles.contentItemWrap}>{ coopRemarks || "--" }</p>
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

export default SpecialConfirmReceiptPayWrapForMedium;

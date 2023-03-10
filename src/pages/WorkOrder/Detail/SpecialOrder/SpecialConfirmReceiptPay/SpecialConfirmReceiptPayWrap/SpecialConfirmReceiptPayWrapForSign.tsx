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
import { UploadOutlined } from "@ant-design/icons";
import cs from "classnames";
import { $confirmPayment } from "src/api/workOrderDetail";
import moment from "moment";
import { DetailContext } from "../../../DetailProvider";
import WorkTtemBox from "../../../WorkDetailComponets/WorkItemBox";
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

const SpecialConfirmReceiptPayWrapForSign: React.FC = () => {
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
          label: "?????????",
          value: 1,
        },
        {
          label: "?????????",
          value: 2,
        },
      ];
    } else if (paymentType === 2) {
      arr = [
        {
          label: "?????????",
          value: 1,
        },
        {
          label: "?????????",
          value: 2,
        },
      ];
    }
    return arr;
  };

  const paymentChannelData = [
    {
      label: "?????????",
      value: 1,
    },
    {
      label: "??????",
      value: 2,
    },
    {
      label: "????????????",
      value: 3,
    },
    {
      label: "????????????",
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
        message.success(`${info.file.name}????????????`);
        setFileList([...fileList, info.file]);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name}????????????`);
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
        message.error("?????????????????????");
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
      message.success("????????????");
      onRefresh();
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const handleSubmitRecePayMsg = () => {
    confirm({
      content: "????????????????????????????????????",
      icon: "",
      cancelText: "??????",
      okText: "??????",
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
      str = "?????????";
    } else if (paymentType === 1 && paymentResult === 2) {
      str = "?????????";
    } else if (paymentType === 2 && paymentResult === 1) {
      str = "?????????";
    } else if (paymentType === 2 && paymentResult === 2) {
      str = "?????????";
    }
    return str;
  };

  const getTradeTypeWord = (tradeType: number) => {
    switch (tradeType) {
      case 1:
        return "?????????";
      case 2:
        return "??????";
      case 3:
        return "????????????";
      case 4:
        return "????????????";
      default:
        return "--";
    }
  };

  const handleChangeOutTradeNo = (e: any) => {
    let text = e.target.value.trim();
    text = text.split(" ").join("");
    const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(text)) {
      message.error("?????????????????????????????????");
      return;
    }
    setOutTradeNoInputVal(text);
  };

  const handleChangeOANumber = (e: any) => {
    let text = e.target.value.trim();
    text = text.split(" ").join("");
    const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(text)) {
      message.error("OA??????????????????????????????");
      return;
    }
    setOANumberInputVal(text);
  };

  // ????????????????????????????????????
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
        content: "??????????????????????????????????????????",
        icon: "",
        okText: "??????",
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
      message.error(e?.message);
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
      message.error(e?.message);
    }
  }, [tradeScreenshots]);

  return (
    <>
      <WorkTtemBox
        title="???????????????"
        nodeStatus={nodeStatus}
        operatorUserName={`${
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") || "??????"
        }`}
        cancelOrderReason={cancelReasonTypeDesc}
        updateTime={updateTime}
        allBtn={
          <>
            {nodeStatus === 1 && editAuth && !isEdit ? (
              <Button type="primary" onClick={handleEdit}>
                ?????????
              </Button>
            ) : nodeStatus === 2 && editAuth && !isEdit ? (
              <Button type="primary" onClick={handleEdit}>
                ??????
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
                  ????????????
                </Button>
                <Button onClick={handleCancelSubmit}>??????</Button>
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
                      label="??????????????????"
                      name="darenOtherCost"
                      tooltip="???????????????????????????????????????????????????????????????????????????????????????????????????"
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
                      ????????????????????????????????????????????????????????????????????????????????????????????????????????????
                    </p>
                  </>
                ) : (
                  <Form.Item
                    label="??????????????????"
                    tooltip="??????????????????????????????????????????????????????????????????????????????????????????????????????"
                  >
                    <div>{darenOtherCost || 0}</div>
                  </Form.Item>
                )}
              </Col> */}

              <Col span={8}>
                <Form.Item
                  label={
                    paymentType === 1
                      ? "????????????"
                      : paymentType === 2
                      ? "????????????"
                      : "--"
                  }
                  tooltip={
                    paymentType === 1
                      ? "????????????=????????????+??????????????????"
                      : paymentType === 2
                      ? "????????????=?????????????????????????????????-????????????-??????????????????"
                      : "--"
                  }
                >
                  <span>{collectionMoney || "--"}</span>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    paymentType === 1
                      ? "???????????????"
                      : paymentType === 2
                      ? "???????????????"
                      : "--"
                  }
                  name="paymentResult"
                  rules={[
                    {
                      required: true,
                      message: `?????????${paymentType === 1 ? "???" : "???"}?????????`,
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
                    label="OA???????????????"
                    name="oaProcessNumber"
                    rules={[{ required: true, message: "?????????OA????????????" }]}
                  >
                    {isEdit ? (
                      <Input
                        placeholder="?????????"
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
                    label="???????????????"
                    name="tradeType"
                    rules={[{ required: true, message: "?????????????????????" }]}
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
                    <Form.Item label="????????????" name="monthMoney">
                      <span>{monthMoney || "--"}</span>
                    </Form.Item>
                  </Col>
              ) : isShowTrade ? (
                <>
                  {paymentChannel === 1 || paymentChannel === 2 ? (
                    <Col span={8}>
                      <Form.Item
                        label="??????????????????"
                        name="outTradeNo"
                        rules={[{ required: true, message: "????????????????????????" }]}
                      >
                        {isEdit ? (
                          <Input
                            placeholder="????????????????????????"
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
                      <Form.Item
                        label="???????????????"
                        name="tradeScreenshots"
                        // rules={[{ required: true, message: "?????????????????????" }]}
                      >
                        {isEdit && fileList.length < 3 ? (
                          <div className={styles.uploadWrap}>
                            <Upload {...uploadProps}>
                              <Button icon={<UploadOutlined />} type="primary">
                                ??????
                              </Button>
                            </Upload>
                            {isShowUploadTip ? (
                              <span
                                style={{
                                  color: "rgba(0,0,0,.5)",
                                  marginLeft: "4px",
                                }}
                              >
                                ?????????jpg/png??????
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
                          // detail.screenshotOfPayment || "--"
                          ""
                        )}
                      </Form.Item>
                    </Col>
                  ) : (
                    ""
                  )}

                  <Col span={8}>
                    <Form.Item
                      label="????????????"
                      name="monthMoney"
                      rules={[{ required: true, message: "??????????????????" }]}
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
                  label="?????????????????????"
                  name="coopRemarks"
                >
                  {isEdit ? (
                    <TextArea
                      placeholder="???????????????????????????"
                      maxLength={100}
                      autoSize
                      showCount
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

export default SpecialConfirmReceiptPayWrapForSign;

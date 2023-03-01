/* eslint-disable no-underscore-dangle */
/* eslint-disable css-modules/no-unused-class */
import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Modal,
  Form,
  Radio,
  Select,
  Input,
  RadioChangeEvent,
  DatePicker,
  message,
  UploadFile,
  Popconfirm,
  Button,
  Upload,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { cloneDeep } from "lodash";
import moment from "moment";
import {
  $getBusinessOrderDetailInfo,
  $editBusinessOrder,
} from "src/api/invoice";
import IconTip from "src/components/IconTip";
import { UploadProps } from "antd/es/upload/Upload";
import locale from "antd/lib/date-picker/locale/zh_CN";
import { formateDate } from "src/utils/formateDate";
import { quotationTypeList } from "../../config/search";
// import styles from "./EditInvoice.scss";
import type { DetailDataType } from "../../config/InvoiceType";
import "moment/locale/zh-cn";

moment.locale("zh-cn");
const DatePickers: any = DatePicker;
const busOrderStatusList = new Map([
  [0, "履约中"],
  [1, "已履约"],
  [2, "已核账"],
]);
const refundResultList = [
  { text: "已付款", value: 1 },
  { text: "未付款", value: 2 },
];
const paymentResultList = [
  { text: "已收款", value: 1 },
  { text: "未收款", value: 2 },
];
interface EditInvoicePropsType {
  cancelEditModal: () => void;
  isEditVisible: boolean;
  busOrderNo: number | undefined;
  isEdit: boolean;
  detailMsgByOpId: any;
  getTableList: (args?: any) => void;
}
const EditInvoice: React.FC<EditInvoicePropsType> = ({
  cancelEditModal,
  isEditVisible,
  busOrderNo,
  isEdit,
  detailMsgByOpId,
  getTableList,
}) => {
  const { $permission } = window;
  const [loading, setLoading] = useState(false);
  const [paymentResult, setpaymentResult] = useState<number>(2);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [tradeTime, setTradeTime] = useState<string>("");
  const [detailData, setDetailData] = useState<any>({
    cusOfflineSupplement: 500,
  } as DetailDataType);
  const [isShowUploadTip, setIsShowUploadTip] = useState<boolean>(true);
  const uploadProps: UploadProps = {
    name: "file",
    action: "/api/admin/uploadImage",
    multiple: true,
    maxCount: 3,
    accept: ".png, .jpg",
    showUploadList: false,
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
    if (isEdit) return;
    const fileListArr = fileList.filter(
      item => item.response.data !== file.response.data
    );
    setFileList(fileListArr);
  };
  const [form] = Form.useForm();
  const handleConfirm = () => {
    const tradeScreenshots = fileList.map(item => {
      let str = "";
      if (!Object.keys(item?.response || {}).length) {
        str = item.url || "";
      } else {
        str = item.response.data;
      }
      return str;
    });
    const params = form.getFieldsValue();
    $editBusinessOrder({
      ...params,
      cusOfflineSupplement: detailData.cusOfflineSupplement,
      companyOfflineSupplement: detailData.companyOfflineSupplement,
      tradeScreenshots: tradeScreenshots.length ? String(tradeScreenshots) : "",
      tradeTime,
      busOrderNo,
    })
      .then(() => {
        cancelEditModal();
        getTableList();
        message.success("操作成功");
      })
      .catch(e => {
        cancelEditModal();
        message.error(e.message);
      });
  };
  const handleOk = () => {
    if (fileList && fileList.length) {
      form.setFieldValue("tradeScreenshots", fileList);
    }
    if (!form.getFieldsValue().paymentResult) {
      form.setFieldsValue({ paymentResult });
    }
    form.validateFields().then((e: any) => {
      if (!e.errorFields) {
        form.submit();
        handleConfirm();
      }
    });
  };
  const [checkAccountStatus, setAccountStatus] = useState(0);
  const onChangeRadio = (e: RadioChangeEvent) => {
    setAccountStatus(e.target.value);
  };
  const onChangeDate = (e: any) => {
    const time = moment(new Date(e?._d)).format("YYYY-MM-DD");
    setTradeTime(time);
  };
  const handlepaymentResult = (val: any) => {
    console.info(val);
    setpaymentResult(val);
  };

  const getBusinessOrderDetailInfo = async () => {
    try {
      setLoading(true);
      let res = {};
      if (busOrderNo) {
        res = await $getBusinessOrderDetailInfo({ busOrderNo });
      } else {
        res = detailMsgByOpId;
      }
      setLoading(false);
      const data:any= cloneDeep(res);
      setDetailData({ ...data });
      if (data.paymentResult) {
        form.setFieldValue("paymentResult", data.paymentResult);
      }
      form.setFieldValue("oaContractNumber", data.oaContractNumber);
      if (data.checkAccountStatus !== null) {
        form.setFieldValue("checkAccountStatus", data.checkAccountStatus);
      }
      if (data.tradeTime) {
        form.setFieldValue("tradeTime", moment(data.tradeTime));
      }
      setpaymentResult(data.paymentResult);
    } catch (error) {
      setLoading(false);
      console.info(error);
    }
  };
  const formatBusinessType = (id: string) =>
    (quotationTypeList.find(item => +item.value === +id) || { label: "" })
      .label;

  useEffect(() => {
    if (!detailData.tradeScreenshots) return;
    try {
      const list = detailData.tradeScreenshots.split(",");
      const fileMsgArr = list.map((item: string, index: number) => {
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
      });
      setFileList(fileMsgArr);
    } catch (e: any) {
      message.error(e.message);
    }
  }, [detailData.tradeScreenshots]);

  useEffect(() => {
    getBusinessOrderDetailInfo();
  }, [detailMsgByOpId, busOrderNo]);
  return (
    <>
      <Modal
        title={isEdit ? "查看" : "编辑商单"}
        visible={isEditVisible}
        onCancel={cancelEditModal}
        footer={
          <>
            <Button type="default" onClick={cancelEditModal}>
              取消
            </Button>
            {!isEdit ? (
              <>
                {checkAccountStatus ? (
                  <Popconfirm
                    title="确认将商单状态改为已核账？"
                    onConfirm={handleOk}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="primary">保存</Button>
                  </Popconfirm>
                ) : (
                  <Button type="primary" onClick={handleOk}>
                    保存
                  </Button>
                )}
              </>
            ) : (
              ""
            )}
          </>
        }
        width="65%"
      >
        <Spin spinning={loading}>
          <Form
            labelCol={{ span: 8 }}
            form={form}
            disabled={isEdit}
            initialValues={{
              checkAccountStatus: 0,
              paymentResult: 2,
            }}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="客户">{detailData.companyName}</Form.Item>
                <Form.Item label="客户联系人">
                  {detailData.customerName}
                </Form.Item>
                <Form.Item label="品牌-合作产品">
                  {detailData.brandName}-{detailData.coProductName}
                </Form.Item>
                <Form.Item label="产品品类">{detailData.coCateName}</Form.Item>
                <Form.Item label="创建人">
                  {detailData.businessUserName}
                </Form.Item>
                <Form.Item label="创建时间">{detailData.createTime}</Form.Item>
                <Form.Item label="商单类型">
                  {formatBusinessType(detailData.busOrderType)}
                </Form.Item>
                <Form.Item label="执行小组">
                  {detailData.executeGroupName}
                </Form.Item>
                <Form.Item label="工单履约进度">
                  {detailData.honorAgreementRate
                    ? `${detailData.honorAgreementRate}%`
                    : detailData.honorAgreementRate}
                </Form.Item>
                
                {!isEdit ? (
                  <Form.Item label="核账状态" name="checkAccountStatus">
                    <Radio.Group
                      defaultValue={0}
                      onChange={onChangeRadio}
                      value={checkAccountStatus}
                      disabled={!$permission("invoice-detail-status")}
                    >
                      <Radio value={0}>未核账</Radio>
                      <Radio value={1}>已核账</Radio>
                    </Radio.Group>
                  </Form.Item>
                ) : (
                  <Form.Item label="核账状态" name="checkAccountStatus">
                    {checkAccountStatus ? '未核账' : '已核账'}
                  </Form.Item>
                )}
                <Form.Item label="商单状态">
                  {busOrderStatusList.get(detailData.busOrderStatus)}
                </Form.Item>
                <Form.Item label="商单号">
                  {detailData.busOrderNo || "--"}
                </Form.Item>
                {detailData.oaContractNumber || !isEdit ? (
                  <Form.Item
                    label="商务合同OA编号"
                    name="oaContractNumber"
                    getValueFromEvent={(e: any) =>
                      e.target.value.replace(/[\W]/g, "")
                    }
                  >
                    <Input
                      placeholder="请输入商务合同OA编号"
                      autoComplete="off"
                      maxLength={30}
                      disabled={!$permission("invoice-detail-oa")}
                    />
                  </Form.Item>
                ) : (
                  detailData.oaContractNumber
                )}
              </Col>
              <Col span={12}>
                {/* <Form.Item label="合作价格（售价）">
                  {detailData.coPrice || "--"}
                </Form.Item> */}
                <Form.Item
                  label={
                    <>
                      <span>平台报价</span>
                      <IconTip content="各工单的“平台报价”之和，不含取消合作的工单数据" />
                    </>
                  }
                >
                  {detailData.officePrice || 0}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <span>商务实际营收</span>
                      <IconTip content="各工单的商务实际营收之和，但不含取消合作的工单数据" />
                    </>
                  }
                >
                  {detailData.businessIncome || 0}
                </Form.Item>
                <Form.Item label="对公返点">
                  {detailData.rebateCorporate || 0}
                </Form.Item>
                <Form.Item label="对私返点">
                  {detailData.rebatePrivate || 0}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <span>销售收入</span>
                      <IconTip content="商单中全部工单的销售收入之和（含特殊工单，但不含已取消合作的工单）" />
                    </>
                  }
                >
                  {detailData.salesIncome || 0}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <span>销售成本</span>
                      <IconTip content="商单中工单的销售成本之和（含特殊工单，但不含已取消合作的工单）" />
                    </>
                  }
                >
                  {detailData.costOfSales || 0}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <span>绩效营收</span>
                      <IconTip content="商单中全部工单的商务实际营收金额之和（含特殊工单，但不含已取消合作的工单）" />
                    </>
                  }
                >
                  {detailData.performanceMoney || 0}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <span>毛利率</span>
                      <IconTip content="商单中全部工单的毛利率的平均值（含特殊工单，但不含已取消合作的工单）" />
                    </>
                  }
                >
                  {(+detailData.grossProfitRate === 0 &&
                    detailData.grossProfitRate != null) ||
                  detailData.grossProfitRate
                    ? `${detailData.grossProfitRate}%`
                    : "--"}
                </Form.Item>
                {/* <Form.Item label="线下补款" name="cusOfflineSupplement">
                  {detailData.cusOfflineSupplement}
                </Form.Item>
                <Form.Item
                  label="线下返点"
                  name="companyOfflineSupplement"
                >
                  {detailData.companyOfflineSupplement}
                </Form.Item> */}
                <Form.Item
                  label={
                    <>
                      <span>线下应收</span>
                      <IconTip content={
                      (
                        <>
                          <p>客户需要额外给我们补款的金额</p>
                          <p>支持手动修改</p>
                        </>
                      )
                     } />
                    </>
                  }
                >
                  {detailData.cusOfflineSupplement || 0}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <span>线下应付</span>
                      <IconTip content={
                      (
                        <>
                          <p>我们需要额外补款给客户的金额：</p>
                          <p>线下应付 = 【实际】官方平台下单价 - 商务实际营收 + 线下应收</p>
                        </>
                      )
                    } />
                    </>
                  }
                >
                  {detailData.companyOfflineSupplement || 0}
                </Form.Item>

                <Form.Item
                  label={
                    <>
                      <span>达人其他成本</span>
                      <IconTip content="指除达人分成金额外，其他需要额外支付给达人的费用，例如达人的差旅费" />
                    </>
                  }
                >
                  {detailData.darenOtherCost || 0}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <span>其他收入</span>
                      <IconTip content="商单中，各工单的“其他收入”之和，不含已取消合作的工单数据" />
                    </>
                  }
                >
                  {detailData.otherIncome || 0}
                </Form.Item>
                {detailData.cusOfflineSupplement > 0 ? (
                  <>
                    <Form.Item
                      label="应收状态"
                      name="paymentResult"
                      rules={[{ required: true, message: "请选择应收状态" }]}
                    >
                      <Select defaultValue={2} onChange={handlepaymentResult}>
                        {(paymentResultList || []).map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.text}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {paymentResult === 1 ? (
                      <>
                        <Form.Item
                          label="收款时间"
                          name="tradeTime"
                          rules={[
                            { required: true, message: "请选择补款时间" },
                          ]}
                        >
                          <DatePickers
                            onChange={onChangeDate}
                            placeholder="选择日期"
                            showToday={false}
                            locale={locale}
                          />
                        </Form.Item>
                        <Form.Item
                          label="收款截图凭证"
                          name="tradeScreenshots"
                          rules={[{ required: true, message: "补款截图" }]}
                        >
                          {!isEdit && fileList.length < 3 ? (
                            <div>
                              <Upload {...uploadProps}>
                                <Button
                                  icon={<UploadOutlined />}
                                  type="primary"
                                >
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
                            <div style={{ marginTop: "12px" }}>
                              <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onRemove={handleRemoveScreenshotOfPayment}
                              />
                            </div>
                          ) : (
                            // detail.screenshotOfPayment || "--"
                            ""
                          )}
                        </Form.Item>
                      </>
                    ) : (
                      ""
                    )}
                  </>
                ) : (
                  ""
                )}
                {detailData.companyOfflineSupplement > 0 ? (
                  <>
                    <Form.Item
                      label="应付状态"
                      name="paymentResult"
                      rules={[{ required: true, message: "请选择应付状态" }]}
                    >
                      <Select defaultValue={2} onChange={handlepaymentResult}>
                        {(refundResultList || []).map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.text}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {paymentResult === 1 ? (
                      <Form.Item label="付款截图凭证" name="tradeScreenshots">
                        {!isEdit && fileList.length < 3 ? (
                          <div>
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
                          <div style={{ marginTop: "12px" }}>
                            <Upload
                              listType="picture-card"
                              fileList={fileList}
                              onRemove={handleRemoveScreenshotOfPayment}
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </Form.Item>
                    ) : (
                      ""
                    )}
                  </>
                ) : (
                  ""
                )}
                {/* {detailData.oaContractNumber || !isEdit ? (
                  <Form.Item
                    label="商务合同OA编号"
                    name="oaContractNumber"
                    getValueFromEvent={(e: any) =>
                      e.target.value.replace(/[\W]/g, "")
                    }
                  >
                    <Input
                      placeholder="请输入商务合同OA编号"
                      autoComplete="off"
                      maxLength={30}
                      disabled={!$permission("invoice-detail-oa")}
                    />
                  </Form.Item>
                ) : (
                  detailData.oaContractNumber
                )}
                <Form.Item label="商单号">
                  {detailData.busOrderNo || "--"}
                </Form.Item> */}
                <Form.Item label="商单成单时间">
                  {formateDate(detailData.orderTime)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default EditInvoice;

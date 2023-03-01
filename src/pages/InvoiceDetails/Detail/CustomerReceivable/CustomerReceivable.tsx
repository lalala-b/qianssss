/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import {
  Col,
  ConfigProvider,
  Upload,
  Form,
  Row,
  Select,
  DatePicker,
  message,
  Button,
  Modal,
} from "antd";
import cs from "classnames";
import moment from "moment";
import zhCN from "antd/es/locale/zh_CN";
import type { UploadProps } from "antd/es/upload";
import { UploadOutlined } from "@ant-design/icons";
import IconTip from "src/components/IconTip";
import { $customerBackMoney } from "src/api/invoiceDetail";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox";
import styles from "./CustomerReceivable.scss";

const { Option } = Select;
const CustomerReceivable = () => {
  const {
    detail: { busOrderType = 0 },
    opUserName = "",
    invoiceProcessStep = "",
    cusOfflineSupplement = "",
    customerMoneyDate,
    platOrderCharge,
    officePrice,
    onRefresh,
    setLoading,
    businessOrderId,
    customerBackProve,
    customerMoneyStatus,
    failMsg,
    from = "",
    applyAuth = 0,
  } = useContext(DetailContext);
  // const { $permission } = window;
  const [custormForm] = Form.useForm();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isShowUploadTip, setIsShowUploadTip] = useState<boolean>(true);
  const [fileList, setFileList] = useState<any[]>([]);
  const [viewFileList, setViewFileList] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showOtherItem, setShowOtherItem] = useState<boolean>(false);
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
    if (!isEdit) return;
    const fileListArr = fileList.filter(
      item => item.response.data !== file.response.data
    );
    setFileList(fileListArr);
  };
  const handleEdit = () => {
    custormForm.setFieldsValue({
      customerMoneyStatus: customerMoneyStatus || 2,
      customerMoneyDate: customerMoneyDate
        ? moment(customerMoneyDate || "")
        : "",
    });
    setIsEdit(true);
  };
  const confirmSubmit = async () => {
    let customerBackProveArr: any = [];
    if (showOtherItem) {
      customerBackProveArr = fileList.map(item => {
        let str = "";
        if (!Object.keys(item?.response || {}).length) {
          str = item.url;
        } else {
          str = item.response.data;
        }
        return str;
      });
    }
    setBtnLoading(true);
    try {
      await $customerBackMoney({
        businessOrderId,
        customerBackProve: JSON.stringify(customerBackProveArr),
        ...custormForm.getFieldsValue(),
        customerMoneyDate: moment(
          custormForm.getFieldValue("customerMoneyDate")
        ).format("YYYY-MM-DD"),
      });
      setBtnLoading(false);
      setIsModalOpen(false);
      message.success("操作成功");
      handleCancel();
      onRefresh();
    } catch (e: any) {
      setBtnLoading(false);
      setLoading(false);
      setIsModalOpen(false);
      message.error(String(e.message));
    }
  };
  const handleSubmit = async () => {
    await custormForm.submit();
    if (showOtherItem) {
      await custormForm.validateFields();
      if (!fileList.length) {
        message.error("请上传回款凭证");
        return;
      }
    }
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsEdit(false);
  };

  const handleSelectStatus = (val: any) => {
    setShowOtherItem(+val === 1);
  };
  useEffect(() => {
    if (!customerBackProve) return;
    try {
      const fileMsgArr = JSON.parse(customerBackProve).map(
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
      setViewFileList(fileMsgArr);
    } catch (e: any) {
      message.error(e?.message);
    }
  }, [customerBackProve]);

  const [nodeStatus, setNodeStatus] = useState<number>(0);

  useEffect(() => {
    if ([0, 1, 2].includes(+invoiceProcessStep)) {
      setNodeStatus(0);
    } else if (+invoiceProcessStep === 3) {
      setNodeStatus(1);
    } else {
      setNodeStatus(2);
    }
  }, [invoiceProcessStep]);

  useEffect(() => {
    if (customerMoneyStatus && +customerMoneyStatus === 1) {
      setShowOtherItem(true);
    }
  }, [customerMoneyStatus]);

  return (
    <ConfigProvider locale={zhCN}>
      <WorkItemBox
        title="客户回款"
        nodeStatus={nodeStatus}
        operatorUserName={`${opUserName || "待定"}`}
        allBtn={
          <>
            {/* 仅从商单进入可填写 */}
            {from === "invoice" && +applyAuth === 1 && (
              <>
                {!isEdit && +nodeStatus === 1 && (
                  <Button
                    type="primary"
                    className="m-r-6"
                    onClick={handleEdit}
                  >
                    填写付款信息
                  </Button>
                )}
                {+nodeStatus === 2 && !isEdit && failMsg && (
                  <Button
                    type="primary"
                    className="m-r-6"
                    onClick={handleEdit}
                  >
                    修改付款信息
                  </Button>
                )}
                {isEdit && (
                  <div>
                    <Button
                      type="primary"
                      disabled={!showOtherItem}
                      loading={btnLoading}
                      className={cs(styles.successButton, "m-r-6")}
                      onClick={handleSubmit}
                    >
                      提交
                    </Button>
                    <Button
                      type="default"
                      className="m-r-6"
                      onClick={handleCancel}
                    >
                      取消
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        }
      >
        <div className={cs(styles.CustomerReceivableWrapper, "m-t-24")}>
          <Form form={custormForm} className="m-t-24">
            <Row>
              <Col span={8}>
                <Form.Item label="客户回款状态" name="customerMoneyStatus">
                  {isEdit ? (
                    <Select
                      placeholder="请选择"
                      onChange={handleSelectStatus}
                      className={styles.select}
                    >
                      <Option value={1}>客户已回款</Option>
                      <Option value={2}>客户未回款</Option>
                    </Select>
                  ) : customerMoneyStatus === 1 ? (
                    "客户已回款"
                  ) : customerMoneyStatus === 2 ? (
                    "客户未回款"
                  ) : (
                    // "--"
                    '客户未回款'
                  )}
                </Form.Item>
              </Col>
              {/* 客户自行下单且线下应收大于0 */}
              {+busOrderType === 1 && +cusOfflineSupplement > 0 ? (
                <Col span={8}>
                  <Form.Item label="线下应收" name="cusOfflineSupplement">
                    {cusOfflineSupplement}
                    <IconTip content="线下应收=各工单线下应收之和，不含已取消合作的工单" />
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {/* 代客下单 ｜｜ 不走平台的私单 */}
              {[2, 4].includes(+busOrderType) ? (
                <Col span={8}>
                  <Form.Item label="平台报价" name="officePrice">
                    {officePrice}
                    <IconTip
                      content={
                        <>
                          <p>
                            1）平台报价=各工单的平台报价之和，不含已取消合作的工单
                          </p>
                          {+busOrderType !== 4 && (
                            <p>
                              2）【报给客户】官方平台手续费=各工单【报给客户】官方平台手续费之和，不含已取消合作的工单
                            </p>
                          )}
                        </>
                      }
                    />
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {/* 代客下单 */}
              {+busOrderType === 2 ? (
                <Col span={8}>
                  <Form.Item
                    label="【报给客户】官方平台手续费"
                    name="platOrderCharge"
                  >
                    {platOrderCharge}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {showOtherItem && (
                <>
                  <Col span={8}>
                    <div className="flex">
                      {isEdit && (
                        <span
                          style={{
                            color: "#ff4d4f",
                            marginTop: "6px",
                            marginRight: "2px",
                            fontSize: "16px",
                            display: "inline-block",
                          }}
                        >
                          *
                        </span>
                      )}
                      <Form.Item style={{ display: "inline-block" }} label="回款凭证">
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
                        {isEdit && fileList.length ? (
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
                        {!isEdit &&
                          (viewFileList.length ? (
                            <>
                              <Upload
                                listType="picture-card"
                                fileList={viewFileList}
                                showUploadList={{ showRemoveIcon: false }}
                                // onChange={handleChange}
                              />
                            </>
                          ) : (
                            "--"
                          ))}
                      </Form.Item>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="回款日期"
                      name="customerMoneyDate"
                      rules={[{ required: true, message: "请选择回款日期" }]}
                    >
                      {isEdit ? <DatePicker /> : customerMoneyDate || "--"}
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </Form>
        </div>
        {isModalOpen && (
          <Modal
            title={null}
            visible={isModalOpen}
            onOk={confirmSubmit}
            okText="确认"
            cancelText="取消"
            onCancel={() => {
              setIsModalOpen(false);
            }}
          >
            <p>确定相关信息均已填写正确？提交后将不可再修改</p>
          </Modal>
        )}
      </WorkItemBox>
    </ConfigProvider>
  );
};

export default CustomerReceivable;

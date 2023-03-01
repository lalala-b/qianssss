/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useContext } from "react";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import type { ColumnsType } from "antd/es/table";
import {
  Button,
  Modal,
  Table,
  Form,
  Row,
  Col,
  Input,
  message,
  Select,
  Upload,
  DatePicker,
} from "antd";
import { ExclamationCircleFilled, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { DetailContext } from "../../DetailProvider";
import styles from "./SettleDocModal.scss";

const { TextArea } = Input;

interface SettleDosModalPropType {
  show: boolean;
  onClose: () => void;
}

interface WorkOrderColumnsType {
  orderType: number;
  orderNo: string;
  busOrderNo: string;
  businessUserName: string;
  receiveMoney: string;
  paymentMoney: string;
  honorAgreementFinishDate: string;
  accountName: string;
  orderBelong: string;
}

interface CooperateOrderColumnsType {
  orderNo: string;
  receiveMoney: string;
  paymentMoney: string;
  honorAgreementFinishDate: string;
  orderBelong: string;
}

interface FormParamsType {
  oaProcessNumber: string;
  monthMoney: moment.Moment;
  coopRemarks: string;
  tradeType: number;
  outTradeNo: string;
  collectionScreenshots: UploadFile[];
}

const PAYMENT_CHANNEL_DATA = [
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
];

const SettleDosModal: React.FC<SettleDosModalPropType> = ({
  show,
  onClose,
}) => {
  const { loading, setLoading, onRefresh } = useContext(DetailContext);

  const [tableLoading, setTableLoading] = useState(false);
  // 应收/应付金额
  const [payOrCollectMomey, setPayOrCollectMomey] = useState(1);
  // 收付款标识（true为付款，false为收款）
  const [paymentType, setPaymentType] = useState(true);
  // 支付渠道的类型
  const [paymentChannel, setPaymentChannel] = useState(0);
  // 款项截图文件列表
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // 禁用绩效月的选择
  const [disabledMonthMoney, setDisabledMonthMoney] = useState(true);
  // 控制添加工单/特殊收支弹窗的显隐
  const [isShowAddWorkOrderModal, setShowAddWorkOrderModal] = useState(true);
  // 控制添加合作订单弹窗的显隐
  const [isShowAddCoopOrderModal, setShowAddCoopOrderModal] = useState(true);

  const [form] = Form.useForm();

  // 工单和特殊收支结算单表格的列
  const settleColumnsForWorkOrder: ColumnsType<WorkOrderColumnsType> = [
    {
      title: "工单类型",
      dataIndex: "orderType",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "工单号/特殊收支号",
      dataIndex: "orderNo",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "商单号",
      dataIndex: "busOrderNo",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "商务",
      dataIndex: "businessUserName",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "应收金额",
      dataIndex: "receiveMoney",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "应付金额",
      dataIndex: "paymentMoney",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "履约完成时间",
      dataIndex: "honorAgreementFinishDate",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "账号名称",
      dataIndex: "accountName",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "订单归属",
      dataIndex: "orderBelong",
      width: 100,
      render: value => value || "--",
    },
    {
      title: "操作",
      dataIndex: "opperate",
      width: 100,
      fixed: "right",
      render() {
        return (
          <div>
            <Button type="primary">移除</Button>
          </div>
        );
      },
    },
  ];

  // 合作订单结算单表格的列
  const settleColumnsForCooperateOrder: ColumnsType<CooperateOrderColumnsType> =
    [
      {
        title: "合作订单号",
        dataIndex: "orderNo",
        width: 100,
        render: value => value || "--",
      },
      {
        title: "应收金额",
        dataIndex: "receiveMoney",
        width: 100,
        render: value => value || "--",
      },
      {
        title: "应付金额",
        dataIndex: "paymentMoney",
        width: 100,
        render: value => value || "--",
      },
      {
        title: "履约完成时间",
        dataIndex: "honorAgreementFinishDate",
        width: 100,
        render: value => value || "--",
      },
      {
        title: "订单归属",
        dataIndex: "orderBelong",
        width: 100,
        render: value => value || "--",
      },
      {
        title: "操作",
        dataIndex: "opperate",
        width: 100,
        fixed: "right",
        render() {
          return (
            <div>
              <Button type="primary">移除</Button>
            </div>
          );
        },
      },
    ];

  // 改变支付渠道时的逻辑
  const handleChangePaymentChannel = (val: number) => {
    setPaymentChannel(val);
    // 当支付渠道为支付宝或者微信的时候，禁用绩效月的选择
    if (val === 1 || val === 2) {
      setDisabledMonthMoney(true);
    } else {
      // 当支付渠道为银行的时候，可以选择绩效月，并清空原先的绩效月值
      setDisabledMonthMoney(false);
      form.setFieldValue("monthMoney", "");
    }
  };

  // 上传款项截图之前
  const handleBeforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("只能上传JPG/PNG的文件!");
    }
  };

  // 预览图片
  const handlePreviewTradeScreenshots = async (file: UploadFile) => {
    const {
      response: { data },
    } = file;

    if (data) {
      window.open(data);
    }
  };

  // 更改款项截图的图片
  const handleChangeTradeScreenshots = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
    form.setFieldValue("collectionScreenshots", newFileList);
  };

  // 监听交易流水号的更改事件
  const handleChangeOutTradeNo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let date = "";
    // 若支付渠道为支付宝，交易流水号前6位，解析为对应的年月
    if (paymentChannel === 1) {
      date = value.slice(0, 7);
    } else if (paymentChannel === 2) {
      // 若支付渠道为微信，交易流水号的11-16位，解析为对应的年月
      date = value.slice(11, 17);
    }
    const year = date.slice(0, 4);
    const month = date.slice(4);
    // 校验该时间是否有效
    const monthMoneyVal = moment(`${year}-${month}`).isValid()
      ? moment(`${year}-${month}`)
      : "";
    form.setFieldValue("monthMoney", monthMoneyVal);
  };

  // 打开添加工单/特殊收支的弹窗
  const handleShowAddWorkOrderModal = () => {
    setShowAddWorkOrderModal(true);
  };

  // 打开添加合作订单的弹窗
  const handleShowAddCoopOrderModal = () => {
    setShowAddCoopOrderModal(true);
  };

  // 提交结算单
  const handleSubmitSettleDoc = () => {
    form.submit();
  };

  // 表单提交
  const handleFinishForm = (formVal: FormParamsType) => {
    console.info(formVal);
    setLoading(true);
    setLoading(false);
    onRefresh();
  };

  useEffect(() => {
    if (show) {
      setTableLoading(false);
    } else {
      // 隐藏弹窗，表单各项置空
      form.resetFields();
    }
  }, [show]);

  return (
    <Modal
      visible={show}
      width="70%"
      onCancel={onClose}
      title={
        <div className={styles.modalTitleWrap}>
          <h3>结算单</h3>
          <Button
            loading={loading}
            type="primary"
            onClick={handleShowAddWorkOrderModal}
          >
            添加工单&特殊收支
          </Button>
          <Button
            loading={loading}
            type="primary"
            onClick={handleShowAddCoopOrderModal}
          >
            添加签约合作订单
          </Button>
        </div>
      }
      footer={
        <Button
          loading={loading}
          type="primary"
          onClick={handleSubmitSettleDoc}
        >
          提交
        </Button>
      }
    >
      <div className={styles.tableWrap}>
        {/* 工单和特殊收支结算单表格 */}
        <Table
          scroll={{ x: "max-content" }}
          columns={settleColumnsForWorkOrder}
          loading={tableLoading}
          dataSource={[]}
          rowKey="orderNo"
        />

        {/* 合作订单结算单表格 */}
        <Table
          scroll={{ x: "max-content" }}
          columns={settleColumnsForCooperateOrder}
          loading={tableLoading}
          dataSource={[]}
          rowKey={record => record.orderNo}
        />
      </div>

      <span className={styles.payOrCollectMomeyTip}>
        <ExclamationCircleFilled className={styles.warnIcon} />
        {!payOrCollectMomey ? (
          <i>合并应付金额：￥0，合并应收金额：￥0</i>
        ) : (
          <i>
            合并{paymentType ? "应付" : "应收"}金额：￥{payOrCollectMomey}
          </i>
        )}
      </span>

      <div className={styles.voucherWrap}>
        {!payOrCollectMomey ? (
          <>
            <h3>无需收付款凭证</h3>
            <div className={styles.formWrap}>
              <Form
                form={form}
                labelCol={{ span: 5 }}
                onFinish={handleFinishForm}
              >
                <Row gutter={18}>
                  <Col span={14}>
                    <Form.Item
                      label="绩效月："
                      name="monthMoney"
                      tooltip="绩效月根据最后一个工单的履约完成时间进行自动计算，不可修改"
                    >
                      <span>2022年2月</span>
                    </Form.Item>
                  </Col>

                  <Col span={14}>
                    <Form.Item label="合作情况备注：" name="coopRemarks">
                      <TextArea
                        placeholder="请输入合作情况备注"
                        maxLength={100}
                        showCount
                        rows={4}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </>
        ) : (
          <>
            <h3>{paymentType ? "付款" : "收款"}凭证</h3>
            <div className={styles.formWrap}>
              <Form
                form={form}
                labelCol={{ span: 5 }}
                onFinish={handleFinishForm}
              >
                {
                  // 付款
                  paymentType ? (
                    <Row gutter={18}>
                      <Col span={14}>
                        <Form.Item
                          label="OA流程编号："
                          name="oaProcessNumber"
                          rules={[
                            {
                              // 对文字进行校验
                              validator: (rule, value, callback) => {
                                const text = value.trim().split(" ").join("");
                                const reg = new RegExp(
                                  "[\\u4E00-\\u9FFF]+",
                                  "g"
                                );
                                if (reg.test(text)) {
                                  callback("OA流程编号不能包含文字");
                                }
                              },
                            },
                          ]}
                          getValueFromEvent={(
                            e: React.ChangeEvent<
                              HTMLInputElement | HTMLTextAreaElement
                            >
                          ) =>
                            // 对空格做处理
                            e.target.value.replace(/\s+/g, "")
                          }
                        >
                          <Input
                            maxLength={25}
                            allowClear
                            placeholder="请填写OA流程编号"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={14}>
                        <Form.Item
                          label="绩效月："
                          name="monthMoney"
                          tooltip="绩效月自动根据所选工单、特殊收支的最后一个履约完成时间进行自动计算"
                        >
                          <span>2022年2月</span>
                        </Form.Item>
                      </Col>

                      <Col span={14}>
                        <Form.Item label="合作情况备注：" name="coopRemarks">
                          <TextArea
                            placeholder="请输入合作情况备注"
                            maxLength={100}
                            showCount
                            rows={4}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    // 收款
                    <Row gutter={18}>
                      <Col span={14}>
                        <Form.Item
                          label="支付渠道："
                          name="tradeType"
                          rules={[
                            { required: true, message: "请选择支付渠道" },
                          ]}
                        >
                          <Select
                            options={PAYMENT_CHANNEL_DATA}
                            onChange={handleChangePaymentChannel}
                            placeholder="请选择支付渠道"
                          />
                        </Form.Item>
                      </Col>

                      {/* 微信或支付宝 */}
                      {paymentChannel === 1 || paymentChannel === 2 ? (
                        <Col span={14}>
                          <Form.Item
                            label="交易流水号："
                            name="outTradeNo"
                            rules={[
                              {
                                required: true,
                                message: "请输入交易流水号",
                              },
                              {
                                // 对文字进行校验
                                validator: (rule, value, callback) => {
                                  const text = value.trim().split(" ").join("");
                                  const reg = new RegExp(
                                    "[\\u4E00-\\u9FFF]+",
                                    "g"
                                  );
                                  if (reg.test(text)) {
                                    callback("OA流程编号不能包含文字");
                                  }
                                },
                              },
                            ]}
                            getValueFromEvent={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              // 对空格做处理
                              e.target.value.replace(/\s+/g, "")
                            }
                          >
                            <Input
                              placeholder="请输入交易流水号"
                              maxLength={45}
                              allowClear
                              onChange={handleChangeOutTradeNo}
                            />
                          </Form.Item>
                        </Col>
                      ) : paymentChannel === 3 ? ( // 银行
                        <Col span={14}>
                          <Form.Item
                            label="款项截图："
                            name="collectionScreenshots"
                            rules={[
                              {
                                required: true,
                                message: "请上传款项截图",
                              },
                            ]}
                          >
                            <Upload
                              action="/api/admin/uploadImage"
                              listType="picture-card"
                              fileList={fileList}
                              maxCount={3}
                              multiple
                              beforeUpload={handleBeforeUpload}
                              onPreview={handlePreviewTradeScreenshots}
                              onChange={handleChangeTradeScreenshots}
                            >
                              {fileList.length < 3 ? (
                                <div>
                                  <PlusOutlined />
                                </div>
                              ) : (
                                ""
                              )}
                            </Upload>
                            <span className={styles.uploadTip}>
                              只支持jpg/png格式
                            </span>
                          </Form.Item>
                        </Col>
                      ) : (
                        ""
                      )}

                      <Col span={14}>
                        <Form.Item
                          label="绩效月："
                          name="monthMoney"
                          rules={[{ required: true, message: "请选择绩效月" }]}
                        >
                          <DatePicker
                            picker="month"
                            disabled={disabledMonthMoney}
                            placeholder="请选择绩效月"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={14}>
                        <Form.Item label="合作情况备注：" name="coopRemarks">
                          <TextArea
                            placeholder="请输入合作情况备注"
                            maxLength={100}
                            showCount
                            rows={4}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                }
              </Form>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SettleDosModal;

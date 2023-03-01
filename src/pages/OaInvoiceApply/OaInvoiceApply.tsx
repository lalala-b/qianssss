/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState, useContext } from "react";
import moment from "moment";
import cs from "classnames";
import {
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  Button,
  Radio,
  Spin,
  ConfigProvider,
  UploadFile,
  message,
  Modal,
} from "antd";
import type { RadioChangeEvent } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import zhCN from "antd/es/locale/zh_CN";
import { GlobalContext } from "src/contexts/global";
import RUpload from "src/components/Upload";
import { getUrlQuery } from "src/utils/getUrlQuery";
import {
  $getCostcenterInfoList,
  GetCostcenterInfoResItemType,
  GetContractProcessListItemType,
  $getCompanyList,
  GetCompanyListItemType,
  $getCostcenterByName,
  GetCostcenterByNameResType,
  $invoiceApply,
  InvoiceApplyParamsType,
} from "src/api/oaPaymentApply";
// import ChooseSupplierModal from "./ChooseSupplierModal";
import AssociatedProcessModal from "../OaPaymentApply/AssociatedProcessModal";
import styles from "./OaInvoiceApply.scss";

const { TextArea } = Input;
const { Option } = Select;

const INVOICE_TYPE_ARR = [
  "增值税专用发票",
  "增值税纸质普通发票",
  "增值税电子普通发票",
];

const OaInvoiceApply = () => {
  const [oaForm] = Form.useForm();

  const { globalData = {} } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);
  const [costcenterInfoList, setCostcenterInfoList] = useState<
    GetCostcenterInfoResItemType[]
  >([]);
  const [showInvoiceField, setShowInvoiceField] = useState(true);
  const [showRequirementField, setShowRequirementField] = useState(false);

  const [showAssociatedProcessModal, setShowAssociatedProcessModal] =
    useState(false);
  const [processInfo, setProcessInfo] = useState<
    GetContractProcessListItemType[]
  >([]);
  const [companyList, setCompanyList] = useState<GetCompanyListItemType[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [taxFileList, setTaxFileList] = useState<any[]>([[]]);
  const [applyInfo, setApplyInfo] = useState<GetCostcenterByNameResType>();

  const getCostcenterByName = async () => {
    const res = await $getCostcenterByName({
      userName:
        globalData?.user?.userInfo?.email.substr(
          0,
          globalData?.user?.userInfo?.email.indexOf("@")
        ) || globalData?.user?.userInfo.name,
    });
    const info: GetCostcenterByNameResType = JSON.parse(res);
    setApplyInfo(info);
  };

  const getCostcenterInfoList = async () => {
    try {
      const res = await $getCostcenterInfoList();
      const info: GetCostcenterInfoResItemType[] = JSON.parse(res);

      setCostcenterInfoList(info);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const getCompanyList = async () => {
    const res = await $getCompanyList();

    const info: {
      respCode: number;
      respMsg: string;
      respData: GetCompanyListItemType[];
    } = JSON.parse(res);

    if (+info.respCode === 0) {
      setCompanyList(info.respData);
    }
  };

  const handleChooseProcess = (selectRow: GetContractProcessListItemType[]) => {
    setProcessInfo(selectRow);
    setShowAssociatedProcessModal(false);
  };

  const handleDeleteProcessItemInfo = (index: number) => {
    const newProcessInfo = [...processInfo];
    newProcessInfo.splice(index, 1);
    setProcessInfo(newProcessInfo);
  };

  const handleChangeFileList = (list: UploadFile[]) => {
    setFileList(list);
  };

  const handleChangeTaxFileList = (list: UploadFile[], index: number) => {
    const newTaxFileList = [...taxFileList];
    newTaxFileList[index] = list;
    setTaxFileList(newTaxFileList);
  };

  const handleChangeInvoiceType = (value: string) => {
    if (value !== "增值税专用发票") {
      setShowInvoiceField(false);

      oaForm.setFieldValue(
        "invoiceDetails",
        oaForm.getFieldValue("invoiceDetails").map((item: any) => {
          const newItem = { ...(item || {}) };
          delete newItem.address;
          delete newItem.bankAccount;
          delete newItem.prove;
          return newItem;
        })
      );
    } else {
      setShowInvoiceField(true);
    }
  };

  const handleChangeTaxAmount = () => {
    oaForm.setFieldValue(
      "taxAmount",
      oaForm
        .getFieldValue("invoiceDetails")
        .reduce(
          (total: any, item: { taxAmount: any }) =>
            total + +((item || {}).taxAmount || 0),
          0
        )
    );
  };

  const handleChangeRequirementFlag = (e: RadioChangeEvent) => {
    if (e.target.value === "是") {
      setShowRequirementField(true);
    } else {
      oaForm.setFieldValue("requirement", "");
      setShowRequirementField(false);
    }
  };

  const handleSubmit = async () => {
    await oaForm.validateFields();

    const { companyId, invoiceDetails } = oaForm.getFieldsValue();

    const params: InvoiceApplyParamsType = {
      ...oaForm.getFieldsValue(),
      invoiceDetails: invoiceDetails.map((item: any) => {
        const newItem = { ...item };
        newItem.prove = newItem?.prove?.[0]?.url || "";
        return newItem;
      }),
      deptName: applyInfo?.costCenterName || "",
      workNo: applyInfo?.employId || "",
      company:
        companyList.find(item => item.companyCode === companyId)?.companyName ||
        "",
      linkFlow:
        (processInfo || [])
          .map(item => [item.instanceId, item.businessKey].join(","))
          .join(";") || "",
      fileUrl: fileList[0]?.url || "",
      businessOrderId: getUrlQuery()?.businessId || "",
      userName: applyInfo?.userName,
      userId: applyInfo?.userId,
    };

    try {
      setLoading(true);
      await $invoiceApply(params);
      message.success("申请成功");
      window.history.back();
      setLoading(false);
    } catch (e: any) {
      message.error(e.message || "申请失败，请重试");
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      // setLoading(true);
      getCostcenterInfoList();
      getCompanyList();
      getCostcenterByName();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  return (
    <Spin spinning={loading}>
      <ConfigProvider locale={zhCN}>
        <h2>发票申请审批单</h2>
        <div className={styles.container}>
          <div className={cs("q-wrap", styles.wrapper)}>
            <Form
              form={oaForm}
              labelAlign="left"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              initialValues={{
                invoiceType: "增值税专用发票",
                requirementFlag: "否",
                invoiceDetails: [
                  {
                    invoiceName: "",
                    identifier: "",
                    address: "",
                    bankAccount: "",
                    prove: "",
                    taxAmount: "",
                  },
                ],
              }}
              // onFinish={onFinish}
              // onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="申请人姓名"
                    name="realName"
                    labelCol={{ span: 8 }}
                  >
                    {`${applyInfo?.realName}（${applyInfo?.userName}）`}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="申请人部门"
                    name="costCenterName"
                    labelCol={{ span: 8 }}
                  >
                    {applyInfo?.costCenterName || "--"}
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="工号"
                    name="employId"
                    labelCol={{ span: 8 }}
                  >
                    {applyInfo?.employId || "--"}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="申请日期"
                    name="applyTime"
                    labelCol={{ span: 8 }}
                  >
                    {moment().format("YYYY-MM-DD")}
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="公司主体"
                    name="companyId"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请选择公司主体" }]}
                  >
                    <Select
                      placeholder="请选择公司主体"
                      showSearch
                      filterOption={(input, option) =>
                        (option!.children as unknown as string).includes(input)
                      }
                    >
                      {companyList.map(({ id, companyCode, companyName }) => (
                        <Option key={id} value={companyCode}>
                          {companyName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="发票类型"
                    name="invoiceType"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请选择发票类型" }]}
                  >
                    <Select
                      placeholder="请选择发票类型"
                      onChange={handleChangeInvoiceType}
                    >
                      {INVOICE_TYPE_ARR.map(item => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <div className={styles.step}>
                <div className={styles.title}>发票抬头</div>
                <Form.List name="invoiceDetails">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={field.key} className={styles.entryInfoBox}>
                          <div className={styles.entryInfoTitle}>
                            <h4>
                              分录信息
                              <span className={styles.redColor}>
                                （{index + 1}）
                              </span>
                            </h4>
                            <div>
                              <Button
                                type="link"
                                onClick={() => {
                                  setTaxFileList([...taxFileList, []]);
                                  add();
                                }}
                              >
                                新增
                              </Button>
                              {oaForm.getFieldValue("invoiceDetails").length >
                                1 && (
                                <Button
                                  type="link"
                                  danger
                                  onClick={() => {
                                    const deleteItem = () => {
                                      const newTaxFileList = [...taxFileList];
                                      newTaxFileList.splice(index, 1);
                                      setTaxFileList(newTaxFileList);

                                      remove(field.name);

                                      oaForm.setFieldValue(
                                        "taxAmount",
                                        oaForm
                                          .getFieldValue("invoiceDetails")
                                          .reduce(
                                            (total: any, item: any) =>
                                              total + +(item?.taxAmount || 0),
                                            0
                                          )
                                      );
                                    };

                                    // 无有输入内容，直接删除
                                    if (
                                      !Object.values(
                                        oaForm.getFieldValue("invoiceDetails")[
                                          index
                                        ] || {}
                                      ).filter(item => item !== "").length
                                    ) {
                                      deleteItem();
                                      return;
                                    }

                                    Modal.confirm({
                                      icon: <ExclamationCircleOutlined />,
                                      content: "确认删除该分类信息",
                                      okText: "确认",
                                      cancelText: "取消",
                                      onOk() {
                                        deleteItem();
                                      },
                                    });
                                  }}
                                >
                                  删除
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="qp-flex">
                            <Row className={styles.row}>
                              <Col span={12} className={styles.col}>
                                <Form.Item
                                  {...field}
                                  labelCol={{ span: 8 }}
                                  label="名称"
                                  name={[field.name, "invoiceName"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "请输入名称",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="请输入名称"
                                    maxLength={30}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  {...field}
                                  labelCol={{ span: 8 }}
                                  label="纳税人识别号"
                                  name={[field.name, "identifier"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "请输入纳税人识别号",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="请输入纳税人识别号"
                                    maxLength={50}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>

                          {showInvoiceField && (
                            <>
                              <div className="qp-flex">
                                <Row className={styles.row}>
                                  <Col span={12} className={styles.col}>
                                    <Form.Item
                                      {...field}
                                      labelCol={{ span: 8 }}
                                      label="地址、电话"
                                      name={[field.name, "address"]}
                                      rules={[
                                        {
                                          required: true,
                                          message: "请输入地址、电话",
                                        },
                                      ]}
                                    >
                                      <Input
                                        placeholder="请输入地址、电话"
                                        maxLength={100}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      {...field}
                                      labelCol={{ span: 8 }}
                                      label="开户行及账号"
                                      name={[field.name, "bankAccount"]}
                                      rules={[
                                        {
                                          required: true,
                                          message: "请输入开户行及账号",
                                        },
                                      ]}
                                    >
                                      <Input
                                        placeholder="请输入开户行及账号"
                                        maxLength={100}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                              <div className={styles.fileBox}>
                                <Form.Item noStyle>
                                  <Form.Item
                                    label="一般纳税人证明"
                                    name={[field.name, "prove"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "请上传一般纳税人证明",
                                      },
                                    ]}
                                  >
                                    <RUpload
                                      action="/api/qp/perform/business/oa/upload"
                                      accept=".rar, .zip"
                                      maxCount={1}
                                      maxSize={50}
                                      specialChar
                                      fileList={taxFileList[index]}
                                      onChange={(list: UploadFile[]) =>
                                        handleChangeTaxFileList(list, index)
                                      }
                                    />
                                  </Form.Item>
                                  <div className={cs(styles.notice)}>
                                    上传文件请上传rar,zip的压缩文件
                                  </div>
                                </Form.Item>
                              </div>
                            </>
                          )}

                          <Form.Item
                            label="含税金额"
                            name={[field.name, "taxAmount"]}
                            rules={[
                              {
                                required: true,
                                message: "请输入含税金额",
                              },
                            ]}
                          >
                            <InputNumber
                              className={styles.taxAmountInput}
                              min={0}
                              precision={2}
                              onChange={handleChangeTaxAmount}
                              placeholder="请输入含税金额"
                            />
                          </Form.Item>
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              </div>

              <div className={styles.step}>
                <div className={styles.title}>发票内容</div>
                <Form.Item
                  label="货物或应税劳务、服务名称"
                  name="serviceName"
                  labelCol={{ span: 7 }}
                  rules={[
                    {
                      required: true,
                      message: "请输入货物或应税劳务、服务名称",
                    },
                  ]}
                >
                  <Input
                    maxLength={100}
                    placeholder="请输入货物或应税劳务、服务名称"
                  />
                </Form.Item>
              </div>

              <div className={styles.step}>
                <div className={styles.title}>发票金额</div>
                <Form.Item
                  label="含税金额"
                  name="taxAmount"
                  rules={[
                    {
                      required: true,
                      message: "请输入含税金额",
                    },
                  ]}
                >
                  <InputNumber
                    className={styles.taxAmountInput}
                    min={0}
                    precision={2}
                    placeholder="请输入含税金额"
                  />
                </Form.Item>
              </div>

              <div className={styles.step}>
                <div className={styles.title}>规格型号及其他要求</div>
                <Form.Item
                  label="规格型号及其他要求"
                  labelCol={{ span: 5 }}
                  name="requirementFlag"
                  rules={[
                    {
                      required: true,
                      message: "请选择是否有规格型号及其他要求",
                    },
                  ]}
                >
                  <Radio.Group onChange={handleChangeRequirementFlag}>
                    <Radio value="是">是</Radio>
                    <Radio value="否">否</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              <Form.Item label="合同编号" name="contractNum">
                <Input placeholder="请输入合同编号" maxLength={50} />
              </Form.Item>

              <Form.Item label="关联合同流程" name="linkFlow">
                <div className="qp-flex">
                  {!!(processInfo || []).length && (
                    <div className="m-r-6">
                      {processInfo.map((item, index) => (
                        <p key={item.businessKey}>
                          <span>{item.businessKey}</span>
                          <Button
                            type="link"
                            danger
                            onClick={() => handleDeleteProcessItemInfo(index)}
                          >
                            删除
                          </Button>
                        </p>
                      ))}
                    </div>
                  )}
                  <div>
                    <Button
                      className="m-r-6"
                      onClick={() => setShowAssociatedProcessModal(true)}
                    >
                      {!!(processInfo || []).length && "修改"}关联流程
                    </Button>
                    <span className={styles.notice}>
                      如有就必须关联相关的合同申请单
                    </span>
                  </div>
                </div>
              </Form.Item>

              {showRequirementField && (
                <Form.Item
                  label="对方要求"
                  name="requirement"
                  rules={[
                    {
                      required: true,
                      message: "请输入对方要求",
                    },
                  ]}
                >
                  <TextArea placeholder="请输入对方要求" />
                </Form.Item>
              )}

              <div className={styles.fileBox}>
                <Form.Item noStyle>
                  <Form.Item
                    label="对账文件"
                    name="fileUrl"
                    rules={[
                      {
                        required: true,
                        message: "请上传对账文件",
                      },
                    ]}
                  >
                    <RUpload
                      action="/api/qp/perform/business/oa/upload"
                      accept=".rar, .zip"
                      maxCount={1}
                      maxSize={50}
                      specialChar
                      fileList={fileList}
                      onChange={handleChangeFileList}
                    />
                  </Form.Item>

                  <div className={cs(styles.notice)}>
                    注意：上传文件请上传rar,zip的压缩文件，附件应包含双方盖章的电子合同扫描件、结算单等
                  </div>
                </Form.Item>
              </div>

              <Form.Item label="备注" name="invoiceRemark">
                <TextArea placeholder="请输入备注" />
              </Form.Item>

              <div className={cs("m-b-24 m-t-24", styles.footer)}>
                <Button className="m-r-6" type="primary" onClick={handleSubmit}>
                  提交申请
                </Button>
                <Button className="m-r-6" onClick={() => window.history.back()}>
                  取消
                </Button>
              </div>
            </Form>
          </div>
          <div className={styles.description}>
            <h4 className={styles.title}>流程描述</h4>
          </div>
        </div>

        {showAssociatedProcessModal && (
          <AssociatedProcessModal
            show={showAssociatedProcessModal}
            dataList={(costcenterInfoList || []).map(item => {
              const newItem = { ...item };
              newItem.value = newItem.userId;
              return newItem;
            })}
            select={processInfo || []}
            onClose={() => setShowAssociatedProcessModal(false)}
            onSubmit={handleChooseProcess}
          />
        )}
      </ConfigProvider>
    </Spin>
  );
};

export default OaInvoiceApply;

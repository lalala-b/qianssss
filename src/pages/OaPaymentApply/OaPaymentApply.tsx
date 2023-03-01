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
  DatePicker,
  ConfigProvider,
  UploadFile,
  message,
} from "antd";
import type { RadioChangeEvent } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { GlobalContext } from "src/contexts/global";
import RangePicker from "src/components/RangePicker";
import BSelect from "src/components/BigDataSelect";
import RUpload from "src/components/Upload";
import { getUrlQuery } from "src/utils/getUrlQuery";
import { smalltoBIG } from "src/utils/number";
import {
  $getCostcenterInfoList,
  GetCostcenterInfoResItemType,
  GetSupplierListItemType,
  GetContractProcessListItemType,
  $getCompanyList,
  GetCompanyListItemType,
  $getCostcenterByName,
  GetCostcenterByNameResType,
  $paymentApply,
  PaymentApplyParamsType,
} from "src/api/oaPaymentApply";
import ChooseSupplierModal from "./ChooseSupplierModal";
import AssociatedProcessModal from "./AssociatedProcessModal";
import styles from "./OaPaymentApply.scss";

const { TextArea } = Input;
const { Option } = Select;

const COST_NAME_ARR = [
  "新媒体平台充值费用",
  "互联网媒体广告费用",
  "公关费",
  "品牌推广费",
  "新媒体广告费",
];
const BUDGET_RANGE_ARR = ["预算内", "预算外"];
const SHARE_BASE_ARR = [
  "按实际使用（请附使用明细）",
  "按成本中心人数",
  "按流量",
  "其他",
];
const BUSINESS_TYPE_ARR = ["线上渠道类", "品牌公关类", "新媒体"];
const CLAUSE_ARR = ["时间", "效果", "排期", "其他"];

const OaPaymentApply = () => {
  const [oaForm] = Form.useForm();

  const { globalData = {} } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);
  const [incomeDept, setIncomeDept] = useState<number | undefined>();
  const [incomeDeptName, setIncomeDeptName] = useState("");
  const [costcenterInfoList, setCostcenterInfoList] = useState<
    GetCostcenterInfoResItemType[]
  >([]);
  const [contractRequired, setContractRequired] = useState(true);
  const [showChooseSupplierModal, setShowChooseSupplierModal] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState<GetSupplierListItemType>();

  const [showAssociatedProcessModal, setShowAssociatedProcessModal] =
    useState(false);
  const [processInfo, setProcessInfo] = useState<
    GetContractProcessListItemType[]
  >([]);
  const [bigMoney, setBigMoney] = useState("");
  const [companyList, setCompanyList] = useState<GetCompanyListItemType[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [applyInfo, setApplyInfo] = useState<GetCostcenterByNameResType>();

  const handleChangePaymentAmount = (e: number) => {
    setBigMoney(smalltoBIG(e));
  };

  const getCostcenterByName = async () => {
    const res = await $getCostcenterByName({
      userName:
        globalData?.user?.userInfo?.email.substr(
          0,
          globalData?.user?.userInfo?.email.indexOf("@")
        ) || globalData?.user?.userInfo.name,
    });
    const info: GetCostcenterByNameResType = JSON.parse(res);
    oaForm.setFieldValue('incomeDept', info?.userId)
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

  const handleChangeHasContract = (e: RadioChangeEvent) => {
    setContractRequired(e.target.value === "是");
    if (e.target.value === "否") {
      oaForm.validateFields([
        "contractAmount",
        "contractPeriodTime",
        "supplierName",
        "settlementClause",
      ]);
    }
  };

  const handleChooseSupplier = (selectRow: GetSupplierListItemType) => {
    setSupplierInfo(selectRow);
    setShowChooseSupplierModal(false);
    oaForm.setFieldValue("supplierName", selectRow.supplierName);
    oaForm.setFieldValue("payeeName", selectRow.supplierName);
    oaForm.setFieldValue(
      "payeeArea",
      [selectRow.province, selectRow.city].filter(item => item).join("/")
    );
    oaForm.setFieldValue(
      "bank",
      [selectRow.bank, selectRow.branchBank].filter(item => item).join("-")
    );
    oaForm.setFieldValue("bankAccount", selectRow.bankAccount);
    oaForm.validateFields(["supplierName"]);
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

  const handleSubmit = async () => {
    await oaForm.validateFields();

    const {
      contractPeriodTime,
      payeeArea,
      bank,
      benefitPeriodTime,
      companyId,
      receiptInvoiceDate,
      paymentDate,
    } = oaForm.getFieldsValue();

    const leftIndex = incomeDeptName.indexOf("(");
    const rightIndex = incomeDeptName.indexOf(")");

    const newIncomeDeptName = `${incomeDeptName.slice(
      leftIndex + 1,
      rightIndex
    )}(${incomeDeptName.slice(0, leftIndex).replace(/[a-zA-Z0-9]/g, "")})`;

    // 
    if (newIncomeDeptName === '()') {
      message.error('受益部门异常')
      return
    }

    const params: PaymentApplyParamsType = {
      ...oaForm.getFieldsValue(),
      incomeDept: newIncomeDeptName,
      contractPeriodBegin: contractPeriodTime?.[0]
        ? moment(contractPeriodTime[0]).format("YYYY-MM-DD")
        : "",
      contractPeriodEnd: contractPeriodTime?.[1]
        ? moment(contractPeriodTime[1]).format("YYYY-MM-DD")
        : "",
      payeeProvince: payeeArea?.split("/")[0] || "",
      payeeCity: payeeArea?.split("/")[1] || "",
      headOffice: bank?.split("-")[0] || "",
      subbranchBank: bank?.split("-")[1] || "",
      benefitPeriodBegin: benefitPeriodTime?.[0]
        ? moment(benefitPeriodTime[0]).format("YYYY-MM-DD")
        : "",
      benefitPeriodEnd: benefitPeriodTime?.[1]
        ? moment(benefitPeriodTime[1]).format("YYYY-MM-DD")
        : "",
      company:
        companyList.find(item => item.companyCode === companyId)?.companyName ||
        "",
      receiptInvoiceDate: receiptInvoiceDate
        ? moment(receiptInvoiceDate).format("YYYY-MM-DD")
        : "",
      linkFlow:
        (processInfo || [])
          .map(item => [item.instanceId, item.businessKey].join(","))
          .join(";") || "",
      supplierId: supplierInfo?.supplierId || "",
      paymentDate: paymentDate ? moment(paymentDate).format("YYYY-MM-DD") : "",
      fileUrl: fileList[0]?.url || "",
      toType: getUrlQuery()?.type || 0,
      businessOrderId: getUrlQuery()?.businessId || "",
      userName: applyInfo?.userName,
      userId: applyInfo?.userId,
    };

    try {
      setLoading(true);
      await $paymentApply(params);
      message.success("申请成功");
      window.history.back();
      setLoading(false);
    } catch (e: any) {
      message.error(e.message || "申请失败，请重试");
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((costcenterInfoList || []).length && Object.keys(applyInfo || {}).length) {
      setIncomeDeptName(
        costcenterInfoList.find(item => item.userId === applyInfo?.userId)
          ?.label || ""
      );
    }
  }, [costcenterInfoList, applyInfo])

  useEffect(() => {
    const pay = localStorage.getItem("paymentAmount");
    if (pay) {
      oaForm.setFieldValue("paymentAmount", pay);
      handleChangePaymentAmount(+(pay || 0));
    }

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
        <h2>广告费及新媒体付款审批单</h2>
        <h4 className={styles.notice}>
          注意：每月费用请在本季度报销，跨季度费用将不予报销
        </h4>
        <div className={styles.container}>
          <div className={cs("q-wrap", styles.wrapper)}>
            <Form
              form={oaForm}
              labelAlign="left"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              initialValues={{
                hadContract: "是",
                incomeDept: applyInfo?.userId,
                shareBase: SHARE_BASE_ARR[0],
                settlementClause: CLAUSE_ARR[0],
              }}
              // onFinish={onFinish}
              // onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="支出事由"
                name="paymentReason"
                rules={[{ required: true, message: "请输入支出事由" }]}
              >
                <TextArea maxLength={100} placeholder="请输入支出事由" />
              </Form.Item>

              <Form.Item label="内部备注" name="insideRemark">
                <TextArea maxLength={100} placeholder="请输入内容备注" />
              </Form.Item>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="费用名称"
                    name="paymentName"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请选择费用名称" }]}
                  >
                    <Select placeholder="请选择费用名称">
                      {COST_NAME_ARR.map(item => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="预算范围"
                    name="paymentScope"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请选择预算范围" }]}
                  >
                    <Select placeholder="请选择预算范围">
                      {BUDGET_RANGE_ARR.map(item => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* <Form.Item> */}
              <div className={styles.incomeBox}>
                <Form.Item
                  label="受益部门"
                  name="incomeDept"
                  rules={[{ required: true, message: "请选择受益部门" }]}
                >
                  <BSelect
                    className={styles.incomeSelect}
                    placeholder="请选择受益部门，可通过搜索员工转转OA名称进行选择"
                    fieldNames={{
                      label: "label",
                      value: "userId",
                    }}
                    value={incomeDept}
                    dataList={(costcenterInfoList || []).map(item => {
                      const newItem = { ...item };
                      newItem.value = newItem.userId;
                      return newItem;
                    })}
                    scrollPageSize={50}
                    onChange={(value: number) => {
                      setIncomeDept(value);
                      console.info(
                        "-----sss",
                        costcenterInfoList.find(
                          item => item.userId === String(value)
                        )?.label || ""
                      );
                      setIncomeDeptName(
                        costcenterInfoList.find(
                          item => item.userId === String(value)
                        )?.label || ""
                      );
                      oaForm.setFieldValue("incomeDept", value);
                      oaForm.validateFields(["incomeDept"]);
                    }}
                  />
                </Form.Item>
                <span className={styles.incomeTip}>
                  可通过搜索员工转转OA名称进行选择
                </span>
              </div>
              {/* </Form.Item> */}

              <Form.Item
                label="费用分摊基础"
                name="shareBase"
                rules={[{ required: true, message: "请选择费用分摊基础" }]}
              >
                <Radio.Group>
                  {SHARE_BASE_ARR.map(item => (
                    <Radio key={item} value={item}>
                      {item}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item label="分摊备注" name="shareRemark">
                <TextArea maxLength={100} placeholder="请输入内容备注" />
              </Form.Item>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="已签署合同"
                    name="hadContract"
                    labelCol={{ span: 8 }}
                    rules={[
                      { required: true, message: "请选择是否已签署合同" },
                    ]}
                  >
                    <Radio.Group onChange={handleChangeHasContract}>
                      <Radio value="是">是</Radio>
                      <Radio value="否">否</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="业务类型"
                    name="businessType"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请选择业务类型" }]}
                  >
                    <Select placeholder="请选择业务类型">
                      {BUSINESS_TYPE_ARR.map(item => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="合同金额"
                    name="contractAmount"
                    labelCol={{ span: 8 }}
                    rules={[
                      { required: contractRequired, message: "请输入合同金额" },
                    ]}
                  >
                    <InputNumber addonAfter="元" placeholder="请输入合同金额" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="合同执行期"
                    name="contractPeriodTime"
                    labelCol={{ span: 8 }}
                    rules={[
                      {
                        required: contractRequired,
                        message: "请选择合同执行期",
                      },
                    ]}
                  >
                    <RangePicker />
                  </Form.Item>
                </Col>
              </Row>
              {/* 
              <Form.Item
                label="合同编码"
                name="contractNo"
                rules={[
                  { required: contractRequired, message: "请输入合同编码" },
                ]}
              >
                <Input placeholder="请输入合同编码" />
              </Form.Item> */}

              <Form.Item
                label="供应商全称"
                name="supplierName"
                rules={[
                  { required: contractRequired, message: "请选择供应商" },
                ]}
              >
                {supplierInfo?.supplierName && (
                  <span className="m-r-6">{supplierInfo?.supplierName}</span>
                )}
                <Button
                  className="m-r-6"
                  onClick={() => setShowChooseSupplierModal(true)}
                >
                  {supplierInfo?.supplierName ? "修改" : "选择"}供应商
                </Button>
                <span className={styles.notice}>（注：非内网请登录VPN）</span>
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

              <Form.Item
                label="主要结算条款"
                name="settlementClause"
                rules={[
                  { required: contractRequired, message: "请选择主要结算条款" },
                ]}
              >
                <Radio.Group>
                  {CLAUSE_ARR.map(item => (
                    <Radio key={item} value={item}>
                      {item}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item label="结算条款备注" name="settlementRemark">
                <TextArea maxLength={100} placeholder="请输入结算条款备注" />
              </Form.Item>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="合作方联系人"
                    name="partnerContact"
                    labelCol={{ span: 8 }}
                  >
                    <Input maxLength={15} placeholder="请输入合作方联系人" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="联系方式"
                    name="partnerContactTel"
                    labelCol={{ span: 8 }}
                  >
                    <Input maxLength={20} placeholder="请输入联系方式" />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="收款人姓名"
                    name="payeeName"
                    labelCol={{ span: 8 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="收款账号城市"
                    name="payeeArea"
                    labelCol={{ span: 8 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="收款银行信息" name="bank">
                <Input disabled />
              </Form.Item>

              <Row>
                <Col span={12} className={styles.col}>
                  {/* <Form.Item> */}
                  <Form.Item
                    label="银行账号"
                    name="bankAccount"
                    labelCol={{ span: 8 }}
                  >
                    <Input className="m-b-24" disabled />
                    {/* </Form.Item> */}
                  </Form.Item>
                  <span className={cs(styles.bankAccountNotice, styles.notice)}>
                    若账号有误请修改供应商信息
                  </span>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="受益期间"
                    name="benefitPeriodTime"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请选择受益期间" }]}
                  >
                    <RangePicker
                      className="m-b-24"
                      style={{ position: "relative", top: "12px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="付款金额"
                    name="paymentAmount"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请输入付款金额" }]}
                  >
                    <InputNumber
                      placeholder="请输入付款金额"
                      style={{ width: "100%" }}
                      min={0}
                      precision={2}
                      onChange={handleChangePaymentAmount}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="大写"
                    name="bigMoney"
                    labelCol={{ span: 8 }}
                  >
                    {bigMoney}
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12} className={styles.col}>
                  <Form.Item
                    label="申请人"
                    name="applyName"
                    labelCol={{ span: 8 }}
                  >
                    {`${applyInfo?.realName || ""}（${
                      applyInfo?.userName || ""
                    }）`}
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
                    label="所属公司"
                    name="companyId"
                    labelCol={{ span: 8 }}
                    rules={[{ required: true, message: "请选择所属公司" }]}
                  >
                    <Select
                      placeholder="请选择所属公司"
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
                    label="预计付款日期"
                    name="paymentDate"
                    labelCol={{ span: 8 }}
                  >
                    <DatePicker />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="收到发票日期"
                name="receiptInvoiceDate"
                rules={[{ required: true, message: "请选择收到发票日期" }]}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item label="附件内容" name="fileUrl">
                <RUpload
                  action="/api/qp/perform/business/oa/upload"
                  accept=".rar, .zip"
                  maxCount={1}
                  maxSize={50}
                  specialChar
                  fileList={fileList}
                  onChange={handleChangeFileList}
                />
                <div className={cs(styles.notice, "m-t-6")}>
                  注意：上传文件请上传rar,zip的压缩文件，附件应包含双方盖章的电子合同扫描件、结算单等
                </div>
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
            <div>
              广告费用付款审批单是公司用于线上线下广告投放费用支付的申请审批流程。流程发起后由各成本中心相关负责人审批后，由财务出纳支付相关费用。
              <br />
              <br />
              在流程审批到财务经理节点时，发起需要将其对应的相关合同或发票线下提交一同审批。
              <br />
              <br />
              财务受理后1-2个工作日内付款。 <br />
              <br />
              天津转转线下付款所需材料： <br />
              1. 发票 <br />
              2. 发票复印件2份 <br />
              3. 合同复印件（注：如为补充协议，请补充主合同） <br />
              4.
              结算单（注：若付款金额与发票、合同内不一致，包含合同内没约定总金额的情况）
              <br />
              PS：应银行要求，天津转转付款时， 因需过审
              <br />
              <span className={styles.notice}>请勿将发票粘贴在粘贴单上</span>
              <br />
              合同及发票请使用复印件，而非扫描后打印件
            </div>
          </div>
        </div>

        {showChooseSupplierModal && (
          <ChooseSupplierModal
            show={showChooseSupplierModal}
            select={(supplierInfo || {}) as GetSupplierListItemType}
            onClose={() => setShowChooseSupplierModal(false)}
            onSubmit={handleChooseSupplier}
          />
        )}

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

export default OaPaymentApply;

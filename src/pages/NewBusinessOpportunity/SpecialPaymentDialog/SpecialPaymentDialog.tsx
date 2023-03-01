/* eslint-disable camelcase */
import { useState, useEffect } from "react";
import moment from "moment";
import cs from "classnames";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Select,
  Cascader,
  Input,
  InputNumber,
  DatePicker,
  message,
} from "antd";
import {
  BussinessOpportunityDetailResType,
  $getByDictType,
  GetSpecialChargeDetail,
  $getChargePlatList,
  $getSpecialChargeDetail,
  $getTotalRebatePrice,
  $specialChargeSave,
} from "src/api/business";
import { $getBelongOrgTree } from "src/api/work";
import SpecialSetRebateDialog from "../SpecialSetRebateDialog";
import styles from "./SpecialPaymentDialog.scss";

const { Option } = Select;
const { TextArea } = Input;

interface SpecialPaymentDialogPropsType {
  specialType: string;
  show: boolean;
  opDetail?: BussinessOpportunityDetailResType;
  isFinance: boolean;
  chargeId: number;
  opId?: number | string;
  onClose: () => void;
  onChangeSpecialType: (value: string) => void;
  onGetList: () => void;
}

const FINISH_STATUS_ARR = [
  {
    id: 10,
    label: "已完成",
  },
  {
    id: 20,
    label: "未完成",
  },
];

const PAY_TYPE_ARR = [
  {
    id: 1,
    label: "向达人付款",
  },
  {
    id: 2,
    label: "向达人收款",
  },
];

const SpecialPaymentDialog: React.FC<SpecialPaymentDialogPropsType> = ({
  specialType,
  show,
  opDetail,
  chargeId,
  opId,
  onClose,
  onChangeSpecialType,
  onGetList,
}) => {
  const {
    businessGroupName,
    chargerName,
    brandName,
    coProduct,
    coCateName,
    opNo,
    busOrderNo,
    opStatus,
  } = opDetail || {};

  const [form] = Form.useForm();

  const [specialModalLoading, setSpecialModalLoading] = useState(false);
  const [requiredRemark, setRequiredRemark] = useState(false);
  const [requiredPactFinishDate, setRequiredPactFinishDate] = useState(false);
  const [paymentArr, setPaymentArr] = useState<
    { dictLabel: string; dictValue: string }[]
  >([]);
  const [relateGroupArr, setRelateGroupArr] = useState<any[]>([]);
  const [createUserArr, setCreateUserArr] = useState<
    { id: number; orgName: string }[]
  >([]);
  const [platList, setPlatList] = useState<
    { platId: number; platName: string }[]
  >([]);
  // 商务实际营收
  const [businessRevenue, setBusinessRevenue] = useState(0);
  // 绩效营收
  const [performanceMoney, setPerformanceMoney] = useState(0);
  // 销售成本
  const [costOfSales, setCostOfSales] = useState(0);
  // 销售收入
  const [saleIncome, setSaleIncome] = useState(0);
  // 收付款类型
  const [paymentType, setPaymentType] = useState<number | undefined>(undefined);
  const [speicalChargeDetail, setSpeicalChargeDetail] =
    useState<GetSpecialChargeDetail>();
  const [showRebateModal, setShowRebateModal] = useState(false);
  const [totalRebate, setTotalRebate] = useState(0);

  const getSpecialChargeDetail = async (specialId: number) => {
    if (!specialId) return;
    const res = await $getSpecialChargeDetail({ chargeId: specialId });
    setSpeicalChargeDetail(res);

    form.setFieldsValue({
      ...res,
      pactFinishDate: res.pactFinishDate ? moment(res.pactFinishDate) : "",
      chargeType: String(res.chargeType),
      createUserId: res.createUserId === 0 ? "" : res.createUserId,
    });

    for (let i = 0; i < relateGroupArr.length; i += 1) {
      for (let j = 0; j < relateGroupArr[i].children.length; j += 1) {
        const current = relateGroupArr[i].children.find(
          (item: any) => +item.id === +res.relateGroup3th
        );
        if (current) {
          form.setFieldValue("relateGroup3th", [current.parentId, current.id]);
          break;
        }
      }
    }

    setBusinessRevenue(res.businessRevenue);
    setCostOfSales(res.saleCost);
    setPerformanceMoney(res.performanceMoney);
    setSaleIncome(res.saleIncome);
    setPaymentType(res.paymentType || undefined);
  };

  const handleChangeChargeType = (val: number) => {
    // 选择其他了 备注必填
    if (+val === 140) {
      setRequiredRemark(true);
    } else {
      setRequiredRemark(false);
      form.validateFields(["remark"]);
    }
  };

  const handleChangeFinishStatus = (val: number) => {
    form.setFieldValue('pactFinishDate', '')
    // 履约状态选择已完成  履约完成时间必填
    if (val === 10) {
      setRequiredPactFinishDate(true);
    } else {
      setRequiredPactFinishDate(false);
      form.validateFields(["pactFinishDate"]);
    }
  };

  const getByDictType = async () => {
    const { oppotunity_special_charge_type } = await $getByDictType({
      dictTypes: ["oppotunity_special_charge_type"],
    });
    setPaymentArr(oppotunity_special_charge_type);
  };

  const filterCreateUser = (children: any[]) => {
    const arr: any = [];
    children.forEach(item => {
      if (+item.userFlag === 1) {
        arr.push(item);
      }

      if (item.childOrgList) {
        arr.push(filterCreateUser(item.childOrgList));
      }
    });
    return arr;
  };

  const getBelongOrgTree = async () => {
    const res = await $getBelongOrgTree();
    setRelateGroupArr(
      res.map(item => {
        const newItem: any = { ...item };
        newItem.children = newItem.childOrgList
          .map((it: any) => {
            if (+it.depthLayer === 3 && +it.userFlag === 0) {
              return it;
            }
            return "";
          })
          .filter((item: any) => item);
        return newItem;
      })
    );

    const arr = filterCreateUser(res);
    setCreateUserArr(arr.flat(Infinity));
  };

  const getChargePlatList = async () => {
    const res = await $getChargePlatList();
    setPlatList(res);
  };

  const handleChangeSaleIncome = (val: number) => {
    const businessRevenue =
      +(val || 0) -
      +(form.getFieldValue("rebateCorporate") || 0) -
      +(form.getFieldValue("rebatePrivate") || 0);
    setBusinessRevenue(+Number(businessRevenue).toFixed(2));

    // 绩效营收=销售收入-达人分成成本-对公返款-对私返款
    const performanceMoney =
      +(form.getFieldValue("saleIncome") || 0) -
      +(form.getFieldValue("darenOutMoney") || 0) -
      +(form.getFieldValue("rebateCorporate") || 0) -
      +(form.getFieldValue("rebatePrivate") || 0);
    setPerformanceMoney(+Number(performanceMoney).toFixed(2));

    setSaleIncome(val);
  };

  const handleChangeOther = () => {
    // 绩效营收=销售收入-达人分成成本-对公返款-对私返款
    const performanceMoney =
      +(form.getFieldValue("saleIncome") || 0) -
      +(form.getFieldValue("darenOutMoney") || 0) -
      +(form.getFieldValue("rebateCorporate") || 0) -
      +(form.getFieldValue("rebatePrivate") || 0);
    setPerformanceMoney(+Number(performanceMoney).toFixed(2));
  };

  const handleChangeRebateCorporate = (val: number) => {
    const businessRevenue =
      +(form.getFieldValue("saleIncome") || 0) -
      +(val || 0) -
      +(form.getFieldValue("rebatePrivate") || 0);
    setBusinessRevenue(+Number(businessRevenue).toFixed(2));

    const costOfSales =
      +(val || 0) + +(form.getFieldValue("rebatePrivate") || 0);
    setCostOfSales(+Number(costOfSales).toFixed(2));

    // 绩效营收=销售收入-达人分成成本-对公返款-对私返款
    const performanceMoney =
      +(form.getFieldValue("saleIncome") || 0) -
      +(form.getFieldValue("darenOutMoney") || 0) -
      +(form.getFieldValue("rebateCorporate") || 0) -
      +(form.getFieldValue("rebatePrivate") || 0);
    setPerformanceMoney(+Number(performanceMoney).toFixed(2));
  };

  const handleChangeRebatePrivate = (val: number) => {
    const businessRevenue =
      +(form.getFieldValue("saleIncome") || 0) -
      +(form.getFieldValue("rebateCorporate") || 0) -
      +(val || 0);
    setBusinessRevenue(+Number(businessRevenue).toFixed(2));

    const costOfSales =
      +(val || 0) + +(form.getFieldValue("rebateCorporate") || 0);
    setCostOfSales(+Number(costOfSales).toFixed(2));

    // 绩效营收=销售收入-达人分成成本-对公返款-对私返款
    const performanceMoney =
      +(form.getFieldValue("saleIncome") || 0) -
      +(form.getFieldValue("darenOutMoney") || 0) -
      +(form.getFieldValue("rebateCorporate") || 0) -
      +(form.getFieldValue("rebatePrivate") || 0);
    setPerformanceMoney(+Number(performanceMoney).toFixed(2));
  };

  const handleChangePaymentType = (val: number | undefined) => {
    setPaymentType(val);
    form.setFieldValue('collectionMoney', 0)
  };

  const getConfirmParams = () => {
    const params = {
      ...form.getFieldsValue(),
      relateGroup3th:
        form.getFieldValue("relateGroup3th")[
          form.getFieldValue("relateGroup3th").length - 1
        ],
      pactFinishDate: form.getFieldValue("pactFinishDate")
        ? moment(form.getFieldValue("pactFinishDate")).format("YYYY-MM-DD")
        : "",
      opId: Number(opId),
    };

    // 特殊收支id
    if (specialType === "edit") {
      params.id = speicalChargeDetail?.id;
    }

    return params;
  };

  const handleConfirm = async () => {
    await form.validateFields();

    if (
      requiredRemark &&
      !form.getFieldValue("remark").replace(/(^\s*)|(\s*$)/g, "")
    ) {
      message.error("请输入备注");
      return;
    }

    setSpecialModalLoading(true);

    const params = getConfirmParams();

    // 5为确认合作，仅在确认合作时 需要判断相关价格是否变动
    if (Number(opStatus) === 5) {
      const res = await $getTotalRebatePrice({
        opId: Number(opId),
        rebatePrivate: form.getFieldValue("rebatePrivate"),
        rebateCorporate: form.getFieldValue("rebateCorporate"),
        curId: chargeId,
      });

      // 等于0说明没变化, 直接提交
      if (+res === 0) {
        try {
          await $specialChargeSave(params);
          message.success(`${specialType === "edit" ? "编辑" : "新增"}成功`);
          setSpecialModalLoading(false);
          onChangeSpecialType("");
          onGetList();
          onClose();
        } catch (e: any) {
          setSpecialModalLoading(false);
          message.error(e.message);
        }
        return;
      }
      setTotalRebate(res);
      setShowRebateModal(true);
      setSpecialModalLoading(false);
      return;
    }

    try {
      await $specialChargeSave(params);
      message.success(`${specialType === "edit" ? "编辑" : "新增"}成功`);
      setSpecialModalLoading(false);
      onChangeSpecialType("");
      onGetList();
      onClose();
    } catch (e: any) {
      setSpecialModalLoading(false);
      message.error(e.message);
    }
  };

  useEffect(() => {
    if (!show) {
      onChangeSpecialType("");
      form.resetFields();
      setSpeicalChargeDetail(undefined);
      setBusinessRevenue(0);
      setCostOfSales(0);
      setPerformanceMoney(0);
      setSaleIncome(0);
      setPaymentType(undefined);
    }
  }, [show]);

  useEffect(() => {
    if (specialType !== "add" && specialType) {
      getSpecialChargeDetail(chargeId);
    } else if (specialType === "add") {
      form.resetFields();
      setSpeicalChargeDetail(undefined);
      setBusinessRevenue(0);
      setCostOfSales(0);
      setPerformanceMoney(0);
      setSaleIncome(0);
      setPaymentType(undefined);
    }
  }, [specialType]);

  useEffect(() => {
    getByDictType();
    getBelongOrgTree();
    getChargePlatList();

    return () => {
      //
    };
  }, []);

  return (
    <>
      <Modal
        width="900px"
        title={
          specialType === "add"
            ? "添加特殊收支"
            : specialType === "edit"
            ? "编辑特殊收支"
            : specialType === "view"
            ? "查看特殊收支"
            : ""
        }
        visible={show}
        maskClosable={false}
        footer={[
          <Button key={1} onClick={onClose}>
            取消
          </Button>,
          specialType !== "view" && (
            <Button
              type="primary"
              key={2}
              loading={specialModalLoading}
              onClick={handleConfirm}
            >
              确认
            </Button>
          ),
        ]}
        onCancel={onClose}
      >
        <Form
          labelCol={{ span: 8 }}
          form={form}
          disabled={specialType === "view"}
          initialValues={{
            saleIncome: 0,
            darenOutMoney: 0,
            cusOfflineSupplement: 0,
            rebateCorporate: 0,
            rebatePrivate: 0,
            finishStatus: 20,
            collectionMoney: 0,
          }}
        >
          <Row>
            <Col span={24}>
              <h3 className={styles.title}>商机信息</h3>
            </Col>
            <Col span={12}>
              <Form.Item label="商务团队">
                {businessGroupName || "--"}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="商机负责人">{chargerName || "--"}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="品牌">{brandName || "--"}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="产品品类">{coCateName || "--"}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="产品">{coProduct || "--"}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="商机号">{opNo || "--"}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="商单号">{busOrderNo || "--"}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="工单号">
                {speicalChargeDetail?.orderNo || "--"}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label="收支类型"
                name="chargeType"
                rules={[{ required: true, message: "请选择收支类型" }]}
              >
                <Select
                  placeholder="请选择收支类型"
                  allowClear
                  onChange={handleChangeChargeType}
                >
                  {paymentArr.map(({ dictValue, dictLabel }) => (
                    <Option key={dictValue} value={dictValue}>
                      {dictLabel}
                    </Option>
                  ))}
                  {/* < */}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="相关团队"
                name="relateGroup3th"
                rules={[{ required: true, message: "请选择相关团队" }]}
              >
                <Cascader
                  allowClear
                  placeholder="请选择和此收支相关的团队"
                  fieldNames={{ label: "orgName", value: "id" }}
                  options={relateGroupArr}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="创作者" name="createUserId">
                <Select
                  showSearch
                  allowClear
                  placeholder="请选择创作者"
                  options={createUserArr}
                  fieldNames={{ label: "orgName", value: "id" }}
                  filterOption={(input, option) =>
                    (option?.orgName ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="平台"
                name="platId"
                rules={[{ required: true, message: "请选择平台" }]}
              >
                <Select placeholder="请选择平台" allowClear>
                  {platList.map(({ platId, platName }) => (
                    <Option key={platId} value={platId}>
                      {platName}
                    </Option>
                  ))}
                  {/* < */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="账号"
                name="accountName"
                rules={[{ required: true, message: "请输入账号名称" }]}
              >
                <Input
                  maxLength={15}
                  placeholder="请输入相关的账号名称，没有则填“无”"
                />
              </Form.Item>
            </Col>

            <Col span={12} />

            <Col span={12}>
              <Form.Item
                label="备注"
                name="remark"
                rules={[{ required: requiredRemark, message: "请输入备注" }]}
              >
                <TextArea
                  placeholder="请输入和该收支相关的补充信息，便于财务核账"
                  maxLength={100}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          <Row className="m-t-24">
            <Col span={11}>
              <div className={styles.incomeBox}>
                <h3 className={styles.title}>客户侧收支情况</h3>
                <Row>
                  <Col span={24}>
                    <div className={styles.statisticsBox}>
                      <Col span={24}>
                        <Form.Item label="线下应收" name="cusOfflineSupplement">
                          <InputNumber min={0} precision={2} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          label="线下应付"
                          name="collectMoney"
                          tooltip="线下应付=对公返款+对私返款"
                        >
                          ¥{costOfSales}
                        </Form.Item>
                      </Col>
                    </div>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="销售收入" name="saleIncome">
                      <InputNumber
                        min={0}
                        precision={2}
                        onChange={handleChangeSaleIncome}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="对公返款" name="rebateCorporate">
                      <InputNumber
                        min={0}
                        precision={2}
                        onChange={handleChangeRebateCorporate}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="对私返款" name="rebatePrivate">
                      <InputNumber
                        min={0}
                        precision={2}
                        onChange={handleChangeRebatePrivate}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col span={11} offset={2}>
              <div className={styles.incomeBox}>
                <h3 className={styles.title}>达人侧收支情况</h3>
                <Row>
                  <Col span={24}>
                    <div className={styles.statisticsBox}>
                      <Col span={24}>
                        <Form.Item label="收付款类型" name="paymentType">
                          <Select
                            placeholder="请选择收付款类型"
                            allowClear
                            onChange={handleChangePaymentType}
                          >
                            {PAY_TYPE_ARR.map(({ id, label }) => (
                              <Option key={id} value={id}>
                                {label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      {!!paymentType && (
                        <Col span={24}>
                          <Form.Item
                            label={`${paymentType === 1 ? "应付" : "应收"}金额`}
                            name="collectionMoney"
                            rules={[
                              {
                                required: true,
                                message: `请输入${
                                  paymentType === 1 ? "应付" : "应收"
                                }金额`,
                              },
                            ]}
                          >
                            <InputNumber min={0} precision={2} />
                          </Form.Item>
                        </Col>
                      )}
                    </div>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="达人分成成本" name="darenOutMoney">
                      <InputNumber
                        min={0}
                        precision={2}
                        onChange={handleChangeOther}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          <div className={cs(styles.incomeBox, "m-t-24")}>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="商务实际营收"
                  tooltip="商务实际营收=销售收入-对公返款-对私返款"
                >
                  ¥{businessRevenue}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="绩效营收"
                  tooltip="绩效营收=销售收入-销售成本-达人成本"
                >
                  ¥{performanceMoney}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="销售收入" tooltip="销售收入=销售收入">
                  ¥{saleIncome}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="销售成本" tooltip="销售成本=线下应付">
                  ¥{costOfSales}
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Row className="m-t-24">
            <Col span={12}>
              <Form.Item label="履约状态" name="finishStatus">
                <Select onChange={handleChangeFinishStatus}>
                  {FINISH_STATUS_ARR.map(({ id, label }) => (
                    <Option key={id} value={id}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {requiredPactFinishDate && (
              <Col span={12}>
                <Form.Item
                  label="履约完成时间"
                  name="pactFinishDate"
                  rules={[
                    {
                      required: requiredPactFinishDate,
                      message: "请选择履约完成时间",
                    },
                  ]}
                >
                  <DatePicker placeholder="选择日期" />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>

      <SpecialSetRebateDialog
        specialType={specialType}
        show={showRebateModal}
        totalRebate={totalRebate}
        onClose={() => {
          setShowRebateModal(false);
          onClose();
        }}
        onChangeSpecialType={onChangeSpecialType}
        onGetList={onGetList}
        onGetConfirmParams={getConfirmParams}
      />
    </>
  );
};

export default SpecialPaymentDialog;

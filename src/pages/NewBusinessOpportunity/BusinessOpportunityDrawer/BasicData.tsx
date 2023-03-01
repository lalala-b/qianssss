/* eslint-disable no-lonely-if */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable no-unused-expressions */
import { useState, useEffect, useRef } from "react";
import cs from "classnames";
import {
  Tag,
  Form,
  Input,
  Button,
  Row,
  Col,
  Radio,
  Select,
  Divider,
  Space,
  Spin,
  message,
  Cascader,
  InputNumber,
  RadioChangeEvent,
  SelectProps,
  InputRef,
  UploadFile,
  Modal,
  // OnSingleChange,
  // DefaultOptionType,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  $getBrandList,
  $addBaseCustomerInfo,
  $getCustomerDetail,
  $getCoCateList,
  $createBusinessOpportunity,
  $editBusinessOpportunity,
  $getCustomerName,
  // $getCustomerTypeList,
  $getBusinessTypeList,
  // $getBusinessOppoFollowers,
  // $getOppoFromList,
  CustomerDetailResType,
  GetCoCateListItemResType,
  GetCustomerNameItemResType,
  BusinessOppoFollowersResType,
  BussinessOpportunityDetailResType,
  OppoFromListType,
} from "src/api/business";
import RangePicker from "src/components/RangePicker";
import RUpload from "src/components/Upload";
import BSelect from "src/components/BigDataSelect";
import BCascader from "src/components/BigDataCascader";
import { objEqual } from "src/utils/object";
import { getUrlQuery } from "src/utils/getUrlQuery";
import styles from "./BusinessOpportunityDrawer.scss";

const { Option } = Select;
const { TextArea } = Input;

interface BasicDataPropsType {
  id?: number | string;
  type: DrawerType;
  detail: BussinessOpportunityDetailResType | Record<string, never>;
  show: boolean;
  activeKey: string;
  brand: any;
  oppoFromListData: any;
  customerListData: GetCustomerNameItemResType[];
  customerTypeListData: any;
  businessOppoFollowersData: any;
  needSubmit?: boolean;
  saveAndClose?: boolean;
  onClose: () => void;
  onRefesh: () => void;
  onLoadDetail: () => void;
  onCancelSubmit?: () => void;
  onAfterSubmit?: () => void;
  onBasicFormChange?: (flag: boolean) => void;
}

const BasicData: React.FC<BasicDataPropsType> = ({
  id,
  type,
  detail,
  show,
  activeKey,
  brand,
  oppoFromListData,
  customerListData,
  customerTypeListData,
  businessOppoFollowersData,
  needSubmit,
  saveAndClose,
  onClose,
  onRefesh,
  onLoadDetail,
  onCancelSubmit,
  onAfterSubmit,
  onBasicFormChange,
}) => {
  const [basicForm] = Form.useForm();
  const addBrandRef = useRef<InputRef>(null);
  const [showBrandSelect, setShowBrandSelect] = useState(true);
  const [brandList, setBrandList] = useState<SelectProps["options"]>([]);
  const [brandId, setBrandId] = useState<number | undefined>(undefined);
  const [addBrandName, setAddBrandName] = useState("");
  const [brandLoading, setBrandLoading] = useState(false);
  const [coCateList, setCoCateList] = useState<GetCoCateListItemResType[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [showChargerSelect, setShowChargerSelect] = useState(false);
  const [chargerList, setChargerList] = useState<
    BusinessOppoFollowersResType[]
  >([]);
  const [customerList, setCustomerList] = useState<
    GetCustomerNameItemResType[]
  >([]);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetailResType>(
    {}
  );
  const [customerTypeList, setCustomerTypeList] = useState<
    { id: number; name: string }[]
  >([]);
  const [businessType, setBusinessType] = useState<
    { id: number; name: string }[]
  >([]);
  const [oppoFromList, setOppoFromList] = useState<OppoFromListType[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [initFormData, setInitFormData] = useState<any>({
    secret: 0,
    isSelfCharger: 1,
  });

  const getCustomerDetail = async (customerId: number) => {
    setCustomerDetail({});
    const res = await $getCustomerDetail({ customerId });
    setCustomerDetail(res);
    if (res.customerAdminInfo?.customerType) {
      basicForm.setFieldValue("opCoType", res.customerAdminInfo.customerType);
    }
  };

  // 根据是否选择保密控制品牌的显隐
  const changeShowBrandStatus = (value: 0 | 1) => {
    if (!value) {
      setShowBrandSelect(true);
      return;
    }

    setShowBrandSelect(false);
    basicForm.setFieldValue("brandId", "");
    setBrandId(undefined);
  };

  // 根据本人是否跟进控制商机负责人的显隐
  const changeShowChargerStatus = (value: 1 | 2) => {
    if (value === 1) {
      setShowChargerSelect(false);
      return;
    }

    setShowChargerSelect(true);
    basicForm.setFieldValue("charger", "");
  };

  // 根据有无选择客户联系人控制详情是否展示
  const changeShowCustomerDetail = (value: any) => {
    if (value) {
      getCustomerDetail(value[value.length - 1]);
      setShowCustomerDetail(true);
      return;
    }

    setShowCustomerDetail(false);
    setCustomerDetail({});
  };

  const handleChangeBrandRadio = (e: RadioChangeEvent) => {
    const { value } = e.target;
    changeShowBrandStatus(value);
  };

  // 获取品牌列表
  const getBrandList = async () => {
    const res: any = await $getBrandList();
    setBrandList(res);
  };

  // 获取合作产品品类
  const getCoCateList = async () => {
    const res = await $getCoCateList();
    setCoCateList(res);
  };

  // 获取客户联系人列表
  const getCustomerName = async () => {
    const res = await $getCustomerName();
    const list = res.map(item => {
      const newItem: any = { ...item };

      newItem.label = newItem.companyName;
      newItem.value = newItem.companyId;

      const children = item.customer.map(it => {
        const newIt: any = { ...it };
        newIt.companyId = newIt.customerId;
        newIt.label = newIt.customerName;
        newIt.value = newIt.customerId;
        newIt.companyName = (
          <div className={styles.cascaderSelect}>
            <span>{newIt.customerName}</span>
            <span />
          </div>
        );
        return newIt;
      });

      const otherChildren = item.otherCustomer.map(it => {
        const newIt: any = { ...it };
        newIt.companyId = newIt.customerId;
        newIt.label = newIt.customerName;
        newIt.value = newIt.customerId;
        newIt.companyName = (
          <div className={styles.cascaderSpanBox}>
            <span>{newIt.customerName}</span>
            <span>{newIt.crmName}</span>
          </div>
        );
        newIt.disabled = true;
        return newIt;
      });

      newItem.children = [...children, ...otherChildren];
      return newItem;
    });
    setCustomerList(list);
  };

  // // 获取商机下拉列表数据
  // const getOppoFromList = async () => {
  //   const res = await $getOppoFromList();
  //   setOppoFromList(res);
  // };

  // 获取主要合作类型
  // const getCustomerTypeList = async () => {
  //   const res = await $getCustomerTypeList();
  //   setCustomerTypeList(res);
  // };

  const getBusinessTypeList = async () => {
    const res = await $getBusinessTypeList();
    setBusinessType(res);
  };

  // const getBusinessOppoFollowers = async () => {
  //   const res = await $getBusinessOppoFollowers();
  //   setChargerList(res);
  // };

  const handleChangeAddBrandName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddBrandName(event.target.value);
  };

  const addBaseCustomerInfo = async () => {
    try {
      setBrandLoading(true);
      await $addBaseCustomerInfo({
        typeId: 2,
        newsContent: addBrandName.trim(),
      });
      message.success("添加品牌成功");

      await getBrandList();
      setBrandLoading(false);
    } catch (e: any) {
      message.error(String(e.message) || "添加品牌失败，请重试");
      setBrandLoading(false);
    }
  };

  const handleAddBrand = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!addBrandName.trim()) {
      message.error("品牌名不能为空");
      return;
    }
    e.preventDefault();
    addBaseCustomerInfo();
    // setItems([...items, name || `New item ${index++}`]);
    setAddBrandName("");
    setTimeout(() => {
      addBrandRef.current?.focus();
    }, 0);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard
      .writeText(
        "【项目背景】\n【合作平台】\n【预算】\n【合作形式】\n【达人要求】\n【其他要求】"
      )
      .then();
    message.success("复制成功");
  };

  const handleChangeSelfChargerRadio = (e: RadioChangeEvent) => {
    const { value } = e.target;
    changeShowChargerStatus(value);
  };

  const handleChangeCustomerId = (value: any) => {
    changeShowCustomerDetail(value);
  };

  const handleAddCustomer = () => {
    window.open(`/#/bussiness-manage/customer-manage?flag=fromClient`);
  };

  const handleRefreshCustomerList = () => {
    setCustomerList([]);
    getCustomerName();
  };

  const handleAddContact = () => {
    window.open(`/#/bussiness-manage/client-manage?flag=fromOp`);
  };

  const handleGoCustomerDetail = () => {
    window.open(
      `/#/bussiness-manage/customer-manage?id=${customerDetail?.customerAdminInfo?.customerAdminId}`
    );
  };

  const submitBusinessOpportunity = async (selfOnlySave = false) => {
    try {
      setSubmitLoading(true);
      const params = { ...basicForm.getFieldsValue() };

      const par = {
        ...params,
        oppoFromId: params.oppoFromId
          ? params.oppoFromId[params.oppoFromId.length - 1]
          : "",
        coCate: params.coCate ? params.coCate[params.coCate.length - 1] : "",
        customerId: params.customerId
          ? params.customerId[params.customerId.length - 1]
          : "",
        fileUrl: fileList?.[0]?.url,
        publishStart: params?.publishTime
          ? `${params?.publishTime?.[0].format("YYYY-MM-DD")} 00:00:00`
          : "",
        publishEnd: params?.publishTime
          ? `${params?.publishTime?.[1].format("YYYY-MM-DD")} 00:00:00`
          : "",
        charger: params.charger
          ? params.charger[params.charger.length - 1]
          : "",
        treeInfo: JSON.stringify({
          coCate: params.coCate,
          customerId: params.customerId,
          charger: params.charger,
          oppoFromId: params.oppoFromId,
        }),
      };

      const { planId } = getUrlQuery();
      // 新增时判断是否携带planId
      if (planId && type !== "edit") {
        par.planId = planId;
      }

      let api = $createBusinessOpportunity;

      if (type === "edit") {
        api = $editBusinessOpportunity;
        par.opId = id;
      }

      await api(par);
      message.success(`${type === "edit" ? "编辑" : "创建"}成功`);
      setSubmitLoading(false);

      // needSubmit为真时，说明时外部控制提交，即不是单纯的走编辑和创建
      if (needSubmit) {
        // 需要保存后关闭，直接刷新整体
        if (saveAndClose) {
          onRefesh();
        } else {
          onBasicFormChange?.(false);
          onLoadDetail();
        }
      } else {
        // 本身由自己控制时，编辑区分保存和保存并关闭  单纯保存后状态置是否改变变量改为false
        if (selfOnlySave) {
          onBasicFormChange?.(false);
          onLoadDetail();
        } else {
          onRefesh();
        }
      }

      onAfterSubmit?.();
    } catch (e: any) {
      message.error(
        String(e.message) || `${type === "edit" ? "编辑" : "创建"}失败，请重试`
      );
      setSubmitLoading(false);
      onCancelSubmit?.();
    }
  };

  const handleSubmit = async (selfOnlySave = false) => {
    try {
      await basicForm.validateFields();
      submitBusinessOpportunity(selfOnlySave);
    } catch (err) {
      onCancelSubmit?.();
    }
  };

  const loadBasicDetail = () => {
    basicForm.setFieldsValue(detail);

    // 默认 用于区分是否修改过
    const formData: any = { ...detail };

    if (detail.brandId) {
      basicForm.setFieldValue("secret", 0);
      formData.secret = 0;
      setShowBrandSelect(true);
      setBrandId(detail.brandId);
      setTimeout(() => {
        basicForm.setFieldValue("brandId", detail.brandId);
        formData.brandId = detail.brandId;
      });
    } else {
      basicForm.setFieldValue("secret", 1);
      formData.secret = 1;
      setShowBrandSelect(false);
    }

    if (detail.fileUrl) {
      setFileList([
        {
          url: detail.fileUrl,
          uid: String(Math.random()),
          name: detail.fileUrl,
        },
      ]);
    }

    if (detail.customerId) {
      handleChangeCustomerId([detail.customerId]);
    }

    if (+detail.isSelfCharger === 2) {
      setShowChargerSelect(true);
      // basicForm.setFieldValue("isSelfCharger", 2);
    } else {
      setShowChargerSelect(false);
      // basicForm.setFieldValue("isSelfCharger", 1);
    }

    if (detail.publishStart && detail.publishEnd) {
      basicForm.setFieldValue("publishTime", [
        moment(detail.publishStart),
        moment(detail.publishEnd),
      ]);
      formData.publishTime = [
        moment(detail.publishStart),
        moment(detail.publishEnd),
      ];
    }

    const treeInfo = JSON.parse(detail.treeInfo || "{}");

    if (detail.coCate) {
      basicForm.setFieldValue("coCate", treeInfo.coCate);
      formData.coCate = treeInfo.coCate;
    }

    if (detail.customerId) {
      basicForm.setFieldValue("customerId", treeInfo.customerId);
      formData.customerId = treeInfo.customerId;
    }

    if (detail.oppoFromId) {
      basicForm.setFieldValue("oppoFromId", treeInfo.oppoFromId);
      formData.oppoFromId = treeInfo.oppoFromId;
    }

    if (detail.charger) {
      basicForm.setFieldValue("charger", treeInfo.charger);
      formData.charger = treeInfo.charger;
    }

    delete formData.brandName;
    delete formData.businessTypeDesc;
    delete formData.chargerName;
    delete formData.coCateName;
    delete formData.customerInfo;
    delete formData.id;
    delete formData.opCoTypeDesc;
    delete formData.opStatus;
    delete formData.publishEnd;
    delete formData.publishStart;
    delete formData.treeInfo;
    delete formData.opNo;
    setInitFormData(formData);
  };

  const handleFormChange = (url: string) => {
    const filterFieldValue: any = {};

    const filterInitData: any = {};

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in basicForm.getFieldsValue()) {
      if (
        basicForm.getFieldsValue()[i] !== undefined &&
        basicForm.getFieldsValue()[i] !== "" &&
        basicForm.getFieldsValue()[i] !== null
      ) {
        if (i === "publishTime") {
          filterFieldValue[i] = basicForm
            .getFieldsValue()
            [i].map((item: any) => moment(item).format("YYYY-MM-DD"));
        } else {
          filterFieldValue[i] = basicForm.getFieldsValue()[i];
        }
      }
    }

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in initFormData) {
      if (
        initFormData[i] !== undefined &&
        initFormData[i] !== "" &&
        initFormData[i] !== null
      ) {
        if (i === "publishTime") {
          filterInitData[i] = initFormData[i].map((item: any) =>
            moment(item).format("YYYY-MM-DD")
          );
        } else {
          filterInitData[i] = initFormData[i];
        }
      }
    }
    // 因文件url 有空串及undefined情况
    if (
      objEqual(filterFieldValue, filterInitData) &&
      (url === filterFieldValue.fileUrl || (!url && !filterFieldValue.fileUrl))
    ) {
      onBasicFormChange?.(false);
      return false;
    }

    onBasicFormChange?.(true);
    return true;
  };

  const handleChangeFileList = (list: UploadFile[]) => {
    console.info("----list", list);
    setFileList(list);
    handleFormChange(list[0]?.url || "");
  };

  // 编辑的取消按钮，需判断是否表单项有改变
  const handleEditClose = () => {
    const isChange = handleFormChange("");
    if (!isChange) {
      onClose();
      return;
    }

    const modal = Modal.confirm({
      title: "更改提示",
      content: "当前需求信息已更改，请确认是否保存？",
      okText: "保存并关闭",
      cancelText: "直接关闭",
      closable: true,
      closeIcon: (
        <CloseOutlined
          onClick={(e: any) => {
            e.stopPropagation();
            modal.destroy();
          }}
        />
      ),
      onOk: async () => {
        handleSubmit(false);
      },
      onCancel: () => {
        onClose();
      },
    });
  };

  useEffect(() => {
    setBrandList(brand);
  }, [brand]);

  useEffect(() => {
    setOppoFromList(oppoFromListData);
  }, [oppoFromListData]);

  useEffect(() => {
    // setCustomerList(customerListData)
    getCustomerName();
  }, [customerListData]);

  useEffect(() => {
    setCustomerTypeList(customerTypeListData);
  }, [customerTypeListData]);

  useEffect(() => {
    setChargerList(businessOppoFollowersData);
  }, [businessOppoFollowersData]);

  useEffect(() => {
    getCoCateList();
    // getBrandList();
    // getCustomerName();
    // getCustomerTypeList();
    // getOppoFromList();
    // 获取商单类型
    getBusinessTypeList();
    // getBusinessOppoFollowers();

    return () => {
      onBasicFormChange?.(false);
    };
  }, []);

  useEffect(() => {
    if (!show) {
      basicForm.resetFields();
      setFileList([]);
      setShowCustomerDetail(false);
      setBrandId(undefined);
    }
  }, [show]);

  useEffect(() => {
    if (Object.keys(detail).length && id && type !== "add") {
      loadBasicDetail();
    }
  }, [id, type, JSON.stringify(detail)]);

  useEffect(() => {
    // 由父级控制是否需要提交
    if (needSubmit) {
      handleSubmit();
    }
  }, [needSubmit]);

  //
  useEffect(() => {
    // 当不为1时， 说明当前被切换了，
    if (activeKey !== "1" && type === "edit") {
      loadBasicDetail();
      onBasicFormChange?.(false);
    }
  }, [activeKey]);

  return (
    <>
      <Form.Provider
        onFormChange={name => {
          if (name === "basic") {
            handleFormChange(fileList[0]?.url || "");
          }
        }}
      >
        <Form
          name="basic"
          form={basicForm}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 13 }}
          initialValues={{ secret: 0, isSelfCharger: 1, opType: 1 }}
          autoComplete="off"
          disabled={type === "detail"}
        >
          <Row>
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <Form.Item
                    label="商机来源"
                    name="oppoFromId"
                    rules={[{ required: true, message: "请选择商机来源" }]}
                  >
                    <Cascader
                      placeholder="请选择商机来源"
                      options={oppoFromList}
                      fieldNames={{
                        label: "fromName",
                        value: "id",
                        children: "child",
                      }}
                      // displayRender={(label: any) => label[label.length - 1]}
                      // onChange
                      expandTrigger="hover"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12}>
                  <Form.Item
                    label="是否品牌保密项目"
                    labelCol={{ span: 12 }}
                    name="secret"
                    rules={[{ required: true, message: "请选择是否品牌保密" }]}
                  >
                    <Radio.Group onChange={e => handleChangeBrandRadio(e)}>
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {showBrandSelect && (
                    <Form.Item
                      label="品牌"
                      name="brandId"
                      rules={[{ required: true, message: "请选择品牌" }]}
                    >
                      <Spin spinning={brandLoading}>
                        <BSelect
                          placeholder="品牌"
                          fieldNames={{
                            label: "newsContent",
                            value: "id",
                          }}
                          value={brandId}
                          dataList={(brandList as any[]) || []}
                          scrollPageSize={50}
                          onChange={(value: number) => {
                            setBrandId(value);
                            basicForm.setFieldValue("brandId", value);
                            basicForm.validateFields(["brandId"]);
                          }}
                          dropdownRender={() => (
                            <>
                              <Divider style={{ margin: "8px 0" }} />
                              <Space style={{ padding: "0 8px 4px" }}>
                                <Input
                                  placeholder="品牌名"
                                  ref={addBrandRef}
                                  value={addBrandName}
                                  onChange={handleChangeAddBrandName}
                                />
                                <Button
                                  type="text"
                                  title="添加"
                                  icon={<PlusOutlined />}
                                  onClick={handleAddBrand}
                                />
                              </Space>
                            </>
                          )}
                        />
                        {/* <Select
                        allowClear
                        showSearch
                        placeholder="请选择品牌"
                        options={brandList}
                        filterOption={(input, option) =>
                          String(option?.label).indexOf(input) > -1
                        }
                        fieldNames={{ label: "newsContent", value: "id" }}
                        dropdownRender={menu => (
                          <>
                            {menu}
                            <Divider style={{ margin: "8px 0" }} />
                            <Space style={{ padding: "0 8px 4px" }}>
                              <Input
                                placeholder="品牌名"
                                ref={addBrandRef}
                                value={addBrandName}
                                onChange={handleChangeAddBrandName}
                              />
                              <Button
                                type="text"
                                title="添加"
                                icon={<PlusOutlined />}
                                onClick={handleAddBrand}
                              />
                            </Space>
                          </>
                        )}
                        onChange={(value: number) => {
                          basicForm.setFieldValue("brandId", value);
                          basicForm.validateFields(["brandId"]);
                        }}
                      /> */}
                      </Spin>
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row>
                <Col span={12}>
                  <Form.Item
                    label="合作产品"
                    name="coProduct"
                    rules={[{ required: true, message: "请输入合作产品" }]}
                  >
                    <Input placeholder="请输入合作产品" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="合作产品品类"
                    name="coCate"
                    rules={[{ required: true, message: "请选择合作产品品类" }]}
                  >
                    <Cascader
                      placeholder="请选择合作产品品类"
                      options={coCateList}
                      fieldNames={{
                        label: "name",
                        value: "id",
                        children: "child",
                      }}
                      displayRender={(label: any) => label[label.length - 1]}
                      // onChange
                      // expandTrigger="hover"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div>
                <Form.Item
                  label="预计发布时间"
                  name="publishTime"
                  labelCol={{ span: 5 }}
                  // 当状态处于待账号二次定询、待客户确认合作时 发布时间必填 3 4 分别为待账号二次定询、待客户确认合作
                  rules={[
                    {
                      required:
                        (+detail?.opStatus === 3 || +detail?.opStatus === 4) &&
                        type !== "add",
                      message: "请选择预计发布时间",
                    },
                  ]}
                >
                  <RangePicker placeholder={["年/月/日", "年/月/日"]} />
                </Form.Item>
              </div>

              <div className={styles.relative}>
                <Form.Item wrapperCol={{ offset: 0 }}>
                  <Form.Item
                    label="需求描述"
                    name="description"
                    labelCol={{ span: 5 }}
                    rules={[{ required: true, message: "请输入需求描述" }]}
                  >
                    <TextArea
                      className={styles.description}
                      placeholder={`模板供参考。${String.fromCharCode(
                        10
                      )}${String.fromCharCode(
                        10
                      )}【项目背景】${String.fromCharCode(
                        10
                      )}【合作平台】抖音、小红书、快手${String.fromCharCode(
                        10
                      )}【预算】单账号2W，总预算10W${String.fromCharCode(
                        10
                      )}【合作形式】${String.fromCharCode(
                        10
                      )}【达人要求】${String.fromCharCode(
                        10
                      )}【其他要求】${String.fromCharCode(
                        10
                      )}${String.fromCharCode(
                        10
                      )}注：只需将客户的实际需求填入即可，部分需求如果客户没有提出，则可以不填。`}
                    />
                  </Form.Item>
                  <Row>
                    <Col span={3} offset={5}>
                      <Button
                        type="link"
                        className={styles.copyButton}
                        onClick={handleCopyTemplate}
                      >
                        一键复制需求模版
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </div>

              <div>
                <Form.Item
                  label="品牌方BF"
                  name="fileUrl"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 18 }}
                >
                  <RUpload
                    className={styles.upload}
                    action="/api/qp/business/opportunity/upload"
                    maxCount={1}
                    maxSize={30}
                    fileList={fileList}
                    onChange={handleChangeFileList}
                  />
                  <span className={styles.uploadTip}>
                    文件大小不超过30M，支持压缩文件
                  </span>
                </Form.Item>
              </div>

              <Row>
                <Col span={12}>
                  <Form.Item
                    label="本人跟进该商机"
                    name="isSelfCharger"
                    rules={[
                      { required: true, message: "请选择是否跟进该商机" },
                    ]}
                  >
                    <Radio.Group
                      onChange={e => handleChangeSelfChargerRadio(e)}
                    >
                      <Radio value={1}>是</Radio>
                      <Radio value={2}>否</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {showChargerSelect && (
                    <Form.Item
                      label="选择商机负责人"
                      name="charger"
                      rules={[{ required: true, message: "请选择商机负责人" }]}
                    >
                      <Cascader
                        placeholder="请选择商机负责人"
                        options={chargerList}
                        fieldNames={{
                          label: "orgName",
                          value: "id",
                          children: "children",
                        }}
                        displayRender={(label: any) => label[label.length - 1]}
                        expandTrigger="hover"
                        // displayRender={displayRender}
                        // onChange={onChange}
                      />
                      {/* <Select placeholder="请选择商机负责人">
                      <Option value={1}>1</Option>
                    </Select> */}
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row>
                <Col span={12}>
                  <Form.Item label="需执行人介入履约" name="opType">
                    <Radio.Group disabled={type !== "add"}>
                      <Radio value={1}>是</Radio>
                      <Radio value={2}>否</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <div>
                <Form.Item label="备注" labelCol={{ span: 5 }} name="remark">
                  <TextArea placeholder="请输入备注" />
                </Form.Item>
              </div>
            </Col>
            {/* <Col span={2}>
            <div className={styles.lineBox}>
              <div className={styles.line} />
            </div>
          </Col> */}
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <Form.Item
                    label="选择客户联系人"
                    name="customerId"
                    rules={[{ required: true, message: "请选择客户联系人" }]}
                  >
                    <BCascader
                      dataList={customerList}
                      // loading={!customerList.length}
                      placeholder="请选择客户联系人"
                      fieldNames={{ label: "companyName", value: "companyId" }}
                      childFieldName={{
                        label: "customerName",
                        value: "customerId",
                        secondLabel: "crmName",
                      }}
                      dropdownClassName="basicDataCascader"
                      changeOnSelect
                      onlySupportChild
                      onChange={handleChangeCustomerId}
                    />

                    {/* <Cascader
                    options={customerList}
                    loading={!customerList.length}
                    placeholder="请选择"
                    showSearch
                    fieldNames={{ label: "companyName", value: "companyId" }}
                    onChange={handleChangeCustomerId}
                  /> */}
                  </Form.Item>
                </Col>
                <div className={styles.tools}>
                  <Button
                    type="link"
                    className={styles.button}
                    onClick={handleRefreshCustomerList}
                  >
                    刷新
                  </Button>
                  <Button
                    type="link"
                    className={styles.button}
                    onClick={handleAddCustomer}
                  >
                    新增客户
                  </Button>
                  <Button
                    type="link"
                    className={styles.button}
                    onClick={handleAddContact}
                  >
                    新增联系人
                  </Button>
                </div>
              </Row>
              {showCustomerDetail && (
                <Spin spinning={!Object.keys(customerDetail).length}>
                  <div className={styles.customerDetail}>
                    <div>
                      <Tag color="#108ee9" className={styles.titleTag}>
                        客户概览
                      </Tag>
                      <Button type="link" onClick={handleGoCustomerDetail}>
                        查看详情
                      </Button>
                    </div>
                    <div className={styles.row}>
                      <div>
                        <span>主要合作类型：</span>
                        <span>
                          {customerDetail?.customerAdminInfo
                            ?.customerTypeName || "--"}
                        </span>
                      </div>
                      <div>
                        <span>行业类别：</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.industryName ||
                            "--"}
                        </span>
                      </div>
                      <div />
                    </div>

                    <div className={cs(styles.row, styles.bottomLine)}>
                      <div>
                        <span>主对接人：</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.mainConnectName ||
                            "--"}
                        </span>
                      </div>
                      <div>
                        <span>创建人：</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.createName ||
                            "--"}
                        </span>
                      </div>
                      <div>
                        <span>创建时间：</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.createTime ||
                            "--"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Tag
                        color="#108ee9"
                        className={cs(styles.titleTag, styles.rebateTag)}
                      >
                        返点政策
                      </Tag>
                    </div>
                    <div className={cs(styles.row)}>
                      <div>
                        <span>自营返点区间：</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.selfMin || 0} ~{" "}
                          {customerDetail?.customerAdminInfo?.selfMax || 0} %
                        </span>
                      </div>
                      <div>
                        <span>签约返点区间：</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.signMin || 0} ~{" "}
                          {customerDetail?.customerAdminInfo?.signMax || 0} %
                        </span>
                      </div>
                      <div />
                    </div>
                  </div>
                </Spin>
              )}
              <Row>
                <Col span={12}>
                  <Form.Item
                    label="本商机合作类型"
                    name="opCoType"
                    rules={[
                      { required: true, message: "请选择本商机合作类型" },
                    ]}
                  >
                    <Select
                      className={cs(styles.inlineBlock, styles.select)}
                      placeholder="请选择合作类型"
                    >
                      {customerTypeList.map(item => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <span className={cs(styles.uploadTip, styles.opCoTypeTip)}>
                  默认与客户主要合作类型一致
                </span>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    label="自营返点比例"
                    name="selfRatio"
                    rules={[{ required: true, message: "请输入自营返点比例" }]}
                  >
                    <InputNumber
                      min={customerDetail?.customerAdminInfo?.selfMin || 0}
                      max={customerDetail?.customerAdminInfo?.selfMax || 25}
                      precision={2}
                      addonAfter="%"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="签约返点比例"
                    name="signRatio"
                    rules={[{ required: true, message: "请输入签约返点比例" }]}
                  >
                    <InputNumber
                      min={customerDetail?.customerAdminInfo?.signMin || 0}
                      max={customerDetail?.customerAdminInfo?.signMax || 20}
                      addonAfter="%"
                      precision={2}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    label="商单类型"
                    name="businessType"
                    rules={[{ required: true, message: "请选择商单类型" }]}
                  >
                    <Select placeholder="请选择商单类型">
                      {businessType.map(item => (
                        <Option key={item.id} value={Number(item.id)}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Form.Provider>
      <div className={styles.footerToolsBox}>
        {type === "edit" ? (
          <>
            <Button className="m-l-6" onClick={handleEditClose}>
              取消
            </Button>
            <Button
              className="m-l-6"
              type="primary"
              onClick={() => handleSubmit(true)}
              loading={submitLoading}
            >
              保存
            </Button>
            <Button
              type="primary"
              onClick={() => handleSubmit(false)}
              loading={submitLoading}
            >
              保存并关闭
            </Button>
          </>
        ) : (
          <>
            <Button className="m-l-6" onClick={onClose}>
              取消
            </Button>
            <Button
              disabled={type === "detail"}
              type="primary"
              onClick={() => handleSubmit()}
              loading={submitLoading}
            >
              提交
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default BasicData;

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

  // ?????????????????????????????????????????????
  const changeShowBrandStatus = (value: 0 | 1) => {
    if (!value) {
      setShowBrandSelect(true);
      return;
    }

    setShowBrandSelect(false);
    basicForm.setFieldValue("brandId", "");
    setBrandId(undefined);
  };

  // ??????????????????????????????????????????????????????
  const changeShowChargerStatus = (value: 1 | 2) => {
    if (value === 1) {
      setShowChargerSelect(false);
      return;
    }

    setShowChargerSelect(true);
    basicForm.setFieldValue("charger", "");
  };

  // ?????????????????????????????????????????????????????????
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

  // ??????????????????
  const getBrandList = async () => {
    const res: any = await $getBrandList();
    setBrandList(res);
  };

  // ????????????????????????
  const getCoCateList = async () => {
    const res = await $getCoCateList();
    setCoCateList(res);
  };

  // ???????????????????????????
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

  // // ??????????????????????????????
  // const getOppoFromList = async () => {
  //   const res = await $getOppoFromList();
  //   setOppoFromList(res);
  // };

  // ????????????????????????
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
      message.success("??????????????????");

      await getBrandList();
      setBrandLoading(false);
    } catch (e: any) {
      message.error(String(e.message) || "??????????????????????????????");
      setBrandLoading(false);
    }
  };

  const handleAddBrand = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!addBrandName.trim()) {
      message.error("?????????????????????");
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
        "??????????????????\n??????????????????\n????????????\n??????????????????\n??????????????????\n??????????????????"
      )
      .then();
    message.success("????????????");
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
      // ???????????????????????????planId
      if (planId && type !== "edit") {
        par.planId = planId;
      }

      let api = $createBusinessOpportunity;

      if (type === "edit") {
        api = $editBusinessOpportunity;
        par.opId = id;
      }

      await api(par);
      message.success(`${type === "edit" ? "??????" : "??????"}??????`);
      setSubmitLoading(false);

      // needSubmit??????????????????????????????????????????????????????????????????????????????
      if (needSubmit) {
        // ??????????????????????????????????????????
        if (saveAndClose) {
          onRefesh();
        } else {
          onBasicFormChange?.(false);
          onLoadDetail();
        }
      } else {
        // ???????????????????????????????????????????????????????????????  ????????????????????????????????????????????????false
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
        String(e.message) || `${type === "edit" ? "??????" : "??????"}??????????????????`
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

    // ?????? ???????????????????????????
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
    // ?????????url ????????????undefined??????
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

  // ?????????????????????????????????????????????????????????
  const handleEditClose = () => {
    const isChange = handleFormChange("");
    if (!isChange) {
      onClose();
      return;
    }

    const modal = Modal.confirm({
      title: "????????????",
      content: "??????????????????????????????????????????????????????",
      okText: "???????????????",
      cancelText: "????????????",
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
    // ??????????????????
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
    // ?????????????????????????????????
    if (needSubmit) {
      handleSubmit();
    }
  }, [needSubmit]);

  //
  useEffect(() => {
    // ?????????1?????? ???????????????????????????
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
                    label="????????????"
                    name="oppoFromId"
                    rules={[{ required: true, message: "?????????????????????" }]}
                  >
                    <Cascader
                      placeholder="?????????????????????"
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
                    label="????????????????????????"
                    labelCol={{ span: 12 }}
                    name="secret"
                    rules={[{ required: true, message: "???????????????????????????" }]}
                  >
                    <Radio.Group onChange={e => handleChangeBrandRadio(e)}>
                      <Radio value={1}>???</Radio>
                      <Radio value={0}>???</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {showBrandSelect && (
                    <Form.Item
                      label="??????"
                      name="brandId"
                      rules={[{ required: true, message: "???????????????" }]}
                    >
                      <Spin spinning={brandLoading}>
                        <BSelect
                          placeholder="??????"
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
                                  placeholder="?????????"
                                  ref={addBrandRef}
                                  value={addBrandName}
                                  onChange={handleChangeAddBrandName}
                                />
                                <Button
                                  type="text"
                                  title="??????"
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
                        placeholder="???????????????"
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
                                placeholder="?????????"
                                ref={addBrandRef}
                                value={addBrandName}
                                onChange={handleChangeAddBrandName}
                              />
                              <Button
                                type="text"
                                title="??????"
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
                    label="????????????"
                    name="coProduct"
                    rules={[{ required: true, message: "?????????????????????" }]}
                  >
                    <Input placeholder="?????????????????????" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="??????????????????"
                    name="coCate"
                    rules={[{ required: true, message: "???????????????????????????" }]}
                  >
                    <Cascader
                      placeholder="???????????????????????????"
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
                  label="??????????????????"
                  name="publishTime"
                  labelCol={{ span: 5 }}
                  // ??????????????????????????????????????????????????????????????? ?????????????????? 3 4 ??????????????????????????????????????????????????????
                  rules={[
                    {
                      required:
                        (+detail?.opStatus === 3 || +detail?.opStatus === 4) &&
                        type !== "add",
                      message: "???????????????????????????",
                    },
                  ]}
                >
                  <RangePicker placeholder={["???/???/???", "???/???/???"]} />
                </Form.Item>
              </div>

              <div className={styles.relative}>
                <Form.Item wrapperCol={{ offset: 0 }}>
                  <Form.Item
                    label="????????????"
                    name="description"
                    labelCol={{ span: 5 }}
                    rules={[{ required: true, message: "?????????????????????" }]}
                  >
                    <TextArea
                      className={styles.description}
                      placeholder={`??????????????????${String.fromCharCode(
                        10
                      )}${String.fromCharCode(
                        10
                      )}??????????????????${String.fromCharCode(
                        10
                      )}?????????????????????????????????????????????${String.fromCharCode(
                        10
                      )}?????????????????????2W????????????10W${String.fromCharCode(
                        10
                      )}??????????????????${String.fromCharCode(
                        10
                      )}??????????????????${String.fromCharCode(
                        10
                      )}??????????????????${String.fromCharCode(
                        10
                      )}${String.fromCharCode(
                        10
                      )}????????????????????????????????????????????????????????????????????????????????????????????????????????????`}
                    />
                  </Form.Item>
                  <Row>
                    <Col span={3} offset={5}>
                      <Button
                        type="link"
                        className={styles.copyButton}
                        onClick={handleCopyTemplate}
                      >
                        ????????????????????????
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </div>

              <div>
                <Form.Item
                  label="?????????BF"
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
                    ?????????????????????30M?????????????????????
                  </span>
                </Form.Item>
              </div>

              <Row>
                <Col span={12}>
                  <Form.Item
                    label="?????????????????????"
                    name="isSelfCharger"
                    rules={[
                      { required: true, message: "??????????????????????????????" },
                    ]}
                  >
                    <Radio.Group
                      onChange={e => handleChangeSelfChargerRadio(e)}
                    >
                      <Radio value={1}>???</Radio>
                      <Radio value={2}>???</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {showChargerSelect && (
                    <Form.Item
                      label="?????????????????????"
                      name="charger"
                      rules={[{ required: true, message: "????????????????????????" }]}
                    >
                      <Cascader
                        placeholder="????????????????????????"
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
                      {/* <Select placeholder="????????????????????????">
                      <Option value={1}>1</Option>
                    </Select> */}
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row>
                <Col span={12}>
                  <Form.Item label="????????????????????????" name="opType">
                    <Radio.Group disabled={type !== "add"}>
                      <Radio value={1}>???</Radio>
                      <Radio value={2}>???</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <div>
                <Form.Item label="??????" labelCol={{ span: 5 }} name="remark">
                  <TextArea placeholder="???????????????" />
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
                    label="?????????????????????"
                    name="customerId"
                    rules={[{ required: true, message: "????????????????????????" }]}
                  >
                    <BCascader
                      dataList={customerList}
                      // loading={!customerList.length}
                      placeholder="????????????????????????"
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
                    placeholder="?????????"
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
                    ??????
                  </Button>
                  <Button
                    type="link"
                    className={styles.button}
                    onClick={handleAddCustomer}
                  >
                    ????????????
                  </Button>
                  <Button
                    type="link"
                    className={styles.button}
                    onClick={handleAddContact}
                  >
                    ???????????????
                  </Button>
                </div>
              </Row>
              {showCustomerDetail && (
                <Spin spinning={!Object.keys(customerDetail).length}>
                  <div className={styles.customerDetail}>
                    <div>
                      <Tag color="#108ee9" className={styles.titleTag}>
                        ????????????
                      </Tag>
                      <Button type="link" onClick={handleGoCustomerDetail}>
                        ????????????
                      </Button>
                    </div>
                    <div className={styles.row}>
                      <div>
                        <span>?????????????????????</span>
                        <span>
                          {customerDetail?.customerAdminInfo
                            ?.customerTypeName || "--"}
                        </span>
                      </div>
                      <div>
                        <span>???????????????</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.industryName ||
                            "--"}
                        </span>
                      </div>
                      <div />
                    </div>

                    <div className={cs(styles.row, styles.bottomLine)}>
                      <div>
                        <span>???????????????</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.mainConnectName ||
                            "--"}
                        </span>
                      </div>
                      <div>
                        <span>????????????</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.createName ||
                            "--"}
                        </span>
                      </div>
                      <div>
                        <span>???????????????</span>
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
                        ????????????
                      </Tag>
                    </div>
                    <div className={cs(styles.row)}>
                      <div>
                        <span>?????????????????????</span>
                        <span>
                          {customerDetail?.customerAdminInfo?.selfMin || 0} ~{" "}
                          {customerDetail?.customerAdminInfo?.selfMax || 0} %
                        </span>
                      </div>
                      <div>
                        <span>?????????????????????</span>
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
                    label="?????????????????????"
                    name="opCoType"
                    rules={[
                      { required: true, message: "??????????????????????????????" },
                    ]}
                  >
                    <Select
                      className={cs(styles.inlineBlock, styles.select)}
                      placeholder="?????????????????????"
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
                  ???????????????????????????????????????
                </span>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    label="??????????????????"
                    name="selfRatio"
                    rules={[{ required: true, message: "???????????????????????????" }]}
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
                    label="??????????????????"
                    name="signRatio"
                    rules={[{ required: true, message: "???????????????????????????" }]}
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
                    label="????????????"
                    name="businessType"
                    rules={[{ required: true, message: "?????????????????????" }]}
                  >
                    <Select placeholder="?????????????????????">
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
              ??????
            </Button>
            <Button
              className="m-l-6"
              type="primary"
              onClick={() => handleSubmit(true)}
              loading={submitLoading}
            >
              ??????
            </Button>
            <Button
              type="primary"
              onClick={() => handleSubmit(false)}
              loading={submitLoading}
            >
              ???????????????
            </Button>
          </>
        ) : (
          <>
            <Button className="m-l-6" onClick={onClose}>
              ??????
            </Button>
            <Button
              disabled={type === "detail"}
              type="primary"
              onClick={() => handleSubmit()}
              loading={submitLoading}
            >
              ??????
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default BasicData;

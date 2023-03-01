/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import {
  Button,
  message,
  Form,
  Row,
  Col,
  Select,
  Input,
  DatePicker,
  ConfigProvider,
  Radio,
  Modal,
} from "antd";
import cs from "classnames";
import { $executePlan, $getByDictType } from "src/api/workOrderDetail";
import { $getDqManagementData } from "src/api/business";
import moment from "moment";
// import type { Moment } from "moment";
import zhCN from "antd/es/locale/zh_CN";
import "moment/locale/zh-cn";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox";
import styles from "./ExecutionPlan.scss";

const DatePickers: any = DatePicker;

const { Option } = Select;
const { confirm } = Modal;

moment.locale("zh-cn");

const ORDER_STATUS_LIST = [
  { id: 0, value: "未下单" },
  { id: 1, value: "已下单" },
  { id: 2, value: "无须下单" },
];

const OUTLINE_STATUS_LIST = [
  { id: 0, value: "否" },
  { id: 1, value: "是" },
];

// const ORDERTIME_LIST = [
//   { id: 1, value: '20s' },
//   { id: 2, value: '60s' },
//   { id: 3, value: '60s+' },
// ]

// const AUTHOR_LIST = [
//   { id: 1, value: '授权1个月' },
//   { id: 2, value: '授权3个月' },
//   { id: 3, value: '授权6个月' },
//   { id: 4, value: '不授权' },
// ]

interface ExecutionPlanPropsType {
  onLoadHasOutline: (val: number) => void;
}

const ExecutionPlan: React.FC<ExecutionPlanPropsType> = ({
  onLoadHasOutline,
}) => {
  const {
    detail: {
      confirmOrderNodeAndFieldBO: {
        confirmOrderNodeBO: { publishDate = "" } = {},
      } = {},
    },
  } = useContext(DetailContext);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [executionPlanForm] = Form.useForm();
  // 已经成单的日期
  const [outDay, setOutDay] = useState<any>([]);
  const {
    detail: {
      executePlanNodeAndFieldBO: {
        executePlanNodeBO: {
          nodeStatus = undefined,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          // platTaskId = "",
          orderFlag = null,
          orderDuration = null,
          bfFlag = null,
          sendFlag = null,
          authDuration = null,
          outlineFlag = null,
          outlineDeadline = "",
          scriptDeadline = "",
          videoDraftDeadline = "",
          publishVideoDeadline = "",
          cancelReasonTypeDesc = "",
          performDelayFlag = "0",
          specialCase = "",
          updateTime = "",
          performDelayFlagName = "",
        } = {},
      } = {},
      orderBaseInfoBO: {
        orderNo = "",
        orderStatus = "",
        accountId = "",
        // busOrderType = "",
        // platId = 0,
        // orderBelongType = 0,
      } = {},
      // confirmPaymentNodeAndFieldBO = {},
    },
    setLoading,
    onRefresh,
  } = useContext(DetailContext);
  const [edit, setEdit] = useState(false);
  // const [showPlatTaskId, setShowPlatTaskId] = useState(false);
  const [showOutlineTime, setShowOutlineTime] = useState(false);

  const [orderDurationSelectData, setOrderDurationSelectData] = useState<any[]>(
    []
  );
  const [authorizationSelectData, setAuthorizationSelectData] = useState<any[]>(
    []
  );
  const [delayTypeList, setDelayTypeList] = useState<any[]>([]);
  const [delayReason, setDelayReason] = useState<any>("");
  const handleEdit = () => {
    // 已核账
    if (+orderStatus === 10) {
      message.error("已核账的工单不再支持修改信息");
      return;
    }

    executionPlanForm.setFieldsValue({
      orderFlag,
      orderDuration: orderDuration?.toString(),
      bfFlag,
      sendFlag,
      authDuration: authDuration?.toString(),
      specialCase,
      outlineFlag,
      outlineDeadline: outlineDeadline ? moment(outlineDeadline) : "",
      scriptDeadline: scriptDeadline ? moment(scriptDeadline) : "",
      videoDraftDeadline: videoDraftDeadline ? moment(videoDraftDeadline) : "",
      publishVideoDeadline: publishVideoDeadline
        ? moment(publishVideoDeadline)
        : "",
      performDelayFlag: String(performDelayFlag),
      // platTaskId,
    });

    setEdit(true);
  };

  const handleCancel = () => {
    setEdit(false);
  };
  const [performDelayVal, setperformDelayVal] = useState<any>();
  // const onChangeRadio = (e: any) => {
  //   executionPlanForm.setFieldValue("performDelayFlag", +e.target.value);
  // };
  const submit = async (editFlag: 0 | 1) => {
    try {
      const {
        outlineDeadline = "",
        publishVideoDeadline = "",
        scriptDeadline = "",
        videoDraftDeadline = "",
      } = executionPlanForm.getFieldsValue();

      const params = {
        ...executionPlanForm.getFieldsValue(),
        performDelayFlag:
          delayReason || executionPlanForm.getFieldsValue().performDelayFlag,
        editFlag,
        orderNo,
        orderStatus,
        outlineDeadline: outlineDeadline
          ? moment(outlineDeadline).format("YYYY-MM-DD HH:mm")
          : "",
        publishVideoDeadline: publishVideoDeadline
          ? moment(publishVideoDeadline).format("YYYY-MM-DD HH:mm")
          : "",
        scriptDeadline: scriptDeadline
          ? moment(scriptDeadline).format("YYYY-MM-DD HH:mm")
          : "",
        videoDraftDeadline: videoDraftDeadline
          ? moment(videoDraftDeadline).format("YYYY-MM-DD HH:mm")
          : "",
      };

      await $executePlan(params);
      message.success("操作成功");
      handleCancel();
      onRefresh();
      setShowConfirmModal(false);
    } catch (e: any) {
      setLoading(false);
      setShowConfirmModal(false);
      message.error(String(e.message));
    }
  };
  const [editBtnFlag, setEditBtnFlag] = useState<any>(0);
  const handleChangeSubmitStatus = async (editFlag: 0 | 1) => {
    setEditBtnFlag(editFlag);
    await executionPlanForm.validateFields();
    const publishVideoDeadline = executionPlanForm.getFieldValue(
      "publishVideoDeadline"
    );
    const performDelayFlag =
      executionPlanForm.getFieldValue("performDelayFlag");
    if (
      moment(publishVideoDeadline).format("YYYY-MM-DD") > publishDate &&
      +performDelayFlag === 0
    ) {
      setShowConfirmModal(true);
    } else {
      submit(editFlag);
    }
  };

  const handleChangeOutline = (val: number) => {
    if (val) {
      setShowOutlineTime(true);
      executionPlanForm.setFieldValue("outlineDeadline", "");
    } else {
      setShowOutlineTime(false);
    }
  };

  // const disabledCurrentDate = (currentDate: Moment) =>
  //   currentDate && currentDate <= moment();

  // const disabledScriptDate = (currentDate: Moment) => {
  //   const outlineTime = executionPlanForm.getFieldValue("outlineDeadline");
  //   if (!outlineTime) {
  //     return currentDate && currentDate <= moment();
  //   }

  //   return currentDate && currentDate <= outlineTime;
  // };

  // const disabledVideoDraftDate = (currentDate: Moment) => {
  //   const scriptTime = executionPlanForm.getFieldValue("scriptDeadline");
  //   if (!scriptTime) {
  //     return false;
  //   }

  //   return currentDate && currentDate <= scriptTime;
  // };

  // const disabledPublishVideoDate = (currentDate: Moment) => {
  //   const videoDraftTime =
  //     executionPlanForm.getFieldValue("videoDraftDeadline");
  //   if (!videoDraftTime) {
  //     return false;
  //   }

  //   return currentDate && currentDate <= videoDraftTime;
  // };

  // 获取下单时长和授权情况下拉数据
  const getSelectDataList = async () => {
    const {
      business_quotation_order_duration,
      business_quotation_auth_duration,
      perform_delay_flag,
    } = await $getByDictType({
      dictTypes: [
        "business_quotation_order_duration",
        "business_quotation_auth_duration",
        "perform_delay_flag",
      ],
    });
    setOrderDurationSelectData(business_quotation_order_duration);
    setAuthorizationSelectData(business_quotation_auth_duration);
    setDelayTypeList(perform_delay_flag);
  };
  // const disableDate = (date: any) => {
  //   // 将date转化为YYYYMMDD的格式
  //   const days = moment(date).format("YYYY-MM-DD");
  //   return outDay.includes(days);
  // };
  const getDqManagementData = async (accountId: any) => {
    try {
      const data: any = await $getDqManagementData({ accountId });
      if (data && data.length) {
        const slotDates: any = [];
        data.forEach((item: any) => {
          slotDates.push(item.slotDate);
        });
        setOutDay([...slotDates]);
      }
    } catch (error) {
      console.info(error);
    }
  };
  const handleFocus = () => {
    getDqManagementData(accountId);
  };
  const handleConfirmOk = () => {
    if (delayReason) {
      executionPlanForm.setFieldValue("performDelayFlag", delayReason);
      submit(editBtnFlag);
    } else {
      message.error("请选择履约延期原因");
    }
  };
  const handleCancelConfirm = () => {
    submit(editBtnFlag);
  };
  const handleSelectDelayReason = (val: any) => {
    setDelayReason(val);
  };
  useEffect(() => {
    getSelectDataList();
  }, []);
  useEffect(() => {
    if (Number(outlineFlag) === 1) {
      setShowOutlineTime(true);
    }
    onLoadHasOutline(Number(outlineFlag));
  }, [outlineFlag]);
  // useEffect(() => {
  //   // 0为自营 3为海盗 逻辑一致
  //   if (!orderBelongType || +orderBelongType === 3) {
  //     setShowPlatTaskId(
  //       (+busOrderType === 1 || +busOrderType === 2) &&
  //         (+platId === 25 || +platId === 2)
  //     );
  //   } else if (orderBelongType === 1) {
  //     const { confirmPaymentNodeBO } =
  //       (confirmPaymentNodeAndFieldBO as any) || {};
  //     const { paymentType } = confirmPaymentNodeBO || {};

  //     setShowPlatTaskId(
  //       (+busOrderType === 1 || +busOrderType === 2) &&
  //         +paymentType === 1 &&
  //         (+platId === 25 || +platId === 2)
  //     );
  //   } else {
  //     setShowPlatTaskId(false);
  //   }
  // }, [orderBelongType]);

  return (
    <ConfigProvider locale={zhCN}>
      <div>
        <WorkItemBox
          title="录入执行计划"
          nodeStatus={nodeStatus}
          operatorUserName={`${
            [operatorUserName, operatorDName, operatorFName]
              .filter(item => item)
              .join("-") || "待定"
          }`}
          cancelOrderReason={cancelReasonTypeDesc}
          updateTime={updateTime}
          allBtn={
            <div>
              {/* // 状态不是撤单 且有编辑权限 */}
              {Number(orderStatus) !== 11 && editAuth && (
                <>
                  {/* 进行中 */}
                  {Number(nodeStatus) === 1 &&
                    (edit ? (
                      <>
                        <Button
                          type="primary"
                          className={cs(styles.successButton, "m-r-6")}
                          onClick={() => handleChangeSubmitStatus(0)}
                        >
                          保存并提交
                        </Button>
                        <Button onClick={handleCancel}>取消</Button>
                      </>
                    ) : (
                      <Button type="primary" onClick={handleEdit}>
                        去录入
                      </Button>
                    ))}
                  {/* 已完成 */}
                  {Number(nodeStatus) === 2 &&
                    (edit ? (
                      <>
                        <Button
                          type="primary"
                          className={cs(styles.successButton, "m-r-6")}
                          onClick={() => handleChangeSubmitStatus(1)}
                        >
                          确认
                        </Button>
                        <Button onClick={handleCancel}>取消</Button>
                      </>
                    ) : (
                      <Button type="primary" onClick={handleEdit}>
                        编辑
                      </Button>
                    ))}
                </>
              )}
            </div>
          }
        >
          <div className={cs(styles.wrapper, "m-t-24")}>
            <Form form={executionPlanForm}>
              <Row gutter={24}>
                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="下单状态"
                      name="orderFlag"
                      rules={[{ required: true, message: "请选择下单状态" }]}
                    >
                      <Select
                        placeholder="请选择下单状态"
                        allowClear
                        className={styles.select}
                      >
                        {ORDER_STATUS_LIST.map(({ id, value }) => (
                          <Option key={id} value={id}>
                            {value}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item label="下单状态">
                      <div className={orderFlag === null ? styles.error : ""}>
                        {orderFlag !== null
                          ? ORDER_STATUS_LIST[Number(orderFlag)]?.value
                          : "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="下单时长"
                      name="orderDuration"
                      rules={[{ required: true, message: "请选择下单时长" }]}
                    >
                      <Select
                        placeholder="请选择下单时长"
                        allowClear
                        className={styles.select}
                      >
                        {orderDurationSelectData.map(
                          ({ dictValue, dictLabel }) => (
                            <Option key={dictValue} value={dictValue}>
                              {dictLabel}
                            </Option>
                          )
                        )}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item label="下单时长">
                      <div
                        className={orderDuration === null ? styles.error : ""}
                      >
                        {orderDuration !== null
                          ? orderDurationSelectData[Number(orderDuration)]
                              ?.dictLabel
                          : "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="是否出bf"
                      name="bfFlag"
                      rules={[{ required: true, message: "请选择是否出bf" }]}
                    >
                      <Select
                        placeholder="请选择是否出bf"
                        allowClear
                        className={styles.select}
                      >
                        {OUTLINE_STATUS_LIST.map(({ id, value }) => (
                          <Option key={id} value={id}>
                            {value}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item label="是否出bf">
                      <div className={bfFlag === null ? styles.error : ""}>
                        {bfFlag !== null
                          ? OUTLINE_STATUS_LIST[Number(bfFlag)]?.value
                          : "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="是否寄品"
                      name="sendFlag"
                      rules={[{ required: true, message: "请选择是否寄品" }]}
                    >
                      <Select
                        placeholder="请选择是否寄品"
                        allowClear
                        className={styles.select}
                      >
                        {OUTLINE_STATUS_LIST.map(({ id, value }) => (
                          <Option key={id} value={id}>
                            {value}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item label="是否寄品">
                      <div className={sendFlag === null ? styles.error : ""}>
                        {sendFlag !== null
                          ? OUTLINE_STATUS_LIST[Number(sendFlag)]?.value
                          : "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="授权情况"
                      name="authDuration"
                      rules={[{ required: true, message: "请选择授权情况" }]}
                    >
                      <Select
                        placeholder="请选择授权情况"
                        allowClear
                        className={styles.select}
                      >
                        {authorizationSelectData.map(
                          ({ dictValue, dictLabel }) => (
                            <Option key={dictValue} value={dictValue}>
                              {dictLabel}
                            </Option>
                          )
                        )}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item label="授权情况">
                      <div
                        className={authDuration === null ? styles.error : ""}
                      >
                        {authDuration !== null
                          ? authorizationSelectData[Number(authDuration)]
                              ?.dictLabel
                          : "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                <Col span={8}>
                  {/* {edit ? (
                      <Form.Item
                        label="特殊情况"
                        name="authorization"
                      >
                        <Input />
                      </Form.Item>
                    ) : (
                      <Form.Item label="特殊情况">
                        <div className={specialCase === null ? styles.error : ""}>
                          {specialCase !== null
                            ? specialCase
                            : "未设置"}
                        </div>
                      </Form.Item>
                    )} */}
                  <Form.Item label="特殊情况：" name="specialCase">
                    {edit ? (
                      <Input placeholder="请输入" maxLength={100} />
                    ) : (
                      specialCase || "--"
                    )}
                  </Form.Item>
                </Col>

                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="是否需要大纲"
                      name="outlineFlag"
                      rules={[
                        { required: true, message: "请选择是否需要大纲" },
                      ]}
                    >
                      <Select
                        placeholder="请选择是否需要大纲"
                        allowClear
                        className={styles.select}
                        onChange={handleChangeOutline}
                      >
                        {OUTLINE_STATUS_LIST.map(({ id, value }) => (
                          <Option key={id} value={id}>
                            {value}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item label="是否需要大纲">
                      <div className={outlineFlag === null ? styles.error : ""}>
                        {outlineFlag !== null
                          ? OUTLINE_STATUS_LIST[Number(outlineFlag)]?.value
                          : "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                {showOutlineTime && (
                  <Col span={8}>
                    {edit ? (
                      <Form.Item
                        label="大纲截止时间"
                        name="outlineDeadline"
                        rules={[
                          { required: true, message: "请选择大纲截止时间" },
                        ]}
                      >
                        <DatePickers
                          showTime
                          // disabledDate={disabledCurrentDate}
                          format="YYYY-MM-DD HH:mm"
                          showNow={false}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item label="大纲截止时间">
                        <div className={!outlineDeadline ? styles.error : ""}>
                          {outlineDeadline || "未设置"}
                        </div>
                      </Form.Item>
                    )}
                  </Col>
                )}

                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="脚本截止时间"
                      name="scriptDeadline"
                      rules={[
                        { required: true, message: "请选择脚本截止时间" },
                        // ({ getFieldValue }) => ({
                        //   validator(_, value) {
                        //     if (
                        //       getFieldValue("outlineDeadline") &&
                        //       value < getFieldValue("outlineDeadline")
                        //     ) {
                        //       return Promise.reject(
                        //         new Error("脚本截止时间不能早于大纲截止时间")
                        //       );
                        //     }
                        //     return Promise.resolve();
                        //   },
                        // }),
                      ]}
                    >
                      <DatePickers
                        showTime
                        // disabledDate={disabledScriptDate}
                        format="YYYY-MM-DD HH:mm"
                        showNow={false}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="脚本截止时间">
                      <div className={!scriptDeadline ? styles.error : ""}>
                        {scriptDeadline || "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                <Col span={8}>
                  {edit ? (
                    <Form.Item
                      label="视频初稿截止时间"
                      name="videoDraftDeadline"
                      rules={[
                        { required: true, message: "请选择视频初稿截止时间" },
                        // ({ getFieldValue }) => ({
                        //   validator(_, value) {
                        //     if (
                        //       getFieldValue("scriptDeadline") &&
                        //       value < getFieldValue("scriptDeadline")
                        //     ) {
                        //       return Promise.reject(
                        //         new Error(
                        //           "视频初稿截止时间不能早于脚本截止时间"
                        //         )
                        //       );
                        //     }
                        //     return Promise.resolve();
                        //   },
                        // }),
                      ]}
                    >
                      <DatePickers
                        showTime
                        // disabledDate={disabledVideoDraftDate}
                        format="YYYY-MM-DD HH:mm"
                        showNow={false}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="视频初稿截止时间">
                      <div className={!videoDraftDeadline ? styles.error : ""}>
                        {videoDraftDeadline || "未设置"}
                      </div>
                    </Form.Item>
                  )}
                </Col>

                <Col span={8} className={styles.contentTipWrap}>
                  {edit ? (
                    <>
                      <Form.Item
                        label="视频发布截止时间"
                        name="publishVideoDeadline"
                        rules={[
                          { required: true, message: "请选择视频发布截止时间" },
                          // ({ getFieldValue }) => ({
                          //   validator(_, value) {
                          //     if (
                          //       getFieldValue("videoDraftDeadline") &&
                          //       value < getFieldValue("videoDraftDeadline")
                          //     ) {
                          //       return Promise.reject(
                          //         new Error("初稿截止时间不能早于发布截止时间")
                          //       );
                          //     }
                          //     return Promise.resolve();
                          //   },
                          // }),
                        ]}
                      >
                        <DatePickers
                          showTime
                          // disabledDate={disableDate}
                          // getPopupContainer={() =>
                          //   document.getElementById("myPublishDate")
                          // }
                          format="YYYY-MM-DD HH:mm"
                          // renderExtraFooter={() =>
                          //   outDay.length ? "红色日期表示已成单" : ""
                          // }
                          onFocus={handleFocus}
                          showNow={false}
                        />
                      </Form.Item>
                      <p className={styles.contentTip}>
                        修改视频发布截止时间将会自动同步修改订单档期
                      </p>
                    </>
                  ) : (
                    <>
                      <Form.Item label="视频发布截止时间">
                        <div
                          className={!publishVideoDeadline ? styles.error : ""}
                        >
                          {publishVideoDeadline || "未设置"}
                        </div>
                      </Form.Item>
                      <p className={styles.contentTip}>
                        修改视频发布截止时间将会自动同步修改订单档期
                      </p>
                    </>
                  )}
                </Col>
                <Col span={8}>
                  {edit ? (
                    <Form.Item label="履约延期" name="performDelayFlag">
                      <Select
                        placeholder="请选择"
                        allowClear
                        className={styles.select}
                      >
                        {delayTypeList.map(({ dictValue, dictLabel }) => (
                          <Option key={dictValue} value={dictValue}>
                            {dictLabel}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item label="履约延期">
                      {performDelayFlagName || "--"}
                    </Form.Item>
                  )}
                </Col>
                {/* 0为自营 3为海盗  签约、媒介显示平台任务id */}
                {/* {+orderBelongType !== 0 && +orderBelongType !== 3 && (
                  <Col span={8}>
                    {showPlatTaskId ? (
                      <Form.Item
                        label="平台任务ID："
                        name="platTaskId"
                        rules={[
                          { required: true, message: "请输入平台任务ID" },
                        ]}
                      >
                        {edit ? <Input /> : platTaskId || "--"}
                      </Form.Item>
                    ) : (
                      ""
                    )}
                  </Col>
                )} */}
              </Row>
            </Form>
          </div>
        </WorkItemBox>
        {/* 录入执行计划弹窗 */}
        {showConfirmModal && (
          <Modal
            visible={showConfirmModal}
            closable={false}
            footer={
              <>
                <Button type="default" onClick={handleCancelConfirm}>
                  取消
                </Button>
                <Button type="primary" onClick={handleConfirmOk}>
                  标记延期
                </Button>
              </>
            }
            onCancel={() => {
              setShowConfirmModal(false);
            }}
          >
            <p>
              视频发布截止时间大于原定档期，该订单是否需要自动标记为履约延期?若需要请选择延期原因？
            </p>
            <Select
              className="m-t-24"
              placeholder="请选择履约延期原因"
              allowClear
              onChange={handleSelectDelayReason}
            >
              {delayTypeList.slice(1).map(({ dictValue, dictLabel }) => (
                <Option key={dictValue} value={dictValue}>
                  {dictLabel}
                </Option>
              ))}
            </Select>
          </Modal>
        )}
      </div>
    </ConfigProvider>
  );
};

export default ExecutionPlan;

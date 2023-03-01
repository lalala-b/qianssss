import { Button, message, Form, Col, Row, Input, Modal } from "antd";
import { useContext, useState, useEffect } from "react";
import cs from "classnames";
import { $confirmDraft, $checkTaskId } from "src/api/workOrderDetail";
import WorkTtemBox from "../WorkItemBox/WorkItemBox";
import { DetailContext } from "../../DetailProvider";
import styles from "./ConfirmDraft.scss";

// const { Option } = Select;
const { confirm } = Modal;

// const VIDEO_DRAFT_STATUS = [
//   { value: 0, label: "未确认" },
//   { value: 1, label: "已确认" },
// ];

const confirmDraft: React.FC = () => {
  const [confirmDraftForm] = Form.useForm();
  const {
    detail: {
      confirmDraftNodeAndFieldBO: {
        confirmDraftNodeBO: {
          nodeStep = undefined,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          orderNo = "",
          nodeStatus = 0,
          timeIntervalDesc = "",
          cancelReasonTypeDesc = "",
          overtimeStatus = 0,
          platTaskId = "",
          isVideoConfirm = 0,
          updateTime = "",
        } = {},
      } = {},
      orderBaseInfoBO: {
        orderStatus = "",
        orderBelongType = -1,
        busOrderType = "",
        platId = 0,
      } = {},
      confirmOrderNodeAndFieldBO: {
        confirmOrderNodeBO: { platOrderMoney = 0 } = {},
      } = {},
      confirmPaymentNodeAndFieldBO = {},
    },
    // loading,
    setLoading,
    onRefresh,
  } = useContext(DetailContext);
  const [edit, setEdit] = useState<boolean>(false);
  const [showPlatTaskId, setShowPlatTaskId] = useState<boolean>(false);
  const [platTaskIdVal, setPlatTaskIdVal] = useState<string>("");
  const [btnLoading, setBtnLoading] = useState(false);

  const submit = async () => {
    const paramsTemp = {
      platTaskId: platTaskIdVal || platTaskId,
      orderNo,
      orderStatus: nodeStep,
    };

    setLoading(true);
    try {
      await $confirmDraft(paramsTemp);
      message.success("操作成功");
      onRefresh();
      setEdit(false);
    } catch (error: any) {
      setLoading(false);
      message.error(error);
    }
  };

  const handleEdit = () => {
    // 已核账
    if (+orderStatus === 10) {
      message.error("已核账的工单不再支持修改信息");
      return;
    }

    confirmDraftForm.setFieldsValue({
      isVideoConfirm,
      platTaskId,
    });

    setEdit(true);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  // 根据校验结果返回对应的内容文案和按钮文案
  const handleGetCheckContent = (flag: number, type: string) => {
    let content = "";
    let confirmBtnText = "";
    let cancelBtnText = "";

    // flag为2：录入的任务ID和爬取的星图ID不匹配
    // flag为3：录入的任务ID匹配，但工单的【实际】官方平台下单价和星图的【订单金额】不匹配

    // 弹窗提示内容
    if (type === "content") {
      switch (flag) {
        case 2:
          content = "此任务ID和星图实际任务ID不匹配，确认要录入？";
          break;
        case 3:
          content =
            "平台任务ID匹配成功，但商务录入的“平台下单价”和此任务ID对应的星图下单价不匹配，建议保存后联系商务去确认平台下单价是否有录错，以免影响核账";
          break;
        default:
          break;
      }
      return content;
    }
    // 确认按钮的文案
    if (type === "confirmBtnText") {
      switch (flag) {
        case 2:
          confirmBtnText = "返回检查";
          break;
        case 3:
          confirmBtnText = "确认";
          break;
        default:
          break;
      }
      return confirmBtnText;
    }
    // 取消按钮的文案
    if (type === "cancelBtnText") {
      switch (flag) {
        case 2:
          cancelBtnText = "坚持保存";
          break;
        case 3:
          cancelBtnText = "取消";
          break;
        default:
          break;
      }
      return cancelBtnText;
    }
    return "";
  };

  const handleChangeSubmitStatus = async (editFlag: 0 | 1) => {
    await confirmDraftForm.validateFields();

    // 二次确认相关信息填写是否正确的弹窗提示
    function handleSecondConfirm() {
      if (editFlag === 0) {
        // 代表进行中
        confirm({
          icon: "",
          content: "确定相关信息均已填写正确",
          async onOk() {
            submit();
          },
        });
        return;
      }
      submit();
    }

    try {
      setBtnLoading(true);
      const { platTaskStatusType } = await $checkTaskId({
        platTaskId: platTaskIdVal || platTaskId,
        moneyAmount: platOrderMoney,
      });

      setBtnLoading(false);
  
      // 2为录入的任务ID和爬取的星图ID不匹配
      // 3为录入的任务ID匹配，但工单的【实际】官方平台下单价和星图的【订单金额】不匹配
      // 若平台为抖音，有平台任务id的填写框，且校验为不匹配的情况下，才弹出对应的提示弹窗
      if (
        platId === 25 &&
        showPlatTaskId &&
        (platTaskStatusType === 2 || platTaskStatusType === 3)
      ) {
        confirm({
          title: "提示",
          content: handleGetCheckContent(platTaskStatusType, "content"),
          okText: handleGetCheckContent(platTaskStatusType, "confirmBtnText"),
          cancelText: handleGetCheckContent(platTaskStatusType, "cancelBtnText"),
          cancelButtonProps:
            platTaskStatusType === 2
              ? {
                  type: "ghost",
                  danger: true,
                }
              : {},
          async onOk() {
            if (platTaskStatusType === 3) {
              handleSecondConfirm();
            }
          },
          async onCancel() {
            if (platTaskStatusType === 2) {
              handleSecondConfirm();
            }
          },
        });
      } else {
        handleSecondConfirm();
      }
    } catch (e: any) {
      setBtnLoading(false)
      message.error(e?.message)
    }

  };

  // const confirmDraftValidate = (rule: any, value: any, callback: any) => {
  //   if (!value) {
  //     callback('视频初稿需确认');
  //   } else {
  //     callback();
  //   }
  // }

  const handleChangePlatTaskId = (e: any) => {
    setPlatTaskIdVal(e.target.value);
  };

  useEffect(() => {
    // 0为自营 3为海盗 逻辑一致
    // if (!orderBelongType || +orderBelongType === 3) {
    //   setShowPlatTaskId(
    //     (+busOrderType === 1 || +busOrderType === 2) &&
    //       (+platId === 25 || +platId === 2)
    //   );
    // } else
    // 签约订单归属类型
    if (orderBelongType === 1) {
      const { confirmPaymentNodeBO } =
        (confirmPaymentNodeAndFieldBO as any) || {};
      const { paymentType } = confirmPaymentNodeBO || {};

      setShowPlatTaskId(
        (+busOrderType === 1 || +busOrderType === 2 || +busOrderType === 3) && // 客户自行下单 或 代客下单 或 平台营收
          +paymentType === 1 && // 付款类型
          (+platId === 25 || +platId === 2) // 抖音 或 B站 平台
      );
    } else {
      setShowPlatTaskId(false);
    }
  }, [orderBelongType]);

  return (
    <>
      <WorkTtemBox
        title="确认视频初稿"
        operatorUserName={`${
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") || "待定"
        }`}
        nodeStatus={nodeStatus}
        timeIntervalDesc={timeIntervalDesc}
        overtimeStatus={overtimeStatus}
        cancelOrderReason={cancelReasonTypeDesc}
        updateTime={updateTime}
        allBtn={
          // <div>
          //   {/* 进行中 */}
          //   {Number(nodeStatus) === 1 && editAuth && (
          //     <Popconfirm
          //       title="确定视频初稿和客户确认完毕？"
          //       onConfirm={handleConfirm}
          //       okText="确认"
          //       cancelText="取消"
          //     >
          //       <Button
          //         className={styles.successButton}
          //         loading={loading}
          //         type="primary"
          //         disabled={!editAuth}
          //       >
          //         确认无误
          //       </Button>
          //     </Popconfirm>
          //   )}
          // </div>

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
                        loading={btnLoading}
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={() => handleChangeSubmitStatus(0)}
                      >
                        初稿确认无误
                      </Button>
                      <Button onClick={handleCancel}>取消</Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={handleEdit}>
                      去确认
                    </Button>
                  ))}
                {/* 已完成 */}
                {Number(nodeStatus) === 2 &&
                  (edit ? (
                    <>
                      <Button
                        type="primary"
                        loading={btnLoading}
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={() => handleChangeSubmitStatus(1)}
                      >
                        初稿确认无误
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
        {showPlatTaskId ? (
          <div className={cs(styles.wrapper, "m-t-24")}>
            <Form form={confirmDraftForm}>
              <Row gutter={24}>
                {/* <Col span={8}>
                {edit ? (
                  <Form.Item
                    label="视频初稿"
                    name="isVideoConfirm"
                    rules={[{ required: true, message: "" }, { validator: confirmDraftValidate }]}
                  >
                    <Select
                      placeholder="请选择确认状态"
                      allowClear
                      disabled={disabledVideoConfirm}
                      className={styles.select}
                      value={isVideoConfirm}
                    >
                      {VIDEO_DRAFT_STATUS.map(({ value, label }) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <Form.Item label="视频初稿">
                    <div
                      className={isVideoConfirm === null ? styles.error : ""}
                    >
                      {isVideoConfirm !== null
                        ? VIDEO_DRAFT_STATUS[Number(isVideoConfirm)]?.label
                        : "未设置"}
                    </div>
                  </Form.Item>
                )}
              </Col> */}

                {/* 0为自营 3为海盗  签约、媒介显示平台任务id */}
                {/* {+orderBelongType !== 0 && +orderBelongType !== 3 && ( */}
                <Col span={8}>
                  {/* {showPlatTaskId ? ( */}
                  <Form.Item
                    label="平台任务ID："
                    name="platTaskId"
                    getValueFromEvent={e => e.target.value.replace(/\s+/g, "")}  // 屏蔽掉空格
                    rules={[{ required: true, message: "平台任务ID不能为空" }]}
                  >
                    {edit ? (
                      <Input
                        placeholder="请填写平台任务ID"
                        onChange={(e: any) => handleChangePlatTaskId(e)}
                      />
                    ) : (
                      platTaskId || <span className={styles.error}>待填写</span>
                    )}
                  </Form.Item>
                  {/* ) : (
                      ""
                    )} */}
                </Col>
                {/* )} */}
              </Row>
            </Form>
          </div>
        ) : (
          ""
        )}
      </WorkTtemBox>
    </>
  );
};

export default confirmDraft;

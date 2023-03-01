import { Row, Col, Form, Button, Input, Modal, message } from "antd";
import { useState, useContext, useEffect } from "react";
import cs from "classnames";
import {
  $publishVideo,
  VideoListType,
  $checkTaskId,
} from "src/api/workOrderDetail";
import IconTip from "src/components/IconTip";
import WorkTtemBox from "../WorkItemBox";
import VideoList from "./VideoList";
import { DetailContext } from "../../DetailProvider";
import styles from "./PublishVideo.scss";

interface VideoFormDataType {
  platTaskId: string;
}

const PublishVideo: React.FC = () => {
  const {
    detail: {
      orderBaseInfoBO: {
        busOrderType = 0,
        platId = 0,
        accountId = 0,
        orderBelongType = -1,
        orderStatus = "",
      } = {},
      publishVideoNodeAndFieldBO: {
        publishVideoNodeBO: {
          flowId = 0,
          titleName = "",
          addTime = 0,
          url = "",
          platTaskId = "",
          overtimeStatus = 0,
          timeIntervalDesc = "",
          nodeStatus = 0,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          reconciliationStatus = 0,
          cancelReasonTypeDesc = "",
          orderNo = "",
          nodeStep = 0,
          autoBindDesc = "", // 是否已自动绑定视频
          updateTime = "",
        } = {},
      } = {},
      confirmOrderNodeAndFieldBO: {
        confirmOrderNodeBO: { platOrderMoney = 0 } = {},
      } = {},
    },
    setLoading,
    onRefresh,
  } = useContext(DetailContext);

  const { detail } = useContext(DetailContext);

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [showVideoList, setShowVideoList] = useState<boolean>(false);
  const [selectVideoMsg, setSelectVideoMsg] = useState<VideoListType[]>([]);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoAddTime, setVideoAddTime] = useState<number>(0);
  const [videoFlowId, setVideoFlowId] = useState<number>(0);
  const [btnLoading, setBtnLoading] = useState(false);
  const [platTaskIdVal, setPlatTaskIdVal] = useState<string>("");
  const [showPlatTaskId, setShowPlatTaskId] = useState<boolean>(false);

  const [form] = Form.useForm();
  const { info, confirm } = Modal;

  const handleCancelEdit = () => {
    if (!videoTitle && !selectVideoMsg[0]) {
      setVideoTitle(titleName);
      setVideoAddTime(addTime);
    }
    setIsEdit(false);
  };

  const handleBindVideo = () => {
    setShowVideoList(true);
  };

  const handleCloseVideoList = () => {
    setShowVideoList(false);
  };

  const handleDeleteSelectVideoMsg = () => {
    setSelectVideoMsg([]);
    setVideoTitle("");
    setVideoAddTime(0);
  };

  const getDate = (time: number) => {
    if (!time) {
      return "--";
    }
    const date = new Date(time);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const handleChangePlatTaskId = (e: any) => {
    setPlatTaskIdVal(e.target.value);
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

  const handleSubmitVideoMsg = async () => {
    await form.validateFields();
    
    function handleConfirm() {
      confirm({
        content: "确认相关信息均已填写正确",
        icon: "",
        cancelText: "取消",
        okText: "确认",
        onOk() {
          form.submit();
        },
      });
    }

    try {
      setBtnLoading(true)
      const { platTaskStatusType } = await $checkTaskId({
        platTaskId: platTaskIdVal || platTaskId,
        moneyAmount: platOrderMoney,
      });
      setBtnLoading(false)
  
      // 2为录入的任务ID和爬取的星图ID不匹配
      // 3为录入的任务ID匹配，但工单的【实际】官方平台下单价和星图的【订单金额】不匹配
      // 若平台为抖音，订单归属为自营或海盗自营，有平台任务id的填写框，且校验为不匹配的情况下，才弹出对应的提示弹窗
      if (
        platId === 25 &&
        (!orderBelongType || +orderBelongType === 3) &&
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
              handleConfirm();
            }
          },
          async onCancel() {
            if (platTaskStatusType === 2) {
              handleConfirm();
            }
          },
        });
      } else {
        handleConfirm();
      }
    } catch (e: any) {
      message.error(e?.message)
      setBtnLoading(false)
    }
  };

  const handleFinishForm = async (val: VideoFormDataType) => {
    try {
      const { platTaskId } = val;
      if (!videoTitle && !selectVideoMsg[0]?.titleName) {
        message.error("请选择绑定视频");
        return;
      }
      setLoading(true);
      setBtnLoading(true);
      const { flowId = 0 } = selectVideoMsg[0] || {};
      await $publishVideo({
        platTaskId,
        flowId: flowId || videoFlowId,
        orderStatus: nodeStep,
        orderNo,
        editFlag: nodeStatus === 1 && editAuth ? 0 : 1,
      });
      setBtnLoading(false);
      message.success("操作成功", () => {
        setIsEdit(false);
        onRefresh();
        // setLoading(false);
      });
    } catch (e: any) {
      setLoading(false);
      setBtnLoading(false);
      message.error(e.message);
    }
  };

  const handleEdit = () => {
    if (reconciliationStatus) {
      info({
        content: "已核账的工单不再支持修改信息",
        icon: "",
        okText: "确认",
        onOk() {
          console.info("ok");
        },
      });
      return;
    }
    setIsEdit(true);
  };

  const handleSelectVideoMsg = (val: VideoListType[]) => {
    setSelectVideoMsg(val);
    handleCloseVideoList();
  };

  useEffect(() => {
    form.setFieldValue("platTaskId", platTaskId);

    return () => {
      //
    };
  }, [platTaskId]);

  useEffect(() => {
    setVideoTitle(titleName);

    return () => {
      //
    };
  }, [titleName]);

  useEffect(() => {
    setVideoAddTime(addTime);

    return () => {
      //
    };
  }, [addTime]);

  useEffect(() => {
    setVideoFlowId(flowId);

    return () => {
      //
    };
  }, [flowId]);

  // 是否显示平台任务ID的逻辑
  useEffect(() => {
    // 自营订单类型、海盗视频工单（【商单类型】为：客户自行下单或代客下单或平台营收；且工单的账号平台是【抖音】和【B站】）
    if (!orderBelongType || +orderBelongType === 3) {
      setShowPlatTaskId(
        (+busOrderType === 1 || +busOrderType === 2 || +busOrderType === 3) &&
          (+platId === 25 || +platId === 2)
      );
    }
    // 签约订单类型（【商单类型】为客户自行下单和代客下单或平台营收；【收付款类型】选择了应向达人付款；且工单的账号平台是【抖音】和【B站】）
    else if (orderBelongType === 1) {
      const { paymentType } =
        detail.confirmPaymentNodeAndFieldBO.confirmPaymentNodeBO;
      setShowPlatTaskId(
        (+busOrderType === 1 || +busOrderType === 2 || +busOrderType === 3) &&
          +paymentType === 1 &&
          (+platId === 25 || +platId === 2)
      );
    }
  }, [orderBelongType]);

  return (
    <>
      <WorkTtemBox
        title="发布视频"
        nodeStatus={nodeStatus}
        timeIntervalDesc={timeIntervalDesc}
        overtimeStatus={overtimeStatus}
        operatorUserName={`${
          autoBindDesc ||
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") ||
          "待定"
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
                  (isEdit ? (
                    <>
                      <Button
                        type="primary"
                        loading={btnLoading}
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={handleSubmitVideoMsg}
                      >
                        保存并提交
                      </Button>
                      <Button onClick={handleCancelEdit}>取消</Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={handleEdit}>
                      去绑定
                    </Button>
                  ))}
                {/* 已完成 */}
                {Number(nodeStatus) === 2 &&
                  (isEdit ? (
                    <>
                      <Button
                        type="primary"
                        loading={btnLoading}
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={handleSubmitVideoMsg}
                      >
                        确认
                      </Button>
                      <Button onClick={handleCancelEdit}>取消</Button>
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
        <div className={cs(styles.contentWrap, "m-t-24")}>
          <Form form={form} onFinish={handleFinishForm} className="m-t-24">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="绑定视频："
                  name="selectedVideo"
                  // rules={[{ required: true, message: "请绑定视频" }]}
                >
                  {isEdit && !(videoTitle || selectVideoMsg[0]?.titleName) ? (
                    <>
                      <Button type="primary" onClick={handleBindVideo}>
                        绑定视频
                      </Button>
                      <IconTip content="系统会根据【录入执行计划】步骤中的“视频发布截止时间”，在当天凌晨自动抓取视频，若当天没有视频发布，或者发布了超过1条的视频，自动抓取将失效，需人工手动绑定视频" />
                    </>
                  ) : videoTitle || selectVideoMsg[0]?.titleName ? (
                    <a
                      href={selectVideoMsg[0]?.url || url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectVideoMsg[0]?.titleName || videoTitle}
                    </a>
                  ) : (
                    "--"
                  )}
                  {isEdit && (videoTitle || selectVideoMsg[0]?.titleName) ? (
                    <Button
                      type="link"
                      danger
                      onClick={handleDeleteSelectVideoMsg}
                    >
                      删除
                    </Button>
                  ) : (
                    ""
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="视频发布时间：">
                  {videoAddTime || selectVideoMsg[0]?.addTime
                    ? getDate(videoAddTime || selectVideoMsg[0]?.addTime || 0)
                    : "--"}
                </Form.Item>
              </Col>
              {/* 自营、海盗的显示 */}
              {(+orderBelongType === 0 || +orderBelongType === 3) && (
                <Col span={8}>
                  {showPlatTaskId ? (
                    <Form.Item
                      label="平台任务ID："
                      name="platTaskId"
                      getValueFromEvent={e => e.target.value.replace(/\s+/g, "")}
                      rules={[{ required: true, message: "请输入平台任务ID" }]}
                    >
                      {isEdit ? (
                        <Input
                          onChange={(e: any) => handleChangePlatTaskId(e)}
                        />
                      ) : (
                        platTaskId || "--"
                      )}
                    </Form.Item>
                  ) : (
                    ""
                  )}
                </Col>
              )}
            </Row>
          </Form>
        </div>
      </WorkTtemBox>
      <VideoList
        accountId={accountId}
        show={showVideoList}
        onClose={handleCloseVideoList}
        onSelectVideoMsg={handleSelectVideoMsg}
      />
    </>
  );
};

export default PublishVideo;

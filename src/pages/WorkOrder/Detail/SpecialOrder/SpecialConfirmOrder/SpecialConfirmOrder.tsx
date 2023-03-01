/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import { Button, message, Modal, Input, ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import cs from "classnames";
import { $editConfirmOrderInfo, $revokeOrder } from "src/api/workOrderDetail";
import { DetailContext } from "../../DetailProvider";
import WorkItemBox from "../../WorkDetailComponets/WorkItemBox";
import SpecialSignConfirmOrder from "./SpecialSignConfirmOrder";
import SpecialSelfConfirmOrder from "./SpecialSelfConfirmOrder";
import SpecialMediumConfirmOrder from "./SpecialMediumConfirmOrder";
import styles from "./SpecialConfirmOrder.scss";

const { TextArea } = Input;
const { confirm } = Modal;

const SpecialConfirmOrder = () => {
  const {
    detail: {
      confirmOrderNodeAndFieldBO: {
        confirmOrderNodeBO: {
          nodeStatus = undefined,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          cancelReasonTypeDesc = "",
          editAuth = false,
          updateTime = "",
        } = {},
      } = {},
      orderBaseInfoBO: {
        orderNo = "",
        orderStatus = "",
        orderBelongType = "",
        busOrderType = -1,
      } = {},
    },
    loading,
    setLoading,
    onRefresh,
  } = useContext(DetailContext);
  const [edit, setEdit] = useState(false);
  const [needSubmit, setSubmit] = useState(false);
  const [editFlag, setEditFlag] = useState<0 | 1>(0);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmRevokeLoading, setConfirmRevokeLoading] = useState(false);
  const [confirmButtonLoading, setConfirmButtonLoading] = useState(false);

  const handleEdit = () => {
    // 已核账
    if (+orderStatus === 10) {
      message.error("已核账的工单不再支持修改信息");
      return;
    }

    setEdit(true);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  // const handleShowRevoke = () => {
  //   // 已核账
  //   if (+orderStatus === 10) {
  //     message.error("已核账的工单不再支持撤单");
  //     return;
  //   }
  //   setReason("");
  //   setShowRevokeModal(true);
  // };

  const handleConfirmRevoke = async () => {
    if (!reason.trim()) {
      message.error("撤单原因不能为空");
      return;
    }
    confirm({
      icon: "",
      content: "确认取消合作？一旦确认取消将无法恢复",
      async onOk() {
        try {
          setConfirmRevokeLoading(true);
          const params = {
            cancelOrderReason: reason,
            cancelOrderStatus: 1,
            orderStatus: +orderStatus,
            orderNo,
          };

          await $revokeOrder(params);
          message.success("撤单成功");
          setConfirmRevokeLoading(false);
          setShowRevokeModal(false);
          onRefresh();
        } catch (e: any) {
          setConfirmRevokeLoading(false);
          message.error(String(e.message) || "撤单失败，请重试");
        }
      },
    });
  };

  const handleCancelRevoke = () => {
    setShowRevokeModal(false);
  };

  const handleChangeReason = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  const handleSubmit = async (params: any) => {
    try {
      setConfirmButtonLoading(true);
      await $editConfirmOrderInfo({
        ...params,
        editFlag,
        orderNo,
        orderStatus,
      });
      message.success("操作成功");
      setConfirmButtonLoading(false);
      handleCancel();
      onRefresh();
    } catch (e: any) {
      setLoading(false);
      setConfirmButtonLoading(false);
      message.error(String(e.message));
    }
  };

  const handleChangeSubmitStatus = async (editFlag: 0 | 1) => {
    if (editFlag === 0) {
      // 代表进行中
      confirm({
        icon: "",
        content: "确定相关信息均已填写正确",
        async onOk() {
          setSubmit(true);
          setEditFlag(editFlag);
          setTimeout(() => {
            setSubmit(false);
          });
        },
      });
      return;
    }
    setSubmit(true);
    setEditFlag(editFlag);
    setTimeout(() => {
      setSubmit(false);
    });
  };

  useEffect(() => {
    // 根据loading为false 重置状态 来修改是否调起子组件提交
    // 子组件每次提交后需要改变为真后再次该回
    if (!loading) {
      setSubmit(false);
    }
  }, [loading]);

  return (
    <ConfigProvider locale={zhCN}>
      <div>
        <WorkItemBox
          title="确认下单信息"
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
                  {/* {!edit && (
                    <Button
                      className="m-r-6"
                      type="primary"
                      danger
                      onClick={handleShowRevoke}
                    >
                      取消合作
                    </Button>
                  )} */}
                  {/* 进行中 */}
                  {Number(nodeStatus) === 1 &&
                    (edit ? (
                      <>
                        <Button
                          loading={confirmButtonLoading}
                          type="primary"
                          className={cs(styles.successButton, "m-r-6")}
                          onClick={() => handleChangeSubmitStatus(0)}
                        >
                          确认无误
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
                          loading={confirmButtonLoading}
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
            {/* 签约 */}
            {+orderBelongType === 1 && (
              <SpecialSignConfirmOrder
                editInfo={edit}
                submit={needSubmit}
                onSubmit={handleSubmit}
                busOrderType={busOrderType}
              />
            )}

            {/* 自营 */}
            {+orderBelongType === 0 && (
              <SpecialSelfConfirmOrder
                editInfo={edit}
                submit={needSubmit}
                onSubmit={handleSubmit}
                busOrderType={busOrderType}
              />
            )}

            {/* 媒介 */}
            {+orderBelongType === 2 && (
              <SpecialMediumConfirmOrder
                editInfo={edit}
                submit={needSubmit}
                onSubmit={handleSubmit}
                busOrderType={busOrderType}
              />
            )}
          </div>

          <Modal
            title="填写取消合作原因"
            visible={showRevokeModal}
            onOk={handleConfirmRevoke}
            confirmLoading={confirmRevokeLoading}
            onCancel={handleCancelRevoke}
            okText="提交"
          >
            <TextArea
              showCount
              rows={4}
              maxLength={100}
              value={reason}
              onChange={handleChangeReason}
              placeholder="请输入取消合作原因"
            />
          </Modal>
        </WorkItemBox>
      </div>
    </ConfigProvider>
  );
};

export default SpecialConfirmOrder;

import { Popconfirm, Button, message } from "antd";
import { useContext } from "react";
import { $confirmOutline } from "src/api/workOrderDetail";
import WorkTtemBox from "../WorkItemBox";
import { DetailContext } from "../../DetailProvider";
import styles from "./ConfirmOutline.scss";

const ConfirmOutline: React.FC = () => {
  const {
    detail: {
      confirmOutlineNodeAndFieldBO: {
        confirmOutlineNodeBO: {
          nodeStep = undefined,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          orderNo = "",
          nodeStatus = 0,
          timeIntervalDesc = "",
          overtimeStatus = 0,
          cancelReasonTypeDesc = "",
          updateTime = "",
        } = {},
      } = {},
      executePlanNodeAndFieldBO: {
        executePlanNodeBO: {
          orderFlag = null,
        } = {},
      } = {},
    },
    loading,
    setLoading,
    onRefresh,
  } = useContext(DetailContext);
  const confirmOutline = async (flag?: number) => {
    const params = {
      changeOrderFlag: flag || null, // 0-否 1-是
      orderNo,
      orderStatus: nodeStep, // nodeStep
    };
    setLoading(true);
    try {
      await $confirmOutline(params);
      message.success("操作成功");
      onRefresh();
    } catch (error: any) {
      setLoading(false);
      message.error(error);
    }
  };
  const handleConfirm = async () => {
    if (orderFlag === 0) {
      return;
    }
    confirmOutline();
  };
  const handleCancelEdit = () => {
    confirmOutline(0);
  };
  const handleConfirmEdit = () => {
    confirmOutline(1);
  };
  return (
    <>
      <WorkTtemBox
        title="确认大纲"
        operatorUserName={`${
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") || "待定"
        }`}
        cancelOrderReason={cancelReasonTypeDesc}
        nodeStatus={nodeStatus}
        timeIntervalDesc={timeIntervalDesc}
        overtimeStatus={overtimeStatus}
        updateTime={updateTime}
        allBtn={
          <div>
            {/* 进行中 */}
            {Number(nodeStatus) === 1 && editAuth && (
              <Popconfirm
                title="确定大纲已经和客户确认完毕？"
                onConfirm={handleConfirm}
                okText={
                  orderFlag === 0 ? (
                    <Popconfirm
                      title="检测到该工单目前显示为“未下单”的状态，否则自动变更为“已下单”？"
                      onConfirm={handleConfirmEdit}
                      onCancel={handleCancelEdit}
                      okText="变更"
                      cancelText="不变更"
                    >
                      <Button size="small" type="primary" disabled={!editAuth}>
                        确认
                      </Button>
                    </Popconfirm>
                  ) : (
                    "确认"
                  )
                }
                cancelText="取消"
              >
                <Button
                  className={styles.successButton}
                  loading={loading}
                  type="primary"
                  disabled={!editAuth}
                >
                  确认无误
                </Button>
              </Popconfirm>
            )}
          </div>
        }
      />
    </>
  );
};

export default ConfirmOutline;

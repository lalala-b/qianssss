/* eslint-disable css-modules/no-unused-class */
import { useContext, useEffect, useState } from "react";
import { Button, ConfigProvider, Modal, Input, message } from "antd";
import { $financeOk } from "src/api/invoiceDetail";
import cs from "classnames";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox/WorkItemBox";
import styles from "./CollectionApproval.scss";

const { TextArea } = Input;

const CollectionApproval = () => {
  const {
    invoiceProcessStep = 0,
    financeUserName,
    isFinanceOk = 0,
    businessOrderId,
    from = "",
    onRefresh,
    failMsg,
    setLoading,
    financeUserNameList,
  } = useContext(DetailContext);
  const { $permission } = window;
  const [failMsgStr, setFailMsg] = useState<string>("");
  const [isModalNoPass, setIsModalNopass] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleTextrea = (e: any) => {
    setFailMsg(e.target.value);
  };
  const handleApprovalPass = () => {
    setIsModalOpen(true);
  };
  const handleApprovalNoPass = () => {
    setIsModalNopass(true);
  };
  const RejectOrOk = async (isFinanceOk: number) => {
    const params = {
      isFinanceOk,
      businessOrderId,
      failMsg: failMsgStr,
    };
    try {
      setLoading(true)
      await $financeOk({ ...params });
      setIsModalNopass(false);
      setIsModalOpen(false);
      onRefresh();
    } catch (e: any) {
      setLoading(false)
      message.error(e.message);
    }
  };
  const [nodeStatus, setNodeStatus] = useState<number>(0);
  // isFinanceOk: 0进行中 1通过  2驳回
  useEffect(() => {
    if ([0, 1, 2, 3].includes(+invoiceProcessStep)) {
      setNodeStatus(0);
    } else if (+invoiceProcessStep === 4) {
      if (+isFinanceOk === 0) setNodeStatus(1);
      if (+isFinanceOk === 1) {
        setNodeStatus(2);
      }
      if (+isFinanceOk === 2) setNodeStatus(3);
    }
  }, [invoiceProcessStep, isFinanceOk]);
  return (
    <ConfigProvider>
      <WorkItemBox
        title="回款信息审批"
        nodeStatus={nodeStatus}
        operatorUserNameList={financeUserNameList || []}
        operatorUserName={`${financeUserName || "待定"}`}
        cancelOrderReason={failMsg}
        isApproval={+isFinanceOk === 2}
        allBtn={
          <>
            <div>
              {nodeStatus === 1 &&
                $permission("receipt-information-approval") &&
                from === "financial" && (
                  <>
                    <Button
                      type="primary"
                      className={cs(styles.successButton, "m-r-12")}
                      onClick={() => handleApprovalPass()}
                    >
                      审批通过
                    </Button>
                    <Button
                      danger
                      className="m-r-12"
                      onClick={() => handleApprovalNoPass()}
                    >
                      不通过
                    </Button>
                  </>
                )}
            </div>
          </>
        }
      />
      {isModalOpen && (
        <Modal
          title={null}
          visible={isModalOpen}
          onOk={() => RejectOrOk(1)}
          okText="确认"
          cancelText="取消"
          onCancel={() => {
            setIsModalOpen(false);
          }}
        >
          <p>确定审批通过？</p>
        </Modal>
      )}
      {isModalNoPass && (
        <Modal
          title="填写驳回原因"
          visible={isModalNoPass}
          onOk={() => RejectOrOk(2)}
          okText="确认"
          cancelText="取消"
          onCancel={() => {
            setIsModalNopass(false);
          }}
        >
          <TextArea
            value={failMsgStr}
            onChange={handleTextrea}
            rows={4}
            placeholder="商务将在飞书上收到你的驳回原因"
            maxLength={100}
          />
        </Modal>
      )}
    </ConfigProvider>
  );
};

export default CollectionApproval;

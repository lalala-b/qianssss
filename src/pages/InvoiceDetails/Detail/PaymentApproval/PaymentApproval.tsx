/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import { Button, ConfigProvider, Modal } from "antd";
import cs from "classnames";
import {
  $getCostcenterByName,
  GetCostcenterByNameResType,
} from "src/api/oaPaymentApply";
import { GlobalContext } from "src/contexts/global";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox/WorkItemBox";
import styles from "./PaymentApproval.scss";

const PaymentApproval = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { globalData = {} } = useContext(GlobalContext);
  const isApproval = true;
  const {
    processStep,
    paymentStatus,
    failMsg,
    rebateType,
    applyAuth = 0,
    businessOrderId,
    detail: { rebateCorporate, rebatePrivate },
  } = useContext(DetailContext);
  const approvalList = new Map([
    [0, "审批中"],
    [1, "已通过"],
    [2, "被驳回"],
  ]);
  const [nodeStatus, setNodeStatus] = useState<number>(0);
  useEffect(() => {
    if ([0, 1].includes(+processStep)) {
      setNodeStatus(0);
    }
    if (+processStep === 2) {
      if (+paymentStatus === 0) {
        setNodeStatus(1);
      }
      if (+paymentStatus === 1) {
        setNodeStatus(2);
      }
      if (+paymentStatus === 2) {
        setNodeStatus(3);
      }
    }
  }, [processStep, paymentStatus]);
  const handleOAPayRequest = async () => {
    const res = await $getCostcenterByName({
      userName:
        globalData?.user?.userInfo?.email.substr(
          0,
          globalData?.user?.userInfo?.email.indexOf("@")
        ) || globalData?.user?.userInfo.name,
    });

    const info: GetCostcenterByNameResType = JSON.parse(res);

    if (info.userId) {
      const paymentAmount = rebateType === 2 ? rebateCorporate : rebatePrivate;
      localStorage.setItem("paymentAmount", paymentAmount as any);
      window.open(
        `${
          window.location.origin + window.location.pathname
        }#/qp/oa-payment-apply?type=${
          +rebateType === 2 ? 1 : 2
        }&businessId=${businessOrderId}`,
        "_self"
      );
    } else {
      setIsModalOpen(true);
    }
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  return (
    <ConfigProvider>
      <WorkItemBox
        title="付款申请审批"
        nodeStatus={nodeStatus}
        allBtn={
          <>
            {nodeStatus === 3 && +applyAuth === 1 ? (
              <Button type="primary" onClick={() => handleOAPayRequest()}>
                {+rebateType === 2
                  ? "再次发起OA付款申请（对公）"
                  : "再次发起OA付款申请（对私）"}
              </Button>
            ) : (
              ""
            )}
          </>
        }
        cancelOrderReason={failMsg || ""}
        isApproval={isApproval}
      >
        <div className={cs(styles.wrapper, "m-t-24")}>
          {+rebateType === 2 ? "对公付款申请状态：" : "对私付款申请状态："}
          {approvalList.get(+paymentStatus)}
        </div>
        {isModalOpen && (
          <Modal
            title="邮箱错误提醒"
            visible={isModalOpen}
            footer={
              <Button type="primary" onClick={handleOk}>
                确认
              </Button>
            }
            onCancel={() => {
              setIsModalOpen(false);
            }}
          >
            <p>
              系统检测到你的乾数据账号信息和OA账号的信息校验异常，请联系产品林良杰处理
            </p>
          </Modal>
        )}
      </WorkItemBox>
    </ConfigProvider>
  );
};

export default PaymentApproval;

/* eslint-disable css-modules/no-unused-class */
import { useContext, useEffect, useState } from "react";
import { ConfigProvider, Button } from "antd";
// import cs from "classnames";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox/WorkItemBox";
// import styles from "./OAInvoiceApproval.scss";

const OAInvoiceApproval = () => {
  const {
    invoiceProcessStep = "",
    invoiceFailMsg,
    invoiceStatus = 0,
    businessOrderId,
    instanceId,
    businessKey,
    applyAuth = 0,
    from = "",
  } = useContext(DetailContext);
  const isApproval = true;
  const [nodeStatus, setNodeStatus] = useState<number>(0);
  const handleApprovalagain = async () => {
    window.open(
      `${
        window.location.origin + window.location.pathname
      }#/qp/oa-invoice-apply?businessId=${businessOrderId}&instanceId=${instanceId}&businessKey=${businessKey}`,
      '_self');
  };
  useEffect(() => {
    if (+invoiceProcessStep === 0) {
      setNodeStatus(0);
    } else if (+invoiceProcessStep === 1) {
      if (+invoiceStatus === 2) {
        setNodeStatus(3);
      } else {
        setNodeStatus(1);
      }
    } else if (+invoiceStatus === 3) {
      // 已跳过
      setNodeStatus(4);
    } else {
      setNodeStatus(2);
    }
  }, [invoiceProcessStep, invoiceStatus]);
  return (
    <ConfigProvider>
      <WorkItemBox
        title="开票申请审批"
        nodeStatus={nodeStatus}
        cancelOrderReason={invoiceFailMsg || ""}
        isApproval={isApproval}
        allBtn={
          <>
            {/* 仅从商单进入才可以再次申请 */}
            {nodeStatus === 3 && +applyAuth === 1 && from === "invoice" && (
              <Button type="primary" onClick={() => handleApprovalagain()}>
                再次发起OA开票申请
              </Button>
            )}
          </>
        }
      />
    </ConfigProvider>
  );
};

export default OAInvoiceApproval;

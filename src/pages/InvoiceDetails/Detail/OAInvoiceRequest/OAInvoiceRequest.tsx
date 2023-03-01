/* eslint-disable css-modules/no-unused-class */
import { useContext, useEffect, useState } from "react";
import { Button, ConfigProvider, Tooltip, Modal, message } from "antd";
import cs from "classnames";
import IconTip from "src/components/IconTip";
import { $skipInvoice } from "src/api/invoiceDetail";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox";
import styles from "./OAInvoiceRequest.scss";
import BusinessNoModal from "../BusinessNoModal/BusinessNoModal";

const OAInvoiceRequest = () => {
  const {
    detail: { busOrderId },
    invoiceProcessStep = "",
    invoiceStatus = "",
    opUserName = "",
    contractUrl = "",
    instanceId = "",
    businessKey = "",
    from = "",
    applyAuth = 0,
    businessOrderId = "",
    onRefresh,
  } = useContext(DetailContext);

  const handleOAInvoiceRequest = () => {
    window.open(
      `${
        window.location.origin + window.location.pathname
      }#/qp/oa-invoice-apply?businessId=${businessOrderId}&instanceId=${instanceId}&businessKey=${businessKey}`,
      "_self"
    );
  };

  // 查看OA开票详情
  const handleOAInvoiceDetail = () => {
    window.open(
      `${
        window.location.origin + window.location.pathname
      }#/qp/invoice-application-approval?instanceId=${instanceId}&businessKey=${businessKey}`,
      "_blank"
    );
  };

  const handleSkipInvoice = () => {
    Modal.confirm({
      title: "提示",
      content: "选择“无需开票”后，将无法撤回，请谨慎操作！",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          const res = await $skipInvoice({ busOrderId });
          if (res) {
            message.success("无需开票成功");
            onRefresh();
          }
        } catch (e: any) {
          message.error(e.message);
        }
      },
    });
  };

  const [nodeStatus, setNodeStatus] = useState<number>(0);
  const [showOaModal, setShowOaModal] = useState<boolean>(false);

  useEffect(() => {
    if (+invoiceProcessStep === 0) {
      setNodeStatus(1);
    } else {
      setNodeStatus(2);
    }

    // 已跳过
    if (+invoiceStatus === 3) {
      setNodeStatus(4);
    }
  }, [invoiceProcessStep, invoiceStatus]);

  /**
   * 能否发起OA开票申请  1 可以  0不可以
   * private Integer applyAuth = 0;
   */
  return (
    <ConfigProvider>
      <WorkItemBox
        title="发起OA开票申请"
        nodeStatus={nodeStatus}
        operatorUserName={`${opUserName || "待定"}`}
        allBtn={
          <>
            {/* 发起OA开票申请只有从商单进入才可以操作 */}
            {from === "invoice" && (
              <>
                {nodeStatus === 1 ? (
                  +applyAuth === 1 ? (
                    <div className={styles.btnWrapper}>
                      <div>
                        <Button
                          type="primary"
                          className={cs(styles.jumpButton, "m-r-6")}
                          onClick={() => handleSkipInvoice()}
                        >
                          无需开票
                        </Button>
                        <Button
                          type="primary"
                          className={styles.btnApplay}
                          onClick={() => handleOAInvoiceRequest()}
                        >
                          OA开票申请
                        </Button>
                      </div>
                      <Button type="link" onClick={() => setShowOaModal(true)}>
                        已申请开票，直接输入OA流程编号
                      </Button>
                    </div>
                  ) : (
                    nodeStatus === 1 && (
                      <Tooltip
                        placement="top"
                        title="您非本商单的实际负责人，无法发起OA申请"
                      >
                        <Button type="primary">OA开票申请</Button>
                      </Tooltip>
                    )
                  )
                ) : (
                  ""
                )}
              </>
            )}
            {nodeStatus === 2 && (
              <div>
                {!!businessKey && (
                  <span style={{ marginRight: "32px" }}>
                    OA流程编号：{businessKey || "--"}
                  </span>
                )}
                <Button
                  type="default"
                  className={styles.ghostButton}
                  onClick={() => handleOAInvoiceDetail()}
                >
                  查看申请详情
                </Button>
                <Button type="link" onClick={() => setShowOaModal(true)}>
                  编辑
                </Button>
              </div>
            )}
          </>
        }
      >
        <div className={cs(styles.wrapper, "m-t-24")}>
          合同/结算单：
          {contractUrl ? (
            <>
              <Button
                type="link"
                className="m-r-6"
                onClick={() => window.open(contractUrl, "_blank")}
              >
                {contractUrl.includes(
                  "http://qpmcn-1255305554.cos.ap-beijing.myqcloud.com/"
                )
                  ? contractUrl.split(
                      "http://qpmcn-1255305554.cos.ap-beijing.myqcloud.com/"
                    )[1]
                  : "下载文件"}
              </Button>
              <IconTip content="若下载不成功，可点击右侧的“查看申请详情”，在打开的详情页中点击链接下载" />
            </>
          ) : (
            "--"
          )}
        </div>
        {showOaModal && (
          <BusinessNoModal
            setShowOaModal={setShowOaModal}
            showOaModal={showOaModal}
          />
        )}
      </WorkItemBox>
    </ConfigProvider>
  );
};

export default OAInvoiceRequest;

/* eslint-disable css-modules/no-unused-class */
import { useContext, useState, useEffect } from "react";
import { Button, ConfigProvider, Modal, Tooltip } from "antd";
import cs from "classnames";
import {
  $getCostcenterByName,
  GetCostcenterByNameResType,
} from "src/api/oaPaymentApply";
import { GlobalContext } from "src/contexts/global";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox/WorkItemBox";
import styles from "./OaPaymentRequest.scss";
import BusinessNoModal from "../BusinessNoModal/BusinessNoModal";

const OaPaymentRequest = () => {
  // const { $permission } = window;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const {
    detail: {
      rebateCorporate,
      rebatePrivate,
      // cusOfflineSupplement,
    },
    processStep,
    rebateMoney = "",
    opUserName = "",
    businessOrderId,
    rebateType,
    businessKey = "",
    instanceId = "",
    applyAuth = 0,
  } = useContext(DetailContext);
  const { globalData = {} } = useContext(GlobalContext);
  const [nodeStatus, setNodeStatus] = useState<number>(0);

  const getCostcenterByName = async () => {
    const res = await $getCostcenterByName({
      userName:
        globalData?.user?.userInfo?.email.substr(
          0,
          globalData?.user?.userInfo?.email.indexOf("@")
        ) || globalData?.user?.userInfo.name,
    });

    const info: GetCostcenterByNameResType = JSON.parse(res);

    if (info.userId) {
      const paymentAmount = +rebateType === 2 ? rebateCorporate : rebatePrivate;
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
  // 查看OA付款详情
  const handleOAPayRequestDetail = () => {
    window.open(
      `${
        window.location.origin + window.location.pathname
      }#/qp/media-payment-approval?businessKey=${businessKey}&instanceId=${instanceId}`,
      "_blank"
    );
  };
  const [showOaModal, setShowOaModal] = useState<boolean>(false);

  useEffect(() => {
    if (+processStep === 0) {
      setNodeStatus(0);
    }
    if (+processStep === 1) {
      setNodeStatus(1);
    }
    if (+processStep === 2) {
      setNodeStatus(2);
    }
  }, [processStep]);

  return (
    <ConfigProvider>
      <WorkItemBox
        title="发起OA付款申请"
        nodeStatus={nodeStatus}
        operatorUserName={`${opUserName || "待定"}`}
        allBtn={
          <>
            {nodeStatus === 1 ? (
              +applyAuth === 1 ? (
                <div className={styles.btnWrapper}>
                  <Button type="primary" onClick={() => getCostcenterByName()}>
                    {+rebateType === 2 && "OA付款申请（对公）"}
                    {+rebateType === 3 && "OA付款申请（对私）"}
                  </Button>
                  <Button type="link" onClick={() => setShowOaModal(true)}>
                    已申请付款，直接输入OA流程编号
                  </Button>
                </div>
              ) : (
                <Tooltip
                  placement="top"
                  title="您非本商单的实际负责人，没有操作权限"
                >
                  <Button type="primary">
                    {+rebateType === 2 && "OA付款申请（对公）"}
                    {+rebateType === 3 && "OA付款申请（对私）"}
                  </Button>
                </Tooltip>
              )
            ) : (
              nodeStatus === 2 && (
                <div>
                  {!!businessKey && (
                    <span style={{ marginRight: "32px" }}>
                      OA流程编号：{businessKey || "--"}
                    </span>
                  )}
                  <Button
                    type="default"
                    className={styles.ghostButton}
                    onClick={() => handleOAPayRequestDetail()}
                  >
                    {+rebateType === 2 && "查看申请详情（对公）"}
                    {+rebateType === 3 && "查看申请详情（对私）"}
                  </Button>
                  <Button type="link" onClick={() => setShowOaModal(true)}>
                    编辑
                  </Button>
                </div>
              )
            )}
          </>
        }
      >
        <div className={cs(styles.oaPaymentRequestWrapper, "m-t-24")}>
          {+rebateType === 2 ? "对公返款金额：" : "对私返款金额："}
          {rebateMoney || "--"}
        </div>
      </WorkItemBox>
      {isModalOpen && (
        <Modal
          title="邮箱错误提醒"
          visible={isModalOpen}
          footer={
            <Button type="primary" onClick={() => setIsModalOpen(false)}>
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
      {showOaModal && (
        <BusinessNoModal
          setShowOaModal={setShowOaModal}
          showOaModal={showOaModal}
        />
      )}
    </ConfigProvider>
  );
};

export default OaPaymentRequest;

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
import { useContext, useEffect, useState } from "react";
import { Steps, Spin, Tabs } from "antd";
import cs from "classnames";
import qs from "qs";
import { useLocation } from "react-router";
import BaseInfo from "./BaseInfo/BusinessOrderBaseInfo";
import PaymentApproval from "./PaymentApproval/PaymentApproval";
import OrderPerformance from "./Order/OrderPerformance/OrderPerformance";
import OAInvoiceRequest from "./OAInvoiceRequest/OAInvoiceRequest";
import OAInvoiceApproval from "./OAInvoiceApproval/OAInvoiceApproval";
import CustomerReceivable from "./CustomerReceivable/CustomerReceivable";
import CollectionApproval from "./CollectionApproval/CollectionApproval";
import OaPaymentRequest from "./OaPaymentRequest/OaPaymentRequest";
import PaybackPeriods from "./PaybackPeriods/PaybackPeriods";
import { DetailProvider, DetailContext } from "./DetailProvider";
import styles from "./InvoiceDetails.scss";

const { Step } = Steps;

const WorkOrder = () => {
  const {
    loading,
    currentStep,
    progressList,
    setProgressList,
    paymentStatus,
    PAY_LIST,
    COL_LIST,
    setRebateType,
    rebateType,
    invoiceStatus = 0,
    isFinanceOk = 0,
  } = useContext(DetailContext);
  const location = useLocation();
  
  const {
    tabTypeStr = "",
  }: {
    tabTypeStr?: string;
  } = qs.parse(location.search.split("?")[1]);
  const handleChangeStep = (val: number) => {
    const scrollContainer = document.getElementById("appMain");
    const stepWrap = document.getElementById("stepWrap");
    const ele = document.getElementById(`step${val + 1}`);
    // const top = first
    //   ? Number(ele?.offsetTop) - Number(stepWrap?.offsetHeight) + 40
    //   : Number(ele?.offsetTop) - Number(stepWrap?.offsetHeight) - 10;
    const top = Number(ele?.offsetTop) - Number(stepWrap?.offsetHeight) - 10;
    scrollContainer?.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  const clickCurrentStep = () => {
    const stepWrap = document.getElementById("stepWrap");
    stepWrap?.addEventListener("click", () => {
      handleChangeStep(currentStep);
    });
  };
  const onTabBusinessType = (val: any) => {
    setRebateType(val);
    if (+val === 1) {
      setProgressList([...COL_LIST]);
    } else {
      setProgressList([...PAY_LIST]);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      handleChangeStep(currentStep);
    }, 500);
    clickCurrentStep();
  }, [currentStep]);
  const [currentStatus, setCurrentStatus] = useState<string>("process");

  const getCurrentStatus = () => {
    // 商单类型 1应收 2应付对公 3应付对私
    if (+rebateType === 1) {
      // 当前步骤 从0开始
      if (+currentStep === 1) {
        // invoiceStatus oa审批状态 0 审批中 1 已通过 2被驳回
        setCurrentStatus(+invoiceStatus === 0 ? "process" : "error");
      } else if (+currentStep === 4) {
        // isFinanceOk: 0进行中 1通过  2驳回
        setCurrentStatus(
          +isFinanceOk === 0
            ? "process"
            : +isFinanceOk === 1
            ? "finish"
            : "error"
        );
      } else {
        setCurrentStatus("process");
      }
    } else if ([2, 3].includes(+rebateType)) {
      if (+currentStep === 2) {
        // paymentStatus:0审批中  1已完成 2被驳回
        setCurrentStatus(
          +paymentStatus === 0
            ? "process"
            : +paymentStatus === 1
            ? "finish"
            : "error"
        );
      } else {
        setCurrentStatus("process");
      }
    }
  };
  useEffect(() => {
    getCurrentStatus();
  }, [currentStep, paymentStatus, isFinanceOk]);
  return (
    <Spin spinning={loading}>
      <div className={styles.workDetial}>
        {tabTypeStr ? (
          <div
            className={cs(
              styles.stepWrap,
              !window.__POWERED_BY_QIANKUN__ && styles.selfStepWrap
            )}
            id="stepWrap"
          >
            <div
              className={styles.stepWrapper}
              style={{ boxShadow: "0px 15px 10px -15px #dfdfdf" }}
            >
              <Tabs onChange={onTabBusinessType}>
                {tabTypeStr.includes("1") && (
                  <Tabs.TabPane tab="线下应收" key="1" />
                )}
                {tabTypeStr.includes("2") && (
                  <Tabs.TabPane tab="线下应付（对公）" key="2" />
                )}
                {tabTypeStr.includes("3") && (
                  <Tabs.TabPane tab="线下应付（对私）" key="3" />
                )}
              </Tabs>
              <h3 className="m-b-24 m-t-24">整体进度</h3>

              <Steps
                current={currentStep}
                labelPlacement="vertical"
                onChange={handleChangeStep}
                status={currentStatus as any}
              >
                {progressList.map(({ nodeStep, nodeName }) => (
                  <Step key={nodeStep} description={nodeName} />
                ))}
              </Steps>
            </div>
          </div>
        ) : (
          ""
        )}
        <BaseInfo />
        {tabTypeStr ? (
          <>
            {[2, 3].includes(+rebateType) ? (
              <>
                <div id="step1">
                  <OrderPerformance />
                </div>
                <div id="step2">
                  <OaPaymentRequest />
                </div>
                <div id="step3">
                  <PaymentApproval />
                </div>
              </>
            ) : (
              <>
                <div id="step1">
                  <OAInvoiceRequest />
                </div>
                <div id="step2">
                  <OAInvoiceApproval />
                </div>
                <div id="step3">
                  <PaybackPeriods />
                </div>
                <div id="step4">
                  <CustomerReceivable />
                </div>
                <div id="step5">
                  <CollectionApproval />
                </div>
              </>
            )}
          </>
        ) : (
          ""
        )}
      </div>
    </Spin>
  );
};

const InvoiceDetails = () => (
  <DetailProvider>
    <WorkOrder />
  </DetailProvider>
);

export default InvoiceDetails;

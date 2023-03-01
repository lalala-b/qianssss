/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
import { useContext, useEffect, useState } from "react";
import { Steps, Spin } from "antd";
import cs from "classnames";
import ConfirmDraft from "./WorkDetailComponets/ConfirmDraft";
import BaseInfo from "./BaseInfo";
import ConfirmOrder from "./ConfirmOrder";
import SpecialConfirmOrder from "./SpecialOrder/SpecialConfirmOrder";
import AllotExecutor from "./AllotExecutor";
import SpecialAllotExecutor from "./SpecialOrder/SpecialAllotExecutor";
import ExecutionPlan from "./ExecutionPlan";
import SpecialOrderPerformance from "./SpecialOrder/SpecialOrderPerformance";
import SpecialFinancialNumber from "./SpecialOrder/SpecialFinancialNumber"
import SpecialFinancialAudit from "./SpecialOrder/SpecialFinancialAudit"
import { DetailProvider, DetailContext } from "./DetailProvider";
import ConfirmOutline from "./WorkDetailComponets/ConfirmOutline";
import ConfirmScript from "./WorkDetailComponets/ConfirmScript";
import PublishVideo from "./WorkDetailComponets/PublishVideo";
import FinancialNumber from "./WorkDetailComponets/FinancialNumber";
import FinancialAudit from "./WorkDetailComponets/FinancialAudit"
import GenerateSettleDoc from "./WorkDetailComponets/GenerateSettleDoc";
import styles from "./WorkOrder.scss";

const { Step } = Steps;

const WorkOrder = () => {
  const {
    loading,
    currentStep,
    progressList,
    detail: { orderBaseInfoBO: { orderType = 1, orderBelongType = 0 } = {} } = {},
  } = useContext(DetailContext);

  const [needOutline, setNeedOutline] = useState(false);

  const handleChangeStep = (val: number) => {
    const scrollContainer = document.getElementById("appMain");
    const stepWrap = document.getElementById("stepWrap");
    const ele = document.getElementById(`step${val + 1}`);
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

  const loadHasOutline = (val: number) => {
    setNeedOutline(!!val);
  };

  useEffect(() => {
    setTimeout(() => {
      handleChangeStep(currentStep);
    }, 500);
    clickCurrentStep();
  }, [currentStep]);

  return (
    <Spin spinning={loading}>
      <div className={styles.workDetial}>
        <div
          className={cs(
            styles.stepWrap,
            !window.__POWERED_BY_QIANKUN__ && styles.selfStepWrap
          )}
          id="stepWrap"
        >
          <div className="qp-wrapper">
            <h3 className="m-b-24">整体进度</h3>
            {/* 1为进行中  3为撤单 */}
            <Steps
              current={currentStep}
              labelPlacement="vertical"
              onChange={handleChangeStep}
              status={
                +progressList[currentStep]?.nodeStatus === 3
                  ? "error"
                  : "process"
              }
            >
              {progressList.map(({ nodeCode, nodeName }) => (
                <Step key={nodeCode} description={nodeName} />
              ))}
            </Steps>
          </div>
        </div>

        <BaseInfo />

        {/* orderType 1是视频工单, orderBelongType 0自营 1签约 2媒介 3海盗  海盗逻辑与自营一致 */}
        {
          +orderType === 1 && (
            <>
              {
                // 自营和海盗的沿用之前财务核账的流程节点
                !+orderBelongType || +orderBelongType === 3 ? (
                  <>
                    {/* 确认下单信息 */}
                    <div id="step1">
                      <ConfirmOrder />
                    </div>

                    {/* 分配执行人 */}
                    <div id="step2">
                      <AllotExecutor />
                    </div>

                    {/* 录入执行计划 */}
                    <div id="step3">
                      <ExecutionPlan onLoadHasOutline={loadHasOutline} />
                    </div>

                    {/* 确认大纲 */}
                    <div id="step4">{needOutline && <ConfirmOutline />}</div>
                    
                    {/* 确认脚本 */}
                    <div id="step5">
                      <ConfirmScript />
                    </div>

                    {/* 确认视频初稿 */}
                    <div id="step6">
                      <ConfirmDraft />
                    </div>

                    {/* 发布视频 */}
                    <div id="step7">
                      <PublishVideo />
                    </div>

                    {/* 财务核账 */}
                    <div id="step8">
                      <FinancialAudit />
                    </div>
                  </>
                ) : (
                  <>
                    {/* 确认下单信息 */}
                    <div id="step1">
                      <ConfirmOrder />
                    </div>

                    {/* 分配执行人 */}
                    <div id="step2">
                      <AllotExecutor />
                    </div>

                    {/* 录入执行计划 */}
                    <div id="step3">
                      <ExecutionPlan onLoadHasOutline={loadHasOutline} />
                    </div>

                    {/* 确认大纲 */}
                    <div id="step4">{needOutline && <ConfirmOutline />}</div>
                    
                    {/* 确认脚本 */}
                    <div id="step5">
                      <ConfirmScript />
                    </div>

                    {/* 确认视频初稿 */}
                    <div id="step6">
                      <ConfirmDraft />
                    </div>

                    {/* 发布视频 */}
                    <div id="step7">
                      <PublishVideo />
                    </div>

                    {/* 财务核数 */}
                    <div id="step8">
                      <FinancialNumber />
                    </div>
                    
                    {/* 生成结算单 */}
                    <div id="step9">
                      <GenerateSettleDoc />
                    </div>

                   {/* 财务核账
                    <div id="step10">
                      <FinancialAccounting />
                    </div> */}
                  </>
                )
              }
            </>
          )
        }

        {/* orderType 2是特殊工单, orderBelongType 0自营 1签约 2媒介 3海盗 */}
        {
          +orderType === 2 && (
            <>
              {
                // 自营和海盗的沿用之前财务核账的流程节点
                !+orderBelongType || +orderBelongType === 3 ? (
                  <>
                    {/* 确认下单信息 */}
                    <div id="step1">
                      <SpecialConfirmOrder />
                    </div>

                    {/* 分配执行人 */}
                    <div id="step2">
                      <SpecialAllotExecutor />
                    </div>

                    {/* 工单履约 */}
                    <div id="step3">
                      <SpecialOrderPerformance />
                    </div>

                    {/* 财务核账 */}
                    <div id="step4">
                      <SpecialFinancialAudit />
                    </div>
                  </>
                ) : (
                  <>
                    {/* 确认下单信息 */}
                    <div id="step1">
                      <SpecialConfirmOrder />
                    </div>

                    {/* 分配执行人 */}
                    <div id="step2">
                      <SpecialAllotExecutor />
                    </div>

                    {/* 工单履约 */}
                    <div id="step3">
                      <SpecialOrderPerformance />
                    </div>

                    {/* 财务核数 */}
                    <div id="step4">
                      <SpecialFinancialNumber />
                    </div>
                    
                    {/* 生成结算单
                    <div id="step5">
                      <GenerateSettleDoc />
                    </div>

                    财务核账
                    <div id="step6">
                      <FinancialAccounting />
                    </div> */}
                  </>
                )
              }
            </>
          )
        }
      </div>
    </Spin>
  );
};

const WorkOrderDetail = () => (
  <DetailProvider>
    <WorkOrder />
  </DetailProvider>
);

export default WorkOrderDetail;

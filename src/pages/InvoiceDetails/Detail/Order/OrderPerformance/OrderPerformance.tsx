/* eslint-disable css-modules/no-unused-class */
import { useContext, useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import cs from "classnames";
import { DetailContext } from "../../DetailProvider";
import WorkItemBox from "../../WorkDetailComponets/WorkItemBox/WorkItemBox";
import styles from "./OrderPerformance.scss";

const OrderPerformance = () => {
  const { honorAgreementRate = "", processStep = "" } =
    useContext(DetailContext);
  const [nodeStatus, setNodeStatus] = useState<number>(0);
  useEffect(() => {
    if (+processStep === 0) {
      setNodeStatus(1);
    } else {
      setNodeStatus(2);
    }
  }, [processStep]);

  return (
    <ConfigProvider>
      <WorkItemBox title="工单履约" nodeStatus={nodeStatus}>
        <div className={cs(styles.wrapper, "m-t-24")}>
          工单履约进度：{honorAgreementRate ? `${honorAgreementRate}%` : "--"}
        </div>
      </WorkItemBox>
    </ConfigProvider>
  );
};

export default OrderPerformance;

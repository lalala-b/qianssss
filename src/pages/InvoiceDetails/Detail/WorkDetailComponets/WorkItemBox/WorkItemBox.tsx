/* eslint-disable array-callback-return */
/* eslint-disable css-modules/no-unused-class */
import { useEffect, useState } from "react";
import { Tag, Tooltip } from "antd";
import styles from "./WorkItemBox.scss";

interface WorkItemHeaderPropsType {
  isApproval?: boolean;
  nodeStatus?: number; // 0-待处理，1-进行中，2-已完成 3-已撤单
  title: string;
  allBtn?: JSX.Element | number | string;
  operatorUserName?: string; // 操作人
  operatorUserNameList?: string[];
  cancelOrderReason?: string; // 撤单原因
}

const WorkItemBox: React.FC<WorkItemHeaderPropsType> = ({
  nodeStatus = 10,
  title = "确认大纲",
  children,
  allBtn,
  operatorUserName,
  cancelOrderReason,
  isApproval = false,
  operatorUserNameList = [],
}) => {
  const nodeStatusColorList = new Map([
    [0, "rgba(0,0,0,.2)"],
    [1, "orange"],
    [2, "green"],
    [3, "red"],
  ]);
  // 节点状态
  const nodeStatusList = new Map([
    [0, "未开始"],
    [1, "进行中"],
    [2, "已完成"],
    [4, "已跳过"],
  ]);
  const approvalStatusList = new Map([
    [0, "未开始"],
    [1, "OA审批中"],
    [2, "已完成"],
    [3, "不通过"],
    [4, "已跳过"],
  ]);
  const [lastNodeStatusList, setLastNodeStatusList] = useState(nodeStatusList);
  useEffect(() => {
    setLastNodeStatusList(isApproval ? approvalStatusList : nodeStatusList);
  }, [isApproval]);
  return (
    <div className={styles.qWrap}>
      <div className={styles.workItemHeader}>
        <div className={styles.flexAlign}>
          <span className={styles.workItemHeaderTitle}>{title}</span>
          {[0, 1, 2, 3, 4].includes(nodeStatus) ? (
            <Tag color={nodeStatusColorList.get(nodeStatus)}>
              {lastNodeStatusList.get(nodeStatus)}
            </Tag>
          ) : (
            ""
          )}
          {cancelOrderReason ? (
            <Tooltip placement="top" title={cancelOrderReason}>
              <span
                style={{ cursor: "pointer" }}
                className={styles.cancelOrderReason}
              >
                不通过原因
              </span>
            </Tooltip>
          ) : (
            ""
          )}
        </div>
        {allBtn}
      </div>
      {operatorUserName ? (
        <div>
          操作人：
          {operatorUserNameList.length && (nodeStatus === 0 || nodeStatus === 1)
            ? operatorUserNameList.map((item: any) => (
                <span className="m-r-12" key={item.id}>
                  {item.name}
                </span>
              ))
            : operatorUserName}
        </div>
      ) : (
        ""
      )}
      {Number(nodeStatus) !== 0 && children}
    </div>
  );
};

export default WorkItemBox;

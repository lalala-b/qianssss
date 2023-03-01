/* eslint-disable css-modules/no-unused-class */
import { useContext } from "react";
import { Tag, Tooltip } from "antd";
import { DetailContext } from "../../DetailProvider";
import styles from "./WorkItemBox.scss";

interface WorkItemHeaderPropsType {
  nodeStatus?: number; // 0-待处理，1-进行中，2-已完成 3-已撤单
  title: string;
  overtimeStatus?: number; // 是否超时：0-未超时（当前时间-截止时间大于1天），1-即将超时（0<当前时间-截止时间<24小时），2-已超时
  timeIntervalDesc?: string; // 超时文案
  allBtn?: JSX.Element | number | string;
  operatorUserName?: string; // 操作人
  updateTime?: string;
  cancelOrderReason?: string; // 撤单原因
}

const WorkItemBox: React.FC<WorkItemHeaderPropsType> = ({
  nodeStatus = 10,
  overtimeStatus = 0,
  timeIntervalDesc,
  title = "确认大纲",
  children,
  allBtn,
  operatorUserName,
  updateTime,
  cancelOrderReason,
}) => {
  const { loading } = useContext(DetailContext);

  const timeColorList = new Map([
    [0, "orange"],
    [1, "purple"],
    [2, "red"],
  ]);
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
    [3, "已取消合作"],
  ]);

  return (
    <div className={styles.qWrap}>
      <div className={styles.workItemHeader}>
        <div className={styles.flexAlign}>
          <span className={styles.workItemHeaderTitle}>{title}</span>
          {[0, 1, 2, 3].includes(nodeStatus) ? (
            <Tag color={nodeStatusColorList.get(nodeStatus)}>
              {nodeStatusList.get(nodeStatus)}
            </Tag>
          ) : (
            ""
          )}
          {timeIntervalDesc ? (
            <Tag color={timeColorList.get(overtimeStatus)}>
              {timeIntervalDesc}
            </Tag>
          ) : (
            ""
          )}
          {cancelOrderReason ? (
            <Tooltip placement="top" title={cancelOrderReason}>
              <span className={styles.cancelOrderReason}>取消合作原因</span>
            </Tooltip>
          ) : (
            ""
          )}
        </div>
        {nodeStatus !== 3 && <>{allBtn}</>}
      </div>
      {operatorUserName ? (
        <div className={styles.operation}>操作人：{operatorUserName}</div>
      ) : (
        ""
      )}
      {
        // 已完成并且有更新时间
        !!(+nodeStatus === 2 && updateTime) && (
          <div className={styles.updateTime}>更新时间：{updateTime}</div>
        )
      }
      {/* 未开始时不显示子元素 */}
      {Number(nodeStatus) !== 0 && !loading && children}
    </div>
  );
};

export default WorkItemBox;

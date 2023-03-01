/* eslint-disable no-unused-expressions */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Table, Button, Tooltip, ConfigProvider, Row, Col } from "antd";
import { useEffect, useState, useContext } from "react";
import type { ColumnsType } from "antd/lib/table";
import zhCN from "antd/es/locale/zh_CN";
import { GlobalContext } from "src/contexts/global";
import { emptyFill } from "src/utils/number";
import styles from "./TaskManagementCom.scss";
import type {
  TablePropsType,
  TaskTableType,
  recommendAccountsType,
} from "./TaskManagementType";
import DistributionMediumModal from "./DistributionMediumModal";
import SignUpDrawer from "./TaskDetail/SignUpDrawer";

const TaskManageTable: React.FC<TablePropsType> = ({
  taskType,
  taskTableList,
  getList,
  pagination,
  defaultOpId,
  defaultPid,
  reCounts,
  handlePageChange,
}) => {
  const [showReAccount, setShowReAccount] = useState(true);
  const { globalData = {} } = useContext(GlobalContext);
  const [reTabType, setReTabType] = useState<string>("1");
  const { $permission } = window;
  const [rowItem, setRowItem] = useState<TaskTableType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisiable, setIsDrawerVisiable] = useState(false);
  // 分配媒介采买人按钮
  const showModal = (row: any) => {
    setRowItem(row);
    setIsModalVisible(true);
  };
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };
  // 详情按钮关闭
  const handleCloseDrawer = () => {
    setIsDrawerVisiable(false);
  };
  // 我的推荐
  const handleAccountDialog = (row: TaskTableType, tabType: string) => {
    setRowItem(row);
    setReTabType(tabType);
    setShowReAccount([0, 1].includes(row.taskStatus));
    setIsDrawerVisiable(true);
  };
  const columns: ColumnsType<any> = [
    {
      title: "父任务ID",
      dataIndex: "pid",
      key: "pid",
      width: 90,
      align: "center",
    },
    {
      title: "所属商机号",
      dataIndex: "opNo",
      key: "opNo",
      width: 120,
      align: "center",
    },
    {
      title: "商机负责人",
      dataIndex: "charger",
      key: "charger",
      width: 120,
      align: "center",
    },
    {
      title: "需求详情",
      dataIndex: "address",
      key: "address",
      render: (text: string, row: TaskTableType) => {
        const { detailInfo = {} } = row;
        const titleCom = (
          <div className={styles.SpinWapper}>
            <h4>查看详情</h4>
            <div className={styles.mb12}>
              <span className={styles.label}>商机负责人:</span>
              <span>{detailInfo.chargerName}</span>
            </div>
            <div className={styles.mb12}>
              <span className={styles.label}>品牌:</span>
              <span>
                {detailInfo.brandName ? detailInfo.brandName : "保密项目"}
              </span>
            </div>
            <div className={styles.mb12}>
              <span className={styles.label}>预计发布时间:</span>
              <span>
                {detailInfo.publishStart
                  ? ` ${detailInfo.publishStart}~${detailInfo.publishEnd}`
                  : "未定"}
              </span>
            </div>
            <Row gutter={5}>
              <Col span={12}>
                <div className={styles.mb12}>
                  <span className={styles.label}>合作产品:</span>
                  <span>{detailInfo.coProduct}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.mb12}>
                  <span className={styles.label}>合作产品品类:</span>
                  <span>{detailInfo.coCateName}</span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={4}> 需求描述:</Col>
              <Col span={20}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {detailInfo.description}
              </Col>
            </Row>
          </div>
        );
        return (
          <>
            {detailInfo ? (
              <Tooltip title={titleCom} color="#fff">
                <span className={styles.columnBtn}>查看详情</span>
              </Tooltip>
            ) : (
              "--"
            )}
          </>
        );
      },
    },
    {
      title: "我推荐的账号",
      dataIndex: "recommendAccounts",
      key: "recommendAccounts",
      width: 160,
      align: "center",
      render: (text: any, row: TaskTableType) => {
        const title = row.recommendAccounts?.map(
          (item: recommendAccountsType) => (
            <div style={{ width: "160px", color: "#333" }} key={item.platId+item.accountName}>
              <img
                className={styles.platLogo}
                src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${item.platId}.png`}
                alt=""
              />
              {item.accountName}
            </div>
          )
        );
        return (
          <>
            {row.recommendAccountNumbers && row.recommendAccountNumbers > 1 ? (
              <Tooltip placement="topLeft" color="#fff" title={title}>
                <div className={styles.columnBtn}>
                  {row.recommendAccountNumbers}个
                </div>
              </Tooltip>
            ) : (
              ""
            )}
            {row.recommendAccountNumbers &&
            row.recommendAccountNumbers === 1 ? (
              <span>
                {row.recommendAccounts && row.recommendAccounts[0]?.platId && (
                  <img
                    className={styles.platLogo}
                    src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${row.recommendAccounts[0]?.platId}.png`}
                    alt=""
                  />
                )}
                {row.recommendAccounts && row.recommendAccounts[0]?.accountName}
              </span>
            ) : (
              ""
            )}
            {!row.recommendAccountNumbers && <>--</>}
          </>
        );
      },
    },
    {
      title: "任务跟进人",
      dataIndex: "taskFollower",
      key: "taskFollower",
      width: 130,
      align: "center",
    },
    {
      title: "任务状态",
      dataIndex: "taskStatusName",
      key: "taskStatusName",
      width: 120,
      align: "center",
    },
    {
      title: "找号截止时间",
      width: 180,
      dataIndex: "stopFindTime",
      key: "stopFindTime",
      render: (text: any, row: TaskTableType) => (
        <>{emptyFill(row.stopFindTime)}</>
      ),
    },
    {
      title: "最近更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
      render: (text: any, row: TaskTableType) => (
        <>{emptyFill(row.updateTime)}</>
      ),
    },
    {
      title: "找号轮次",
      dataIndex: "taskSeq",
      key: "taskSeq",
      align: "center",
      width: 90,
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      fixed: "right",
      render: (row: TaskTableType) => {
        const { id } = globalData?.user?.userInfo || {};
        return (
          <div className={styles.btnwrapper}>
            {[0, 1].includes(row.taskStatus) && row.taskFollowerId === id ? (
              <Button
                type="link"
                size="small"
                onClick={() => handleAccountDialog(row, "1")}
              >
                推荐账号
              </Button>
            ) : (
              ""
            )}
            {row.taskFollowerId === id ? (
              <Button
                type="link"
                size="small"
                onClick={() => handleAccountDialog(row, "2")}
              >
                我的推荐
              </Button>
            ) : (
              ""
            )}
            {[0, 1].includes(row.taskStatus) &&
            row.taskFollowerId === id &&
            taskType === 2 &&
            $permission("distribution-medium") ? (
              <Button type="link" size="small" onClick={() => showModal(row)}>
                分配媒介采买人
              </Button>
            ) : (
              ""
            )}
          </div>
        );
      },

      // taskStatus:0 待推荐 1推荐中
    },
  ];

  useEffect(() => {
    const item: any = taskTableList.find(item => item.pid === rowItem?.pid) || {
      pid: undefined,
    };
    setRowItem(item);
  }, [taskTableList]);
  // 飞书跳转默认打开需求&账号详情
  useEffect(() => {
    if (defaultOpId || (defaultOpId === 0 && reCounts)) {
      setIsDrawerVisiable(true);
    }
  }, [defaultOpId, defaultPid, reCounts]);

  return (
    <div className={styles.TaskManagementCom}>
      <ConfigProvider locale={zhCN}>
        <Table
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -24,
          }}
          columns={columns as ColumnsType<any>}
          dataSource={taskTableList}
          rowKey={record => record.pid || Math.random()}
          pagination={{
            ...pagination,
            defaultCurrent: 1,
            showQuickJumper: true,
            showSizeChanger: false,
            showTotal: total => `总共${total}条`,
            onChange: (pageNum, size) => handlePageChange(pageNum, size),
          }}
        />
      </ConfigProvider>
      {isModalVisible && (
        <DistributionMediumModal
          isModalVisible={isModalVisible}
          handleCloseModal={handleCloseModal}
          pid={rowItem && rowItem.pid ? Number(rowItem.pid) : undefined}
        />
      )}
      {isDrawerVisiable && (
        <SignUpDrawer
          reTabType={reTabType}
          getList={getList}
          opId={
            defaultOpId || defaultOpId === 0
              ? defaultOpId
              : rowItem && rowItem.opId
              ? rowItem.opId
              : undefined
          }
          pid={
            defaultPid || defaultPid === 0
              ? defaultPid
              : rowItem && rowItem.pid
              ? Number(rowItem.pid)
              : undefined
          }
          isDrawerVisiable={isDrawerVisiable}
          handleCloseDrawer={handleCloseDrawer}
          showReAccount={showReAccount}
          charger={rowItem && rowItem.charger ? rowItem.charger : ""}
          myRecommendNum={
            reCounts
              ? +reCounts.myRecommendNum
              : rowItem && rowItem.myRecommendNum
              ? +rowItem.myRecommendNum
              : undefined
          }
          otherRecommendNum={
            reCounts
              ? +reCounts.otherRecommendNum
              : rowItem && rowItem.otherRecommendNum
              ? +rowItem.otherRecommendNum
              : undefined
          }
        />
      )}
    </div>
  );
};

export default TaskManageTable;

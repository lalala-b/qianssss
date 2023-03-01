/* eslint-disable css-modules/no-undef-class */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable css-modules/no-unused-class */
import { useEffect, useState } from "react";
import { Drawer, Row, Col, Button, Tabs, Spin, message } from "antd";
// import { $getTaskList } from "src/api/taskManagement";
// import styles from "./TaskManagementCom.scss";
import { $getRemmonedDetail } from "src/api/taskManagement";
import { CloseOutlined } from "@ant-design/icons";
import type {
  SignDrawerPropsType,
  detailDataType,
} from "../TaskManagementType";
import styles from "../TaskManagementCom.scss";
import ReAccounts from "./ReAccounts";
import IReAccounts from "./IReAccounts";
import OtherReAccounts from "./OtherReAccounts";

const { TabPane } = Tabs;
const SignUpDrawer: React.FC<SignDrawerPropsType> = ({
  isDrawerVisiable,
  handleCloseDrawer,
  opId,
  pid,
  reTabType,
  myRecommendNum,
  otherRecommendNum,
  getList,
  showReAccount,
  charger = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("1");
  const [detailData, setDdetailData] = useState<detailDataType>({
    brandName: "",
    chargerName: "",
    coCateName: "",
    coProduct: "",
    publishStart: "",
    publishEnd: "",
    fileUrl: "",
    description: "",
  });
  const onClose = () => {
    handleCloseDrawer();
  };
  const handleDownLoad = () => {
    window.open(detailData.fileUrl);
  };
  const handleChangeTab = (val: string) => {
    setActiveKey(val);
  };
  const getRemmonedDetail = () => {
    setLoading(true);
    $getRemmonedDetail({ id: opId })
      .then(res => {
        setDdetailData({ ...res });
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
        message.error(e.message);
      });
  };

  useEffect(() => {
    getRemmonedDetail();
  }, []);
  useEffect(() => {
    setActiveKey(reTabType);
  }, [reTabType]);
  useEffect(() => {
    console.info("showReAccount", showReAccount);
  }, [showReAccount]);
  return (
    <Drawer
      title={
        <>
          <span>需求&账号详情</span>{" "}
          <CloseOutlined className={styles.closeButton} onClick={onClose} />
        </>
      }
      width="70%"
      placement="right"
      visible={isDrawerVisiable}
      closable={false}
      className={styles.detailDrawer}
    >
      <div className={styles.SpinWapper}>
        <Row gutter={5}>
          <Col span={12}>
            <div>
              <div className={styles.mb12}>
                <span className={styles.detailLabel}>商机负责人:</span>
                <span>{detailData.chargerName}</span>
              </div>
              <div className={styles.mb12}>
                <span className={styles.detailLabel}>品牌:</span>
                <span>{detailData.brandName || "保密项目"}</span>
              </div>
              <div className={styles.mb12}>
                <span className={styles.detailLabel}>合作产品:</span>
                <span>{detailData.coProduct}</span>
              </div>
              <div className={styles.mb12}>
                <span className={styles.detailLabel}>合作产品品类:</span>
                <span>{detailData.coCateName}</span>
              </div>
              <div className={styles.mb12}>
                <span className={styles.detailLabel}>预计发布时间:</span>
                <span>
                  {detailData.publishStart
                    ? ` ${detailData.publishStart}~${detailData.publishEnd}`
                    : "--"}
                </span>
              </div>
              <div className={styles.mb12}>
                <span className={styles.detailLabel}>品牌方BF:</span>
                {detailData.fileUrl ? (
                  <Button type="link" onClick={handleDownLoad}>
                    点击下载文件
                  </Button>
                ) : (
                  "--"
                )}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <span className={styles.demandtitle}>需求描述:</span>
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {detailData.description}
            </div>
          </Col>
        </Row>
        {loading && <Spin />}
      </div>
      <Tabs defaultActiveKey={reTabType} onChange={handleChangeTab}>
        {showReAccount ? (
          <TabPane tab="推荐账号" key="1">
            {activeKey === "1" && <ReAccounts getList={getList} pid={pid} />}
          </TabPane>
        ) : (
          ""
        )}
        <TabPane
          tab={`我已推荐${myRecommendNum ? `(${myRecommendNum})` : ""}`}
          key="2"
        >
          {activeKey === "2" && (
            <IReAccounts getList={getList} pid={pid} charger={charger} />
          )}
        </TabPane>
        <TabPane
          tab={`其他人的推荐进度${
            otherRecommendNum ? `(${otherRecommendNum})` : ""
          }`}
          key="3"
        >
          {activeKey === "3" && <OtherReAccounts pid={pid} />}
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default SignUpDrawer;

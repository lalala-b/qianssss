/* eslint-disable no-irregular-whitespace */
import { useState, useContext } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  ConfigProvider,
} from "antd";
import cs from "classnames";
import zhCN from "antd/es/locale/zh_CN";
import { DetailContext } from "../../DetailProvider";
import WorkTtemBox from "../WorkItemBox";
import SettleDocModal from "./SettleDocModal"
import styles from "./GenerateSettleDoc.scss";

const GenerateSettleDoc: React.FC = () => {
  const {
    detail: {
      confirmPaymentNodeAndFieldBO: {
        confirmPaymentNodeBO: {
          paymentType = 1,
          collectionMoney = 0,
          nodeStatus = 0,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          cancelReasonTypeDesc = "",
          updateTime = "",
        } = {},
      } = {},
    },
  } = useContext(DetailContext);

  // 控制结算单弹窗的隐显
  const [showSettleModal, setShowSettleModal] = useState(true);

  // 取消显示结算单的弹窗
  const handleCloseSettleModal = () => {
    setShowSettleModal(false)
  }

  // 生成结算单
  const handleGenerateSettleDoc = () => {
    setShowSettleModal(true)
  }

  // 编辑结算单
  const handleEditSettleDoc = () => {
    // 
  }

  // 删除结算单
  const handleDeleteSettleDoc = () => {
    // 
  }

  // 查看结算单
  const handleShowSettleDoc = () => {
    // 
  }

  return (
    <ConfigProvider locale={zhCN}>
      <WorkTtemBox
        title="生成结算单"
        nodeStatus={nodeStatus}
        operatorUserName={`${
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") || "待定"
        }`}
        cancelOrderReason={cancelReasonTypeDesc}
        updateTime={updateTime}
        allBtn={
          <>
            {/* 节点状态为进行中且有权限 */}
            {nodeStatus === 1 && editAuth ? (
              <Button type="primary" onClick={handleGenerateSettleDoc}>
                生成结算单
              </Button>
            ) : nodeStatus === 2 && editAuth ? (  // 节点状态为已完成且有权限
              <div className={styles.btnWrap}>
                <Button type="link" onClick={handleShowSettleDoc}>
                  查看结算单
                </Button>
                <Button danger type="primary" onClick={handleDeleteSettleDoc}>
                  删除结算单
                </Button>
                <Button type="primary" onClick={handleEditSettleDoc}>
                  编辑结算单
                </Button>
              </div>
            ) : (
              <Button disabled>
                编辑结算单
              </Button>
            )}
          </>
        }
      >
        <div className={cs(styles.contentWrap, "m-t-24")}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label={
                  paymentType === 1
                    ? "应付金额"
                    : paymentType === 2
                    ? "应收金额"
                    : "--"
                }
              >
                <span>{collectionMoney || "--"}</span>
              </Form.Item>
            </Col>
          </Row>
        </div>
      </WorkTtemBox>
      
      {/* 生成结算单的弹窗 */}
      <SettleDocModal
        show={showSettleModal} 
        onClose={handleCloseSettleModal} 
      />
    </ConfigProvider>
  );
};

export default GenerateSettleDoc;

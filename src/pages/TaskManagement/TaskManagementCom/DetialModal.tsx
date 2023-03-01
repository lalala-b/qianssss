/* eslint-disable arrow-parens */
/* eslint-disable css-modules/no-unused-class */
import { Modal, Spin, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { $getRemmonedDetail } from "src/api/taskManagement";
import type {
  detailDataType,
  DetialModalPropsType,
} from "./TaskManagementType";
import styles from "./TaskManagementCom.scss";

const DetialModal: React.FC<DetialModalPropsType> = ({
  opId,
  closeDetialModal,
  isShowDetialModal,
}) => {
  const [loading, setLoading] = useState(false);
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

  const getRemmonedDetail = async () => {
    setLoading(true);
    const res = await $getRemmonedDetail({ id: opId });
    setLoading(false);
    setDdetailData({ ...res });
  };
  const handleCancel = () => {
    closeDetialModal();
  };
  useEffect(() => {
    getRemmonedDetail();
  }, []);
  return (
    <>
      <Modal
        title="查看详情"
        width='30%'
        visible={isShowDetialModal}
        onCancel={handleCancel}
        footer={null}
        className={styles.DetailMoadal}
      >
        <div className={styles.SpinWapper}>
          <div className={styles.mb12}>
            <span className={styles.label}>商机负责人:</span>
            <span>{detailData.chargerName}</span>
          </div>
          <div className={styles.mb12}>
            <span className={styles.label}>品牌:</span>
            <span>
              {detailData.brandName ? detailData.brandName : "保密项目"}
            </span>
          </div>
          <div className={styles.mb12}>
            <span className={styles.label}>预计发布时间:</span>
            <span>
              {detailData.publishStart
                ? ` ${detailData.publishStart}~${detailData.publishEnd}`
                : "未定"}
            </span>
          </div>
          <Row gutter={5}>
            <Col span={12}>
              <div className={styles.mb12}>
                <span className={styles.label}>合作产品:</span>
                <span>{detailData.coProduct}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.mb12}>
                <span className={styles.label}>合作产品品类:</span>
                <span>{detailData.coCateName}</span>
              </div>
            </Col>
          </Row>
          <div style={{display:'flex'}}>
            <span className={styles.label}> 需求描述:</span>
            <span className={styles.desciption}  style={{whiteSpace:"pre-wrap"}}>{detailData.description}</span>
          </div>
          {loading && <Spin />}
        </div>
      </Modal>
    </>
  );
};

export default DetialModal;

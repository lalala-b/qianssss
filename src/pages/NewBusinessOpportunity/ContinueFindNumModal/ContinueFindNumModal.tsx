import { useState } from "react";
import { message, Modal } from "antd";
import { $continueFindNum } from "src/api/business";
import { ExclamationCircleFilled } from "@ant-design/icons";
import styles from "./ContinueFindNumModal.scss";

interface ConfirmCustomerSelectNumModalPropType {
  opId: number;
  show: boolean;
  onGetList: () => void;
  onClose: () => void;
}

const ContinueFindNumModal: React.FC<ConfirmCustomerSelectNumModalPropType> = ({
  opId,
  show,
  onGetList,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleShowContinueFindNumModal = () => {
    setLoading(true);
    $continueFindNum({
      opId,
    })
      .then(res => {
        console.info(res);
        // if (res) {
        setLoading(false);
        message.success("操作成功");
        onClose();
        onGetList();
        // }
      })
      .catch(e => {
        setLoading(false);
        message.error(String(e.message));
      });
  };

  return (
    <Modal
      visible={show}
      cancelText="取消"
      okText="继续"
      okButtonProps={{
        loading,
      }}
      onOk={handleShowContinueFindNumModal}
      onCancel={onClose}
    >
      <div className={styles.continueFindNumWrap}>
        <ExclamationCircleFilled
          style={{ color: "#efb041", fontSize: "30px" }}
        />
        <div className={styles.continueFindNumTip}>
          <p>
            继续找号将回到“找号中”状态，可继续录入新的账号/重新发布找号任务。
          </p>
          <p>是否继续操作？</p>
        </div>
      </div>
    </Modal>
  );
};

export default ContinueFindNumModal;

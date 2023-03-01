/* eslint-disable arrow-parens */
/* eslint-disable css-modules/no-unused-class */
import { Modal, Cascader, message, Button } from "antd";
import { useEffect, useState } from "react";
import { $distributeMed, $getOppoMediumBuyer } from "src/api/taskManagement";
import type {
  MediumMOdalPropsType,
  OppoMediumBuyerType,
} from "./TaskManagementType";
import styles from "./TaskManagementCom.scss";

const DistributionMediumModal: React.FC<MediumMOdalPropsType> = ({
  isModalVisible,
  handleCloseModal,
  pid,
}) => {
  // 媒介采买人
  const [taskFollower, setTaskFollower] = useState<number>();
  const [btnLoading, setBtnLoading] = useState(false);
  const [oppoMediumBuyerList, setOppoMediumBuyerList] =
    useState<OppoMediumBuyerType[]>();
  // 确认提交
  const handleOk = () => {
    if (!taskFollower) {
      message.error("媒介采买人不能为空");
      return;
    }
    setBtnLoading(true);
    const params = {
      taskFollower,
      ptaskId: pid,
    };
    $distributeMed(params)
      .then(() => {
        setBtnLoading(false);
        handleCloseModal();
      })
      .catch((e: any) => {
        setBtnLoading(false);
        handleCloseModal();
        message.error(e.message);
      });
  };
  const getOppoMediumBuyer = () => {
    $getOppoMediumBuyer({ pid })
      .then((res: OppoMediumBuyerType[]) => {
        setOppoMediumBuyerList([...res]);
      })
      .catch(e => {
        message.error(e.message);
      });
  };
  const handleCancel = () => {
    handleCloseModal();
  };
  const handleSelect = (value: any[]) => {
    if (value && value.length) {
      setTaskFollower(Number(value[value.length - 1]));
    }
  };
  useEffect(() => {
    getOppoMediumBuyer();
  }, []);
  return (
    <>
      <Modal
        title="分配媒介采买人"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={
          <>
            <Button onClick={handleCancel} type="default">
              取消
            </Button>
            <Button type="primary" onClick={handleOk} loading={btnLoading}>
              确认
            </Button>
          </>
        }
      >
        <p className={styles.mb12}>分配后，相关媒介采买人会收到该找号任务。</p>
        <p className={styles.mb24}>已有该商机的找号任务的人，不能再被选中。</p>
        <Cascader
          allowClear
          style={{ width: "100%", marginBottom: "40px" }}
          options={oppoMediumBuyerList}
          fieldNames={{
            label: "orgName",
            value: "id",
            children: "childOrgList",
          }}
          placeholder="请选择对应任务跟进人"
          showSearch
          expandTrigger="hover"
          onChange={handleSelect}
        />
      </Modal>
    </>
  );
};

export default DistributionMediumModal;

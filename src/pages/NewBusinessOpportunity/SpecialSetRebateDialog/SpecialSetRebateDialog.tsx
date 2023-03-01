import { useState, useEffect } from "react";
import { Modal, Select, InputNumber, Button, message } from "antd";
import cs from "classnames";
import { $specialChargeSave, $deleteSpecialCharge } from "src/api/business";
import styles from "./SpecialSetRebateDialog.scss";

const { Option } = Select;

interface SpecialSetRebateDialogPropsType {
  specialType: string;
  show: boolean;
  totalRebate: number;
  deleteId?: number;
  onClose: () => void;
  onChangeSpecialType: (value: string) => void;
  onGetList: () => void;
  onGetConfirmParams?: () => any;
}

const REFUND_TYPE_ARR = [
  { id: 1, label: "对公" },
  { id: 2, label: "对私" },
  { id: 3, label: "对公+对私" },
];

const SpecialSetRebateDialog: React.FC<SpecialSetRebateDialogPropsType> = ({
  specialType,
  show,
  totalRebate,
  deleteId,
  onClose,
  onChangeSpecialType,
  onGetList,
  onGetConfirmParams,
}) => {
  const [rebateLoading, setRebateLoading] = useState(false);
  const [refundType, setRefundType] = useState<number>();
  const [totalRebatePrivate, setTotalRebatePrivate] = useState(0.01);

  const handleChangeRefund = (val: number) => {
    setRefundType(val);
    // 对公+对私 初始化对私
    if (val === 3) {
      setTotalRebatePrivate(0.01);
    }
  };

  const handleSetRebate = async () => {
    if (!refundType) {
      message.error("请先选择返款方式");
      return;
    }

    // 对公+对私
    if (refundType === 3 && Number(totalRebatePrivate) < 0.01) {
      message.error("对私返款不能小于0.01");
      return;
    }

    setRebateLoading(true);

    const rebateParams: any = {};

    rebateParams.rebateType = refundType;

    // 对公
    if (refundType === 1) {
      rebateParams.totalRebateCorporate = totalRebate;
    }

    // 对私
    if (refundType === 2) {
      rebateParams.totalRebatePrivate = totalRebate;
    }

    // 对公+对私
    if (refundType === 3) {
      rebateParams.totalRebatePrivate = totalRebatePrivate;
      rebateParams.totalRebateCorporate = +totalRebate - +totalRebatePrivate;
    }

    // 删除
    if (specialType === "delete") {
      try {
        await $deleteSpecialCharge({
          ...rebateParams,
          id: deleteId,
        });

        message.success("删除成功");
        setRebateLoading(false);

        onChangeSpecialType("");
        onGetList();
        onClose();
      } catch (e: any) {
        setRebateLoading(false);
        message.error(e.message);
      }
      return;
    }

    const params = onGetConfirmParams?.();

    try {
      await $specialChargeSave({ ...params, ...rebateParams });
      message.success(`${specialType === "edit" ? "编辑" : "新增"}成功`);
      setRebateLoading(false);
      onChangeSpecialType("");
      onGetList();
      onClose();
    } catch (e: any) {
      setRebateLoading(false);
      message.error(e.message);
    }
  };

  useEffect(() => {
    if (show) {
      setRefundType(undefined);
    }
  }, [show]);

  return (
    <>
      <Modal
        width="600px"
        title="重新设置对公对私返款"
        visible={show}
        maskClosable={false}
        footer={[
          <Button key={1} onClick={onClose}>
            取消
          </Button>,
          <Button
            type="primary"
            key={2}
            loading={rebateLoading}
            onClick={handleSetRebate}
          >
            确认
          </Button>,
        ]}
        onCancel={onClose}
      >
        <div className={cs(styles.notice, "m-b-24")}>
          所改动特殊收支影响了原来的对公/对私返款金额，请重新设置
        </div>

        <div className="m-b-6">线下返款支付方式：</div>
        <Select
          value={refundType}
          onChange={handleChangeRefund}
          placeholder="请选择线下返款支付方式"
          className={cs(styles.input, "m-b-6")}
        >
          {REFUND_TYPE_ARR.map(({ id, label }) => (
            <Option key={id} value={id}>
              {label}
            </Option>
          ))}
        </Select>
        {refundType === 1 && <div>商机对公返款合计：{totalRebate}</div>}

        {refundType === 2 && <div>商机对私返款合计：{totalRebate}</div>}

        {refundType === 3 && (
          <div>
            <div className="m-b-6">
              商机对私返款合计：
              <InputNumber
                value={totalRebatePrivate}
                onChange={(val: number) => setTotalRebatePrivate(val)}
                min={0.01}
                max={Number(totalRebate || 0.01) - 0.01}
                precision={2}
              />
            </div>
            <div className="m-b-6">
              商机对公返款合计：{(totalRebate || 0) - (totalRebatePrivate || 0)}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default SpecialSetRebateDialog;

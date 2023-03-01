import { useState } from "react";
import { Modal, Input, Form, message, Button } from "antd";
import { $stopCooperation } from "src/api/business";

const { TextArea } = Input;

interface NoCooperatePropType {
  opId: number;
  show: boolean;
  onGetList: () => void;
  onClose: () => void;
}

interface FormType {
  noCoReason: string;
}

const noCooperateModal: React.FC<NoCooperatePropType> = ({
  opId,
  show,
  onGetList,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleConfirmNoCooperateModal = () => {
    form.submit();
  };

  const handleFinishNoCooperateForm = (params: FormType) => {
    setLoading(true)
      $stopCooperation({
        ...params,
        opId,
      }).then(res => {
        console.info(res);
        // if (res) {
          message.success("状态更新成功");
          onGetList();
          onClose();
          setLoading(false)
        // }
      }).catch(e=>{
        setLoading(false)
        message.error(String(e.message));
      });
  };

  const handleCancelNoCooperate = () => {
    onClose()
  }

  return (
    <Modal
      title="请输入不合作原因"
      visible={show}
      footer={
        [
          <Button key={1} onClick={handleCancelNoCooperate}>取消</Button>,
          <Button key={2} type="primary" loading={loading} onClick={handleConfirmNoCooperateModal}>确认</Button>,
        ]
      }
      onCancel={onClose}
    >
      <Form form={form} onFinish={handleFinishNoCooperateForm}>
        <Form.Item
          name="noCoReason"
          rules={[{ required: true, message: "请填写不合作原因" }]}
        >
          <TextArea rows={6} placeholder="(必填)不合作原因" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default noCooperateModal;

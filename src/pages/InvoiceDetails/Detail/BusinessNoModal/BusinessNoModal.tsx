/* eslint-disable css-modules/no-unused-class */
import { useContext, useState } from "react";
import { ConfigProvider, Modal, Input, Row, Col } from "antd";
import { $submitPaymentInvoice,$submitInvoiceNo } from "src/api/oaPaymentApply";
import { DetailContext } from "../DetailProvider";
import styles from "./BusinessNoModal.scss";

type BusinessNoModalType = {
  setShowOaModal: any;
  showOaModal:boolean
};
const BusinessNoModal = ({ setShowOaModal,showOaModal }: BusinessNoModalType) => {
  const {
    detail: { busOrderId },
    rebateType,
    onRefresh,
  } = useContext(DetailContext);
  const [businessNo, setBusinessNo] = useState<string>("");
  const [errTxt, setErrTxt] = useState<string>("");
  const handleSubmitOa = async () => {
    try {
        let $api:any = ''
        const params:any = {
            businessKey: businessNo,
            busOrderId,
          };
        if (+rebateType===1){
            $api = $submitInvoiceNo
        } else {
            params.toType =+rebateType === 2 ? 1 : 2
            $api = $submitPaymentInvoice
        }
      await $api(params);
      onRefresh();
      handleCancelBusiness();
    } catch (error: any) {
      setErrTxt(error.message);
    }
  };
  const handleCancelBusiness = () => {
    setShowOaModal(false);
    setBusinessNo("");
    setErrTxt("");
  };
  const handleChangeNo = (e: any) => {
    setBusinessNo(e.target.value);
  };
  return (
    <ConfigProvider>
      <Modal
        visible={showOaModal}
        title={+rebateType===1?'已申请开票，直接输入OA流程编号':'已申请付款，直接输入OA流程编号'}
        onOk={handleSubmitOa}
        okText="保存"
        cancelText="取消"
        onCancel={handleCancelBusiness}
      >
        <Row>
          <Col span={5}>
            <p style={{ lineHeight: "32px" }}>OA流程编号：</p>
          </Col>
          <Col span={14}>
            <Input
              value={businessNo}
              onChange={(e: any) => handleChangeNo(e)}
              maxLength={30}
            />
          </Col>
        </Row>
        {!!errTxt && <p className={styles.error}>{errTxt}</p>}
      </Modal>
    </ConfigProvider>
  );
};

export default BusinessNoModal;

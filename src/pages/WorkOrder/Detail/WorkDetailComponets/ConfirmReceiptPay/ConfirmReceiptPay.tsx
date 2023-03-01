import { ConfigProvider } from "antd";
import { useContext } from "react";
import zhCN from "antd/es/locale/zh_CN";
import { DetailContext } from "../../DetailProvider";
import ConfirmReceiptPayWrapForSign from "./ConfirmReceiptPayWrap/ConfirmReceiptPayWrapForSign";
import ConfirmReceiptPayWrapForMeduim from "./ConfirmReceiptPayWrap/ConfirmReceiptPayWrapForMeudim";

const ConfirmReceiptPay: React.FC = () => {
  const {
    detail: { orderBaseInfoBO: { orderBelongType = 1 } = {} },
  } = useContext(DetailContext);
  return (
    <ConfigProvider locale={zhCN}>
      {/* orderBelongType 1为签约， 2为媒介 */}
      {+orderBelongType === 1 ? (
        <ConfirmReceiptPayWrapForSign />
      ) : +orderBelongType === 2 ? (
        <ConfirmReceiptPayWrapForMeduim />
      ) : (
        ""
      )}
    </ConfigProvider>
  );
};

export default ConfirmReceiptPay;

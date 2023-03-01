import { useContext } from "react";
import {
  ConfigProvider,
} from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { DetailContext } from "../../DetailProvider";
import FinancialNumberForSign from "./FinancialNumberForSign"
import FinancialNumberForMedia from "./FinancialNumberForMedia"

const FinancialNumber: React.FC = () => {
  const {
    detail: { orderBaseInfoBO: { orderBelongType = 1 } = {} },
  } = useContext(DetailContext);

  return (
    <ConfigProvider locale={zhCN}>
      {/* orderBelongType 0为工作室，1为签约，2为媒介，3为海盗自营 */}
      {+orderBelongType === 1 ? 
        <FinancialNumberForSign />
        : <FinancialNumberForMedia />}
    </ConfigProvider>
  )
};

export default FinancialNumber;

import { Tooltip } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";
import { QuestionCircleOutlined } from '@ant-design/icons';

interface IconTipPropsType {
  icon?: JSX.Element;
  content: string | JSX.Element;
  placement?: TooltipPlacement;
  color?: string;
  getPopupContainer?: (triggleNode: HTMLElement) => HTMLElement; // 挂载到对应的父元素中
  trigger?: string | string[];
  overlayInnerStyle?: any;  // 卡片内容区域的样式对象
  iconStyle?: any;
}

const IconTip: React.FC<IconTipPropsType> = ({
  icon = <QuestionCircleOutlined />,
  content,
  placement = "top",
  color,
  getPopupContainer,
  trigger = "hover",
  overlayInnerStyle,
  iconStyle = {
    marginLeft: "10px",
  },
}) => (
  <>
    <Tooltip
      placement={placement}
      title={content}
      color={color}
      getPopupContainer={getPopupContainer}
      trigger={trigger}
      overlayInnerStyle={overlayInnerStyle}
    >
      <span style={iconStyle}>{icon}</span>
    </Tooltip>
  </>
);

export default IconTip;

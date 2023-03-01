import { Tooltip } from "antd";
import styles from "./OverPopover.scss";

interface OverPopoverPropsType {
  content: string;
  showCount?: number;
  type?: string;
}
const OverPopover: React.FC<OverPopoverPropsType> = ({
  content,
  showCount = 20,
  type = "text",
}) => (
  <div className={styles.OverPopover}>
    {content && content.length ? (
      content.length > showCount ? (
        <Tooltip title={content}>
          {type === "text" && (
            <span slot="reference">
              {(content || "").length > showCount
                ? `${(content || "").substr(0, showCount)}...`
                : content}
            </span>
          )}
          {/* 类型为链接且符合http:// | https://开头则为a标签否则为文本 */}
          {type === "link" && /^(http:\/\/)|(https:\/\/).*/g.test(content) ? (
            <a href={content} target="_blank" rel="noreferrer">
              {(content || "").length > showCount
                ? `${(content || "").substr(0, showCount)}...`
                : content}
            </a>
          ) : (content || "").length > showCount ? (
            `${(content || "").substr(0, showCount)}...`
          ) : (
            content
          )}
        </Tooltip>
      ) : (
        content
      )
    ) : (
      "--"
    )}
  </div>
);

export default OverPopover;

import { Tooltip } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons';
import cs from "classnames";
import { formatUnit } from "src/utils/number";
import styles from "./PriceBox.scss";

export type PriceBoxListType = {
  title?: string;
  value?: number;
  tip?:string;
}[];

const PriceBox = ({ list = [] }: { list: PriceBoxListType }) => (
  <div className={styles.flexCenter}>
    {list.map(item => {
      const { title, value, tip = '' } = item;

      return (
        <div className={cs(styles.flexCenter, styles.boxItem)} key={title}>
          <div>
            <p className={styles.title}>
              {tip ? (
                <Tooltip title={tip}>
                  <span>
                    {title} <QuestionCircleOutlined />
                  </span>
                </Tooltip>
              ) : (
                title
              )}
            </p>
            <p className={styles.value}> {formatUnit(value)} </p>
          </div>
        </div>
      );
    })}
  </div>
);

export default PriceBox;

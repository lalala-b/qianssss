/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import cs from "classnames";
import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import styles from "./PriceBox.scss";

type PriceBoxType = {
  list: {
    title?: string;
    value?: number;
    tip?: string;
  }[];
  changeTab: any;
};

const PriceBox = ({ list = [], changeTab }: PriceBoxType) => {
  const handleChangeTab = (index: number, value: number) => {
    if (index === 0 && value > 0) {
      changeTab("4", "1");
    }
    if (index === 1 && value > 0) {
      changeTab("4", "2");
    }
    if (index === 2 && value > 0) {
      changeTab("5", "1");
    }
    if (index === 3 && value > 0) {
      changeTab("5", "2");
    }
    if (index === 4 && value > 0) {
      changeTab("6", "1");
    }
    if (index === 5 && value > 0) {
      changeTab("6", "2");
    }
    if (index === 6 && value > 0) {
      changeTab("7", "1");
    }
    if (index === 7 && value > 0) {
      changeTab("7", "2");
    }
  };
  return (
    <div className={styles.flexCenter}>
      {list.map((item, index) => {
        const { title, value, tip } = item;
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
              <p
                className={index % 2 === 0 ? styles.value1 : styles.value2}
                onClick={() => handleChangeTab(index, Number(value))}
              >
                {value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceBox;

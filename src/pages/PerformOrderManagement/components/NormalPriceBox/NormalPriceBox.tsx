/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import cs from "classnames";
import { formatUnit } from "src/utils/number";
// import { useState } from "react";
import styles from "./NormalPriceBox.scss";

type PriceBoxType = {
  list: {
    title?: string;
    value?: number;
    tip?: string;
  }[];
  handleClickNormalBox: any;
};
const PriceBox = ({
  list = [],
  handleClickNormalBox,
}: PriceBoxType) => {
  const handleClick = (title: string,value:any) => {
    if (+value===0) return
    if (title === "已履约工单数") {
      const e = { target: { checked: true } };
      handleClickNormalBox('已履约工单数',e);
    }
    if (title === "履约延期工单数") {
      handleClickNormalBox('履约延期工单数',{ performDelayFlag: Number(true) });
    }
    if (title === "取消合作工单数") {
      handleClickNormalBox('取消合作工单数',{ orderStatus:"11"});
    }
  };
  return (
    <div className={styles.flexCenter}>
      {list.map(item => {
        const { title, value, tip = "" } = item;

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
                onClick={() => handleClick(title || "",value||0)}
                className={
                  ["已履约工单数", "履约延期工单数", "取消合作工单数"].includes(
                    title || ""
                  )
                    ? styles.value1
                    : styles.value
                }
              >
                {formatUnit(value)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceBox;

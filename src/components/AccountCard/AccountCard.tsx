/* eslint-disable css-modules/no-unused-class */
/* eslint-disable jsx-a11y/anchor-is-valid */
// 账号信息宽度建议200px
import { Tooltip, Tag } from "antd";
import { useEffect, useState } from "react";
import cs from "classnames";
import styles from "./AccountCard.scss";
import { SvgIcon } from "../SvgIcon/SvgIcon";

const THIRD_INDEX_URL_MAP: any = {
  25: {
    tip: "星图主页链接",
    iconClass: "xintu",
  },
  26: {
    tip: "聚星主页链接",
    iconClass: "juxing",
  },
};

const DEFAULT_CONFIG = {
  imgUrl: "accountImg",
  name: "accountName",
  platName: "platName",
  platId: "platId",
  xingtuUrl: "xingtuIndexUrl",
  accountUrl: "accountLoginUrl",
};

interface configType {
  imgUrl: string;
  name: string;
  platName: string;
  platId: string;
  xingtuUrl: string;
  accountUrl: string;
}
interface AccountCardType {
  info: any;
  options?: any;
  showTags?: boolean;
  last?: JSX.Element | number | string;
  middle?: JSX.Element | number | string;
  className?: string;
  defaultWH?: number;
  showNameTooltip?:boolean;// 默认账号名称超出6个字展示气泡
}

const AccountCard: React.FC<AccountCardType> = ({
  info,
  options,
  showTags = false,
  className,
  middle,
  last,
  defaultWH = 66,
  showNameTooltip=true,
}) => {
  const [config, setConfig] = useState<configType>(DEFAULT_CONFIG);
  useEffect(() => {
    setConfig({ ...Object.assign({}, DEFAULT_CONFIG, options) });
  }, []);
  const handleToHref = () => {
    const { origin, pathname } = window.location;
    if ([25, 26].includes(info.platId)) {
      if (!info.accountId) return;
      window.open(
        `${origin}${pathname}/#/details/account/${info.platId}/${info.accountId}`
      );
    } else if (info.platId === 2) {
      if (!info.accountId) return;
      window.open(
        `${origin}${pathname}/#/details/bilibili-account/${info.platId}/${info.accountId}`
      );
    } else {
      window.open(info[config.accountUrl]);
    }
  };
  return (
    <div className={cs(styles.accountCard, className)}>
      <a
        className={styles.accountCardImage}
        style={{ width: `${defaultWH}px`, height: `${defaultWH}px` }}
        target="_blank"
        onClick={handleToHref}
      >
        <img src={info[config.imgUrl]} alt="" />
      </a>
      <div>
        {info[config.name] && info[config.name].length > 6&&showNameTooltip ? (
          <Tooltip title={info[config.name]}>
            <a
              onClick={handleToHref}
              target="_blank"
              className={`${styles.accountCardName} textOverHidden1`}
              rel="noreferrer"
            >
              {info[config.name]}
            </a>
          </Tooltip>
        ) : (
          <a
            onClick={handleToHref}
            target="_blank"
            className={`${styles.accountCardName} textOverHidden1`}
            rel="noreferrer"
          >
            {info[config.name]}
          </a>
        )}
        <div className={styles.accountCardPlat}>
          {info[config.platId] ? (
            <a href={info[config.accountUrl]} target="_blank" rel="noreferrer">
              <Tooltip title={info[config.platName]} placement="topLeft">
                <img
                  className={styles.accountCardPlatLogo}
                  src={`//qpmcn-1255305554.cos.ap-beijing.myqcloud.com/plat_${
                    info[config.platId]
                  }.png`}
                  alt=""
                />
              </Tooltip>
            </a>
          ) : (
            ""
          )}
          {info[config.xingtuUrl] && config.platId ? (
            <a href={info[config.xingtuUrl]} target="_blank" rel="noreferrer">
              <Tooltip
                title={
                  (THIRD_INDEX_URL_MAP[info[config.platId] || 25] || {}).tip
                }
                placement="topLeft"
              >
                <span>
                  <SvgIcon
                    iconClass={
                      (THIRD_INDEX_URL_MAP[info[config.platId] || 25] || {})
                        .iconClass || ""
                    }
                  />
                </span>
              </Tooltip>
            </a>
          ) : (
            ""
          )}
        </div>
        {middle}
        {(info.sysAccountTag ||
          info.accountTag ||
          info.tagValue ||
          (info.accountTagInfoBOList || []).length) &&
        showTags ? (
          <div>
            {info.sysAccountTag?.split(",").map((item: string) => (
              <Tag color="blue">{item}</Tag>
            ))}
            {info.accountTag
              ? info.accountTag?.split(",").map((item: string) => (
                  <Tag color="blue" key={item}>
                    {item}
                  </Tag>
                ))
              : ""}
            {(info.accountTagInfoBOList || []).length
              ? info.accountTagInfoBOList?.split(",").map((item: string) => (
                  <Tag color="blue" key={item}>
                    {item}
                  </Tag>
                ))
              : (info.tagValue || []).length
              ? info.tagValue?.split(",").map((item: string) => (
                  <Tag color="blue" key={item}>
                    {item}
                  </Tag>
                ))
              : ""}
          </div>
        ) : (
          ""
        )}
      </div>
      {last}
    </div>
  );
};

export default AccountCard;

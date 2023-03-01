/* eslint-disable @typescript-eslint/no-empty-function */
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import cs from "classnames";
import styles from "./Swiper.scss";

interface SwiperPropsType {
  className?: string;
  itemClassName?: string;
  list: string[];
  itemType?: "img" | "text";
  autoplay?: boolean;
  config?: any;
  afterChange?: (current: number) => void;
  beforeChange?: (from: number, to: number) => void;
  prevArrow?: React.ReactNode;
  nextArrow?: React.ReactNode;
}

const Swiper: React.FC<SwiperPropsType> = ({
  className,
  itemClassName,
  itemType = "img",
  list = [],
  autoplay = true,
  config = {},
  afterChange = () => {},
  beforeChange = () => {},
  prevArrow,
  nextArrow,
}) => (
  <div className={styles.root}>
    <Carousel
      arrows
      className={cs(styles.carousel, className)}
      afterChange={afterChange}
      beforeChange={beforeChange}
      autoplay={autoplay}
      {...config}
      prevArrow={prevArrow || <LeftOutlined />}
      nextArrow={nextArrow || <RightOutlined />}
    >
      {list.map(item => (
        <div key={item} className={cs(styles.item, itemClassName)}>
          {itemType === "img" ? <img src={item} alt="" /> : <div>{item}</div>}
        </div>
      ))}
    </Carousel>
  </div>
);
export default Swiper;

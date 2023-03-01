import { useContext } from "react";
import { Row, Col, Button } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import cs from "classnames";
import AccountCard from "src/components/AccountCard";
import IconTip from "src/components/IconTip";
import { DetailContext } from "../DetailProvider";
import styles from "./WorkOrderBaseInfo.scss";

const BUS_ORDER_TYPE = [
  "客户自行下单",
  "代客下单",
  "平台营收",
  "不走平台的私单",
];

const WORK_STATUS_LIST = [
  "下单信息待确认",
  "执行人待分配",
  "执行计划待录入",
  "大纲待确认",
  "脚本待确认",
  "视频初稿待确认",
  "待履约",
  "待确认收付款",
  "待核账",
  "已核账",
  "已取消合作",
];

const WorkOrderBaseInfo = () => {
  const {
    detail: { orderBaseInfoBO = {} },
    SPECIAL_MAP,
  } = useContext(DetailContext);

  const {
    brandName = "",
    executorUserName = "",
    coProduct = "",
    orderBelong = "",
    orderBelongType = "",
    orderType = "",
    busOrderType = "",
    orderUser = "",
    orderStatus = "",
    businessUserName = "",
    businessTeamName = "",
    businessGroupName = "",
    orderNo = "",
    executeGroupName = "",
    // platName = "",
    // accountName = "",
    busOrderNo = "",
    opNo = "",
    coopType = 7,
    orderFlag = 0,
    orderDuration = 0,
    bfFlag = 0,
    sendFlag = 0,
    authDuration = 0,
    specialCase = "",
    rebatePrivateRate = 0,
    rebatePrivate = 0,
    rebateCorporate = 0,
  } = orderBaseInfoBO as any;

  const handleGoBusinessOrder = () => {
    window.open(`/#/qp/invoice-management?busOrderNo=${busOrderNo}`);
  };

  const handleGoBusinessOp = () => {
    window.open(`/#/qp/business-opportunity-manage?opNo=${opNo}`);
  };

  const getValText = (str: string, val: number) => {
    const getAuthorizationText = (num: number) => {
      let authorizationText = "";
      switch (num) {
        case 0:
          authorizationText = "不授权";
          break;
        case 1:
          authorizationText = "授权1个月";
          break;
        case 2:
          authorizationText = "授权3个月";
          break;
        case 3:
          authorizationText = "授权6个月";
          break;
        default:
          break;
      }
      return authorizationText;
    };

    let text = "";
    switch (str) {
      case "orderFlag":
        text = val ? val === 1 ? "已下单" : "无须下单" : "未下单";
        break;
      case "orderDuration":
        text = val === 0 ? "20s" : val === 1 ? "60s" : "60s+";
        break;
      case "bfFlag":
      case "sendFlag":
        text = val ? "是" : "否";
        break;
      case "authDuration":
        text = getAuthorizationText(val);
        break;
      default:
        break;
    }

    return text;
  };

  return (
    <div className={cs(styles.root, "qp-wrapper")}>
      <div className={cs(styles.title)}>工单信息</div>
      <div>
        <Row gutter={24}>
          <Col span={8} className="m-b-24">
            品牌：{brandName || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            账号-平台：
            <AccountCard
              defaultWH={32}
              info={orderBaseInfoBO}
              className={styles.account}
            />
            {/* {[accountName, platName].filter(item => item).join("-") || "--"} */}
          </Col>
          <Col span={8} className="m-b-24">
            执行人：{executorUserName || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            合作产品：{coProduct || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            订单归属：{orderBelong || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            工单类型：
            {+orderType === 1
              ? `视频工单`
              : `特殊工单（${SPECIAL_MAP[coopType]}）`}
            {+orderType === 1 && <VideoCameraOutlined className="m-l-6" />}
          </Col>
          <Col span={8} className="m-b-24">
            商单类型：{busOrderType ? BUS_ORDER_TYPE[+busOrderType - 1] : "--"}
          </Col>
          <Col span={8} className="m-b-24">
            {+orderBelongType === 0 ? (
              <>账号绑定人：</>
            ) : +orderBelongType === 1 ? (
              <>签约经纪人：</>
            ) : +orderBelongType === 3 ? (
              <>账号绑定人：</>
            ) : (
              <>媒介采买人：</>
            )}
            {orderUser || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            工单状态：
            {orderStatus ? WORK_STATUS_LIST[+orderStatus - 1] : "--"}
          </Col>
          <Col span={8} className="m-b-24">
            所属商单：
            <Button
              type="link"
              className={styles.button}
              onClick={handleGoBusinessOrder}
            >
              查看
            </Button>
          </Col>
          <Col span={8} className="m-b-24">
            商务信息：
            {[businessUserName, businessTeamName, businessGroupName]
              .filter(item => item)
              .join("-") || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            工单号：
            {orderNo || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            所属商机：
            <Button
              type="link"
              className={styles.button}
              onClick={handleGoBusinessOp}
            >
              查看
            </Button>
          </Col>
          <Col span={8} className="m-b-24">
            执行人小组：{executeGroupName || "--"}
          </Col>
          <Col span={8} className="m-b-24">
            下单状态：{orderFlag === null ?  "--" : getValText('orderFlag', orderFlag)}
          </Col>
          <Col span={8} className="m-b-24">
            下单时长：{orderDuration === null ? "--" : getValText('orderDuration', orderDuration)}
          </Col>
          <Col span={8} className="m-b-24">
            是否出bf：{bfFlag === null ? "--" : getValText('bfFlag', bfFlag)}
          </Col>
          <Col span={8} className="m-b-24">
            是否寄品：{sendFlag === null ? "--" : getValText('sendFlag', sendFlag)}
          </Col>
          <Col span={8} className="m-b-24">
            授权情况：{authDuration === null ? "--" : getValText('authDuration', authDuration)}
          </Col>
          <Col span={8} className="m-b-24">
            特殊情况：{specialCase || "--"}
          </Col>

          <Col span={8} className="m-b-24">
            对私返款比例：{rebatePrivateRate || 0}%
            <IconTip content="商单对私返款比例=商单对私返款/（商单平台报价+商单特殊收支销售收入总金额）" />
          </Col>

          <Col span={8} className="m-b-24">
            对私返款：{rebatePrivate || 0}
            <IconTip content="工单对私返款=工单平台报价*商单对私返点比例" />
          </Col>

          <Col span={8} className="m-b-24">
            对公返款：{rebateCorporate || 0}
            {/* <IconTip content="工单对公返款=【官方】平台实际下单价-商务实际营收-工单对私返款" /> */}
            <IconTip content="工单对公返款=返点金额-工单对私返款" />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WorkOrderBaseInfo;

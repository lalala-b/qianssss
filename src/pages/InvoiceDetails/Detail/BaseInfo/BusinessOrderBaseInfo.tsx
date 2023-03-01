/* eslint-disable css-modules/no-unused-class */
import { useContext } from "react";
import { Row, Col, Button, Tag } from "antd";
import cs from "classnames";
import IconTip from "src/components/IconTip";
import { DetailContext } from "../DetailProvider";
import styles from "./BusinessOrderBaseInfo.scss";

const BUS_ORDER_TYPE = [
  "客户自行下单",
  "代客下单",
  "平台营收",
  "不走平台的私单",
];

const WorkOrderBaseInfo = () => {
  const { detail = {} } = useContext(DetailContext);

  const {
    customerName = "",
    brandName = "",
    coProductName = "",
    businessUserName = "",
    coCateName = "",
    createTime = "",
    orderTime = "",
    offlinePayCorTypeStr = "",
    offlinePayPriTypeStr = "",
    offlineRecTypeStr = "",
    busOrderType = "",
    officePrice = "",
    businessIncome = "",
    salesIncome = "",
    costOfSales = "",
    executeGroupName = "",
    grossProfitRate = "",
    busOrderNo = "",
    cusOfflineSupplement = "",
    rebateCorporate = "",
    rebatePrivate = "",
    darenOtherCost = "",
    otherIncome = "",
    opNo = "",
    oppoFromName = "",
    opCoTypeDesc = "",
    performanceMoney,
    companyOfflineSupplement = "",
    companyName = "",
  } = detail as any;

  return (
    <div className={cs(styles.root, "qp-wrapper")}>
      <div className={cs(styles.title)}>商单信息</div>
      <div>
        <Row gutter={24}>
          <Col span={8} className="m-b-12">
            商机来源：{oppoFromName || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            客户名称：{companyName || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            客户联系人：{customerName || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            商机合作类型：{opCoTypeDesc || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            品牌-合作产品：
            {brandName && coProductName
              ? `${brandName}-${coProductName}`
              : brandName || coProductName || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            产品品类：{coCateName || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            创建人：{businessUserName || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            创建时间：{createTime || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            商单成单时间：{orderTime || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            商单类型：{busOrderType ? BUS_ORDER_TYPE[+busOrderType - 1] : "--"}
          </Col>
          <Col span={8} className="m-b-12">
            执行人小组：{executeGroupName || "--"}
          </Col>
          <Col span={8} className="m-b-12">
            商单号：
            {busOrderNo || "--"}
          </Col>
          <Col span={8} className="m-b-12" style={{ height: "22px" }}>
            所属商机：
            <Button
              type="link"
              className={styles.button}
              href={`#/qp/business-opportunity-manage?opNo=${opNo}`}
              target="_blank"
            >
              查看
            </Button>
          </Col>
          <Col span={8} className="m-b-12" style={{ height: "22px" }}>
            工单明细：
            <Button
              type="link"
              className={styles.button}
              href={`#/qp/work-management?busOrderNo=${busOrderNo}`}
              target="_blank"
            >
              查看
            </Button>
          </Col>
          <Col span={8} className="m-b-12" style={{ alignItems: "flex-start" }}>
            商单状态：
            {offlinePayCorTypeStr ||
            offlinePayPriTypeStr ||
            offlineRecTypeStr ? (
              <>
                <div>
                  {offlinePayCorTypeStr && (
                    <div>
                      线下应付（对公）
                      <Tag
                        color={
                          offlinePayCorTypeStr === "取消合作" ? "red" : "blue"
                        }
                      >
                        {offlinePayCorTypeStr}
                      </Tag>
                    </div>
                  )}
                  {offlinePayPriTypeStr && (
                    <div>
                      线下应付（对私）
                      <Tag
                        color={
                          offlinePayPriTypeStr === "取消合作" ? "red" : "blue"
                        }
                      >
                        {offlinePayPriTypeStr}
                      </Tag>
                    </div>
                  )}
                  {offlineRecTypeStr && (
                    <div>
                      线下应收{" "}
                      <Tag
                        color={
                          offlineRecTypeStr === "取消合作" ? "red" : "blue"
                        }
                      >
                        {offlineRecTypeStr}
                      </Tag>
                    </div>
                  )}
                </div>
              </>
            ) : (
              "--"
            )}
          </Col>
        </Row>
        <div className={styles.baseLine} />
        <Row gutter={24}>
          <Col span={8} className="m-b-12">
            平台报价：{officePrice || "--"}
            <IconTip content="各工单“平台报价”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            商务实际营收：
            {businessIncome || "--"}
            <IconTip
              content={
                <>
                  *各工单和特殊收支的“商务实际营收”之和，不含取消合作的工单
                  <br />
                  *商务实际营收 = 平台报价 -
                  【平台报价*返点比例】+其他收入+手续费收入
                  <br />
                  *手续费收入 =
                  【报给客户】官方平台手续费-【实际】官方平台手续费
                </>
              }
            />
          </Col>
          <Col span={8} className="m-b-12">
            销售收入：{salesIncome || "--"}
            <IconTip content="各工单和特殊收支的“销售收入”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            销售成本：{costOfSales || "--"}
            <IconTip content="各工单和特殊收支的“销售成本”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            绩效营收：{performanceMoney === null ? "--" : performanceMoney}
            <IconTip content="各工单和特殊收支的“绩效营收”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            毛利率：
            {+grossProfitRate === 0 || +grossProfitRate
              ? `${grossProfitRate}%`
              : "--"}
            <IconTip content="（视频工单+特殊工单+特殊收支的绩效营收之和）/（视频工单+特殊工单+特殊收支的销售收入之和）" />
          </Col>
          <Col span={8} className="m-b-12">
            线下应收：{cusOfflineSupplement || "--"}
            <IconTip content="各工单“线下应收”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            线下应付：
            {companyOfflineSupplement || "--"}
            <IconTip content="各工单“线下应付”之和+特殊收支“对公返款+对私返款”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            对公返款：{rebateCorporate || "--"}
            <IconTip content="各工单和特殊收支的“对公返款”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            对私返款：{rebatePrivate || "--"}
            <IconTip content="各工单和特殊收支的“对私返款”之和，不含取消合作的工单" />
          </Col>
          <Col span={8} className="m-b-12">
            达人其他成本：{darenOtherCost || "--"}
            <IconTip content="各工单“达人其他成本”之和，不含取消合作的工单 " />
          </Col>
          <Col span={8} className="m-b-12">
            其他收入：{otherIncome || "--"}
            <IconTip content="各工单“其他收入”之和，不含取消合作的工单 " />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WorkOrderBaseInfo;

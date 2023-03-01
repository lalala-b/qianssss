/* eslint-disable css-modules/no-unused-class */
/* eslint-disable no-unused-expressions */
import { useState, useEffect } from "react";
import {
  Drawer,
  Tag,
  Steps,
  Tabs,
  Spin,
  message,
  Modal,
  Button,
  Popover,
  // OnSingleChange,
  // DefaultOptionType,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import cs from "classnames";
import {
  $getBussinessOpportunityProgressList,
  $getBussinessOpportunityDetail,
  BussinessOpportunityDetailResType,
  $getOppHeadColumnInfo,
  OppHeadColumnInfoResType,
  $entryFinish,
  $getSpecialChargeList,
} from "src/api/business";
import IconTip from "src/components/IconTip";
import ConfirmCooperateModal from "../ConfirmCooperateModal";
import NoSearchBasicData from "../BusinessOpportunityDrawer/BasicData";
import SpecialPayments from "./SpecialPayments";
import styles from "./NoSearchOpportunityDrawer.scss";

const { Step } = Steps;
const { TabPane } = Tabs;

interface NoSearchOpportunityDrawerPropType {
  show: boolean;
  type: DrawerType;
  id?: number | string;
  activeKeyForCommand?: boolean;
  brand: any;
  oppoFromListData: any;
  customerListData: any;
  customerTypeListData: any;
  businessOppoFollowersData: any;
  onClose: () => void;
  onRefesh: (flag?: boolean) => void;
}

const NoSearchOpportunityDrawer: React.FC<
  NoSearchOpportunityDrawerPropType
> = ({
  show,
  type,
  id,
  activeKeyForCommand,
  brand,
  oppoFromListData,
  customerListData,
  customerTypeListData,
  businessOppoFollowersData,
  onClose,
  onRefesh,
}) => {
  const [activeKey, setActiveKey] = useState<string>("1");
  const [statusList, setStatusList] = useState<{ id: number; name: string }[]>(
    []
  );
  const [statusStep, setStatusStep] = useState<number | null>(null);
  const [basicLoading, setBasicLoading] = useState(false);
  const [detail, setDetail] = useState<
    BussinessOpportunityDetailResType | Record<string, never>
  >({});
  const [basicFormChange, setBasicFormChange] = useState(false);
  const [specialPaymentChange, setSpecialPaymentChange] = useState(false);
  const [needSubmitBasic, setNeedSubmitBasic] = useState(false);
  const [needSubmitSpecial, setNeedSubmitSpecial] = useState(false);
  const [saveAndClose, setSaveAndClose] = useState(false);
  const [toolButtonLoading, setToolButtonLoading] = useState(false);

  const [showConfirmCooperateModal, setShowConfirmCooperateModal] =
    useState(false);
  const [confirmCooperateParams, setConfirmCooperateParams] = useState({
    opId: 0,
  });

  const [oppHeadMsg, setOppHeadMsg] = useState<OppHeadColumnInfoResType>({});

  const handleChangeTab = (e: string) => {
    // 基础信息 切换为其余tab时进行校验
    if (e !== "1" && basicFormChange) {
      Modal.confirm({
        title: "更改提示",
        content: "当前需求信息已更改，请确认是否保存？",
        okText: "保存",
        cancelText: "不保存",
        onOk: async () => {
          setNeedSubmitBasic(true);
          setBasicLoading(true);
          setSaveAndClose(false);
        },
        onCancel: () => {
          setActiveKey(e);
        },
      });
      return;
    }

    // 特殊收支 切换为其余tab时进行校验
    if (e !== "3" && specialPaymentChange) {
      Modal.confirm({
        title: "更改提示",
        content: "当前特殊收支信息未保存，请确认是否保存？",
        okText: "保存",
        cancelText: "不保存",
        onOk: async () => {
          setNeedSubmitSpecial(true);
        },
        onCancel: () => {
          setActiveKey(e);
        },
      });
      return;
    }

    setActiveKey(e);
  };

  const getBussinessOpportunityProgressList = async () => {
    const res = await $getBussinessOpportunityProgressList({ opType: 2 });
    setStatusList(res);
  };

  // 确认合作的弹窗
  const handleShowConfirmCooperateModal = async () => {
    try {
      setToolButtonLoading(true);
      const { details } = await $getSpecialChargeList({ opId: Number(id) });
      setToolButtonLoading(false);

      setConfirmCooperateParams({ opId: Number(id) });

      if (!details.length) {
        message.error("请先添加特殊收支");
        return;
      }

      setShowConfirmCooperateModal(true);
    } catch (e: any) {
      setToolButtonLoading(false);
      message.error(e.message);
    }
  };

  const handleCloseConfirmCooperateModal = () => {
    setShowConfirmCooperateModal(false);
  };

  const handleEntryFinish = async () => {
    try {
      setToolButtonLoading(true);
      await $entryFinish({ opId: Number(id) });
      message.success("录入完毕成功");
      setToolButtonLoading(false);
      getBussinessOpportunityDetail();
      onRefesh(true);
    } catch (e: any) {
      setToolButtonLoading(false);
      message.error(e.message);
    }
  };

  const generateTabsName = (name: string) => {
    let tip = "";

    let toolButton: string | JSX.Element = "";

    switch (name) {
      case "待找号":
        tip = "可通过自行找号或协同找号功能进行找号";
        break;
      case "特殊收支录入中":
        toolButton =
          statusStep === 7 ? (
            <Button
              // disabled={basicFormChange}
              type="primary"
              loading={toolButtonLoading}
              onClick={handleEntryFinish}
            >
              录入完毕
            </Button>
          ) : (
            ""
          );
        break;
      case "待客户确认合作":
        tip = "需要将最终确认合作的账号录入报价单，填入相关的合作信息";
        toolButton =
          statusStep === 4 ? (
            <Button
              type="primary"
              loading={toolButtonLoading}
              onClick={handleShowConfirmCooperateModal}
            >
              确认合作
            </Button>
          ) : (
            ""
          );
        break;
      case "确认合作":
        break;
      default:
        break;
    }

    // 只有找号中及当前状态处于二次定询时 不加div包裹及是否表单改变的判断
    if (
      name !== "找号中" &&
      !(name === "待账号负责人确认" && statusStep === 3)
    ) {
      toolButton = (
        <div className={cs("m-t-6", styles.toolButton)}>
          {basicFormChange ? (
            <Popover content="请先保存后再进行操作。">{toolButton}</Popover>
          ) : (
            toolButton
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          width:
            name === "待客户确认合作" || name === "待账号负责人确认"
              ? "140px"
              : "",
        }}
      >
        {name}
        {tip && <IconTip content={tip} />}
        {type === "edit" && toolButton}
      </div>
    );
  };

  const getBussinessOpportunityDetail = async () => {
    try {
      setBasicLoading(true);
      const res = await $getBussinessOpportunityDetail({ id: Number(id) });

      setStatusStep(+res.opStatus);
      if (+res.opStatus === 0) {
        setActiveKey("1");
      } else {
        setActiveKey("3");
      }
      setDetail(res);
      setBasicLoading(false);
      setBasicFormChange(false);
    } catch (err: any) {
      setBasicLoading(false);
      message.error(String(err.message) || "获取详情失败，请重试");
    }
  };

  const handleCancelSubmit = () => {
    // 当提交信息失败时重置状态
    setNeedSubmitBasic(false);
    setBasicLoading(false);
  };

  const handleCancelSubmitSpecial = () => {
    setNeedSubmitSpecial(false);
  };

  const handleAfterSubmit = () => {
    setNeedSubmitBasic(false);
    // setActiveKey('2')
  };

  const handleAfterSubmitSpecial = () => {
    setNeedSubmitSpecial(false);
  };

  const handleCloseDrawer = () => {
    if (type === "edit" && basicFormChange) {
      const modal = Modal.confirm({
        title: "更改提示",
        content: "当前需求信息已更改，请确认是否保存？",
        okText: "保存并关闭",
        cancelText: "直接关闭",
        closable: true,
        closeIcon: (
          <CloseOutlined
            onClick={(e: any) => {
              e.stopPropagation();
              modal.destroy();
            }}
          />
        ),
        onOk: async () => {
          setNeedSubmitBasic(true);
          setBasicLoading(true);
          setSaveAndClose(true);
        },
        onCancel: () => {
          onClose();
        },
      });
      return;
    }

    // 特殊收支
    if (type === "edit" && specialPaymentChange) {
      Modal.confirm({
        title: "更改提示",
        content: "当前特殊收支信息未保存，请确认是否保存？",
        okText: "保存",
        cancelText: "不保存",
        onOk: async () => {
          setNeedSubmitSpecial(true);
        },
        onCancel: () => {
          onClose();
        },
      });
      return;
    }
    onClose();
  };

  const handleViewInvoice = (opNo: string) => {
    window.open(`#/qp/invoice-management?opNo=${opNo}`, "_blank");
  };

  // 获取顶部商机信息
  const getOppHeadColumnInfo = async (opId: number | string | undefined) => {
    if (!opId) {
      return;
    }
    const res = await $getOppHeadColumnInfo({ opId });
    setOppHeadMsg(res);
  };

  useEffect(() => {
    if (show) {
      getBussinessOpportunityProgressList();
      getOppHeadColumnInfo(id);
      if (id && type !== "add") {
        getBussinessOpportunityDetail();
      }
    } else {
      setStatusStep(0);
      setActiveKey("1");
    }
  }, [show]);

  useEffect(() => {
    // 为了推荐账号处可以初始化时便拿到详情所有字段
    if (!Object.keys(detail).length) return;

    if (activeKeyForCommand) {
      setActiveKey("3");
    }
  }, [activeKeyForCommand, show, detail]);

  return (
    <Drawer
      width="99%"
      closable={false}
      visible={show}
      className={styles.drawer}
    >
      <div className={styles.drawerHeader}>
        <div className={styles.tagBox}>
          <Tag color="#108ee9" className={styles.titleTag}>
            {type === "edit" ? "编辑" : type === "add" ? "创建" : "查看"}商机
          </Tag>
          {Object.keys(oppHeadMsg).length ? (
            <span>
              （商机号：{oppHeadMsg.opNo}，商机跟进人：{oppHeadMsg.charger}）
            </span>
          ) : (
            ""
          )}
          {statusStep === 6 && (
            <Tag color="error" className={styles.titleTag}>
              暂不合作
            </Tag>
          )}
        </div>
        <CloseOutlined
          className={styles.closeButton}
          onClick={handleCloseDrawer}
        />
      </div>

      {/* 6为暂不合作 */}
      {statusStep !== 6 &&
        statusStep !== null &&
        (type === "edit" || type === "detail") && (
          <div className={styles.stepsBox}>
            <span>商机阶段</span>
            <Steps
              current={statusList.findIndex(
                item => +item.id === Number(statusStep)
              )}
              labelPlacement="vertical"
            >
              {statusList.map(({ id, name }) => (
                <Step key={id} description={generateTabsName(name)} />
              ))}
            </Steps>
          </div>
        )}

      <div className={styles.root}>
        <div>
          <Tabs
            activeKey={activeKey}
            onChange={handleChangeTab}
            tabBarExtraContent={
              <>
                {/* opStatus商机状态 为5是确认合作 */}
                {detail.opStatus === 5 ? (
                  <Button
                    type="primary"
                    onClick={() => handleViewInvoice(detail.opNo)}
                  >
                    查看商单
                  </Button>
                ) : (
                  ""
                )}
              </>
            }
          >
            <TabPane tab="需求信息" key="1">
              {activeKey === "1" && (
                <Spin spinning={basicLoading}>
                  <NoSearchBasicData
                    id={id}
                    detail={detail}
                    type={type}
                    show={show}
                    activeKey={activeKey}
                    brand={brand}
                    oppoFromListData={oppoFromListData}
                    customerListData={customerListData}
                    customerTypeListData={customerTypeListData}
                    businessOppoFollowersData={businessOppoFollowersData}
                    needSubmit={needSubmitBasic}
                    saveAndClose={saveAndClose}
                    onCancelSubmit={handleCancelSubmit}
                    onAfterSubmit={handleAfterSubmit}
                    onClose={onClose}
                    onRefesh={onRefesh}
                    onLoadDetail={getBussinessOpportunityDetail}
                    onBasicFormChange={(val: boolean) =>
                      setBasicFormChange(val)
                    }
                  />
                </Spin>
              )}
            </TabPane>

            {/* 除创建外显示特殊收支 */}
            {type !== "add" && (
              <TabPane tab="特殊收支" key="3">
                {activeKey === "3" && (
                  <SpecialPayments
                    id={id}
                    type={type}
                    detail={detail as BussinessOpportunityDetailResType}
                    needSubmit={needSubmitSpecial}
                    onChangeTab={(key: string) => handleChangeTab(key)}
                    onCancelSubmit={handleCancelSubmitSpecial}
                    onGetDetail={getBussinessOpportunityDetail}
                    onAfterSubmit={handleAfterSubmitSpecial}
                    onSpecialChange={(val: boolean) =>
                      setSpecialPaymentChange(val)
                    }
                  />
                )}
              </TabPane>
            )}
          </Tabs>
        </div>
      </div>

      {showConfirmCooperateModal && (
        <ConfirmCooperateModal
          {...confirmCooperateParams}
          opType={detail.opType}
          onShowDrawer={() => handleChangeTab("2")}
          show={showConfirmCooperateModal}
          // 相当于成功后回调，此处逻辑为成功后重新获取详情 且刷新外部列表状态
          onGetList={() => {
            getBussinessOpportunityDetail();
            onRefesh(true);
          }}
          onClose={handleCloseConfirmCooperateModal}
        />
      )}
    </Drawer>
  );
};

export default NoSearchOpportunityDrawer;

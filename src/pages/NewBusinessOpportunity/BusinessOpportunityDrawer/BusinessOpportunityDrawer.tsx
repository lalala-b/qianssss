/* eslint-disable no-param-reassign */
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
  $stopFinding,
  $confirmChoose,
  $getOppHeadColumnInfo,
  OppHeadColumnInfoResType,
  $checkGross,
  $checkAccountType,
} from "src/api/business";
import IconTip from "src/components/IconTip";
import AccountAttrChangeModal from "../AccountAttrChangeModal";
import CollaborativeNumFindModal from "../CollaborativeNumFindModal";
import ConfirmCooperateModal from "../ConfirmCooperateModal";
import BasicData from "./BasicData";
import RecommendAccount from "./RecommendAccount";
import SpecialPayments from "./SpecialPayments";
import styles from "./BusinessOpportunityDrawer.scss";

const { Step } = Steps;
const { TabPane } = Tabs;

interface BusinessOpportunityDrawerPropType {
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
  onRefesh: () => void;
}

const BusinessOpportunityDrawer: React.FC<
  BusinessOpportunityDrawerPropType
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

  const [showAssistFindModal, setShowAssistFindModal] = useState(false);
  const [collaborativeFindNumParams, setCollaborativeFindNumParams] = useState({
    opId: 0,
  });

  const [showConfirmCooperateModal, setShowConfirmCooperateModal] =
    useState(false);
  const [confirmCooperateParams, setConfirmCooperateParams] = useState({
    opId: 0,
  });
  // 控制账号发生变化弹窗的开关
  const [showAccountAttrChangeModal, setShowAccountAttrChangeModal] =
    useState<boolean>(false);

  // 账号属性变化的数据
  const [accountTypeChangeBOS, setAccountTypeChangeBOS] = useState<any[]>([])

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
    const res = await $getBussinessOpportunityProgressList();
    setStatusList(res);
  };

  // 检查毛利率是否合乎规定的阈值
  const checkGrossProfit = async() => {
    setToolButtonLoading(true);
    let res: any = ''

    try {
      const resData = await $checkGross({ opId: Number(id)})
      res = resData
    } catch (e: any) {
      setToolButtonLoading(false);
    }

    return new Promise(resolve => {
      // 不等于1 说明不满足
      if (+res !== 1) {
        const modal = Modal.confirm({
          title: '提示',
          content: '部分账号的毛利已低于公司规定的最低的毛利，有财务风险，建议返回检查账号金额是否有误',
          cancelText: '继续下一步',
          okText: '返回检查',
          onOk: async () => {
            resolve(false);
            modal.destroy();
            setToolButtonLoading(false);
          },
          onCancel: async () => {
            resolve(true);
          },
        })
        return
      }

      resolve(true)
    })
  }

  const handleStopFinding = async () => {
    const res = await checkGrossProfit()
    if (!res) return 
    try {
      setToolButtonLoading(true);
      await $stopFinding({ opId: Number(id) });
      message.success("已停止找号");
      setToolButtonLoading(false);
      getBussinessOpportunityDetail();
    } catch (e: any) {
      setToolButtonLoading(false);
      message.error(e.message || "停止选号失败，请重试");
    }
  };

  const handleConfirmChoose = async () => {
    const res = await checkGrossProfit()
    if (!res) return 
    try {
      setToolButtonLoading(true);
      const { type, noConfirmAccounts, confirmAccounts } = await $confirmChoose(
        { opId: Number(id), isFinal: 1 }
      );

      console.info("---", noConfirmAccounts, confirmAccounts);

      // 无需完善信息
      if (type === 1) {
        setToolButtonLoading(false);
        Modal.confirm({
          title: (
            <div>
              目前客户
              <span style={{ color: "#ff0000" }}>
                已确认{confirmAccounts || 0}个账号
              </span>
              ，仍有{noConfirmAccounts || 0}个账号未确认。
            </div>
          ),
          content: (
            <div>
              <p style={{ fontWeight: "bold" }}>点击确定后：</p>
              <p>未确认的账号状态将被自动更新为“客户已驳回”状态。</p>
              <br />
              <p>
                同时，已确认的账号将发送飞书通知给相关账号运营人，进行账号二次定询。所有账号定询后，才可创建报价单。
              </p>
            </div>
          ),
          okText: "确定",
          cancelText: "取消",
          onOk: async () => {
            setToolButtonLoading(true);
            try {
              await $confirmChoose({ opId: Number(id), isFinal: 2 });
              onRefesh();
              message.success({
                content: (
                  <span style={{ textAlign: "left", display: "inline-block" }}>
                    <b>状态更新成功</b>
                    <br />
                    <span>已发送消息通知相关账号负责人进行二次定询。</span>
                  </span>
                ),
                className: styles.successMessage,
              });
              setToolButtonLoading(false);
            } catch (e: any) {
              setToolButtonLoading(false);
              message.error(String(e.message) || "请重试");
            }
          },
        });
      }

      // 需要完善信息
      if (type === 2) {
        setToolButtonLoading(false);
        Modal.confirm({
          title: "操作失败",
          content: (
            <div>
              <p>该商机未完善品牌与预计发布时间信息，无法二次定询账号。</p>
            </div>
          ),
          okText: "完善信息",
          cancelText: "取消",
          onOk: () => {
            handleChangeTab("1");
          },
        });
        return;
      }

      // 需完善价格档期
      if (type === 3) {
        setToolButtonLoading(false);
        Modal.warning({
          title: "操作失败",
          content: (
            <div>
              <p>部分已初筛通过的账号没有确认原价、售价。请完善上述信息。</p>
            </div>
          ),
        });
        return;
      }

      // 没有客户初筛通过的账号
      if (type === 4) {
        setToolButtonLoading(false);
        Modal.warning({
          title: "操作失败",
          content: (
            <div>
              <p>没有客户初筛通过的账号，请先在下方选择客户选中的账号。</p>
            </div>
          ),
        });
        return;
      }

      // 直接请求，无任何异常
      if (type === 5) {
        try {
          await $confirmChoose({ opId: Number(id), isFinal: 2 });
          message.success("客户确认选号成功");
          setToolButtonLoading(false);
          getBussinessOpportunityDetail();
        } catch (e: any) {
          setToolButtonLoading(false);
          message.error(String(e.message) || "请重试");
        }
      }
    } catch (e: any) {
      setToolButtonLoading(false);
      message.error(e.message || "客户确认选号失败，请重试");
    }
  };

  const handleFindNo = () => {
    const { origin, pathname } = window.location;
    window.open(
      `${origin}${pathname}/#/bussiness-manage/bill-adv-manage?opId=${id}`
    );
    onClose();
  };

  // 协同找号的弹窗
  const handleShowCollaborateModal = () => {
    setCollaborativeFindNumParams({ opId: Number(id) });
    setShowAssistFindModal(true);
  };

  const handleCloseCollaborateModal = () => {
    setShowAssistFindModal(false);
  };

  // 确认合作的弹窗
  const handleShowConfirmCooperateModal = async() => {
    const res = await checkGrossProfit()
    if (!res) return 

    if (specialPaymentChange) {
      Modal.confirm({
        title: "更改提示",
        content: "当前特殊收支信息未保存，请确认是否保存？",
        okText: "保存",
        cancelText: "不保存",
        onOk: async () => {
          setNeedSubmitSpecial(true);
        },
        onCancel: () => {
          judgeAccountAttrChange()
          // setActiveKey(e);
          // setShowConfirmCooperateModal(true);
          // setConfirmCooperateParams({ opId: Number(id) });
        },
      });
    } else {
      judgeAccountAttrChange()
      // setShowConfirmCooperateModal(true);
      // setConfirmCooperateParams({ opId: Number(id) });
    }
  };

  // 校验是否有账号属性变化
  async function judgeAccountAttrChange() {
    try {
      setToolButtonLoading(true)
      setConfirmCooperateParams({ opId: Number(id) });
      const res = await $checkAccountType({
        opId: Number(id),
      })
      if (res.accountTypeChangeBOS.length) {
        const accountTypeChangeBOS = res.accountTypeChangeBOS.map((item: any) => {
          item.oppoAccount.accountBaseInfoVo.accountName = item.oppoAccount.accountName
          item.oppoAccount.accountBaseInfoVo.accountId = item.oppoAccount.accountId
          item.oppoAccount.accountBaseInfoVo.xingtuIndexUrl = item.oppoAccount.accountBaseInfoVo.xingtuUrl
          return item
        })
        setAccountTypeChangeBOS(accountTypeChangeBOS)
        handleShowAccountAttrChangeModal()
      } else {
        handleShowConfirmCoopDrawer()
      }
      setToolButtonLoading(false)
    } catch (e: any) {
      setToolButtonLoading(false)
      message.error(e?.message)
    }
  }

  // 直接打开确认合作弹窗
  const handleShowConfirmCoopDrawer = () => {
    setShowConfirmCooperateModal(true);
  };

  const handleCloseConfirmCooperateModal = () => {
    setShowConfirmCooperateModal(false);
  };

  // 账号属性发生变化的弹窗
  const handleShowAccountAttrChangeModal = () => {
    setShowAccountAttrChangeModal(true);
  };

  const handleCloseAccountAttrChangeModal = () => {
    setShowAccountAttrChangeModal(false);
  };

  const generateTabsName = (name: string) => {
    let tip = "";

    let toolButton: string | JSX.Element = "";

    switch (name) {
      case "待找号":
        tip = "可通过自行找号或协同找号功能进行找号";
        break;
      case "找号中":
        // 整体状态待找号、找号中时 显示找号中下的操作
        toolButton =
          statusStep === 0 || statusStep === 1 ? (
            <div className={cs("m-t-6", styles.toolButton)}>
              {basicFormChange ? (
                <Popover content="请先保存后再进行操作。">
                  <Button disabled={basicFormChange} type="primary">
                    自行找号
                  </Button>
                </Popover>
              ) : (
                <Button type="primary" onClick={handleFindNo}>
                  自行找号
                </Button>
              )}

              {basicFormChange ? (
                <Popover content="请先保存后再进行操作。">
                  <Button
                    disabled={basicFormChange}
                    className="m-l-6"
                    type="primary"
                  >
                    协同找号
                  </Button>
                </Popover>
              ) : (
                <Button
                  className="m-l-6"
                  type="primary"
                  onClick={handleShowCollaborateModal}
                >
                  协同找号
                </Button>
              )}
            </div>
          ) : (
            ""
          );
        break;
      case "待客户选号":
        tip = "需要线下跟客户确认账号，并在乾数据勾选";
        // 整体状态找号中时 显示待客户选号下的操作， 即整体操作显示后置一个状态节点
        toolButton =
          statusStep === 1 ? (
            <Button
              disabled={basicFormChange}
              type="primary"
              onClick={handleStopFinding}
              loading={toolButtonLoading}
            >
              停止找号，进入客户选号阶段
            </Button>
          ) : (
            ""
          );
        break;
      case "待账号负责人确认":
        tip = "已发送飞书通知给账号的负责人，需要待他们确认档期、价格等信息";
        // 整体状态待客户选号时 显示待账号负责人确认下的操作， 即整体操作显示后置一个状态节点
        toolButton =
          statusStep === 2 ? (
            <Button
              disabled={basicFormChange}
              type="primary"
              loading={toolButtonLoading}
              onClick={handleConfirmChoose}
            >
              确认客户选号
            </Button>
          ) : statusStep === 3 ? (
            // 整体状态待账号负责人确认时 显示待账号负责人确认下的文案
            <div
              style={{
                fontSize: "10px",
                width: "252px",
                position: "relative",
                left: "-46%",
                color: "#1890ff",
              }}
            >
              请通知相关账号负责人在飞书完成账号确认的操作
            </div>
          ) : (
            ""
          );
        break;
      case "待客户确认合作":
        tip = "需要将最终确认合作的账号录入报价单，填入相关的合作信息";
        break;
      case "确认合作":
        // 整体状态待客户确认合作时 显示确认合作下的操作， 即整体操作显示后置一个状态节点
        toolButton =
          statusStep === 4 ? (
            <Button
              disabled={basicFormChange}
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
        setActiveKey("2");
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
      setActiveKey("2");
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
            <Steps current={Number(statusStep)} labelPlacement="vertical">
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
                  <BasicData
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

            {/* 除待找号外显示推荐账号 为0时是待找号  */}
            {Number(statusStep) > 0 && (
              <TabPane tab="推荐的账号" key="2">
                {activeKey === "2" && (
                  <RecommendAccount
                    id={id}
                    type={type}
                    detail={detail}
                    onChangeTab={(key: string) => handleChangeTab(key)}
                    onRefesh={onRefesh}
                    onLoadDetail={getBussinessOpportunityDetail}
                  />
                )}
              </TabPane>
            )}

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

      {/* 协同找号弹窗 */}
      {showAssistFindModal && (
        <CollaborativeNumFindModal
          {...collaborativeFindNumParams}
          onShowDrawer={() => handleChangeTab("1")}
          show={showAssistFindModal}
          // 相当于成功后回调，此处逻辑为成功后重新获取详情
          onGetList={getBussinessOpportunityDetail}
          onCancel={handleCloseCollaborateModal}
          onClose={handleCloseCollaborateModal}
        />
      )}

      {/* 确认合作弹窗 */}
      {showConfirmCooperateModal && (
        <ConfirmCooperateModal
          {...confirmCooperateParams}
          onShowDrawer={() => handleChangeTab("2")}
          show={showConfirmCooperateModal}
          // 相当于成功后回调，此处逻辑为成功后重新获取详情
          onGetList={onRefesh}
          onClose={handleCloseConfirmCooperateModal}
        />
      )}

      {/* 账号属性变化的弹窗 */}
      {showAccountAttrChangeModal && (
        <AccountAttrChangeModal
          {...confirmCooperateParams}
          accountTypeChangeBOS={accountTypeChangeBOS}
          onShowConfirmCoopDrawer={handleShowConfirmCoopDrawer}
          onShowDrawer={() => handleChangeTab("2")}
          show={showAccountAttrChangeModal}
          onClose={handleCloseAccountAttrChangeModal}
        />
      )}
    </Drawer>
  );
};

export default BusinessOpportunityDrawer;

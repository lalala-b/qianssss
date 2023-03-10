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
    // ???????????? ???????????????tab???????????????
    if (e !== "1" && basicFormChange) {
      Modal.confirm({
        title: "????????????",
        content: "??????????????????????????????????????????????????????",
        okText: "??????",
        cancelText: "?????????",
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

    // ???????????? ???????????????tab???????????????
    if (e !== "3" && specialPaymentChange) {
      Modal.confirm({
        title: "????????????",
        content: "????????????????????????????????????????????????????????????",
        okText: "??????",
        cancelText: "?????????",
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

  // ?????????????????????
  const handleShowConfirmCooperateModal = async () => {
    try {
      setToolButtonLoading(true);
      const { details } = await $getSpecialChargeList({ opId: Number(id) });
      setToolButtonLoading(false);

      setConfirmCooperateParams({ opId: Number(id) });

      if (!details.length) {
        message.error("????????????????????????");
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
      message.success("??????????????????");
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
      case "?????????":
        tip = "??????????????????????????????????????????????????????";
        break;
      case "?????????????????????":
        toolButton =
          statusStep === 7 ? (
            <Button
              // disabled={basicFormChange}
              type="primary"
              loading={toolButtonLoading}
              onClick={handleEntryFinish}
            >
              ????????????
            </Button>
          ) : (
            ""
          );
        break;
      case "?????????????????????":
        tip = "?????????????????????????????????????????????????????????????????????????????????";
        toolButton =
          statusStep === 4 ? (
            <Button
              type="primary"
              loading={toolButtonLoading}
              onClick={handleShowConfirmCooperateModal}
            >
              ????????????
            </Button>
          ) : (
            ""
          );
        break;
      case "????????????":
        break;
      default:
        break;
    }

    // ??????????????????????????????????????????????????? ??????div????????????????????????????????????
    if (
      name !== "?????????" &&
      !(name === "????????????????????????" && statusStep === 3)
    ) {
      toolButton = (
        <div className={cs("m-t-6", styles.toolButton)}>
          {basicFormChange ? (
            <Popover content="?????????????????????????????????">{toolButton}</Popover>
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
            name === "?????????????????????" || name === "????????????????????????"
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
      message.error(String(err.message) || "??????????????????????????????");
    }
  };

  const handleCancelSubmit = () => {
    // ????????????????????????????????????
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
        title: "????????????",
        content: "??????????????????????????????????????????????????????",
        okText: "???????????????",
        cancelText: "????????????",
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

    // ????????????
    if (type === "edit" && specialPaymentChange) {
      Modal.confirm({
        title: "????????????",
        content: "????????????????????????????????????????????????????????????",
        okText: "??????",
        cancelText: "?????????",
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

  // ????????????????????????
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
    // ??????????????????????????????????????????????????????????????????
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
            {type === "edit" ? "??????" : type === "add" ? "??????" : "??????"}??????
          </Tag>
          {Object.keys(oppHeadMsg).length ? (
            <span>
              ???????????????{oppHeadMsg.opNo}?????????????????????{oppHeadMsg.charger}???
            </span>
          ) : (
            ""
          )}
          {statusStep === 6 && (
            <Tag color="error" className={styles.titleTag}>
              ????????????
            </Tag>
          )}
        </div>
        <CloseOutlined
          className={styles.closeButton}
          onClick={handleCloseDrawer}
        />
      </div>

      {/* 6??????????????? */}
      {statusStep !== 6 &&
        statusStep !== null &&
        (type === "edit" || type === "detail") && (
          <div className={styles.stepsBox}>
            <span>????????????</span>
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
                {/* opStatus???????????? ???5??????????????? */}
                {detail.opStatus === 5 ? (
                  <Button
                    type="primary"
                    onClick={() => handleViewInvoice(detail.opNo)}
                  >
                    ????????????
                  </Button>
                ) : (
                  ""
                )}
              </>
            }
          >
            <TabPane tab="????????????" key="1">
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

            {/* ?????????????????????????????? */}
            {type !== "add" && (
              <TabPane tab="????????????" key="3">
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
          // ????????????????????????????????????????????????????????????????????? ???????????????????????????
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

/* eslint-disable css-modules/no-unused-class */
/* eslint-disable camelcase */
import { useState, useEffect } from "react";
import { Button, Modal, message, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import IconTip from "src/components/IconTip";
import {
  BussinessOpportunityDetailResType,
  $getTotalRebatePrice,
  $getSpecialChargeList,
  GetSpecialChargeListItemResType,
  $checkChargeCanEditAndAdd,
  $deleteSpecialCharge,
} from "src/api/business";
import SpecialPaymentDialog from "../SpecialPaymentDialog";
import SpecialSetRebateDialog from "../SpecialSetRebateDialog";

interface SpecialPaymentsPropsType {
  id?: number | string;
  type: DrawerType;
  detail: BussinessOpportunityDetailResType;
  needSubmit: boolean;
  onChangeTab: (key: string) => void;
  onSpecialChange: (flag: boolean) => void;
  onGetDetail: () => void;
  onCancelSubmit?: () => void;
  onAfterSubmit?: () => void;
}

interface SpecialPayments {
  id?: number;
  paymenttype: string;
  money: number | string;
  key: number;
  typeChange: boolean;
  moneyChange: boolean;
  isDeleted?: number;
}

const SpecialPayments: React.FC<SpecialPaymentsPropsType> = ({
  id,
  detail: opDetail,
  onGetDetail,
}) => {
  const { isCharger, opStatus } = opDetail;

  const [specialType, setSpecialType] = useState("add");
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [chargeId, setChargeId] = useState(0);

  const [showRebateModal, setShowRebateModal] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [tableList, setTableList] = useState<GetSpecialChargeListItemResType[]>(
    []
  );
  const [isFinance, setIsFinance] = useState(false);
  const [totalRebate, setTotalRebate] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCheckSpecialDetail = (specialId: number) => {
    setChargeId(specialId);
    setSpecialType("view");
    setShowSpecialModal(true);
  };

  const handleEditSpecialDetail = async (
    specialId: number,
    isFinance: number
  ) => {
    try {
      setLoading(true);
      await $checkChargeCanEditAndAdd({ opId: Number(id), editType: 2 });
      setLoading(false);
      setIsFinance(!!isFinance);
      setChargeId(specialId);
      setSpecialType("edit");
      setShowSpecialModal(true);
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const handleDeleteSpecial = async (specialId: number) => {
    try {
      setLoading(true);
      await $checkChargeCanEditAndAdd({ opId: Number(id), editType: 3 });

      // ???????????????????????????????????????
      Modal.confirm({
        title: "??????",
        content:
          tableList.length === 1 && +opStatus === 5
            ? "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
            : "?????????????????????????????????????????????????????????",
        okText: "??????",
        cancelText: "??????",
        onOk: async () => {
          // 5??????????????????????????????????????? ????????????????????????????????????
          if (+opStatus === 5) {
            const res = await $getTotalRebatePrice({
              opId: Number(id),
              rebatePrivate: 0,
              rebateCorporate: 0,
              curId: specialId,
            });

            // ??????0???????????????, ????????????
            if (+res === 0) {
              try {
                await $deleteSpecialCharge({
                  id: specialId,
                });
                message.success(`????????????`);
                setLoading(false);
                setSpecialType("");
                getSpecialChargeList();
                onGetDetail();
              } catch (e: any) {
                setLoading(false);
                message.error(e.message);
              }
              return;
            }

            setTotalRebate(res);
            setShowRebateModal(true);
            setSpecialType("delete");
            setDeleteId(specialId);
            setLoading(false);
            return;
          }

          try {
            await $deleteSpecialCharge({
              id: specialId,
            });
            message.success(`????????????`);
            setLoading(false);
            setSpecialType("");
            getSpecialChargeList();
          } catch (e: any) {
            setLoading(false);
            message.error(e.message);
          }
        },
        onCancel: () => {
          setLoading(false);
        },
      });
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const COLUMNS = [
    {
      title: "????????????",
      dataIndex: "chargeTypeDesc",
      width: 100,
      key: "chargeTypeDesc",
    },
    {
      title: "????????????",
      dataIndex: "finishStatusDesc",
      width: 100,
      key: "finishStatusDesc",
    },
    {
      title: "????????????",
      dataIndex: "relateGroup3thName",
      width: 120,
      key: "relateGroup3thName",
    },
    {
      title: "????????????",
      dataIndex: "saleIncome",
      width: 120,
      key: "saleIncome",
      render: (saleIncome: number) => `??${saleIncome || 0}`,
    },
    {
      title: "??????????????????",
      dataIndex: "darenOutMoney",
      width: 140,
      key: "darenOutMoney",
      render: (darenOutMoney: number) => `??${darenOutMoney || 0}`,
    },
    {
      title: "????????????",
      dataIndex: "otherCost",
      width: 120,
      key: "otherCost",
      render: (otherCost: number) => `??${otherCost || 0}`,
    },
    {
      title: "????????????",
      dataIndex: "rebateCorporate",
      width: 120,
      key: "rebateCorporate",
      render: (rebateCorporate: number) => `??${rebateCorporate || 0}`,
    },
    {
      title: "????????????",
      dataIndex: "rebatePrivate",
      width: 120,
      key: "rebatePrivate",
      render: (rebatePrivate: number) => `??${rebatePrivate || 0}`,
    },
    {
      title: (
        <>
          <span>??????????????????</span>
          <IconTip content="??????????????????=????????????-????????????-????????????" />
        </>
      ),
      dataIndex: "businessRevenue",
      width: 180,
      key: "businessRevenue",
      render: (businessRevenue: number) => `??${businessRevenue || 0}`,
    },
    {
      title: "??????",
      dataIndex: "id",
      width: 160,
      fixed: "right",
      key: "id",
      render: (_: number, record: GetSpecialChargeListItemResType) => (
        <>
          {!!record.canEdit && (
            <Button
              type="link"
              onClick={() => handleEditSpecialDetail(_, record.isFinance)}
            >
              ??????
            </Button>
          )}
          <Button type="link" onClick={() => handleCheckSpecialDetail(_)}>
            ??????
          </Button>
          {!!record.canDelete && (
            <Button type="link" danger onClick={() => handleDeleteSpecial(_)}>
              ??????
            </Button>
          )}
        </>
      ),
    },
  ];

  const handleAddSpecial = async () => {
    try {
      await $checkChargeCanEditAndAdd({ opId: Number(id), editType: 1 });
      setShowSpecialModal(true);
      setSpecialType("add");
      setIsFinance(false);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const getSpecialChargeList = async () => {
    try {
      setLoading(true);
      const { details } = await $getSpecialChargeList({ opId: Number(id) });
      setLoading(false);
      setTableList(details || []);
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  useEffect(() => {
    getSpecialChargeList();
  }, []);

  return (
    <Spin spinning={loading}>
      {/* ?????????????????????????????????????????? */}
      {!!isCharger && opStatus !== 6 && (
        <div className="m-b-6">
          <Button type="primary" onClick={handleAddSpecial}>
            ??????
          </Button>
        </div>
      )}

      <Table
        dataSource={tableList}
        columns={COLUMNS as ColumnsType<GetSpecialChargeListItemResType>}
        rowKey="id"
        scroll={{ x: "max-content" }}
        bordered
        sticky={{
          offsetHeader: 80,
        }}
        className="m-t-24"
        summary={() =>
          !!tableList.length && (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <p style={{ textAlign: "center", fontWeight: "500" }}>??????</p>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <p style={{ textAlign: "center", fontWeight: "500" }}>
                    {`??${
                      tableList.reduce((total, current) => {
                        let newTotal = 0;
                        newTotal = total + +current.saleIncome;
                        return newTotal;
                      }, 0) || 0
                    }`}
                  </p>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <p style={{ textAlign: "center", fontWeight: "500" }}>
                    {`??${
                      tableList.reduce((total, current) => {
                        let newTotal = 0;
                        newTotal = total + +current.darenOutMoney;
                        return newTotal;
                      }, 0) || 0
                    }`}
                  </p>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <p style={{ textAlign: "center", fontWeight: "500" }}>
                    {`??${
                      tableList.reduce((total, current) => {
                        let newTotal = 0;
                        newTotal = total + +current.otherCost;
                        return newTotal;
                      }, 0) || 0
                    }`}
                  </p>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <p style={{ textAlign: "center", fontWeight: "500" }}>
                    {`??${
                      tableList.reduce((total, current) => {
                        let newTotal = 0;
                        newTotal = total + +current.rebateCorporate;
                        return newTotal;
                      }, 0) || 0
                    }`}
                  </p>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <p style={{ textAlign: "center", fontWeight: "500" }}>
                    {`??${
                      tableList.reduce((total, current) => {
                        let newTotal = 0;
                        newTotal = total + +current.rebatePrivate;
                        return newTotal;
                      }, 0) || 0
                    }`}
                  </p>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}>
                  <p style={{ textAlign: "center", fontWeight: "500" }}>
                    {`??${
                      tableList.reduce((total, current) => {
                        let newTotal = 0;
                        newTotal = total + +current.businessRevenue;
                        return newTotal;
                      }, 0) || 0
                    }`}
                  </p>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )
        }
      />

      <SpecialPaymentDialog
        specialType={specialType}
        show={showSpecialModal}
        chargeId={chargeId}
        opId={id}
        opDetail={opDetail}
        isFinance={isFinance}
        onClose={() => setShowSpecialModal(false)}
        onChangeSpecialType={(val: string) => setSpecialType(val)}
        onGetList={() => {
          getSpecialChargeList();
          onGetDetail();
        }}
      />

      <SpecialSetRebateDialog
        specialType={specialType}
        show={showRebateModal}
        deleteId={deleteId}
        totalRebate={totalRebate}
        onClose={() => setShowRebateModal(false)}
        onChangeSpecialType={(val: string) => setSpecialType(val)}
        onGetList={() => {
          getSpecialChargeList();
          onGetDetail();
        }}
      />
    </Spin>
  );
};

export default SpecialPayments;

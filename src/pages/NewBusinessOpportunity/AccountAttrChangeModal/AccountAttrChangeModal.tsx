/* eslint-disable no-param-reassign */
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
// import { useNavigate } from "react-router";
import { ConfigProvider, Modal, Table } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { AccountAttrResType } from "src/api/business";
import AccountCard from "src/components/AccountCard";
import styles from "./AccountAttrChangeModal.scss";

declare interface ConfirmCooperateParamsType {
  opId: number;
  opType?: number;
  specialChargeTotal?: string;
}

interface AccountAttrChangePropType {
  opId: number;
  opType?: number;
  show: boolean;
  specialChargeTotal?: string;
  accountTypeChangeBOS?: any[];
  onShowConfirmCoopDrawer: (params: ConfirmCooperateParamsType) => void;
  onShowDrawer: (
    val: DrawerType,
    id: string | number,
    isActiveKeyForCommand: boolean
  ) => void;
  onClose: () => void;
}

const AccountAttrChangeModal: React.FC<AccountAttrChangePropType> = ({
  show,
  opId,
  opType,
  specialChargeTotal,
  accountTypeChangeBOS = [],
  onShowConfirmCoopDrawer,
  onShowDrawer,
  onClose,
}) => {
  // 账号属性变化的表格数据
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [accountAttrData, setAccountAttrData] = useState<any[]>(
    []
  );

  // 账号属性发生变化的列
  const accountAttrColumns: ColumnsType<AccountAttrResType> = [
    {
      title: "账号名称",
      dataIndex: "oppoAccount",
      key: "oppoAccount",
      width: "120px",
      render: (_: string, record: any) => (
        <AccountCard info={record.oppoAccount.accountBaseInfoVo} defaultWH={32} />
      ),
    },
    {
      title: "最初账号归属",
      dataIndex: "beforeAccountType",
      key: "beforeAccountType",
      width: "120px",
      render: (beforeAccountType: string) =>
      beforeAccountType ? (
          <span className={styles.redFront}>{beforeAccountType}</span>
        ) : (
          "--"
        ),
    },
    {
      title: "最新账号归属",
      dataIndex: "nowAccountType",
      key: "nowAccountType",
      width: "120px",
      render: (nowAccountType: string) =>
        nowAccountType ? (
          <span className={styles.greenFront}>{nowAccountType}</span>
        ) : (
          "--"
        ),
    },
  ];

  // 继续合作
  const handleToConfirmCooperate = () => {
    onClose();
    onShowConfirmCoopDrawer({
      opId,
      opType,
      specialChargeTotal,
    });
  };

  // 返回报价单检查
  const handleToCheck = () => {
    onClose();
    onShowDrawer("edit", opId, true);
  };

  useEffect(() => {
    setAccountAttrData(accountTypeChangeBOS)
  }, [accountTypeChangeBOS])

  return (
    <ConfigProvider locale={zhCN}>
      {/* 账号属性变化提示 */}
      <Modal
        width="50%"
        title="账号属性变化提示"
        visible={show}
        closable={false}
        maskClosable={false}
        okText="返回检查"
        cancelText="继续合作"
        onOk={handleToCheck}
        onCancel={handleToConfirmCooperate}
      >
        <p className={styles.accountAttrTip}>
          系统检测到以下账号的账号归属已发生变化，若需要按照账号最新的归属进行合作，请返回报价单点击”移出报价单“，然后在商机列表中点击“继续找号”重新把账号添加到报价单上
        </p>
        <div className={styles.accountTableWrap}>
          <Table
            rowKey={(row: any) => row.oppoAccount.accountId}
            bordered
            scroll={{ x: "max-content" }}
            sticky={{
              offsetHeader: 0,
            }}
            columns={accountAttrColumns}
            dataSource={accountAttrData}
            pagination={false}
          />
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default AccountAttrChangeModal;

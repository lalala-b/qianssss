/* eslint-disable no-unused-expressions */
/* eslint-disable import/order */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Row,
  Col,
  Modal,
  DatePicker,
  Input,
  Table,
  Button,
  Select,
  message,
} from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import type { ColumnsType } from "antd/lib/table";
import {
  $getAccountList,
  $getPlatList,
  $submitRecommend,
} from "src/api/taskManagement";
import type {
  AccountListType,
  TaskentryType,
  PlatListType,
  memuListType,
  ReTableListType,
  BatchEntryType,
  ReAccountsPropsType,
} from "../TaskManagementType";
import styles from "../TaskManagementCom.scss";
import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";

moment.locale("zh-cn");
const PickerDate: any = DatePicker;

const ReAccounts: React.FC<ReAccountsPropsType> = ({ pid, getList }) => {
  const [btnLoading, setBtnLoading] = useState(false);
  // 批量录入菜单
  const [dropdownItem, setDropdownItem] = useState("1");
  // 粘贴账号弹窗显示
  const [isVisablePaste, setIsVisablePaste] = useState(false);
  // 推荐账号列表
  const [reTableList, setReTableList] = useState<ReTableListType[]>([]);
  // 筛选条件
  const defaultTaskData = {
    platId: "",
    accountName: [],
    coDate: "",
    reason: "",
  };
  const [taskentryData, setTaskEntryData] =
    useState<TaskentryType>(defaultTaskData);
  // 账号列表
  const [accountList, setAccountList] = useState<AccountListType[]>();
  // 平台列表
  const [platList, setPlatList] = useState<PlatListType[]>();
  // 粘贴账号弹窗数据
  const [batchEntry, setBatchEntry] = useState<BatchEntryType>({
    platId: "",
    accountNames: [],
  });
  // 档期时间格式化
  const handleDisabledDate = (current: any) =>
    current && current < moment().endOf("day");
  /**
   * 快速录入/批量录入
   */
  const handleDrowItem = (val: string) => {
    setDropdownItem(val);
    setTaskEntryData({ ...taskentryData, platId: "", accountName: [] });
  };
  // 选择平台
  const handlePlats = (val: string) => {
    setAccountList([]);
    setTaskEntryData({ ...taskentryData, platId: val, accountName: [] });
    getAccountList(val);
  };
  // 选择账号
  const handleAccounts = (val: any) => {
    setTaskEntryData({ ...taskentryData, accountName: val });
  };
  const handleConfirm = () => {
    let flag = true
    try {
      reTableList.forEach(item => {
        const innerName =
          taskentryData.accountName.find(
            (inner: string | null | undefined) =>
              item.platId === taskentryData.platId && item.accountName === inner
          ) || "";
        if (innerName) {
          flag=false
          message.error(`不能重复推荐账号“${innerName}”`);
          throw new Error("不能重复推荐账号");
        }
        flag=true
      });
    } catch (error) {
      console.info();
    }
    if (!flag) return false
    taskentryData.accountName.forEach(item => {
      reTableList.push({ platId: taskentryData.platId, accountName: item });
      reTableList.forEach(item => {
        item.platName = formatPlatName(+item.platId);
      });
    });
    taskentryData.accountName=[]
    setTaskEntryData(taskentryData)
    setReTableList([...reTableList]);
  };
  /**
   * 账号粘贴、确认
   */
  const handlePasteAccount = () => {
    setIsVisablePaste(true);
  };
  const formatTextArea = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const str = e.target.value.split(";");
    if (str.length) {
      batchEntry.accountNames = str[0].split("\n");
      batchEntry.platId = taskentryData.platId;
      setBatchEntry({ ...batchEntry });
    }
  };
  const handleBlur = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const str = e.target.value.split(";");
    if (str.length) {
      batchEntry.accountNames = str[0].split("\n");
      batchEntry.platId = taskentryData?.platId;
      setBatchEntry({ ...batchEntry });
    }
  };
  // 粘贴账号
  const handlePasteOk = () => {
    const list = JSON.parse(JSON.stringify(taskentryData));
    if (!validateFlag()) {
      message.error("不能重复推荐账号");
      return;
    }
    batchEntry.accountNames?.forEach((itemId: string) => {
      list.accountName = itemId;
      list.platId = batchEntry.platId;
      list.platName = formatPlatName(+batchEntry.platId);
      reTableList.push({ ...list });
      setReTableList([...reTableList]);
    });
    setIsVisablePaste(false);
  };
  const validateFlag = () => {
    let flag = true;
    (reTableList || []).forEach((item: ReTableListType) => {
      console.info(item, batchEntry);
      const accountNames = batchEntry.accountNames || [];
      if (
        +item.platId === +batchEntry.platId &&
        accountNames.includes(String(item.accountName))
      ) {
        flag = false;
        return false;
      }
    });
    return flag;
  };
  // 推荐账号删除
  const handleDelete = (row: any, index: any) => {
    reTableList.splice(index, 1);
    setReTableList([...reTableList]);
    console.info(reTableList);
  };
  // const formatAccountList = (row:ReTableListType) => {
  //   const item = accountList.find(
  //     (item: accountListType) => item.accountId === row.accountId
  //   ) || { accountName: "" };
  //   return item.accountName;
  // };

  // 平台查询
  const getPlatList = () => {
    $getPlatList()
      .then(res => {
        setPlatList([...res]);
      })
      .catch(e => {
        message.error(e.message);
      });
  };
  // 账号查询
  const getAccountList = (val: number | string) => {
    $getAccountList({ platId: val }).then(res => {
      setAccountList([...res]);
    });
  };
  // 平台格式化
  const formatPlatName = (platId: number) => {
    const item = (platList || []).find(
      (item: PlatListType) => item.platId === +platId
    ) || { platName: "" };
    return `${item.platName}` || "";
  };
  // 档期修改
  const handleDatePicker = (_: any, dateString: any, index: number) => {
    reTableList[index].coDate = dateString;
    setReTableList([...reTableList]);
  };
  // 推荐原因修改
  const handleChangeReason = (index: number, e: any) => {
    const reason = e.target.value || "";
    reTableList[index].reason = reason;
    setReTableList([...reTableList]);
  };
  const handleReasonBlur = (index: number, e: any) => {
    const reason = e.target.value || "";
    reTableList[index].reason = reason;
    setReTableList([...reTableList]);
  };
  // 推荐账号提交
  const submitReTableList = () => {
    const params = {
      pid,
      accountList: reTableList,
    };
    setBtnLoading(true);
    $submitRecommend(params)
      .then(() => {
        setBtnLoading(false);
        message.success("推荐成功");
        setReTableList([]);
        setTaskEntryData(defaultTaskData);
        getList();
      })
      .catch((e: any) => {
        setBtnLoading(false);
        message.error(e.message);
      });
  };

  const memuList = [
    {
      label: "快速录入",
      key: "1",
    },
    {
      key: "2",
      label: "批量录入",
    },
  ];

  const columns = [
    {
      title: "平台",
      dataIndex: "platName",
      key: "platName",
      width: 100,
    },
    {
      title: "账号名称",
      dataIndex: "accountName",
      key: "accountName",
      width: 160,
    },
    {
      title: "档期",
      dataIndex: "coDate",
      key: "coDate",
      width: 200,
      render: (text: any, row: ReTableListType, index: number) => (
        <>
          <PickerDate
            value={text ? moment(text) : ""}
            disabledDate={handleDisabledDate}
            onChange={(text: any, datestr: string) => {
              handleDatePicker(text, datestr, index);
            }}
            showToday={false}
            locale={locale}
            format="YYYY-MM-DD"
            placeholder="输入档期"
          />
        </>
      ),
    },
    {
      title: "推荐原因",
      dataIndex: "reason",
      key: "reason",
      render: (text: string, row: ReTableListType, index: number) => (
        <>
          <Input
            value={text}
            maxLength={20}
            placeholder="请填写推荐原因"
            onChange={(e: any) => handleChangeReason(index, e)}
            onBlur={(e: any) => {
              handleReasonBlur(index, e);
            }}
          />
        </>
      ),
    },
    {
      title: "操作",
      dataIndex: "caozuo",
      key: "caozuo",
      width: 100,
      render: (text: any, row: ReTableListType, index: any) => (
        <Button type="link" onClick={() => handleDelete(row, index)}>
          删除
        </Button>
      ),
    },
  ];
  useEffect(() => {
    getPlatList();
  }, []);
  return (
    <>
      <div>
        <Row className={dropdownItem === "2" ? styles.mb12 : ""}>
          <Col span={23}>
            <Select
              className={styles.dropdownItem}
              onChange={handleDrowItem}
              value={dropdownItem}
            >
              {memuList &&
                memuList.map((item: memuListType) => (
                  <Select.Option key={item.key} value={item?.key}>
                    {item?.label}
                  </Select.Option>
                ))}
            </Select>
            <Select
              allowClear
              showSearch
              filterOption
              onChange={handlePlats}
              optionFilterProp="children"
              placeholder="选择平台"
              value={taskentryData?.platId}
            >
              {platList &&
                platList.map((item: PlatListType) => (
                  <Select.Option key={item.platId} value={item.platId}>
                    {item.platName}
                  </Select.Option>
                ))}
            </Select>
            {dropdownItem === "1" ? (
              <>
                <Select
                  allowClear
                  showSearch
                  filterOption
                  mode="multiple"
                  onChange={handleAccounts}
                  optionFilterProp="children"
                  placeholder="选择账号"
                  value={taskentryData?.accountName}
                >
                  {accountList &&
                    accountList.map((item: AccountListType) => (
                      <Select.Option
                        key={item.accountId}
                        value={item?.accountName}
                      >
                        {item?.accountName}
                      </Select.Option>
                    ))}
                </Select>
                <Button
                  type="primary"
                  onClick={handleConfirm}
                  disabled={
                    !(taskentryData?.platId && taskentryData.accountName)
                  }
                >
                  确认
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                disabled={!taskentryData?.platId}
                onClick={handlePasteAccount}
              >
                粘贴账号
              </Button>
            )}
          </Col>
          <Col span={1} className={styles.flexRight}>
            <Button
              type="primary"
              disabled={!(reTableList && reTableList.length)}
              onClick={submitReTableList}
              loading={btnLoading}
            >
              提交
            </Button>
          </Col>
        </Row>
      </div>
      {dropdownItem === "1" ? (
        <p className={styles.greyText}>
          建议：账号数量大于5个，使用批量录入功能
        </p>
      ) : (
        ""
      )}
      {isVisablePaste && (
        <Modal
          title="批量录入账号"
          visible={isVisablePaste}
          onCancel={() => setIsVisablePaste(false)}
          onOk={handlePasteOk}
        >
          <div>平台:{formatPlatName(+taskentryData.platId)}</div>
          <div className={styles.mb12}>请输入账号名称，一行一个，最多20个</div>
          <Input.TextArea
            rows={6}
            placeholder=""
            onChange={formatTextArea}
            onBlur={handleBlur}
          />
        </Modal>
      )}
      <Table
        rowKey={record => `${record.accountName}${record.platId}`}
        columns={columns as ColumnsType<any>}
        dataSource={reTableList}
        pagination={false}
      />
    </>
  );
};

export default ReAccounts;

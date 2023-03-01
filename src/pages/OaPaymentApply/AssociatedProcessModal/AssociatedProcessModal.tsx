import { useContext, useState, useEffect } from "react";
import { Modal, Select, Input, Button, Spin, Table, message } from "antd";
import { GlobalContext } from "src/contexts/global";
import BSelect from "src/components/BigDataSelect";
import {
  GetCostcenterInfoResItemType,
  GetContractProcessListItemType,
  $getContractProcessList,
} from "src/api/oaPaymentApply";
import styles from "./AssociatedProcessModal.scss";

const { Option } = Select;

interface AssociatedProcessModalPropsType {
  show: boolean;
  dataList: GetCostcenterInfoResItemType[];
  select: GetContractProcessListItemType[];
  onClose: () => void;
  onSubmit: (selectRow: GetContractProcessListItemType[]) => void;
}

const AssociatedProcessModal: React.FC<AssociatedProcessModalPropsType> = ({
  show,
  dataList,
  select,
  onClose,
  onSubmit,
}) => {
  const { globalData = {} } = useContext(GlobalContext);

  const [searchData, setSearchData] = useState({
    current: 1,
    rowCount: 10,
  });
  const [userId, setUserId] = useState(0);
  const [businessKey, setBusinessKey] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [list, setList] = useState<GetContractProcessListItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [selectRowKey, setSelectRowKey] = useState<(string | number)[]>([]);
  const [selectRow, setSelectRow] = useState<GetContractProcessListItemType[]>(
    []
  );

  const handleChangeBusinessKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessKey(e.target.value);
  };

  const getList = async (params: any) => {
    try {
      setTableLoading(true);

      const reqParams = {
        ...searchData,
        businessKey,
        userId: userId ? String(userId) : "",
        type: 0,
        _: String(new Date().getTime()),
        ...params,
      };

      const res = await $getContractProcessList({
        ...reqParams,
        current: (reqParams.current - 1) * reqParams.rowCount,
      });

      const info: { total: number; rows: GetContractProcessListItemType[] } =
        JSON.parse(res);

      const { total, rows } = info;

      setTotal(total || 0);
      setList(rows || []);
      setTableLoading(false);
    } catch (e: any) {
      message.error(e.message);
      setTotal(0);
      setList([]);
      setTableLoading(false);
    }
  };

  const handleSearch = () => {
    const newSearchData = { ...searchData };
    newSearchData.current = 1;
    setSearchData(newSearchData);
    getList({ ...newSearchData });
  };

  const handleChangePage = (pageNum: number, size: number) => {
    const newSearchData = { ...searchData };
    newSearchData.current = pageNum;
    newSearchData.rowCount = size;
    setSearchData(newSearchData);
    getList({ ...newSearchData });
  };

  const handleChangeSelectRow = (
    rowKey: (string | number)[],
    row: GetContractProcessListItemType[]
  ) => {
    if (rowKey.length > 5) {
      setSelectRowKey(rowKey.slice(0, 5));
      setSelectRow(row.slice(0, 5));
      message.warning("广告合同流程最多选择5个");
      return;
    }

    setSelectRowKey(rowKey);
    setSelectRow(row);
  };

  const COLUMNS = [
    {
      title: "流程编号",
      dataIndex: "businessKey",
      width: 140,
      key: "businessKey",
      render: (_: string) => _ || "--",
    },
    {
      title: "申请人",
      dataIndex: "userName",
      width: 100,
      key: "userName",
      render: (_: string) => _ || "--",
    },
    {
      title: "申请部门",
      dataIndex: "deptName",
      width: 160,
      key: "deptName",
      render: (_: string) => _ || "--",
    },
    {
      title: "申请事由",
      dataIndex: "reason",
      width: 160,
      key: "reason",
      render: (_: string) => _ || "--",
    },
    {
      title: "预算总金额",
      dataIndex: "totalMoney",
      width: 120,
      key: "totalMoney",
      render: (_: string) => _ || "--",
    },
  ];

  const handleSubmit = () => {
    onSubmit(selectRow);
  };

  useEffect(() => {
    if (show) {
      setUserId(globalData?.user?.userInfo.userid);
      getList({ userId: globalData?.user?.userInfo.userid });

      if (Object.keys(select).length) {
        setSelectRowKey(select.map(item => item.instanceId));
        setSelectRow(select);
      } else {
        setSelectRowKey([]);
        setSelectRow([]);
      }
    }
  }, [show]);

  return (
    <Modal
      title="关联广告合同流程"
      maskClosable={false}
      visible={show}
      width="80%"
      onCancel={onClose}
      footer={
        <>
          <Button type="default" onClick={onClose}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            确定
          </Button>
        </>
      }
    >
      <div className="qp-flex m-b-24">
        <div className="m-r-24">
          <span>流程类型：</span>
          <Select value="广告费支出类合同审批单">
            <Option>广告费支出类合同审批单</Option>
          </Select>
        </div>
        <div className="qp-flex m-r-24">
          <span className={styles.title}>流程编号：</span>
          <Input
            value={businessKey}
            placeholder="请输入流程编号"
            onChange={handleChangeBusinessKey}
          />
        </div>
        <div className="qp-flex m-r-24">
          <span className={styles.title}>申请人：</span>
          <BSelect
            className={styles.select}
            placeholder="请选择申请人"
            fieldNames={{
              label: "label",
              value: "userId",
            }}
            // allowClear={tr8u}
            value={userId}
            dataList={dataList}
            scrollPageSize={50}
            optionLabelProp="userName"
            onChange={(value: number) => {
              setUserId(value);
            }}
          />
        </div>
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
      </div>
      <Spin spinning={tableLoading}>
        <Table
          className={styles.table}
          rowSelection={{
            type: "checkbox",
            fixed: "left",
            selectedRowKeys: selectRowKey,
            onChange: handleChangeSelectRow,
            // ...rowSelection,
          }}
          dataSource={list}
          columns={COLUMNS}
          rowKey="instanceId"
          scroll={{ x: "max-content" }}
          sticky
          pagination={{
            pageSize: searchData.rowCount,
            current: searchData.current,
            total,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total: number) => `总共${total}条`,
            // onShowSizeChange: (cur, size) => handlePageSizeChange(size),
            onChange: (pageNum, size) => handleChangePage(pageNum, size),
          }}
        />
      </Spin>
    </Modal>
  );
};

export default AssociatedProcessModal;

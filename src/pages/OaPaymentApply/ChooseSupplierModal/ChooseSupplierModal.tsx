import { useState, useEffect } from "react";
import cs from "classnames";
import { Modal, Button, Radio, Input, message, Table, Spin } from "antd";
import type { RadioChangeEvent } from "antd";
import { CheckOutlined, SearchOutlined } from "@ant-design/icons";
import {
  $getSupplierList,
  GetSupplierListItemType,
} from "src/api/oaPaymentApply";
import styles from "./ChooseSupplierModal.scss";

interface ChooseSupplierModalPropsType {
  show: boolean;
  select: GetSupplierListItemType;
  onClose: () => void;
  onSubmit: (selectRow: GetSupplierListItemType) => void;
}

const ChooseSupplierModal: React.FC<ChooseSupplierModalPropsType> = ({
  show,
  select,
  onClose,
  onSubmit,
}) => {
  const [radio, setRadio] = useState<"supplier_name" | "contact_name">(
    "supplier_name"
  );
  const [searchValue, setSearchValue] = useState("");
  const [searchData, setSearchData] = useState({
    current: 1,
    rowCount: 10,
  });
  const [tableLoading, setTableLoading] = useState(false);
  const [list, setList] = useState<GetSupplierListItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [selectRowKey, setSelectRowKey] = useState<(string | number)[]>([]);
  const [selectRow, setSelectRow] = useState<GetSupplierListItemType[]>([]);

  const handleChangeRadio = (e: RadioChangeEvent) => {
    setRadio(e.target.value);
  };

  const handleChangeSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const getSupplierList = async (params?: any) => {
    try {
      setTableLoading(true);
      const reqParams = {
        ...searchData,
        searchType: radio,
        searchItem: searchValue,
        _: new Date().getTime(),
        ...(params || {}),
      };

      const res = await $getSupplierList({
        ...reqParams,
        current: (reqParams.current - 1) * reqParams.rowCount,
      });

      const info: {
        respCode: number;
        respMsg: string;
        respData: { total: number; rows: GetSupplierListItemType[] };
      } = JSON.parse(res);

      if (+info.respCode !== 0) return

      const { total, rows } = info.respData;

      setTotal(total || 0);
      setList(rows || []);
      setTableLoading(false);

      if (Object.keys(select).length) {
        setSelectRowKey([select?.supplierId]);
        setSelectRow([select]);
      } else {
        setSelectRowKey([]);
        setSelectRow([]);
      }
    } catch (e: any) {
      message.error(e.message);
      setTotal(0);
      setList([]);
      setTableLoading(false);
    }
  };

  const COLUMNS = [
    {
      title: "供应商名称",
      dataIndex: "supplierName",
      width: 100,
      key: "supplierName",
      render: (_: string) => _ || "--",
    },
    {
      title: "地址",
      dataIndex: "address",
      width: 300,
      key: "address",
      render: (_: string) => _ || "--",
    },
    {
      title: "银行",
      dataIndex: "bank",
      width: 120,
      key: "bank",
      render: (_: string) => _ || "--",
    },
    {
      title: "电话",
      dataIndex: "contactMobile",
      width: 120,
      key: "contactMobile",
      render: (_: string) => _ || "--",
    },
    {
      title: "联系人",
      dataIndex: "contactPerson",
      width: 120,
      key: "contactPerson",
      render: (_: string) => _ || "--",
    },
  ];

  const handleSearch = () => {
    const newSearchData = { ...searchData };
    newSearchData.current = 1;
    setSearchData(newSearchData);
    getSupplierList({ ...newSearchData });
  };

  const handleChangePage = (pageNum: number, size: number) => {
    const newSearchData = { ...searchData };
    newSearchData.current = pageNum;
    newSearchData.rowCount = size;
    setSearchData(newSearchData);
    getSupplierList({ ...newSearchData });
  };

  const handleChangeSelectRow = (
    rowKey: (string | number)[],
    row: GetSupplierListItemType[]
  ) => {
    setSelectRowKey(rowKey);
    setSelectRow(row);
  };

  const handleSubmit = () => {
    if (!selectRow.length) {
      message.error("请先选择供应商");
      return;
    }

    const { supplierName, bank, branchBank, bankAccount, province, city } =
      selectRow[0];

    if (
      !supplierName ||
      !bank ||
      !bankAccount ||
      !branchBank ||
      !province ||
      !city
    ) {
      message.warning(
        "该供应商信息不完整，无法添加，请移步企业微信的OA申请页面进行添加，并完善该供应商的信息"
      );
      return;
    }

    onSubmit(selectRow[0]);
  };

  useEffect(() => {
    if (show) {
      getSupplierList();
    }
  }, [show]);

  return (
    <Modal
      title="选择供应商"
      maskClosable={false}
      visible={show}
      width="80%"
      footer={null}
      onCancel={onClose}
    >
      <div className={cs("qp-flex", "m-b-24", styles.header)}>
        <Button
          type="primary"
          danger
          icon={<CheckOutlined />}
          onClick={handleSubmit}
        >
          提交
        </Button>
        <div>
          <div>
            <span>供应商类型：</span>
            <Radio.Group value={radio} onChange={handleChangeRadio}>
              <Radio value="supplier_name">供应商名称</Radio>
              <Radio value="contact_name">联系人</Radio>
            </Radio.Group>
          </div>
          <div className="qp-flex m-t-6">
            <Input
              placeholder={`请输入${
                radio === "contact_name" ? "联系人" : "供应商"
              }名称`}
              allowClear
              value={searchValue}
              onChange={handleChangeSearchValue}
            />
            <Button
              className="m-l-6"
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
          </div>
        </div>
      </div>
      <Spin spinning={tableLoading}>
        <Table
          className={styles.table}
          rowSelection={{
            type: "radio",
            fixed: "left",
            selectedRowKeys: selectRowKey,
            onChange: handleChangeSelectRow,
            // ...rowSelection,
          }}
          dataSource={list}
          columns={COLUMNS}
          rowKey="supplierId"
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

export default ChooseSupplierModal;

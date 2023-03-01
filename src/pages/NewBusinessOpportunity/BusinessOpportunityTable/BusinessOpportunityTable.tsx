// import { useState } from "react";
import { Table, Card } from "antd";

// 分页类型
declare interface PageType {
  total: number;
  pageNum: number;
  pageSize: number;
  // pageSizeOptions: string[];
}

// 按钮数据类型
declare interface DetailBtnDataType {
  label: string;
  type: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
  handleMethod: () => void;
}

// 表格props的类型
declare interface TablePropsType {
  page: PageType;
  searchData: any;
  tableData: any[];
  columnsData: any[];
  detailBtnData: DetailBtnDataType[];
  setPage: (params: PageType) => void;
  setSearchData: (params: any) => void;
  getList: () => void;
}

const BusinessOpportunityTable: React.FC<TablePropsType> = ({
  page,
  searchData,
  tableData,
  columnsData,
  setPage,
  setSearchData,
  getList,
}) => {

  // const handlePageSizeChange = (size: number) => {
  //   setPage(Object.assign(page, { size }));
  //   setSearchData(Object.assign(searchData, { size }));
  // };

  const handlePageChange = (pageNum: number, size: number) => {
    const obj = {
      pageNum,
      size,
    };
    setPage(Object.assign(page, obj));
    setSearchData(Object.assign(searchData, obj));
    getList();
  };

  return (
    <Card size="small" bordered={false}>
      <Table
        dataSource={tableData}
        columns={columnsData}
        rowKey={record => record.opNo}
        scroll={{ x: "max-content" }}
        sticky={{
          offsetHeader: -24,
        }}
        pagination={{
          ...page,
          current: page.pageNum,
          defaultCurrent: 1,
          showQuickJumper: true,
          showSizeChanger: false,
          showTotal: total => `总共${total}条`,
          // onShowSizeChange: (cur, size) => handlePageSizeChange(size),
          onChange: (pageNum, size) => handlePageChange(pageNum, size),
        }}
      />
    </Card>
  );
};

export default BusinessOpportunityTable;

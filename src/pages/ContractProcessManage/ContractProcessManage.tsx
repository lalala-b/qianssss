import { useState, useEffect } from "react";
import {
  Table,
  ConfigProvider,
  message,
  Spin,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Select,
  Input,
} from "antd";
import cn from "antd/es/locale/zh_CN";
import moment from "moment";
import Search, { SearchConfigItemPropsType } from "src/components/Search";
import {
  $getWorkflowList,
  WorkflowListResType,
  $getByDictType,
  $addWorkflow,
  $updateWorkflow,
} from "src/api/contractProcess";
import styles from "./ContractProcessManage.scss";

const { Option } = Select;

const ContractProcessManage = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [searchData, setSearchData] = useState({
    pageNum: 1,
    size: 20,
  });
  const [searchConfig, setSearchConfig] = useState<SearchConfigItemPropsType[]>(
    [
      {
        type: "input",
        key: "workflowId",
        data: [],
        conf: { placeholder: "工作流id" },
      },
      {
        type: "input",
        key: "workflowName",
        data: [],
        conf: { placeholder: "工作流名称" },
      },
      {
        type: "select",
        key: "orderType",
        data: [],
        conf: { placeholder: "工单类型" },
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
      },
      {
        type: "select",
        key: "isUsable",
        data: [
          { id: 0, val: "未启用" },
          { id: 1, val: "已启用" },
          { id: 2, val: "已废弃" },
        ],
        conf: { placeholder: "状态" },
        optionLabelKey: "val",
        optionValKey: "id",
      },
    ]
  );
  const [screenData, setScreenData] = useState<any>({});
  const [tableList, setTableList] = useState<WorkflowListResType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [modalLoading, setModalLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [editFlowId, setEditFlowId] = useState(0);

  const handleGoProcessNode = (workflowId: string) => {
    window.open(
      `#/backend-manage/process-node-manage?flowId=${workflowId}`,
      "_blank"
    );
  };

  const handleEditContractProcess = (item: WorkflowListResType) => {
    setShowEditModal(true);
    setEditFlowId(+item.workflowId);
    editForm.setFieldValue("isUsable", Number(item.isUsable));
    // setModalType("edit");
    // form.setFieldValue("workflowName", item.workflowName);
    // form.setFieldValue("busOrderType", String(item.busOrderType));
    // form.setFieldValue("orderType", String(item.orderType));
    // form.setFieldValue("performType", String(item.performType));
  };

  const COLUMNS = [
    {
      title: "工作流id",
      dataIndex: "workflowId",
      width: 100,
      key: "workflowId",
    },
    {
      title: "工作流名称",
      dataIndex: "workflowName",
      width: 140,
      key: "workflowName",
    },
    {
      title: "工单类型",
      dataIndex: "orderTypeName",
      width: 120,
      key: "orderTypeName",
    },
    {
      title: "商单类型",
      dataIndex: "busOrderTypeName",
      width: 120,
      key: "busOrderTypeName",
    },
    {
      title: "履约类型",
      dataIndex: "performTypeName",
      width: 120,
      key: "performTypeName",
    },
    {
      title: "工作流状态",
      dataIndex: "isUsableName",
      width: 140,
      key: "isUsableName",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: 180,
      key: "createTime",
      render: (_: string) => moment(_).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "操作",
      dataIndex: "workflowId",
      width: 120,
      key: "workflowId",
      render: (_: string, record: WorkflowListResType) => (
        <>
          <Button type="link" onClick={() => handleGoProcessNode(_)}>
            查看流程节点
          </Button>
          <Button type="link" onClick={() => handleEditContractProcess(record)}>
            状态变更
          </Button>
        </>
      ),
    },
  ];

  const getByDictType = async () => {
    const res = await $getByDictType({
      dictTypes: [
        "perform_node_table",
        "perform_type",
        "bus_order_type",
        "perform_order_type",
      ],
    });
    setScreenData(res);

    const newSearchConfig = [...searchConfig];
    newSearchConfig[2].data = res.perform_order_type;
    setSearchConfig(newSearchConfig);
  };

  const getList = async (params?: any) => {
    try {
      setLoading(true);
      const res = await $getWorkflowList({ ...searchData, ...(params || {}) });
      const { code, data, total } = res;
      setLoading(false);
      if (+code === 1) {
        setTableList(data || []);
        setTotal(total || 0);
      } else {
        setTableList([]);
        setTotal(0);
        message.error(res.message);
      }
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const handleChangeSearchData = (data: any) => {
    setSearchData(data);
  };

  const handleSearch = async () => {
    const newSearchData = { ...searchData };
    newSearchData.pageNum = 1;
    setSearchData(newSearchData);
    getList({ ...newSearchData });
  };

  const handleChangePage = (pageNum: number, size: number) => {
    const newSearchData = { ...searchData };
    newSearchData.pageNum = pageNum;
    newSearchData.size = size;
    setSearchData(newSearchData);
    getList({ ...newSearchData });
  };

  const handleAddContractProcess = () => {
    setShowModal(true);
    setModalType("add");
  };

  const handleConfirm = async () => {
    await form.validateFields();

    try {
      setModalLoading(true);
      await $addWorkflow(form.getFieldsValue());
      setModalLoading(false);
      message.success(`${modalType === "add" ? "添加" : "编辑"}成功`);
      setShowModal(false);
      getList()
    } catch (e: any) {
      setModalLoading(false);
      message.error(e.message);
    }
  };

  const handleEdit = async () => {
    await editForm.validateFields();

    try {
      setEditModalLoading(true);
      await $updateWorkflow({
        workflowId: editFlowId,
        ...editForm.getFieldsValue(),
      });
      setEditModalLoading(false);
      message.success("变更成功");
      setShowEditModal(false);
      getList()
      //
    } catch (e: any) {
      setEditModalLoading(false);
      message.error(e.message);
    }
  };

  useEffect(() => {
    getByDictType();
    getList();
  }, []);

  return (
    <div>
      <div className="qp-wrapper">
        <Search
          searchData={searchData}
          config={searchConfig}
          onChange={handleChangeSearchData}
          onSearch={handleSearch}
        />
      </div>
      <div className="qp-wrapper">
        <div className={styles.addButton}>
          <Button type="primary" onClick={handleAddContractProcess}>
            新增
          </Button>
        </div>
        <ConfigProvider locale={cn}>
          <Spin spinning={loading}>
            <Table
              dataSource={tableList}
              columns={COLUMNS}
              rowKey="workflowId"
              scroll={{ x: "max-content" }}
              sticky={{
                offsetHeader: -24,
              }}
              pagination={{
                pageSize: searchData.size,
                current: searchData.pageNum,
                total,
                showQuickJumper: true,
                showSizeChanger: false,
                showTotal: total => `总共${total}条`,
                // onShowSizeChange: (cur, size) => handlePageSizeChange(size),
                onChange: (pageNum, size) => handleChangePage(pageNum, size),
              }}
            />
          </Spin>
        </ConfigProvider>
      </div>

      {showModal && (
        <Modal
          width="800px"
          title={modalType === "add" ? "新增工作流程" : "状态变更"}
          visible={showModal}
          footer={[
            <Button key={1} onClick={() => setShowModal(false)}>
              取消
            </Button>,
            <Button
              type="primary"
              key={2}
              loading={modalLoading}
              onClick={handleConfirm}
            >
              确认
            </Button>,
          ]}
          onCancel={() => setShowModal(false)}
        >
          <div>
            <Form labelCol={{ span: 7 }} form={form}>
              <Row>
                <Col span={10}>
                  <Form.Item
                    label="工作流名称"
                    name="workflowName"
                    rules={[{ required: true, message: "请输入工作流名称" }]}
                  >
                    <Input placeholder="工作流名称" />
                  </Form.Item>
                </Col>

                <Col span={10} offset={2}>
                  <Form.Item
                    label="工单类型"
                    name="orderType"
                    rules={[{ required: true, message: "请选择工单类型" }]}
                  >
                    <Select placeholder="工单类型">
                      {screenData.perform_order_type?.map(
                        (item: { dictLabel: string; dictValue: string }) => (
                          <Option key={item.dictValue} value={item.dictValue}>
                            {item.dictLabel}
                          </Option>
                        )
                      )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={10}>
                  <Form.Item
                    label="商单类型"
                    name="busOrderType"
                    rules={[{ required: true, message: "请选择商单类型" }]}
                  >
                    <Select placeholder="商单类型">
                      {screenData.bus_order_type?.map(
                        (item: { dictLabel: string; dictValue: string }) => (
                          <Option key={item.dictValue} value={item.dictValue}>
                            {item.dictLabel}
                          </Option>
                        )
                      )}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={10} offset={2}>
                  <Form.Item
                    label="履约类型"
                    name="performType"
                    rules={[{ required: true, message: "请选择履约类型" }]}
                  >
                    <Select placeholder="履约类型">
                      {screenData.perform_type?.map(
                        (item: { dictLabel: string; dictValue: string }) => (
                          <Option key={item.dictValue} value={item.dictValue}>
                            {item.dictLabel}
                          </Option>
                        )
                      )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal
          width="400px"
          title="状态变更"
          visible={showEditModal}
          footer={[
            <Button key={1} onClick={() => setShowEditModal(false)}>
              取消
            </Button>,
            <Button
              type="primary"
              key={2}
              loading={editModalLoading}
              onClick={handleEdit}
            >
              确认
            </Button>,
          ]}
          onCancel={() => setShowEditModal(false)}
        >
          <div>
            <Form labelCol={{ span: 6 }} form={editForm}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label="是否废弃"
                    name="isUsable"
                    rules={[{ required: true, message: "请选择是否废弃" }]}
                  >
                    <Select placeholder="是否废弃">
                      {[
                        { id: 0, val: "未启用" },
                        { id: 1, val: "已启用" },
                        { id: 2, val: "已废弃" },
                      ].map(({ id, val }) => (
                        <Option key={id} value={id}>
                          {val}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ContractProcessManage;

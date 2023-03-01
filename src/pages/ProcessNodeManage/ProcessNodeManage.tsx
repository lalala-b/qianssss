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
  InputNumber,
} from "antd";
import cn from "antd/es/locale/zh_CN";
import moment from "moment";
import {
  $findNodeList,
  FindNodeListResType,
  $getByDictType,
  $addProcessNode,
} from "src/api/contractProcess";
import { getUrlQuery } from "src/utils/getUrlQuery";
import styles from "./ProcessNodeManage.scss";

const { Option } = Select;

const ProcessNodeManage = () => {
  const [form] = Form.useForm();

  const [searchData, setSearchData] = useState({
    pageNum: 1,
    size: 20,
  });

  const [screenData, setScreenData] = useState<any>({});
  const [tableList, setTableList] = useState<FindNodeListResType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [modalLoading, setModalLoading] = useState(false);

  const COLUMNS = [
    {
      title: "节点id",
      dataIndex: "nodeId",
      width: 100,
      key: "nodeId",
    },
    {
      title: "节点名称",
      dataIndex: "workflowName",
      width: 140,
      key: "workflowName",
    },
    {
      title: "节点名称",
      dataIndex: "nodeName",
      width: 140,
      key: "nodeName",
    },
    {
      title: "节点code",
      dataIndex: "nodeCode",
      width: 140,
      key: "nodeCode",
    },
    {
      title: "节点对应的数据表",
      dataIndex: "nodeTable",
      width: 180,
      key: "nodeTable",
    },
    {
      title: "节点位置",
      dataIndex: "nodeStep",
      width: 120,
      key: "nodeStep",
    },
    {
      title: "下个节点id",
      dataIndex: "nextNodeId",
      width: 140,
      key: "nextNodeId",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: 180,
      key: "createTime",
      render: (_: string) => moment(_).format("YYYY-MM-DD HH:mm:ss"),
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
  };

  const getList = async (params?: any) => {
    try {
      setLoading(true);
      const res = await $findNodeList({
        ...searchData,
        workflowId: getUrlQuery()?.flowId,
        ...(params || {}),
      });
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

  const handleChangePage = (pageNum: number, size: number) => {
    const newSearchData = { ...searchData };
    newSearchData.pageNum = pageNum;
    newSearchData.size = size;
    setSearchData(newSearchData);
    getList({ ...newSearchData });
  };

  const handleAddProcessNode = () => {
    setShowModal(true);
    setModalType("add");
  };

  const handleConfirm = async () => {
    await form.validateFields();

    try {
      setModalLoading(true);
      await $addProcessNode({
        ...form.getFieldsValue(),
        workflowId: getUrlQuery()?.flowId,
        nodeName: form.getFieldsValue().nodeNames,
      });
      setModalLoading(false);
      message.success(`${modalType === "add" ? "添加" : "编辑"}成功`);
      setShowModal(false);
      getList();
    } catch (e: any) {
      setModalLoading(false);
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
        <div className={styles.addButton}>
          <Button type="primary" onClick={handleAddProcessNode}>
            新增
          </Button>
        </div>
        <ConfigProvider locale={cn}>
          <Spin spinning={loading}>
            <Table
              dataSource={tableList}
              columns={COLUMNS}
              rowKey="nodeId"
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
          title={modalType === "add" ? "新增流程节点" : "状态变更"}
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
                    label="节点名称"
                    name="nodeNames"
                    rules={[{ required: true, message: "请输入节点名称" }]}
                  >
                    <Input placeholder="节点名称" />
                  </Form.Item>
                </Col>

                <Col span={10} offset={2}>
                  <Form.Item
                    label="数据表名"
                    name="nodeTable"
                    rules={[{ required: true, message: "请选择数据表名" }]}
                  >
                    <Select placeholder="数据表名">
                      {screenData.perform_node_table?.map(
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
                    label="工作流位置"
                    name="nodeStep"
                    rules={[{ required: true, message: "请选择工作流位置" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="工作流位置"
                    />
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

export default ProcessNodeManage;

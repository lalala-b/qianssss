import { useState, useEffect } from "react";
import {
  Spin,
  Table,
  message,
  Button,
  ConfigProvider,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/lib/table";
import cn from "antd/es/locale/zh_CN";
import qs from "qs";
import moment from "moment";
import IconTip from "src/components/IconTip";
import Search, {
  SearchGroupConfigItemType,
  SearchConfigItemPropsType,
} from "src/components/Search";
import {
  $getCompanyOptionsList,
  $getAllCompanyOptionsList,
  $getPlanList,
  GetPlanListItemType,
  $savePlan,
  $getPlanDetail,
} from "src/api/planManagement";
import sendPerf from "src/utils/lego";
import { toThousands } from "src/utils/number";
import styles from "./PlanManagement.scss";

const { Option } = Select;
const { TextArea } = Input;

const PlanManagement = () => {
  const { $permission } = window;

  const [planForm] = Form.useForm();

  const [searchData, setSearchData] = useState<any>({
    pageNum: 1,
    size: 20,
  });
  const [searchConfig, setSearchConfig] = useState<
    SearchGroupConfigItemType[] | SearchConfigItemPropsType[]
  >([
    {
      label: "方案筛选",
      config: [
        {
          type: "select",
          key: "companyId",
          data: [],
          conf: {
            placeholder: "客户",
            labelInValue: true,
            // multiple: true,
          },
          optionLabelKey: "name",
          optionValKey: "id",
        },
        {
          type: "input",
          key: "planNo",
          conf: {
            placeholder: "方案号",
          },
        },
      ],
    },
    {
      label: "时间筛选",
      config: [
        {
          type: "rangeDatePicker",
          key: "createDate",
          label: "创建时间",
          data: [],
          conf: {
            // hasRanges: true,
            placeholder: ["开始时间", "结束时间"],
          },
        },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [tableList, setTableList] = useState<GetPlanListItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [planDialogType, setPlanDialogType] = useState("add");
  const [allCompanyList, setAllCompanyList] = useState<
    { id: number; name: string }[]
  >([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [planId, setPlanId] = useState(0);
  const [planDialogLoading, setPlanDialogLoading] = useState(false);

  const getCompanyOptionsList = async () => {
    const res = await $getCompanyOptionsList();
    const newSearchConfig = [...searchConfig] as SearchGroupConfigItemType[];
    const index = newSearchConfig[0].config.findIndex(
      item => item.key === "companyId"
    );
    newSearchConfig[0].config[index].data = res;
    setSearchConfig(newSearchConfig);
  };

  const getAllCompanyOptionsList = async () => {
    const res = await $getAllCompanyOptionsList();
    setAllCompanyList(res);
  };

  const getList = async (params?: any) => {
    const paramsData = { ...searchData, ...(params || {}) };

    paramsData.companyId = (paramsData.companyId || {}).value || "";

    if (paramsData.createDate?.length) {
      paramsData.createTimeStart = `${moment(paramsData.createDate[0]).format(
        "YYYY-MM-DD"
      )} 00:00:00`;
      paramsData.createTimeEnd = `${moment(paramsData.createDate[1]).format(
        "YYYY-MM-DD"
      )} 23:59:59`;
    } else {
      delete paramsData.createTimeStart;
      delete paramsData.createTimeEnd;
    }
    delete paramsData.createDate;

    try {
      setLoading(true);
      const { list, total } = await $getPlanList(paramsData);
      setTableList(list || []);
      setTotal(total || 0);
      setLoading(false);
      sendPerf()
    } catch (e: any) {
      setLoading(false);
      message.error(e.message);
    }
  };

  const handleExport = () => {
    const paramsData = { ...searchData, isExport: 1 };

    paramsData.companyId = (paramsData.companyId || {}).value || "";

    if (paramsData.createDate?.length) {
      paramsData.createTimeStart = moment(paramsData.createDate[0]).format(
        "YYYY-MM-DD"
      );
      paramsData.createTimeEnd = moment(paramsData.createDate[1]).format(
        "YYYY-MM-DD"
      );
    } else {
      delete paramsData.createTimeStart;
      delete paramsData.createTimeEnd;
    }
    delete paramsData.createDate;

    window.open(
      `/api/qp/business/opportunity/plan/list?${qs.stringify(paramsData)}`
    );
  };

  const handleChangeSearchData = (data: any) => {
    setSearchData(data);
  };

  const handleCloseFilterTagItem = (key: string) => {
    if (!key) {
      return;
    }

    const newSearchData = { ...searchData };
    delete newSearchData[key];
    setSearchData(newSearchData);
  };

  const handleClearFilter = () => {
    setSearchData({
      pageNum: 1,
      size: 20,
    });
  };

  const handleSearch = () => {
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

  const handleAddOpportunity = (
    record: GetPlanListItemType,
    opType?: number
  ) => {
    const { cooperatedOpportunity, coOpportunity, id } = record;

    let url = `/#/qp/business-opportunity-manage?from=billAdvManage&planId=${id}`;

    if (opType === 2) {
      url += `&opType=2`;
    }

    if (+cooperatedOpportunity + +coOpportunity === 0) {
      Modal.confirm({
        title: "提醒",
        content: "即将跳转到商机管理页面创建新商机，确认创建？",
        onOk: () => {
          window.open(url);
        },
      });
      return;
    }

    if (+coOpportunity > 0) {
      Modal.confirm({
        title: "提醒",
        content:
          "已存在合作中的商机，若要添加账号，在合作中的商机中添加即可，确定要继续新建商机？",
        onOk: () => {
          window.open(url);
        },
      });
      return;
    }

    window.open(url);
  };

  const handleAddPlan = () => {
    setShowPlanDialog(true);
    setPlanDialogType("add");
    setPlanId(0);
  };

  const handleConfirm = async () => {
    await planForm.validateFields();

    const params = { ...planForm.getFieldsValue() };
    if (planDialogType === "edit") {
      params.id = planId;
    }

    try {
      setConfirmLoading(true);
      await $savePlan(params);
      setConfirmLoading(false);
      message.success(`${planDialogType === "edit" ? "编辑" : "新增"}方案成功`);
      getList();
      getCompanyOptionsList();
      setShowPlanDialog(false);
    } catch (e: any) {
      setConfirmLoading(false);
      message.error(e.message);
    }
  };

  const getPlanDetail = async (id: number) => {
    setPlanDialogLoading(true);
    try {
      const res = await $getPlanDetail({ id });
      planForm.setFieldsValue(res);
      setPlanDialogLoading(false);
    } catch (e: any) {
      message.error(e.message);
      setPlanDialogLoading(false);
    }
  };

  const handleEditPlan = (id: number) => {
    setShowPlanDialog(true);
    setPlanDialogType("edit");
    setPlanId(id);
    getPlanDetail(id);
  };

  const handleShowPlan = (id: number) => {
    setShowPlanDialog(true);
    setPlanDialogType("detail");
    getPlanDetail(id);
  };

  const handleGoOpportunity = (record: GetPlanListItemType) => {
    window.open(`/#/qp/business-opportunity-manage?planNo=${record.planNo}`);
  };

  const handleGoOrder = (record: GetPlanListItemType) => {
    window.open(`/#/qp/invoice-management?planNo=${record.planNo}`);
  };

  const COLUMNS = [
    {
      title: "方案号",
      dataIndex: "planNo",
      width: 120,
      key: "planNo",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: 120,
      key: "createTime",
    },
    {
      title: "客户名称",
      dataIndex: "companyName",
      width: 140,
      key: "companyName",
    },
    {
      title: "备注",
      dataIndex: "planRemark",
      width: 140,
      key: "planRemark",
      render: (val: string) => val || '--',
    },
    {
      title: (
        <>
          合作预算
          <IconTip content="剩余预算=合作预算-平台报价总额" />
        </>
      ),
      dataIndex: "coBudget",
      width: 160,
      key: "coBudget",
      render: (_: number, record: GetPlanListItemType) => (
        <div>
          <p>预算：¥{toThousands(record.coBudget)}</p>
          <p>剩余：¥{toThousands(record.remainBudget)}</p>
        </div>
      ),
    },
    {
      title: (
        <>
          平台报价总额
          <IconTip content="平台报价总额=全部关联商机中，账号的平台报价之和（不含取消合作的账号）" />
        </>
      ),
      dataIndex: "cooperatedBudget",
      width: 140,
      key: "cooperatedBudget",
      render: (_: number, record: GetPlanListItemType) => (
        <p>¥{toThousands(record.cooperatedBudget)}</p>
      ),
    },
    {
      title: "关联商机",
      dataIndex: "coOpportunity",
      width: 120,
      key: "coOpportunity",
      render: (_: number, record: GetPlanListItemType) => (
        <div>
          <p>
            合作中：
            {record.coOpportunity ? (
              <Button
                className={styles.oppButton}
                type="link"
                onClick={() => handleGoOpportunity(record)}
              >
                {record.coOpportunity}
              </Button>
            ) : (
              `${record.coOpportunity || 0}`
            )}
          </p>
          <p>
            确认合作：
            {record.cooperatedOpportunity ? (
              <Button
                className={styles.oppButton}
                type="link"
                onClick={() => handleGoOpportunity(record)}
              >
                {record.cooperatedOpportunity}
              </Button>
            ) : (
              `${record.cooperatedOpportunity || 0}`
            )}
          </p>
        </div>
      ),
    },
    {
      title: "关联商单",
      dataIndex: "businessOrderTotal",
      width: 120,
      key: "businessOrderTotal",
      render: (_: number, record: GetPlanListItemType) => (
        <p>
          商单总数：
          {record.businessOrderTotal ? (
            <Button
              className={styles.oppButton}
              type="link"
              onClick={() => handleGoOrder(record)}
            >
              {record.businessOrderTotal}
            </Button>
          ) : (
            `${record.businessOrderTotal || 0}`
          )}
        </p>
      ),
    },
    {
      title: "操作",
      dataIndex: "id",
      width: 120,
      fixed: "right",
      key: "id",
      render: (_: string, record: GetPlanListItemType) => (
        <>
          <Button
            type="link"
            style={{ color: "#67C23A" }}
            onClick={() => handleAddOpportunity(record)}
          >
            新建商机
          </Button>

          <Button
            type="link"
            style={{ color: "#ff8918" }}
            onClick={() => handleGoOpportunity(record)}
          >
            商机明细
          </Button>

          {$permission("edit_plan_button") && (
            <Button type="link" onClick={() => handleEditPlan(record.id)}>
              编辑
            </Button>
          )}
          <Button type="link" onClick={() => handleShowPlan(record.id)}>
            查看
          </Button>
          {/* </Button>
          <Button type="link" onClick={() => handleGoProcessNode(_)}>
            查看流程节点
          </Button>
          <Button type="link" onClick={() => handleEditContractProcess(record)}>
            状态变更
          </Button> */}
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!showPlanDialog) {
      planForm.resetFields();
    }
  }, [showPlanDialog]);

  useEffect(() => {
    getCompanyOptionsList();
    getAllCompanyOptionsList();
    getList();
  }, []);

  return (
    <div>
      <div className="qp-wrapper">
        <Search
          searchData={searchData}
          config={searchConfig}
          showCondition
          onChange={handleChangeSearchData}
          onSearch={handleSearch}
          onExport={handleExport}
          onCloseFilterTagItem={handleCloseFilterTagItem}
          onClearFilter={handleClearFilter}
        />
      </div>
      <div className="qp-wrapper">
        <div className={styles.addButton}>
          <Button type="primary" onClick={handleAddPlan}>
            新增方案
          </Button>
        </div>
        <ConfigProvider locale={cn}>
          <Spin spinning={loading}>
            <Table
              dataSource={tableList}
              columns={COLUMNS as ColumnsType<GetPlanListItemType>}
              rowKey="id"
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

      <Modal
        title={
          planDialogType === "add"
            ? "新增方案"
            : planDialogType === "edit"
            ? "编辑方案"
            : "查看方案"
        }
        visible={showPlanDialog}
        footer={[
          <Button key={1} onClick={() => setShowPlanDialog(false)}>
            取消
          </Button>,
          planDialogType !== "detail" && (
            <Button
              type="primary"
              key={2}
              loading={confirmLoading}
              onClick={handleConfirm}
            >
              确认
            </Button>
          ),
        ]}
        onCancel={() => setShowPlanDialog(false)}
      >
        <Spin spinning={planDialogLoading}>
          <Form
            name="plan"
            form={planForm}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 13 }}
            autoComplete="off"
            disabled={planDialogType === "detail"}
          >
            <Form.Item
              label="客户"
              name="companyId"
              rules={[{ required: true, message: "请选择客户" }]}
            >
              <Select
                placeholder="请选择客户"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {allCompanyList.map(({ id, name }) => (
                  <Option value={id} key={id}>
                    {name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="合作预算"
              name="coBudget"
              rules={[{ required: true, message: "请输入合作预算" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0.01}
                precision={2}
                placeholder="请输入合作预算"
              />
            </Form.Item>

            <Form.Item label="备注" name="planRemark">
              <TextArea maxLength={200} showCount placeholder="请输入备注" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default PlanManagement;

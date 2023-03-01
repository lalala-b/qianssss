import { useContext, useState, useEffect } from "react";
import { Button, message, Form, Row, Col, Select } from "antd";
import cs from "classnames";
import {
  $getExecuteTeam,
  $allotExecutor,
  ExecuteGroupInfoType,
  ExecutorInfoType,
} from "src/api/workOrderDetail";
import { DetailContext } from "../DetailProvider";
import WorkItemBox from "../WorkDetailComponets/WorkItemBox";
import styles from "./AllotExecutor.scss";

const { Option } = Select;
// const { confirm } = Modal;

const AllotExecutor = () => {
  const [allotExecutorForm] = Form.useForm();

  const {
    detail: {
      executorNodeAndFieldBO: {
        executorNodeBO: {
          nodeStatus = undefined,
          operatorUserName = "",
          operatorDName = "",
          operatorFName = "",
          editAuth = false,
          executeGroupId = "",
          executeGroupName = "",
          executorUserId = "",
          executorUserName = "",
          cancelReasonTypeDesc = "",
          updateTime = "",
        } = {},
      } = {},
      orderBaseInfoBO: { orderNo = "", orderStatus = "" } = {},
    },
    setLoading,
    onRefresh,
  } = useContext(DetailContext);
  const [edit, setEdit] = useState(false);
  const [groupList, setGroupList] = useState<ExecuteGroupInfoType[]>([]);
  const [allExecutorList, setAllExecutorList] = useState<ExecutorInfoType[]>(
    []
  );
  const [btnLoading, setBtnLoading] = useState(false);
  const [userList, setUserList] = useState<ExecutorInfoType[]>([]);

  const handleEdit = () => {
    // 已核账
    if (+orderStatus === 10) {
      message.error("已核账的工单不再支持修改信息");
      return;
    }

    allotExecutorForm.setFieldsValue({
      executeGroupId,
      executorUserId,
    });

    if (!executeGroupId) {
      setUserList(allExecutorList);
    } else {
      setUserList(
        allExecutorList.filter(item => item.orgId === executeGroupId)
      );
    }

    setEdit(true);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  const submit = async (editFlag: 0 | 1) => {
    try {
      const { executeGroupId, executorUserId } =
        allotExecutorForm.getFieldsValue();
      const { executeGroupName } =
        groupList.find(item => item.executeGroupId === executeGroupId) || {};
      const { name } =
        allExecutorList.find(item => item.id === executorUserId) || {};
      setBtnLoading(true);
      await $allotExecutor({
        ...allotExecutorForm.getFieldsValue(),
        executeGroupName,
        executorUserName: name,
        editFlag,
        orderNo,
        orderStatus,
      });
      message.success("操作成功");
      setBtnLoading(false);
      handleCancel();
      onRefresh();
    } catch (e: any) {
      setLoading(false);
      setBtnLoading(false);
      message.error(String(e.message));
    }
  };

  const handleChangeSubmitStatus = async (editFlag: 0 | 1) => {
    await allotExecutorForm.validateFields();
    // if (editFlag === 0) {
    //   // 代表进行中
    //   confirm({
    //     icon: "",
    //     content: "确定相关信息均已填写正确",
    //     async onOk() {
    //       submit(editFlag);
    //     },
    //   });
    //   return;
    // }
    submit(editFlag);
  };

  const handleChangeExecuteGroup = (val: number) => {
    if (!val) {
      setUserList(allExecutorList);
    } else {
      allotExecutorForm.setFieldValue("executorUserId", null);
      setUserList(allExecutorList.filter(item => item.orgId === val));
    }
  };

  const getExecuteTeam = async () => {
    const { executeGroupInfoBOList = [], executorInfoBOList = [] } =
      await $getExecuteTeam();
    setGroupList(executeGroupInfoBOList);
    setAllExecutorList(executorInfoBOList);
    setUserList(executorInfoBOList);
  };

  useEffect(() => {
    getExecuteTeam();
  }, []);

  return (
    <div>
      <WorkItemBox
        title="分配执行人"
        nodeStatus={nodeStatus}
        operatorUserName={`${
          [operatorUserName, operatorDName, operatorFName]
            .filter(item => item)
            .join("-") || "待定"
        }`}
        cancelOrderReason={cancelReasonTypeDesc}
        updateTime={updateTime}
        allBtn={
          <div>
            {/* // 状态不是撤单 且有编辑权限 */}
            {Number(orderStatus) !== 11 && editAuth && (
              <>
                {/* 进行中 */}
                {Number(nodeStatus) === 1 &&
                  (edit ? (
                    <>
                      <Button
                        type="primary"
                        loading={btnLoading}
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={() => handleChangeSubmitStatus(0)}
                      >
                        保存并提交
                      </Button>
                      <Button onClick={handleCancel}>取消</Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={handleEdit}>
                      去分配
                    </Button>
                  ))}
                {/* 已完成 */}
                {Number(nodeStatus) === 2 &&
                  (edit ? (
                    <>
                      <Button
                        type="primary"
                        loading={btnLoading}
                        className={cs(styles.successButton, "m-r-6")}
                        onClick={() => handleChangeSubmitStatus(1)}
                      >
                        确认
                      </Button>
                      <Button onClick={handleCancel}>取消</Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={handleEdit}>
                      编辑
                    </Button>
                  ))}
              </>
            )}
          </div>
        }
      >
        <div className={cs(styles.wrapper, "m-t-24")}>
          <Form form={allotExecutorForm}>
            <Row gutter={24}>
              <Col span={8}>
                {edit ? (
                  <Form.Item
                    label="执行人小组"
                    name="executeGroupId"
                    rules={[{ required: true, message: "请选择执行人小组" }]}
                  >
                    <Select
                      placeholder="请选择执行人小组"
                      allowClear
                      className={styles.select}
                      onChange={handleChangeExecuteGroup}
                    >
                      {groupList.map(({ executeGroupId, executeGroupName }) => (
                        <Option key={executeGroupId} value={executeGroupId}>
                          {executeGroupName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <Form.Item label="执行人小组">
                    <div>{executeGroupName || "--"}</div>
                  </Form.Item>
                )}
              </Col>

              <Col span={8}>
                {edit ? (
                  <Form.Item
                    label="执行人"
                    name="executorUserId"
                    rules={[{ required: true, message: "请选择执行人" }]}
                  >
                    <Select
                      placeholder="请选择执行人"
                      allowClear
                      className={styles.select}
                    >
                      {userList.map(({ id, name }) => (
                        <Option key={id} value={id}>
                          {name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <Form.Item label="执行人">
                    <div className={!executorUserName ? styles.error : ""}>
                      {executorUserName || "待分配"}
                    </div>
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Form>
        </div>
      </WorkItemBox>
    </div>
  );
};

export default AllotExecutor;

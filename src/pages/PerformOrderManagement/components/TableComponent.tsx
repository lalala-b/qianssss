/* eslint-disable no-param-reassign */
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Select,
  Popconfirm,
  message,
  ConfigProvider,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AccountCard from "src/components/AccountCard/AccountCard";
import VideoInfo from "src/components/VideoInfo/VideoInfo";
import OverPopover from 'src/components/OverPopover/OverPopover'
import zhCN from "antd/es/locale/zh_CN";
import { $getExecutorByOrgId } from "src/api/perform";
import {
  $confirmOutline,
  $confirmScript,
  $allotExecutor,
  $getExecuteTeam,
} from "src/api/workOrderDetail";
import { OrderListResponse } from "@/api/types/projectId_3631";
import {
  orderTypeList,
  quotationTypeList,
  overTimeTypeList,
  placeList,
} from "../config/search";

import STATUS_LIST_CONFIG from "../config/status";

import styles from "./TableComponent.scss";

const { Option } = Select;

type SignOrderListType = OrderListResponse["signOrderList"];

type TableComponentPropType = {
  data?: SignOrderListType;
  pagination?: TablePaginationConfig;
  handlePageChange: any;
};

const TableComponent = ({
  data = [],
  pagination = {},
  handlePageChange,
}: TableComponentPropType) => {
  const { $permission } = window;
  const [executorList, setExecutorList] = useState<any[]>([]);
  const [confirmScriptLoading, setConfirmScriptLoading] =
    useState<boolean>(false);
  const [confirmOutlineLoading, setConfirmOutlineLoading] =
    useState<boolean>(false);

  const getConfigInfoById = (list: any[], id: string, prop = "value") =>
    list.find(item => item[prop] === id) || {};

  // 获取执行人初始数据用于回显
  const getExecuteTeam = async () => {
    try {
      const { executorInfoBOList = [] } = await $getExecuteTeam();
      setExecutorList(executorInfoBOList);
    } catch (e: any) {
      if (e?.message) {
        message.error(e.message);
      }
    }
  };

  // 获取执行人数据
  const handleGetExecutorList = async (orgId: number) => {
    try {
      const res = await $getExecutorByOrgId({
        orgId,
      });
      setExecutorList(res);
    } catch (e: any) {
      if (e?.message) {
        message.error(e.message);
      }
    }
  };

  // 选择执行人
  const handleChangeExecutor = async (
    val: number,
    option: any,
    record: any
  ) => {
    try {
      const { executeGroupId, executeGroupName, orderNo } = record;
      let editFlag = 0;
      data.forEach((item: any) => {
        if (item.orderNo === orderNo) {
          editFlag = item.executorUserId ? 1 : 0;
        }
      });
      await $allotExecutor({
        executeGroupId,
        executeGroupName,
        executorUserId: val,
        executorUserName: option?.children || "",
        editFlag,
        orderNo,
      });
      message.success("操作成功");
      handlePageChange(1);
    } catch (e: any) {
      if (e?.message) {
        message.error(e.message);
      }
    }
  };

  // 确认大纲
  const handleConfirmOutline = async (orderNo: string) => {
    const params = {
      orderNo,
    };
    setConfirmOutlineLoading(true);
    try {
      await $confirmOutline(params);
      setConfirmOutlineLoading(false);
      message.success("操作成功");
      handlePageChange(1);
    } catch (error: any) {
      setConfirmOutlineLoading(false);
      message.error(error);
    }
  };

  // 确认脚本
  const handleConfirmScript = async (orderNo: string) => {
    const params = {
      orderNo,
    };
    setConfirmScriptLoading(true);
    try {
      await $confirmScript(params);
      setConfirmScriptLoading(false);
      message.success("操作成功");
      handlePageChange(1);
    } catch (error: any) {
      setConfirmScriptLoading(false);
      message.error(error.message);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "工单号",
      dataIndex: "orderNo",
      width: 100,
    },
    {
      title: "品牌名称",
      dataIndex: "brandName",
      width: 100,
      render(value) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "商单类型",
      dataIndex: "busOrderType",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(quotationTypeList, String(value))?.label || ""}
          </span>
        );
      },
    },
    {
      title: "订单类型",
      dataIndex: "orderType",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(orderTypeList, String(value), "id")?.label || ""}
          </span>
        );
      },
    },
    {
      title: "订单归属",
      dataIndex: "orderBelong",
      width: 100,
      render(value) {
        return <span>{value || "--"}</span>;
      },
    },
    {
      title: "工单状态",
      dataIndex: "orderStatus",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(STATUS_LIST_CONFIG, String(value))?.label ||
              "--"}
          </span>
        );
      },
    },
    {
      title: "超时情况",
      dataIndex: "overtimeStatus",
      width: 100,
      render(value) {
        return (
          <span
            style={{ color: value ? (value === 1 ? "purple" : "red") : "" }}
          >
            {getConfigInfoById(overTimeTypeList, String(value))?.label || "--"}
          </span>
        );
      },
    },
    {
      title: "创建人",
      dataIndex: "businessUserName",
      width: 100,
    },
    {
      title: "商务团队",
      dataIndex: "businessGroupName",
      width: 110,
      render(value: unknown, record: any) {
        return (
          <>
            {record.businessGroupName && record.businessTeamName
              ? `${record.businessGroupName}-${record.businessTeamName}`
              : record.businessGroupName || record.businessTeamName || "--"}
          </>
        );
      },
    },
    {
      title: "执行人",
      dataIndex: "executorUserName",
      width: 100,
      render(value: string, record: any) {
        return (
          <div className={styles.root}>
            {record.orderStatus === 10 ? (
              <>{value || ""}</>
            ) : (
              <Select
                placeholder="请选择执行人"
                allowClear
                disabled={
                  !$permission("executor_select") || record.orderStatus === 1
                }
                defaultValue={record.executorUserId}
                onFocus={() => handleGetExecutorList(record.executeGroupId)}
                onChange={(val, option) =>
                  handleChangeExecutor(val, option, record)
                }
              >
                {executorList.map(({ id, name }) => (
                  <Option key={id} value={id}>
                    {name}
                  </Option>
                ))}
              </Select>
            )}
          </div>
        );
      },
    },
    {
      title: "账号信息",
      dataIndex: "accountName",
      width: 200,
      render(value: unknown, record) {
        return <AccountCard info={record} />;
      },
    },
    {
      title: "档期",
      dataIndex: "publishDate",
      width: 120,
      render(value: string) {
        return <span>{value || "--"}</span>;
      },
    },
    {
      title: "下单状态",
      dataIndex: "orderFlag",
      width: 100,
      render(value) {
        return (
          <span>
            {getConfigInfoById(placeList, String(value), "id")?.label || "--"}
          </span>
        );
      },
    },
    {
      title: "视频",
      dataIndex: "flowId",
      width: 180,
      render(value: any, record) {
        return (
          <>
            {value ? (
              <VideoInfo info={record} />
            ) : record.url ? (
              <OverPopover content={record.url} type="link"/>
            ) : (
              "暂无视频"
            )}
          </>
        );
      },
    },
    {
      title: "下单价校验",
      dataIndex: "taskIdStatusDesc",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "成单日期",
      dataIndex: "orderTime",
      width: 140,
      render(value: string) {
        return <>{value || ""}</>;
      },
    },
    {
      title: "履约延期",
      dataIndex: "performDelayFlagName",
      width: 100,
      render(value: any) {
        return <>{value||''}</>;
      },
    },
    {
      title: "取消合作原因",
      dataIndex: "cancelReasonTypeDesc",
      width: 140,
      render(value: string) {
        return (<div>
          <OverPopover content={value}/>
        </div>);
      },
    },
    {
      title: "特殊工单履约时间",
      dataIndex: "specialCompleteTime",
      width: 120,
      render(value: string) {
        return <>{value || "--"}</>;
      },
    },
    {
      title: "操作",
      dataIndex: "",
      width: 100,
      key: "operation",
      fixed: "right",
      render(value: unknown, record: any) {
        return (
          <>
            <div>
              <Button
                type="link"
                href={`#/qp/work-order-detail?id=${record?.orderNo}`}
                target="_blank"
              >
                查看
              </Button>
            </div>
            <>
              {/* 状态为大纲待确认且当前工单的执行人和执行团队团长才可确认大纲 */}
              {record.orderStatus === 4 && record.canConfirm ? (
                <Popconfirm
                  title="确定大纲已和客户确认完毕？"
                  onConfirm={() => handleConfirmOutline(record.orderNo)}
                  okText="确认"
                  cancelText="取消"
                  okButtonProps={{
                    loading: confirmOutlineLoading,
                  }}
                >
                  <Button type="link" style={{ color: "#87d068" }}>
                    确认大纲
                  </Button>
                </Popconfirm>
              ) : record.orderStatus === 5 && record.canConfirm ? ( // 状态为脚本待确认且当前工单的执行人和执行团队团长才可确认脚本
                <Popconfirm
                  title="确定脚本已和客户确认完毕？"
                  onConfirm={() => handleConfirmScript(record.orderNo)}
                  okText="确认"
                  cancelText="取消"
                  okButtonProps={{
                    loading: confirmScriptLoading,
                  }}
                >
                  <Button type="link" style={{ color: "#87d068" }}>
                    确认脚本
                  </Button>
                </Popconfirm>
              ) : (
                ""
              )}
            </>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    getExecuteTeam();
  }, []);

  return (
    <div>
      <ConfigProvider locale={zhCN}>
        <Table
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -24,
          }}
          columns={columns}
          dataSource={data}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: false,
            showTotal: total => `总共${total}条`,
            ...pagination,
            onChange: (pageNum, size) => handlePageChange(pageNum, size),
          }}
          locale={{
            filterEmptyText: "暂无数据",
          }}
          rowKey="orderNo"
        />
      </ConfigProvider>
    </div>
  );
};

export default TableComponent;

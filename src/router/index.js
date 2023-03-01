// 导入需要配置路由的组件
import TaskManagement from "src/pages/TaskManagement/TaskManagement";
import NewBusinessOpportunity from "src/pages/NewBusinessOpportunity";
import SignedOrderManagementList from "src/pages/SignedOrderManagement/List";
import InvoiceManagement from "src/pages/InvoiceManagement";
import MediaManagement from "src/pages/MediaManagement";
import StudioOrderManagement from "src/pages/StudioOrderManagement";
import PerformOrderManagement from "src/pages/PerformOrderManagement";
import ContractProcessManage from "src/pages/ContractProcessManage";
import ProcessNodeManage from "src/pages/ProcessNodeManage";
import WorkManagement from "src/pages/WorkManagement";
import PlanManagement from "src/pages/PlanManagement";
// import SpecialPaymentManagement from "src/pages/SpecialPaymentManagement";
import InvoiceDetails from "src/pages/InvoiceDetails/Detail";
import WorkOrder from "src/pages/WorkOrder/Detail";
import OaApplyRecord from "src/pages/OaApplyRecord";
import OaPaymentApply from "src/pages/OaPaymentApply";
import OaInvoiceApply from "src/pages/OaInvoiceApply";
import FinancialManagement from "src/pages/FinancialManagement";
import MediaPaymentApproval from "src/pages/MediaPaymentApproval";
import InvoiceApplicationApproval from "src/pages/InvoiceApplicationApproval";
import Login from "src/pages/Login";

const routes = [
  {
    path: "/qp",
    name: "business_qp",
    label: "（内测）乾派2.0",
    exact: false,
    children: [
      {
        path: "/qp/plan-management",
        label: "方案管理",
        name: "plan_management",
        component: <PlanManagement />,
        exact: false,
      },
      {
        path: "/qp/business-opportunity-manage",
        label: "商机管理",
        name: "new_business_opportunity_manage",
        component: <NewBusinessOpportunity />,
        exact: false,
      },
      {
        path: "/qp/task-management",
        label: "任务管理",
        name: "task_management",
        component: <TaskManagement />,
        exact: false,
      },
      {
        path: "/qp/work-order-detail",
        label: "工单详情",
        name: "work_order_detail",
        hidden: true,
        component: <WorkOrder />,
      },
      {
        path: "/qp/signed-order-manage",
        label: "签约订单管理",
        name: "signed_order_manage",
        component: <SignedOrderManagementList />,
        exact: false,
      },
      {
        path: "/qp/media-management",
        label: "媒介订单管理",
        name: "media_management",
        component: <MediaManagement />,
        exact: false,
      },
      {
        path: "/qp/studio-management",
        label: "工作室订单管理",
        name: "studio_management",
        component: <StudioOrderManagement />,
        exact: false,
      },
      {
        path: "/qp/perform-management",
        label: "执行管理",
        name: "perform_management",
        component: <PerformOrderManagement />,
        exact: false,
      },
      {
        path: "/qp/work-management",
        label: "工单管理",
        name: "work_management",
        component: <WorkManagement />,
        exact: false,
      },
      {
        path: "/qp/invoice-management",
        label: "商单管理",
        name: "invoice_management",
        component: <InvoiceManagement />,
        exact: false,
      },
      // {
      //   path: "/qp/special-payment-management",
      //   label: "特殊收支",
      //   name: "special_payment_manage",
      //   component: <SpecialPaymentManagement />,
      //   exact: false,
      // },
      {
        path: "/qp/invoice-details",
        label: "商单详情",
        name: "invoice_details",
        component: <InvoiceDetails />,
        exact: false,
      },
      {
        path: "/qp/financial-management",
        label: "财务管理",
        name: "financial_management",
        component: <FinancialManagement />,
        exact: false,
      },
      {
        path: "/backend-manage/contract-process-manage",
        label: "履约流程管理",
        name: "contract_process_manage",
        component: <ContractProcessManage />,
        exact: false,
      },
      {
        path: "/backend-manage/process-node-manage",
        label: "流程节点管理",
        hidden: true,
        name: "process_node_manage",
        component: <ProcessNodeManage />,
        exact: false,
      },
      {
        path: "/qp/oa-apply-record",
        label: "OA申请记录",
        name: "oa_apply_record",
        component: <OaApplyRecord />,
        exact: false,
      },
      {
        path: "/qp/oa-payment-apply",
        label: "OA付款申请",
        name: "oa_payment_apply",
        component: <OaPaymentApply />,
        hidden: true,
        exact: false,
      },
      {
        path: "/qp/oa-invoice-apply",
        label: "OA开票申请",
        name: "oa_invoice_apply",
        component: <OaInvoiceApply />,
        hidden: true,
        exact: false,
      },
      {
        path: "/qp/media-payment-approval",
        label: "广告费及新媒体付款审批单",
        name: "media_payment_approval",
        component: <MediaPaymentApproval />,
        hidden: true,
        exact: false,
      },
      {
        path: "/qp/invoice-application-approval",
        label: "发票申请审批单",
        name: "invoice_application_approval",
        component: <InvoiceApplicationApproval />,
        hidden: true,
        exact: false,
      },
    ],
  },
  {
    path: "/login",
    type: "base",
    exact: false,
    component: <Login />,
  },
];

export default routes;

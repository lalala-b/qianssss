export type StatusListType = {
  label: string;
  key: string | number;
  value?: string | number
  title?: string,
  number?: number
}

export default [
  {
    label: '全部工单',
    key: 'allCount',
    value: '',
  },
  {
    label: '下单信息待确认',
    key: 'confirmInformationCount',
    value: '1',
    title: '确认下单信息',
  },
  {
    label: '执行人待分配',
    key: 'assignExecutorCount',
    value: '2',
    title: '分配执行人',
  },
  {
    label: '执行计划待录入',
    key: 'enterExecutionPlanCount',
    value: '3',
    title: '录入执行计划',
  },
  {
    label: '大纲待确认',
    key: 'confirmOutlineCount',
    value: '4',
    title: '确认大纲',
  },
  {
    label: '脚本待确认',
    key: 'confirmScriptCount',
    value: '5',
    title: '确认脚本',
  },
  {
    label: '视频初稿待确认',
    key: 'confirmFirstVideoCount',
    value: '6',
    title: '确认视频初稿',
  },
  {
    label: '待履约',
    key: 'postVideoCount',
    value: '7',
    title: '发布视频',
  },
  // {
  //   label: '已履约',
  //   key: 'confirmReceiptPaymentCount',
  //   value: '8',
  //   title: '确认收付款',
  // },
  {
    label: '待核账',
    key: 'financialAccountingCount',
    value: '9',
    title: '财务核账',
  },
  {
    label: '已核账',
    key: 'auditedWorkCount',
    value: '10',
    title: '已核账',
  },
  {
    label: '已取消合作',
    key: 'cancelledWorkCount',
    value: '11',
    title: '已取消合作',
  },
]
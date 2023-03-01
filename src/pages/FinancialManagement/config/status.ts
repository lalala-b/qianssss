
export type TypeListType = {
  label: string;
  key: string |number;
  value?: string | number
  title?: string,
  number?: number
}

export const paymentResultList = [
  { label: "已补款", id: '1' },
  { label: "未补款", id: '2' },
];
export const refundList = [
  { label: "已返款", id: '1' },
  { label: "未返款", id: '2' },
];
export const receiveList = [
  { label: "客户已回款", id: '1' },
  { label: "客户未回款", id: '2' },
];
export const invoiceStatus = [
  {
    val: 0,
    text: '履约中',
  },
  {
    val: 1,
    text: '已履约',
  },
  {
    val: 2,
    text: '已核账',
  },
]
export const TYPE_LIST_CONFIG = [
  {
    label: '全部商单',
    key: 'businessOrderCount',
    value: '',
  },
  {
    label: '线下应付商单（对公）',
    key: 'performanceInStatusCount',
    value: 'offlinePayCorType',
  },
  {
    label: '线下应付商单（对私）',
    key: 'performedStatusCount',
    value: 'offlinePayPriType',
  },
  {
    label: '线下应收商单',
    key: 'auditedAccountsOrderCount',
    value: 'offlineRecType',
  },
]
export const STATUS_LIST_CONFIG = [
  {
    label: '履约中',
    value: '1',
  },
  {
    label: '待申请付款',
    value: '2',
  },
  {
    label: '付款审批中',
    value: '3',
  },
  {
    label: '付款申请已通过',
    value: '4',
  },
  {
    label: '付款申请不通过',
    value: '5',
  },
  {
    label: '取消合作',
    value: '6',
  },
]
export const RE_STATUS_LIST_CONFIG = [
  {
    label: '待申请开票',
    value: '1',
  },
  {
    label: '开票审批中',
    value: '2',
  },
  {
    label: '开票审批不通过',
    value: '3',
  },
  {
    label: '待填写回款日期',
    value: '4',
  },
  {
    label: '待客户回款',
    value: '5',
  },
  {
    label: '回款审批中',
    value: '6',
  },
  {
    label: '回款审批已通过',
    value: '7',
  },
  {
    label: '回款审批不通过',
    value: '8',
  },
  {
    label: '取消合作',
    value: '9',
  },
]

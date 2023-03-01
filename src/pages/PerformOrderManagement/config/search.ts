// import type { OptionProps } from 'antd/es/select';
import type { SearchGroupConfigItemType } from 'src/components/Search/Search'

export const orderTypeList = [
  {
    label: '视频工单',
    id: '1',
  },
  {
    label: '特殊工单',
    id: '2',
  },
]

export const placeList = [
  {
    label: '未下单',
    id: '0',
  },
  {
    label: '已下单',
    id: '1',
  },
]
export const quotationTypeList = [
  {
    label: '客户自行下单',
    value: '1',
  },
  {
    label: '代客下单',
    value: '2',
  },
  {
    label: '平台营收',
    value: '3',
  },
  {
    label:'不走平台的私单',
    value: '4',
  },
]
export const overTimeTypeList = [
  {
    label: '未超时',
    value: '0',
  },
  {
    label: '即将超时',
    value: '1',
  },
  {
    label: '已超时',
    value: '2',
  },
]

export const performanceDelayTypeList = [
  {
    label: '是',
    value: '1',
  },
  {
    label: '否',
    value: '0',
  },
]

export const SEARCH_LIST: SearchGroupConfigItemType[] = [
  {
    label: '订单筛选',
    config: [
      {
        type: "cascader",
        key: "performId",
        data: [],
        conf: { 
          expandTrigger: 'hover',
          changeOnSelect: true,
          placeholder: "执行人小组/执行人",
        },
      },
      {
        type: "cascader",
        key: "crmGroup",
        data: [],
        conf: { 
          expandTrigger: 'hover',
          changeOnSelect: true,
          placeholder: "商务团队/小组/创建人",
        },
      },
      {
        type: "cascader",
        key: "belongId",
        data: [],
        conf: { 
          placeholder: "内容团队筛选",
          expandTrigger: 'hover',
          changeOnSelect: true,
          skiponestep: true,
        },
      },
      {
        type: "select",
        key: "orderType",
        data: orderTypeList,
        conf: { 
          placeholder: "订单类型",
          showSearch: false,
          labelInValue: true,
        },
      },
      {
        type: "select",
        key: "platIds",
        data: [],
        conf: { 
          placeholder: "平台",
          labelInValue: true,
          multiple:true,
        },
        optionLabelKey: "platName",
        optionValKey: "platId",
      },
      {
        type: "longSelect",
        key: "accountName",
        data: [],
        conf: { 
          placeholder: "账号名称",
          virtual: true,
          labelInValue: true,
          allowCreate:true,
          // filterOption: (input: string, option: OptionProps) => 
          //   String(option?.accountName).toLowerCase().includes(input.toLowerCase()),
        },
        optionLabelKey: "accountName",
        optionValKey: "accountId",
      },
      {
        type: "select",
        key: "performDelayFlag",
        data: performanceDelayTypeList,
        conf: { 
          placeholder: "履约延期",
          labelInValue: true,
        },
        optionLabelKey: "label",
        optionValKey: "value",
      },
      {
        type: "longSelect",
        key: "brandId",
        data: [],
        conf: { 
          placeholder: "品牌名称",
          virtual: true,
          labelInValue: true,
          // filterOption: (input: string, option: OptionProps) => 
          //   String(option?.newsContent).toLowerCase().includes(input.toLowerCase()),
        },
        optionLabelKey: "newsContent",
        optionValKey: "id",
      },
      {
        type: "select",
        key: "orderFlag",
        data: placeList,
        conf: { 
          placeholder: "下单状态",
          labelInValue: true,
        },
        optionLabelKey: "label",
        optionValKey: "id",
      },
      {
        type: "select",
        key: "overtimeStatus",
        data: overTimeTypeList,
        conf: { 
          placeholder: "超时情况",
          labelInValue: true,
        },
        optionLabelKey: "label",
        optionValKey: "value",
      },
      {
        type: "select",
        key: "cancelReasonType",
        data: [],
        conf: { 
          placeholder: "取消合作原因分类",
          labelInValue: true,
          multiple:true,
        },
        optionLabelKey: "name",
        optionValKey: "id",
      },
      {
        type: "input",
        key: "orderNoOrBusOrderNo",
        data: [],
        conf: { placeholder: "工单号/商单号"},
        optionLabelKey: "name",
        optionValKey: "id",
      },
    ],
  },
  {
    label: '时间筛选',
    config: [
      {
        type: "rangeDatePicker",
        key: "slotDate",
        label: '档期',
        data: [],
        conf: {
          hasRanges:true,
          placeholder: ['开始时间', '结束时间'], 
        },
      },
      {
        type: "rangeDatePicker",
        key: "addTime",
        label: '视频发布时间',
        data: [],
        conf: {
          hasRanges:true,
          placeholder: ['开始时间', '结束时间'], 
        },
      },
      {
        type: "rangeDatePicker",
        key: "orderTime",
        label: '成单日期',
        data: [],
        conf: {
          hasRanges:true,
          placeholder: ['开始时间', '结束时间'], 
        },
      },
    ],
  },
]

export default {}
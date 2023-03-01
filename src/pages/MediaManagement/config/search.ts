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

export const paymentResultList = [
  {
    label: '已付款',
    id: '1',
  },
  {
    label: '未付款',
    id: '2',
  },
]

export const collectionResultList = [
  {
    label: '已收款',
    id: '1',
  },
  {
    label: '未收款',
    id: '2',
  },
]

export const contentAssistList = [
  {
    label: '是',
    id: '1',
  },
  {
    label: '否',
    id: '0',
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
export const paymentTypeList = [
  {
    label: '应向达人付款',
    id: '1',
  },
  {
    label: '应向达人收款',
    id: '2',
  },
]
export const SEARCH_LIST: SearchGroupConfigItemType[] = [
  {
    label: '订单筛选',
    config: [
      {
        type: "select",
        key: "orderType",
        data: orderTypeList,
        conf: { 
          placeholder: "订单类型",
          showSearch: false,
          multiple: true,
          labelInValue: true,
        },
      },
      {
        type: "cascader",
        key: "shopOrg",
        data: [],
        conf: { 
          expandTrigger: 'hover',
          changeOnSelect: true,
          placeholder: "媒介团队/小组/采买人",
        },
      },
      {
        type: "cascader",
        key: "putOnOrg",
        data: [],
        conf: { 
          expandTrigger: 'hover',
          changeOnSelect: true,
          placeholder: "媒介投放人",
        },
      },
      {
        type: "select",
        key: "platIds",
        data: [],
        conf: { 
          placeholder: "平台",
          multiple:true,
          labelInValue: true,
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
        type: "longSelect",
        key: "brandId",
        data: [],
        conf: { 
          placeholder: "品牌名称",
          virtual: true,
          labelInValue: true,
          // filterOption: (input: string, option: OptionProps) => 
          //   String(option?.brandName).toLowerCase().includes(input.toLowerCase()),
        },
        optionLabelKey: "newsContent",
        optionValKey: "id",
      },
      {
        type: "select",
        key: "paymentType",
        data: [],
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
        conf: { 
          placeholder: "收付款类型",
          showSearch: false,
          labelInValue: true,
        },
      },
      {
        type: "select",
        key: "paymentResult",
        data: collectionResultList,
        conf: { 
          placeholder: "收款状态",
          showSearch: false,
          labelInValue: true,
        },
      },
      {
        type: "select",
        key: "collectionResult",
        data: paymentResultList,
        conf: { 
          placeholder: "付款状态",
          showSearch: false,
          labelInValue: true,
        },
      },
      {
        type: "cascader",
        key: "crmGroup",
        data: [],
        conf: { 
          placeholder: "商务团队/创建人",
          expandTrigger: 'hover',
          changeOnSelect: true,
        },
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
        type: "select",
        key: "taskIdStatus",
        data: [],
        conf: { 
          placeholder: "平台下单价校验结果",
          labelInValue: true,
        },
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
      },
      {
        type: "input",
        key: "orderNum",
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
        key: "monthMoney",
        label: '绩效月',
        data: [],
        conf: {
          placeholder: ['开始时间', '结束时间'], 
          picker: "month",
          format: 'YYYY-MM',
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
      {
        type: "rangeDatePicker",
        key: "specialCompleteTime",
        label: "特殊工单履约时间",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
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
    ],
  },
]

export default {}
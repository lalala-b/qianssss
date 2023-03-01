// import type { OptionProps } from 'antd/es/select';
import type { SearchGroupConfigItemType } from 'src/components/Search/Search'
// import {paymentResultList,refundList} from './status'
import { receiveList } from './status'

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
const PERFORMANCE_STATUS_ARR = [
  { val: 0, label: "履约中" },
  { val: 1, label: "已履约" },
];
export const SEARCH_LIST: SearchGroupConfigItemType[] = [
  {
    label: '商单筛选',
    config: [
      {
        type: "cascader",
        key: "createId",
        data: [],
        conf: { 
          placeholder: "商务团队/创建人",
          expandTrigger: 'hover',
          changeOnSelect: true,
        },
      },
      {
        type: "select",
        key: "executeGroupId",
        data: [],
        conf: { 
          placeholder: "执行人小组",
          labelInValue: true,
        },
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
      },
      {
        type: "select",
        key: "busOrderTypes",
        data: [],
        conf: { 
          placeholder: "商单类型",
          labelInValue: true,
          multiple:true,
        },
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
      },
      {
        type: "select",
        key: "specialPerformStatus",
        data: PERFORMANCE_STATUS_ARR,
        conf: { 
          placeholder: "履约状态",
          labelInValue: true,
          showSearch: false,
        },
        optionLabelKey: "label",
        optionValKey: "val",
      },
      {
        type: "cascader",
        key: "oppoFromId",
        data: [],
        conf: {
          placeholder: "商机来源",
          expandTrigger: "hover",
          changeOnSelect: true,
          // fieldNames: {
          //   label: "fromName",
          //   value: "id",
          //   children: "child",
          // },
        },
      },
      {
        type: "select",
        key: "opCoType",
        data: [],
        optionLabelKey: "name",
        optionValKey: "id",
        conf: {
          placeholder: "商机合作类型",
          labelInValue: true,
        },
      },
      {
        type: "longSelect",
        key: "companyId",
        data: [],
        conf: { 
          placeholder: "客户",
          virtual: true,
          labelInValue: true,
          // filterOption: (input: string, option: OptionProps) => 
          //   String(option?.companyName).toLowerCase().includes(input.toLowerCase()),
        },
        optionLabelKey: "companyName",
        optionValKey: "companyId",
      },
      {
        type: "cascader",
        key: "coCateId",
        data: [],
        conf: { 
          expandTrigger: 'hover',
          changeOnSelect: true,
          placeholder: "产品品类",
        },
      },
      {
        type: "longSelect",
        key: "brandId",
        data: [],
        conf: { 
          placeholder: "品牌",
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
        key: "coProduct",
        data: [],
        optionLabelKey: "label",
        optionValKey: "id",
        conf: { 
          placeholder: "合作产品名称",
          labelInValue: true,
        },
      },
      {
        type: "input",
        key: "busOrderNo",
        data: [],
        conf: { placeholder: "商单号"},
        optionLabelKey: "name",
        optionValKey: "id",
      },
      // {
      //   type: "select",
      //   key: "customerPaymentResultType",
      //   data: paymentResultList,
      //   conf: { 
      //     placeholder: "客户线下补款情况",
      //     showSearch: false,
      //     labelInValue: true,
      //   },
      // },
      // {
      //   type: "select",
      //   key: "ourCompanyPaymentResultType",
      //   data: refundList,
      //   conf: { 
      //     placeholder: "我们线下返款情况",
      //     showSearch: false,
      //     labelInValue: true,
      //   },
      // },
      {
        type: "select",
        key: "customerPaymentResultType",
        data: receiveList,
        conf: { 
          placeholder: "客户回款状态",
          showSearch: false,
          labelInValue: true,
        },
      },
    ],
  },
  {
    label: '时间筛选',
    config: [
      {
        type: "rangeDatePicker",
        key: "orderTime",
        label: '商单成单日期',
        data: [],
        conf: {
          hasRanges:true,
          placeholder: ['开始时间', '结束时间'], 
        },
      },
      // {
      //   type: "rangeDatePicker",
      //   key: "businessOrderTime",
      //   label: '创建时间',
      //   data: [],
      //   conf: {
      //     hasRanges:true,
      //     placeholder: ['开始时间', '结束时间'], 
      //   },
      // },
      {
        type: "rangeDatePicker",
        key: "customerTradeTime",
        label: '回款截止日期',
        data: [],
        conf: {
          hasRanges:true,
          placeholder: ['开始时间', '结束时间'], 
        },
      },
    ],
  },
]

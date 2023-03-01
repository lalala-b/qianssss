// import type { OptionProps } from 'antd/es/select';
import type { SearchGroupConfigItemType } from "src/components/Search/Search";

export const orderTypeList = [
  {
    label: "视频工单",
    id: "1",
  },
  {
    label: "特殊工单",
    id: "2",
  },
];

export const projectType = [
  {
    label: "海盗订单",
    id: "1",
  },
  {
    label: "达人私单（分成）",
    id: "2",
  },
  {
    label: "达人私单（不分成）",
    id: "3",
  },
]

export const paymentResultList = [
  {
    label: "已付款",
    id: "1",
  },
  {
    label: "未付款",
    id: "2",
  },
];

export const collectionResultList = [
  {
    label: "已收款",
    id: "1",
  },
  {
    label: "未收款",
    id: "2",
  },
];
export const contentAssistList = [
  {
    label: "需要",
    id: "1",
  },
];
export const quotationTypeList = [
  {
    label: "客户自行下单",
    value: "1",
  },
  {
    label: "代客下单",
    value: "2",
  },
  {
    label: "平台营收",
    value: "3",
  },
  {
    label: "不走平台的私单",
    value: "4",
  },
];
export const SEARCH_LIST: SearchGroupConfigItemType[] = [
  {
    label: "订单筛选",
    config: [
      {
        type: "select",
        key: "projectType",
        data: [],
        conf: {
          placeholder: "订单类型",
          showSearch: false,
          // multiple: true,
          labelInValue: true,
        },
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
      },
      {
        type: "cascader",
        key: "signGroup",
        data: [],
        conf: {
          expandTrigger: "hover",
          changeOnSelect: true,
          placeholder: "签约团队/小组/经纪人",
        },
      },
      {
        type: "select",
        key: "platIds",
        data: [],
        conf: {
          placeholder: "平台",
          labelInValue: true,
          multiple: true,
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
          allowCreate: true,
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
          placeholder: "商务团队/小组/创建人",
          expandTrigger: "hover",
          changeOnSelect: true,
        },
      },
      {
        type: "input",
        key: "cooperOrderNo",
        data: [],
        conf: { placeholder: "工单号" },
        optionLabelKey: "name",
        optionValKey: "id",
      },
    ],
  },
  {
    label: "时间筛选",
    config: [
      {
        type: "rangeDatePicker",
        key: "finishTime",
        label: "已定档期",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
        },
      },
      {
        type: "rangeDatePicker",
        key: "monthMoney",
        label: "绩效月",
        data: [],
        conf: {
          placeholder: ["开始时间", "结束时间"],
          picker: "month",
          format: "YYYY-MM",
        },
      },
    ],
  },
];

export default {};

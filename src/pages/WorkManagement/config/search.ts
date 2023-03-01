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
export const paymentTypeList = [
  {
    label: "应向达人付款",
    id: "1",
  },
  {
    label: "应向达人收款",
    id: "2",
  },
];
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
    label: "是",
    id: "1",
  },
  {
    label: "否",
    id: "0",
  },
];
export const receiptStatusList = [
  {
    label: "是",
    id: "1",
  },
  {
    label: "否",
    id: "0",
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
        type: "cascader",
        key: "belongId",
        data: [],
        conf: {
          expandTrigger: "hover",
          changeOnSelect: true,
          placeholder: "订单归属",
          skiponestep: true,
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
        type: "cascader",
        key: "performId",
        data: [],
        conf: {
          expandTrigger: "hover",
          changeOnSelect: true,
          placeholder: "执行小组/执行人",
        },
      },
      {
        type: "select",
        key: "busOrderType",
        data: [],
        conf: {
          placeholder: "商单类型",
          labelInValue: true,
        },
        optionLabelKey: "dictLabel",
        optionValKey: "dictValue",
      },
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
        type: "select",
        key: "paymentType",
        data: paymentTypeList,
        conf: {
          placeholder: "收付款类型",
          showSearch: false,
          labelInValue: true,
        },
      },
      {
        type: "select",
        key: "collectionResult",
        data: collectionResultList,
        conf: {
          placeholder: "收款状态",
          showSearch: false,
          labelInValue: true,
        },
      },
      {
        type: "select",
        key: "paymentResult",
        data: paymentResultList,
        conf: {
          placeholder: "付款状态",
          showSearch: false,
          labelInValue: true,
        },
      },
      {
        type: "select",
        key: "receiptStatus",
        data: receiptStatusList,
        conf: {
          showSearch: false,
          labelInValue: true,
          placeholder: "是否已开发票",
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
          //   String(option?.newsContent).toLowerCase().includes(input.toLowerCase()),
        },
        optionLabelKey: "newsContent",
        optionValKey: "id",
      },
      {
        type: "cascader",
        key: "coCate",
        data: [],
        conf: {
          expandTrigger: "hover",
          changeOnSelect: true,
          placeholder: "合作产品品类",
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
        key: "orderNoOrBusOrderNo",
        data: [],
        conf: { placeholder: "工单号/商单号" },
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
        key: "createTime",
        label: "工单创建时间",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
        },
      },
      {
        type: "rangeDatePicker",
        key: "addTime",
        label: "视频发布时间",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
        },
      },
      {
        type: "rangeDatePicker",
        key: "orderTime",
        label: "成单日期",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
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
        key: "publishDate",
        label: "档期",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
        },
      },
    ],
  },
];

export default {};
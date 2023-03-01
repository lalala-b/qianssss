// import type { OptionProps } from 'antd/es/select';
import type { SearchGroupConfigItemType } from "src/components/Search/Search";

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
    label: "商机筛选",
    config: [
      {
        type: "input",
        key: "opNo",
        data: [],
        conf: {
          placeholder: "商机号",
        },
      },
      {
        type: "input",
        key: "planNo",
        data: [],
        conf: {
          placeholder: "方案号",
        },
      },
      {
        type: "cascader",
        key: "charger",
        data: [],
        conf: {
          expandTrigger: "hover",
          changeOnSelect: true,
          placeholder: "商机负责人",
          // fieldNames: {
          //   label: "orgName",
          //   value: "id",
          //   children: "childOrgList",
          // },
        },
      },
      {
        type: "longCascader",
        key: "customerId",
        data: [],
        conf: {
          expandTrigger: "click",
          changeOnSelect: true,
          placeholder: "客户/客户联系人",
          dropdownClassName: "businessOppoCascader",
          // fieldNames: { label: "companyName", value: "companyId" },
          childFieldName: {
            label: "customerName",
            value: "customerId",
            secondLabel: "crmName",
          },
        },
        optionLabelKey: "companyName",
        optionValKey: "companyId",
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
          placeholder: "合作产品",
          labelInValue: true,
        },
      },
      {
        type: "cascader",
        key: "coCate",
        data: [],
        conf: {
          expandTrigger: "hover",
          changeOnSelect: true,
          placeholder: "产品品类",
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
        type: "input",
        key: "opDescription",
        data: [],
        conf: {
          placeholder: "需求描述",
        },
        optionLabelKey: "name",
        optionValKey: "id",
      },
      {
        type: "select",
        key: "platIds",
        data: [],
        optionLabelKey: "platName",
        optionValKey: "platId",
        conf: {
          placeholder: "推荐账号平台",
          multiple: true,
          labelInValue: true,
        },
      },
      {
        type: "longSelect",
        key: "accountId",
        data: [],
        optionLabelKey: "accountName",
        optionValKey: "accountId",
        conf: {
          placeholder: "推荐账号",
          virtual: true,
          labelInValue: true,
          allowCreate:true,
        },
      },
    ],
  },
  {
    label: "时间筛选",
    config: [
      {
        type: "rangeDatePicker",
        key: "createTime",
        label: "创建时间",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
        },
      },
    ],
  },
];

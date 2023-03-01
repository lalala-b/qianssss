/* eslint-disable import/prefer-default-export */
import type { SearchGroupConfigItemType } from "src/components/Search/Search";

export const SEARCH_LIST: SearchGroupConfigItemType[] = [
  {
    label: "任务筛选",
    config: [
      {
        type: "input",
        key: "pid",
        data: [],
        conf: { placeholder: "父任务ID" },
        optionLabelKey: "name",
        optionValKey: "id",
      },
      {
        type: "input",
        key: "opNo",
        data: [],
        conf: { placeholder: "所属商机号" },
        optionLabelKey: "name",
        optionValKey: "id",
      },
      {
        type: "cascader",
        key: "charger",
        data: [],
        conf: {
          placeholder: "商机负责人",
          expandTrigger: "hover",
          changeOnSelect: true,
        },
      },
      {
        type: "cascader",
        key: "taskFollower",
        data: [],
        conf: {
          placeholder: "任务跟进人",
          expandTrigger: "click",
          changeOnSelect: true,
        },
      },

      {
        type: "select",
        key: "taskStatus",
        data: [],
        conf: {
          placeholder: "任务状态",
          labelInValue: true,
        },
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
        key: "Time",
        label: "最近更新时间",
        data: [],
        conf: {
          hasRanges: true,
          placeholder: ["开始时间", "结束时间"],
        },
      },
    ],
  },
];

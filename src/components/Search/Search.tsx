/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-types */
import { ChangeEvent, useMemo } from "react";
import cs from "classnames";
import { Select, Input, Button, Space, Cascader, DatePicker, Tag } from "antd";
import type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";
import LSelect from "src/components/BigDataSelect";
import LCascader from "src/components/BigDataCascader";
import moment from "moment";
// 解决日期中文问题
import locale from "antd/lib/date-picker/locale/zh_CN";
import styles from "./Search.scss";
import "moment/locale/zh-cn";

moment.locale("zh-cn");
const { Option } = Select;

export interface SearchConfigItemPropsType {
  type: string;
  data?: any[];
  key: string;
  label?: string;
  optionValKey?: string;
  optionLabelKey?: string;
  conf?: {
    size?: "large" | "middle" | "small";
    showArrow?: boolean;
    closeSearch?: boolean;
    closeClear?: boolean;
    multiple?: boolean;
    placeholder?: string | string[];
    disabled?: boolean;
    [prop: string]: any;
  };
  className?: string;
}

export interface SearchGroupConfigItemType {
  label: string;
  config: SearchConfigItemPropsType[];
}

interface SearchPropsType {
  searchData: any;
  config: SearchConfigItemPropsType[] | SearchGroupConfigItemType[];
  showCondition?: boolean;
  onChange: React.Dispatch<React.SetStateAction<{}>>;
  onCloseFilterTagItem?: (key: string) => void;
  onClearFilter?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  afterSearch?: JSX.Element | number | string;
  groupClassName?: string;
}

const Search: React.FC<SearchPropsType> = ({
  searchData,
  config,
  showCondition,
  children,
  onSearch,
  onExport,
  onChange,
  onCloseFilterTagItem,
  onClearFilter,
  afterSearch,
  groupClassName,
}) => {
  // 计算筛选条件值
  const configMap: {
    [prop: string]: SearchConfigItemPropsType;
  } = useMemo(() => {
    const result: {
      [prop: string]: SearchConfigItemPropsType;
    } = {};

    config.forEach(item => {
      const { config } = item as SearchGroupConfigItemType;
      const singleItem = item as SearchConfigItemPropsType;

      const handlerConfigList = (info: SearchConfigItemPropsType) => {
        const { key } = info;

        result[key] = info;
      };

      if (config) {
        config.forEach(configItem => {
          handlerConfigList(configItem);
        });
      } else {
        handlerConfigList(singleItem);
      }
    });

    return result;
  }, [config]);

  type FilterListType = {
    title?: string | string[];
    label?: string;
    value: any;
    key: string;
    type: string;
    conf?: any;
  };

  type HandleFilterResType = {
    showValue: any;
    sendParams: any;
  };

  const handleSelectData: (value: any) => HandleFilterResType = value => {
    const showValue: string[] = [];
    const sendParams: string | number[] = [];

    if (typeof value === "object") {
      let result: any[] = [];

      if (Array.isArray(value)) {
        result = value;
      } else {
        result = [value];
      }

      result.forEach(item => {
        const { label, value } = item || {};

        showValue.push(label || "");
        sendParams.push(value);
      });
    }

    return {
      showValue: showValue.join(","),
      sendParams: sendParams.length <= 1 ? sendParams.join("") : sendParams,
    };
  };

  const handleCascaderData: (
    value: string[] | number[],
    configInfo: SearchConfigItemPropsType["data"]
  ) => HandleFilterResType = (value = [], configInfo = []) => {
    let showValue = "";
    const sendParams: any[] = [];

    if (!configInfo) {
      showValue = "";
    } else {
      let templateConfig = configInfo;
      const result: string | number[] = [];

      value.forEach(valueItem => {
        const current = templateConfig.find(templateConfigItem => {
          const { value } = templateConfigItem;

          return value === valueItem;
        });

        sendParams.push(current);

        if (current) {
          const { children, label } = current;

          result.push(label);
          templateConfig = children;
        }
      });

      showValue = result.join("/");
    }

    return {
      showValue,
      sendParams,
    };
  };

  // 处理日期时间筛选条件展示信息
  const handleDatePicker: (
    value: any,
    format: string
  ) => HandleFilterResType = (value, format = "YYYY-MM-DD") => {
    let showValue = "";
    let sendParams: string | string[] = "";
    const formatTime = (item: any) => item.format(format);

    if (value) {
      let result = [];

      try {
        if (Array.isArray(value)) {
          result = value;
          sendParams = result.map(item => formatTime(item));
          showValue = sendParams.join("-");
        } else {
          showValue = formatTime(value);
          sendParams = showValue;
        }
      } catch (err) {
        console.info(err);
      }
    }

    return {
      sendParams,
      showValue,
    };
  };

  // 筛选条件列表，已经处理了显示内容
  const filterList: FilterListType[] = useMemo(() => {
    const result: FilterListType[] = [];
    const handleFilterListValue: any = (
      value: any,
      configInfo: SearchConfigItemPropsType
    ) => {
      const { type, key } = configInfo || {};

      if (type === "select" || type === "longSelect") {
        return handleSelectData(value);
      }

      if (type === "input") {
        return {
          showValue: value,
          sendValue: value,
        };
      }

      if (type === "cascader") {
        return handleCascaderData(value, configInfo.data);
      }

      if (type === "rangeDatePicker" || type === "datePicker") {
        return handleDatePicker(
          value,
          key === "monthMoney" ? "YYYY-MM" : "YYYY-MM-DD"
        );
      }

      return "";
    };

    Object.keys(searchData || {}).forEach(key => {
      const currentValue = searchData[key];
      const currentConfig = configMap[key];

      if (currentConfig && currentValue) {
        if (Array.isArray(currentValue) && currentValue.length === 0) {
          return;
        }

        const { label, conf, type } = currentConfig;
        const { placeholder } = conf || {};

        result.push({
          title: label || placeholder || "",
          type,
          key,
          conf,
          value: handleFilterListValue(currentValue, currentConfig)?.showValue,
        });
      }
    });

    return result;
  }, [searchData, configMap]);

  /**
   * 组件改变时执行的函数
   * @param key 需要操作的key
   * @param value  需要操作的key的值
   */
  const handleChange = (key: string, value: any) => {
    const changeData = { ...searchData };

    changeData[key] = value;
    onChange(changeData);
  };

  const handleCloseFilterTagItem = (key: string) => {
    if (onCloseFilterTagItem) {
      onCloseFilterTagItem(key);
      return;
    }

    if (!key) {
      return;
    }

    const newSearchData = { ...searchData };
    delete newSearchData[key];
    onChange(newSearchData);
  };
  
  const handleClearFilter = () => {
    if (onClearFilter) {
      onClearFilter();
      return;
    }
    const newSearchData = { ...searchData };

    filterList.forEach(({ key }) => {
      delete newSearchData[key];
    })

    onChange(newSearchData);
  }

  // 选择组件
  const loadSelect = (item: SearchConfigItemPropsType) => {
    const handleChangeSelect = (e: string | number | string[] | number[]) => {
      handleChange(item.key, e);
    };
    const {
      conf = {},
      className = "",
      data,
      optionLabelKey,
      optionValKey,
      key,
    } = item;
    const {
      multiple,
      mode,
      allowClear = true,
      placeholder,
      disabled,
      showSearch = true,
    } = conf || {};

    return (
      <Select
        {...conf}
        className={cs(styles.item, styles.select, className)}
        mode={multiple ? "multiple" : mode || ""}
        value={searchData[key]}
        onChange={handleChangeSelect}
        // loading={!(data || []).length}
        optionFilterProp="children"
        showSearch={showSearch}
        allowClear={allowClear}
        placeholder={placeholder || "请选择"}
      >
        {(data || []).map(it => (
          <Option
            key={it[optionValKey || "id"]}
            value={it[optionValKey || "id"]}
            disabled={disabled}
          >
            {it[optionLabelKey || "label"]}
          </Option>
        ))}
      </Select>
    );
  };

  // 长列表选择组件
  const loadLongSelect = (item: SearchConfigItemPropsType) => {
    // console.info(item?.data, 'item?.data')
    const handleChangeSelect = (e: string | number | string[] | number[]) => {
      handleChange(item.key, e);
    };
    const {
      conf = {},
      className = "",
      optionLabelKey,
      optionValKey,
      key,
    } = item;
    const { placeholder } = conf || {};
    // 如果是输入的账号名称，则账号筛选key为optionNamekey
    const getOptionName = (val: string) => {
      const changeData = Object.assign({}, searchData);
      changeData.optionNamekey = val;
      onChange(changeData);
    };
    const { platIds = [], plaId = "" } = searchData;
    return (
      <LSelect
        {...conf}
        className={cs(styles.item, styles.select, className)}
        platId={platIds || plaId}
        value={searchData[key]}
        onChange={handleChangeSelect}
        // bigDataLoading={!(item?.data || []).length}
        dataList={item?.data || []}
        getOptionName={getOptionName}
        fieldNames={{
          label: optionLabelKey || "label",
          value: optionValKey || "id",
        }}
        scrollPageSize={50}
        placeholder={String(placeholder) || "请选择"}
      />
    );
  };

  // input 组件
  const loadInput = (item: SearchConfigItemPropsType) => {
    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
      // 去除input两头空格
      const str = e.target.value
        ? e.target.value.replace(/^\s+|\s+$/g, "")
        : "";
      handleChange(item.key, str);
    };

    const { conf = {}, className = "", key } = item;
    const { allowClear = true, placeholder } = conf || {};

    return (
      <Input
        {...conf}
        className={cs(styles.item, styles.input, className)}
        value={searchData[key]}
        allowClear={allowClear}
        placeholder={(placeholder as string) || "请输入"}
        onChange={handleChangeInput}
      />
    );
  };

  // 级联组件
  const loadCascader = (item: SearchConfigItemPropsType) => {
    const { conf = {}, data, className = "", key } = item;
    const { allowClear = true, placeholder, showSearch = true, skiponestep = false } = conf || {};

    const handleChangeCascader = (value: any, selectOption: any) => {
        // console.info(selectOption)
        // 当设置了跳过第一级选择的属性 且 当前选中值的长度为1 且 该parentId为null
        if (skiponestep && (value || []).length === 1 && selectOption[0].parentId === null) {
          handleChange(item.key, [])
        } else {
          handleChange(item.key, value);
        }
    };

    const confTemp = {...conf}
    delete confTemp.skiponestep

    return (
      <Cascader
        {...confTemp}
        options={data}
        className={cs(styles.item, styles.cascader, className)}
        value={searchData[key]}
        allowClear={allowClear}
        showSearch={showSearch}
        placeholder={placeholder || "请输入"}
        onChange={handleChangeCascader}
      />
    );
  };

  // 长列表级联组件
  const loadLongCascader = (item: SearchConfigItemPropsType) => {
    const handleChangeCascader = (e: any) => {
      handleChange(item.key, e);
    };
    const {
      conf = {},
      className = "",
      optionLabelKey,
      optionValKey,
      key,
    } = item;
    const { placeholder, dropdownClassName } = conf || {};
    // 如果是输入的账号名称，则账号筛选key为optionNamekey
    // const getOptionName = (val:string)=>{
    //   const changeData = Object.assign({},searchData);
    //   changeData.optionNamekey = val;
    //   onChange(changeData)
    // }
    // const {platIds=[],plaId=''} = searchData;
    return (
      <LCascader
        {...conf}
        className={cs(styles.item, styles.cascader, className)}
        // platId={platIds||plaId}
        value={searchData[key]}
        onChange={handleChangeCascader}
        // bigDataLoading={!(item?.data || []).length}
        dataList={item?.data || []}
        dropdownClassName={dropdownClassName}
        // getOptionName={getOptionName}
        fieldNames={{
          label: optionLabelKey || "label",
          value: optionValKey || "id",
        }}
        scrollPageSize={50}
        placeholder={String(placeholder) || "请选择"}
      />
    );
  };

  // 日期选择组件
  const loadDatePicker = (item: SearchConfigItemPropsType) => {
    const handleChangeInput = (
      value: DatePickerProps["value"] | RangePickerProps["value"]
    ) => {
      handleChange(item.key, value);
    };

    const { conf = {}, key, className = "" } = item;
    const { allowClear = true, placeholder } = conf || {};

    return (
      <DatePicker
        {...conf}
        placeholder={(placeholder as string) || "请输入"}
        className={cs(styles.item, styles.datepicker, className)}
        format="YYYY-MM-DD"
        allowClear={allowClear}
        value={searchData[key]}
        onChange={handleChangeInput}
        locale={locale}
      />
    );
  };

  // 日期范围选择组件
  const loadRangeDatePicker = (item: SearchConfigItemPropsType) => {
    const handleChangeInput = (
      value: DatePickerProps["value"] | RangePickerProps["value"]
    ) => {
      handleChange(item.key, value);
    };

    const { RangePicker } = DatePicker;

    const { conf = {}, className = "", key } = item;
    const cloneConf: any = JSON.parse(JSON.stringify(item.conf));
    const { allowClear = true, placeholder } = conf || {};

    const { rangesConf = {}, hasRanges = false } = cloneConf;

    Object.keys(rangesConf).forEach(
      item =>
        (rangesConf[item] = rangesConf[item].map((item1: any) => moment(item1)))
    );

    const ranges = Object.assign(
      {
        今日: [moment(), moment()],
        昨日: [
          moment().subtract(1, "day").startOf("day"),
          moment().subtract(1, "day").endOf("day"),
        ],
        本周: [moment().startOf("week"), moment().endOf("week")],
        上周: [
          moment().subtract(1, "week").startOf("week"),
          moment().subtract(1, "week").endOf("week"),
        ],
        本月: [moment().startOf("month"), moment().endOf("month")],
        上月: [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      rangesConf
    );

    return (
      <RangePicker
        {...cloneConf}
        ranges={hasRanges ? ranges : {}}
        className={cs(styles.rangePicker, styles.item, className)}
        placeholder={(placeholder as string[]) || ["选择日期", "选择日期"]}
        value={searchData[key]}
        allowClear={allowClear}
        locale={locale}
        onChange={handleChangeInput}
      />
    );
  };

  const loadComponent = (item: SearchConfigItemPropsType) => {
    const { type } = item;
    if (type === "select") {
      return loadSelect(item);
    }

    if (type === "longSelect") {
      return loadLongSelect(item);
    }

    if (type === "input") {
      return loadInput(item);
    }

    if (type === "cascader") {
      return loadCascader(item);
    }

    if (type === "longCascader") {
      return loadLongCascader(item);
    }

    if (type === "datePicker") {
      return loadDatePicker(item);
    }

    if (type === "rangeDatePicker") {
      return loadRangeDatePicker(item);
    }

    return null;
  };

  return (
    <div className={styles.root}>
      {config.map(item => {
        const groupConfig = item as SearchGroupConfigItemType;
        const singleConfig = item as SearchConfigItemPropsType;
        return groupConfig.config ? (
          <div className={styles.groupBox} key={groupConfig.label}>
            <div className={styles.spaceBox}>
              <div className={styles.groupBoxLabel}> {groupConfig.label} </div>
              <div className={styles.formComponentBox}>
                {(groupConfig.config || []).map(configGroupItem => (
                  <div
                    key={configGroupItem.key}
                    className={styles.groupBoxItem}
                  >
                    {configGroupItem.label && (
                      <span>
                        {configGroupItem.label
                          ? `${configGroupItem.label}:`
                          : ""}
                      </span>
                    )}
                    {loadComponent(configGroupItem)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div key={singleConfig.key} className={styles.fragmentBox}>
            <span>{singleConfig.label ? `${singleConfig.label}:` : ""}</span>
            {loadComponent(singleConfig)}
          </div>
        );
      })}
      {!!showCondition && !!filterList.length && (
        <Space style={{ marginBottom: 12 }}>
          <div className={styles.condition}>筛选条件</div>
          <div>
            {filterList.map(item => {
              const { key, title, value } = item;

              return (
                <Tag
                  closable
                  key={key}
                  onClose={e => {
                    e.preventDefault();
                    handleCloseFilterTagItem(item?.key);
                  }}
                >
                  {title}: {value}
                </Tag>
              );
            })}
            <Button type="link" onClick={handleClearFilter}>
              清空
            </Button>
          </div>
        </Space>
      )}
      {children}
      <div className={cs(styles.toolsBox, groupClassName)}>
        <Space>
          {onSearch && (
            <Space wrap>
              <Button type="primary" onClick={onSearch} className="m-l-6">
                查询
              </Button>
            </Space>
          )}
          {onExport && (
            <Space wrap>
              <Button type="default" onClick={onExport} className="m-l-6">
                导出
              </Button>
            </Space>
          )}
        </Space>
      </div>
      {afterSearch}
    </div>
  );
};

export default Search;

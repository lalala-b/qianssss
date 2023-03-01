import { useState, useEffect } from "react";
import { Select } from "antd";
// import type { OptionProps } from 'antd/es/select';
import { FieldNamesType } from "antd/lib/cascader";

interface BrandSelectPropsType {
  className?: string;
  dataList: any[];
  placeholder?: string;
  value?: number;
  allowClear?: boolean;
  fieldNames?: FieldNamesType;
  optionLabelProp?: string;
  filter?: (input: string, option: any) => any;
  scrollPageSize?: number;
  onChange: (val: number) => void;
  dropdownRender?: () => JSX.Element;
  [prop: string]: any;
  // bigDataLoading?:boolean;
  allowCreate?: boolean;
  getOptionName?: (val: string) => void;
  platId?: any;
}

const BigDataSelect: React.FC<BrandSelectPropsType> = ({
  className,
  fieldNames,
  allowClear = true,
  optionLabelProp,
  placeholder,
  value,
  dataList = [],
  scrollPageSize = 50,
  // filterOption,
  filter,
  labelInValue = false,
  onChange,
  dropdownRender,
  // bigDataLoading=true,
  allowCreate = false,
  getOptionName,
  platId,
}) => {
  const [inputList, setInputList] = useState<any[]>([]);
  const [optionData, setOptionData] = useState<any[]>([]);
  const [scrollPage, setScrollPage] = useState<number>(1);
  const [keyWords, setKeyWords] = useState<string>("");
  // const data = dataList.slice(0, scrollPageSize);

  // console.info(dataList, 'dataList')

  const fieldLabel = fieldNames?.label || "label";
  const valueId = fieldNames?.value || "value";

  const handleFocus = () => {
    setKeyWords("");
    setOptionData([...dataList]);
    setScrollPage(1);
  };

  const handleBlur = () => {
    // 仅对账号生效，如果label和value的值相同。则为输入
    if (fieldNames && fieldNames.value === "accountId") {
      const obj: any = value;
      if (
        obj &&
        obj instanceof Object &&
        String(obj.label) === String(obj.value)
      ) {
        getOptionName?.("accountName");
      } else {
        getOptionName?.("");
        setInputList([]);
      }
    }
    // setOptionData([...data]);
  };
  const handleOnChange = (val: any) => {
    // console.info("---------", val);
    // 仅对账号生效，如果label和value的值相同。则为输入
    if (fieldNames && fieldNames.value === "accountId") {
      const obj: any = val;
      if (
        obj &&
        obj instanceof Object &&
        String(val.label) === String(val.value)
      ) {
        getOptionName?.("accountName");
      } else {
        getOptionName?.("");
        setInputList([]);
      }
    }
    onChange(val);
  };
  const searchValue = (value: string) => {
    if (value === "") {
      setOptionData([...dataList]);
      return;
    }
    setScrollPage(1);
    let newOptionsData: any[] = [];
    const dataTemp = dataList.filter(
      item => item[fieldLabel].toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    if (value && allowCreate && fieldNames) {
      const obj: any = {};
      obj[fieldNames.label || "label"] = value;
      obj[fieldNames.value || "value"] = value;
      setInputList([obj]);
    }
    // if (dataTemp.length > scrollPageSize || value === "") {
    newOptionsData = dataTemp.slice(0, scrollPageSize);
    // }
    setOptionData([...newOptionsData]);
  };

  const handleSearch = (val: string) => {
    setKeyWords(val);
    searchValue(val);
  };

  const loadOption = (pageIndex: number) => {
    const newPageSize = scrollPageSize * (pageIndex || 1);
    let newOptionsData: any[] = [];
    let len = 0;
    if (dataList.length > newPageSize) {
      len = newPageSize;
    } else {
      len = dataList.length;
    }
    if (keyWords) {
      const dataTemp =
        dataList.filter(item => item[fieldLabel].toLowerCase().indexOf(keyWords.toLowerCase()) > -1) || [];
      if (len > dataTemp.length) {
        len = dataTemp.length;
      }
      newOptionsData = dataTemp.slice(0, len);
    } else {
      newOptionsData = dataList.slice(0, len);
    }
    setOptionData([...newOptionsData]);
  };

  const handleScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
      setScrollPage(scrollPage + 1);
      loadOption(scrollPage + 1);
    }
  };
  // 清空时，将输入的选项清空
  const handleClear = () => {
    setInputList([]);
  };
  
  const filterOption = (input: string, option: any) =>
    String(option[fieldLabel]).toLowerCase().includes(input.toLowerCase());

  useEffect(() => {
    if (!(dataList || []).length) return;
    // if (value) {
    //   const curItemForData = data.find(item => item[valueId] === value);
    //   if (!curItemForData) {
    //     const curItemForDataList = dataList.find(item => item[valueId] === value);
    //     setOptionData(curItemForDataList ? [curItemForDataList, ...data] : [...data]);
    //   } else {
    //     setOptionData([...data]);
    //   }
    // } else {
    //   setOptionData([...data]);
    // }

    const dataTemp = [...dataList];
    if (value) {
      const currentIndex = dataList.findIndex(item => item[valueId] === value);

      // 不是首页
      if (currentIndex > scrollPageSize) {
        const currentItem = dataTemp.splice(currentIndex, 1)[0];
        setOptionData([currentItem, ...dataTemp]);
        return;
      }
    }
    setOptionData([...dataList]);
  }, [dataList, value]);

  // 如果platId发生变化则清空输入的选项
  useEffect(() => {
    setInputList([]);
  }, [platId]);
  
  return (
    <Select
      className={className}
      allowClear={allowClear}
      // loading={bigDataLoading}
      showSearch
      placeholder={placeholder || "请选择"}
      value={value}
      optionFilterProp="children"
      fieldNames={fieldNames}
      options={[
        ...inputList,
        ...optionData.slice(0, scrollPage * scrollPageSize),
      ]}
      onChange={handleOnChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSearch={handleSearch}
      onClear={handleClear}
      // mode="tags"
      // maxTagCount={1}
      labelInValue={labelInValue}
      onPopupScroll={handleScroll}
      filterOption={filter || filterOption}
      optionLabelProp={optionLabelProp}
      getPopupContainer={triggerNode => triggerNode.parentNode}
      dropdownRender={menu => (
        <>
          {menu}
          {dropdownRender && dropdownRender()}
        </>
      )}
    />
  );
};

export default BigDataSelect;

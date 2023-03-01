/* eslint-disable react/no-danger */
import { useState, useEffect } from "react";
import cs from "classnames";
import { Cascader } from "antd";
import { FieldNamesType } from "antd/lib/cascader";
import type { DefaultOptionType } from "antd/es/cascader";
import styles from "./BigDataCascader.scss";

interface BCascaderPropsType {
  className?: string;
  dataList: any[];
  placeholder?: string;
  value?: (number | string)[] | (number | string)[][];
  fieldNames?: FieldNamesType;
  scrollPageSize?: number;
  expandTrigger?: "click" | "hover";
  changeOnSelect?: boolean;
  onlySupportChild?: boolean;
  childFieldName?: {
    label?: string;
    value?: string;
    secondLabel?: string;
  };
  [prop: string]: any;
  dropdownClassName: string;
  filter?: (value: string, path: DefaultOptionType[]) => boolean;
  render?: (value: string, path: DefaultOptionType[]) => JSX.Element;
  onChange: (val: (number | string)[] | (number | string)[][] | "") => void;
}

const BCascader: React.FC<BCascaderPropsType> = ({
  className,
  dataList = [],
  placeholder,
  value,
  fieldNames = {},
  childFieldName = {},
  scrollPageSize = 50,
  expandTrigger,
  changeOnSelect = true,
  onlySupportChild = false,
  dropdownClassName = "",
  filter = null,
  render = null,
  onChange,
}) => {
  let cascaderMenu: any = null;
  const [optionData, setOptionData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSearch, setIsSearch] = useState(false);

  const valueId = fieldNames?.value || "value";
  const fieldLabel = fieldNames?.label || "label";
  const childFieldLabel = childFieldName?.label || "label";
  const childValueId = childFieldName?.value || "value";
  const childFieldSecondLabel = childFieldName?.secondLabel || "label";

  const displayRender = (labelArr: any, selectedOptions: any) => {
    let newLabel = labelArr || [];
    let isNumberArr = false;
    (labelArr || []).forEach((item: any) => {
      if (typeof item === "number") {
        isNumberArr = true;
      }
    });
    if (isNumberArr) {
      newLabel = dataList.filter(item => item[valueId] === labelArr[0]);
    }
    const firstVal = isNumberArr ? newLabel[0]?.[fieldLabel] : newLabel[0];
    const nextVal =
      labelArr.length > 1
        ? isNumberArr
          ? `${
              newLabel[0]?.children &&
              newLabel[0]?.children.filter(
                (item: any) =>
                  item[childValueId] === labelArr[labelArr.length - 1]
              )[0][childFieldLabel]
            }`
          : `${selectedOptions[selectedOptions.length - 1][childFieldLabel]}`
        : "";

    const label = [firstVal, nextVal]
      .filter(item => item && item !== "undefined")
      .join("/");

    return <span>{`${label || labelArr}`}</span>;
  };

  const handleSearch = (value: string) => {
    if (value) {
      setIsSearch(true);
    } else {
      setIsSearch(false);
    }

    setCurrentPage(1);
    if (value === "") {
      setOptionData([...dataList]);
    }

    const dataTemp = dataList.filter(
      item =>
        item[fieldLabel].indexOf(value) > -1 ||
        (item.children || []).filter(
          (child: any) => child[childFieldLabel].indexOf(value) > -1
        ).length
    );
    // console.info(dataTemp, 'data')
    setOptionData(dataTemp);
  };

  const handleScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
      setTimeout(() => {
        setCurrentPage(prevState => {
          const newState = prevState + 1;
          return newState;
        });
      });
    }
  };

  const handleDropdownVisibleChange = (show: boolean) => {
    if (show) {
      setOpen(true);
      setOptionData([...dataList]);
      setTimeout(() => {
        cascaderMenu = document
          .getElementsByClassName(`${dropdownClassName}`)[0]
          .getElementsByClassName("ant-cascader-menu")[0];
        cascaderMenu.onscroll = handleScroll;
      });
    } else {
      cascaderMenu = document
        .getElementsByClassName(`${dropdownClassName}`)[0]
        .getElementsByClassName("ant-cascader-menu")[0];
      cascaderMenu.onscroll = "";
      cascaderMenu.scrollTop = 0;
      setCurrentPage(1);
      setOpen(false);
    }
  };

  // 搜索过滤
  const defaultFilter = (value: string, path: DefaultOptionType[]) => {
    const parent = path[0]?.[fieldLabel];
    const child = path[1]?.[childFieldLabel];

    return (
      parent?.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
      child?.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
  };

  // 搜索渲染
  const defaultRender = (value: string, path: DefaultOptionType[]) => {
    const parent = path[0]?.[fieldLabel];
    const child = path[1]?.[childFieldLabel];
    const secondChild = path[1]?.[childFieldSecondLabel];

    let hasFlag = false;

    // 设置高亮
    const highLight = (str: string, val: string) => {
      let strTemp = str;
      if (str?.toLowerCase().indexOf(val.toLowerCase()) !== -1) {
        hasFlag = true;
        const arr = str?.split(val) || [];
        const itemOfHandle = `<i class=${styles.redFront}>${val}</i>`;
        strTemp = arr.join(itemOfHandle);
      }
      return strTemp;
    };

    const parentTemp = highLight(parent, value);
    const childTemp = highLight(child, value);

    return (
      <>
        {hasFlag ? (
          <div className={styles.renderItem}>
            <span dangerouslySetInnerHTML={{ __html: `${parentTemp}` }} />{" "}
            {child ? "/" : ""}
            <span dangerouslySetInnerHTML={{ __html: `${childTemp}` }} />
            {secondChild || ""}
          </div>
        ) : (
          ""
        )}
      </>
    );
  };

  useEffect(() => {
    if (!(dataList || []).length) return;

    const valueId = fieldNames?.value || "value";

    const dataTemp = [...dataList];

    if (value?.length) {
      const currentIndex = dataList.findIndex(
        item => item[valueId] === value[0]
      );

      // 不是首页
      if (currentIndex > scrollPageSize) {
        const currentItem = dataTemp.splice(currentIndex, 1)[0];
        setOptionData([currentItem, ...dataTemp]);
        return;
      }
    }

    setOptionData([...dataList]);
  }, [dataList]);

  return (
    <>
      <Cascader
        className={cs(isSearch ? styles.root : "", className)}
        allowClear
        open={open}
        options={optionData.slice(0, currentPage * scrollPageSize)}
        placeholder={placeholder || "请选择"}
        value={value}
        // showSearch={{ limit: currentPage * scrollPageSize }}
        showSearch={{
          limit: currentPage * scrollPageSize,
          filter: filter || defaultFilter,
          render: render || defaultRender,
        }}
        fieldNames={fieldNames}
        getPopupContainer={triggerNode => triggerNode.parentNode}
        onSearch={handleSearch}
        expandTrigger={expandTrigger}
        changeOnSelect={changeOnSelect}
        onChange={val => {
          setIsSearch(false);
          // 针对于要把父级数据搜索出来，但又只能支持选择最后一级的情况
          if (onlySupportChild && val?.length === 1) {
            onChange("");
            return;
          }
          onChange(val);
        }}
        dropdownClassName={dropdownClassName}
        displayRender={displayRender}
        onDropdownVisibleChange={handleDropdownVisibleChange}
      />
    </>
  );
};

export default BCascader;

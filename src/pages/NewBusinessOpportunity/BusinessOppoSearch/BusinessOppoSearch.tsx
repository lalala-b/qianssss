// import { useMemo } from "react";
import { Form, Input, Cascader, Select, Button, Col, Row, Space, Tag } from "antd";
import moment from "moment";
import {
  SearchDataParamsType,
  BusinessOppoFollowersResType,
  BrandListResType,
  GetCustomerNameItemResType,
  OppoFromListType,
} from "src/api/business";
// import type { DatePickerProps } from 'antd';
import { useEffect, useMemo, useState } from "react";
import qs from "qs";
import RangePicker from "../../../components/RangePicker";
import BrandSelect from "../../../components/BigDataSelect";
import BigDataCascader from "../../../components/BigDataCascader";

// 传递给搜索组件的参数
declare interface SearchPropType {
  defaultCharger: number[];
  defaultOpNo: string;
  customerList: GetCustomerNameItemResType[];
  customerTypeList: { id: number; name: string }[];
  coProductList: { id: string; name: string }[];
  coCateList: { id: number; name: string }[];
  businessOppoFollowers: BusinessOppoFollowersResType[];
  brand: BrandListResType[];
  oppoFromList: OppoFromListType[];
  searchData: SearchDataParamsType;
  onSetSearchData: (params: any) => void;
  onGetList: () => void;
}

const Search: React.FC<SearchPropType> = ({
  brand,
  businessOppoFollowers,
  customerTypeList,
  coProductList,
  coCateList,
  customerList,
  oppoFromList,
  searchData,
  defaultCharger,
  defaultOpNo,
  // children,
  onSetSearchData,
  onGetList,
}) => {
  const [form] = Form.useForm();
  const formData: SearchDataParamsType = {
    opNo: "",
    charger: -1,
    customerId: -1,
    brandId: undefined,
    opCoType: undefined,
    createTime: [],
  };
  const { href } = window.location;
  const { $permission } = window;

  const [brandValue, setBrandValue] = useState<number | undefined>(undefined);

  const [customerValue, setCustomerValue] = useState<
    (number | string)[] | (number | string)[][] | undefined
  >(undefined);


  const handleSearch = (val: SearchDataParamsType) => {
    const data = val;
    const { createTime } = val;
    if (createTime?.length) {
      // eslint-disable-next-line no-underscore-dangle
      data.createTimeStart = `${moment(new Date(createTime[0]?._d)).format(
        "YYYY-MM-DD"
      )} 00:00:00`;
      // eslint-disable-next-line no-underscore-dangle
      data.createTimeEnd = `${moment(new Date(createTime[1]?._d)).format(
        "YYYY-MM-DD"
      )} 23:59:59`;
    } else {
      data.createTimeStart = "";
      data.createTimeEnd = "";
    }
    data.charger =
      data.chargerArr && data.chargerArr[data.chargerArr.length - 1];
    data.customerId =
      data.customerIdArr && data.customerIdArr[data.customerIdArr.length - 1];
    data.oppoFromId =
      data.oppoFromIdArr && data.oppoFromIdArr[data.oppoFromIdArr.length - 1];
    delete data.createTime;
    delete data.chargerArr;
    delete data.customerIdArr;
    delete data.oppoFromIdArr;
    onSetSearchData(Object.assign(searchData, data));
    onGetList();
    // console.info(searchData, "searchData2");
  };

  const handleExport = () => {
    window.open(
      `/api/qp/business/opportunity/list?${qs.stringify({
        ...searchData,
        isExport: 1,
      })}`
    );
  };

  const handleChangeBrandId = (val: number) => {
    setBrandValue(val);
    onSetSearchData(Object.assign({...searchData}, {brandId: val}))
  };

  const handleChangeCustomerId = (
    val: (number | string)[] | (number | string)[][]
  ) => {
    setCustomerValue(val);
  };

  useEffect(() => {
    const index = href.indexOf("?");
    if (index === -1) {
      form.setFieldValue("chargerArr", defaultCharger);
    } else {
      form.setFieldValue("chargerArr", []);
    }
  }, [defaultCharger]);

  useEffect(() => {
    form.setFieldValue("opNo", defaultOpNo);
  }, [defaultOpNo]);

  return (
    <Form
      form={form}
      name="businessOpportunityForm"
      initialValues={formData}
      onFinish={handleSearch}
      // onFinishFailed={onFinishFailed}
      scrollToFirstError
      autoComplete="off"
    >
      <Row gutter={24}>
        <Col span={6}>
          <Form.Item name="opNo">
            <Input placeholder="商机号" allowClear />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name="chargerArr">
            <Cascader
              allowClear
              options={businessOppoFollowers}
              fieldNames={{
                label: "orgName",
                value: "id",
                children: "childOrgList",
              }}
              placeholder="商机负责人"
              showSearch
              expandTrigger="hover"
              getPopupContainer={triggerNode => triggerNode.parentNode}
              // onSearch={value => console.log(value)}
              // onChange={handleChangeOppoFollowers}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name="customerIdArr">
            {/* <Cascader
              allowClear
              options={customerList}
              placeholder="客户/客户联系人"
              showSearch
              fieldNames={{ label: "companyName", value: "companyId" }}
              changeOnSelect
              // onChange={handleChangeCustomerId}
            /> */}
            {useMemo(
              () => (
                <BigDataCascader
                  dataList={customerList}
                  placeholder="客户/客户联系人"
                  value={customerValue}
                  // scrollPageSize={50}
                  fieldNames={{ label: "companyName", value: "companyId" }}
                  childFieldName={{
                    label: "customerName",
                    value: "customerId",
                  }}
                  onChange={handleChangeCustomerId}
                />
              ),
              [customerList]
            )}
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name="brandId">
            {/* <Select
                allowClear
                showSearch
                placeholder="品牌"
                value={undefined}
                optionFilterProp="children"
                options={brand}
                fieldNames={{
                  label: "newsContent",
                  value: "id",
                }}
                filterOption={(input, option) =>
                  String(option?.newsContent)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              /> */}
            {useMemo(
              () => (
                <BrandSelect
                  placeholder="品牌"
                  fieldNames={{
                    label: "newsContent",
                    value: "id",
                  }}
                  value={brandValue}
                  dataList={brand || []}
                  scrollPageSize={50}
                  onChange={handleChangeBrandId}
                />
              ),
              [brand]
            )}
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={6}>
          <Form.Item name="coProduct">
            <Select
                allowClear
                placeholder="合作产品"
                value={undefined}
                options={coProductList}
                fieldNames={{
                  label: "name",
                  value: "id",
                }}
                getPopupContainer={triggerNode => triggerNode.parentNode}
              />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="coCate">
            <Cascader
              allowClear
              options={coCateList}
              fieldNames={{
                label: "name",
                value: "id",
                children: "child",
              }}
              placeholder="产品品类"
              showSearch
              expandTrigger="hover"
              getPopupContainer={triggerNode => triggerNode.parentNode}
              />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="opCoType">
            <Select
              allowClear
              placeholder="商机合作类型"
              value={undefined}
              options={customerTypeList}
              fieldNames={{
                label: "name",
                value: "id",
              }}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="oppoFromIdArr">
            <Cascader
              allowClear
              options={oppoFromList}
              fieldNames={{
                label: "fromName",
                value: "id",
                children: "child",
              }}
              placeholder="商机来源"
              showSearch
              expandTrigger="hover"
              getPopupContainer={triggerNode => triggerNode.parentNode}
              // onSearch={value => console.log(value)}
              // onChange={handleChangeOppoFollowers}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="reqDesc">
            <Input placeholder="需求描述" allowClear />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item label="创建时间" name="createTime">
            <RangePicker
              // value={dateRange}
              // onChange={rangePickerChange}
              placeholder={["开始日期", "结束日期"]}
              style={{ width: "100%" }}
              ranges={{
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
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
          <Col span={1.5}>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="m-l-6">
                查询
              </Button>
            </Form.Item>
          </Col>
          <Col span={1.5}>
            {$permission("new_business_opportunity_manage_export") ? (
              <Form.Item>
                <Button htmlType="button" onClick={handleExport} className="m-l-6">
                  导出
                </Button>
              </Form.Item>
            ) : (
              ""
            )}
          </Col>
        </Row>
    </Form>
  );
};

export default Search;

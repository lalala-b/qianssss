/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import { useEffect, useState } from "react";
import { Tabs, Card } from "antd";
import { getUrlQuery } from "src/utils/getUrlQuery";
import VideoSpecialWorkManagement from "./VideoSpecialWorkManagement";
import SpecialPaymentManagement from "./SpecialPaymentManagement";

const { TabPane } = Tabs;

const WorkManagement = () => {
  const [activeKey, setActiveKey] = useState<string>("1");

  const handleChangeActiveKey = (value: string) => {
    setActiveKey(value);
  };

  useEffect(() => {
    const { tabKey = "1" } = getUrlQuery();
    setActiveKey(tabKey as string);
  }, []);

  return (
    <Card>
      <Tabs destroyInactiveTabPane activeKey={activeKey} onChange={handleChangeActiveKey}>
        <TabPane tab="视频&特殊工单" key="1">
          <VideoSpecialWorkManagement />
        </TabPane>

        <TabPane tab="无需执行的特殊收支" key="2">
          <SpecialPaymentManagement />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default WorkManagement;

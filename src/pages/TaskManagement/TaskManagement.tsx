/* eslint-disable css-modules/no-unused-class */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import { useState,useEffect } from "react";
// import { useNavigate } from "react-router";
import { Tabs, ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import styles from "./TaskManagement.scss";
// import MediumNO from "./TaskPages/MediumNO";
import SignUpNo from "./TaskPages/SignUpNo"

const { TabPane } = Tabs;

const TaskManagement: React.FC = () => {
  const {
    location: { href },
  } = window;
  const [activekey,setActiveKey] = useState('1')
  const [opId,setOpId]=useState<number>()
  const [pid,setPid]=useState<number>()
  const handleChangeTab = (val:string)=>{
    setActiveKey(val)
  }
  const getQuery = (path: string) => {
    interface queryObjType {
      [key: string]: string | null;
    }
    const index = path.lastIndexOf("?");
    const queryStr = path.slice(index + 1);
    const index1 = queryStr.lastIndexOf("&");

    const queryObj: queryObjType = {};
    if (index1 === -1) {
      const name = queryStr.split("=")[0];
      const value = queryStr.split("=")[1];
      queryObj[name] = value;
    } else {
      queryStr.split("&").map(item => {
        const name = item.split("=")[0];
        const value = item.split("=")[1];
        queryObj[name] = value;
        return item;
      });
    }
    return queryObj;
  };
  // 飞书跳转默认打开需求&账号详情
  useEffect(() => {
    const { taskType,opId,pid} = getQuery(href);
    if (taskType && opId&&pid) {
      setActiveKey(taskType)
      setOpId(Number(opId))
      setPid(Number(pid))
    }
  }, [href]);
  return (
    <ConfigProvider locale={zhCN}>
      <div className="q-wrap">
        <Tabs className="tabs-p" activeKey={activekey} onChange={handleChangeTab}>
          <TabPane tab="签约找号任务" key="1">
          {activekey==='1'&&<SignUpNo taskType={1} defaultOpId={opId} defaultPid={pid}/>}
          </TabPane>
          <TabPane tab="媒介找号任务" key="2">
          {activekey==='2'&& <SignUpNo taskType={2} defaultOpId={opId} defaultPid={pid}/>}
          </TabPane>
        </Tabs>
      </div>
    </ConfigProvider>
  );
};

export default TaskManagement;

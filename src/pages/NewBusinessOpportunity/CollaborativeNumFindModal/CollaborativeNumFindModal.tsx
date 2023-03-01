/* eslint-disable no-loop-func */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-expressions */
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Checkbox,
  Cascader,
  Button,
  Row,
  Col,
  message,
  DatePicker,
  Select,
  Input,
} from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import { ExclamationCircleFilled } from "@ant-design/icons";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import moment from "moment";
import {
  $publishAssistTask,
  $getCoopFindInfo,
  $getOpportDetail,
  $getOppoMediumDistributes,
  OppoMediumBuyerResType,
  PublishAssistTaskParamsType,
} from "src/api/business";
import styles from './CollaborativeNumFindModal.scss'

interface CollaborativeNumFindModalPropType {
  opId: number;
  show: boolean;
  onShowDrawer: (
    val: DrawerType,
    id?: number | string,
    isActiveKeyForCommand?: boolean
  ) => void;
  onGetList: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

interface FindTaskMsgType {
  findTotal: number;
  stopFindTime: number;
}

interface OpportDetailMsgType {
  brandName: string;
  coCateName: string;
  coProduct: string;
  publishStart: string;
  publishEnd: string;
  description: string;
  fileUrl: string;
}

export interface formDataType {
  deadLine: any;
  taskFollower?: number[];
}

const CollaborativeNumFindModal: React.FC<
  CollaborativeNumFindModalPropType
> = ({ opId, show, onShowDrawer, onGetList, onCancel, onClose }) => {
  const {Option} = Select;
  // const [searchData, setSearchData] = useState<PublishAssistTaskParamsType>({});
  const [signTaskText, setSignTaskText] = useState<string>("选择签约找号任务");
  const [meduimTaskText, setMeduimTaskText] =
    useState<string>("选择媒介找号任务");
  const [showTaskDetailModal, setShowTaskDetailModal] =
    useState<boolean>(false);
  const [isFindSignTask, setIsFindSignTask] = useState<boolean>(false);
  const [isFindMeduimTask, setIsFindMeduimTask] = useState<boolean>(false);
  const [findSignTaskMsg, setFindSignTaskMsg] = useState<FindTaskMsgType>({
    findTotal: 0,
    stopFindTime: 0,
  });
  const [findMediumTaskMsg, setFindMediumTaskMsg] = useState<FindTaskMsgType>({
    findTotal: 0,
    stopFindTime: 0,
  });
  const [demandDetailMsg, setDemandDetailMsg] = useState<OpportDetailMsgType>({
    brandName: "",
    coCateName: "",
    coProduct: "",
    publishStart: "",
    publishEnd: "",
    description: "",
    fileUrl: "",
  });
  const [findDateAndTime,setFindDateAndTime] = useState('')
  const [findTime,setFindTime] = useState('')
  const [findDate,setFindDate] = useState('')
  const handleSelectTime = (val:any)=>{
    setFindTime(val)
  }

  const handleChangeDate = (val:any)=>{
    const deadLine = moment(
      new Date(val?._d)
    ).format("YYYY-MM-DD");
    setFindDate(deadLine)
    getTimeList(deadLine)
  }
  // const [formDataTemp, setFormDataTemp] = useState<PublishAssistTaskParamsType>({});
  const [formDataTemp, setFormDataTemp] = useState<formDataType>({
    deadLine: "",
  });

  const [oppoMeduimBuyerList, setOppoMeduimBuyerList] = useState<
    OppoMediumBuyerResType[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [timeList,setTimeList] = useState<any[]>([])
  // 初始化时间时分列表
  const getTimeList = (deadLine?:any)=>{
    const nowHour = new Date().getHours()
    const nowMinutes = new Date().getMinutes()
    const timeList:any[]=[]
    for (let i=0;i<=23;i++){
      ['00','15','30','45'].forEach((item:string)=>{
        let disabled=false
        if (!deadLine||isToday(deadLine)){
          if (nowHour>i||nowHour===i&&nowMinutes>Number(item)){
            disabled = true
          }
        }
        const hour=i<10?`0${i}`:i;
        timeList.push({time:`${hour}:${item}`,disabled})
      })
    }
    setTimeList(timeList)
    if (deadLine&&isToday(deadLine)||!deadLine){
      getDefaultTime()
    }
  }
  // 计算所选日期是否为今天
  const isToday = (deadLine?:any)=>{
    const deadArr = deadLine?deadLine.split('-'):undefined;
    const year =new Date().getFullYear()
    const month =new Date().getMonth()+1
    const day =new Date().getDate()
    return deadArr&&+deadArr[0]===year&&+deadArr[1]===month&&+deadArr[2]===day
  }
  // 设置默认时分
  const getDefaultTime = ()=>{
    const nowHour = new Date().getHours()
    const nowMinutes = new Date().getMinutes()
    const itemHour = nowHour>9?nowHour:`0${nowHour}`
    if (nowMinutes<=15){
      setFindTime(`${itemHour}:15`)
    }
    if (nowMinutes>15&&nowMinutes<=30){
      setFindTime(`${itemHour}:30`)
    }
    if (nowMinutes>30&&nowMinutes<=45){
      setFindTime(`${itemHour}:45`)
    }
    if (nowMinutes>45){
      const itemHour = nowHour+1>9?nowHour+1:`0${nowHour+1}`
      setFindTime(`${itemHour}:00`)
    }
  }
  // const [curTimeSelectLabel, setCurTimeSelectLabel] = useState<string>('')
  const [showDatePicker,setShowDatePicker] = useState(false)
  const [form] = Form.useForm();

  // 获取本次非首轮的协同找号相关信息
  const getMsgForCollaborativeNumberFind = (opId: number) => {
    $getCoopFindInfo({
      opId,
    })
      .then(res => {
        const { signTask, mediumTask } = res;
        if (Object.keys(signTask || {})?.length) {
          setIsFindSignTask(true);
          setFindSignTaskMsg(signTask);
        }
        if (Object.keys(mediumTask || {})?.length) {
          setIsFindMeduimTask(true);
          setFindMediumTaskMsg(mediumTask);
        }
      })
      .catch(e => {
        message.error(String(e.message));
      });
  };

  // 获取需求的详情信息
  const getDemandDetailMsg = () => {
    $getOpportDetail({
      id: opId,
    })
      .then(res => {
        // console.info(res, "detail");
        setDemandDetailMsg(res);
      })
      .catch(e => {
        message.error(String(e.message));
      });
  };

  const getOppoMediumBuyerList = () => {
    $getOppoMediumDistributes()
      .then(res => {
        // console.info(res);
        setOppoMeduimBuyerList(res);
      })
      .catch(e => {
        message.error(String(e.message));
      });
  };

  const handleChangeSignTask = (e: CheckboxChangeEvent) => {
    const { checked } = e.target;
    if (checked) {
      setSignTaskText("已选中签约找号任务");
    } else {
      setSignTaskText("选择签约找号任务");
    }
  };

  const handleChangeMeduimTask = (e: CheckboxChangeEvent) => {
    const { checked } = e.target;
    if (checked) {
      setMeduimTaskText("已选中媒介找号任务");
      getOppoMediumBuyerList();
    } else {
      setMeduimTaskText("选择媒介找号任务");
    }
  };

  const handleConfirmPublish = () => {
    if (signTaskText==='选择签约找号任务'&&meduimTaskText==='选择媒介找号任务'){
      message.error('任务类型不能为空')
    } else {
      form.setFieldValue('deadLine',formDataTemp.deadLine)
      form.submit();
    }
  };

  const getFindNumTaskData = (params: PublishAssistTaskParamsType) => {
    // const { taskType, taskFollower = [] } = params;
    // if (!Object.keys(params.medTask || {}).length) {
    //   delete params.medTask
    // } else if (!Object.keys(params?.signTask || {}).length) {
    //   delete params.signTask
    // }
    if (!params?.medTask?.taskType && !params?.signTask?.taskType) {
      message.error("任务类型不能为空");
      return;
    }
    // console.info(params, 'params')
    setLoading(true);
    $publishAssistTask(params)
      .then(res => {
        console.info(res);
        onGetList();
        onClose();
        setLoading(false);
        message.success("操作成功");
      })
      .catch(e => {
        setLoading(false);
        message.error(String(e.message));
      });
  };

  const handleFindNumTaskForm = (params: formDataType) => {
    getDemandDetailMsg();
    setShowTaskDetailModal(true);
    setFormDataTemp(params);
  };

  const handlePublishAssistTask = () => {
    const formData = formDataTemp;
    const formObj: any = {
      signTask: {},
      medTask: {},
    };
    const {deadLine} = formData 
    const taskFollower = formData?.taskFollower?.length
      ? formData.taskFollower[formData.taskFollower.length - 1]
      : [];
    if (signTaskText === "已选中签约找号任务") {
      // formData.taskType = 1;
      formObj.signTask.taskType = 1;
      formObj.signTask.opId = opId;
      formObj.signTask.deadLine = deadLine;
    }
    if (meduimTaskText === "已选中媒介找号任务") {
      // formObj.taskType = 2;
      formObj.medTask.taskType = 2;
      formObj.medTask.opId = opId;
      formObj.medTask.deadLine = deadLine;
      formObj.medTask.taskFollower = taskFollower;
    }
    if (
      signTaskText === "已选中签约找号任务" &&
      meduimTaskText === "已选中媒介找号任务"
    ) {
      formObj.signTask.taskType = 1;
      formObj.signTask.opId = opId;
      formObj.signTask.deadLine = deadLine;
      formObj.medTask.taskType = 2;
      formObj.medTask.opId = opId;
      formObj.medTask.deadLine = deadLine;
      formObj.medTask.taskFollower = taskFollower;
      // taskTypeArr = [1, 2];
    }
    // const deadLine = moment(
    //   // eslint-disable-next-line no-underscore-dangle
    //   new Date(formData.deadLine?._d)
    // ).format("YYYY-MM-DD HH:mm:ss");
    // setSearchData(Object.assign(searchData, formObj));
    // if (taskTypeArr.length) {
    //   getFindNumTaskData(Object.assign(searchData, { taskType: 1 }));
    //   getFindNumTaskData(Object.assign(searchData, { taskType: 2 }));
    // } else {
    getFindNumTaskData(formObj);
    // }
  };

  // 禁止选择的日期
  const disabledDate: RangePickerProps["disabledDate"] = (current: any) =>
    current && current < moment().subtract(1, "day");

  const handleClickDate = ()=>{
    setShowDatePicker(true)
  }
  const handleDateOk = ()=>{
    const date = findDate || new Date().toLocaleDateString().replace(/\//g,'-')
    setFindDateAndTime(`${date} ${findTime}`)
    setFormDataTemp({deadLine:`${date} ${findTime}`})
    setShowDatePicker(false)
  }
  useEffect(() => {
    if (!show) return;
    getTimeList()
    getMsgForCollaborativeNumberFind(opId);
  }, [show]);

  return (
    <Modal
      title="发布找号任务"
      visible={show}
      maskClosable={false}
      width="50%"
      destroyOnClose
      footer={[
        <Button key={1} onClick={onClose}>
          取消
        </Button>,
        <Button
          key={2}
          type="primary"
          onClick={handleConfirmPublish}
          disabled={isFindMeduimTask && isFindSignTask}
        >
          确认发布
        </Button>,
      ]}
      onCancel={onClose}
    >
      <Form form={form} onFinish={handleFindNumTaskForm}>
        <Form.Item
          label="找号截止时间"
          name="deadLine"
          rules={[{ required: true, message: "请选择找号截止时间" }]}
        >
           <div className={styles.datePicker}>
           <Input
            style={{ width: "100%" }}
            value={findDateAndTime}
            placeholder="请选择找号截止时间"
          />
            <DatePicker
            defaultValue={moment(new Date().toLocaleDateString(), 'YYYY-MM-DD')}
            onClick={handleClickDate}
            style={{ width: "100%" }}
            open={showDatePicker}
            disabledDate={disabledDate}
            showToday={false}
            onChange={handleChangeDate}
            renderExtraFooter={()=>(<div className={styles.timeSlectFooter}>
            <Select placeholder="" value={findTime} onChange={handleSelectTime}>
                      {timeList?.map(
                        (item:any) => (
                          <Option key={item.time} value={item.time} disabled={item.disabled}>
                            {item.time}
                          </Option>
                        )
                      )}
                    </Select>
                    <Button type="primary" size="small" onClick={handleDateOk}>确认</Button>
            </div>)}
              disabled={isFindSignTask && isFindMeduimTask}
            />
          </div>
        </Form.Item>
        <div className={styles.findNumEndTimeTip}>
          到达截止时间后，签约、媒介均无法再推荐新的账号
        </div>
        <Form.Item name="taskType">
          <div className={styles.checkboxWrap}>
            <div className={styles.checkboxItemWrap}>
              <div
                className={styles.checkboxItem}
                style={{
                  backgroundColor: isFindSignTask
                    ? "#ccc"
                    : signTaskText === "选择签约找号任务"
                    ? "#448ef7"
                    : "#5dc940",
                }}
              >
                <Checkbox
                  disabled={!!isFindSignTask}
                  className={styles.checkbox}
                  onChange={handleChangeSignTask}
                />
                {/* eslint-disable-next-line no-constant-condition */}
                {isFindSignTask ? "已发布签约找号任务" : signTaskText}
              </div>
              <div className={styles.selectTaskTip}>
                <p>发给所有签约经纪人</p>
                {
                  // eslint-disable-next-line no-constant-condition
                  isFindSignTask ? (
                    <div className={styles.findTaskTipWrap}>
                      <div>找号截止时间</div>
                      <div>{findSignTaskMsg?.stopFindTime}</div>
                      <div>已找号{findSignTaskMsg?.findTotal}个</div>
                    </div>
                  ) : (
                    ""
                  )
                }
              </div>
            </div>
            <div className={styles.checkboxItemWrap}>
              <div
                className={styles.checkboxItem}
                style={{
                  backgroundColor: isFindMeduimTask
                    ? "#ccc"
                    : meduimTaskText === "选择媒介找号任务"
                    ? "#448ef7"
                    : "#5dc940",
                }}
              >
                <Checkbox
                  disabled={!!isFindMeduimTask}
                  className={styles.checkbox}
                  onChange={handleChangeMeduimTask}
                />
                {/* eslint-disable-next-line no-constant-condition */}
                {isFindMeduimTask ? "已发布媒介找号任务" : meduimTaskText}
              </div>
              <div className={styles.selectTaskTip}>
                <p>由媒介分配员，安排媒介采买人找号</p>
                {
                  // eslint-disable-next-line no-constant-condition
                  isFindMeduimTask ? (
                    <div className={styles.findTaskTipWrap}>
                      <div>找号截止时间</div>
                      <div>{findMediumTaskMsg?.stopFindTime}</div>
                      <div>已找号{findMediumTaskMsg?.findTotal}个</div>
                    </div>
                  ) : (
                    ""
                  )
                }
                {/* eslint-disable-next-line no-constant-condition */}
                {meduimTaskText === "选择媒介找号任务" && true ? (
                  ""
                ) : (
                  <Form.Item
                    name="taskFollower"
                    className={styles.meduimDispatcherInput}
                    rules={[{ required: true, message: "请选择媒介分配员" }]}
                  >
                    <Cascader
                      allowClear
                      options={oppoMeduimBuyerList}
                      fieldNames={{
                        label: "orgName",
                        value: "id",
                        children: "childOrgList",
                      }}
                      placeholder="请选择媒介分配员"
                      showSearch
                      expandTrigger="hover"
                      maxTagCount="responsive"
                      // onChange={handleBusinessOppoFollowersChange}
                      // onSearch={value => console.log(value)}
                    />
                  </Form.Item>
                )}
              </div>
            </div>
          </div>
        </Form.Item>
      </Form>

      <Modal
        title="提示"
        visible={showTaskDetailModal}
        closable={false}
        footer={[
          <Button
            key={1}
            onClick={() => {
              onCancel && onCancel();
              setShowTaskDetailModal(false);
            }}
          >
            取消
          </Button>,
          <Button
            key={2}
            type="primary"
            ghost
            onClick={() => {
              onCancel && onCancel();
              setShowTaskDetailModal(false);
              onShowDrawer("edit", opId);
            }}
          >
            取消，并完善需求
          </Button>,
          <Button
            key={3}
            type="primary"
            onClick={handlePublishAssistTask}
            loading={loading}
          >
            继续
          </Button>,
        ]}
      >
        <div className={styles.taskTipWrap}>
          <div className={styles.taskTipHeader}>
            <ExclamationCircleFilled
              style={{ color: "#efb041", fontSize: "22px" }}
            />
            <div className={styles.taskTip}>
              请确认一下需求<span>是否完整、清晰</span>
              （描述不清晰将导致找号不准确）
            </div>
          </div>

          <div className={styles.taskTipBody}>
            <Row>
              <Col>
                <div>
                  <span>品牌：</span>
                  {demandDetailMsg.brandName || "保密项目"}
                </div>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <div>
                  <span>合作产品品类：</span>
                  {demandDetailMsg.coCateName || "--"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <span>合作产品：</span>
                  {demandDetailMsg.coProduct || "--"}
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                  <span>预计发布时间：</span>
                  {demandDetailMsg.publishStart && demandDetailMsg.publishEnd
                    ? `${demandDetailMsg.publishStart}~${demandDetailMsg.publishEnd}`
                    : "--"}
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                  <span style={{ display: "block" }}>需求描述：</span>
                  <pre>{demandDetailMsg.description || "--"}</pre>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                  <span>品牌方BF：</span>
                  {demandDetailMsg.fileUrl ? (
                    <Button
                      type="link"
                      onClick={() => window.open(demandDetailMsg.fileUrl)}
                      className={styles.downloadBtn}
                    >
                      点击下载文件
                    </Button>
                  ) : (
                    "--"
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default CollaborativeNumFindModal;

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-constant-condition */
import { useState, useRef, useEffect, useContext } from "react";
import { 
  Modal,
  Form,
  Row, 
  Col, 
  DatePicker, 
  Select, 
  Input, 
  InputNumber, 
  Checkbox, 
  Button, 
  Upload, 
  ConfigProvider, 
  Divider, 
  Space, 
  InputRef,
  Spin,
  message,
  Cascader,
} from "antd";
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { PlusOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import zhCN from "antd/es/locale/zh_CN";
import { GlobalContext } from "src/contexts/global";
import {
  $getBrandList,
  $addBaseCustomerInfo,
} from "src/api/business";
import {
  $getSignContractAccounts,
  $addCooperationOrder,
  $updateCooperationOrder,
  $findCooperateOrderDetail,
  AddCooperationOrderReqType,
  $checkDynamicLink,
} from "src/api/signedOrder";
import {
  VideoListType,
} from "src/api/workOrderDetail";
import BSelect from "src/components/BigDataSelect";
import moment from "moment";
import type {
  SearchConfigItemPropsType,
} from "src/components/Search/Search";
import VideoList from "./VideoList";
import {
  projectType,
} from "./config/cooperateSearch";
import styles from "./AddCoopOrderModal.scss";

const { TextArea } = Input;

interface AddCoopOrderModalPropType {
  type: string;
  show: boolean;
  platData: any;
  performPaymentType: any,
  cooperOrderProjectType: any;
  crmGroupData: any;
  cooperOrderId: string;
  onGetList: () => void;
  onClose: () => void;
}

type HandlerFilterResType = {
  showValue: any;
  sendParams: any;
};


const collectPaymentTypeList = [
  {
    value: 1,
    label: '向达人付款',
  },
  {
    value: 2,
    label: '向达人收款',
  },
]

const paymentTypeList = [
  {
    value: 1,
    label: '已向达人付款',
  },
  {
    value: 2,
    label: '未向达人付款',
  },
]

const collectTypeList = [
  {
    value: 1,
    label: '收款已到账',
  },
  {
    value: 2,
    label: '收款未到账',
  },
]


const AddCoopOrderModal: React.FC<AddCoopOrderModalPropType> = ({
  type,
  show,
  platData,
  crmGroupData,
  performPaymentType,
  cooperOrderProjectType,
  cooperOrderId,
  onGetList,
  onClose,
}) => {
  const { globalData = {} } = useContext(GlobalContext);
  const [form] = Form.useForm();
  const addBrandRef = useRef<InputRef>(null);
  const dynamicLinkInputRef = useRef<InputRef>(null);
  // 增加的品牌名
  const [addBrandName, setAddBrandName] = useState<string>("");
  const [brandLoading, setBrandLoading] = useState<boolean>(false);
  const [brandList, setBrandList] = useState<any>([])
  const [brandId, setBrandId] = useState<number | undefined>(undefined)
  const [accountId, setAccountId] = useState<number | undefined>(undefined);
  const [accountList, setAccountList] = useState<any>([])
  const { 
    dname: signGroupName, 
    fname: signTeamName, 
    realname: signUserName,
    did: signGroupId,
    fid: signTeamId,
    id: signUserId,
  } = globalData?.user?.userInfo || {};
  // 合作订单的详情信息
  const [cooperateOrderDetail, setCooperateOrderDetail] = useState<AddCooperationOrderReqType>({})
  // 控制达人分成比例的禁用状态
  const [disabledOutMoneyRatio, setDisabledOutMoneyRatio] = useState<boolean>(false)
  // 控制绑定视频的弹窗显示
  const [showBindVideoModal, setShowBindVideoModal] = useState<boolean>(false)
  // 当前选择的视频信息
  const [selectVideoMsg, setSelectVideoMsg] = useState<VideoListType[]>([]);
  // 当前视频标题
  const [videoTitle, setVideoTitle] = useState<string | undefined>("")
  // 当前视频的flowId
  const [videoFlowId, setVideoFlowId] = useState<number | undefined>(undefined)
  // 当前视频发布时间
  const [videoAddTime, setVideoAddTime] = useState<string | undefined>("")
  // 控制输入动态链接的按钮显示
  const [showDynamicLink, setShowDynamicLink] = useState<boolean>(false)
  // 控制输入动态链接的输入框显示
  const [showDynamicLinkInput, setShowDynamicLinkInput] = useState<boolean>(false)
  // 当前的B站动态链接
  const [dynamicLink, setDynamicLink] = useState<string | undefined>("")
  // 控制平台任务ID显示
  const [showPlatTaskId, setShowPlatTaskId] = useState<boolean>(false)
  // 控制是否对款项截图进行必填
  const [requireTradeScreenshots, setRequireTradeScreenshots] = useState<boolean>(false)
  // 是否需要内容协助
  const [contentAssist, setContentAssist] = useState<boolean>(false)
  // 收付款状态的类型
  const [showPaymentStatus, setShowPaymentStatus] = useState<number>(0)
  // 控制OA流程编号的显示
  const [showOANo, setShowOANo] = useState<boolean>(false)
  // 控制绩效月的显示
  const [showMonthMoney, setShowMonthMoney] = useState<boolean>(false)
  // 款项截图文件列表
  const [fileList, setFileList] = useState<UploadFile[]>([])
  // 控制预览款项截图的弹窗显示
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)
  // 预览的款项截图图片地址
  const [previewImage, setPreviewImage] = useState<string>('')
  // 预览的款项截图图片标题
  const [previewTitle, setPreviewTitle] = useState<string>('')
  // 订单价格（流水）的计算值
  const [orderPriceComputedVal, setOrderPriceComputedVal] = useState<number>(0)
  // 工单实际营收的计算值
  const [orderActualIncomeComputedVal, setOrderActualIncomeComputedVal] = useState<number>(0)
  // 保存动态链接的loading
  const [saveDynamicLinkLoading, setSaveDynamicLinkLoading]= useState<boolean>(false)
  // 弹窗loading
  const [addCoopOrderModalLoading, setAddCoopOrderModalLoading] = useState<boolean>(false)
  // 确认按钮的loading
  const [saveLoading, setSaveLoading] = useState<boolean>(false)

  // 合作订单表单的普通字段属性
  const formAttrLabel: any[] = [
    "brandId",
    "platId",
    "projectType",
    "accountId",
    "finishTime",
    "outMoneyRatio",
    "contentAssist",
    "accountUnitPrice",
    "refundRatio",
    "refundMoney",
    "flowCount",
    "cpm",
    "outMoney",
    "otherMoney",
    "orderActualIncome",
    "platTaskId",
    "paymentType",
    "paymentResult",
    "monthMoney",
    "oaProcessNo",
    "companyOfflineSupplement",
    "cusOfflineSupplement",
    "remark",
  ]

  // 获取品牌列表
  const getBrandList = async () => {
    try {
      const res: any = await $getBrandList();
      setBrandList(res);
    } catch (e: any) {
      message.error(e?.message)
    }
  };

  // 保存当前新添加的品牌名
  const handleChangeAddBrandName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddBrandName(event.target.value);
  };

  const addBaseCustomerInfo = async () => {
    try {
      setBrandLoading(true);
      await $addBaseCustomerInfo({
        typeId: 2,
        newsContent: addBrandName.trim(),
      });
      message.success("添加品牌成功");

      await getBrandList();
      setBrandLoading(false);
    } catch (e: any) {
      message.error(String(e.message) || "添加品牌失败，请重试");
      setBrandLoading(false);
    }
  };

  // 添加品牌名
  const handleAddBrand = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!addBrandName.trim()) {
      message.error("品牌名不能为空");
      return;
    }
    e.preventDefault();
    addBaseCustomerInfo();
    // setItems([...items, name || `New item ${index++}`]);
    setAddBrandName("");
    setTimeout(() => {
      addBrandRef.current?.focus();
    }, 0);
  };

  // 处理订单类型选择时的逻辑
  const handleChangeProjectType = (val: any) => {
    // 若选择的订单类型是达人私单(分成)或达人私单(不分成)，则显示平台任务ID字段
    if (val === '2' || val === '3') {
      setShowPlatTaskId(true)
    } else {
      setShowPlatTaskId(false)
    }

    // 若选择的订单类型是达人私单(不分成)，默认达人分成比例是100%，且不可再编辑
    if (val === '3') {
      form.setFieldValue('outMoneyRatio', 100)
      setDisabledOutMoneyRatio(true)
    } else {
      form.setFieldValue('outMoneyRatio', 0)
      setDisabledOutMoneyRatio(false)
    }
  }

  // 获取账号列表
  const getAccountInfo = async(platId: string) => {
    try {
      const res = await $getSignContractAccounts({
        platId,
      })
      setAccountList(res || [])
    } catch (e: any) {
      message.error(e?.message)
    }
  };

  // 选择平台时的逻辑
  const handleChangePlat = (val: any) => {
    // 当平台选择的是B站，则显示输入动态链接字段，并清空之前所选择的绑定视频
    if (val === 2) {
      setShowDynamicLink(true)
      setSelectVideoMsg([]);
      setVideoTitle("");
      setVideoAddTime("");
      setVideoFlowId(undefined)
    } 
    // 否则显示绑定视频字段，并清空之前填写的动态链接
    else {
      setShowDynamicLink(false)
      setDynamicLink("")
    }
    form.setFieldValue('accountId', undefined)
    getAccountInfo(val)
  }

  // 清空平台的值
  const handleClearPlat = () => {
    form.setFieldValue('accountId', undefined)
    setAccountList([])
  }

  // 若当前平台还没选择，选择账号时提示请选择平台
  const handleFocusAccount = () => {
    if (!form.getFieldValue('platId')) {
      message.warning('请先选择账号平台')
    }
  }

  // 选择账号名称时的逻辑
  const handleChangeAccount = (val: number) => {
    setAccountId(val)
  }

  // 保存视频的动态链接
  const handleSaveDynamicLink = async () => {
    try {
      setSaveDynamicLinkLoading(true)
      await $checkDynamicLink({
        index_url: dynamicLinkInputRef.current?.input?.value,
      })
      setSaveDynamicLinkLoading(false)
      setDynamicLink(dynamicLinkInputRef.current?.input?.value)
      setShowDynamicLinkInput(false)
    } catch (e: any) {
      setSaveDynamicLinkLoading(false)
      message.error(e?.msg)
    }
  }

  // 工单实际营收的计算公式（(订单价格)流水-达人实际营收-其他费用）
  const computedOrderActualIncomeVal = (orderPrice: number, outMoney: number, otherMoney: number) => {
    setOrderActualIncomeComputedVal(Number((orderPrice - outMoney - otherMoney).toFixed(2)))
  }

  // (订单价格)流水的计算公式（账号单价-客户返点金额） （自动计算工单实际营收）
  const computedOrderPriceVal = (accountUnitPrice: number, refundMoney: number) => {
    const orderPrice = Number((accountUnitPrice - refundMoney).toFixed(2)) 
    setOrderPriceComputedVal(orderPrice)

    // 当前的达人实际营收值
    const outMoney = form.getFieldValue('outMoney') || 0
    // 当前的其他费用值
    const otherMoney = form.getFieldValue('otherMoney') || 0
    computedOrderActualIncomeVal(orderPrice, outMoney, otherMoney)
  }

  // 更改账号单价（自动计算(订单价格)流水）
  const handleChangeAccountUnitPrice = (val: number) => {
    const refundMoney = form.getFieldValue('refundMoney') || 0
    computedOrderPriceVal(val, refundMoney)
  }

  // 更改客户返点金额（自动计算(订单价格)流水）
  const handleChangeRefundMoney = (val: number) => {
    const accountUnitPrice = form.getFieldValue('accountUnitPrice') || 0
    computedOrderPriceVal(accountUnitPrice, val)
  }

  // 更改达人实际营收（自动计算工单实际营收）
  const handleChangeOutMoney = (val: number) => {
    // 当前的其他费用值
    const otherMoney = form.getFieldValue('otherMoney') || 0
    computedOrderActualIncomeVal(orderPriceComputedVal, val, otherMoney)
  }

  // 更改其他费用（自动计算工单实际营收）
  const handleChangeOtherMoney = (val: number) => {
    // 当前的达人实际营收值
    const outMoney = form.getFieldValue('outMoney') || 0
    computedOrderActualIncomeVal(orderPriceComputedVal, outMoney, val)
  }

  // 更改收付款类型
  const handleChangePaymentType = (val: number) => {
    // 若选择向达人付款，显示付款状态的字段；若选择向达人收款，显示收款状态的字段
    setShowPaymentStatus(val)
    form.setFieldValue('paymentResult', undefined)
    // 隐藏绩效月和OA流程编号字段
    setShowMonthMoney(false)
    setShowOANo(false)
  }

  // 更改付款状态
  const handleChangePaymentStatus = (val: number) => {
    // 当付款状态为已向达人付款，显示OA流程编号字段
    if (+val === 1) {
      setShowOANo(true)
    } else {
      setShowOANo(false)
    }
    setShowMonthMoney(false)
  }

  // 更改收款状态
  const handleChangeCollectStatus = (val: number) => {
    // 当收款状态为收款已到账，款项截图必填且显示绩效月字段
    if (+val === 1) {
      setRequireTradeScreenshots(true)
      setShowMonthMoney(true)
    } else {
      setRequireTradeScreenshots(false)
      setShowMonthMoney(false)
    }
    setShowOANo(false)
  }

  // 更改是否需要内容协助
  const handleChangeContentAssist = (e: CheckboxChangeEvent) => {
    setContentAssist(e.target.checked)
  }

  // 上传款项截图之前
  const handleBeforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG的文件!');
    }
  }

  // 获取图片的base64编码
  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  // 预览图片
  const handlePreviewTradeScreenshots = async(file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  }

  // 更改款项截图的图片
  const handleChangeTradeScreenshots = ({ fileList: newFileList }: {fileList: any}) => {
    setFileList(newFileList);
    form.setFieldValue('collectionScreenshots', newFileList)
  }

  // 打开绑定视频的弹窗
  const handleShowBindVideoModal = () => {
    setShowBindVideoModal(true)
  }

  // 关闭绑定视频的弹窗
  const handleCloseBindVideoModal = () => {
    setShowBindVideoModal(false)
  }

  // 选择视频列表的视频
  const handleSelectVideoMsg = (val: VideoListType[]) => {
    setSelectVideoMsg(val);
    setVideoTitle(val[0].titleName);
    setVideoAddTime(val[0].addTime);
    setVideoFlowId(val[0].flowId)
    handleCloseBindVideoModal();
  };

  // 删除视频信息
  const handleDeleteVideoMsg = () => {
    // 若是绑定视频
    if (!dynamicLink) {
      setSelectVideoMsg([]);
      setVideoTitle("");
      setVideoAddTime("");
      setVideoFlowId(undefined)
    } 
    // 若是输入动态链接
    else {
      setDynamicLink("")
    }
  };


  // 保存修改报价的信息
  const handleSaveEditMsg = async () => {
    await form.validateFields();
    form.submit();
  };

  // 处理级联数据
  function handlerCascaderData(
    value: string[] | number[] = [],
    configInfo: SearchConfigItemPropsType["data"] = []
  ): HandlerFilterResType {
    let showValue = "";
    const sendParams: any[] = [];

    if (!configInfo) {
      showValue = "";
    } else {
      let templateConfig = configInfo;
      const result: string | number[] = [];

      value.forEach(valueItem => {
        const current = templateConfig.find((templateConfigItem: any) => {
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
  }

  // 处理表单参数
  const handleFormParams = (params: any) => {
    const temp = { ...params }

    // 获取级联数据对应的信息字段
    const getGroupInfo = (data: any[] = []) => {
      const result = {
        groupId: "",
        teamId: "",
        userId: "",
        groupName: "",
        teamName: "",
        userName: "",
      };

      data.forEach((item, index) => {
        const { id, orgName, userFlag, children } = item;
        if (index === 0) {
          result.groupId = id;
          result.groupName = orgName;
        } else if (userFlag && !(children === [] || children === null)) {
          result.userId = id;
          result.userName = orgName;
        } else if (!(children === [] || children === null)) {
          result.teamId = id;
          result.teamName = orgName
        }
      });

      return result;
    };

    // 对商务团队进行处理
    const { sendParams: businessGroupSendParams } = handlerCascaderData(
      temp.businessId,
      crmGroupData
    );
    const { groupId, teamId, userId, groupName, teamName, userName } = getGroupInfo(businessGroupSendParams);
    if (groupId) {
      temp.businessGroupId = groupId;
      temp.businessGroupName = groupName;
    }
    if (teamId) {
      temp.businessTeamId = teamId;
      temp.businessTeamName = teamName
    }
    if (userId) {
      temp.businessUserId = userId;
      temp.businessUserName = userName
    }
    delete temp.businessId

    // 对平台进行处理
    temp.platName = platData.filter((item: any) => item.platId === temp.platId)[0].platName

    // 对账号进行处理
    temp.accountName = accountList.filter((item: any) => item.accountId === temp.accountId)[0].accountName

    // 对款项截图进行处理
    const collectionScreenshots = fileList.map((item: any) => {
      let str = "";
      if (!Object.keys(item?.response || {}).length) {
        str = item.url;
      } else {
        str = item.response.data;
      }
      return str;
    });

    // 对绩效月进行处理
    if (temp.monthMoney) {
      temp.monthMoney = moment(new Date(temp.monthMoney?._d)).format(
        "YYYY-MM"
      )
    }

    // 对已定档期进行处理
    temp.finishTime = moment(new Date(temp.finishTime?._d)).format(
      "YYYY-MM-DD"
    )

    // 对签约团队进行处理
    if (type === 'edit') {
      temp.signGroupId = cooperateOrderDetail.signGroupId
      temp.signTeamId = cooperateOrderDetail.signTeamId
      temp.signUserId = cooperateOrderDetail.signUserId
      temp.signGroupName = cooperateOrderDetail.signGroupName
      temp.signTeamName = cooperateOrderDetail.signTeamName
      temp.signUserName = cooperateOrderDetail.signUserName
    } else {
      temp.signGroupId = signGroupId
      temp.signTeamId = signTeamId
      temp.signUserId = signUserId
      temp.signGroupName = signGroupName
      temp.signTeamName = signTeamName
      temp.signUserName = signUserName
    }

    return {
      ...temp,
      cooperOrderId: cooperateOrderDetail.cooperOrderId,
      cooperOrderNo: cooperateOrderDetail.cooperOrderNo,
      collectionScreenshots: JSON.stringify(collectionScreenshots),
      title: videoTitle,
      flowId: videoFlowId,
      addTime: videoAddTime || null,
      url: dynamicLink || (selectVideoMsg[0]?.url || cooperateOrderDetail.url),
      videoCoverUrl: dynamicLink ? "" : (selectVideoMsg[0]?.videoCoverUrl || cooperateOrderDetail.videoCoverUrl),
      dynamicLink, 
      contentAssist: contentAssist ? 1 : 0,
      orderActualIncome: orderActualIncomeComputedVal,
      orderMoney: orderPriceComputedVal,
    }
  }

  // 表单完成
  const handleFinishForm = async(params: any) => {
    try {
      // 当收款状态为收款已到账，款项截图必填
      if (params.paymentResult === '1' && !fileList.length) {
        message.error('请上传款项截图')
        return
      }
      setSaveLoading(true)
      const paramsTemp = handleFormParams(params)
      const api = type === 'add' ? $addCooperationOrder : $updateCooperationOrder
      await api({
        ...paramsTemp,
      })
      message.success('操作成功')
      onClose()
      onGetList()
      setSaveLoading(false)
    } catch (e: any) {
      setSaveLoading(false)
      message.error(e?.message)
    }
  }

  // 编辑表单回显
  const echoCooperateOrder = (detailMsg: any) => {
    // 赋值对应的accountId
    setAccountId(detailMsg.accountId)

    // 当平台为B站，则显示输入动态链接
    if (detailMsg.platId === 2) {
      setShowDynamicLink(true)
    } 

    // 当订单类型为达人私单（不分成），则达人分成比例为100且不能编辑
    if (detailMsg.projectType === 3) {
      form.setFieldValue('outMoneyRatio', 100)
      setDisabledOutMoneyRatio(true)
    }

    // 当订单类型为达人私单（分成）和达人私单（不分成），显示平台任务ID
    if (detailMsg.projectType === 2 || detailMsg.projectType === 3 ) {
      setShowPlatTaskId(true)
    }

    // 处理视频信息
    setVideoTitle(detailMsg.title)
    setVideoFlowId(detailMsg.flowId)
    setVideoAddTime(detailMsg.addTime)
    setDynamicLink(detailMsg.dynamicLink)

    // 处理内容协助
    setContentAssist(!!detailMsg.contentAssist)

    // 处理品牌
    setBrandId(detailMsg.brandId)

    // 处理订单价格
    setOrderPriceComputedVal(detailMsg.orderMoney)

    // 处理工单实际营收
    setOrderActualIncomeComputedVal(detailMsg.orderActualIncome)

    // 处理款项截图
    if (detailMsg.collectionScreenshots) {
      const fileList = JSON.parse(detailMsg.collectionScreenshots).map(
        (item: string, index: number) => ({
            uid: String(index),
            response: {
              data: item,
            },
            url: item,
          })
      )

      setFileList(fileList)
      form.setFieldValue('collectionScreenshots', fileList)
    }

    // 若收付款类型为向达人付款，则显示付款状态字段，否则显示收款状态字段
    setShowPaymentStatus(detailMsg.paymentType)

    // 付款状态，若为已付款，则显示OA流程编号和线下应付
    if (detailMsg.paymentType === 1 && detailMsg.paymentResult === 1) {
      setShowOANo(true)
    }

    // 收款状态，若为已收款，则显示绩效月和线下应收，且款项截图必填
    if (detailMsg.paymentType === 2 && detailMsg.paymentResult === 1) {
      setShowMonthMoney(true)
      setRequireTradeScreenshots(true)
    }

    formAttrLabel.forEach((item: any) => {
      // 若为日期类型，则转为moment对象
      if ((item === 'finishTime' || item === 'monthMoney') && detailMsg?.[item]) {
        detailMsg[item] = moment(detailMsg?.[item])
      }
      
      // 若为订单类型的字段，则转为字符串
      if (item === 'projectType') {
        form.setFieldValue(item, String(detailMsg?.[item]))
      } else {
        form.setFieldValue(item, detailMsg?.[item])
      }

      // 回显商务团队数据
      const businessIdArr = [detailMsg.businessGroupId, detailMsg.businessTeamId, detailMsg.businessUserId].filter(item => item !== null)
      form.setFieldValue('businessId', businessIdArr)
    })
  }

  // 获取合作订单详情信息
  const findCooperateOrderDetail = async(cooperOrderId: string) => {
    try {
      setAddCoopOrderModalLoading(true)
      const res: any = await $findCooperateOrderDetail({
        cooperOrderId,
      })
      setAddCoopOrderModalLoading(false)
      // 获取对应平台的下单账号数据
      getAccountInfo(res.platId)
      setCooperateOrderDetail(res)
      echoCooperateOrder(res)
    } catch (e: any) {
      setAddCoopOrderModalLoading(false)
      message.error(e?.message)
    }
  }

  // 获取弹窗标题
  const handleGetTitle = (type: string) => {
    let str = ''
    switch (type) {
      case 'add':
        str = '新增'
        break;
      case 'edit':
        str = '编辑'
        break
      case 'detail':
        str = '查看'
        break
      default:
        break
    }

    return str
  }

  // 根据id获取订单类型的label
  const getConfigInfoById = (list: any[], id: string, prop = "value") =>
    list.find(item => item[prop] === id) || {};

  useEffect(() => {
    if (type === 'edit' || type === 'detail') {
      findCooperateOrderDetail(cooperOrderId)
    }
  }, [cooperOrderId, type])

  useEffect(() => {
    getBrandList()
  }, [])

  return (
    <ConfigProvider locale={zhCN}>
        <Modal
          title={handleGetTitle(type)}
          visible={show}
          footer={ type === 'detail' ? null : (
            <>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" loading={saveLoading} onClick={handleSaveEditMsg}>确定</Button>
            </>
          )}
          width="60%"
          maskClosable={false}
          onCancel={onClose}
        >
          <Spin spinning={addCoopOrderModalLoading}>
            <Form form={form} onFinish={handleFinishForm} className={styles.addForm}>
              <div>
                <h3>商业信息</h3>
                <div className={styles.contentWrap}>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        label="品牌"
                        name="brandId"
                        rules={[{ required: true, message: "请选择品牌" }]}
                      >
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.brandName || '--' }</span>
                          ) : (
                            <Spin spinning={brandLoading}>
                              <BSelect
                                className={styles.select}
                                placeholder="请选择"
                                fieldNames={{
                                  label: "newsContent",
                                  value: "id",
                                }}
                                value={brandId}
                                dataList={(brandList as any[]) || []}
                                scrollPageSize={50}
                                onChange={(value: number) => {
                                  setBrandId(value)
                                  form.setFieldValue("brandId", value);
                                  form.validateFields(["brandId"]);
                                }}
                                dropdownRender={() => (
                                  <>
                                    <Divider style={{ margin: "8px 0" }} />
                                    <Space style={{ padding: "0 8px 4px" }}>
                                      <Input
                                        placeholder="品牌名"
                                        ref={addBrandRef}
                                        value={addBrandName}
                                        onChange={handleChangeAddBrandName}
                                      />
                                      <Button
                                        type="text"
                                        title="添加"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddBrand}
                                      />
                                    </Space>
                                  </>
                                )}
                              />
                            </Spin>
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item 
                        label="账号平台：" 
                        name="platId"
                        rules={[
                          { required: true, message: "请选择账号平台" },
                        ]}
                      >
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.platName || '--' }</span>
                          ) : (
                            <Select
                              options={platData} 
                              placeholder="请选择"
                              allowClear
                              fieldNames={{
                                label: 'platName',
                                value: 'platId',
                              }}
                              className={styles.select}
                              onClear={handleClearPlat}
                              onChange={handleChangePlat}
                            />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item 
                        label="订单类型：" 
                        name="projectType"
                        rules={[
                          { required: true, message: "请选择订单类型" },
                        ]}>
                          {
                            type === 'detail' ? (
                              <span>{ getConfigInfoById(projectType, String(cooperateOrderDetail.projectType), "id")?.label || "--" }</span>
                            ) : (
                              <Select
                                options={cooperOrderProjectType}  
                                allowClear
                                placeholder="请选择"
                                className={styles.select} 
                                fieldNames={{
                                  label: "dictLabel",
                                  value: "dictValue",
                                }}
                                onChange={handleChangeProjectType}
                              />
                            )
                          }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item 
                        label="下单账号：" 
                        name="accountId"
                        rules={[
                          { required: true, message: "请选择下单账号" },
                        ]}>
                          {
                            type === 'detail' ? (
                              <span>{ cooperateOrderDetail.accountName || '--' }</span>
                            ) : (
                              <Select 
                                options={accountList}
                                placeholder="请选择"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.accountName ?? '').toLowerCase().includes(input.toLowerCase())}
                                className={styles.select}
                                onFocus={handleFocusAccount}
                                onChange={handleChangeAccount}
                                fieldNames={{
                                  label: 'accountName',
                                  value: 'accountId',
                                }} 
                              />
                            )
                          }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="是否加入星图MCN：">
                        <span>{ cooperateOrderDetail.xingtuMcnTag ? `${cooperateOrderDetail.xingtuMcnTag ? '是' : '否' }` : '--' }</span>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="是否加入抖音MCN：">
                        <span>{ cooperateOrderDetail.douyinMcnTag ? `${cooperateOrderDetail.douyinMcnTag ? '是' : '否' }` : '--' }</span>

                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="商务对接人：" name="businessId">
                        {
                          type === 'detail' ? (
                            <span>
                              { 
                                cooperateOrderDetail.businessGroupName || cooperateOrderDetail.businessTeamName || cooperateOrderDetail.businessUserName ?
                                ` 
                                ${cooperateOrderDetail.businessGroupName}
                                ${cooperateOrderDetail.businessTeamName ? `- ${cooperateOrderDetail.businessTeamName}` : ''}
                                ${cooperateOrderDetail.businessUserName ? `- ${cooperateOrderDetail.businessUserName}` : ''}
                                ` 
                                :
                                '--'
                              }
                            </span>
                          ) : (
                            <Cascader 
                              options={crmGroupData}
                              className={styles.select} 
                              placeholder="请选择"
                              expandTrigger="hover"
                              changeOnSelect
                            />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item 
                        label="已定档期：" 
                        name="finishTime"
                        rules={[
                          { required: true, message: "请选择已定档期" },
                        ]}
                      >
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.finishTime ? moment(cooperateOrderDetail.finishTime).format("YYYY-MM-DD") : '--' }</span>
                          ) : (
                            <DatePicker className={styles.select} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="签约团队：" name="signGroupId">
                        {
                          type === 'add' ? (
                            <span>{ signGroupName || '--' }</span>
                          ) : (
                            <span>{ cooperateOrderDetail.signGroupName || '--' }</span>
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="达人分成比例：" name="outMoneyRatio">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.outMoneyRatio ? `${cooperateOrderDetail.outMoneyRatio}%` : '--' }</span>
                          ) : (
                            <InputNumber addonAfter="%" min={0} max={100} precision={2} step={0.01} disabled={disabledOutMoneyRatio} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="签约小组：" name="signTeamId">
                        {
                          type === 'add' ? (
                            <span>{ signTeamName || '--' }</span>
                          ) : (
                            <span>{ cooperateOrderDetail.signTeamName || '--' }</span>
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="内容协助：">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.contentAssist ? '需要' : '不需要' }</span>
                          ) : (
                            <Checkbox checked={contentAssist} onChange={handleChangeContentAssist}>需要</Checkbox>
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="经纪人：" name="signUserId">
                        {
                          type === 'add' ? (
                            <span>{ signUserName || '--' }</span>
                          ) : (
                            <span>{ cooperateOrderDetail.signUserName || '--' }</span>
                          )
                        }
                      </Form.Item>
                    </Col>

                    {
                      type === 'edit' || type === 'detail' ? (
                        <Col span={12}>
                          <Form.Item label="工单号：">
                            <span>{ cooperateOrderDetail.cooperOrderNo || '--' }</span>
                          </Form.Item>
                        </Col>
                      ) : ('')
                    }
                  </Row>
                </div>
              </div>

              <div className="m-t-24">
                <h3>订单信息</h3>
                <div className={styles.contentWrap}>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item 
                        label="账号单价：" 
                        name="accountUnitPrice"
                        rules={[
                          { required: true, message: "请输入账号单价" },
                        ]}
                      >
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.accountUnitPrice || '--' }</span>
                          ) : (
                            <InputNumber min={0} precision={2} step={0.01} onChange={handleChangeAccountUnitPrice} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="绑定视频："
                        name="selectedVideo"
                      >
                        {
                          type === 'detail' ? (
                            <>
                              {
                                cooperateOrderDetail.url || dynamicLink ? (
                                  <a
                                    href={cooperateOrderDetail.url || dynamicLink}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {videoTitle || dynamicLink}
                                  </a>
                                ) : (
                                  "--"
                                )
                              }
                            </>
                          ) : (
                            <>
                              {
                                !(videoTitle || selectVideoMsg[0]?.titleName || dynamicLink) ? (
                                  <Button type="primary" onClick={handleShowBindVideoModal}>绑定视频</Button>
                                ) : (videoTitle || selectVideoMsg[0]?.titleName) && !dynamicLink ? (
                                  <a
                                    href={selectVideoMsg[0]?.url || cooperateOrderDetail.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {selectVideoMsg[0]?.titleName || videoTitle}
                                  </a>
                                ) : (
                                  ""
                                )
                              }
                              {
                                showDynamicLink && !(videoTitle || selectVideoMsg[0]?.titleName || dynamicLink) ? (
                                  <Button type="link" onClick={() => setShowDynamicLinkInput(true)}>输入动态链接</Button>
                                ) : dynamicLink && !(videoTitle || selectVideoMsg[0]?.titleName) ? (
                                  <a
                                    href={dynamicLink}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {dynamicLink}
                                  </a>
                                ) : (
                                  ""
                                )
                              }
                              {
                                showDynamicLinkInput ? (
                                  <>
                                    <Input
                                      ref={dynamicLinkInputRef} 
                                    />
                                    <Button type="link" loading={saveDynamicLinkLoading} onClick={handleSaveDynamicLink}>保存</Button>
                                    <Button type="link" onClick={() => setShowDynamicLinkInput(false)} style={{ color: '#000' }}>取消</Button>
                                  </>
                                ) : ('')
                              }
                              {
                                (
                                  videoTitle || selectVideoMsg[0]?.titleName || dynamicLink
                                ) ? (
                                  <Button
                                    type="link"
                                    danger
                                    onClick={handleDeleteVideoMsg}
                                  >
                                    删除
                                  </Button>
                                ) : (
                                  ""
                                )
                              }
                            </>
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="客户返点比例：" name="refundRatio">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.refundRatio ? `${cooperateOrderDetail.refundRatio}%` : '--' }</span>
                          ) : (
                            <InputNumber addonAfter="%" min={0} max={100} precision={2} step={0.01} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="视频发布时间：" name="addTime">
                        <span>
                          {
                            (videoAddTime && videoAddTime !== "0000-00-00 00:00:00")  || selectVideoMsg[0]?.addTime
                             ? 
                             videoAddTime || !selectVideoMsg[0]?.addTime : "--"
                          }
                        </span>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="客户返点金额：" name="refundMoney">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.refundMoney || '--' }</span>
                          ) : (
                            <InputNumber min={0} precision={2} step={0.01} onChange={handleChangeRefundMoney} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="播放量：" name="flowCount">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.flowCount || '--' }</span>
                          ) : (
                            <InputNumber min={0} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="（订单价格）流水：" name="orderMoney" tooltip="账号单价-客户返点金额">
                        <span>{orderPriceComputedVal || orderPriceComputedVal === 0 ? orderPriceComputedVal : '--'}</span>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="CPM：" name="cpm">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.cpm || '--' }</span>
                          ) : (
                            <InputNumber min={0} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="达人实际营收：" name="outMoney">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.outMoney || '--' }</span>
                          ) : (
                            <InputNumber min={0} precision={2} step={0.01} onChange={handleChangeOutMoney} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="其他费用：" name="otherMoney" tooltip="豆荚等维护费用、或者是差旅等业务费用">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.otherMoney || '--' }</span>
                          ) : (
                            <InputNumber min={0} precision={2} step={0.01} onChange={handleChangeOtherMoney} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="工单实际营收：" name="orderActualIncome" tooltip="(订单价格)流水-达人实际营收-其他费用">
                        <span>{orderActualIncomeComputedVal || orderActualIncomeComputedVal === 0 ? orderActualIncomeComputedVal : '--'}</span>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="款项截图："
                        name="collectionScreenshots"
                        rules={requireTradeScreenshots ? [{ required: true, message: "请上传款项截图" }] : []}
                      >
                        {
                          type === 'detail' ? (
                            <>
                              {
                                fileList && fileList.length ? (
                                  <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreviewTradeScreenshots}
                                  />
                                ) : (
                                  '--'
                                )
                              }
                            </>
                          ) : (
                            <>
                              <Upload
                                action="/api/admin/uploadImage"
                                listType="picture-card"
                                fileList={fileList}
                                maxCount={5}
                                multiple
                                beforeUpload={handleBeforeUpload}
                                onPreview={handlePreviewTradeScreenshots}
                                onChange={handleChangeTradeScreenshots}
                              >
                                {
                                  fileList.length < 5 ? (
                                    <div>
                                      <PlusOutlined />
                                    </div>
                                  ) : ("")
                                }
                              </Upload>
                              <span
                                style={{
                                  color: "rgba(0,0,0,.5)",
                                  marginLeft: "4px",
                                }}
                              >
                                只支持jpg/png格式
                              </span>
                            </>
                          )
                        }
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    {
                      showPlatTaskId ? (
                        <Col span={12}>
                          <Form.Item 
                            label="平台任务ID：" 
                            name="platTaskId"
                            getValueFromEvent={e => e.target.value.replace(/\s+/g, "")}  // 屏蔽掉空格
                            rules={[
                              { required: true, message: "请输入平台任务ID" },
                            ]}
                          >
                            {
                              type === 'detail' ? (
                                <span>{ cooperateOrderDetail.platTaskId || '--' }</span>
                              ) : (
                                <Input placeholder="请输入" max={50} className={styles.input} />
                              )
                            }
                          </Form.Item>
                        </Col>
                      ) : ("")
                    }

                    <Col span={12}>
                      <Form.Item 
                        label="收付款类型："
                        name="paymentType" 
                        tooltip="根据达人实际情况，如果达人已经加入乾派MCN，则需要打款，若达人未加入乾派MCN，则需要追款"
                        rules={[{ required: true, message: "请选择收付款类型" }]}
                      >
                        {
                          type === 'detail' ? (
                            <span>{
                              getConfigInfoById(
                                performPaymentType,
                                String(cooperateOrderDetail.paymentType),
                                "dictValue"
                              )?.dictLabel || "--"}</span>
                          ) : (
                            <Select 
                              placeholder="请选择"
                              options={collectPaymentTypeList} 
                              className={styles.select} 
                              allowClear
                              onChange={handleChangePaymentType}
                            />
                          )
                        }
                      </Form.Item>
                    </Col>

                    {
                      +showPaymentStatus === 1 ? (
                        <Col span={12}>
                          <Form.Item 
                            label="付款状态：" 
                            name="paymentResult"
                            rules={[{ required: true, message: "请选择付款状态" }]}
                          >
                            {
                              type === 'detail' ? (
                                <span>
                                  {
                                    cooperateOrderDetail.paymentResult ?
                                      +cooperateOrderDetail.paymentResult === 1 ? "已付款" : "未付款"
                                      : "--"
                                  }
                                </span>
                              ) : (
                                <Select 
                                  placeholder="请选择"
                                  allowClear
                                  options={paymentTypeList} 
                                  className={styles.select} 
                                  onChange={handleChangePaymentStatus}
                                />
                              )
                            }
                          </Form.Item>
                        </Col>
                      ) : (
                        <>
                          {
                            +showPaymentStatus === 2 ? (
                              <Col span={12}>
                                <Form.Item 
                                  label="收款状态："
                                  name="paymentResult"
                                  rules={[{ required: true, message: "请选择收款状态" }]}
                                >
                                  {
                                    type === 'detail' ? (
                                      <span>
                                        {
                                          cooperateOrderDetail.paymentResult ?
                                            +cooperateOrderDetail.paymentResult === 1 ? "已收款" : "未收款"
                                            : "--"
                                        }
                                      </span>
                                    ) : (
                                      <Select 
                                        placeholder="请选择" 
                                        allowClear
                                        options={collectTypeList} 
                                        className={styles.select}
                                        onChange={handleChangeCollectStatus}
                                      />
                                    )
                                  }
                                </Form.Item>
                              </Col>
                            ) : ("")
                          }
                        </>
                      )
                    }

                    {
                      showOANo ? (
                        <>
                          <Col span={12}>
                            <Form.Item 
                              label="OA流程编号：" 
                              name="oaProcessNo"
                              getValueFromEvent={e => e.target.value.replace(/\s+/g, "")}  // 屏蔽掉空格
                              rules={[{ required: true, message: "请输入OA流程编号" }]}
                            >
                              {
                                type === 'detail' ? (
                                  <span>{ cooperateOrderDetail.oaProcessNo || '--' }</span>
                                ) : (
                                  <Input maxLength={50} className={styles.input} />
                                )
                              }
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              label="线下应付：" 
                              name="companyOfflineSupplement"
                              rules={[{ required: true, message: "请输入线下应付金额" }]}
                            >
                              {
                                type === 'detail' ? (
                                  <span>{ cooperateOrderDetail.companyOfflineSupplement || '--' }</span>
                                ) : (
                                  <InputNumber min={0} precision={2} step={0.01} />
                                )
                              }
                            </Form.Item>
                          </Col>
                        </>
                      ) : ("")
                    }

                    {
                      showMonthMoney ? (
                        <>
                          <Col span={12}>
                            <Form.Item 
                              label="绩效月：" 
                              name="monthMoney"
                              rules={[{ required: true, message: "请选择绩效月" }]}
                            >
                              {
                                type === 'detail' ? (
                                  <span>
                                    { 
                                      cooperateOrderDetail.monthMoney ? moment(cooperateOrderDetail.monthMoney).format("YYYY-MM") : '--' 
                                    }
                                  </span>
                                ) : (
                                  <DatePicker picker="month" className={styles.select} />
                                )
                              }
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              label="线下应收：" 
                              name="cusOfflineSupplement"
                              rules={[{ required: true, message: "请输入线下应收金额" }]}
                            >
                              {
                                type === 'detail' ? (
                                  <span>{ cooperateOrderDetail.cusOfflineSupplement || '--' }</span>
                                ) : (
                                  <InputNumber min={0} precision={2} step={0.01} />
                                )
                              }
                            </Form.Item>
                          </Col>
                        </>
                      ) : ("")
                    }
                  </Row>
                </div>
              </div>

              <div className="m-t-24">
                <h3>备注</h3>
                <div>
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item name="remark">
                        {
                          type === 'detail' ? (
                            <span>{ cooperateOrderDetail.remark || '--' }</span>
                          ) : (
                            <TextArea maxLength={100} showCount placeholder="请输入备注"  />
                          )
                        }
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            </Form>
          </Spin>
        </Modal>

      {/* 视频列表弹窗 */}
      <VideoList
        accountId={accountId}
        show={showBindVideoModal}
        onClose={handleCloseBindVideoModal}
        onSelectVideoMsg={handleSelectVideoMsg}
      />

      {/* 预览图片的弹窗 */}
      <Modal visible={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </ConfigProvider>
  );
};

export default AddCoopOrderModal;

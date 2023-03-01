import {
  Row,
  Col,
  Table,
  Button,
  Input,
  Modal,
  DatePicker,
  Form,
  message,
  Spin,
  ConfigProvider,
} from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import zhCN from "antd/es/locale/zh_CN";
import moment from "moment";
import {
  $getVideoList,
  VideoListParamsType,
  VideoListType,
} from "src/api/workOrderDetail";
import styles from "./VideoList.scss";

const { RangePicker } = DatePicker;

interface VideoListPropsType {
  accountId: number | undefined;
  show: boolean;
  onSelectVideoMsg: (params: VideoListType[]) => void;
  onClose: () => void;
}

interface PageType {
  pageNum: number;
  size: number;
  total?: number;
}

const VideoList: React.FC<VideoListPropsType> = ({
  accountId,
  show,
  onClose,
  onSelectVideoMsg,
}) => {
  const [page, setPage] = useState<PageType>({
    pageNum: 1,
    size: 20,
    total: 0,
  });

  const [searchData, setSearchData] = useState<VideoListParamsType>({
    accountId,
    pageNum: 1,
    size: 20,
  });
  const [selectedVideo, setSelectedVideo] = useState<VideoListType[]>([]);
  const [videoList, setVideoList] = useState<VideoListType[]>([]);
  const [videoListLoading, setVideoListLoading] = useState<boolean>(true);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: VideoListType[]) => {
      setSelectedVideo(selectedRows);
    },
  };

  const getVideoListData = async (searchData: any) => {
    try {
      setVideoListLoading(true);
      const res = await $getVideoList({
        ...searchData,
      });
      const { data: videoListData = [], total = 0 } = res;
      setPage({ ...page, total });
      setVideoList(videoListData);
      setVideoListLoading(false);
    } catch (e: any) {
      setVideoListLoading(false);
      message.error(e.message);
    }
  };

  const handleSearch = (val: VideoListParamsType) => {
    const data = val;
    const { addTime } = val;
    if (addTime?.length) {
      // eslint-disable-next-line no-underscore-dangle
      data.startDate = moment(new Date(addTime[0]?._d)).format(
        "YYYY-MM-DD"
      );
      // eslint-disable-next-line no-underscore-dangle
      data.endDate = `${moment(new Date(addTime[1]?._d)).format(
        "YYYY-MM-DD"
      )} 23:59:59`;
    } else {
      data.startDate = "";
      data.endDate = "";
    }

    delete data.addTime;
    setSearchData(Object.assign({ ...searchData }, { ...data, ...page }));
    const searchObj = Object.assign({ ...searchData }, { ...data, ...page });
    getVideoListData(searchObj);
  };

  const handlePageChange = (pageNum: number, size: number) => {
    const obj = {
      pageNum,
      size,
    };
    setPage({ ...page, ...obj });
    setSearchData(Object.assign({ ...searchData, ...page }));
    const searchObj = Object.assign({ ...searchData }, { ...page, ...obj });
    getVideoListData(searchObj);
  };

  const videoColumns: ColumnsType<VideoListType> = [
    {
      title: "标题",
      dataIndex: "titleName",
      key: "titleName",
      align: "center",
      width: 180,
      render: (titleName: string, record: VideoListType) => (
        <a
          className={styles.titleLink}
          href={record.url}
          target="_blank"
          rel="noreferrer"
        >
          {titleName}
        </a>
      ),
    },
    {
      title: "添加时间",
      dataIndex: "addTime",
      key: "addTime",
      align: "center",
      width: 130,
    },
  ];

  const handleSelectVideo = () => {
    onSelectVideoMsg(selectedVideo);
  };

  useEffect(() => {
    if (!show) return;
    setSelectedVideo([]);
    setSearchData({ ...searchData, accountId });
    const searchDataObj = { ...searchData, accountId };
    getVideoListData(searchDataObj);
  }, [show, accountId]);

  return (
    <ConfigProvider locale={zhCN}>
      <Modal
        title="视频列表"
        width={700}
        visible={show}
        okText="确认"
        cancelText="取消"
        destroyOnClose
        maskClosable={false}
        onOk={handleSelectVideo}
        onCancel={onClose}
      >
        <div className={styles.videoSearch}>
          <Form onFinish={handleSearch}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item name="title">
                  <Input placeholder="请输入标题" allowClear />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="addTime">
                  <RangePicker placeholder={["开始日期", "结束日期"]} />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        <Spin spinning={videoListLoading}>
          <Table
            rowKey='flowId'
            dataSource={videoList}
            columns={videoColumns}
            rowSelection={{
              type: "radio",
              ...rowSelection,
            }}
            pagination={{
              total: page.total,
              pageSize: page.size,
              defaultCurrent: 1,
              showQuickJumper: true,
              showSizeChanger: false,
              showTotal: total => `总共${total}条`,
              // onShowSizeChange: (cur, size) => handlePageSizeChange(size),
              onChange: (pageNum, size) => handlePageChange(pageNum, size),
            }}
          />
        </Spin>
      </Modal>
    </ConfigProvider>
  );
};

export default VideoList;

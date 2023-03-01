/* eslint-disable css-modules/no-unused-class */
import { Button, Modal } from "antd";
import Swiper from "src/components/Swiper";
import styles from "./ViewPhoto.scss";

interface ViewPhotoPropsType {
  cancelPhotoModal: () => void;
  isPhotoVisible: boolean;
  viewList:string[]
}
const ViewPhoto: React.FC<ViewPhotoPropsType> = ({
  cancelPhotoModal,
  isPhotoVisible,
  viewList,
}) => (
    <>
      <Modal
        title="查看图片"
        visible={isPhotoVisible}
        onCancel={cancelPhotoModal}
        footer={<Button type="default" onClick={cancelPhotoModal}>取消</Button>}
      >
        <div className={styles.photoWrapper}>
          <Swiper list={viewList}/>
        </div>
      </Modal>
    </>
  );

export default ViewPhoto;

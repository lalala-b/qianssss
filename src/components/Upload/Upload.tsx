/* eslint-disable no-unused-expressions */
/* eslint-disable react/no-this-in-sfc */
import { useState } from "react";
import { Upload, Button, message } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";

interface UploadPropsType {
  className?: string;
  action: string;
  fileList: UploadFile[];
  accept?: string;
  specialChar?: boolean;
  maxCount?: number;
  maxSize?: number;
  onChange: (list: UploadFile[]) => void;
  // React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  upLoadTxt?: string;
}

const RUpload: React.FC<UploadPropsType> = ({
  className,
  action,
  accept,
  specialChar,
  fileList,
  maxCount,
  maxSize,
  onChange,
  upLoadTxt,
}) => {
  const [uploading, setUploading] = useState(false);

  const uploadProps: UploadProps = {
    action,
    accept,
    beforeUpload(file: any) {
      if (specialChar) {
        const exp = /[#<$+%>!`&*'|{?"=“‘}/:\\@]+/g;
        const trimExp = new RegExp(/\s+/g);

        if (exp.test(file.name) || trimExp.test(file.name)) {
          message.error(`文件名不能包含特殊符号，请修改后重新上传`);
          return Upload.LIST_IGNORE;
        }
      }

      if (maxSize) {
        if (file.size / 1024 / 1024 > maxSize) {
          message.error(`文件大小不能超过${maxSize}M，请重新上传`);
          return Upload.LIST_IGNORE;
        }
      }

      onChange([...fileList, file]);
      return true;
    },
    onRemove(file) {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      onChange(newFileList);
    },
    onChange: data => {
      const { status, response } = data.file;

      if (status === "uploading") {
        setUploading(true);
      } else {
        setUploading(false);
      }

      if (status === "done") {
        if (response.code !== 1) {
          message.error(response.message || "上传失败，请重试");
          const index = fileList.indexOf(data.file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          onChange(newFileList);
          return;
        }

        if (response.code === 0) {
          message.error(response.message || "上传失败，请重试");
          const index = fileList.indexOf(data.file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          onChange(newFileList);
        } else {
          const index = fileList.findIndex(item => item.uid === data.file.uid);
          const newFileList = fileList.slice();
          newFileList[index] = {
            ...data.file,
            url: response.data,
          };
          onChange(newFileList);
        }
      }

      if (status === "error") {
        message.error(response.message || "上传失败，请重试");
        const index = fileList.indexOf(data.file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        onChange(newFileList);
      }
    },
    fileList,
  };

  return (
    <Upload {...uploadProps} maxCount={maxCount} className={className}>
      <Button
        icon={<UploadOutlined />}
        disabled={maxCount ? fileList.length >= maxCount : false}
        loading={uploading}
      >
        {upLoadTxt || "选择上传文件"}
      </Button>
    </Upload>
  );
};

export default RUpload;

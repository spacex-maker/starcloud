import React from 'react';
import { Upload, Button, message } from 'antd';
import { InboxOutlined, LockOutlined } from '@ant-design/icons';
import { formatFileSize } from '../../../utils';
import { StyledUploadSection } from '../styles/StyledComponents';

const { Dragger } = Upload;

const UploadSection = ({
  files,
  maxFileSize,
  decrypting,
  selectedFiles,
  handleFileSelect,
  handleStartDecrypt,
  handleClearFiles
}) => {
  return (
    <StyledUploadSection>
      <div className="upload-area">
        <Dragger
          accept=".encrypted"
          beforeUpload={() => false}
          onChange={handleFileSelect}
          showUploadList={false}
          multiple={true}
          openFileDialogOnClick={true}
          customRequest={() => {}}
          fileList={files}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            点击或拖拽文件
          </p>
          <p className="ant-upload-hint">
            支持批量添加 .encrypted 文件，单个文件最大 {formatFileSize(maxFileSize)}
          </p>
        </Dragger>
      </div>

      <div className="action-buttons">
        <Button
          type="primary"
          icon={<LockOutlined />}
          onClick={handleStartDecrypt}
          loading={decrypting}
          disabled={selectedFiles.length === 0}
        >
          解密选中文件
        </Button>
        {files.length > 0 && (
          <Button
            danger
            onClick={handleClearFiles}
            disabled={decrypting}
          >
            清空列表
          </Button>
        )}
      </div>
    </StyledUploadSection>
  );
};

export default UploadSection; 
import React from 'react';
import { Modal, Button } from 'antd';
import { FileOutlined } from '@ant-design/icons';

// 工具函数
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DuplicateFilesModal = ({ 
  visible, 
  duplicateFiles, 
  onCancel, 
  onSkip, 
  onOverwrite 
}) => {
  return (
    <Modal
      title="发现重复文件"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="skip" onClick={onSkip}>
          跳过重复文件
        </Button>,
        <Button 
          key="overwrite" 
          type="primary" 
          danger
          onClick={onOverwrite}
        >
          覆盖重复文件
        </Button>,
      ]}
    >
      <p>以下文件已存在于当前目录：</p>
      <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {duplicateFiles.map((file, index) => (
          <li key={index} style={{ marginBottom: '8px' }}>
            <FileOutlined style={{ marginRight: '8px' }} />
            {file.name} ({formatSize(file.size)})
          </li>
        ))}
      </ul>
      <p>请选择如何处理这些文件。</p>
    </Modal>
  );
};

export default DuplicateFilesModal; 
import React from 'react';
import { Modal, Input } from 'antd';

const NewFolderModal = ({
  visible,
  folderName,
  onFolderNameChange,
  onOk,
  onCancel,
  loading
}) => {
  return (
    <Modal
      title="新建文件夹"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Input
        placeholder="请输入文件夹名称"
        value={folderName}
        onChange={(e) => onFolderNameChange(e.target.value)}
        onPressEnter={onOk}
        autoFocus
      />
    </Modal>
  );
};

export default NewFolderModal; 
import React, { useState } from 'react';
import { Modal, Input } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';

interface NewFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFolder: () => void;
  folderName: string;
  setFolderName: (name: string) => void;
}

const NewFolderModal: React.FC<NewFolderModalProps> = ({
  visible,
  onClose,
  onCreateFolder,
  folderName,
  setFolderName,
}) => {
  const intl = useIntl();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolderSafely = async () => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      onCreateFolder();
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setFolderName('');
  };

  return (
    <Modal
      title={<FormattedMessage id="filelist.modal.newFolder.title" defaultMessage="新建文件夹" />}
      open={visible}
      onOk={handleCreateFolderSafely}
      onCancel={handleCancel}
      okButtonProps={{ 
        loading: isCreating,
        disabled: !folderName.trim()
      }}
      okText={<FormattedMessage id="filelist.modal.newFolder.ok" defaultMessage="创建" />}
      cancelText={<FormattedMessage id="filelist.modal.newFolder.cancel" defaultMessage="取消" />}
      maskClosable={false}
      keyboard={false}
      destroyOnClose
    >
      <Input
        placeholder={intl.formatMessage({ 
          id: "filelist.modal.newFolder.placeholder",
          defaultMessage: "请输入文件夹名称"
        })}
        value={folderName}
        onChange={e => setFolderName(e.target.value)}
        onPressEnter={(e) => {
          if (folderName.trim() && !isCreating) {
            handleCreateFolderSafely();
          }
        }}
        disabled={isCreating}
        autoFocus
        maxLength={255}
      />
    </Modal>
  );
};

export default NewFolderModal; 
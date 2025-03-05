import React, { memo, useState } from 'react';
import { Space, Button, Typography, Tooltip, theme, Input, Modal } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  FileImageOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { FileModel } from 'models/file/FileModel';
import { formatFileSize, isImageFile, getEllipsisFileName } from 'utils/format';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import { updateFileName, loadFiles } from 'services/fileService';

const { Text } = Typography;
const { useToken } = theme;

const FileItemWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background-color: var(--ant-color-bg-elevated);
  }
`;

const FileIcon = styled.div`
  margin-right: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled(Text)`
  &.clickable {
    cursor: pointer;
    
    &:hover {
      color: var(--ant-color-primary);
    }
  }
`;

const FileSize = styled(Text)`
  font-size: 12px;
  color: var(--ant-color-text-secondary);
`;

interface FileItemProps {
  file: FileModel;
  onFolderClick?: (file: FileModel) => void;
  showSize?: boolean;
  currentParentId: number;
  setLoading: (loading: boolean) => void;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  setPagination: (pagination: any) => void;
  pagination: any;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onFolderClick,
  showSize = true,
  currentParentId,
  setLoading,
  setFiles,
  setFilteredFiles,
  setSearchText,
  setPagination,
  pagination
}) => {
  const { token } = useToken();
  const intl = useIntl();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [renameLoading, setRenameLoading] = useState(false);

  const handleRename = async () => {
    if (newName.trim() === '') {
      return;
    }

    if (newName === file.name) {
      setIsRenaming(false);
      return;
    }

    setRenameLoading(true);
    setLoading(true);

    try {
      const success = await updateFileName(file.id, newName, currentParentId);
      if (success) {
        // 刷新文件列表
        await loadFiles(
          currentParentId,
          setLoading,
          setFiles,
          setFilteredFiles,
          setSearchText,
          setPagination,
          pagination
        );
        setIsRenaming(false);
      }
    } finally {
      setRenameLoading(false);
      setLoading(false);
    }
  };

  const renderFileIcon = () => {
    if (file.isDirectory) {
      return <FolderOutlined style={{ color: token.colorPrimary }} />;
    }
    if (isImageFile(file.name)) {
      return <FileImageOutlined style={{ color: token.colorInfo }} />;
    }
    return <FileOutlined />;
  };

  return (
    <FileItemWrapper>
      <FileIcon>{renderFileIcon()}</FileIcon>
      <FileInfo>
        <Space>
          <Tooltip title={file.name}>
            <FileName
              ellipsis
              className={file.isDirectory ? 'clickable' : ''}
              onClick={() => file.isDirectory && onFolderClick?.(file)}
            >
              {getEllipsisFileName(file.name)}
            </FileName>
          </Tooltip>
          {file.isDirectory && (
            <Tooltip title={intl.formatMessage({ id: 'filelist.action.rename' })}>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  setNewName(file.name);
                }}
              />
            </Tooltip>
          )}
        </Space>
        {showSize && (
          <FileSize>
            {file.isDirectory ? '-' : formatFileSize(file.size)}
          </FileSize>
        )}
      </FileInfo>

      <Modal
        title={<FormattedMessage id="filelist.modal.rename.title" defaultMessage="重命名" />}
        open={isRenaming}
        onOk={handleRename}
        onCancel={() => {
          setIsRenaming(false);
          setNewName(file.name);
        }}
        confirmLoading={renameLoading}
        maskClosable={false}
        keyboard={false}
      >
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleRename}
          autoFocus
          maxLength={255}
          placeholder={intl.formatMessage({ id: 'filelist.modal.rename.placeholder' })}
        />
      </Modal>
    </FileItemWrapper>
  );
};

export default memo(FileItem); 
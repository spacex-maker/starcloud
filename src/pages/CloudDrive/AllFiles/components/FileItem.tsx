import React, { memo } from 'react';
import { Space, Button, Typography, Tooltip, theme } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  FileImageOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { FileModel } from 'models/file/FileModel';
import { formatFileSize, isImageFile, getEllipsisFileName } from 'utils/format';
import styled from 'styled-components';

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
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onFolderClick,
  showSize = true
}) => {
  const { token } = useToken();

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
        <Tooltip title={file.name}>
          <FileName
            ellipsis
            className={file.isDirectory ? 'clickable' : ''}
            onClick={() => file.isDirectory && onFolderClick?.(file)}
          >
            {getEllipsisFileName(file.name)}
          </FileName>
        </Tooltip>
        {showSize && (
          <FileSize>
            {file.isDirectory ? '-' : formatFileSize(file.size)}
          </FileSize>
        )}
      </FileInfo>
    </FileItemWrapper>
  );
};

export default memo(FileItem); 
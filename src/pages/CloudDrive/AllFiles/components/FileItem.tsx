import React, { memo, useState } from 'react';
import { Space, Button, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { FileModel } from 'models/file/FileModel';
import styled from 'styled-components';
import { useIntl } from 'react-intl';
import RenameModal from './RenameModal';
import FileIcon from './FileIcon';
import FileName from './FileName';
import FileSize from './FileSize';

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

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

interface FileItemProps {
  file: FileModel;
  onFolderClick?: (file: FileModel) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onFolderClick
}) => {
  const intl = useIntl();
  const [isRenaming, setIsRenaming] = useState(false);

  return (
    <FileItemWrapper>
      <FileIcon file={file} />
      <FileInfo>
        <Space>
          <FileName file={file} onClick={onFolderClick} />
          {file.isDirectory && (
            <Tooltip title={intl.formatMessage({ id: 'filelist.action.rename' })}>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      </FileInfo>

      <RenameModal
        file={file}
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
      />
    </FileItemWrapper>
  );
};

export default memo(FileItem); 
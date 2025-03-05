import React from 'react';
import { Typography, Tooltip } from 'antd';
import { FileModel } from 'models/file/FileModel';
import { getEllipsisFileName } from 'utils/format';
import styled from 'styled-components';

const { Text } = Typography;

const StyledFileName = styled(Text)`
  &.clickable {
    cursor: pointer;
    
    &:hover {
      color: var(--ant-color-primary);
    }
  }
`;

interface FileNameProps {
  file: FileModel;
  onClick?: (file: FileModel) => void;
}

const FileName: React.FC<FileNameProps> = ({ file, onClick }) => {
  const handleClick = () => {
    if (file.isDirectory && onClick) {
      onClick(file);
    }
  };

  return (
    <Tooltip title={file.name}>
      <StyledFileName
        ellipsis
        className={file.isDirectory ? 'clickable' : ''}
        onClick={handleClick}
      >
        {getEllipsisFileName(file.name)}
      </StyledFileName>
    </Tooltip>
  );
};

export default FileName; 
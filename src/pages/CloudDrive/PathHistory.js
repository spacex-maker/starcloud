import React from 'react';
import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import tw, { styled } from 'twin.macro';

const PathContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--ant-color-border);
`;

const PathItem = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--ant-color-text-secondary);
  font-size: 14px;
  
  &:hover {
    color: var(--ant-color-primary);
  }
`;

const PathSeparator = styled(RightOutlined)`
  color: var(--ant-color-text-quaternary);
  font-size: 12px;
`;

const HomeIcon = styled(HomeOutlined)`
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--ant-color-primary);
  }
`;

const PathHistory = ({ pathHistory = [], onHomeClick, onPathClick }) => {
  return (
    <PathContainer>
      <HomeIcon onClick={onHomeClick} />
      {pathHistory.map((path, index) => (
        <React.Fragment key={path.id || index}>
          <PathSeparator />
          <PathItem onClick={() => onPathClick(index)}>
            {path.name}
          </PathItem>
        </React.Fragment>
      ))}
    </PathContainer>
  );
};

export default PathHistory; 
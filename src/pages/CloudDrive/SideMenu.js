import React, { useState } from 'react';
import { Menu } from 'antd';
import { FolderOutlined, InfoCircleOutlined, BulbOutlined } from '@ant-design/icons';
import { styled } from 'twin.macro';
import FeedbackModal from '../../components/modals/FeedbackModal';

const StyledSider = styled.aside`
  background: var(--ant-color-bg-container);
  border-right: 1px solid var(--ant-color-border);
  height: 100%;
  width: 200px;
  position: relative;
  flex-shrink: 0;

  .ant-menu {
    height: calc(100% - 180px);
    border-right: none;
    padding: 8px;
    background: transparent;
  }

  .ant-menu-item {
    border-radius: 4px;
    margin: 4px 0;
    
    &:hover {
      background-color: var(--ant-color-bg-elevated);
    }
    
    &.ant-menu-item-selected {
      background-color: var(--ant-color-primary-bg);
      
      &:hover {
        background-color: var(--ant-color-primary-bg);
      }
    }
  }
`;

const BottomButtons = styled.div`
  position: absolute;
  bottom: 24px;
  left: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ant-color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  width: 100%;
  
  &:hover {
    background: var(--ant-color-bg-elevated);
  }

  ${props => props.primary && `
    color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
    
    &:hover {
      background: var(--ant-color-primary-bg-hover);
    }
  `}
`;

const SideMenu = ({ selectedKeys, onSelect, onAboutClick }) => {
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  const handleFeedbackClick = () => {
    console.log('Opening feedback modal');
    setIsFeedbackVisible(true);
  };

  const handleFeedbackClose = () => {
    console.log('Closing feedback modal');
    setIsFeedbackVisible(false);
  };

  const menuItems = [
    {
      key: 'all',
      icon: <FolderOutlined />,
      label: '全部文件',
    },
    {
      key: 'images',
      icon: <FolderOutlined />,
      label: '图片',
    },
    {
      key: 'documents',
      icon: <FolderOutlined />,
      label: '文档',
    },
    {
      key: 'videos',
      icon: <FolderOutlined />,
      label: '视频',
    },
  ];

  console.log('Current modal state:', isFeedbackVisible);

  return (
    <StyledSider>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onSelect={({ key }) => onSelect(key)}
        items={menuItems}
      />
      <BottomButtons>
        <ActionButton 
          primary 
          type="button"
          onClick={handleFeedbackClick}
        >
          <BulbOutlined />
          提交需求
        </ActionButton>
        <ActionButton 
          type="button" 
          onClick={onAboutClick}
        >
          <InfoCircleOutlined />
          关于我们
        </ActionButton>
      </BottomButtons>

      <FeedbackModal
        open={isFeedbackVisible}
        onClose={handleFeedbackClose}
      />
    </StyledSider>
  );
};

export default SideMenu; 
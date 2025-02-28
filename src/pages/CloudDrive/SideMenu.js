import React from 'react';
import { Menu } from 'antd';
import { FolderOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { styled } from 'twin.macro';

const StyledSider = styled.aside`
  background: var(--ant-color-bg-container);
  border-right: 1px solid var(--ant-color-border);
  height: 100%;
  width: 200px;
  position: relative;
  flex-shrink: 0;

  .ant-menu {
    height: calc(100% - 120px);
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

const AboutButton = styled.button`
  position: absolute;
  bottom: 24px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ant-color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  width: calc(100% - 32px);
  
  &:hover {
    background: var(--ant-color-bg-elevated);
  }
`;

const SideMenu = ({ selectedKeys, onSelect, onAboutClick }) => {
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

  return (
    <StyledSider>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onSelect={({ key }) => onSelect(key)}
        items={menuItems}
      />
      <AboutButton onClick={onAboutClick}>
        <InfoCircleOutlined />
        关于我们
      </AboutButton>
    </StyledSider>
  );
};

export default SideMenu; 
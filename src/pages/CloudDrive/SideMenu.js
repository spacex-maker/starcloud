import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  CloudOutlined,
  StarOutlined,
  FolderOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CommentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LockOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import FeedbackModal from 'components/modals/FeedbackModal';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  background: ${props => props.theme.mode === 'dark' 
    ? '#141414'
    : '#fff'} !important;
  border-right: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  height: calc(100vh - 64px);
  overflow: auto;
  z-index: 99;

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${props => props.theme.mode === 'dark' 
      ? '#141414'
      : '#fff'};
  }

  // 添加响应式样式
  @media (max-width: 768px) {
    position: fixed !important;
    z-index: 999;
    height: 100vh !important;
    top: 0;
    left: 0;
    transition: all 0.2s ease-in-out;
    box-shadow: ${props => props.collapsed ? 'none' : '2px 0 8px rgba(0, 0, 0, 0.15)'};
    transform: ${props => props.collapsed ? 'translateX(-100%)' : 'translateX(0)'};
  }
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  border-inline-end: none !important;
  padding: 8px;
  
  .ant-menu-item {
    border-radius: 6px;
    margin: 4px 0 !important;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'} !important;
    }
    
    &.ant-menu-item-selected {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.06)'} !important;
    }
  }
`;

const BottomMenu = styled(Menu)`
  border-inline-end: none !important;
  padding: 8px;
  border-top: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  
  .ant-menu-item {
    border-radius: 6px;
    margin: 4px 0 !important;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'} !important;
    }
  }
`;

// 添加折叠按钮样式
const CollapseTrigger = styled.div`
  position: fixed;
  left: ${props => props.collapsed ? '0' : '200px'};
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  border-left: none;
  border-radius: 0 24px 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease-in-out;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fafafa'};
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

// 添加遮罩层样式
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 998;
  display: ${props => props.visible ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const SideMenu = ({ selectedKeys, onSelect, onAboutClick, collapsed, onCollapse }) => {
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      if (!mobile) {
        onCollapse(false);
      } else {
        onCollapse(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onCollapse]);

  const mainMenuItems = [
    {
      key: 'all',
      icon: <CloudOutlined />,
      label: '全部文件'
    },
    {
      key: 'starred',
      icon: <StarOutlined />,
      label: '收藏夹'
    },
    {
      key: 'folders',
      icon: <FolderOutlined />,
      label: '文件夹'
    },
    {
      key: 'trash',
      icon: <DeleteOutlined />,
      label: '回收站'
    },
    {
      key: 'decrypt',
      icon: <LockOutlined />,
      label: '解密工具'
    }
  ];

  const bottomMenuItems = [
    {
      key: 'feedback',
      icon: <CommentOutlined />,
      label: '提交需求'
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: '关于'
    }
  ];

  const handleMenuSelect = ({ key }) => {
    if (key === 'decrypt') {
      navigate('/decrypt');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }
    
    if (!['about', 'feedback'].includes(key)) {
      onSelect(key);
      if (isMobile) {
        onCollapse(true);
      }
    } else if (key === 'about') {
      onAboutClick();
      if (isMobile) {
        onCollapse(true);
      }
    } else if (key === 'feedback') {
      setIsFeedbackVisible(true);
      if (isMobile) {
        onCollapse(true);
      }
    }
  };

  return (
    <>
      <StyledSider width={200} collapsed={collapsed}>
        <StyledMenu
          mode="inline"
          selectedKeys={selectedKeys}
          items={mainMenuItems}
          onSelect={handleMenuSelect}
        />
        <BottomMenu
          mode="inline"
          selectedKeys={[]}
          items={bottomMenuItems}
          onSelect={handleMenuSelect}
        />
      </StyledSider>

      <CollapseTrigger
        onClick={() => onCollapse(!collapsed)}
        collapsed={collapsed}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </CollapseTrigger>

      <Overlay 
        visible={!collapsed && isMobile} 
        onClick={() => onCollapse(true)}
      />

      <FeedbackModal
        open={isFeedbackVisible}
        onClose={() => setIsFeedbackVisible(false)}
      />
    </>
  );
};

export default SideMenu; 
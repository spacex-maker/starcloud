import React, { useState, useEffect } from 'react';
import { Button, Progress, Space, Tooltip, Typography } from 'antd';
import {
  DownloadOutlined,
  CloseOutlined,
  MinusOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { formatFileSize, formatSpeed, getEllipsisFileName } from 'utils/format';

const { Text } = Typography;

const MOBILE_BREAKPOINT = 768;

const DownloadContainer = styled.div`
  position: fixed;
  top: ${props => props.position ? props.position.y : 'auto'};
  left: ${props => props.position ? props.position.x : 'auto'};
  bottom: ${props => props.position ? 'auto' : (props.collapsed ? '20px' : '40px')};
  right: ${props => props.position ? 'auto' : '20px'};
  width: ${props => {
    if (props.minimized) return '56px';
    if (props.isMobile) {
      if (props.expanded) return 'calc(100% - 40px)';
      return '360px';
    }
    return '360px';
  }};
  max-width: calc(100% - 40px);
  height: ${props => props.minimized ? '56px' : 'auto'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  border-radius: ${props => props.minimized ? '50%' : '8px'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.08)'};
  z-index: 1000;
  transition: none;
  color: var(--ant-color-text);
  user-select: none;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  
  ${props => props.minimized && `
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
  `}
`;

const DownloadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  cursor: move;
  
  .title {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
`;

const DownloadList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.15)'};
    border-radius: 3px;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(0, 0, 0, 0.25)'};
    }
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 3px;
  }
`;

const DownloadItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  margin-bottom: 8px;
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.03)'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.03)'};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .filename {
      font-weight: 500;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 12px;
    }
  }
  
  .item-progress {
    margin-bottom: 4px;
  }
  
  .item-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--ant-color-text-secondary);
  }

  .download-size {
    font-size: 12px;
    color: var(--ant-color-text-secondary);
    margin-top: 2px;
    display: flex;
    justify-content: flex-end;
  }

  .size-divider {
    margin: 0 4px;
    color: var(--ant-color-text-quaternary);
  }
`;

const IconButton = styled(Button)`
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.ant-btn-text {
    color: var(--ant-color-text);
    
    &:hover {
      background: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.06)'};
    }
    
    &:active {
      background: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.16)'
        : 'rgba(0, 0, 0, 0.08)'};
    }
  }
`;

const DownloadBubbleIndicator = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .download-count {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--ant-color-primary);
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    padding: 0 4px;
  }
  
  .download-icon {
    font-size: 24px;
    color: var(--ant-color-text);
  }
`;

const DownloadManager = ({ downloads, onCancel, onClear, onCollapse }) => {
  const containerRef = React.useRef(null);
  const [collapsed, setCollapsed] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState(new Map());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const containerSizeRef = React.useRef({ width: 0, height: 0 });
  const rafRef = React.useRef(null);
  const lastPositionRef = React.useRef({ x: 0, y: 0 });
  
  const activeDownloads = downloads.filter(d => d.status === 'downloading');
  const completedDownloads = downloads.filter(d => ['completed', 'error'].includes(d.status));
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hasDownloads = activeDownloads.length > 0 || completedDownloads.length > 0;
    if (!hasDownloads) {
      setCollapsed(true);
      if (onCollapse) {
        onCollapse(true);
      }
    } else if (activeDownloads.length > 0) {
      setCollapsed(false);
      if (onCollapse) {
        onCollapse(false);
      }
    }
  }, [activeDownloads.length, completedDownloads.length]);

  const handleCollapse = () => {
    if (isMobile) {
      setExpanded(!expanded);
    } else {
      setCollapsed(!collapsed);
      if (onCollapse) {
        onCollapse(!collapsed);
      }
    }
  };

  // 更新容器尺寸
  const updateContainerSize = React.useCallback(() => {
    if (containerRef.current) {
      containerSizeRef.current = {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      };
    }
  }, []);

  // 在最小化状态改变时更新尺寸
  useEffect(() => {
    updateContainerSize();
  }, [minimized, updateContainerSize]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.actions')) return;
    
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragOffsetRef.current = {
      x: clientX - e.currentTarget.getBoundingClientRect().left,
      y: clientY - e.currentTarget.getBoundingClientRect().top
    };
  };

  const handleMouseMove = React.useCallback((e) => {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    let x = clientX - dragOffsetRef.current.x;
    let y = clientY - dragOffsetRef.current.y;
    
    // 边界检查
    const maxX = window.innerWidth - containerSizeRef.current.width;
    const maxY = window.innerHeight - containerSizeRef.current.height;
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    
    // 使用 requestAnimationFrame 优化更新
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      if (x !== lastPositionRef.current.x || y !== lastPositionRef.current.y) {
        lastPositionRef.current = { x, y };
        setPosition({
          x: `${x}px`,
          y: `${y}px`
        });
      }
    });
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: true });
      document.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 清理下载的URL
  const cleanupDownloadUrl = (downloadId) => {
    if (downloadUrls.has(downloadId)) {
      URL.revokeObjectURL(downloadUrls.get(downloadId));
      setDownloadUrls(prev => {
        const newUrls = new Map(prev);
        newUrls.delete(downloadId);
        return newUrls;
      });
    }
  };

  // 处理下载完成
  const handleDownloadComplete = (downloadId, blob, filename) => {
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    setDownloadUrls(prev => new Map(prev).set(downloadId, url));

    // 创建下载容器
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -100%;
      left: -100%;
      width: 0;
      height: 0;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    // 创建下载iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    container.appendChild(iframe);

    // 开始下载
    iframe.src = url;

    // 清理
    setTimeout(() => {
      container.remove();
      cleanupDownloadUrl(downloadId);
    }, 1000);
  };

  useEffect(() => {
    // 组件卸载时清理所有URL
    return () => {
      downloadUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleMinimize = () => {
    setMinimized(!minimized);
    if (!minimized) {
      setCollapsed(true);
      setExpanded(false);
      if (onCollapse) {
        onCollapse(true);
      }
    }
  };

  if (minimized) {
    return (
      <DownloadContainer 
        ref={containerRef}
        isMobile={isMobile} 
        minimized={minimized}
        position={position}
        onClick={handleMinimize}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <DownloadBubbleIndicator>
          <DownloadOutlined className="download-icon" />
          {activeDownloads.length > 0 && (
            <div className="download-count">{activeDownloads.length}</div>
          )}
        </DownloadBubbleIndicator>
      </DownloadContainer>
    );
  }

  return (
    <DownloadContainer 
      ref={containerRef}
      isMobile={isMobile} 
      expanded={expanded} 
      collapsed={collapsed}
      position={position}
    >
      <DownloadHeader 
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="title">
          <DownloadOutlined />
          Downloads {activeDownloads.length > 0 && `(${activeDownloads.length})`}
        </div>
        <div className="actions">
          {(activeDownloads.length > 0 || completedDownloads.length > 0) && (
            <IconButton
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={onClear}
              title="Clear completed"
            />
          )}
          <IconButton
            type="text"
            icon={<MinusOutlined />}
            onClick={handleMinimize}
            title="Minimize"
          />
          <IconButton
            type="text"
            icon={isMobile ? (expanded ? <DownOutlined /> : <UpOutlined />) : (collapsed ? <UpOutlined /> : <DownOutlined />)}
            onClick={handleCollapse}
            title={collapsed ? 'Expand' : 'Collapse'}
          />
        </div>
      </DownloadHeader>
      {!collapsed && (
        <DownloadList>
          {activeDownloads.map((download) => (
            <DownloadItem key={download.id}>
              <div className="item-header">
                <Tooltip title={download.filename}>
                  <Text className="filename">{getEllipsisFileName(download.filename)}</Text>
                </Tooltip>
                {download.status === 'downloading' && (
                  <IconButton
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => onCancel(download.id)}
                  />
                )}
              </div>
              <div className="item-progress">
                <Progress
                  percent={download.progress}
                  status={download.status === 'error' ? 'exception' : undefined}
                  strokeColor={download.status === 'completed' ? '#52c41a' : undefined}
                  size="small"
                />
                {download.status === 'downloading' && (
                  <div className="download-size">
                    <span>{formatFileSize(download.loadedBytes)}</span>
                    <span className="size-divider">/</span>
                    <span>{formatFileSize(download.totalBytes)}</span>
                  </div>
                )}
              </div>
              <div className="item-info">
                <span>
                  {download.status === 'downloading' && formatSpeed(download.speed)}
                  {download.status === 'completed' && '已完成'}
                  {download.status === 'error' && '下载失败'}
                </span>
                {download.status !== 'downloading' && (
                  <span>{formatFileSize(download.totalBytes)}</span>
                )}
              </div>
            </DownloadItem>
          ))}
          {completedDownloads.map((download) => (
            <DownloadItem key={download.id}>
              <div className="item-header">
                <Tooltip title={download.filename}>
                  <Text className="filename">{getEllipsisFileName(download.filename)}</Text>
                </Tooltip>
                <div className="item-info">
                  <span>{formatFileSize(download.totalBytes)}</span>
                </div>
              </div>
            </DownloadItem>
          ))}
        </DownloadList>
      )}
    </DownloadContainer>
  );
};

export default DownloadManager; 
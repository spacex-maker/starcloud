import React, { useState, useEffect } from 'react';
import { Button, Progress, Space } from 'antd';
import {
  DownloadOutlined,
  CloseOutlined,
  MinusOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const DownloadContainer = styled.div`
  position: fixed;
  bottom: ${props => props.collapsed ? '20px' : '40px'};
  right: 20px;
  width: 360px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  border-radius: 8px;
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.08)'};
  z-index: 1000;
  transition: all 0.3s ease;
  color: var(--ant-color-text);
`;

const DownloadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  
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

const formatSpeed = (bytesPerSecond) => {
  if (!bytesPerSecond) return '0 KB/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let value = bytesPerSecond;
  let unitIndex = 0;
  
  while (value > 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

const formatSize = (bytes) => {
  // 确保输入是数字
  const size = Number(bytes);
  if (!size || isNaN(size)) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = size;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

const DownloadManager = ({ downloads, onCancel, onClear, onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState(new Map());
  
  const activeDownloads = downloads.filter(d => d.status === 'downloading');
  const completedDownloads = downloads.filter(d => ['completed', 'error'].includes(d.status));
  
  const handleCollapse = () => {
    setCollapsed(!collapsed);
    if (onCollapse) {
      onCollapse(!collapsed);
    }
  };

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

  if (collapsed) {
    return (
      <DownloadContainer collapsed>
        <DownloadHeader>
          <div className="title">
            <DownloadOutlined />
            {activeDownloads.length > 0 && (
              <span>{activeDownloads.length} 个下载进行中</span>
            )}
          </div>
          <div className="actions">
            <IconButton
              type="text"
              icon={<UpOutlined />}
              onClick={handleCollapse}
            />
          </div>
        </DownloadHeader>
      </DownloadContainer>
    );
  }

  return (
    <DownloadContainer>
      <DownloadHeader>
        <div className="title">
          <DownloadOutlined />
          <span>下载管理器</span>
        </div>
        <div className="actions">
          <IconButton
            type="text"
            icon={<DeleteOutlined />}
            onClick={onClear}
            disabled={completedDownloads.length === 0}
          />
          <IconButton
            type="text"
            icon={<MinusOutlined />}
            onClick={handleCollapse}
          />
        </div>
      </DownloadHeader>
      <DownloadList>
        {downloads.map((download) => (
          <DownloadItem key={download.id}>
            <div className="item-header">
              <div className="filename">{download.filename}</div>
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
                  <span>{formatSize(download.loadedBytes)}</span>
                  <span className="size-divider">/</span>
                  <span>{formatSize(download.totalBytes)}</span>
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
                <span>{formatSize(download.totalBytes)}</span>
              )}
            </div>
          </DownloadItem>
        ))}
      </DownloadList>
    </DownloadContainer>
  );
};

export default DownloadManager; 
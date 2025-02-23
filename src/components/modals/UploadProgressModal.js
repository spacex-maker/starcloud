import React from 'react';
import { Modal, Button, Spin } from 'antd';
import { 
  CloudUploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const ProgressWrapper = styled.div`
  .total-progress {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--ant-color-border);
  }

  .progress-card {
    padding: 16px 0;
    border-bottom: 1px solid var(--ant-color-border);
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    &:first-child {
      padding-top: 0;
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .file-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ant-color-text);

    .file-icon {
      color: var(--ant-color-text-secondary);
      flex-shrink: 0;
    }
  }

  .upload-info {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: var(--ant-color-text-secondary);
  }

  .progress-bar {
    height: 6px;
    border-radius: 3px;
    margin: 8px 0;
    background-color: var(--ant-color-bg-container);

    .progress-inner {
      height: 100%;
      border-radius: 3px;
      background-color: var(--ant-color-primary);
      transition: width 0.3s ease;
    }

    &.complete .progress-inner {
      background-color: var(--ant-color-success);
    }
  }

  .progress-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    margin-top: 8px;
    color: var(--ant-color-text-secondary);
  }

  .success-icon {
    color: var(--ant-color-success);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .time-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--ant-color-text-secondary);
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    
    &.uploading {
      background-color: var(--ant-color-primary-bg);
      color: var(--ant-color-primary);
    }
    
    &.complete {
      background-color: var(--ant-color-success-bg);
      color: var(--ant-color-success);
    }
  }

  .file-type {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    background-color: var(--ant-color-bg-container);
    color: var(--ant-color-text-secondary);
    margin-left: 8px;
    text-transform: uppercase;
  }
`;

// 工具函数
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString();
};

const UploadProgressModal = ({ 
  visible, 
  uploading, 
  progress, 
  speeds, 
  startTimes = {}, 
  fileSizes = {}, 
  onClose 
}) => {
  const calculateTotalProgress = () => {
    if (!progress || Object.keys(progress).length === 0) return 0;
    const total = Object.values(progress).reduce((acc, curr) => acc + curr, 0);
    return Math.round(total / Object.keys(progress).length);
  };

  const calculateTimeElapsed = (startTime) => {
    if (!startTime) return '0秒';
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分${seconds % 60}秒`;
  };

  const calculateRemainingTime = (speed, percent, filename) => {
    if (percent >= 100) return '0秒';
    if (!speed || !uploading) return '计算中...';
    
    const speedValue = parseFloat(speed);
    if (isNaN(speedValue) || speedValue <= 0) return '计算中...';

    const totalSize = fileSizes[filename];
    if (!totalSize) return '计算中...';

    const remainingBytes = totalSize * (1 - percent / 100);
    const remainingSeconds = Math.ceil(remainingBytes / (speedValue * 1024 * 1024));
    
    if (remainingSeconds < 60) return `${remainingSeconds}秒`;
    if (remainingSeconds < 3600) {
      const minutes = Math.floor(remainingSeconds / 60);
      return `${minutes}分${remainingSeconds % 60}秒`;
    }
    const hours = Math.floor(remainingSeconds / 3600);
    return `${hours}时${Math.floor((remainingSeconds % 3600) / 60)}分`;
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx': return <FileWordOutlined style={{ color: '#1677ff' }} />;
      case 'xls':
      case 'xlsx': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'ppt':
      case 'pptx': return <FilePptOutlined style={{ color: '#fa8c16' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FileImageOutlined style={{ color: '#13c2c2' }} />;
      case 'zip':
      case 'rar': return <FileZipOutlined style={{ color: '#722ed1' }} />;
      case 'txt': return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
      case 'md': return <FileMarkdownOutlined style={{ color: '#1677ff' }} />;
      default: return <FileOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const totalProgress = calculateTotalProgress();
  const isComplete = totalProgress === 100;
  const totalFiles = Object.keys(progress || {}).length;
  const completedFiles = Object.values(progress || {}).filter(p => p === 100).length;
  const earliestStartTime = Object.values(startTimes).length > 0 
    ? Math.min(...Object.values(startTimes))
    : null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudUploadOutlined style={{ color: 'var(--ant-color-primary)' }} />
          文件上传进度
        </div>
      }
      footer={[
        <Button
          key="close"
          type={uploading ? "default" : "primary"}
          onClick={onClose}
          disabled={uploading}
        >
          {uploading ? '上传中...' : '关闭'}
        </Button>
      ]}
      width={800}
    >
      <ProgressWrapper>
        {/* 总进度 */}
        <div className="total-progress">
          <div className="file-info">
            <div className="file-name">
              <div className={`status-badge ${isComplete ? 'complete' : 'uploading'}`}>
                {uploading ? (
                  <Spin size="small" />
                ) : isComplete ? (
                  <CheckCircleOutlined />
                ) : null}
                {uploading ? '正在上传' : isComplete ? '上传完成' : '准备上传'}
              </div>
            </div>
            <div className="upload-info">
              <span>总文件：{completedFiles}/{totalFiles}</span>
              {uploading && earliestStartTime && (
                <span className="time-info">
                  <ClockCircleOutlined />
                  已用时：{calculateTimeElapsed(earliestStartTime)}
                </span>
              )}
            </div>
          </div>
          <div className={`progress-bar ${isComplete ? 'complete' : ''}`}>
            <div 
              className="progress-inner" 
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="progress-details">
            <span>总进度：{totalProgress}%</span>
            <span>已完成：{completedFiles} / {totalFiles}</span>
          </div>
        </div>

        {/* 单个文件进度 */}
        {progress && Object.entries(progress).map(([filename, percent]) => (
          <div key={filename} className="progress-card">
            <div className="file-info">
              <div className="file-name">
                {getFileIcon(filename)}
                <span>{filename}</span>
                <span className="file-type">{filename.split('.').pop()?.toUpperCase()}</span>
              </div>
              <div className="upload-info">
                {speeds && speeds[filename] && (
                  <span>{speeds[filename]} MB/s</span>
                )}
                {percent < 100 && uploading && (
                  <span className="time-info">
                    <ClockCircleOutlined />
                    剩余：{calculateRemainingTime(speeds[filename], percent, filename)}
                  </span>
                )}
              </div>
            </div>
            <div className={`progress-bar ${percent === 100 ? 'complete' : ''}`}>
              <div 
                className="progress-inner" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="progress-details">
              <span>{percent}%</span>
              {percent === 100 && (
                <span className="success-icon">
                  <CheckCircleOutlined /> 完成
                </span>
              )}
              <span className="time-info">
                开始：{formatDate(startTimes[filename])}
              </span>
            </div>
          </div>
        ))}
      </ProgressWrapper>
    </Modal>
  );
};

export default UploadProgressModal; 
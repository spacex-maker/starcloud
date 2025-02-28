import React from 'react';
import { Modal, Button, Spin, Progress } from 'antd';
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

  .header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ant-color-text-secondary);
  }

  .time-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--ant-color-text-secondary);
    font-size: 13px;
  }
`;

const ProgressContainer = styled.div`
  margin-bottom: 16px;
  
  .upload-failed {
    color: var(--ant-color-error);
  }
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 16px;
`;

const FileName = styled.span`
  font-size: 14px;
  color: var(--ant-color-text);
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SpeedInfo = styled.span`
  font-size: 12px;
  color: var(--ant-color-text-secondary);
  flex-shrink: 0;
  min-width: 85px;
  text-align: right;
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

const formatSpeed = (speed) => {
  // 如果 speed 是字符串且已经格式化过，直接返回
  if (typeof speed === 'string' && speed.endsWith('/s')) {
    return speed;
  }

  // 转换为数字
  const numSpeed = Number(speed);
  
  // 如果是 0 或无效值，返回 0 KB/s
  if (numSpeed === 0 || isNaN(numSpeed)) {
    return '0 KB/s';
  }
  
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let value = numSpeed;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
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
  const getProgressStatus = (percent) => {
    if (percent === -1) return 'exception'; // 失败状态
    if (percent === 100) return 'success';
    return 'active';
  };

  const getSpeedDisplay = (speed, percent) => {
    if (percent === -1) return '上传失败';
    if (percent === 100) return '已完成';
    return speed;
  };

  const calculateTotalProgress = () => {
    if (!progress || Object.keys(progress).length === 0) return 0;
    const validProgress = Object.values(progress).filter(p => p !== -1); // 排除失败的文件
    if (validProgress.length === 0) return 0;
    const total = validProgress.reduce((acc, curr) => acc + curr, 0);
    return Math.round(total / validProgress.length);
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
  const totalFiles = Object.keys(progress || {}).length;
  const completedFiles = Object.values(progress || {}).filter(p => p === 100).length;
  const earliestStartTime = Object.values(startTimes).length > 0 
    ? Math.min(...Object.values(startTimes))
    : null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title="文件上传进度"
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
      width={600}
    >
      <ProgressWrapper>
        {/* 总进度区域 */}
        <div className="total-progress">
          <div className="header-info">
            <div className="status-info">
              {uploading && <Spin size="small" />}
              <span>{`${completedFiles}/${totalFiles} 个文件`}</span>
              {uploading && earliestStartTime && (
                <span className="time-info">
                  <ClockCircleOutlined />
                  {calculateTimeElapsed(earliestStartTime)}
                </span>
              )}
            </div>
            <span>{totalProgress}%</span>
          </div>
          <Progress 
            percent={totalProgress}
            status={uploading ? 'active' : 'success'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>

        {/* 单个文件进度 */}
        {progress && Object.entries(progress).map(([filename, percent]) => (
          <ProgressContainer key={filename}>
            <FileInfo>
              <FileName>
                {getFileIcon(filename)}
                <span className={percent === -1 ? 'upload-failed' : ''}>
                  {filename}
                </span>
              </FileName>
              <SpeedInfo>{getSpeedDisplay(speeds[filename], percent)}</SpeedInfo>
            </FileInfo>
            <Progress 
              percent={percent === -1 ? 0 : percent}
              status={getProgressStatus(percent)}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              size="small"
            />
          </ProgressContainer>
        ))}
      </ProgressWrapper>
    </Modal>
  );
};

export default UploadProgressModal; 
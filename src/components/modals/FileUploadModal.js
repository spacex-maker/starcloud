import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Progress, Table, Space, Badge, Tooltip, Typography, message, Upload, Grid } from 'antd';
import { 
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  DeleteOutlined,
  LoadingOutlined,
  SwapOutlined,
  StopOutlined,
  PlusOutlined,
  LockOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { getEllipsisFileName } from '../../utils';
import DesktopFileUploadModal from './DesktopFileUploadModal';
import MobileFileUploadModal from './MobileFileUploadModal';

const { Text } = Typography;
const { useBreakpoint } = Grid;

// 样式组件
const StyledModal = styled(Modal)`
  .ant-modal-content {
    min-height: 520px;
    display: flex;
    flex-direction: column;
  }

  .ant-modal-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .ant-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    
    .footer-left,
    .footer-right {
      display: flex;
      gap: 8px;
    }
    
    @media (max-width: 576px) {
      flex-direction: row;
      flex-wrap: nowrap;
      
      .footer-left,
      .footer-right {
        display: flex;
        flex-direction: row;
        gap: 8px;
      }
      
      .ant-btn {
        padding: 4px 8px;
        font-size: 14px;
      }
    }
  }
`;


const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  
  .icon {
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  @media (max-width: 576px) {
    .name {
      min-width: 100px;
    }
  }
`;

const FileSize = styled.span`
  color: var(--ant-color-text-secondary);
  font-size: 12px;
`;

// 修改进度文本样式组件
const ProgressText = styled.span`
  color: var(--ant-color-text);
  font-size: 12px;
  white-space: nowrap;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  .status-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .speed {
    font-size: 12px;
    color: var(--ant-color-text-secondary);
  }
`;

// 添加总进度文本样式组件
const TotalProgressText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

const DuplicateTag = styled.span`
  color: #faad14;
  font-size: 12px;
  margin-left: 8px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

// 添加移动端文件信息样式组件
const MobileFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .file-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--ant-color-text-secondary);
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

const getFileIcon = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return <FileOutlined style={{ color: '#8c8c8c' }} className="icon" />;
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return <FilePdfOutlined style={{ color: '#ff4d4f' }} className="icon" />;
    case 'doc':
    case 'docx': return <FileWordOutlined style={{ color: '#1677ff' }} className="icon" />;
    case 'xls':
    case 'xlsx': return <FileExcelOutlined style={{ color: '#52c41a' }} className="icon" />;
    case 'ppt':
    case 'pptx': return <FilePptOutlined style={{ color: '#fa8c16' }} className="icon" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return <FileImageOutlined style={{ color: '#13c2c2' }} className="icon" />;
    case 'zip':
    case 'rar': return <FileZipOutlined style={{ color: '#722ed1' }} className="icon" />;
    case 'txt': return <FileTextOutlined style={{ color: '#8c8c8c' }} className="icon" />;
    case 'md': return <FileMarkdownOutlined style={{ color: '#1677ff' }} className="icon" />;
    default: return <FileOutlined style={{ color: '#8c8c8c' }} className="icon" />;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'success':
      return <CheckCircleFilled style={{ color: '#52c41a' }} />;
    case 'error':
      return <CloseCircleFilled style={{ color: '#ff4d4f' }} />;
    case 'uploading':
      return <LoadingOutlined style={{ color: '#1677ff' }} />;
    case 'creating':
      return <LoadingOutlined style={{ color: '#722ed1' }} />;
    case 'skipped':
      return <CloseCircleFilled style={{ color: '#8c8c8c' }} />;
    case 'pending':
      return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    default:
      return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
  }
};

const getStatusText = (status, isDuplicate) => {
  switch (status) {
    case 'pending': return isDuplicate ? '等待覆盖' : '等待上传';
    case 'uploading': return isDuplicate ? '覆盖中' : '上传中';
    case 'creating': return '创建文件记录';
    case 'success': return '上传成功';
    case 'error': return '上传失败';
    case 'skipped': return '已跳过';
    default: return '未知状态';
  }
};

const FileUploadModal = ({
  visible,
  uploadingFiles,
  isUploading,
  onStartUpload,
  onCancel,
  onDuplicateDecision,
  onRemoveFiles,
  onAddFiles,
  onEncryptFiles,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const props = {
    visible,
    uploadingFiles,
    isUploading,
    onStartUpload,
    onCancel,
    onDuplicateDecision,
    onRemoveFiles,
    onAddFiles,
    onEncryptFiles,
  };

  if (isMobile) {
    return <MobileFileUploadModal {...props} />;
  }

  return <DesktopFileUploadModal {...props} />;
};

export default FileUploadModal; 
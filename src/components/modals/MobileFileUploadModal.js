import React, { useMemo, useState } from 'react';
import { Modal, Button, Progress, List, Space, Typography, message, Upload, theme } from 'antd';
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
  PlusOutlined,
  LockOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { getEllipsisFileName } from '../../utils';
import {
  StyledModal,
  FileList,
  DuplicateTag,
  FileItem,
  SelectIndicator,
  FileHeader,
  FileProgress,
  ActionBar,
  UploadProgress,
} from './MobileFileUploadModal.styles';

const { Text } = Typography;

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

const formatSpeed = (bytesPerSecond) => {
  if (!bytesPerSecond) return '0 KB/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let value = bytesPerSecond;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

const MobileFileUploadModal = ({
  visible,
  uploadingFiles = new Map(),
  isUploading = false,
  onStartUpload,
  onCancel,
  onDuplicateDecision,
  onRemoveFiles = () => {
    console.warn('onRemoveFiles callback is not provided');
    message.warning('移除文件功能未实现');
  },
  onAddFiles = () => {
    console.warn('onAddFiles callback is not provided');
    message.warning('添加文件功能未实现');
  },
  onEncryptFiles = () => {
    console.warn('onEncryptFiles callback is not provided');
    message.warning('加密文件功能未实现');
  },
}) => {
  // 选中的文件列表
  const [selectedKeys, setSelectedKeys] = useState([]);

  // 统计不同类型的文件数量
  const fileStats = useMemo(() => {
    const total = uploadingFiles.size;
    const duplicates = [...uploadingFiles.values()].filter(f => f.isDuplicate).length;
    const succeeded = [...uploadingFiles.values()].filter(f => f.status === 'success').length;
    const failed = [...uploadingFiles.values()].filter(f => f.status === 'error').length;
    const uploading = [...uploadingFiles.values()].filter(f => f.status === 'uploading' || f.status === 'creating').length;
    const skipped = [...uploadingFiles.values()].filter(f => f.status === 'skipped').length;
    const progress = total > 0 
      ? Math.round((succeeded + failed) / total * 100) 
      : 0;
      
    return {
      total,
      duplicates,
      succeeded,
      failed,
      uploading,
      skipped,
      progress
    };
  }, [uploadingFiles]);

  // 计算上传进度和速度信息
  const uploadStats = useMemo(() => {
    if (fileStats.total === 0 || !isUploading) {
      return {
        progress: 0,
        speed: 0,
        remainingTime: 0,
        totalSize: 0,
        uploadedSize: 0
      };
    }
    
    const validFiles = Array.from(uploadingFiles.values()).filter(
      file => file.status !== 'skipped' && file.status !== 'error'
    );
    
    if (validFiles.length === 0) return { progress: 0, speed: 0, remainingTime: 0, totalSize: 0, uploadedSize: 0 };
    
    let totalSize = 0;
    let uploadedSize = 0;
    let currentSpeed = 0;
    
    validFiles.forEach(file => {
      totalSize += file.fileSize;
      
      if (file.status === 'success') {
        uploadedSize += file.fileSize;
      } else if (file.status === 'uploading' || file.status === 'creating') {
        uploadedSize += (file.fileSize * (file.progress || 0)) / 100;
        if (file.speed) {
          currentSpeed += file.speed;
        }
      }
    });
    
    const progress = Math.round((uploadedSize / totalSize) * 100);
    
    return {
      progress,
      speed: currentSpeed,
      totalSize,
      uploadedSize
    };
  }, [uploadingFiles, isUploading, fileStats.total]);

  // 处理批量移除
  const handleBatchRemove = () => {
    if (selectedKeys.length === 0) {
      message.warning('请选择要移除的文件');
      return;
    }
    if (typeof onRemoveFiles === 'function') {
      onRemoveFiles(selectedKeys);
      setSelectedKeys([]); // 清空选择
    }
  };

  // 处理加密文件
  const handleEncryptFiles = () => {
    if (selectedKeys.length === 0) {
      message.warning('请选择要加密的文件');
      return;
    }

    const selectedFiles = Array.from(uploadingFiles.values())
      .filter(file => selectedKeys.includes(file.file.name))
      .map(file => file.file);

    if (typeof onEncryptFiles === 'function') {
      onEncryptFiles(selectedFiles);
    }
  };

  // 计算是否可以开始上传
  const canStartUpload = useMemo(() => {
    return !isUploading && Array.from(uploadingFiles.values()).some(file => 
      file.status === 'pending'
    );
  }, [isUploading, uploadingFiles]);

  // 渲染文件列表项
  const renderItem = (file) => {
    const isPending = file.status === 'pending';
    const isSelected = selectedKeys.includes(file.file.name);
    
    return (
      <FileItem
        onClick={() => {
          if (isPending && !isUploading) {
            setSelectedKeys(prevKeys => {
              if (prevKeys.includes(file.file.name)) {
                return prevKeys.filter(key => key !== file.file.name);
              }
              return [...prevKeys, file.file.name];
            });
          }
        }}
        selected={isSelected}
      >
        <SelectIndicator className="select-indicator">
          <CheckOutlined />
        </SelectIndicator>
        
        <FileHeader>
          {getFileIcon(file.file.name)}
          <div className="info">
            <Text className="name" ellipsis>{getEllipsisFileName(file.file.name)}</Text>
            <div className="meta">
              <span className="size">{formatBytes(file.fileSize)}</span>
              {file.isDuplicate && (
                <DuplicateTag>
                  <WarningFilled />
                  <span>重复文件</span>
                </DuplicateTag>
              )}
            </div>
          </div>
        </FileHeader>

        {(file.status !== 'pending' || isUploading) && (
          <FileProgress>
            <Space className="status">
              {getStatusIcon(file.status)}
              <Text type={
                file.status === 'success' ? 'success' :
                file.status === 'error' ? 'danger' :
                'secondary'
              }>
                {getStatusText(file.status, file.isDuplicate)}
              </Text>
            </Space>
            
            {(file.status === 'uploading' || file.status === 'creating') && (
              <>
                <Progress 
                  percent={file.progress || 0}
                  size="small"
                  status={file.status === 'error' ? 'exception' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <div className="progress-text">
                  <span>{formatBytes(file.fileSize * (file.progress || 0) / 100)}</span>
                  <span>{formatBytes(file.fileSize)}</span>
                </div>
              </>
            )}
          </FileProgress>
        )}
      </FileItem>
    );
  };

  return (
    <StyledModal
      open={visible}
      title={`文件上传 ${isUploading ? `(${fileStats.succeeded}/${fileStats.total})` : ''}`}
      width="100vw"
      style={{ 
        top: 0,
        padding: 0,
        margin: 0,
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
      maskClosable={false}
      closable={!isUploading}
      onCancel={onCancel}
      getContainer={() => document.body}
      keyboard={false}
      footer={[
        <div key="right" className="footer-right">
          <Button 
            type="primary"
            onClick={onStartUpload}
            disabled={!canStartUpload}
            block
          >
            开始上传
          </Button>
        </div>
      ]}
    >
      {isUploading && (
        <UploadProgress>
          <div className="header">
            <Text className="title">总进度 {uploadStats.progress}%</Text>
            <Text className="speed">{formatSpeed(uploadStats.speed)}</Text>
          </div>
          <Progress 
            percent={uploadStats.progress} 
            status={uploadStats.progress === 100 ? 'success' : 'active'} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text className="total">
            已上传：{formatBytes(uploadStats.uploadedSize)} / {formatBytes(uploadStats.totalSize)}
          </Text>
        </UploadProgress>
      )}
      
      {!isUploading && (
        <ActionBar>
          <Upload
            showUploadList={false}
            multiple
            beforeUpload={(file, fileList) => {
              onAddFiles(fileList);
              return false;
            }}
          >
            <Button 
              icon={<PlusOutlined />}
              block
            >
              添加文件
            </Button>
          </Upload>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchRemove}
            disabled={selectedKeys.length === 0}
            block
          >
            移除
          </Button>
          <Button
            icon={<LockOutlined />}
            onClick={handleEncryptFiles}
            disabled={selectedKeys.length === 0}
            block
          >
            加密
          </Button>
        </ActionBar>
      )}
      
      <FileList
        dataSource={Array.from(uploadingFiles.values())}
        renderItem={renderItem}
      />
    </StyledModal>
  );
};

export default MobileFileUploadModal; 
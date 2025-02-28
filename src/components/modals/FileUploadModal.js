import React, { useMemo, useState } from 'react';
import { Modal, Button, Progress, Table, Space, Badge, Tooltip, Typography, message, Upload } from 'antd';
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
} from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

// 样式组件
const StyledModal = styled(Modal)`
  .ant-modal-footer {
    display: flex;
    justify-content: space-between;
  }
`;

const StatusBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 8px;
    height: 8px;
  }
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .icon {
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

const ConflictResolution = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  
  .action-icon {
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.3s;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    &.overwrite {
      color: #1677ff;
      
      &:hover {
        color: #4096ff;
      }
    }
    
    &.skip {
      color: #999;
      
      &:hover {
        color: #666;
      }
    }
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
}) => {
  // 新增：选中的文件列表
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
    const remainingSize = totalSize - uploadedSize;
    const remainingTime = currentSpeed > 0 ? remainingSize / currentSpeed : 0;
    
    return {
      progress,
      speed: currentSpeed,
      remainingTime,
      totalSize,
      uploadedSize
    };
  }, [uploadingFiles, isUploading, fileStats.total]);

  // 格式化时间
  const formatTime = (seconds) => {
    if (!seconds || seconds === Infinity) return '计算中...';
    if (seconds < 60) return `${Math.ceil(seconds)}秒`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.ceil((seconds % 3600) / 60)}分钟`;
  };

  // 格式化速度
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

  // 处理批量移除
  const handleBatchRemove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要移除的文件');
      return;
    }
    if (typeof onRemoveFiles === 'function') {
      onRemoveFiles(selectedRowKeys);
      setSelectedRowKeys([]); // 清空选择
    } else {
      console.warn('onRemoveFiles callback is not provided');
      message.warning('移除文件功能未实现');
    }
  };

  // 处理单个文件移除
  const handleSingleRemove = (fileName) => {
    if (typeof onRemoveFiles === 'function') {
      onRemoveFiles([fileName]);
    } else {
      console.warn('onRemoveFiles callback is not provided');
      message.warning('移除文件功能未实现');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <FileName>
          {getFileIcon(record.file?.name || text)}
          <Tooltip title={record.file?.name || text}>
            <Text className="name" ellipsis>{record.file?.name || text}</Text>
          </Tooltip>
          {record.isDuplicate && (
            <DuplicateTag>
              <WarningFilled />
              重复文件
            </DuplicateTag>
          )}
        </FileName>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (_, record) => (
        <FileSize>{formatBytes(record.fileSize)}</FileSize>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 240,
      render: (_, record) => {
        if (record.status === 'uploading' || record.status === 'creating') {
          return (
            <Space direction="vertical" size={1} style={{ width: '100%' }}>
              <StatusHeader>
                <div className="status-left">
                  {getStatusIcon(record.status)}
                  <Text type="secondary">{getStatusText(record.status, record.isDuplicate)}</Text>
                </div>
                {record.speed > 0 && (
                  <span className="speed">{formatSpeed(record.speed)}</span>
                )}
              </StatusHeader>
              <Progress 
                percent={record.progress || 0} 
                size="small" 
                status={record.status === 'error' ? 'exception' : 'active'}
                style={{ margin: 0, lineHeight: 1 }}
              />
              <ProgressText>
                <span className="uploaded">{formatBytes(record.fileSize * (record.progress || 0) / 100)}</span>
                <span className="total"> / {formatBytes(record.fileSize)}</span>
              </ProgressText>
            </Space>
          );
        }
        
        return (
          <Space>
            {getStatusIcon(record.status)}
            <Text type={
              record.status === 'success' ? 'success' :
              record.status === 'error' ? 'danger' :
              'secondary'
            }>
              {getStatusText(record.status, record.isDuplicate)}
            </Text>
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => {
        if (record.status === 'pending') {
          return (
            <Tooltip title="移除">
              <DeleteOutlined
                style={{ color: '#ff4d4f', cursor: 'pointer' }}
                onClick={() => handleSingleRemove(record.file.name)}
              />
            </Tooltip>
          );
        }
        if (record.status === 'error') {
          return (
            <Tooltip title={record.errorMessage || '上传失败'}>
              <Text type="danger">失败</Text>
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  // 表格数据
  const tableData = useMemo(() => {
    return Array.from(uploadingFiles.values()).map(file => ({
      ...file,
      key: file.file.name, // 添加key属性用于选择功能
    }));
  }, [uploadingFiles]);

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'pending', // 只允许选择待上传的文件
    }),
  };

  // 计算是否可以开始上传
  const canStartUpload = useMemo(() => {
    return !isUploading && tableData.some(file => 
      file.status === 'pending'
    );
  }, [isUploading, tableData]);

  return (
    <StyledModal
      open={visible}
      title={`文件上传 ${isUploading ? `(${fileStats.succeeded}/${fileStats.total})` : ''}`}
      width={800}
      maskClosable={false}
      closable={!isUploading}
      onCancel={onCancel}
      footer={[
        <Space key="left">
          <Button
            danger
            onClick={handleBatchRemove}
            disabled={isUploading || selectedRowKeys.length === 0}
          >
            移除选中文件
          </Button>
        </Space>,
        <Space key="right">
          <Button 
            onClick={onCancel}
            disabled={isUploading}
          >
            {isUploading ? '上传中...' : '关闭'}
          </Button>
          <Button 
            type="primary"
            onClick={onStartUpload}
            disabled={!canStartUpload}
          >
            开始上传
          </Button>
        </Space>
      ]}
    >
      {isUploading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Space>
              <Text>总进度</Text>
              <Text type="primary">{uploadStats.progress}%</Text>
            </Space>
            <Space>
              <Text type="secondary">速度：{formatSpeed(uploadStats.speed)}</Text>
              <Text type="secondary">剩余时间：{formatTime(uploadStats.remainingTime)}</Text>
            </Space>
          </div>
          <Progress 
            percent={uploadStats.progress} 
            status={uploadStats.progress === 100 ? 'success' : 'active'} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <TotalProgressText>
            已上传：<span className="uploaded">{formatBytes(uploadStats.uploadedSize)}</span>
            <span className="total"> / {formatBytes(uploadStats.totalSize)}</span>
          </TotalProgressText>
        </div>
      )}
      
      <div style={{ marginBottom: 16 }}>
        <Upload
          showUploadList={false}
          multiple
          beforeUpload={(file, fileList) => {
            onAddFiles(fileList);
            return false;
          }}
          disabled={isUploading}
        >
          <Button 
            icon={<PlusOutlined />}
            disabled={isUploading}
          >
            添加文件
          </Button>
        </Upload>
      </div>
      
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="small"
        scroll={{ y: 350 }}
        locale={{
          emptyText: '没有选择文件'
        }}
      />
    </StyledModal>
  );
};

export default FileUploadModal; 
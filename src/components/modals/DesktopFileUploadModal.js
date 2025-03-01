import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Progress, Table, Space, Badge, Tooltip, Typography, message, Upload } from 'antd';
import { 
  WarningFilled,
  DeleteOutlined,
  PlusOutlined,
  LockOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { getEllipsisFileName, formatFileSize as formatBytes, formatSpeed, formatTime } from '../../utils/format';
import { getFileIcon } from '../../utils/fileIcon';
import { getStatusIcon, getStatusText } from '../../utils/uploadStatus';

const { Text } = Typography;

// 样式组件
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
`;

const FileSize = styled.span`
  color: var(--ant-color-text-secondary);
  font-size: 12px;
`;

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

const DesktopFileUploadModal = ({
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
  onEncryptComplete,
  existingFiles = [],
}) => {
  // 选中的文件列表
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 监听文件列表变化，设置全选状态
  useEffect(() => {
    if (uploadingFiles.size > 0) {
      const pendingFiles = Array.from(uploadingFiles.values())
        .filter(file => file.status === 'pending')
        .map(file => file.file.name);
      setSelectedRowKeys(pendingFiles);
    }
  }, [uploadingFiles]);

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

  // 处理批量移除
  const handleBatchRemove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要移除的文件');
      return;
    }
    if (typeof onRemoveFiles === 'function') {
      onRemoveFiles(selectedRowKeys);
      setSelectedRowKeys([]); // 清空选择
    }
  };

  // 处理单个文件移除
  const handleSingleRemove = (fileName) => {
    if (typeof onRemoveFiles === 'function') {
      onRemoveFiles([fileName]);
    }
  };

  // 处理加密文件
  const handleEncryptFiles = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要加密的文件');
      return;
    }

    const selectedFiles = Array.from(uploadingFiles.values())
      .filter(file => selectedRowKeys.includes(file.file.name))
      .map(file => file.file);

    if (typeof onEncryptFiles === 'function') {
      onEncryptFiles(selectedFiles, (encryptedFiles, originalFiles) => {
        if (typeof onEncryptComplete === 'function') {
          onEncryptComplete(encryptedFiles, originalFiles);
        }
        setSelectedRowKeys([]); // 清空选择
      });
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      width: '40%',
      ellipsis: true,
      render: (text, record) => (
        <FileName>
          {getFileIcon(record.file?.name || text)}
          <Tooltip title={record.file?.name || text}>
            <Text className="name" ellipsis>{getEllipsisFileName(record.file?.name || text)}</Text>
          </Tooltip>
          {record.isDuplicate && (
            <DuplicateTag>
              <WarningFilled />
              重复文件
            </DuplicateTag>
          )}
          {record.isEncrypted && (
            <DuplicateTag style={{ color: '#52c41a' }}>
              <LockOutlined />
              已加密
            </DuplicateTag>
          )}
        </FileName>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <FileSize>{formatBytes(record.fileSize)}</FileSize>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      align: 'center',
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
      align: 'center',
      fixed: 'right',
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
    <Modal
      open={visible}
      title={`文件上传 ${isUploading ? `(${fileStats.succeeded}/${fileStats.total})` : ''}`}
      width={800}
      maskClosable={false}
      closable={!isUploading}
      onCancel={onCancel}
      footer={[
        <div key="right" className="footer-right" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button 
            type="primary"
            onClick={onStartUpload}
            disabled={!canStartUpload}
          >
            开始上传
          </Button>
        </div>
      ]}
      bodyStyle={{ 
        minHeight: '520px',
        display: 'flex',
        flexDirection: 'column'
      }}
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
        <Space>
          <Upload
            showUploadList={false}
            multiple
            beforeUpload={(file, fileList) => {
              // 检查文件是否与现有文件重复
              const duplicateFiles = fileList.filter(newFile => 
                existingFiles.some(existingFile => existingFile.name === newFile.name) ||
                Array.from(uploadingFiles.keys()).includes(newFile.name)
              );
              
              // 如果有重复文件，标记它们
              if (duplicateFiles.length > 0) {
                const filesWithDuplicateFlag = fileList.map(file => ({
                  file,
                  isDuplicate: existingFiles.some(existingFile => existingFile.name === file.name) ||
                              Array.from(uploadingFiles.keys()).includes(file.name)
                }));
                onAddFiles(filesWithDuplicateFlag);
              } else {
                onAddFiles(fileList.map(file => ({ file, isDuplicate: false })));
              }
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
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchRemove}
            disabled={isUploading || selectedRowKeys.length === 0}
          >
            移除
          </Button>
          <Button
            icon={<LockOutlined />}
            onClick={handleEncryptFiles}
            disabled={isUploading || selectedRowKeys.length === 0}
            type="button"
          >
            加密
          </Button>
        </Space>
      </div>
      
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="small"
        scroll={{ y: 350, x: 'max-content' }}
        locale={{
          emptyText: '没有选择文件'
        }}
        style={{ 
          width: '100%',
          overflowX: 'auto'
        }}
      />
    </Modal>
  );
};

export default DesktopFileUploadModal; 